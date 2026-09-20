import { Priority } from "./programme.types";

// types/evenement.types.ts
export type EvenementKind =
  | 'MARIAGE'
  | 'CAMP'
  | 'SORTIE'
  | 'CONFERENCE'
  | 'FORMATION'
  | 'ACTION_DE_GRACE'
  | 'JOURNEE'
  | 'AUTRE';

export type PublicCible =
  | 'ENFANTS_ET_ADOS'
  | 'ADOS'
  | 'FEMMES_AFEC'
  | 'JEUNESSE'
  | 'ENFANTS_DE_PASTEURS'
  | 'FEMMES'
  | 'HOMMES_MARIES'
  | 'PERSONNES_AGEES'
  | 'CONSEIL'
  | 'PASTEUR'
  | 'VEUVES_ET_ORPHELINS'
  | 'AUTRE';


export type EvenementStatus =
  | 'A_VENIR'
  | 'EN_COURS'
  | 'TERMINE'
  | 'ANNULE'
  | 'EXPIRE';

// ------------------------------------------------------------------
// Événement (réponse API)
// ------------------------------------------------------------------
export interface Evenement {
  id: string;
  kind: EvenementKind;
  title: string;
  summary: string;
  detail: string | null;
  priority: Priority;
  status: EvenementStatus;
  rawStatus: string;

  location: string | null;

  startsAt: string | null;
  endsAt: string | null;
  expiresAt: string | null;
  publishedAt: string | null;
  notification: boolean;

  // MARIAGE
  brideName: string | null;
  groomName: string | null;
  townHallTime: string | null;
  townHallPlace: string | null;
  ceremonyTime: string | null;
  ceremonyPlace: string | null;
  receptionPlace: string | null;

  // CAMP / SORTIE / JOURNEE
  audience: PublicCible | null;
  audienceOther: string | null;
  theme: string | null;

  // CONFERENCE
  speaker: string | null;

  // FORMATION
  trainer: string | null;

  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------
// Payload
// ------------------------------------------------------------------
export interface CreateEvenementPayload {
  kind: EvenementKind;
  title: string;
  summary: string;
  detail?: string | null;
  priority?: Priority;
  status?: EvenementStatus;
  location?: string | null;

  publishedAt?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  expiresAt?: string | null;
  notification?: boolean;

  // MARIAGE
  brideName?: string | null;
  groomName?: string | null;
  townHallTime?: string | null;
  townHallPlace?: string | null;
  ceremonyTime?: string | null;
  ceremonyPlace?: string | null;
  receptionPlace?: string | null;

  // CAMP / SORTIE / JOURNEE
  audience?: PublicCible | null;
  audienceOther?: string | null;
  theme?: string | null;

  // CONFERENCE
  speaker?: string | null;

  // FORMATION
  trainer?: string | null;
}

export type UpdateEvenementPayload = Partial<CreateEvenementPayload>;

export interface ListEvenementsParams {
  kind?: EvenementKind;
  status?: EvenementStatus;
  q?: string;
  period?: 'upcoming' | 'past' | 'all';
  page?: number;
  pageSize?: number;
}

// ------------------------------------------------------------------
// Libellés
// ------------------------------------------------------------------
export const EVENEMENT_KIND_LABEL: Record<EvenementKind, string> = {
  MARIAGE: 'Mariage',
  CAMP: 'Camp',
  SORTIE: 'Sortie',
  CONFERENCE: 'Conférence',
  FORMATION: 'Formation',
  ACTION_DE_GRACE: 'Action de grâce',
  JOURNEE: 'Journée',
  AUTRE: 'Autre',
};

export const PUBLIC_CIBLE_LABEL: Record<PublicCible, string> = {
  ENFANTS_ET_ADOS: 'Enfants et ados',
  ADOS: 'Ados',
  FEMMES_AFEC: 'Femmes (AFEC)',
  JEUNESSE: 'Jeunesse',
  ENFANTS_DE_PASTEURS: 'Enfants de pasteurs',
  FEMMES: 'Femmes',
  HOMMES_MARIES: 'Hommes mariés',
  PERSONNES_AGEES: 'Personnes âgées',
  CONSEIL: 'Conseil',
  PASTEUR: 'Pasteur',
  VEUVES_ET_ORPHELINS: 'Veuves et orphelins',
  AUTRE: 'Autre',
};

export const ALL_KINDS: EvenementKind[] = [
  'MARIAGE',
  'CAMP',
  'SORTIE',
  'CONFERENCE',
  'FORMATION',
  'ACTION_DE_GRACE',
  'JOURNEE',
  'AUTRE',
];

export const ALL_PUBLICS: PublicCible[] = [
  'ENFANTS_ET_ADOS',
  'ADOS',
  'FEMMES_AFEC',
  'JEUNESSE',
  'ENFANTS_DE_PASTEURS',
  'FEMMES',
  'HOMMES_MARIES',
  'PERSONNES_AGEES',
  'CONSEIL',
  'PASTEUR',
  'VEUVES_ET_ORPHELINS',
  'AUTRE',
];