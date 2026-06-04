'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  PageHeader,
  Card,
  EmptyState,
  Table,
  THead,
  Th,
  Tr,
  Td,
  LoadingState,
} from '@/components/admin/ui';

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

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${customers.length} client${customers.length > 1 ? 's' : ''} ayant déjà commandé`}
      />

      <Card noPadding>
        {loading ? (
          <LoadingState />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun client"
            description="Tes premiers clients apparaîtront ici après leur première commande."
          />
        ) : (
          <Table>
            <THead>
              <Th>Client</Th>
              <Th>Email</Th>
              <Th>Commandes</Th>
              <Th>Total dépensé</Th>
              <Th>Dernière commande</Th>
            </THead>
            <tbody>
              {customers.map((customer, idx) => {
                const initial = (customer.name || customer.email)[0].toUpperCase();
                return (
                  <Tr key={customer.email} isFirst={idx === 0}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1B4965] text-white text-xs font-semibold flex items-center justify-center">
                          {initial}
                        </div>
                        <span style={{ color: 'var(--admin-text)' }}>{customer.name || '—'}</span>
                      </div>
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--admin-text-muted)' }}>{customer.email}</span>
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--admin-text)' }}>{customer.orders_count}</span>
                    </Td>
                    <Td>
                      <span className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {customer.total_spent.toFixed(2)} €
                      </span>
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--admin-text-muted)' }}>
                        {new Date(customer.last_order).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
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
