import type { SiteSettings } from '@/types/site-settings';

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  preview: { primary: string; accent: string; background: string };
  recommended?: boolean;
  apply: (current: SiteSettings) => SiteSettings;
};

/* ============================================================ */
/*  SORANI Tons Doux — Ecru, crème, blanc, bleu signature      */
/* ============================================================ */
const soraniDoux: ThemePreset = {
  id: 'sorani-doux',
  name: 'SORANI Tons Doux',
  description: 'Ecru, crème et blanc avec ton bleu signature. Chic et reposant.',
  preview: { primary: '#1B4965', accent: '#E8DCC8', background: '#FAF6EF' },
  recommended: true,
  apply: (s) => ({
    ...s,
    colors: {
      primary: '#1B4965',
      primaryDark: '#143A52',
      accent: '#E8DCC8',
      background: '#FAF6EF',
      text: '#1A1A1A',
    },
    typography: {
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
      navFont: 'Cormorant Garamond',
      productFont: 'Cormorant Garamond',
      priceFont: 'Inter',
      buttonFont: 'Inter',
    },
    hero: {
      ...s.hero,
      overlayEnabled: true,
      overlayColor: '#1B4965',
      overlayOpacity: 20,
      overlayDirection: 'vertical',
    },
    sectionStyles: {
      ...(s.sectionStyles || {}),
      hero: { ...(s.sectionStyles?.hero || {}), bgColor: '#FAF6EF' },
      featured: { bgColor: '#FFFFFF', padding: 'spacious', align: 'center' },
      story: { bgColor: '#1B4965', textColor: '#FAF6EF', padding: 'spacious' },
      reasons: { bgColor: '#FAF6EF', padding: 'spacious', align: 'center' },
      categories: { bgColor: '#FFFFFF', padding: 'spacious' },
      trust: { bgColor: '#FAF6EF', padding: 'normal', align: 'center' },
      newsletter: { bgColor: '#1B4965', textColor: '#FAF6EF', padding: 'spacious' },
    },
  }),
};

/* ============================================================ */
/*  Gas Bijoux — Méditerranée chic                             */
/* ============================================================ */
const gasBijoux: ThemePreset = {
  id: 'gas-bijoux',
  name: 'Gas Bijoux',
  description: 'Noir profond, crème, serif italique. Méditerranée chic et bohème.',
  preview: { primary: '#1A1A1A', accent: '#E8C9A0', background: '#FAF7F2' },
  apply: (s) => ({
    ...s,
    colors: {
      primary: '#1A1A1A',
      primaryDark: '#000000',
      accent: '#E8C9A0',
      background: '#FAF7F2',
      text: '#1A1A1A',
    },
    typography: {
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
      navFont: 'Cormorant Garamond',
      productFont: 'Cormorant Garamond',
      priceFont: 'Inter',
      buttonFont: 'Inter',
    },
    hero: {
      ...s.hero,
      overlayEnabled: true,
      overlayColor: '#1A1A1A',
      overlayOpacity: 25,
      overlayDirection: 'vertical',
    },
    sectionStyles: {
      ...(s.sectionStyles || {}),
      hero: { ...(s.sectionStyles?.hero || {}), bgColor: '#FAF7F2' },
      featured: { bgColor: '#FAF7F2', padding: 'spacious', align: 'center' },
      story: { bgColor: '#1A1A1A', textColor: '#FAF7F2', padding: 'spacious' },
      reasons: { bgColor: '#FAF7F2', padding: 'spacious', align: 'center' },
      categories: { bgColor: '#FAF7F2', padding: 'spacious' },
      trust: { bgColor: '#FAF7F2', padding: 'normal', align: 'center' },
      newsletter: { bgColor: '#1A1A1A', textColor: '#FAF7F2', padding: 'spacious' },
    },
  }),
};

