// app/(auth)/login/page.tsx
'use client';

import { KeyRound, LogIn, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = code.length === CODE_LENGTH && !loading;

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
      setError('Code invalide. Vérifie auprès du secrétariat.');
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
  const textWhiteMuted = 'rgba(255,255,255,0.55)';

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Carrés décoratifs */}
      <div
        className="pointer-events-none absolute"
        style={{ top: '-8vh', right: '-35vw', width: '85vh', height: '85vh' }}
      >
        <div
          className="h-full w-full rounded-[60px] shadow-2xl"
          style={{ backgroundColor: colors.primary, transform: 'rotate(-15deg)' }}
        />
      </div>
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '-8vh',
          left: '-35vw',
          width: '85vh',
          height: '85vh',
        }}
      >
        <div
          className="h-full w-full rounded-[60px] shadow-2xl"
          style={{ backgroundColor: colors.primary, transform: 'rotate(-15deg)' }}
        />
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-8">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <div
              className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 shadow-2xl"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                backgroundColor: colors.surface,
              }}
            >
              <span className="text-3xl font-black tracking-widest">SSI</span>
            </div>

            <h1
              className="text-3xl font-black tracking-wide"
              style={{ color: textWhite }}
            >
              Accès à l'administration
            </h1>
            <p
              className="mb-4 max-w-xs text-center text-sm"
              style={{ color: textWhiteSoft }}
            >
              Entrez le code à 10 caractères fourni par le secrétariat.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2">
              <div
                className="flex h-14 w-full items-center gap-3 rounded-xl border-2 px-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: error ? colors.danger : 'rgba(255,255,255,0.2)',
                }}
              >
                <KeyRound
                  className="h-5 w-5 shrink-0"
                  style={{ color: error ? colors.danger : textWhiteSoft }}
                />
                <input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Ex : A7K2P9M4X1"
                  maxLength={CODE_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                  className="h-full flex-1 bg-transparent text-lg font-extrabold tracking-[0.3em] outline-none"
                  style={{ color: textWhite }}
                />
                {code.length > 0 && !loading && (
                  <button type="button" onClick={() => setCode('')}>
                    <X className="h-4 w-4" style={{ color: textWhiteSoft }} />
                  </button>
                )}
              </div>

              <div className="flex h-5 items-center justify-between px-1 text-xs">
                <span style={{ color: textWhiteSoft }}>
                  {code.length}/{CODE_LENGTH}
                </span>
                {error && (
                  <span style={{ color: colors.danger }} className="font-bold">
                    {error}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full font-extrabold tracking-wider shadow-2xl transition disabled:opacity-50"
                style={{
                  backgroundColor: canSubmit
                    ? colors.primary
                    : 'rgba(255,255,255,0.1)',
                  color: canSubmit ? colors.onPrimary : textWhiteMuted,
                }}
              >
                {loading ? (
                  <span>Connexion…</span>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: textWhiteMuted }}>
          Accès réservé aux administrateurs de l'église
        </p>
      </div>
    </div>
  );
}