// types/programme.types.ts
export type ProgrammeKind = 'CULTE_DIMANCHE' | 'PRIERE_VENDREDI';

export type ProgrammeSectionKey =
  | 'ACCUEIL'
  | 'ANIMATION'
  | 'LOUANGE_ADORATION'
  | 'PREDICATION'
  | 'INTERPRETATION'
  | 'PARKING'
  | 'LIBRE';

export type Priority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export type ProgrammeStatus =
  | 'A_VENIR'
  | 'EN_COURS'
  | 'TERMINE'
  | 'ANNULE'
  | 'EXPIRE';

// ------------------------------------------------------------------
// Références (incluses dans la réponse API)
// ------------------------------------------------------------------
export interface ProgrammePersonRef {
  id: string;
  fullName: string;
}

export interface ProgrammeGroupRef {
  id: string;
  name: string;
}

// ------------------------------------------------------------------
// Section (réponse API)
// ------------------------------------------------------------------
export interface ProgrammeSection {
  id: string;
  key: ProgrammeSectionKey | string;
  label: string;
  order: number;
  value: string | null;
  persons: ProgrammePersonRef[];
  group: ProgrammeGroupRef | null;
}

// ------------------------------------------------------------------
// Programme (réponse API)
// ------------------------------------------------------------------
export interface Programme {
  id: string;
  kind: ProgrammeKind;
  title: string;
  summary: string;
  content: string | null;
  priority: Priority;
  status: ProgrammeStatus;
  rawStatus: string;
  location: string | null;

  hasHolyCommunion: boolean | null;
  holyCommunionMessage: string | null;
  notes: string | null;

  startsAt: string | null;
  endsAt: string | null;
  expiresAt: string | null;
  publishedAt: string | null;

  notification: boolean;

  sections: ProgrammeSection[];

  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------
// Payload de création (section)
// ------------------------------------------------------------------
export interface ProgrammeSectionPayload {
  key: ProgrammeSectionKey | string;
  label: string;
  order?: number;
  value?: string | null;
  personIds?: string[];
  groupId?: string | null;
}

// ------------------------------------------------------------------
// Payload Create/Update
// ------------------------------------------------------------------
export interface CreateProgrammePayload {
  kind: ProgrammeKind;
  title: string;
  summary: string;
  content?: string | null;
  priority?: Priority;
  status?: ProgrammeStatus;
  location?: string | null;

  hasHolyCommunion?: boolean;
  holyCommunionMessage?: string | null;
  notes?: string | null;

  publishedAt?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  expiresAt?: string | null;

  notification?: boolean;

  sections: ProgrammeSectionPayload[];
}

export type UpdateProgrammePayload = Partial<CreateProgrammePayload>;

export interface ListProgrammesParams {
  kind?: ProgrammeKind;
  status?: ProgrammeStatus;
  q?: string;
  period?: 'upcoming' | 'past' | 'all';
  page?: number;
  pageSize?: number;
}

// ------------------------------------------------------------------
// Libellés (UI)
// ------------------------------------------------------------------
export const PROGRAMME_KIND_LABEL: Record<ProgrammeKind, string> = {
  CULTE_DIMANCHE: 'Culte de dimanche',
  PRIERE_VENDREDI: 'Prière du vendredi',
};

export const SECTION_KEY_LABEL: Record<ProgrammeSectionKey, string> = {
  ACCUEIL: 'Accueil',
  ANIMATION: 'Animation',
  LOUANGE_ADORATION: 'Louange & Adoration',
  PREDICATION: 'Prédication',
  INTERPRETATION: 'Interprétation',
  PARKING: 'Parking',
  LIBRE: 'Section libre',
};