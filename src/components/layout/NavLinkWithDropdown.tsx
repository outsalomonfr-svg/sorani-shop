'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavLink } from '@/types/site-settings';

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

  const hasChildren = Boolean(link.children && link.children.length > 0);

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className="link-underline text-[10px] uppercase tracking-[0.32em] hover:opacity-70 transition-colors"
        style={{ color: textColor, fontWeight: 400 }}
      >
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
        className="link-underline inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.32em] hover:opacity-70 transition-colors"
        style={{ color: textColor, fontWeight: 400 }}
      >
        {link.label}
        <ChevronDown size={10} strokeWidth={1.5} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }} />
      </Link>

      {/* Dropdown */}
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
        <div
          className="py-3"
          style={{
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          }}
        >
          {link.children!.map((child) => (
            <Link
              key={child.href + child.label}
              href={child.href}
              className="block px-6 py-2.5 text-[11px] uppercase tracking-[0.28em] hover:opacity-60 transition-opacity whitespace-nowrap"
              style={{ color: '#374151', fontWeight: 400 }}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
