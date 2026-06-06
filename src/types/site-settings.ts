export type FontChoice = string;

// Recadrage d'une image : focal point en % (0-100) + zoom en % (>=100)
export type ImagePosition = {
  x: number;
  y: number;
  zoom?: number;
};

export type NavSubLink = {
  label: string;
  href: string;
  children?: NavSubLink[];
};

export type NavLink = {
  label: string;
  href: string;
  visible?: boolean;
  children?: NavSubLink[];
  // 'categories' = remplit automatiquement les sous-liens avec les catégories Supabase
  // 'manual' (défaut) = utilise `children` saisis à la main
  childrenSource?: 'manual' | 'categories';
};

// Polices serif élégantes (parfait pour les titres et bijouterie)
export const SERIF_FONTS: FontChoice[] = [
  'Playfair Display',
  'Cormorant Garamond',
  'DM Serif Display',
  'EB Garamond',
  'Libre Baskerville',
  'Lora',
  'Cardo',
  'Crimson Text',
];

// Polices sans-serif modernes
export const SANS_FONTS: FontChoice[] = [
  'Inter',
  'DM Sans',
  'Nunito Sans',
  'Montserrat',
  'Poppins',
  'Outfit',
  'Manrope',
  'Work Sans',
];

// Polices display / chic
export const DISPLAY_FONTS: FontChoice[] = [
  'Bebas Neue',
  'Oswald',
  'Italiana',
  'Cinzel',
  'Marcellus',
];

// Polices manuscrites / signatures
export const SCRIPT_FONTS: FontChoice[] = [
  'Dancing Script',
  'Great Vibes',
  'Allura',
  'Parisienne',
];

export const ALL_FONTS = [
  ...SERIF_FONTS,
  ...SANS_FONTS,
  ...DISPLAY_FONTS,
  ...SCRIPT_FONTS,
];

// Listes recommandées par usage
export const HEADING_FONTS: FontChoice[] = [...SERIF_FONTS, ...DISPLAY_FONTS, ...SANS_FONTS];
export const BODY_FONTS: FontChoice[] = [...SANS_FONTS, ...SERIF_FONTS];

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
    headingFont: FontChoice;        // h1, h2, h3 — titres de section
    bodyFont: FontChoice;           // paragraphes, descriptions
    navFont?: FontChoice;           // menu navigation
    productFont?: FontChoice;       // nom des produits
    priceFont?: FontChoice;         // prix
    buttonFont?: FontChoice;        // boutons CTA
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
    imagePosition?: ImagePosition;
    ctaLabel: string;
    ctaLink: string;
    overlayEnabled?: boolean;
    overlayColor?: string;
    overlayOpacity?: number; // 0-100
    overlayDirection?: 'horizontal' | 'vertical' | 'full';
  };
  nav: {
    links: NavLink[];
    layout?: 'two-row' | 'single-row-left' | 'single-row-center';
    background?: 'glass' | 'solid' | 'transparent';
    sticky?: boolean;
    showSearch?: boolean;
    showAccount?: boolean;
    showCart?: boolean;
    bgColor?: string;
    textColor?: string;
  };
  footer: {
    about: string;
    contactEmail: string;
    social: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
    };
    columns?: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    copyright?: string;
  };
  featuredTitle: string;
  story: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    imageUrl: string;
    imagePosition?: ImagePosition;
    ctaLabel: string;
    ctaLink: string;
  };
  reasons: {
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string; imageUrl: string }>;
  };
  categoriesTitle: string;
  hiddenCategorySlugs?: string[];
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
  // Couleur de fond + texte + padding + plus par section
  sectionStyles?: Record<
    string,
    {
      bgColor?: string;
      textColor?: string;
      padding?: 'compact' | 'normal' | 'spacious';
      // Une seule option de transition (un seul effet à la fois)
      transition?: 'none' | 'gradient' | 'wave' | 'slant' | 'curve' | 'arrow';
      // Transition depuis la section précédente (haut)
      transitionFrom?: 'none' | 'gradient';
      // Anciens champs maintenus pour compatibilité (auto-migrés vers transition au prochain enregistrement)
      gradientToNext?: boolean;
      divider?: 'none' | 'wave' | 'slant' | 'curve' | 'arrow';
      width?: 'full' | 'boxed';
      align?: 'left' | 'center';
      rounded?: boolean;
    }
  >;
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
  | 'gallery'
  | 'text'
  | 'quote'
  | 'faq'
  | 'video'
  | 'stats'
  | 'cta'
  | 'logos'
  | 'spacer'
  | 'columns3'
  | 'promo';

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  visible: boolean;
  custom?: {
    title?: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
    imagePosition?: ImagePosition;
    ctaLabel?: string;
    ctaLink?: string;
    layout?: 'left' | 'right';
    images?: string[];
    quote?: string;
    author?: string;
    videoUrl?: string;
    faqItems?: Array<{ question: string; answer: string }>;
    statsItems?: Array<{ value: string; label: string }>;
    columnsItems?: Array<{ title: string; description: string; iconUrl?: string }>;
    logos?: string[];
    height?: number;
    bgColor?: string;
    textColor?: string;
    promoCode?: string; // code à afficher (ex: WELCOME10)
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
  gallery: 'Galerie photo',
  text: 'Bloc texte',
  quote: 'Citation / Avis',
  faq: 'FAQ',
  video: 'Vidéo',
  stats: 'Chiffres clés',
  cta: 'Appel à l’action',
  logos: 'Logos / Presse',
  spacer: 'Espace',
  columns3: '3 colonnes',
  promo: 'Code promo',
};

