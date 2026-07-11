import 'server-only';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SORANI <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.SORANI_ADMIN_EMAIL || '';

let cached: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY non configuré — email ignoré :', subject);
    return { ok: false, error: 'RESEND_API_KEY missing' };
  }
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
  }
}

/* ============================================================ */
/*  Templates                                                   */
/* ============================================================ */
const EMAIL_WRAP = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#FAF6EF;font-family:Georgia,'Cormorant Garamond',serif;color:#1A1A1A;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;background:#FFFFFF;">
    <div style="text-align:center;border-bottom:1px solid rgba(0,0,0,0.1);padding-bottom:24px;margin-bottom:32px;">
      <p style="font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#3845AD;margin:0;">SORANI</p>
    </div>
    ${content}
    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#666;text-align:center;margin-top:48px;padding-top:24px;border-top:1px solid rgba(0,0,0,0.1);">
      Bijoux faits avec amour
    </p>
  </div>
</body>
</html>
`;

/* ============================================================ */
/*  Newsletter                                                  */
/* ============================================================ */
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function newsletterHtml(subject: string, message: string, unsubscribeUrl: string): string {
  const paragraphs = esc(message)
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="font-size:15px;line-height:1.75;color:#333;margin:0 0 16px;">${p.replace(/\n/g, '<br/>')}</p>`
    )
    .join('');
  return EMAIL_WRAP(`
    <h1 style="font-size:24px;text-align:center;color:#3845AD;margin:0 0 28px;">${esc(subject)}</h1>
    ${paragraphs}
    <p style="font-size:11px;color:#999;text-align:center;margin:28px 0 0;">
      <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Se désabonner de la newsletter</a>
    </p>
  `);
}

// Envoi en masse via l'API "batch" de Resend (max 100 par appel).
export async function sendNewsletterBatch(
  recipients: { email: string; unsubscribeUrl: string }[],
  subject: string,
  message: string
): Promise<{ sent: number; error?: string }> {
  const resend = client();
  if (!resend) return { sent: 0, error: 'RESEND_API_KEY missing' };
  let sent = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const payload = chunk.map((r) => ({
      from: FROM_EMAIL,
      to: r.email,
      subject,
      html: newsletterHtml(subject, message, r.unsubscribeUrl),
    }));
    try {
      const res = await resend.batch.send(payload);
      if (res.error) return { sent, error: res.error.message };
      sent += chunk.length;
    } catch (err) {
      return { sent, error: err instanceof Error ? err.message : 'Erreur inconnue' };
    }
  }
  return { sent };
}

/* ============================================================ */
/*  Confirmation de commande (client)                           */
/* ============================================================ */
type OrderAddress = {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
} | null;

