import 'server-only';
import { createHmac } from 'crypto';

// Jeton de désabonnement signé (sans stockage) : HMAC de l'email avec une clé serveur.
function secret(): string {
  return (
    process.env.NEWSLETTER_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'sorani-newsletter-fallback'
  );
}

export function makeUnsubToken(email: string): string {
  return createHmac('sha256', secret()).update(email.trim().toLowerCase()).digest('hex').slice(0, 32);
}

export function verifyUnsubToken(email: string, token: string): boolean {
  return makeUnsubToken(email) === token;
}

export function unsubscribeUrl(email: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.soranibijoux.com';
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${makeUnsubToken(email)}`;
}
