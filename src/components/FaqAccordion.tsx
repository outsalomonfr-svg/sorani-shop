'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { FaqItem } from '@/types/site-settings';

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (!items || items.length === 0) {
    return (
      <p className="text-center text-sm opacity-60 py-10">
        La FAQ sera bientôt disponible.
      </p>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              aria-expanded={isOpen}
            >
              <span
                className="text-base md:text-lg transition-colors"
                style={{ fontFamily: 'var(--font-product)', color: isOpen ? 'var(--brand-blue)' : 'inherit' }}
              >
                {item.question}
              </span>
              <Plus
                size={18}
                strokeWidth={1.5}
                className="shrink-0 transition-transform duration-300"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', color: 'var(--brand-blue)' }}
              />
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="text-[15px] leading-[1.8] opacity-75 pb-6 pr-8 whitespace-pre-line">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
