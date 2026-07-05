'use client';

import Link from 'next/link';
import { ReactNode, DragEventHandler, CSSProperties, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

/* ============================================================ */
/*  PageHeader                                                  */
/* ============================================================ */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: 'var(--admin-text)' }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ============================================================ */
/*  Card                                                        */
/* ============================================================ */
export function Card({
  children,
  className = '',
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={`rounded-xl ${noPadding ? '' : 'p-5'} ${className}`}
      style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
          {title}
        </h2>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ============================================================ */
/*  Button                                                      */
/* ============================================================ */
type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  href,
  onClick,
  type = 'button',
  disabled,
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3 py-2',
  };

  const variants = {
    primary: 'bg-[#1B4965] text-white hover:bg-[#153a52]',
    secondary: 'bg-white border border-[var(--admin-border-strong)] text-[var(--admin-text)] hover:bg-[var(--admin-hover)]',
    ghost: 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]',
    danger: 'bg-white border border-[#FECACA] text-[#991B1B] hover:bg-[#FEF2F2]',
  };

  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

/* ============================================================ */
/*  Badge                                                       */
/* ============================================================ */
const badgeStyles: Record<string, { bg: string; text: string; dot: string }> = {
  default: { bg: 'var(--admin-hover)', text: 'var(--admin-text)', dot: 'var(--admin-text-faint)' },
  success: { bg: '#E8F5E9', text: '#1B5E20', dot: '#16A34A' },
  warning: { bg: '#FFF4E5', text: '#9A5A00', dot: '#F59E0B' },
  info: { bg: '#E3F2FD', text: '#0D47A1', dot: '#2563EB' },
  purple: { bg: '#EDE7F6', text: '#4527A0', dot: '#7C3AED' },
  danger: { bg: '#FDECEC', text: '#991B1B', dot: '#DC2626' },
  muted: { bg: '#F1F1EF', text: '#2F2F2C', dot: '#787774' },
};

export function Badge({
  children,
  variant = 'default',
  dot = true,
}: {
  children: ReactNode;
  variant?: keyof typeof badgeStyles;
  dot?: boolean;
}) {
  const s = badgeStyles[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />}
      {children}
    </span>
  );
}

/* ============================================================ */
/*  Empty state                                                 */
/* ============================================================ */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="p-12 text-center">
      <div
        className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--admin-hover)' }}
      >
        <Icon size={20} style={{ color: 'var(--admin-text-muted)' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
        {title}
      </p>
      {description && (
        <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--admin-text-muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ============================================================ */
/*  Input / Textarea / Label                                    */
/* ============================================================ */
export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium mb-1.5"
      style={{ color: 'var(--admin-text)' }}
    >
      {children}
    </label>
  );
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm rounded-lg outline-none transition focus:border-[#1B4965] ${className}`}
      style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border-strong)',
        color: 'var(--admin-text)',
      }}
    />
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 text-sm rounded-lg outline-none transition focus:border-[#1B4965] ${className}`}
        style={{
          background: 'var(--admin-surface)',
          border: '1px solid var(--admin-border-strong)',
          color: 'var(--admin-text)',
        }}
      />
    );
  }
);

/* ============================================================ */
/*  Table                                                       */
/* ============================================================ */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto admin-scroll">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      className={`px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-${align}`}
      style={{ color: 'var(--admin-text-faint)' }}
    >
      {children}
    </th>
  );
}

export function Tr({
  children,
  isFirst = false,
  onClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  className = '',
  style,
}: {
  children: ReactNode;
  isFirst?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLTableRowElement>;
  onDragOver?: DragEventHandler<HTMLTableRowElement>;
  onDrop?: DragEventHandler<HTMLTableRowElement>;
  onDragEnd?: DragEventHandler<HTMLTableRowElement>;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <tr
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`transition hover:bg-black/[0.02] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ borderTop: isFirst ? 'none' : '1px solid var(--admin-border)', ...style }}
    >
      {children}
    </tr>
  );
}

export function Td({ children, align = 'left', className = '' }: { children: ReactNode; align?: 'left' | 'right' | 'center'; className?: string }) {
  return <td className={`px-5 py-3 text-${align} ${className}`}>{children}</td>;
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead style={{ background: 'var(--admin-bg)' }}>
      <tr>{children}</tr>
    </thead>
  );
}

/* ============================================================ */
/*  Loading                                                     */
/* ============================================================ */
export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="p-12 text-center text-sm flex items-center justify-center gap-2" style={{ color: 'var(--admin-text-muted)' }}>
      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  );
}
