'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Page } from '@/types/page';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  EmptyState,
  Table,
  THead,
  Th,
  Tr,
  Td,
  LoadingState,
} from '@/components/admin/ui';

export default function AdminPagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('pages').select('*').order('updated_at', { ascending: false });
      setPages((data as Page[]) || []);
      setLoading(false);
    };
    fetchPages();
  }, []);

  return (
    <div>
      <PageHeader
        title="Pages"
        description={`${pages.length} page${pages.length > 1 ? 's' : ''} dans ton site`}
        action={
          <Button href="/admin/pages/new" variant="primary" icon={Plus}>
            Nouvelle page
          </Button>
        }
      />

      <Card noPadding>
        {loading ? (
          <LoadingState />
        ) : pages.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucune page"
            description="Crée des pages comme « À propos », « Contact » ou « FAQ »."
            action={
              <Button href="/admin/pages/new" variant="primary" icon={Plus} size="sm">
                Créer une page
              </Button>
            }
          />
        ) : (
          <Table>
            <THead>
              <Th>Titre</Th>
              <Th>URL</Th>
              <Th>Statut</Th>
              <Th>Dans le menu</Th>
              <Th>Modifié</Th>
              <Th align="right">Actions</Th>
            </THead>
            <tbody>
              {pages.map((page, idx) => (
                <Tr key={page.id} isFirst={idx === 0}>
                  <Td>
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-medium hover:underline"
                      style={{ color: 'var(--admin-text)' }}
                    >
                      {page.title}
                    </Link>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      /{page.slug}
                    </span>
                  </Td>
                  <Td>
                    {page.status === 'published' ? (
                      <Badge variant="success">Publiée</Badge>
                    ) : (
                      <Badge variant="muted">Brouillon</Badge>
                    )}
                  </Td>
                  <Td>
                    {page.show_in_nav ? (
                      <Badge variant="info" dot={false}>Oui</Badge>
                    ) : (
                      <span style={{ color: 'var(--admin-text-faint)' }}>—</span>
                    )}
                  </Td>
                  <Td>
                    <span style={{ color: 'var(--admin-text-muted)' }}>
                      {new Date(page.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </Td>
                  <Td align="right">
                    {page.status === 'published' && (
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1.5 rounded-md hover:bg-black/[0.04]"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
