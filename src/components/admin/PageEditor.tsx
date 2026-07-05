'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  FileEdit,
  CheckCircle2,
  Image as ImageIcon,
  Bold,
  Heading2,
  List,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/compress-image';
import type { Page } from '@/types/page';
import { PageHeader, Card, CardHeader, Button, Label, Input, Textarea } from '@/components/admin/ui';

type Mode = 'edit' | 'preview';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function PageEditor({ page }: { page?: Page }) {
  const router = useRouter();
  const isNew = !page;

  const [form, setForm] = useState({
    title: page?.title ?? '',
    slug: page?.slug ?? '',
    content: page?.content ?? '',
    status: page?.status ?? 'draft',
    show_in_nav: page?.show_in_nav ?? false,
    seo_title: page?.seo_title ?? '',
    seo_description: page?.seo_description ?? '',
  });
  const [mode, setMode] = useState<Mode>('edit');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Insère du texte (markdown) à la position du curseur dans le contenu
  const insertAtCursor = (snippet: string, wrap = false, placeholder = '') => {
    const el = contentRef.current;
    const content = form.content;
    if (!el) {
      setForm({ ...form, content: content + snippet });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const insert = wrap ? `${snippet}${selected}${snippet}` : snippet;
    const next = content.slice(0, start) + insert + content.slice(end);
    setForm({ ...form, content: next });
    // Repositionne le curseur après l'insertion
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insert.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleInsertImage = async (rawFile: File | null) => {
    if (!rawFile) return;
    if (!rawFile.type.startsWith('image/')) {
      alert('Le fichier doit être une image.');
      return;
    }
    setUploading(true);
    // Compression + redimensionnement avant envoi
    const file = await compressImage(rawFile);
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'webp';
    const path = `pages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      alert(`Échec de l’upload : ${error.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    insertAtCursor(`\n\n![${file.name.replace(/\.[^.]+$/, '')}](${data.publicUrl})\n\n`);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleTitleChange = (title: string) => {
    if (isNew && !form.slug) {
      setForm({ ...form, title, slug: slugify(title) });
    } else {
      setForm({ ...form, title });
    }
  };

  const handleSave = async (publish?: boolean) => {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      status: publish ? 'published' : form.status,
      show_in_nav: form.show_in_nav,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    };

    if (isNew) {
      const { data, error } = await supabase.from('pages').insert(payload).select().single();
      if (error) {
        alert(`Erreur: ${error.message}`);
        setSaving(false);
        return;
      }
      router.push(`/admin/pages/${data.id}`);
    } else {
      const { error } = await supabase.from('pages').update(payload).eq('id', page.id);
      if (error) {
        alert(`Erreur: ${error.message}`);
        setSaving(false);
        return;
      }
      setForm({ ...form, status: payload.status });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!page || !confirm(`Supprimer définitivement la page « ${page.title} » ?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('pages').delete().eq('id', page.id);
    if (error) {
      alert(`Erreur: ${error.message}`);
      return;
    }
    router.push('/admin/pages');
  };

  return (
    <div>
      <Link
        href="/admin/pages"
        className="inline-flex items-center gap-1.5 text-xs mb-4"
        style={{ color: 'var(--admin-text-muted)' }}
      >
        <ArrowLeft size={13} />
        Retour aux pages
      </Link>

      <PageHeader
        title={isNew ? 'Nouvelle page' : form.title || 'Sans titre'}
        description={
          isNew
            ? 'Crée une page autonome (À propos, Contact, FAQ…)'
            : form.status === 'published'
            ? `Publiée à /${form.slug}`
            : 'Brouillon — non visible par les visiteurs'
        }
        action={
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
                Supprimer
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={justSaved ? CheckCircle2 : Save}
              onClick={() => handleSave(false)}
              disabled={saving || !form.title}
            >
              {saving ? '…' : justSaved ? 'Enregistré' : 'Enregistrer brouillon'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={() => handleSave(true)}
              disabled={saving || !form.title}
            >
              Publier
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main column */}
        <div className="space-y-4">
          <Card noPadding>
            <CardHeader
              title="Contenu"
              action={
                <div className="flex items-center gap-1 p-0.5 rounded-md" style={{ background: 'var(--admin-hover)' }}>
                  {(['edit', 'preview'] as Mode[]).map((m) => {
                    const Icon = m === 'edit' ? FileEdit : Eye;
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className="px-2 py-1 rounded text-xs flex items-center gap-1 transition"
                        style={{
                          background: mode === m ? 'var(--admin-surface)' : 'transparent',
                          color: mode === m ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                          boxShadow: mode === m ? 'var(--shadow-xs)' : undefined,
                        }}
                      >
                        <Icon size={12} />
                        {m === 'edit' ? 'Éditer' : 'Aperçu'}
                      </button>
                    );
                  })}
                </div>
              }
            />
            <div className="p-5">
              <div className="mb-4">
                <Label>Titre de la page</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: À propos de nous"
                  className="text-base font-medium"
                />
              </div>

              {mode === 'edit' ? (
                <div>
                  <Label>Contenu</Label>

                  {/* Barre d'outils : insérer des éléments */}
                  <div
                    className="flex flex-wrap items-center gap-1 p-1.5 mb-2 rounded-lg"
                    style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleInsertImage(e.target.files?.[0] || null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition disabled:opacity-50"
                      style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
                    >
                      {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                      {uploading ? 'Envoi…' : 'Insérer une image'}
                    </button>

                    <span className="w-px h-5 mx-1" style={{ background: 'var(--admin-border)' }} />

                    <ToolbarBtn icon={Heading2} label="Titre" onClick={() => insertAtCursor('\n## Titre de section\n')} />
                    <ToolbarBtn icon={Bold} label="Gras" onClick={() => insertAtCursor('**', true, 'texte en gras')} />
                    <ToolbarBtn icon={List} label="Liste" onClick={() => insertAtCursor('\n- Premier élément\n- Deuxième élément\n')} />
                  </div>

                  <Textarea
                    ref={contentRef}
                    rows={20}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="# Mon titre&#10;&#10;Écris ton contenu, ou utilise la barre d'outils pour insérer une image…"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--admin-text-faint)' }}>
                    Utilise les boutons ci-dessus pour insérer une image, un titre, du gras ou une liste.
                    Le contenu est en Markdown.
                  </p>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none p-4 rounded-lg min-h-[400px]"
                  style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {form.content || '*Aperçu vide. Écris du contenu pour le voir ici.*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Side column */}
        <aside className="space-y-4">
          <Card noPadding>
            <CardHeader title="Paramètres" />
            <div className="p-5 space-y-4">
              <div>
                <Label>URL (slug)</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono" style={{ color: 'var(--admin-text-faint)' }}>
                    /
                  </span>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    placeholder="a-propos"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.show_in_nav}
                  onChange={(e) => setForm({ ...form, show_in_nav: e.target.checked })}
                  className="mt-0.5 accent-[#1B4965]"
                />
                <div>
                  <p className="text-sm" style={{ color: 'var(--admin-text)' }}>
                    Afficher dans le menu
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--admin-text-faint)' }}>
                    Le lien apparaît dans la navigation principale
                  </p>
                </div>
              </label>
            </div>
          </Card>

          <Card noPadding>
            <CardHeader title="SEO" description="Métadonnées pour Google" />
            <div className="p-5 space-y-3">
              <div>
                <Label>Titre SEO</Label>
                <Input
                  value={form.seo_title}
                  onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                  placeholder={form.title}
                />
              </div>
              <div>
                <Label>Description SEO</Label>
                <Textarea
                  rows={3}
                  value={form.seo_description}
                  onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                  placeholder="Description courte pour Google (150-160 caractères)"
                />
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition"
      style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
