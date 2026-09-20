// app/(dashboard)/dashboard/page.tsx
'use client';

import {
  ArrowRight,
  Bell,
  CalendarDays,
  Heart,
  Info,
  Loader2,
  Megaphone,
  PartyPopper,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { evenementsService } from '@/services/evenements/evenements.service';
import { groupsService } from '@/services/groups/groups.service';
import { infosService } from '@/services/infos/infos.service';
import { peopleService } from '@/services/people/people.service';
import { prieresService } from '@/services/prieres/prieres.service';
import { programmesService } from '@/services/programmes/programmes.service';
import { rappelsService } from '@/services/rappels/rappels.service';
import { usersService } from '@/services/users/users.service';
import type { Evenement } from '@/types/evenement.types';
import type { Info as InfoType } from '@/types/info.types';
import type { Programme } from '@/types/programme.types';

// ------------------------------------------------------------------
// Config des modules affichés dans les stats
// ------------------------------------------------------------------
interface ModuleStat {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tone: 'primary' | 'info' | 'warning' | 'violet' | 'success';
}

const CONTENT_MODULES: ModuleStat[] = [
  { key: 'programmes', label: 'Programmes', href: '/programmes', icon: CalendarDays, tone: 'primary' },
  { key: 'evenements', label: 'Événements', href: '/evenements', icon: PartyPopper, tone: 'info' },
  { key: 'infos',      label: 'Infos',      href: '/infos',      icon: Megaphone, tone: 'primary' },
  { key: 'prieres',    label: 'Prières',    href: '/prieres',    icon: Heart, tone: 'violet' },
  { key: 'rappels',    label: 'Rappels',    href: '/rappels',    icon: Bell, tone: 'warning' },
];

const ADMIN_MODULES: ModuleStat[] = [
  { key: 'users',  label: 'Utilisateurs', href: '/users',  icon: UserCog, tone: 'primary' },
  { key: 'people', label: 'Personnes',    href: '/people', icon: Users,   tone: 'primary' },
  { key: 'groups', label: 'Groupes',      href: '/groups', icon: UsersRound, tone: 'primary' },
];

// ------------------------------------------------------------------
// Types des stats chargées
// ------------------------------------------------------------------
interface Stats {
  programmes: number;
  evenements: number;
  infos: number;
  prieres: number;
  rappels: number;
  users: number;
  people: number;
  groups: number;
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------
export default function DashboardPage() {
  const { colors } = useTheme();

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [nextProgrammes, setNextProgrammes] = useState<Programme[]>([]);
  const [nextEvenements, setNextEvenements] = useState<Evenement[]>([]);
  const [recentInfos, setRecentInfos] = useState<InfoType[]>([]);

  // ---- Chargement stats + à venir + dernières infos ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatsLoading(true);
      try {
        const [
          programmesRes,
          evenementsRes,
          infosRes,
          prieresRes,
          rappelsRes,
          usersRes,
          peopleRes,
          groupsRes,
        ] = await Promise.all([
          programmesService.list({ page: 1, pageSize: 1 }),
          evenementsService.list({ page: 1, pageSize: 1 }),
          infosService.list({ page: 1, pageSize: 1 }),
          prieresService.list({ page: 1, pageSize: 1 }),
          rappelsService.list({ page: 1, pageSize: 1 }),
          usersService.list({ page: 1, pageSize: 1 }),
          peopleService.list({ page: 1, pageSize: 1 }),
          groupsService.list({ page: 1, pageSize: 1 }),
        ]);

        if (cancelled) return;

        setStats({
          programmes: programmesRes.meta.total,
          evenements: evenementsRes.meta.total,
          infos: infosRes.meta.total,
          prieres: prieresRes.meta.total,
          rappels: rappelsRes.meta.total,
          users: usersRes.meta.total,
          people: peopleRes.meta.total,
          groups: groupsRes.meta.total,
        });
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- À venir + dernières infos ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [progRes, evtRes, infosRes] = await Promise.all([
          programmesService.list({ period: 'upcoming', page: 1, pageSize: 3 }),
          evenementsService.list({ period: 'upcoming', page: 1, pageSize: 3 }),
          infosService.list({ page: 1, pageSize: 5 }),
        ]);
        if (cancelled) return;
        setNextProgrammes(progRes.items);
        setNextEvenements(evtRes.items);
        setRecentInfos(infosRes.items);
      } catch {
        // silencieux : on garde les listes vides
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Récup couleur par tone ----
  const toneColor = (tone: ModuleStat['tone']) => {
    switch (tone) {
      case 'violet':
        return '#A855F7';
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      case 'success':
        return colors.success;
      case 'primary':
      default:
        return colors.primary;
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Titre */}
      <div>
        <h1
          className="text-2xl font-black tracking-wide"
          style={{ color: colors.text }}
        >
          Bienvenue 👋
        </h1>
        <p
          className="mt-1 text-sm font-medium"
          style={{ color: colors.textSecondary }}
        >
          Vue d'ensemble de votre église et de vos outils d'administration.
        </p>
      </div>

      {/* ============ STATS GESTION DU CONTENU ============ */}
      <section>
        <h2
          className="mb-3 text-xs font-bold tracking-widest"
          style={{ color: colors.textMuted }}
        >
          GESTION DU CONTENU
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {CONTENT_MODULES.map((m) => (
            <StatCard
              key={m.key}
              module={m}
              count={stats?.[m.key as keyof Stats] ?? null}
              loading={statsLoading}
              toneColor={toneColor}
              colors={colors}
            />
          ))}
        </div>
      </section>

      {/* ============ STATS ADMINISTRATION ============ */}
      <section>
        <h2
          className="mb-3 text-xs font-bold tracking-widest"
          style={{ color: colors.textMuted }}
        >
          ADMINISTRATION
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {ADMIN_MODULES.map((m) => (
            <AdminCard
              key={m.key}
              module={m}
              count={stats?.[m.key as keyof Stats] ?? null}
              loading={statsLoading}
              toneColor={toneColor}
              colors={colors}
            />
          ))}
        </div>
      </section>

      {/* ============ À VENIR ============ */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Prochains programmes */}
        <div
          className="flex flex-col gap-3 rounded-xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" style={{ color: colors.primary }} />
              <h3
                className="text-sm font-extrabold tracking-wide"
                style={{ color: colors.text }}
              >
                Prochains programmes
              </h3>
            </div>
            <Link
              href="/programmes"
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{ color: colors.primary }}
            >
              Voir tout
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {nextProgrammes.length === 0 ? (
            <EmptySmall colors={colors} text="Aucun programme à venir." />
          ) : (
            <div className="flex flex-col gap-2">
              {nextProgrammes.map((p) => (
                <RowItem
                  key={p.id}
                  title={p.title}
                  subtitle={formatDay(p.startsAt) + (p.location ? ` · ${p.location}` : '')}
                  colors={colors}
                />
              ))}
            </div>
          )}
        </div>

        {/* Prochains événements */}
        <div
          className="flex flex-col gap-3 rounded-xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4" style={{ color: colors.info }} />
              <h3
                className="text-sm font-extrabold tracking-wide"
                style={{ color: colors.text }}
              >
                Prochains événements
              </h3>
            </div>
            <Link
              href="/evenements"
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{ color: colors.info }}
            >
              Voir tout
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {nextEvenements.length === 0 ? (
            <EmptySmall colors={colors} text="Aucun événement à venir." />
          ) : (
            <div className="flex flex-col gap-2">
              {nextEvenements.map((e) => (
                <RowItem
                  key={e.id}
                  title={e.title}
                  subtitle={formatDay(e.startsAt)}
                  colors={colors}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ DERNIÈRES INFOS ============ */}
      <section>
        <div
          className="flex flex-col gap-3 rounded-xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" style={{ color: colors.primary }} />
              <h3
                className="text-sm font-extrabold tracking-wide"
                style={{ color: colors.text }}
              >
                Dernières infos
              </h3>
            </div>
            <Link
              href="/infos"
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{ color: colors.primary }}
            >
              Voir tout
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentInfos.length === 0 ? (
            <EmptySmall colors={colors} text="Aucune information." />
          ) : (
            <div className="flex flex-col gap-2">
              {recentInfos.map((info) => (
                <RowItem
                  key={info.id}
                  title={info.title}
                  subtitle={info.summary}
                  tone={
                    info.priority === 'URGENT'
                      ? colors.danger
                      : info.priority === 'IMPORTANT'
                      ? colors.warning
                      : undefined
                  }
                  colors={colors}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------
// StatCard (modules contenu)
// ------------------------------------------------------------------
function StatCard({
  module: m,
  count,
  loading,
  toneColor,
  colors,
}: {
  module: ModuleStat;
  count: number | null;
  loading: boolean;
  toneColor: (t: ModuleStat['tone']) => string;
  colors: any;
}) {
  const Icon = m.icon;
  const tone = toneColor(m.tone);

  return (
    <Link
      href={m.href}
      className="group flex flex-col gap-3 rounded-xl border p-4 transition hover:-translate-y-0.5 hover:opacity-95"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: tone + '22' }}
        >
          <Icon className="h-5 w-5" style={{ color: tone }} />
        </div>
        {loading ? (
          <Loader2
            className="h-4 w-4 animate-spin"
            style={{ color: colors.textMuted }}
          />
        ) : (
          <span
            className="text-2xl font-black tracking-tight"
            style={{ color: colors.text }}
          >
            {count ?? '—'}
          </span>
        )}
      </div>
      <span
        className="text-sm font-bold"
        style={{ color: colors.text }}
      >
        {m.label}
      </span>
    </Link>
  );
}

// ------------------------------------------------------------------
// AdminCard (modules admin)
// ------------------------------------------------------------------
function AdminCard({
  module: m,
  count,
  loading,
  toneColor,
  colors,
}: {
  module: ModuleStat;
  count: number | null;
  loading: boolean;
  toneColor: (t: ModuleStat['tone']) => string;
  colors: any;
}) {
  const Icon = m.icon;
  const tone = toneColor(m.tone);

  return (
    <Link
      href={m.href}
      className="flex items-center gap-4 rounded-xl border p-4 transition hover:opacity-95"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: tone + '22' }}
      >
        <Icon className="h-6 w-6" style={{ color: tone }} />
      </div>

      <div className="flex flex-1 flex-col">
        <span
          className="text-sm font-extrabold tracking-wide"
          style={{ color: colors.text }}
        >
          {m.label}
        </span>
        <span
          className="text-[11px] font-medium"
          style={{ color: colors.textSecondary }}
        >
          {m.key === 'users'
            ? 'Comptes et codes d\u2019accès'
            : m.key === 'people'
            ? 'Répertoire des personnes'
            : 'Groupes assignables'}
        </span>
      </div>

      {loading ? (
        <Loader2
          className="h-4 w-4 animate-spin"
          style={{ color: colors.textMuted }}
        />
      ) : (
        <span
          className="text-2xl font-black tracking-tight"
          style={{ color: colors.text }}
        >
          {count ?? '—'}
        </span>
      )}
    </Link>
  );
}

// ------------------------------------------------------------------
// RowItem (prochain programme / événement / info)
// ------------------------------------------------------------------
function RowItem({
  title,
  subtitle,
  tone,
  colors,
}: {
  title: string;
  subtitle: string;
  tone?: string;
  colors: any;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-3"
      style={{
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.border,
      }}
    >
      {tone && (
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: tone }}
        />
      )}
      <div className="flex flex-1 flex-col gap-0.5">
        <span
          className="text-sm font-bold"
          style={{ color: colors.text }}
        >
          {title}
        </span>
        <span
          className="text-[11px] font-medium"
          style={{ color: colors.textSecondary }}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// EmptySmall
// ------------------------------------------------------------------
function EmptySmall({ text, colors }: { text: string; colors: any }) {
  return (
    <div
      className="rounded-lg border border-dashed p-4 text-center text-xs"
      style={{
        borderColor: colors.border,
        color: colors.textMuted,
      }}
    >
      {text}
    </div>
  );
}

// ------------------------------------------------------------------
// Utils
// ------------------------------------------------------------------
const MONTHS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];
const DAYS_SHORT = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];

function formatDay(iso: string | null): string {
  if (!iso) return 'Date à préciser';
  const d = new Date(iso);
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}