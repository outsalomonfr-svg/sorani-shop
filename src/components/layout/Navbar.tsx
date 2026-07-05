'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, Search, User, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import { useNavCategories } from '@/components/settings/CategoriesProvider';
import NavLinkWithDropdown from './NavLinkWithDropdown';
import type { NavLink } from '@/types/site-settings';

function resolveChildren(
  link: NavLink,
  categories: { slug: string; name: string }[]
): NavLink {
  if (link.childrenSource === 'categories') {
    return {
      ...link,
      children: categories.map((c) => ({
        label: c.name,
        href: `/shop?category=${c.slug}`,
      })),
    };
  }
  return link;
}

/* ============================================================ */
function MobileSubItem({
  item,
  textColor,
  onNavigate,
}: {
  item: import('@/types/site-settings').NavSubLink;
  textColor: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasGrandchildren = Boolean(item.children && item.children.length > 0);

  if (!hasGrandchildren) {
    return (
      <Link
        href={item.href}
        className="text-[12px] uppercase tracking-[0.08em] opacity-70 py-1"
        style={{ fontWeight: 400, color: textColor }}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between py-1">
        <Link
          href={item.href}
          className="text-[12px] uppercase tracking-[0.08em] opacity-70 flex-1"
          style={{ fontWeight: 400, color: textColor }}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-1"
          style={{ color: textColor, opacity: 0.7 }}
          aria-label="Sous-niveau"
        >
          <ChevronDown
            size={12}
            strokeWidth={1.5}
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
          />
        </button>
      </div>
      {open && (
        <div className="pl-4 pb-2 flex flex-col gap-2">
          {item.children!.map((g, i) => (
            <Link
              key={g.href + i}
              href={g.href}
              className="text-[11px] uppercase tracking-[0.06em] opacity-60 py-0.5"
              style={{ fontWeight: 400, color: textColor }}
              onClick={onNavigate}
            >
              {g.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNavItem({
  link,
  textColor,
  onNavigate,
}: {
  link: import('@/types/site-settings').NavLink;
  textColor: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(link.children && link.children.length > 0);

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className="text-[13px] uppercase tracking-[0.12em] py-3 px-4 rounded-xl nav-pill"
        style={{ fontWeight: 400, color: textColor }}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between py-3 px-4 rounded-xl nav-pill">
        <Link
          href={link.href}
          className="text-[13px] uppercase tracking-[0.12em] flex-1"
          style={{ fontWeight: 400, color: textColor }}
          onClick={onNavigate}
        >
          {link.label}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-1"
          style={{ color: textColor }}
          aria-label="Sous-menu"
        >
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
          />
        </button>
      </div>
      {open && (
        <div className="pl-4 pb-2 flex flex-col gap-3">
          {link.children!.map((child, i) => (
            <MobileSubItem
              key={child.href + i}
              item={child}
              textColor={textColor}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const settings = useSiteSettings();
  const categories = useNavCategories();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openCart, totalItems } = useCart();
  const itemCount = totalItems();

  // Defaults
  const layout = settings.nav.layout ?? 'two-row';
  const bg = settings.nav.background ?? 'glass';
  const sticky = settings.nav.sticky ?? true;
  const showSearch = settings.nav.showSearch ?? true;
  const showAccount = settings.nav.showAccount ?? true;
  const showCart = settings.nav.showCart ?? true;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visibleLinks = settings.nav.links
    .filter((l) => l.visible !== false)
    .map((l) => resolveChildren(l, categories));

  const bgStyle: React.CSSProperties = (() => {
    const customBg = settings.nav.bgColor;
    if (bg === 'glass') {
      return {
        background: customBg ? `${customBg}E6` : 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      };
    }
    if (bg === 'solid') {
      return { background: customBg || '#FFFFFF' };
    }
    return { background: scrolled ? (customBg ? `${customBg}E6` : 'rgba(255,255,255,0.94)') : 'transparent', backdropFilter: scrolled ? 'blur(14px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none' };
  })();

  const textColor = settings.nav.textColor || (bg === 'transparent' && !scrolled ? '#FFFFFF' : '#374151');

  const renderIcons = () => (
    <div className="flex items-center gap-5">
      {showSearch && (
        <button className="p-1 transition-colors" style={{ color: textColor }} aria-label="Recherche">
          <Search size={16} strokeWidth={1.5} />
        </button>
      )}
      {showAccount && (
        <Link href="/login" className="p-1 transition-colors hidden sm:inline-block" style={{ color: textColor }} aria-label="Compte">
          <User size={16} strokeWidth={1.5} />
        </Link>
      )}
      {showCart && (
        <button onClick={openCart} className="relative p-1 transition-colors" style={{ color: textColor }} aria-label="Panier">
          <ShoppingBag size={16} strokeWidth={1.5} />
          {itemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-medium"
              style={{ background: 'var(--brand-blue)' }}
            >
              {itemCount}
            </span>
          )}
        </button>
      )}
    </div>
  );

  const logoElement = (
    <Link
      href="/"
      className="flex items-center px-4"
      style={{ justifyContent: layout === 'two-row' || layout === 'single-row-center' ? 'center' : 'flex-start' }}
      data-sorani-edit="brand"
      data-sorani-label="Logo / nom de la marque"
    >
      {settings.brand.logoUrl ? (
        <Image
          src={settings.brand.logoUrl}
          alt={settings.brand.name}
          width={140}
          height={42}
          className="w-auto transition-all duration-500"
          style={{ height: scrolled ? '24px' : '32px' }}
        />
      ) : (
        <span
          className="tracking-[0.42em] uppercase whitespace-nowrap transition-all duration-500"
          style={{
            color: 'var(--brand-blue)',
            fontFamily: 'var(--font-heading)',
            fontSize: scrolled ? '14px' : '17px',
            fontWeight: 400,
          }}
        >
          {settings.brand.name}
        </span>
      )}
    </Link>
  );

  const navLinks = (
    <nav
      className="flex items-center gap-10 lg:gap-12"
      style={{ fontFamily: 'var(--font-nav)' }}
      data-sorani-edit="nav"
      data-sorani-label="Menu de navigation"
    >
      {visibleLinks.map((link, i) => (
        <NavLinkWithDropdown key={link.href + i} link={link} textColor={textColor} />
      ))}
    </nav>
  );

  return (
    <>
      {settings.announcement.enabled && settings.announcement.text && (
        <div
          className="text-white text-center text-[10px] uppercase tracking-[0.32em] py-2.5 px-4"
          style={{ background: 'var(--brand-blue)' }}
          data-sorani-edit="announcement"
          data-sorani-label="Barre d'annonce"
        >
          {settings.announcement.link ? (
            <Link href={settings.announcement.link} className="hover:opacity-80 transition-opacity">
              {settings.announcement.text}
            </Link>
          ) : (
            settings.announcement.text
          )}
        </div>
      )}

      <header
        className={`${sticky ? 'sticky top-0' : 'relative'} z-50 transition-all duration-500`}
        style={{
          ...bgStyle,
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* TWO-ROW LAYOUT (logo top, nav below) */}
          {layout === 'two-row' && (
            <>
              <div
                className="relative grid items-center transition-all duration-500"
                style={{ gridTemplateColumns: '1fr auto 1fr', height: scrolled ? '56px' : '76px' }}
              >
                <div className="flex items-center justify-start">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="sm:hidden p-1.5 -ml-1.5"
                    style={{ color: textColor }}
                    aria-label="Menu"
                  >
                    {isMenuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
                  </button>
                </div>
                {logoElement}
                <div className="flex justify-end">{renderIcons()}</div>
              </div>
              {visibleLinks.length > 0 && (
                <div
                  className="hidden sm:flex justify-center overflow-hidden transition-all duration-500"
                  style={{
                    height: scrolled ? '0px' : '40px',
                    opacity: scrolled ? 0 : 1,
                    pointerEvents: scrolled ? 'none' : 'auto',
                  }}
                >
                  <div className="pb-3">{navLinks}</div>
                </div>
              )}
            </>
          )}

          {/* SINGLE-ROW LEFT (logo left, nav center, icons right) */}
          {layout === 'single-row-left' && (
            <div
              className="grid items-center transition-all duration-500 gap-8"
              style={{ gridTemplateColumns: 'auto 1fr auto', height: scrolled ? '60px' : '80px' }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="sm:hidden p-1.5"
                  style={{ color: textColor }}
                  aria-label="Menu"
                >
                  {isMenuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
                </button>
                {logoElement}
              </div>
              <div className="hidden sm:flex justify-center">{navLinks}</div>
              <div className="flex justify-end">{renderIcons()}</div>
            </div>
          )}

          {/* SINGLE-ROW CENTER (logo center, nav split around) */}
          {layout === 'single-row-center' && (
            <div
              className="grid items-center transition-all duration-500"
              style={{ gridTemplateColumns: '1fr auto 1fr', height: scrolled ? '60px' : '80px' }}
            >
              <div className="hidden sm:flex justify-start">
                <nav
                  className="flex items-center gap-8"
                  style={{ fontFamily: 'var(--font-nav)' }}
                  data-sorani-edit="nav"
                  data-sorani-label="Menu de navigation"
                >
                  {visibleLinks.slice(0, Math.ceil(visibleLinks.length / 2)).map((link, i) => (
                    <NavLinkWithDropdown key={link.href + i} link={link} textColor={textColor} />
                  ))}
                </nav>
              </div>
              <div className="sm:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 -ml-1.5"
                  style={{ color: textColor }}
                  aria-label="Menu"
                >
                  {isMenuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {logoElement}
              <div className="flex items-center justify-end gap-6">
                <nav
                  className="hidden sm:flex items-center gap-8"
                  style={{ fontFamily: 'var(--font-nav)' }}
                >
                  {visibleLinks.slice(Math.ceil(visibleLinks.length / 2)).map((link, i) => (
                    <NavLinkWithDropdown key={link.href + i} link={link} textColor={textColor} />
                  ))}
                </nav>
                {renderIcons()}
              </div>
            </div>
          )}

          {/* Mobile menu drawer */}
          {isMenuOpen && (
            <div
              className="sm:hidden pb-8 pt-2"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <nav
                className="flex flex-col gap-2 pt-6"
                style={{ fontFamily: 'var(--font-nav)' }}
              >
                {visibleLinks.map((link, i) => (
                  <MobileNavItem
                    key={link.href + i}
                    link={link}
                    textColor={textColor}
                    onNavigate={() => setIsMenuOpen(false)}
                  />
                ))}
                {showAccount && (
                  <Link
                    href="/login"
                    className="text-[13px] uppercase tracking-[0.12em] pt-5 mt-3 block"
                    style={{ fontWeight: 400, color: textColor, borderTop: '1px solid rgba(0,0,0,0.06)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon compte
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
