import {
  Sparkles, Droplets, Truck, Shield, ShieldCheck, Gem, Hand, Heart, Hammer,
  Scissors, Flower2, Feather, Leaf, Award, Wand2, Recycle, Package, Star,
  Lock, CreditCard, BadgeCheck, Gift, Sun, type LucideIcon,
} from 'lucide-react';

// Icônes disponibles pour les badges de confiance (site + admin).
// La valeur stockée est soit une de ces clés, soit un emoji libre.
export const TRUST_ICONS: Record<string, LucideIcon> = {
  Sparkles, Droplets, Truck, Shield, ShieldCheck, Gem, Hand, Hammer, Scissors,
  Heart, Flower2, Feather, Leaf, Award, Wand2, Recycle, Package, Star, Lock,
  CreditCard, BadgeCheck, Gift, Sun,
};

// Liste présentée dans l'admin (l'emoji sert juste à visualiser ; l'icône
// réellement affichée reste un trait fin, dans la couleur de la marque).
export const TRUST_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'Gem', label: '💎 Gemme / bijou' },
  { value: 'Hand', label: '✋ Main (fait main)' },
  { value: 'Hammer', label: '🔨 Marteau / artisanat' },
  { value: 'Scissors', label: '✂️ Ciseaux' },
  { value: 'Sparkles', label: '✨ Étincelles' },
  { value: 'Heart', label: '❤️ Cœur' },
  { value: 'Flower2', label: '🌸 Fleur' },
  { value: 'Feather', label: '🪶 Plume' },
  { value: 'Leaf', label: '🍃 Feuille / naturel' },
  { value: 'Award', label: '🏅 Qualité' },
  { value: 'Wand2', label: '🪄 Touche magique' },
  { value: 'Gift', label: '🎁 Cadeau' },
  { value: 'Sun', label: '☀️ Soleil' },
  { value: 'Recycle', label: '♻️ Durable' },
  { value: 'Droplets', label: '💧 Waterproof' },
  { value: 'Truck', label: '🚚 Livraison' },
  { value: 'Package', label: '📦 Colis' },
  { value: 'ShieldCheck', label: '🛡️ Sécurité' },
  { value: 'Lock', label: '🔒 Sécurisé' },
  { value: 'CreditCard', label: '💳 Paiement' },
  { value: 'Shield', label: '🛡️ Bouclier' },
  { value: 'Star', label: '⭐ Étoile' },
];

/** Vrai si la valeur correspond à une icône connue (sinon on l'affiche comme emoji). */
export function isKnownTrustIcon(value: string | undefined): boolean {
  return !!value && value in TRUST_ICONS;
}
