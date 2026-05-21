import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <XCircle size={64} className="mx-auto text-red-400 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Commande annulee</h1>
      <p className="text-gray-600 mb-8">
        Votre commande a ete annulee. Votre panier est toujours disponible.
      </p>
      <Link
        href="/cart"
        className="inline-block bg-[#1B4965] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#153a52] transition"
      >
        Retour au panier
      </Link>
    </div>
  );
}
