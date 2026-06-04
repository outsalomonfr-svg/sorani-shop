export type FontChoice =
  | 'Inter'
  | 'Playfair Display'
  | 'DM Serif Display'
  | 'Cormorant Garamond'
  | 'DM Sans'
  | 'Nunito Sans';

export const HEADING_FONTS: FontChoice[] = [
  'Inter',
  'Playfair Display',
  'DM Serif Display',
  'Cormorant Garamond',
];

export const BODY_FONTS: FontChoice[] = ['Inter', 'DM Sans', 'Nunito Sans'];

export type SiteSettings = {
  brand: {
    name: string;
    logoUrl: string;
    tagline: string;
  };
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: FontChoice;
    bodyFont: FontChoice;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaLink: string;
  };
  nav: {
    links: Array<{ label: string; href: string }>;
  };
  footer: {
    about: string;
    contactEmail: string;
    social: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
    };
  };
  featuredTitle: string;
  story: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    imageUrl: string;
    ctaLabel: string;
    ctaLink: string;
  };
  reasons: {
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string; imageUrl: string }>;
  };
  categoriesTitle: string;
  trust: {
    items: Array<{ title: string; description: string; icon: 'Sparkles' | 'Droplets' | 'Truck' | 'Shield' }>;
  };
  newsletter: {
    title: string;
    subtitle: string;
    ctaLabel: string;
  };
  homeLayout: {
    sections: HomeSection[];
  };
};

export type HomeSectionType =
  | 'hero'
  | 'featured'
  | 'story'
  | 'reasons'
  | 'categories'
  | 'trust'
  | 'newsletter'
  | 'imageText'
  | 'banner'
  | 'gallery';

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  visible: boolean;
  // Pour les blocs custom (imageText, banner, gallery) — données spécifiques
  custom?: {
    title?: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaLink?: string;
    layout?: 'left' | 'right';
    images?: string[];
  };
};

export const SECTION_TYPE_LABELS: Record<HomeSectionType, string> = {
  hero: 'Hero',
  featured: 'Coups de cœur',
  story: "L'histoire",
  reasons: '4 raisons',
  categories: 'Catégories',
  trust: 'Badges confiance',
  newsletter: 'Newsletter',
  imageText: 'Image + texte',
  banner: 'Bannière',
  gallery: 'Galerie',
};

// Sections "core" qui ne peuvent pas être supprimées (seulement masquées/déplacées)
export const CORE_SECTION_TYPES: HomeSectionType[] = [
  'hero', 'featured', 'story', 'reasons', 'categories', 'trust', 'newsletter',
];

// Sections "additionnelles" qu'on peut ajouter en plusieurs exemplaires
export const ADDABLE_SECTION_TYPES: HomeSectionType[] = ['imageText', 'banner', 'gallery'];

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: 'SORANI',
    logoUrl: '/images/logo.png',
    tagline: 'Bijoux faits avec amour',
  },
  colors: {
    primary: '#1B4965',
    primaryDark: '#153a52',
    accent: '#BEE9E8',
    background: '#ffffff',
    text: '#171717',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  announcement: {
    enabled: false,
    text: 'Livraison gratuite à partir de 50 €',
    link: '/shop',
  },
  hero: {
    title: 'Bijoux faits avec amour',
    subtitle:
      'Des créations uniques, pensées pour sublimer votre beauté naturelle',
    imageUrl: '',
    ctaLabel: 'Découvrir la collection',
    ctaLink: '/shop',
  },
  nav: {
    links: [
      { label: 'Boutique', href: '/shop' },
      { label: 'Nos histoires', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  footer: {
    about:
      'Bijoux faits avec amour. Chaque pièce est unique et créée avec passion pour sublimer votre beauté naturelle.',
    contactEmail: 'contact@sorani.fr',
    social: {
      instagram: 'https://instagram.com/sorani.bijoux',
      facebook: '',
      tiktok: '',
    },
  },
  featuredTitle: 'Nos coups de cœur',
  story: {
    title: "L'histoire Sorani",
    paragraph1:
      "SORANI, c'est l'histoire de bijoux fabriqués avec amour, à la commande, spécialement pour vous.",
    paragraph2:
      "Chaque pièce est unique et reflète notre passion pour l'artisanat. Des modèles tendance et élégants, résistants à l'eau, conçus pour durer.",
    imageUrl: '/images/sorani-card.jpg',
    ctaLabel: 'Découvrir nos créations',
    ctaLink: '/shop',
  },
  reasons: {
    title: "4 bonnes raisons d'acheter un bijou Sorani",
    subtitle: 'Des bijoux de qualité, faits pour vous accompagner au quotidien',
    items: [
      { title: 'Unique', description: 'Fabriqué à la commande spécialement pour vous', imageUrl: '/images/hero-2.png' },
      { title: 'Intemporel', description: "Des modèles tendance à porter toute l'année", imageUrl: '/images/hero-3.png' },
      { title: 'Résistant', description: "Résiste à l'eau et ne ternit pas", imageUrl: '/images/hero-4.png' },
      { title: 'Durable', description: 'Conçu pour durer et garder son éclat', imageUrl: '/images/hero-5.png' },
    ],
  },
  categoriesTitle: 'Nos catégories',
  trust: {
    items: [
      { title: 'Fait main', description: 'Chaque pièce est unique et artisanale', icon: 'Sparkles' },
      { title: 'Waterproof', description: "Résiste à l'eau et ne ternit pas", icon: 'Droplets' },
      { title: 'Livraison soignée', description: 'Expédition rapide en écrin élégant', icon: 'Truck' },
      { title: 'Paiement sécurisé', description: 'Transactions 100% sécurisées', icon: 'Shield' },
    ],
  },
  newsletter: {
    title: 'Restez informée',
    subtitle: 'Inscrivez-vous pour recevoir nos nouveautés et offres exclusives',
    ctaLabel: "S'inscrire",
  },
  homeLayout: {
    sections: [
      { id: 'core-hero', type: 'hero', visible: true },
      { id: 'core-featured', type: 'featured', visible: true },
      { id: 'core-story', type: 'story', visible: true },
      { id: 'core-reasons', type: 'reasons', visible: true },
      { id: 'core-categories', type: 'categories', visible: true },
      { id: 'core-trust', type: 'trust', visible: true },
      { id: 'core-newsletter', type: 'newsletter', visible: true },
    ],
  },
};
