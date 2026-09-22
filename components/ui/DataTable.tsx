// components/ui/DataTable.tsx
'use client';

import {
    Check,
    CheckSquare,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    Columns3,
    Loader2,
    Search,
    Square,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import type {
    BulkAction,
    Column,
    RowAction,
    SortDirection,
    TableConfig,
} from '@/types/table.types';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------
interface Props<T = any> {
    data: T[];
    columns: Column<T>[];
    config?: TableConfig<T>;
    loading?: boolean;
    /** Callback de sélection multiple */
    onSelectionChange?: (rows: T[]) => void;
    /** Titre optionnel de la zone (à gauche des contrôles) */
    title?: string;
    /** Slot d'actions à droite de la toolbar (bouton "Nouveau" par ex.) */
    toolbarActions?: React.ReactNode;
    /** Classes additionnelles */
    className?: string;
}

// ------------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------------
export default function DataTable<T = any>({
    data,
    columns,
    config = {},
    loading = false,
    onSelectionChange,
    title,
    toolbarActions,
    className,
}: Props<T>) {
    const { colors } = useTheme();

    const {
        selectable = true,
        pagination = true,
        searchable = true,
        defaultPageSize = 10,
        pageSizes = [5, 10, 25, 50, 100],
        actions = [],
        bulkActions = [],
        emptyMessage = 'Aucune donnée',
        rowKey,
        searchPlaceholder = 'Rechercher…',
        rowClassName,
    } = config;

    // ---- État ----
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(
        null,
    );
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
        new Set(columns.filter((c) => c.hidden).map((c) => c.key)),
    );
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    // ---- Reset pagination si data/search change ----
    useEffect(() => {
        setCurrentPage(1);
    }, [data, searchTerm, rowsPerPage]);

    // ---- Recherche front ----
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const q = searchTerm.toLowerCase();
        return data.filter((row) =>
            Object.values(row as Record<string, unknown>).some(
                (v) => v != null && String(v).toLowerCase().includes(q),
            ),
        );
    }, [data, searchTerm]);

    // ---- Tri front ----
    const sortedData = useMemo(() => {
        if (!sort) return filteredData;
        return [...filteredData].sort((a, b) => {
            const av = (a as any)[sort.key];
            const bv = (b as any)[sort.key];
            if (av === bv) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            const cmp = av < bv ? -1 : 1;
            return sort.direction === 'asc' ? cmp : -cmp;
        });
    }, [filteredData, sort]);

    // ---- Pagination front ----
    const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = useMemo(
        () => sortedData.slice(startIndex, startIndex + rowsPerPage),
        [sortedData, startIndex, rowsPerPage],
    );

    // ---- Sélection ----
    const getRowId = (row: T, index: number): string => {
        if (typeof rowKey === 'function') return rowKey(row);
        if (rowKey) return String((row as any)[rowKey]);
        if ((row as any).id) return String((row as any).id);
        return String(index);
    };

    const selectedIds = useMemo(
        () => new Set(selectedRows.map((r, i) => getRowId(r, i))),
        [selectedRows],
    );

    const allSelected =
        paginatedData.length > 0 &&
        paginatedData.every((r, i) => selectedIds.has(getRowId(r, startIndex + i)));

    const someSelected =
        paginatedData.some((r, i) => selectedIds.has(getRowId(r, startIndex + i))) &&
        !allSelected;

    useEffect(() => {
        onSelectionChange?.(selectedRows);
    }, [selectedRows, onSelectionChange]);

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedRows((prev) =>
                prev.filter(
                    (r, i) => !selectedIds.has(getRowId(r, i)),
                ),
            );
        } else {
            const toAdd = paginatedData.filter(
                (r, i) => !selectedIds.has(getRowId(r, startIndex + i)),
            );
            setSelectedRows((prev) => [...prev, ...toAdd]);
        }
    };

    const toggleSelectRow = (row: T, index: number) => {
        const id = getRowId(row, index);
        const isSelected = selectedRows.some((r, i) => getRowId(r, i) === id);
        if (isSelected) {
            setSelectedRows((prev) =>
                prev.filter((r, i) => getRowId(r, i) !== id),
            );
        } else {
            setSelectedRows((prev) => [...prev, row]);
        }
    };

    const clearSelection = () => setSelectedRows([]);

    // ---- Tri ----
    const handleSort = (key: string) => {
        if (sort?.key === key) {
            if (sort.direction === 'asc') setSort({ key, direction: 'desc' });
            else setSort(null);
        } else {
            setSort({ key, direction: 'asc' });
        }
    };

    // ---- Colonnes visibles ----
    const visibleColumns = columns.filter((c) => !hiddenColumns.has(c.key));
    const toggleColumn = (key: string) => {
        setHiddenColumns((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const totalCols =
        (selectable ? 1 : 0) + visibleColumns.length + (actions.length > 0 ? 1 : 0);

    return (
        <div
            className={cn('overflow-hidden rounded-xl border shadow-sm', className)}
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
            {/* ============ TOOLBAR ============ */}
            <div
                className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: colors.border }}
            >
                <div className="flex items-center gap-3">
                    {title && (
                        <h3
                            className="text-sm font-extrabold tracking-wide"
                            style={{ color: colors.text }}
                        >
                            {title}
                        </h3>
                    )}

                    {searchable && (
                        <div className="relative w-64">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                                style={{ color: colors.textMuted }}
                            />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-9 w-full rounded-lg border pl-9 pr-9 text-sm outline-none transition"
                                style={{
                                    backgroundColor: colors.surfaceAlt,
                                    borderColor: colors.border,
                                    color: colors.text,
                                }}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="h-4 w-4" style={{ color: colors.textMuted }} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Sélection groupée */}
                    {selectedRows.length > 0 && bulkActions.length > 0 && (
                        <div className="flex items-center gap-1">
                            {bulkActions.map((action, i) => (
                                <BulkActionButton
                                    key={i}
                                    action={action}
                                    rows={selectedRows}
                                    colors={colors}
                                />
                            ))}
                        </div>
                    )}

                    {/* Sélecteur de colonnes */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowColumnMenu((v) => !v)}
                            className="flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition"
                            style={{
                                borderColor: colors.border,
                                color: colors.text,
                                backgroundColor: colors.surfaceAlt,
                            }}
                        >
                            <Columns3 className="h-4 w-4" />
                            Colonnes
                        </button>

                        {showColumnMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowColumnMenu(false)}
                                />
                                <div
                                    className="absolute right-0 top-11 z-50 w-56 rounded-lg border p-1 shadow-2xl"
                                    style={{
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <div
                                        className="border-b px-3 py-2 text-[10px] font-bold tracking-widest"
                                        style={{
                                            borderColor: colors.border,
                                            color: colors.textMuted,
                                        }}
                                    >
                                        COLONNES VISIBLES
                                    </div>
                                    <div className="max-h-64 overflow-y-auto py-1">
                                        {columns.map((col) => {
                                            const visible = !hiddenColumns.has(col.key);
                                            return (
                                                <button
                                                    key={col.key}
                                                    type="button"
                                                    onClick={() => toggleColumn(col.key)}
                                                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition"
                                                    style={{ color: colors.text }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor =
                                                            colors.surfaceAlt;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor =
                                                            'transparent';
                                                    }}
                                                >
                                                    {visible ? (
                                                        <CheckSquare
                                                            className="h-4 w-4"
                                                            style={{ color: colors.primary }}
                                                        />
                                                    ) : (
                                                        <Square
                                                            className="h-4 w-4"
                                                            style={{ color: colors.textMuted }}
                                                        />
                                                    )}
                                                    {col.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Slot d'actions externes */}
                    {toolbarActions}
                </div>
            </div>

            {/* ============ SÉLECTION ACTIVE ============ */}
            {selectedRows.length > 0 && (
                <div
                    className="flex items-center gap-3 border-b px-4 py-2 text-xs"
                    style={{
                        backgroundColor: colors.primary + '11',
                        borderColor: colors.border,
                    }}
                >
                    <Check className="h-3.5 w-3.5" style={{ color: colors.primary }} />
                    <span style={{ color: colors.text }}>
                        <b>{selectedRows.length}</b> élément(s) sélectionné(s)
                    </span>
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="font-semibold underline-offset-2 hover:underline"
                        style={{ color: colors.primary }}
                    >
                        Tout désélectionner
                    </button>
                </div>
            )}

            {/* ============ TABLEAU ============ */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr
                            className="border-b"
                            style={{ borderColor: colors.border, backgroundColor: colors.surfaceAlt }}
                        >
                            {selectable && (
                                <th className="w-10 p-3">
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        className="flex h-4 w-4 items-center justify-center rounded border transition"
                                        style={{
                                            borderColor: colors.border,
                                            backgroundColor: allSelected ? colors.primary : 'transparent',
                                        }}
                                    >
                                        {allSelected && (
                                            <Check className="h-3 w-3" style={{ color: colors.onPrimary }} />
                                        )}
                                        {someSelected && (
                                            <div
                                                className="h-2 w-2 rounded-sm"
                                                style={{ backgroundColor: colors.primary }}
                                            />
                                        )}
                                    </button>
                                </th>
                            )}

                            {visibleColumns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        'p-3 text-left text-[11px] font-extrabold tracking-widest',
                                        col.align === 'center' && 'text-center',
                                        col.align === 'right' && 'text-right',
                                    )}
                                    style={{ color: colors.textMuted, width: col.width }}
                                >
                                    {col.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSort(col.key)}
                                            className={cn(
                                                'inline-flex items-center gap-1 transition',
                                                col.align === 'center' && 'justify-center',
                                                col.align === 'right' && 'justify-end',
                                            )}
                                            style={{
                                                color:
                                                    sort?.key === col.key ? colors.primary : colors.textMuted,
                                            }}
                                        >
                                            {col.label}
                                            {sort?.key === col.key ? (
                                                sort.direction === 'asc' ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                )
                                            ) : (
                                                <ChevronDown className="h-3 w-3 opacity-30" />
                                            )}
                                        </button>
                                    ) : (
                                        col.label
                                    )}
                                </th>
                            ))}

                            {actions.length > 0 && (
                                <th
                                    className="p-3 text-right text-[11px] font-extrabold tracking-widest"
                                    style={{ color: colors.textMuted }}
                                >
                                    ACTIONS
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {/* Loading */}
                        {loading && (
                            <tr>
                                <td colSpan={totalCols} className="p-12 text-center">
                                    <Loader2
                                        className="mx-auto h-6 w-6 animate-spin"
                                        style={{ color: colors.primary }}
                                    />
                                    <p
                                        className="mt-2 text-xs font-semibold"
                                        style={{ color: colors.textMuted }}
                                    >
                                        Chargement…
                                    </p>
                                </td>
                            </tr>
                        )}

                        {/* Vide */}
                        {!loading && paginatedData.length === 0 && (
                            <tr>
                                <td
                                    colSpan={totalCols}
                                    className="p-12 text-center text-sm"
                                    style={{ color: colors.textMuted }}
                                >
                                    {searchTerm ? 'Aucun résultat trouvé' : emptyMessage}
                                </td>
                            </tr>
                        )}

                        {/* Lignes */}
                        {!loading &&
                            paginatedData.map((row, index) => {
                                const globalIndex = startIndex + index;
                                const id = getRowId(row, globalIndex);
                                const isSelected = selectedIds.has(id);

                                return (
                                    <tr
                                        key={id}
                                        className={cn(
                                            'border-b transition',
                                            rowClassName?.(row),
                                        )}
                                        style={{
                                            borderColor: colors.border,
                                            backgroundColor: isSelected
                                                ? colors.primary + '11'
                                                : undefined,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLElement).style.backgroundColor =
                                                    colors.surfaceAlt;
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected)
                                                (e.currentTarget as HTMLElement).style.backgroundColor = '';
                                        }}
                                    >
                                        {/* ⬇️ Case à cocher */}
                                        {selectable && (
                                            <td className="p-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSelectRow(row, globalIndex)}
                                                    className="flex h-4 w-4 items-center justify-center rounded border transition"
                                                    style={{
                                                        borderColor: isSelected
                                                            ? colors.primary
                                                            : colors.border,
                                                        backgroundColor: isSelected
                                                            ? colors.primary
                                                            : 'transparent',
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <Check
                                                            className="h-3 w-3"
                                                            style={{ color: colors.onPrimary }}
                                                        />
                                                    )}
                                                </button>
                                            </td>
                                        )}

                                        {/* ⬇️ Colonnes */}
                                        {visibleColumns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={cn(
                                                    'p-3 text-sm',
                                                    col.align === 'center' && 'text-center',
                                                    col.align === 'right' && 'text-right',
                                                    col.className,
                                                )}
                                                style={{ color: colors.text }}
                                            >
                                                {col.render
                                                    ? col.render(
                                                        (row as any)[col.key],
                                                        row,
                                                        globalIndex,
                                                    )
                                                    : ((row as any)[col.key] ?? '—')}
                                            </td>
                                        ))}

                                        {/* ⬇️ Actions contextuelles */}
                                        {actions.length > 0 && (
                                            <td className="p-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {actions.map((action, i) => {
                                                        // ⚠️ Filtre les actions cachées (nouveau)
                                                        if (action.hidden?.(row)) return null;
                                                        // Compat : ancien `condition`
                                                        if (
                                                            action.condition &&
                                                            !action.condition(row)
                                                        )
                                                            return null;

                                                        const Icon = action.icon;
                                                        return (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => action.onClick(row)}
                                                                title={action.label}
                                                                className={cn(
                                                                    'flex h-8 w-8 items-center justify-center rounded-lg transition',
                                                                    action.className,
                                                                )}
                                                                style={{
                                                                    color: action.className
                                                                        ? undefined
                                                                        : colors.textSecondary,
                                                                }}
                                                            >
                                                                <Icon className="h-4 w-4" />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {/* ============ PAGINATION ============ */}
            {pagination && !loading && sortedData.length > 0 && (
                <div
                    className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{ borderColor: colors.border }}
                >
                    <div className="text-xs" style={{ color: colors.textMuted }}>
                        {startIndex + 1}–{Math.min(startIndex + rowsPerPage, sortedData.length)}{' '}
                        sur <b>{sortedData.length}</b>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Taille de page */}
                        <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                            <span>Lignes :</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="h-8 rounded-md border px-2 outline-none"
                                style={{
                                    backgroundColor: colors.surfaceAlt,
                                    borderColor: colors.border,
                                    color: colors.text,
                                }}
                            >
                                {pageSizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-1">
                            <PageBtn
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                colors={colors}
                                aria-label="Première page"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </PageBtn>
                            <PageBtn
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                colors={colors}
                                aria-label="Page précédente"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </PageBtn>

                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2)
                                        pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    const active = currentPage === pageNum;
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-bold transition"
                                            style={{
                                                backgroundColor: active ? colors.primary : 'transparent',
                                                color: active ? colors.onPrimary : colors.textSecondary,
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <PageBtn
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                colors={colors}
                                aria-label="Page suivante"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </PageBtn>
                            <PageBtn
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                colors={colors}
                                aria-label="Dernière page"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </PageBtn>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ------------------------------------------------------------------
// Sous-composants
// ------------------------------------------------------------------
function PageBtn({
    children,
    onClick,
    disabled,
    colors,
    ...rest
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled: boolean;
    colors: ReturnType<typeof useTheme>['colors'];
    [key: string]: unknown;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40"
            style={{ color: colors.textSecondary }}
            {...rest}
        >
            {children}
        </button>
    );
}

function BulkActionButton<T>({
    action,
    rows,
    colors,
}: {
    action: BulkAction<T>;
    rows: T[];
    colors: ReturnType<typeof useTheme>['colors'];
}) {
    const Icon = action.icon;
    return (
        <button
            type="button"
            onClick={() => action.onClick(rows)}
            className={cn(
                'flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition',
                action.className,
            )}
            style={{
                borderColor: action.className ? undefined : colors.border,
                color: action.className ? undefined : colors.text,
                backgroundColor: action.className ? undefined : colors.surfaceAlt,
            }}
            title={action.label}
        >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{action.label}</span>
        </button>
    );
}