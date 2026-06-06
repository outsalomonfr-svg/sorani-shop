'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Anime un chiffre de 0 à `value` quand l'élément entre dans le viewport.
 * Préserve les suffixes type "+", "k", "%", "★" etc.
 */
export default function CountUp({
  value,
  duration = 1600,
  className,
  style,
}: {
  value: string; // ex: "10k+", "1500", "48h", "100%", "4,9★"
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    if (!ref.current) return;

    // Extrait le nombre du début ("10k+" => 10, "4,9★" => 4.9)
    const match = value.match(/^([\d.,]+)(.*)$/);
    if (!match) {
      setDisplayed(value);
      return;
    }
    const target = parseFloat(match[1].replace(',', '.'));
    if (isNaN(target)) {
      setDisplayed(value);
      return;
    }
    const suffix = match[2];
    const hasDecimal = match[1].includes(',') || match[1].includes('.');
    const decimals = hasDecimal ? (match[1].split(/[,.]/)[1] || '').length : 0;

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (started) return;
        const entry = entries[0];
        if (entry.isIntersecting) {
          started = true;
          observer.disconnect();
          const start = performance.now();
          const animate = (t: number) => {
            const elapsed = t - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing : ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            const formatted = decimals
              ? current.toFixed(decimals).replace('.', ',')
              : Math.round(current).toString();
            setDisplayed(formatted + suffix);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {displayed}
    </span>
  );
}
