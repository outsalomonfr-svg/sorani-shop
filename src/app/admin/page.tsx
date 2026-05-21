'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';

interface Stats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

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
          .slice(0, 10)
      );

      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Chiffre d\'affaires', value: `${stats.revenue.toFixed(2)} EUR`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Commandes', value: stats.orders.toString(), icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Clients', value: stats.customers.toString(), icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Produits', value: stats.products.toString(), icon: Package, color: 'bg-orange-50 text-orange-600' },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Bienvenue sur votre espace admin SORANI</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <TrendingUp size={16} />
          <span>En ligne</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-600 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Commandes recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande pour le moment
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name || order.customer_email}</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.total.toFixed(2)} EUR</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
