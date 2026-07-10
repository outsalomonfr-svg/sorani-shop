'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { NavLink, NavSubLink } from '@/types/site-settings';

const LINK_BASE =
  'text-[12px] uppercase tracking-[0.16em] whitespace-nowrap transition-opacity duration-300 pb-1';

const PANEL_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
  borderRadius: '16px',
};

/* ---------- Sub-item with optional flyout (level 2 → 3) ---------- */
function SubItem({ item }: { item: NavSubLink }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const hasGrandchildren = Boolean(item.children && item.children.length > 0);

  if (!hasGrandchildren) {
    return (
      <Link
        href={item.href}
        className="block mx-1.5 px-4 py-2 rounded-lg text-[12px] tracking-[0.06em] transition-colors whitespace-nowrap nav-drop-link"
        style={{ color: '#374151', fontWeight: 450 }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={item.href}
        className="mx-1.5 px-4 py-2 rounded-lg text-[12px] tracking-[0.06em] whitespace-nowrap flex items-center justify-between gap-3 nav-drop-link"
        style={{ color: '#374151', fontWeight: 450 }}
      >
        <span>{item.label}</span>
        <ChevronRight size={12} strokeWidth={1.5} style={{ opacity: 0.5 }} />
      </Link>

      {/* Flyout to the right */}
      <div
        className="absolute left-full top-0 pl-2 transition-all duration-200"
        style={{
          opacity: open ? 1 : 0,
          transform: `translateX(${open ? '0' : '-6px'})`,
          pointerEvents: open ? 'auto' : 'none',
          minWidth: '220px',
        }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className="py-2" style={PANEL_STYLE}>
          {item.children!.map((g) => (
            <Link
              key={g.href + g.label}
              href={g.href}
              className="block mx-1.5 px-4 py-2 rounded-lg text-[12px] tracking-[0.06em] transition-colors whitespace-nowrap nav-drop-link"
              style={{ color: '#374151', fontWeight: 450 }}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Top-level link with dropdown (level 1 → 2) ---------- */
export default function NavLinkWithDropdown({
  link,
  textColor,
}: {
  link: NavLink;
  textColor: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const pathname = usePathname();
  const hrefPath = link.href.split('?')[0];
  const active = hrefPath !== '/' && (pathname === hrefPath || pathname.startsWith(hrefPath + '/'));

  const pillClass = `${LINK_BASE} ${active ? '' : 'link-underline hover:opacity-60'}`;
  const pillStyle: React.CSSProperties = active
    ? { color: 'var(--brand-blue)', fontWeight: 500, borderBottom: '1.5px solid var(--brand-blue)' }
    : { color: textColor, fontWeight: 450 };

  const hasChildren = Boolean(link.children && link.children.length > 0);

  if (!hasChildren) {
    return (
      <Link href={link.href} className={pillClass} style={pillStyle}>
        {link.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={link.href}
        className={`${pillClass} inline-flex items-center gap-1`}
        style={pillStyle}
      >
        {link.label}
        <ChevronDown
          size={10}
          strokeWidth={1.5}
          style={{
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        />
      </Link>

      <div
        className="absolute left-1/2 top-full -translate-x-1/2 mt-3 transition-all duration-300"
        style={{
          opacity: open ? 1 : 0,
          transform: `translateX(-50%) translateY(${open ? '0' : '-6px'})`,
          pointerEvents: open ? 'auto' : 'none',
          minWidth: '220px',
        }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className="py-2" style={PANEL_STYLE}>
          {link.children!.map((child) => (
            <SubItem key={child.href + child.label} item={child} />
          ))}
        </div>
      </div>
    </div>
  );
}
