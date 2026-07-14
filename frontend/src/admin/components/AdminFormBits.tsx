import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

export const ADMIN_INPUT =
  'w-full border border-[#e8e0d5] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c4a962]';

export const ADMIN_LABEL = 'block text-xs uppercase tracking-wider text-[#9c8b7a] mb-1.5';

export const SUPPORT_ICON_OPTIONS = [
  { value: 'sofa', label: 'Sofa' },
  { value: 'bed', label: 'Bed' },
  { value: 'utensils', label: 'Dining' },
  { value: 'package', label: 'Package' },
  { value: 'shield', label: 'Shield' },
  { value: 'truck', label: 'Truck' },
  { value: 'globe', label: 'Globe' },
  { value: 'check', label: 'Check' },
  { value: 'package-x', label: 'Package X' },
  { value: 'alert', label: 'Alert' },
  { value: 'mail', label: 'Mail' },
] as const;

interface AdminRepeatableSectionProps {
  title: string;
  description?: string;
  onAdd: () => void;
  addLabel?: string;
  children: ReactNode;
}

export function AdminRepeatableSection({
  title,
  description,
  onAdd,
  addLabel = 'Add item',
  children,
}: AdminRepeatableSectionProps) {
  return (
    <section className="space-y-3 pt-2 border-t border-[#e8e0d5]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-[#1a1714]">{title}</h2>
          {description && <p className="text-xs text-[#9c8b7a] mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider border border-[#e8e0d5] hover:border-[#c4a962] text-[#1a1714]"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

interface AdminCardProps {
  index: number;
  onRemove: () => void;
  children: ReactNode;
  title?: string;
}

export function AdminCard({ index, onRemove, children, title }: AdminCardProps) {
  return (
    <div className="border border-[#e8e0d5] bg-[#faf8f5]/p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-[#9c8b7a]">
          {title || `Item ${index + 1}`}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs text-[#9c8b7a] hover:text-red-600"
          aria-label="Remove"
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={ADMIN_LABEL}>{label}</label>
      {children}
    </div>
  );
}
