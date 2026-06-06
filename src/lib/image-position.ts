import type { ImagePosition } from '@/types/site-settings';

// Renvoie le style à appliquer sur un <img> (ou <Image>) dans un cadre overflow:hidden
// pour le déplacer/zoomer selon les réglages éditeur.
export function imagePositionStyle(pos?: ImagePosition): React.CSSProperties {
  const offsetX = pos?.offsetX ?? 0;
  const offsetY = pos?.offsetY ?? 0;
  const zoom = pos?.zoom ?? 1;
  const safeZoom = zoom >= 1 ? zoom : 1;
  return {
    transform: `translate(${offsetX}%, ${offsetY}%) scale(${safeZoom})`,
    transformOrigin: 'center center',
  };
}
