// types/table.types.ts
import type React from 'react';

export type SortDirection = 'asc' | 'desc';

export interface Column<T = any> {
  /** Clé technique (correspond à un champ de T, ou juste un identifiant) */
  key: string;
  /** Libellé affiché */
  label: string;
  /** Peut-on trier sur cette colonne ? */
  sortable?: boolean;
  /** Masquée par défaut ? */
  hidden?: boolean;
  /** Rendu personnalisé */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Largeur (ex : "120px", "20%") */
  width?: string;
  /** Alignement */
  align?: 'left' | 'center' | 'right';
  /** Classes Tailwind additionnelles */
  className?: string;
}

export interface RowAction<T = any> {
  /** Icône lucide */
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Label (tooltip + aria) */
  label: string;
  /** Callback */
  onClick: (row: T) => void;
  /** Condition d'affichage */
  condition?: (row: T) => boolean;
  /** Classes Tailwind (couleur, hover) */
  className?: string;
}

export interface BulkAction<T = any> {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  onClick: (rows: T[]) => void;
  className?: string;
}

export interface TableConfig<T = any> {
  /** Active la sélection multi-lignes */
  selectable?: boolean;
  /** Affiche la pagination front */
  pagination?: boolean;
  /** Active la barre de recherche (front) */
  searchable?: boolean;
  /** Nombre de lignes par défaut */
  defaultPageSize?: number;
  /** Choix de tailles de page */
  pageSizes?: number[];
  /** Actions par ligne */
  actions?: RowAction<T>[];
  /** Actions groupées */
  bulkActions?: BulkAction<T>[];
  /** Message quand vide */
  emptyMessage?: string;
  /** Colonnes de clé unique */
  rowKey?: keyof T | ((row: T) => string);
  /** Texte placeholder de la recherche */
  searchPlaceholder?: string;
}