export async function sendOrderConfirmation({
  to,
  customerName,
  items,
  subtotal,
  shippingCost,
  total,
  shippingAddress,
}: {
  to: string;
  customerName?: string | null;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress?: OrderAddress;
}) {
  const fmt = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#333;">
          ${esc(it.name)} <span style="color:#999;">× ${it.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#333;text-align:right;white-space:nowrap;">
          ${fmt(it.price * it.quantity)}
        </td>
      </tr>`
    )
    .join('');

  const shippingLabel = shippingCost > 0 ? fmt(shippingCost) : 'Offerte';

  const addrParts = shippingAddress
    ? [
        shippingAddress.line1,
        shippingAddress.line2,
        [shippingAddress.postal_code, shippingAddress.city].filter(Boolean).join(' '),
        shippingAddress.country,
      ]
        .filter(Boolean)
        .map((s) => esc(String(s)))
        .join('<br/>')
    : '';

  const html = EMAIL_WRAP(`
    <h1 style="font-size:24px;text-align:center;color:#3845AD;margin:0 0 12px;">
      Merci pour ta commande${customerName ? ', ' + esc(customerName) : ''}&nbsp;!
    </h1>
    <p style="text-align:center;font-size:14px;color:#666;line-height:1.6;margin:0 0 32px;">
      Ta commande est bien confirmée. Voici le récapitulatif&nbsp;:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:8px;">
      ${rows}
      <tr>
        <td style="padding:12px 0 4px;font-size:13px;color:#666;">Sous-total</td>
        <td style="padding:12px 0 4px;font-size:13px;color:#666;text-align:right;">${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:#666;">Livraison</td>
        <td style="padding:2px 0;font-size:13px;color:#666;text-align:right;">${shippingLabel}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:16px;color:#3845AD;font-weight:bold;">Total</td>
        <td style="padding:12px 0 0;font-size:16px;color:#3845AD;font-weight:bold;text-align:right;">${fmt(total)}</td>
      </tr>
    </table>

    ${
      addrParts
        ? `<div style="background:#FAF6EF;padding:20px 24px;margin-top:28px;">
             <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#999;margin:0 0 8px;">Livraison</p>
             <p style="font-size:14px;color:#333;line-height:1.6;margin:0;">${addrParts}</p>
           </div>`
        : ''
    }

    <p style="font-size:14px;color:#666;line-height:1.7;text-align:center;margin:32px 0 0;">
      Chaque bijou étant préparé avec soin, nous préparons le tien avec amour.
      Tu recevras un email dès qu'il sera expédié&nbsp;💙
    </p>
  `);

  return sendEmail({
    to,
    subject: 'Ta commande SORANI est confirmée ✨',
    html,
  });
}

export async function notifyAdminNewReview({
  productName,
  rating,
  title,
  comment,
  customerName,
  customerEmail,
  productSlug,
}: {
  productName: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  customerName?: string | null;
  customerEmail: string;
  productSlug: string;
}) {
  if (!ADMIN_EMAIL) return { ok: false, error: 'SORANI_ADMIN_EMAIL missing' };

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sorani-shop.vercel.app'}/admin/reviews`;

  const html = EMAIL_WRAP(`
    <h1 style="font-size:24px;text-align:center;color:#3845AD;margin:0 0 16px;">Nouvel avis client</h1>
    <p style="text-align:center;font-size:14px;color:#666;margin:0 0 32px;">Sur "${productName}"</p>
    <div style="background:#FAF6EF;padding:24px;margin-bottom:24px;">
      <p style="font-size:18px;color:#3845AD;margin:0 0 12px;">${stars} (${rating}/5)</p>
      ${title ? `<p style="font-weight:bold;margin:0 0 8px;font-size:16px;">${title}</p>` : ''}
      ${comment ? `<p style="margin:0;font-size:14px;line-height:1.6;color:#333;">${comment.replace(/</g, '&lt;')}</p>` : '<p style="margin:0;color:#999;font-style:italic;">(pas de commentaire)</p>'}
    </div>
    <p style="font-size:12px;color:#666;margin:0 0 24px;">
      Par <strong>${customerName || 'Anonyme'}</strong> · ${customerEmail}
    </p>
    <div style="text-align:center;">
      <a href="${previewUrl}" style="display:inline-block;background:#3845AD;color:#fff;text-decoration:none;padding:14px 32px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Modérer l'avis</a>
    </div>
  `);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[SORANI] Nouvel avis ${stars} sur ${productName}`,
    html,
    replyTo: customerEmail,
  });
}

export async function sendContactMessage({
  to,
  name,
  email,
  subject,
  message,
}: {
  to: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = EMAIL_WRAP(`
    <h1 style="font-size:24px;text-align:center;color:#3845AD;margin:0 0 8px;">Nouveau message de contact</h1>
    ${subject ? `<p style="text-align:center;font-size:14px;color:#666;margin:0 0 28px;">${esc(subject)}</p>` : '<div style="height:20px;"></div>'}
    <div style="background:#FAF6EF;padding:24px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;line-height:1.7;color:#333;white-space:pre-wrap;">${esc(message)}</p>
    </div>
    <p style="font-size:13px;color:#666;margin:0;line-height:1.8;">
      De : <strong>${esc(name)}</strong><br/>
      Email : <a href="mailto:${esc(email)}" style="color:#3845AD;">${esc(email)}</a>
    </p>
  `);

  return sendEmail({
    to,
    subject: `[Contact SORANI] ${subject ? esc(subject) : 'Nouveau message'} — ${esc(name)}`,
    html,
    replyTo: email,
  });
}

export async function sendReviewInvite({
  to,
  customerName,
  productName,
  productSlug,
}: {
  to: string;
  customerName?: string | null;
  productName: string;
  productSlug: string;
}) {
  const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sorani-shop.vercel.app'}/shop/product/${productSlug}#avis`;

  const html = EMAIL_WRAP(`
    <h1 style="font-size:24px;text-align:center;color:#3845AD;margin:0 0 12px;font-family:Georgia,serif;">
      Merci pour ta commande${customerName ? ', ' + customerName : ''}
    </h1>
    <p style="text-align:center;font-size:14px;color:#666;line-height:1.6;margin:0 0 32px;">
      Nous espérons que tu apprécies ton bijou.
    </p>
    <div style="background:#FAF6EF;padding:32px 24px;margin-bottom:24px;text-align:center;">
      <p style="font-size:14px;color:#333;line-height:1.7;margin:0 0 16px;">
        Ton avis sur <strong>${productName}</strong> aide d'autres clientes à découvrir SORANI.
      </p>
      <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">
        Cela ne te prendra que quelques secondes ✨
      </p>
      <a href="${productUrl}" style="display:inline-block;background:#3845AD;color:#fff;text-decoration:none;padding:14px 32px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Laisser un avis</a>
    </div>
    <p style="font-size:12px;color:#666;text-align:center;margin:0;line-height:1.6;">
      Merci de faire partie de la communauté SORANI 💙
    </p>
  `);

  return sendEmail({
    to,
    subject: `${customerName ? customerName + ', donne' : 'Donne'}-nous ton avis sur ${productName}`,
    html,
  });
}
