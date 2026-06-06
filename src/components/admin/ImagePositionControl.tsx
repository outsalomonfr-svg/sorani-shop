'use client';

import { useRef, useState, useEffect } from 'react';
import { Monitor, Smartphone, RotateCcw } from 'lucide-react';
import type { ImagePosition } from '@/types/site-settings';

type Props = {
  imageUrl?: string;
  value?: ImagePosition;
  onChange: (next: ImagePosition) => void;
  desktopRatio?: number;
  mobileRatio?: number;
  label?: string;
};

const DEFAULT: Required<Pick<ImagePosition, 'offsetX' | 'offsetY' | 'zoom'>> = {
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
};

export default function ImagePositionControl({
  imageUrl,
  value,
  onChange,
  desktopRatio = 16 / 9,
  mobileRatio = 9 / 16,
  label = "Recadrer l'image",
}: Props) {
  const offsetX = value?.offsetX ?? DEFAULT.offsetX;
  const offsetY = value?.offsetY ?? DEFAULT.offsetY;
  const zoom = value?.zoom ?? DEFAULT.zoom;

  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startOx: number; startOy: number; w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const onPointerDown = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startOx: offsetX,
      startOy: offsetY,
      w: rect.width,
      h: rect.height,
    };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (clientX: number, clientY: number) => {
      const s = dragRef.current;
      if (!s) return;
      // 1 pixel de drag = 1 pixel de déplacement de l'image
      // 1 largeur de cadre = 100% d'offsetX
      const dxPct = ((clientX - s.startX) / s.w) * 100;
      const dyPct = ((clientY - s.startY) / s.h) * 100;
      onChange({
        ...(value || {}),
        offsetX: Math.round(s.startOx + dxPct),
        offsetY: Math.round(s.startOy + dyPct),
        zoom,
      });
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    };
    const onUp = () => {
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    const next = Math.max(1, Math.min(4, +(zoom + delta).toFixed(2)));
    onChange({ ...(value || {}), offsetX, offsetY, zoom: next });
  };

  const reset = () => onChange({ offsetX: 0, offsetY: 0, zoom: 1 });
  const ratio = device === 'desktop' ? desktopRatio : mobileRatio;

  if (!imageUrl) {
    return (
      <p className="text-[11px]" style={{ color: 'var(--admin-text-faint)' }}>
        Ajoute d&apos;abord une image pour pouvoir la recadrer.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          {label}
        </label>
        <div className="flex items-center gap-1">
          <div
            className="flex p-0.5 rounded"
            style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
          >
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className="p-1 rounded transition"
              style={{
                background: device === 'desktop' ? 'var(--brand-blue)' : 'transparent',
                color: device === 'desktop' ? 'white' : 'var(--admin-text-muted)',
              }}
              title="Aperçu desktop"
            >
              <Monitor size={11} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className="p-1 rounded transition"
              style={{
                background: device === 'mobile' ? 'var(--brand-blue)' : 'transparent',
                color: device === 'mobile' ? 'white' : 'var(--admin-text-muted)',
              }}
              title="Aperçu mobile"
            >
              <Smartphone size={11} strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="p-1 rounded hover:opacity-70 transition"
            style={{
              color: 'var(--admin-text-muted)',
              border: '1px solid var(--admin-border)',
              background: 'var(--admin-bg)',
            }}
            title="Recentrer"
          >
            <RotateCcw size={11} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        className="relative w-full overflow-hidden rounded-md select-none"
        style={{
          aspectRatio: String(ratio),
          background: '#1A1A1A',
          border: '1px solid var(--admin-border)',
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onPointerDown(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) onPointerDown(t.clientX, t.clientY);
        }}
        onWheel={onWheel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            objectFit: 'cover',
            transform: `translate(${offsetX}%, ${offsetY}%) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.12s ease',
          }}
        />

        {/* Grille des tiers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div className="absolute left-2/3 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div className="absolute top-1/3 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div className="absolute top-2/3 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>

        <div
          className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--admin-text-muted)' }}
        >
          {offsetX > 0 ? '+' : ''}{offsetX}% · {offsetY > 0 ? '+' : ''}{offsetY}% · ×{zoom.toFixed(2)}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--admin-text-muted)' }}>
            Zoom
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--admin-text-faint)' }}>
            ×{zoom.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => onChange({ ...(value || {}), offsetX, offsetY, zoom: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <p className="text-[10px]" style={{ color: 'var(--admin-text-faint)' }}>
        Glisse l&apos;image dans n&apos;importe quelle direction · molette pour zoomer · bascule Desktop / Mobile pour vérifier les deux formats.
      </p>
    </div>
  );
}
