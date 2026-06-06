'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ArrowUpRight,
  LogOut,
  Palette,
  ChevronDown,
  Search,
  Sparkles,
  FileText,
  Tag,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ToastProvider } from '@/components/admin/Toast';
import CommandPalette from '@/components/admin/CommandPalette';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: 'Vue d’ensemble',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Boutique',
    items: [
      { href: '/admin/products', label: 'Produits', icon: Package },
      { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Clients', icon: Users },
      { href: '/admin/promos', label: 'Codes promo', icon: Tag },
    ],
  },
  {
    title: 'Contenu',
    items: [
      { href: '/admin/pages', label: 'Pages', icon: FileText },
    ],
  },
  {
    title: 'Personnalisation',
    items: [
      { href: '/admin/customize', label: 'Apparence', icon: Palette },
      { href: '/admin/settings', label: 'Paramètres', icon: Settings },
    ],
  },
];

const allItems = sections.flatMap((s) => s.items);

function breadcrumbFromPath(path: string): string {
  const item = allItems.find((i) => i.href === path);
  if (item) return item.label;
  if (path.startsWith('/admin/products')) return 'Produits';
  if (path.startsWith('/admin/orders')) return 'Commandes';
  if (path.startsWith('/admin/customers')) return 'Clients';
  if (path.startsWith('/admin/customize')) return 'Apparence';
  if (path.startsWith('/admin/settings')) return 'Paramètres';
  return 'Admin';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin';
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; full_name?: string; avatar_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, avatar_url')
        .eq('id', authUser.id)
        .single();
      setUser({
        email: profile?.email ?? authUser.email,
        full_name: profile?.full_name ?? undefined,
        avatar_url: profile?.avatar_url ?? undefined,
      });
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg)' }}>
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Chargement de l’espace admin…</span>
        </div>
      </div>
    );
  }

  const initial = (user?.full_name || user?.email || 'S')[0].toUpperCase();
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <ToastProvider>
    <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    <div className="flex min-h-screen" style={{ background: 'var(--admin-bg)' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-60 flex-col border-r"
        style={{ background: 'var(--admin-sidebar)', borderColor: 'var(--admin-border)' }}
      >
        {/* Workspace switcher */}
        <div className="px-3 py-3">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-black/[0.04] transition group"
          >
            <div className="w-6 h-6 rounded-md bg-[#1B4965] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
              S
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                SORANI
              </p>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--admin-text-faint)' }} />
          </button>

          {userMenuOpen && (
            <div
              className="mt-1 p-1 rounded-lg animate-slide-in-right"
              style={{
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                boxShadow: 'var(--shadow-pop)',
              }}
            >
              <div className="px-2 py-2 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                <p className="text-xs truncate" style={{ color: 'var(--admin-text-muted)' }}>
                  {user?.email}
                </p>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-black/[0.04]"
                style={{ color: 'var(--admin-text)' }}
              >
                <ArrowUpRight size={14} />
                <span>Voir le site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-black/[0.04]"
                style={{ color: 'var(--admin-text)' }}
              >
                <LogOut size={14} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-black/[0.04] transition text-left"
            style={{ color: 'var(--admin-text-muted)' }}
          >
            <Search size={14} />
            <span className="text-sm flex-1">Rechercher</span>
            <kbd
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--admin-hover)', color: 'var(--admin-text-faint)' }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-2 admin-scroll overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <div
                className="px-2 mb-1 text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--admin-text-faint)' }}
              >
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition"
                      style={{
                        background: isActive ? 'var(--admin-hover)' : 'transparent',
                        color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      <item.icon size={16} style={{ color: isActive ? 'var(--brand-blue)' : 'currentColor' }} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt="" width={24} height={24} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#1B4965] text-white text-xs font-semibold flex items-center justify-center">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: 'var(--admin-text)' }}>
                {displayName}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="h-12 flex items-center justify-between px-4 md:px-6 border-b sticky top-0 z-10 backdrop-blur"
          style={{
            background: 'rgba(251, 251, 250, 0.85)',
            borderColor: 'var(--admin-border)',
          }}
        >
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: 'var(--admin-text-faint)' }}>Admin</span>
            <span style={{ color: 'var(--admin-text-faint)' }}>/</span>
            <span style={{ color: 'var(--admin-text)', fontWeight: 500 }}>
              {breadcrumbFromPath(pathname)}
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition"
            style={{ color: 'var(--admin-text-muted)' }}
          >
            <Sparkles size={12} />
            <span>Voir le site</span>
            <ArrowUpRight size={12} />
          </Link>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden border-b px-4 py-2 flex gap-1.5 overflow-x-auto admin-scroll" style={{ borderColor: 'var(--admin-border)' }}>
          {allItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition"
                style={{
                  background: isActive ? 'var(--admin-hover)' : 'transparent',
                  color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <item.icon size={13} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto admin-scroll">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
