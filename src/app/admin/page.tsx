'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
}

interface RecentOrder {
  id: string;
  customer_name: string | null;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: '#FFF4E5', text: '#9A5A00', dot: '#F59E0B', label: 'En attente' },
  paid: { bg: '#E8F5E9', text: '#1B5E20', dot: '#16A34A', label: 'Payée' },
  processing: { bg: '#E3F2FD', text: '#0D47A1', dot: '#2563EB', label: 'En traitement' },
  shipped: { bg: '#EDE7F6', text: '#4527A0', dot: '#7C3AED', label: 'Expédiée' },
  delivered: { bg: '#F1F1EF', text: '#2F2F2C', dot: '#787774', label: 'Livrée' },
  cancelled: { bg: '#FDECEC', text: '#991B1B', dot: '#DC2626', label: 'Annulée' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('id', { count: 'exact' }),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
      const uniqueEmails = new Set(orders.map((o) => o.customer_email));

      setStats({
        revenue,
        orders: orders.length,
        customers: uniqueEmails.size,
        products: productsRes.count || 0,
      });

      setRecentOrders(
        orders
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 8)
      );

      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Chiffre d’affaires',
      value: `${stats.revenue.toFixed(2)} €`,
      icon: DollarSign,
      trend: stats.revenue > 0 ? '+0%' : null,
      positive: true,
    },
    {
      label: 'Commandes',
      value: stats.orders.toString(),
      icon: ShoppingCart,
      trend: null,
      positive: true,
    },
    {
      label: 'Clients',
      value: stats.customers.toString(),
      icon: Users,
      trend: null,
      positive: true,
    },
    {
      label: 'Produits',
      value: stats.products.toString(),
      icon: Package,
      trend: null,
      positive: true,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
          Vue d’ensemble de ta boutique aujourd’hui.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-5 rounded-xl transition hover:shadow-sm"
            style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--admin-hover)' }}
              >
                <card.icon size={16} style={{ color: 'var(--brand-blue)' }} />
              </div>
              {card.trend && (
                <span
                  className="flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: card.positive ? '#E8F5E9' : '#FDECEC',
                    color: card.positive ? '#1B5E20' : '#991B1B',
                  }}
                >
                  {card.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {card.trend}
                </span>
              )}
            </div>
            {loading ? (
              <div className="h-7 w-20 rounded animate-pulse" style={{ background: 'var(--admin-hover)' }} />
            ) : (
              <p className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
                {card.value}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <section
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
              Commandes récentes
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
              Les 8 dernières commandes reçues
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition hover:bg-black/[0.04]"
            style={{ color: 'var(--admin-text)' }}
          >
            Tout voir
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            Chargement…
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="mx-auto mb-3" style={{ color: 'var(--admin-text-faint)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
              Pas encore de commande
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              Les commandes apparaîtront ici dès qu’un client passera au paiement.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--admin-bg)' }}>
                  {['Commande', 'Client', 'Total', 'Statut', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider"
                      style={{ color: 'var(--admin-text-faint)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => {
                  const status = statusStyles[order.status] || statusStyles.pending;
                  return (
                    <tr
                      key={order.id}
                      className="transition hover:bg-black/[0.02]"
                      style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--admin-border)' }}
                    >
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--admin-text)' }}>
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--admin-text)' }}>
                        {order.customer_name || order.customer_email}
                      </td>
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--admin-text)' }}>
                        {order.total.toFixed(2)} €
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: status.bg, color: status.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--admin-text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
