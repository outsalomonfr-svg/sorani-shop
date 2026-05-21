'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Clients', icon: Users },
  { href: '/admin/settings', label: 'Parametres', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B4965] text-white hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">SORANI Admin</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/20">
          <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <ArrowLeft size={16} />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile nav */}
        <div className="md:hidden bg-[#1B4965] text-white p-4 flex items-center justify-between">
          <h1 className="font-bold">SORANI Admin</h1>
          <Link href="/" className="text-sm text-gray-300">Retour au site</Link>
        </div>
        <div className="md:hidden bg-[#1B4965] px-4 pb-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  isActive ? 'bg-white text-[#1B4965]' : 'text-gray-300'
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
