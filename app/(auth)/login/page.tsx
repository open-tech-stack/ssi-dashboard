// app/(auth)/login/page.tsx
'use client';

import { Eye, EyeOff, KeyRound, LogIn, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { useAuth } from '@/contexts/AuthContext';

const CODE_LENGTH = 10;

function isValidCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{10}$/.test(code.trim().toUpperCase());
}

export default function LoginPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

  const canSubmit = code.length === CODE_LENGTH && !loading;
  const progress = code.length / CODE_LENGTH; // 0 → 1

  // 🎨 Couleur de la barre en fonction de l'avancement
  const progressColor =
    code.length === 0
      ? 'transparent'
      : code.length < 4
        ? colors.danger // rouge : trop court
        : code.length < 7
          ? colors.warning // orange : en cours
          : code.length < CODE_LENGTH
            ? colors.info // bleu clair : presque
            : colors.success; // vert : complet ✅

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidCodeFormat(code)) {
      setError('Le code doit contenir 10 caractères (lettres et chiffres).');
      return;
    }

    setLoading(true);
    const result = await login(code);
    setLoading(false);

    if (result === 'ok') {
      router.push('/dashboard');
      return;
    }

    if (result === 'invalid') {
      setError('Code invalide. Vérifie auprès votre Admin');
      return;
    }

    if (result === 'forbidden') {
      setError("Ce code n'a pas les droits d'administrateur.");
      return;
    }

    setError('Impossible de joindre le serveur. Réessaie plus tard.');
  };

  const handleChange = (v: string) => {
    const cleaned = v
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH);
    setCode(cleaned);
    if (error) setError(null);
  };

  const textWhite = '#FFFFFF';
  const textWhiteSoft = 'rgba(255,255,255,0.75)';
  const textWhiteMuted = 'rgba(255,255,255,0.5)';

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : 'rgba(255,255,255,0.15)';

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      {/* 🎨 Fond animé */}
      <AnimatedBackground intensity={0.95} particleCount={24} />

      {/* Contenu */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-between px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex w-full flex-1 items-center justify-center py-4 sm:py-6">
          <div className="flex w-full max-w-[22rem] flex-col items-center gap-3 sm:max-w-md sm:gap-4">
            {/* Logo */}
            <div
              className="relative mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 shadow-2xl animate-halo-pulse sm:mb-4 sm:h-24 sm:w-24"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: `0 0 40px ${colors.primary}55, 0 0 80px ${colors.primary}22`,
              }}
            >
              <Image
                src="/images/logo.png"
                alt="SSI — SIM SOMGANDE Information"
                width={96}
                height={96}
                priority
                className="h-full w-full object-contain p-2"
              />
            </div>

            {/* Titre */}
            <h1
              className="px-2 text-center text-xl font-black leading-tight tracking-wide sm:text-2xl md:text-3xl"
              style={{ color: textWhite }}
            >
              Accès à l&apos;administration
            </h1>

            <p
              className="mb-2 max-w-[17rem] text-center text-xs sm:mb-4 sm:max-w-xs sm:text-sm"
              style={{ color: textWhiteSoft }}
            >
              Entrez le code à 10 caractères fourni par l'Admin.
            </p>

            {/* Formulaire */}
            <form
              onSubmit={handleSubmit}
              className="w-full space-y-2"
              noValidate
            >
              {/* ---------- Input code ---------- */}
              <div
                className="flex h-12 w-full items-center gap-2 rounded-xl border-2 px-3 transition-all duration-200 sm:h-14 sm:gap-3 sm:px-4"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderColor,
                  boxShadow: focused
                    ? `0 0 0 4px ${colors.primary}22, 0 8px 32px rgba(0,0,0,0.3)`
                    : '0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                <KeyRound
                  className="h-4 w-4 shrink-0 transition-colors sm:h-5 sm:w-5"
                  style={{
                    color: error
                      ? colors.danger
                      : focused
                        ? colors.primary
                        : textWhiteSoft,
                  }}
                />

                <input
                  ref={inputRef}
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="A7K2P9M4X1"
                  maxLength={CODE_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  inputMode="text"
                  enterKeyHint="go"
                  disabled={loading}
                  className="h-full min-w-0 flex-1 bg-transparent text-base font-extrabold tracking-[0.15em] outline-none placeholder:font-normal placeholder:tracking-normal placeholder:opacity-40 sm:text-lg sm:tracking-[0.3em]"
                  style={{ color: textWhite }}
                />

                {/* 👁️ Toggle show/hide */}
                {code.length > 0 && !loading && (
                  <button
                    type="button"
                    onClick={() => setShowCode((s) => !s)}
                    className="shrink-0 rounded-full p-1 transition hover:bg-white/10"
                    aria-label={showCode ? 'Masquer le code' : 'Afficher le code'}
                    aria-pressed={showCode}
                    tabIndex={-1}
                  >
                    {showCode ? (
                      <EyeOff
                        className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        style={{ color: textWhiteSoft }}
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        style={{ color: textWhiteSoft }}
                      />
                    )}
                  </button>
                )}

                {/* ❌ Clear (visible si pas d'erreur, sinon on garde le eye) */}
                {code.length > 0 && !loading && (
                  <button
                    type="button"
                    onClick={() => {
                      setCode('');
                      inputRef.current?.focus();
                    }}
                    className="shrink-0 rounded-full p-1 transition hover:bg-white/10"
                    aria-label="Effacer le code"
                    tabIndex={-1}
                  >
                    <X
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      style={{ color: textWhiteSoft }}
                    />
                  </button>
                )}
              </div>

              {/* ---------- Barre de progression + erreur ---------- */}
              <div className="space-y-1.5 px-1">
                {/* Barre */}
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: progressColor,
                      boxShadow:
                        code.length > 0
                          ? `0 0 12px ${progressColor}, 0 0 4px ${progressColor}`
                          : 'none',
                    }}
                  />

                  {/* Effet "shine" quand on atteint 10/10 */}
                  {code.length === CODE_LENGTH && (
                    <div
                      className="absolute inset-0 animate-[progressShine_1.8s_ease-in-out_infinite]"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)`,
                      }}
                    />
                  )}
                </div>

                {/* Ligne info : segments + statut + erreur */}
                <div className="flex min-h-[16px] items-center justify-between gap-2 text-[11px] sm:min-h-[18px] sm:text-xs">
                  {/* Points indicateurs */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                      const filled = i < code.length;
                      return (
                        <span
                          key={i}
                          className="h-1 w-1 rounded-full transition-all duration-200 sm:h-1.5 sm:w-1.5"
                          style={{
                            backgroundColor: filled
                              ? progressColor
                              : 'rgba(255,255,255,0.15)',
                            transform: filled ? 'scale(1.4)' : 'scale(1)',
                            boxShadow: filled
                              ? `0 0 6px ${progressColor}`
                              : 'none',
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Message de statut OU erreur */}
                  <span
                    className="truncate text-right font-semibold leading-tight transition-colors"
                    style={{
                      color: error
                        ? colors.danger
                        : code.length === 0
                          ? textWhiteMuted
                          : progressColor,
                    }}
                    role={error ? 'alert' : undefined}
                  >
                    {error
                      ? error
                      : code.length === 0
                        ? 'En attente…'
                        : code.length < 4
                          ? 'Trop court'
                          : code.length < 7
                            ? 'Continuez…'
                            : code.length < CODE_LENGTH
                              ? 'Presque !'
                              : '✓ Code complet'}
                  </span>
                </div>
              </div>

              {/* ---------- Bouton submit ---------- */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold tracking-wider transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:scale-[1.02] enabled:active:scale-[0.98] sm:mt-3 sm:h-14 sm:text-base"
                style={{
                  backgroundColor: canSubmit
                    ? colors.primary
                    : 'rgba(255,255,255,0.08)',
                  color: canSubmit ? colors.onPrimary : textWhiteMuted,
                  boxShadow: canSubmit
                    ? `0 10px 40px ${colors.primary}66, 0 0 0 1px ${colors.primary}88 inset`
                    : 'none',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connexion…
                  </span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p
          className="mt-4 text-center text-[10px] leading-tight sm:text-xs"
          style={{ color: textWhiteMuted }}
        >
          Accès réservé aux administrateurs de l&apos;église
        </p>
      </div>
    </div>
  );
}