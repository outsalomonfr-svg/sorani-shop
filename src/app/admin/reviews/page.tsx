'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, X, Trash2, Star, MessageSquare, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ProductReview } from '@/types';
import {
  PageHeader,
  Card,
  Badge,
  EmptyState,
  Table,
  THead,
  Th,
  Tr,
  Td,
  LoadingState,
} from '@/components/admin/ui';

type ReviewWithProduct = ProductReview & {
  product?: { id: string; name: string; slug: string } | null;
};

const TABS: { id: ProductReview['status']; label: string }[] = [
  { id: 'pending', label: 'En attente' },
  { id: 'approved', label: 'Approuvés' },
  { id: 'rejected', label: 'Rejetés' },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ProductReview['status']>('pending');
  const [busy, setBusy] = useState<string | null>(null);

  const fetchReviews = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('product_reviews')
      .select('*, product:products(id, name, slug)')
      .order('created_at', { ascending: false });
    setReviews((data as ReviewWithProduct[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: string, status: ProductReview['status']) => {
    setBusy(id);
    const supabase = createClient();
    await supabase.from('product_reviews').update({ status }).eq('id', id);
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setBusy(null);
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    setBusy(id);
    const supabase = createClient();
    await supabase.from('product_reviews').delete().eq('id', id);
    setReviews((rs) => rs.filter((r) => r.id !== id));
    setBusy(null);
  };

  const counts = {
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  };

  const filtered = reviews.filter((r) => r.status === active);

  return (
    <div>
      <PageHeader
        title="Avis clients"
        description={`${reviews.length} avis au total · ${counts.pending} en attente`}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 p-0.5 rounded-md w-fit" style={{ background: 'var(--admin-hover)' }}>
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded transition"
              style={{
                background: isActive ? 'var(--admin-surface)' : 'transparent',
                color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                boxShadow: isActive ? 'var(--shadow-xs)' : undefined,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {t.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--admin-hover)', color: 'var(--admin-text-muted)' }}
              >
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      <Card noPadding>
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={`Aucun avis ${active === 'pending' ? 'en attente' : active === 'approved' ? 'approuvé' : 'rejeté'}`}
            description={active === 'pending' ? 'Les nouveaux avis apparaîtront ici.' : undefined}
          />
        ) : (
          <Table>
            <THead>
              <Th>Note</Th>
              <Th>Avis</Th>
              <Th>Produit</Th>
              <Th>Auteur</Th>
              <Th>Date</Th>
              <Th align="right">Actions</Th>
            </THead>
            <tbody>
              {filtered.map((r, idx) => (
                <Tr key={r.id} isFirst={idx === 0}>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium" style={{ color: 'var(--admin-text)' }}>{r.rating}</span>
                      <Star size={12} fill="currentColor" style={{ color: 'var(--brand-blue)' }} />
                      {r.verified_purchase && (
                        <Badge variant="success" dot={false}>Vérifié</Badge>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div className="max-w-[360px]">
                      {r.title && (
                        <p className="font-medium text-xs mb-0.5" style={{ color: 'var(--admin-text)' }}>{r.title}</p>
                      )}
                      <p
                        className="text-xs line-clamp-2"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        {r.comment || '—'}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    {r.product ? (
                      <Link
                        href={`/admin/products/${r.product.id}`}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--brand-blue)' }}
                      >
                        {r.product.name}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--admin-text-faint)' }}>—</span>
                    )}
                  </Td>
                  <Td>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--admin-text)' }}>{r.customer_name || '—'}</div>
                      <div className="text-[11px]" style={{ color: 'var(--admin-text-muted)' }}>{r.customer_email}</div>
                    </div>
                  </Td>
                  <Td>
                    <span style={{ color: 'var(--admin-text-muted)' }}>
                      {new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-1">
                      {r.product && (
                        <a
                          href={`/shop/product/${r.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-black/[0.04]"
                          style={{ color: 'var(--admin-text-muted)' }}
                          title="Voir sur le site"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => updateStatus(r.id, 'approved')}
                          disabled={busy === r.id}
                          className="p-1.5 rounded-md hover:bg-green-50"
                          style={{ color: '#16A34A' }}
                          title="Approuver"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(r.id, 'rejected')}
                          disabled={busy === r.id}
                          className="p-1.5 rounded-md hover:bg-[#FEF2F2]"
                          style={{ color: '#DC2626' }}
                          title="Rejeter"
                        >
                          <X size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(r.id)}
                        disabled={busy === r.id}
                        className="p-1.5 rounded-md hover:bg-[#FEF2F2]"
                        style={{ color: 'var(--admin-text-muted)' }}
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
