'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Palette,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Result = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: typeof Search;
  group: string;
};

const ADMIN_SHORTCUTS: Result[] = [
  { id: 'dash', title: 'Dashboard', href: '/admin', icon: LayoutDashboard, group: 'Aller à' },
  { id: 'prods', title: 'Produits', href: '/admin/products', icon: Package, group: 'Aller à' },
  { id: 'new-prod', title: 'Nouveau produit', href: '/admin/products/new', icon: Package, group: 'Actions' },
  { id: 'orders', title: 'Commandes', href: '/admin/orders', icon: ShoppingCart, group: 'Aller à' },
  { id: 'customers', title: 'Clients', href: '/admin/customers', icon: Users, group: 'Aller à' },
  { id: 'pages', title: 'Pages', href: '/admin/pages', icon: FileText, group: 'Aller à' },
  { id: 'new-page', title: 'Nouvelle page', href: '/admin/pages/new', icon: FileText, group: 'Actions' },
  { id: 'customize', title: 'Apparence', href: '/admin/customize', icon: Palette, group: 'Aller à' },
  { id: 'settings', title: 'Paramètres', href: '/admin/settings', icon: Settings, group: 'Aller à' },
];

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [dynamicResults, setDynamicResults] = useState<Result[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Fetch dynamic data (products, pages, customers, orders) on open
  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      const supabase = createClient();
      const [prodsRes, pagesRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, name, slug, price').limit(50),
        supabase.from('pages').select('id, slug, title, status').limit(50),
        supabase.from('orders').select('id, customer_name, customer_email, total, status').limit(50),
      ]);

      const items: Result[] = [];

      (prodsRes.data || []).forEach((p) => {
        items.push({
          id: `prod-${p.id}`,
          title: p.name,
          subtitle: `${p.price?.toFixed(2)} € — produit`,
          href: `/admin/products/${p.id}`,
          icon: Package,
          group: 'Produits',
        });
      });

      (pagesRes.data || []).forEach((p) => {
        items.push({
          id: `page-${p.id}`,
          title: p.title,
          subtitle: `/${p.slug} — ${p.status === 'published' ? 'publiée' : 'brouillon'}`,
          href: `/admin/pages/${p.id}`,
          icon: FileText,
          group: 'Pages',
        });
      });

      (ordersRes.data || []).forEach((o) => {
        items.push({
          id: `order-${o.id}`,
          title: `${o.customer_name || o.customer_email} — ${o.total?.toFixed(2)} €`,
          subtitle: `Commande #${o.id.slice(0, 8)} — ${o.status}`,
          href: '/admin/orders',
          icon: ShoppingCart,
          group: 'Commandes',
        });
      });

      // Deduplicate customers from orders
      const seen = new Set<string>();
      (ordersRes.data || []).forEach((o) => {
        if (!o.customer_email || seen.has(o.customer_email)) return;
        seen.add(o.customer_email);
        items.push({
          id: `cust-${o.customer_email}`,
          title: o.customer_name || o.customer_email,
          subtitle: o.customer_email,
          href: '/admin/customers',
          icon: Users,
          group: 'Clients',
        });
      });

      setDynamicResults(items);
    };
    fetchData();
  }, [open]);

  const allResults = useMemo(() => [...ADMIN_SHORTCUTS, ...dynamicResults], [dynamicResults]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_SHORTCUTS;
    return allResults.filter((r) =>
      `${r.title} ${r.subtitle || ''}`.toLowerCase().includes(q)
    );
  }, [query, allResults]);

  const grouped = useMemo(() => {
    const map = new Map<string, Result[]>();
    filtered.forEach((r) => {
      const arr = map.get(r.group) || [];
      arr.push(r);
      map.set(r.group, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIdx]) {
        e.preventDefault();
        router.push(filtered[selectedIdx].href);
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIdx, onClose, router]);

  if (!open) return null;

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(20,20,30,0.4)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl overflow-hidden flex flex-col animate-fade-in-up"
        style={{
          background: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
          maxHeight: '70vh',
          animationDuration: '0.15s',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-2.5 px-4 h-12 border-b"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <Search size={16} style={{ color: 'var(--admin-text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher pages, produits, clients, commandes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none border-none bg-transparent text-sm"
            style={{ color: 'var(--admin-text)' }}
          />
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{
              background: 'var(--admin-hover)',
              color: 'var(--admin-text-muted)',
              border: '1px solid var(--admin-border)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto admin-scroll py-1.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              Aucun résultat pour <span style={{ color: 'var(--admin-text)' }}>« {query} »</span>
            </div>
          ) : (
            grouped.map(([groupName, items]) => (
              <div key={groupName} className="py-1">
                <div
                  className="px-4 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--admin-text-faint)' }}
                >
                  {groupName}
                </div>
                {items.map((r) => {
                  const idx = flatIdx++;
                  const isSelected = idx === selectedIdx;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        router.push(r.href);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left"
                      style={{
                        background: isSelected ? 'var(--admin-hover)' : 'transparent',
                        color: 'var(--admin-text)',
                      }}
                    >
                      <r.icon size={14} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{r.title}</div>
                        {r.subtitle && (
                          <div className="text-xs truncate" style={{ color: 'var(--admin-text-muted)' }}>
                            {r.subtitle}
                          </div>
                        )}
                      </div>
                      {isSelected && <ArrowRight size={13} style={{ color: 'var(--admin-text-faint)' }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2 text-[11px] border-t"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-faint)' }}
        >
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono">↑↓</kbd> naviguer
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> ouvrir
            </span>
          </div>
          <span>
            <kbd className="font-mono">⌘ K</kbd> raccourci
          </span>
        </div>
      </div>
    </div>
  );
}
