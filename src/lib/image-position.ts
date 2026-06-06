import type { ImagePosition } from '@/types/site-settings';

export function imagePositionStyle(pos?: ImagePosition): React.CSSProperties {
  const x = pos?.x ?? 50;
  const y = pos?.y ?? 50;
  const zoom = (pos?.zoom ?? 100) / 100;
  return {
    objectPosition: `${x}% ${y}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: zoom !== 1 ? `${x}% ${y}%` : undefined,
  };
}
