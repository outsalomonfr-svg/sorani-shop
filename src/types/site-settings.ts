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
};

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
};
