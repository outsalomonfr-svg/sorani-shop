import { NextResponse } from 'next/server';
import { sendContactMessage } from '@/lib/email';

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

    const res = await sendContactMessage({
      to: CONTACT_TO,
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
    });

    if (!res.ok) {
      // Ex. RESEND_API_KEY manquant : on log côté serveur pour ne pas perdre le message
      console.error('[contact] Échec envoi :', res.error, { name, email, subject });
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