/* ============================================================ */
/*  Mejuri — Minimal moderne                                    */
/* ============================================================ */
const mejuri: ThemePreset = {
  id: 'mejuri',
  name: 'Mejuri',
  description: 'Beige minimaliste, sans-serif moderne. Élégance épurée.',
  preview: { primary: '#0F0F0F', accent: '#D6BFA6', background: '#F5F1EB' },
  apply: (s) => ({
    ...s,
    colors: {
      primary: '#0F0F0F',
      primaryDark: '#000000',
      accent: '#D6BFA6',
      background: '#F5F1EB',
      text: '#0F0F0F',
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      navFont: 'Outfit',
      productFont: 'Outfit',
      priceFont: 'Inter',
      buttonFont: 'Outfit',
    },
    hero: {
      ...s.hero,
      overlayEnabled: true,
      overlayColor: '#0F0F0F',
      overlayOpacity: 15,
      overlayDirection: 'vertical',
    },
    sectionStyles: {
      ...(s.sectionStyles || {}),
      hero: { ...(s.sectionStyles?.hero || {}), bgColor: '#F5F1EB' },
      featured: { bgColor: '#F5F1EB', padding: 'spacious' },
      story: { bgColor: '#0F0F0F', textColor: '#F5F1EB', padding: 'spacious' },
      reasons: { bgColor: '#F5F1EB', padding: 'spacious' },
      categories: { bgColor: '#FFFFFF', padding: 'spacious' },
      trust: { bgColor: '#F5F1EB', padding: 'normal' },
      newsletter: { bgColor: '#0F0F0F', textColor: '#F5F1EB', padding: 'spacious' },
    },
  }),
};

/* ============================================================ */
/*  Tiffany & Co — Iconic blue                                 */
/* ============================================================ */
const tiffany: ThemePreset = {
  id: 'tiffany',
  name: 'Tiffany Style',
  description: 'Bleu emblématique, blanc cassé, serif royal.',
  preview: { primary: '#0ABAB5', accent: '#FFD700', background: '#FFFFFF' },
  apply: (s) => ({
    ...s,
    colors: {
      primary: '#0ABAB5',
      primaryDark: '#088780',
      accent: '#FFD700',
      background: '#FFFFFF',
      text: '#1A1A1A',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      navFont: 'Playfair Display',
      productFont: 'Playfair Display',
      priceFont: 'Inter',
      buttonFont: 'Inter',
    },
    hero: {
      ...s.hero,
      overlayEnabled: true,
      overlayColor: '#0ABAB5',
      overlayOpacity: 20,
      overlayDirection: 'horizontal',
    },
    sectionStyles: {
      ...(s.sectionStyles || {}),
      hero: { ...(s.sectionStyles?.hero || {}), bgColor: '#0ABAB5' },
      featured: { bgColor: '#FFFFFF', padding: 'spacious' },
      story: { bgColor: '#0ABAB5', textColor: '#FFFFFF', padding: 'spacious' },
      reasons: { bgColor: '#FAFAFA', padding: 'spacious' },
      categories: { bgColor: '#FFFFFF', padding: 'spacious' },
      trust: { bgColor: '#FFFFFF', padding: 'normal' },
      newsletter: { bgColor: '#0ABAB5', textColor: '#FFFFFF', padding: 'spacious' },
    },
  }),
};

/* ============================================================ */
/*  SORANI Original                                            */
/* ============================================================ */
const sorani: ThemePreset = {
  id: 'sorani',
  name: 'SORANI Original',
  description: 'Bleu profond + blanc + accent menthe. Identité SORANI classique.',
  preview: { primary: '#1B4965', accent: '#BEE9E8', background: '#FFFFFF' },
  apply: (s) => ({
    ...s,
    colors: {
      primary: '#1B4965',
      primaryDark: '#153a52',
      accent: '#BEE9E8',
      background: '#FFFFFF',
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
    hero: {
      ...s.hero,
      overlayEnabled: false,
      overlayColor: '#1B4965',
      overlayOpacity: 50,
      overlayDirection: 'horizontal',
    },
    sectionStyles: {},
  }),
};

export const THEME_PRESETS: ThemePreset[] = [soraniDoux, gasBijoux, mejuri, tiffany, sorani];

export function findTheme(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((t) => t.id === id);
}
