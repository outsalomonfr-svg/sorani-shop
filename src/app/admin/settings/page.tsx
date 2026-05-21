'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Parametres</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Configuration Stripe</h2>
          <p className="text-sm text-gray-500">
            Les cles API Stripe sont configurees dans le fichier .env.local
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cle publique Stripe</label>
            <input
              type="text"
              placeholder="pk_live_..."
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
              disabled
              value="Configure dans .env.local"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Meta Pixel</h2>
          <p className="text-sm text-gray-500">
            L&apos;ID du Meta Pixel est configure dans le fichier .env.local
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pixel ID</label>
            <input
              type="text"
              placeholder="NEXT_PUBLIC_META_PIXEL_ID"
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
              disabled
              value="Configure dans .env.local"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Livraison</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livraison standard (EUR)</label>
              <input
                type="number"
                step="0.01"
                defaultValue="4.90"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gratuite a partir de (EUR)</label>
              <input
                type="number"
                step="0.01"
                defaultValue="50.00"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#1B4965] text-white py-3 rounded-lg font-semibold hover:bg-[#153a52] transition flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {saved ? 'Sauvegarde !' : 'Sauvegarder les parametres'}
        </button>
      </div>
    </div>
  );
}
