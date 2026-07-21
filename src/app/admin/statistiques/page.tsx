'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users, Eye, Smartphone, Globe, TrendingUp, Share2, BarChart3 } from 'lucide-react';

type Entry = { label: string; count: number };
type Win = { views: number; visitors: number };
type Stats = {
  days: number;
  today: Win;
  last7: Win;
  period: Win;
  daily: { date: string; views: number; visitors: number }[];
  sources: Entry[];
  pages: Entry[];
  devices: Entry[];
  countries: Entry[];
};

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Accès direct',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
  google: 'Google',
  bing: 'Bing',
  duckduckgo: 'DuckDuckGo',
  yahoo: 'Yahoo',
  newsletter: 'Newsletter',
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Téléphone',
  tablette: 'Tablette',
  desktop: 'Ordinateur',
};

/** Drapeau emoji a partir du code pays (FR -> 🇫🇷). */
function flag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

/** Nom du pays en francais, pour n'importe quel code (pas de liste a maintenir). */
function countryName(code: string): string {
  try {
    const name = new Intl.DisplayNames(['fr'], { type: 'region' }).of(code.toUpperCase());
    if (name && name !== code.toUpperCase()) return `${flag(code)} ${name}`;
  } catch {
    /* code inconnu : on retombe sur le code brut */
  }
  return code;
}

const PERIODS = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
];

function Card({
  icon: Icon,
  title,
  visitors,
  views,
  accent,
}: {
  icon: typeof Users;
  title: string;
  visitors: number;
  views: number;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} style={{ color: accent ? 'var(--brand-blue)' : 'var(--admin-text-faint)' }} />
        <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
          {title}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
          {visitors}
        </span>
        <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
          {visitors > 1 ? 'visiteurs' : 'visiteur'}
        </span>
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--admin-text-faint)' }}>
        {views} {views > 1 ? 'pages vues' : 'page vue'}
      </p>
    </div>
  );
}

function Ranking({
  icon: Icon,
  title,
  entries,
  labels,
  format,
  unit,
  empty,
}: {
  icon: typeof Users;
  title: string;
  entries: Entry[];
  labels?: Record<string, string>;
  format?: (label: string) => string;
  unit: string;
  empty: string;
}) {
  const max = Math.max(1, ...entries.map((e) => e.count));
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} style={{ color: 'var(--admin-text-faint)' }} />
        <h2 className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
          {title}
        </h2>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--admin-text-faint)' }}>
          {empty}
        </p>
      ) : (
        <div className="space-y-2.5">
          {entries.map((e) => (
            <div key={e.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="truncate pr-3" style={{ color: 'var(--admin-text)' }}>
                  {labels?.[e.label] || format?.(e.label) || e.label}
                </span>
                <span className="shrink-0 tabular-nums" style={{ color: 'var(--admin-text-muted)' }}>
                  {e.count} {unit}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--admin-hover)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(e.count / max) * 100}%`,
                    background: e.label === 'instagram' ? '#E1306C' : 'var(--brand-blue)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatistiquesPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?days=${d}`);
      if (!res.ok) throw new Error(res.status === 500 ? 'table' : 'auth');
      setStats(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  const maxDaily = stats ? Math.max(1, ...stats.daily.map((d) => d.visitors)) : 1;
  const noData = stats && stats.period.views === 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--admin-text)' }}>
            Statistiques
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
            Fréquentation de ta boutique — mesure anonyme, sans cookie.
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--admin-hover)' }}>
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className="text-xs px-3 py-1.5 rounded-md transition"
              style={{
                background: days === p.days ? 'var(--admin-surface)' : 'transparent',
                color: days === p.days ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                fontWeight: days === p.days ? 500 : 400,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          Chargement…
        </p>
      )}

      {error === 'table' && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: '#FFF4E5', border: '1px solid #F5D9A8', color: '#9A5A00' }}
        >
          La table des statistiques n’existe pas encore en base. Lance la migration
          <code className="mx-1 px-1 rounded" style={{ background: 'rgba(0,0,0,0.06)' }}>
            supabase-migration-11-analytics.sql
          </code>
          dans Supabase, puis recharge cette page.
        </div>
      )}

      {stats && !loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Card icon={TrendingUp} title="Aujourd’hui" visitors={stats.today.visitors} views={stats.today.views} accent />
            <Card icon={Users} title="7 derniers jours" visitors={stats.last7.visitors} views={stats.last7.views} />
            <Card icon={Eye} title={`${stats.days} derniers jours`} visitors={stats.period.visitors} views={stats.period.views} />
          </div>

          {noData ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
            >
              <BarChart3 size={28} style={{ color: 'var(--admin-text-faint)' }} className="mx-auto mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Aucune visite enregistrée pour l’instant
              </p>
              <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                Les statistiques apparaîtront dès les premières visites sur le site.
              </p>
            </div>
          ) : (
            <>
              {/* Courbe des visiteurs par jour */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
              >
                <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--admin-text)' }}>
                  Visiteurs par jour
                </h2>
                <div className="flex items-end gap-[3px]" style={{ height: 120 }}>
                  {stats.daily.map((d) => (
                    <div
                      key={d.date}
                      className="flex-1 rounded-t-sm transition-all"
                      title={`${new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${d.visitors} visiteur(s), ${d.views} page(s) vue(s)`}
                      style={{
                        height: `${Math.max(2, (d.visitors / maxDaily) * 100)}%`,
                        background: d.visitors > 0 ? 'var(--brand-blue)' : 'var(--admin-hover)',
                        opacity: d.visitors > 0 ? 0.85 : 1,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[11px]" style={{ color: 'var(--admin-text-faint)' }}>
                  <span>
                    {new Date(stats.daily[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                  <span>Aujourd’hui</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Ranking
                  icon={Share2}
                  title="D’où viennent tes visiteurs"
                  entries={stats.sources}
                  labels={SOURCE_LABELS}
                  unit="visiteurs"
                  empty="Aucune provenance enregistrée."
                />
                <Ranking
                  icon={Eye}
                  title="Pages les plus vues"
                  entries={stats.pages}
                  unit="vues"
                  empty="Aucune page vue."
                />
                <Ranking
                  icon={Smartphone}
                  title="Appareils"
                  entries={stats.devices}
                  labels={DEVICE_LABELS}
                  unit="visiteurs"
                  empty="Aucun appareil enregistré."
                />
                <Ranking
                  icon={Globe}
                  title="Pays"
                  entries={stats.countries}
                  format={countryName}
                  unit="visiteurs"
                  empty="Aucun pays enregistré."
                />
              </div>
            </>
          )}

          <p className="text-[11px] mt-6" style={{ color: 'var(--admin-text-faint)' }}>
            Mesure d’audience anonyme : aucune adresse IP ni donnée personnelle n’est conservée. Les
            visiteurs ne peuvent pas être identifiés ni suivis d’un jour à l’autre.
          </p>
        </>
      )}
    </div>
  );
}