export const SECTION_TYPE_DESCRIPTIONS: Partial<Record<HomeSectionType, string>> = {
  imageText: 'Image à gauche ou droite avec un texte et un bouton',
  banner: 'Grande bannière pleine largeur avec titre et CTA',
  gallery: 'Grille de photos (lookbook, ambiance, presse)',
  text: 'Paragraphe centré pour annoncer ou raconter',
  quote: 'Témoignage client ou citation mise en avant',
  faq: 'Questions fréquentes en accordéon',
  video: 'Embed YouTube ou Vimeo',
  stats: 'Chiffres clés (ex : 10k clientes, 1500 avis 5★)',
  cta: 'Bandeau d’invitation à l’action',
  logos: 'Logos clients / presse / partenaires',
  spacer: 'Espace vide pour aérer',
  columns3: 'Trois colonnes (services, valeurs, étapes)',
  promo: 'Met en avant un code promo (avec bouton copier)',
};

// Sections "core" qui ne peuvent pas être supprimées (seulement masquées/déplacées)
export const CORE_SECTION_TYPES: HomeSectionType[] = [
  'hero', 'featured', 'story', 'reasons', 'categories', 'trust', 'newsletter',
];

// Sections "additionnelles" qu'on peut ajouter en plusieurs exemplaires
export const ADDABLE_SECTION_TYPES: HomeSectionType[] = [
  'imageText',
  'banner',
  'cta',
  'text',
  'quote',
  'faq',
  'video',
  'gallery',
  'stats',
  'columns3',
  'logos',
  'spacer',
];

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    name: 'SORANI',
    logoUrl: '/images/logo.png',
    tagline: 'Bijoux faits avec amour',
  },
  colors: {
    primary: '#3845AD',
    primaryDark: '#2E3996',
    accent: '#BEE9E8',
    background: '#ffffff',
    text: '#171717',
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    navFont: 'Playfair Display',
    productFont: 'Playfair Display',
    priceFont: 'Inter',
    buttonFont: 'Inter',
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
    overlayEnabled: false,
    overlayColor: '#3845AD',
    overlayOpacity: 50,
    overlayDirection: 'horizontal',
  },
  nav: {
    links: [
      {
        label: 'Boutique',
        href: '/shop',
        childrenSource: 'categories',
        children: [],
      },
      { label: 'Nos histoires', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    layout: 'two-row',
    background: 'glass',
    sticky: true,
    showSearch: true,
    showAccount: true,
    showCart: true,
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
    columns: [
      {
        title: 'Boutique',
        links: [
          { label: 'Colliers', href: '/shop?category=colliers' },
          { label: 'Bracelets', href: '/shop?category=bracelets' },
          { label: "Boucles d'oreilles", href: '/shop?category=boucles-oreilles' },
          { label: 'Bagues', href: '/shop?category=bagues' },
        ],
      },
      {
        title: 'Informations',
        links: [
          { label: 'À propos', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Livraison', href: '/livraison' },
          { label: 'CGV', href: '/cgv' },
        ],
      },
    ],
    copyright: '',
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
