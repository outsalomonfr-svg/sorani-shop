'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  helpText?: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
  /** Image affichée quand value est vide — pour rappeler ce qui s'affiche en fallback */
  placeholderUrl?: string;
};

export default function ImageUpload({
  value,
  onChange,
  folder = 'misc',
  label,
  helpText,
  aspectRatio = 'auto',
  placeholderUrl,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image trop lourde (max 10 MB)');
      return;
    }
    upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  };

  const handleClear = () => {
    onChange('');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const aspectClass =
    aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'wide' ? 'aspect-[16/9]' : 'min-h-[120px]';

  return (
    <div>
      {label && (
        <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--admin-text)' }}>
          {label}
        </p>
      )}

      {value || placeholderUrl ? (
        <div className="relative group">
          <div
            className={`relative ${aspectClass} rounded-lg overflow-hidden`}
            style={{ background: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value || placeholderUrl} alt="" className="w-full h-full object-cover" />
            {!value && placeholderUrl && (
              <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(0,0,0,0.65)', color: 'white' }}
              >
                Image par défaut
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-md bg-white text-xs font-medium shadow-sm hover:bg-gray-50"
            >
              Changer
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-md bg-white text-gray-700 shadow-sm hover:bg-red-50 hover:text-red-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={`w-full ${aspectClass} rounded-lg flex flex-col items-center justify-center gap-1.5 transition cursor-pointer disabled:cursor-wait`}
          style={{
            background: dragOver ? 'var(--admin-hover)' : 'var(--admin-bg)',
            border: `1.5px dashed ${dragOver ? 'var(--brand-blue)' : 'var(--admin-border-strong)'}`,
            color: 'var(--admin-text-muted)',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span className="text-xs">Upload en cours…</span>
            </>
          ) : (
            <>
              <UploadCloud size={20} />
              <span className="text-xs font-medium" style={{ color: 'var(--admin-text)' }}>
                Cliquer ou glisser une image
              </span>
              <span className="text-[11px]">PNG, JPG, WEBP — max 10 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />

      {helpText && !error && (
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--admin-text-faint)' }}>
          {helpText}
        </p>
      )}

      {error && (
        <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: '#DC2626' }}>
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
