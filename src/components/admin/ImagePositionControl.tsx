'use client';

import { useRef, useState, useEffect } from 'react';
import type { ImagePosition } from '@/types/site-settings';

type Props = {
  imageUrl?: string;
  value?: ImagePosition;
  onChange: (next: ImagePosition) => void;
  // Ratio du cadre d'aperçu (par défaut paysage hero)
  aspectRatio?: number; // largeur / hauteur
  label?: string;
};

const DEFAULT_VALUE: ImagePosition = { x: 50, y: 50, zoom: 100 };

export default function ImagePositionControl({
  imageUrl,
  value,
  onChange,
  aspectRatio = 16 / 9,
  label = 'Recadrage de l\'image',
}: Props) {
  const v = { ...DEFAULT_VALUE, ...(value || {}) };
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const setFromEvent = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    onChange({ ...v, x: Math.round(x), y: Math.round(y) });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => setFromEvent(e.clientX, e.clientY);
    const onUp = () => setDragging(false);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setFromEvent(t.clientX, t.clientY);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, v.x, v.y, v.zoom]);

  const reset = () => onChange({ x: 50, y: 50, zoom: 100 });

  if (!imageUrl) {
    return (
      <p className="text-[11px]" style={{ color: 'var(--admin-text-faint)' }}>
        Ajoute d&apos;abord une image pour pouvoir la recadrer.
      </p>
    );
  }

  const zoomScale = (v.zoom ?? 100) / 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          {label}
        </label>
        <button
          type="button"
          onClick={reset}
          className="text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
          style={{ color: 'var(--admin-text-faint)' }}
        >
          Recentrer
        </button>
      </div>

      {/* Aperçu avec point focal */}
      <div
        ref={boxRef}
        className="relative w-full overflow-hidden rounded-md cursor-crosshair select-none"
        style={{
          aspectRatio: String(aspectRatio),
          background: '#F5F4F0',
          border: '1px solid var(--admin-border)',
        }}
        onMouseDown={(e) => {
          setDragging(true);
          setFromEvent(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          setDragging(true);
          const t = e.touches[0];
          if (t) setFromEvent(t.clientX, t.clientY);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            objectFit: 'cover',
            objectPosition: `${v.x}% ${v.y}%`,
            transform: `scale(${zoomScale})`,
            transformOrigin: `${v.x}% ${v.y}%`,
            transition: dragging ? 'none' : 'transform 0.2s, object-position 0.2s',
          }}
        />

        {/* Point focal */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${v.x}%`,
            top: `${v.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{
              background: 'white',
              border: '2px solid var(--brand-blue)',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.25)',
            }}
          />
        </div>

        {/* Indication */}
        <div
          className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded"
          style={{
            background: 'rgba(255,255,255,0.92)',
            color: 'var(--admin-text-muted)',
          }}
        >
          {v.x}% · {v.y}%
        </div>
      </div>

      {/* Zoom slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--admin-text-muted)' }}
          >
            Zoom
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--admin-text-faint)' }}>
            {v.zoom ?? 100}%
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={250}
          step={1}
          value={v.zoom ?? 100}
          onChange={(e) => onChange({ ...v, zoom: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <p className="text-[10px]" style={{ color: 'var(--admin-text-faint)' }}>
        Clique ou glisse sur l&apos;aperçu pour choisir le point qui doit rester visible.
      </p>
    </div>
  );
}
