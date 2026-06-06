'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';
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

const statusMeta: Record<string, { variant: 'warning' | 'success' | 'info' | 'purple' | 'muted' | 'danger'; label: string }> = {
  pending: { variant: 'warning', label: 'En attente' },
  paid: { variant: 'success', label: 'Payée' },
  processing: { variant: 'info', label: 'En préparation' },
  shipped: { variant: 'purple', label: 'Expédiée' },
  delivered: { variant: 'muted', label: 'Livrée' },
  cancelled: { variant: 'danger', label: 'Annulée' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const prev = orders.find((o) => o.id === id);
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: status as Order['status'] } : o)));

    // Quand on passe à "Livrée", invite automatiquement à laisser un avis
    if (status === 'delivered' && prev?.status !== 'delivered') {
      const { inviteReviewsForOrder } = await import('@/app/actions/reviews');
      const res = await inviteReviewsForOrder(id);
      if (res.ok) {
        // Petit feedback silencieux
        console.log(`[reviews] ${res.sent} invitation(s) envoyée(s) pour la commande ${id}`);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Commandes"
        description={`${orders.length} commande${orders.length > 1 ? 's' : ''} reçue${orders.length > 1 ? 's' : ''}`}
      />

      <Card noPadding>
        {loading ? (
          <LoadingState />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Aucune commande"
            description="Les commandes apparaîtront ici dès qu’un client passera au paiement."
          />
        ) : (
          <Table>
            <THead>
              <Th>Commande</Th>
              <Th>Client</Th>
              <Th>Total</Th>
              <Th>Statut</Th>
              <Th>Date</Th>
              <Th align="right">Mettre à jour</Th>
            </THead>
            <tbody>
              {orders.map((order, idx) => {
                const meta = statusMeta[order.status] || statusMeta.pending;
                return (
                  <Tr key={order.id} isFirst={idx === 0}>
                    <Td>
                      <span className="font-mono text-xs" style={{ color: 'var(--admin-text)' }}>
                        #{order.id.slice(0, 8)}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ color: 'var(--admin-text)' }}>{order.customer_name || '—'}</div>
                      <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                        {order.customer_email}
                      </div>
                    </Td>
                    <Td>
                      <span className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {order.total.toFixed(2)} €
                      </span>
                    </Td>
                    <Td>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--admin-text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </Td>
                    <Td align="right">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md outline-none"
                        style={{
                          background: 'var(--admin-surface)',
                          border: '1px solid var(--admin-border-strong)',
                          color: 'var(--admin-text)',
                        }}
                      >
                        <option value="pending">En attente</option>
                        <option value="paid">Payée</option>
                        <option value="processing">En préparation</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
