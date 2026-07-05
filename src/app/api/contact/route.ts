import { NextResponse } from 'next/server';
import { sendContactMessage } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase/admin';

// Destinataire des messages du formulaire de contact
const CONTACT_TO = 'soranibijoux@gmail.com';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Merci de remplir le nom, l’email et le message.' }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message trop long (5000 caractères max).' }, { status: 400 });
    }

    const clean = {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
    };

    // 1. Sauvegarde en base (source de vérité — rien n'est perdu même si l'email échoue)
    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from('contact_messages').insert(clean);
    if (dbError) {
      console.error('[contact] Échec sauvegarde DB :', dbError.message, clean);
      // Si la table n'existe pas encore, on tente quand même l'email en secours
    }

    // 2. Notification email (best-effort — n'empêche pas le succès si le message est sauvegardé)
    const mail = await sendContactMessage({ to: CONTACT_TO, ...clean });
    if (!mail.ok) {
      console.warn('[contact] Email non envoyé :', mail.error);
    }

    // Échec seulement si NI la DB NI l'email n'ont fonctionné
    if (dbError && !mail.ok) {
      return NextResponse.json(
        { error: "L’envoi a échoué. Écris-nous directement à soranibijoux@gmail.com." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ error: `Erreur serveur : ${message}` }, { status: 500 });
  }
}
