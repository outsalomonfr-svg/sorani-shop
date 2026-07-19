import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Test temporaire de configuration email — destinataire fixe (pas d'abus possible).
export async function GET() {
  const to = 'sofia.saighi@hotmail.fr';
  const result = await sendEmail({
    to,
    subject: 'Test SORANI ✨',
    html: '<p>Ceci est un email de test SORANI. Si tu le reçois, tout fonctionne 🎉</p>',
  });
  return NextResponse.json({
    from: process.env.RESEND_FROM_EMAIL || '(non défini)',
    hasKey: !!process.env.RESEND_API_KEY,
    keyPrefix: (process.env.RESEND_API_KEY || '').slice(0, 6),
    keyLen: (process.env.RESEND_API_KEY || '').length,
    result,
  });
}
