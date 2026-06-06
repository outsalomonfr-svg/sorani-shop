'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ProductReview } from '@/types';
import Stars from './Stars';

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    setReviews((data as ProductReview[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;

  return (
    <section className="mt-20 pt-12 border-t border-black/10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.32em] mb-3 opacity-60">Les avis</p>
          <h2
            className="text-2xl md:text-3xl mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}
          >
            Ce qu’en disent nos clientes
          </h2>
          {count > 0 ? (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Stars rating={avg} size={18} />
              <span className="text-sm opacity-70" style={{ fontFamily: 'var(--font-price)' }}>
                {avg.toFixed(1)} / 5 · {count} avis
              </span>
            </div>
          ) : (
            <p className="text-sm opacity-60 mb-6">Sois la première à laisser un avis sur cette création.</p>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-[11px] uppercase tracking-[0.22em] pb-1 transition-opacity hover:opacity-70"
            style={{ borderBottom: '1px solid currentColor', color: 'var(--brand-blue)' }}
          >
            {showForm ? 'Annuler' : 'Laisser un avis'}
          </button>
        </div>

        {showForm && (
          <ReviewForm productId={productId} onSubmitted={() => { setShowForm(false); fetchReviews(); }} />
        )}

        {loading ? (
          <p className="text-center text-sm opacity-50">Chargement…</p>
        ) : count === 0 ? null : (
          <div className="space-y-8 mt-10">
            {reviews.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <article className="pb-8 border-b border-black/10 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Stars rating={review.rating} size={13} />
          {review.verified_purchase && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] opacity-70">
              <Check size={11} style={{ color: 'var(--brand-blue)' }} />
              Achat vérifié
            </span>
          )}
        </div>
        <span className="text-[11px] opacity-50">{date}</span>
      </div>
      {review.title && (
        <h3 className="text-base mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {review.title}
        </h3>
      )}
      {review.comment && (
        <p className="text-[15px] leading-relaxed opacity-85 whitespace-pre-line">{review.comment}</p>
      )}
      {review.customer_name && (
        <p className="text-xs mt-3 opacity-60 italic">— {review.customer_name}</p>
      )}
    </article>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide');
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: e2 } = await supabase.from('product_reviews').insert({
      product_id: productId,
      customer_email: email.trim().toLowerCase(),
      customer_name: name.trim() || null,
      rating,
      title: title.trim() || null,
      comment: comment.trim() || null,
      status: 'pending',
    });
    setBusy(false);
    if (e2) {
      setError(e2.message);
      return;
    }
    setDone(true);
    setTimeout(onSubmitted, 2500);
  };

  if (done) {
    return (
      <div className="text-center py-10 px-6 my-8 border border-black/10">
        <Check size={28} style={{ color: 'var(--brand-blue)' }} className="mx-auto mb-3" />
        <p className="text-sm opacity-80">
          Merci pour ton avis ! Il sera publié après vérification par notre équipe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="my-10 p-6 md:p-8 border border-black/10 space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Ta note</p>
        <Stars rating={rating} onChange={setRating} size={24} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Prénom (facultatif)</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marie"
            className="w-full px-3 py-2.5 text-sm border border-black/15 outline-none focus:border-black/40"
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Email (non publié)</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            className="w-full px-3 py-2.5 text-sm border border-black/15 outline-none focus:border-black/40"
          />
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Titre (facultatif)</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Un coup de cœur"
          className="w-full px-3 py-2.5 text-sm border border-black/15 outline-none focus:border-black/40"
        />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Ton avis</p>
        <textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partage ton expérience avec ce bijou…"
          className="w-full px-3 py-2.5 text-sm border border-black/15 outline-none focus:border-black/40 resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full py-3 text-white text-[11px] uppercase tracking-[0.28em] transition-opacity hover:opacity-85 disabled:opacity-50"
        style={{ background: 'var(--brand-blue)' }}
      >
        {busy ? 'Envoi…' : 'Envoyer mon avis'}
      </button>

      <p className="text-[10px] opacity-60 text-center leading-relaxed">
        Ton avis sera publié après modération.
      </p>
    </form>
  );
}
