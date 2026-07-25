'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, ChevronRight, ChevronDown, MapPin, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { notifyOrderStatus } from '@/app/actions/orders';
import { useToast } from '@/components/admin/Toast';
import type { Order, OrderItem } from '@/types';
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
  Input,
  Button,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);
  const { toast } = useToast();

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

  // Ouvre / ferme le détail d'une commande, en chargeant ses articles au besoin.
  const toggleDetail = async (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!itemsByOrder[orderId]) {
      setLoadingItems(orderId);
      const supabase = createClient();
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      setItemsByOrder((prev) => ({ ...prev, [orderId]: (data as OrderItem[]) || [] }));
      setLoadingItems(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const prev = orders.find((o) => o.id === id);
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: status as Order['status'] } : o)));

    // E-mail automatique à la cliente quand la commande passe en préparation / expédiée
    if ((status === 'processing' || status === 'shipped') && prev?.status !== status) {
      const res = await notifyOrderStatus(id, status);
      if (res.ok) {
        toast(
          status === 'shipped'
            ? 'E-mail d’expédition envoyé à la cliente ✉️'
            : 'E-mail « en préparation » envoyé à la cliente ✉️'
        );
      } else {
        toast('E-mail non envoyé : ' + (res.error || 'erreur'), 'error');
      }
    }

    // Quand on passe à "Livrée", invite automatiquement à laisser un avis
    if (status === 'delivered' && prev?.status !== 'delivered') {
      const { inviteReviewsForOrder } = await import('@/app/actions/reviews');
      const res = await inviteReviewsForOrder(id);
      if (res.ok) {
        toast(`${res.sent} invitation(s) à laisser un avis envoyée(s)`);
      }
    }
  };

  // Enregistre le numéro (ou le lien) de suivi d'une commande.
  const updateTracking = async (id: string, value: string) => {
    const supabase = createClient();
    const v = value.trim() || null;
    await supabase.from('orders').update({ tracking_number: v }).eq('id', id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, tracking_number: v ?? undefined } : o)));
    toast('Numéro de suivi enregistré');
  };

  return (
    <div>
      <PageHeader
        title="Commandes"
        description={`${orders.length} commande${orders.length > 1 ? 's' : ''} reçue${orders.length > 1 ? 's' : ''} — cliquez sur une commande pour voir le détail`}
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
                const isOpen = expandedId === order.id;
                const items = itemsByOrder[order.id];
                return (
                  <FragmentRow key={order.id}>
                    <Tr isFirst={idx === 0} onClick={() => toggleDetail(order.id)}>
                      <Td>
                        <span className="inline-flex items-center gap-1.5">
                          {isOpen ? (
                            <ChevronDown size={14} style={{ color: 'var(--admin-text-faint)' }} />
                          ) : (
                            <ChevronRight size={14} style={{ color: 'var(--admin-text-faint)' }} />
                          )}
                          <span className="font-mono text-xs" style={{ color: 'var(--admin-text)' }}>
                            #{order.id.slice(0, 8)}
                          </span>
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
                        {/* Empêche le clic sur le menu de dérouler/replier la commande */}
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
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

                    {isOpen && (
                      <tr>
                        <td colSpan={6} style={{ background: 'var(--admin-bg)' }} className="px-5 py-4">
                          <OrderDetail
                            order={order}
                            items={items}
                            loading={loadingItems === order.id}
                            onSaveTracking={updateTracking}
                          />
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

/** Regroupe la ligne principale et sa ligne de détail sans casser le <tbody>. */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function OrderDetail({
  order,
  items,
  loading,
  onSaveTracking,
}: {
  order: Order;
  items: OrderItem[] | undefined;
  loading: boolean;
  onSaveTracking: (id: string, value: string) => void | Promise<void>;
}) {
  const addr = order.shipping_address;
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [savingTracking, setSavingTracking] = useState(false);

  const saveTracking = async () => {
    setSavingTracking(true);
    await onSaveTracking(order.id, tracking);
    setSavingTracking(false);
  };
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Articles commandés */}
      <div className="md:col-span-2">
        <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--admin-text-faint)' }}>
          Bijoux commandés
        </p>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>Chargement…</p>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0" style={{ background: 'var(--admin-hover)' }}>
                  {it.product_image && (
                    <Image src={it.product_image} alt={it.product_name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--admin-text)' }}>{it.product_name}</p>
                  <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                    Quantité : {it.quantity}
                  </p>
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                  {(it.price * it.quantity).toFixed(2)} €
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            Détail des articles indisponible pour cette commande.
          </p>
        )}

        {/* Récap montants */}
        <div className="mt-4 pt-4 border-t space-y-1 max-w-xs" style={{ borderColor: 'var(--admin-border)' }}>
          <Line label="Sous-total" value={order.subtotal ?? 0} />
          <Line label="Livraison" value={order.shipping_cost ?? 0} free={(order.shipping_cost ?? 0) === 0} />
          <div className="flex justify-between text-sm font-semibold pt-1" style={{ color: 'var(--admin-text)' }}>
            <span>Total</span>
            <span>{order.total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Adresse de livraison */}
      <div>
        <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: 'var(--admin-text-faint)' }}>
          Livraison
        </p>
        {addr && (addr.line1 || addr.city) ? (
          <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
            <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--admin-text-faint)' }} />
            <div className="leading-relaxed">
              <div>{order.customer_name}</div>
              <div>{addr.line1}</div>
              {addr.line2 && <div>{addr.line2}</div>}
              <div>{addr.postal_code} {addr.city}</div>
              <div>{addr.country}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            Adresse non renseignée.
          </p>
        )}
        <p className="text-xs mt-4" style={{ color: 'var(--admin-text-muted)' }}>
          {order.customer_email}
        </p>

        {/* Numéro / lien de suivi — utilisé dans l'e-mail « expédiée » */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <p className="text-[11px] uppercase tracking-wider mb-2 inline-flex items-center gap-1.5" style={{ color: 'var(--admin-text-faint)' }}>
            <Truck size={13} /> Suivi du colis
          </p>
          <Input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="N° de suivi ou lien (Colissimo, Mondial Relay…)"
          />
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={saveTracking} disabled={savingTracking}>
              {savingTracking ? 'Enregistrement…' : 'Enregistrer le suivi'}
            </Button>
          </div>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--admin-text-muted)' }}>
            Enregistre le suivi <strong>avant</strong> de passer la commande en « Expédiée » : il sera inclus dans l’e-mail envoyé à la cliente.
          </p>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, free }: { label: string; value: number; free?: boolean }) {
  return (
    <div className="flex justify-between text-sm" style={{ color: 'var(--admin-text-muted)' }}>
      <span>{label}</span>
      <span>{free ? 'Offerte' : `${value.toFixed(2)} €`}</span>
    </div>
  );
}
