'use client';

import { useRef, useState, useEffect } from 'react';
import { Monitor, Smartphone, RotateCcw } from 'lucide-react';
import type { ImagePosition } from '@/types/site-settings';

type Props = {
  imageUrl?: string;
  value?: ImagePosition;
  onChange: (next: ImagePosition) => void;
  // Ratios disponibles pour l'aperçu
  desktopRatio?: number;
  mobileRatio?: number;
  label?: string;
};

const DEFAULT_VALUE: ImagePosition = { x: 50, y: 50, zoom: 100 };

export default function ImagePositionControl({
  imageUrl,
  value,
  onChange,
  desktopRatio = 16 / 9,
  mobileRatio = 9 / 16,
  label = "Recadrer l'image",
}: Props) {
  const v = { ...DEFAULT_VALUE, ...(value || {}) };
  const boxRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startVx: number; startVy: number; w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const onPointerDown = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    dragState.current = {
      startX: clientX,
      startY: clientY,
      startVx: v.x,
      startVy: v.y,
      w: rect.width,
      h: rect.height,
    };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (clientX: number, clientY: number) => {
      const s = dragState.current;
      if (!s) return;
      // 1 largeur de cadre de glissement = 100% de focal
      const dx = ((clientX - s.startX) / s.w) * 100;
      const dy = ((clientY - s.startY) / s.h) * 100;
      const nx = Math.max(0, Math.min(100, Math.round(s.startVx - dx)));
      const ny = Math.max(0, Math.min(100, Math.round(s.startVy - dy)));
      onChange({ ...v, x: nx, y: ny });
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onUp = () => {
      dragState.current = null;
      setDragging(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
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
    const delta = -e.deltaY * 0.2;
    const next = Math.max(100, Math.min(300, Math.round((v.zoom ?? 100) + delta)));
    onChange({ ...v, zoom: next });
  };

  const reset = () => onChange({ x: 50, y: 50, zoom: 100 });
  const ratio = device === 'desktop' ? desktopRatio : mobileRatio;
  const zoomScale = (v.zoom ?? 100) / 100;

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

      {/* Aperçu — image draggable */}
      <div
        ref={boxRef}
        className="relative w-full overflow-hidden rounded-md select-none"
        style={{
          aspectRatio: String(ratio),
          background: '#F5F4F0',
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
            objectPosition: `${v.x}% ${v.y}%`,
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: zoomScale !== 1 ? `${v.x}% ${v.y}%` : undefined,
            transition: dragging ? 'none' : 'object-position 0.15s ease, transform 0.15s ease',
          }}
        />

        {/* Grille tiers + bordure intérieure */}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)' }}>
          <div className="absolute left-1/3 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <div className="absolute left-2/3 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <div className="absolute top-1/3 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <div className="absolute top-2/3 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.25)' }} />
        </div>

        {/* Badge valeurs */}
        <div
          className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--admin-text-muted)' }}
        >
          {v.x}% · {v.y}% · {v.zoom ?? 100}%
        </div>
      </div>

      {/* Zoom slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--admin-text-muted)' }}>
            Zoom
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--admin-text-faint)' }}>
            {v.zoom ?? 100}%
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={300}
          step={1}
          value={v.zoom ?? 100}
          onChange={(e) => onChange({ ...v, zoom: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <p className="text-[10px]" style={{ color: 'var(--admin-text-faint)' }}>
        Glisse l&apos;image pour la repositionner · molette pour zoomer · bascule Desktop / Mobile pour vérifier les deux formats.
      </p>
    </div>
  );
}
