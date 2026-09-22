// components/notifications/NotificationFilters.tsx
'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { DeletedFilter } from '@/types';
import {
  ALL_NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABEL,
  NotificationType,
} from '@/types/notification.types';

export type ReadFilter = 'all' | 'unread' | 'read';

interface Props {
  readFilter: ReadFilter;
  onReadFilterChange: (r: ReadFilter) => void;

  typeFilter: NotificationType | '';
  onTypeFilterChange: (t: NotificationType | '') => void;

  deletedFilter: DeletedFilter;
  onDeletedFilterChange: (d: DeletedFilter) => void;

  /** Compteurs pour le segmented (optionnels) */
  counts?: {
    active: number;
    deleted: number;
    total: number;
  };

  /** Afficher le filtre soft delete (admin uniquement) */
  showDeletedFilter?: boolean;
}

export default function NotificationFilters({
  readFilter,
  onReadFilterChange,
  typeFilter,
  onTypeFilterChange,
  deletedFilter,
  onDeletedFilterChange,
  counts,
  showDeletedFilter = false,
}: Props) {
  const { colors } = useTheme();

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* Segmented soft delete (admin) */}
      {showDeletedFilter && counts && (
        <div
          className="flex rounded-lg border p-0.5"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
          }}
        >
          {(
            [
              { value: 'active', label: 'Actives', count: counts.active },
              { value: 'deleted', label: 'Corbeille', count: counts.deleted },
              { value: 'all', label: 'Toutes', count: counts.total },
            ] as const
          ).map((opt) => {
            const active = deletedFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDeletedFilterChange(opt.value)}
                className="flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-bold transition"
                style={{
                  backgroundColor: active ? colors.surface : 'transparent',
                  color: active ? colors.text : colors.textSecondary,
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {opt.label}
                <span
                  className="rounded-full px-1.5 text-[10px] font-black"
                  style={{
                    backgroundColor: active
                      ? colors.primary + '22'
                      : colors.border,
                    color: active ? colors.primary : colors.textMuted,
                  }}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Segmented read */}
      <div
        className="flex rounded-lg border p-0.5"
        style={{
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        }}
      >
        {(['all', 'unread', 'read'] as ReadFilter[]).map((r) => {
          const active = readFilter === r;
          const label =
            r === 'all' ? 'Toutes' : r === 'unread' ? 'Non lues' : 'Lues';
          return (
            <button
              key={r}
              type="button"
              onClick={() => onReadFilterChange(r)}
              className="h-7 rounded-md px-3 text-xs font-bold transition"
              style={{
                backgroundColor: active ? colors.surface : 'transparent',
                color: active ? colors.text : colors.textSecondary,
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Type */}
      <select
        value={typeFilter}
        onChange={(e) =>
          onTypeFilterChange(e.target.value as NotificationType | '')
        }
        className="h-8 rounded-md border px-3 text-xs font-bold outline-none"
        style={{
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <option value="">Tous les types</option>
        {ALL_NOTIFICATION_TYPES.map((t) => (
          <option key={t} value={t}>
            {NOTIFICATION_TYPE_LABEL[t]}
          </option>
        ))}
      </select>
    </div>
  );
}