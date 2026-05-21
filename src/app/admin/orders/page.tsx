'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';

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

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: status as Order['status'] } : o)));
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Commandes</h1>
        <p className="text-gray-600">{orders.length} commande(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commande</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucune commande pour le moment
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="text-[#1B4965] hover:underline">
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>{order.customer_name}</div>
                    <div className="text-gray-500 text-xs">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{order.total.toFixed(2)} EUR</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">En attente</option>
                      <option value="paid">Payee</option>
                      <option value="processing">En preparation</option>
                      <option value="shipped">Expediee</option>
                      <option value="delivered">Livree</option>
                      <option value="cancelled">Annulee</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
