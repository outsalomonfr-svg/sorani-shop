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
