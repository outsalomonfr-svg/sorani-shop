'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

const InstagramIcon = ({ size = 15 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: 'var(--brand-blue)' }}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Erreur réseau. Réessaie ou écris-nous à soranibijoux@gmail.com.');
      setStatus('error');
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm outline-none transition focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]';
  const labelCls = 'block text-[10px] uppercase tracking-[0.22em] mb-2 opacity-60';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <p className="text-[11px] uppercase tracking-[0.32em] opacity-60 mb-4">Contact</p>
        <h1
          className="text-4xl md:text-5xl leading-tight"
          style={{ fontFamily: 'var(--font-product)', color: 'var(--brand-blue)' }}
        >
          Une question&nbsp;?
        </h1>
        <div className="w-12 h-px mx-auto my-6 bg-black/20" />
        <p className="text-sm md:text-base opacity-70 max-w-md mx-auto leading-relaxed">
          Une envie sur mesure, une question sur une commande&nbsp;? Écris-nous, on te répond avec plaisir.
        </p>
      </div>

      {status === 'sent' ? (
        <div className="text-center py-16 px-6 rounded-2xl border border-black/10 bg-[#FAF6EF]">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-white"
            style={{ background: 'var(--brand-blue)' }}
          >
            <Check size={24} />
          </div>
          <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-product)' }}>
            Message envoyé&nbsp;!
          </h2>
          <p className="text-sm opacity-70 max-w-sm mx-auto leading-relaxed">
            Merci de nous avoir écrit. On te répond dans les plus brefs délais.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-[11px] uppercase tracking-[0.22em] underline underline-offset-4 opacity-70 hover:opacity-100 transition"
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nom</label>
              <input className={inputCls} value={form.name} onChange={update('name')} required placeholder="Ton nom" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                className={inputCls}
                type="email"
                value={form.email}
                onChange={update('email')}
                required
                placeholder="ton@email.com"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Sujet (facultatif)</label>
            <input className={inputCls} value={form.subject} onChange={update('subject')} placeholder="L’objet de ton message" />
          </div>

          <div>
            <label className={labelCls}>Message</label>
            <textarea
              className={`${inputCls} resize-y min-h-[140px]`}
              value={form.message}
              onChange={update('message')}
              required
              rows={6}
              placeholder="Ton message…"
            />
          </div>

          {status === 'error' && (
            <div className="text-sm px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full sm:w-auto sm:min-w-[220px] mx-auto flex items-center justify-center gap-2 rounded-full text-white py-3.5 px-8 text-[11px] uppercase tracking-[0.22em] transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--brand-blue)' }}
          >
            {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
          </button>
        </form>
      )}

      {/* Coordonnées directes */}
      <div className="mt-14 pt-10 border-t border-black/10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
        <a
          href="mailto:soranibijoux@gmail.com"
          className="flex items-center gap-2 opacity-70 hover:opacity-100 transition"
        >
          <Mail size={15} style={{ color: 'var(--brand-blue)' }} />
          soranibijoux@gmail.com
        </a>
        <a
          href="https://instagram.com/sorani.bijoux"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 opacity-70 hover:opacity-100 transition"
        >
          <InstagramIcon size={15} />
          @sorani.bijoux
        </a>
      </div>
    </div>
  );
}
