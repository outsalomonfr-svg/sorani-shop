'use client';

import { Star } from 'lucide-react';

export default function Stars({
  rating,
  onChange,
  size = 14,
}: {
  rating: number;
  onChange?: (r: number) => void;
  size?: number;
}) {
  const interactive = !!onChange;
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i)}
            disabled={!interactive}
            className={`p-0 ${interactive ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            style={{ background: 'transparent' }}
            aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              strokeWidth={1.5}
              fill={filled ? 'currentColor' : 'none'}
              style={{ color: filled ? 'var(--brand-blue)' : '#9CA3AF' }}
            />
          </button>
        );
      })}
    </div>
  );
}
