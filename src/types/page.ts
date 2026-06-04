export type Page = {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  seo_title: string | null;
  seo_description: string | null;
  show_in_nav: boolean;
  created_at: string;
  updated_at: string;
};
