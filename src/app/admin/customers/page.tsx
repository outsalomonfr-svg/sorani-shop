'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CustomerSummary {
  email: string;
  name: string;
  orders_count: number;
  total_spent: number;
  last_order: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const supabase = createClient();
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_email, customer_name, total, created_at')
        .order('created_at', { ascending: false });

      if (orders) {
        const grouped = new Map<string, CustomerSummary>();
        for (const order of orders) {
          const key = order.customer_email;
          if (!grouped.has(key)) {
            grouped.set(key, {
              email: order.customer_email,
              name: order.customer_name || '',
              orders_count: 0,
              total_spent: 0,
              last_order: order.created_at,
            });
          }
          const c = grouped.get(key)!;
          c.orders_count++;
          c.total_spent += order.total;
        }
        setCustomers(Array.from(grouped.values()));
      }
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <p className="text-gray-600">{customers.length} client(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commandes</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total depense</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Derniere commande</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Aucun client pour le moment
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{customer.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm">{customer.orders_count}</td>
                  <td className="px-6 py-4 text-sm font-medium">{customer.total_spent.toFixed(2)} EUR</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(customer.last_order).toLocaleDateString('fr-FR')}
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
