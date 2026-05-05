/**
 * Page d'echantillon du Design System "Direction A — papier chaleureux".
 *
 * Objectif : permettre la validation visuelle des tokens (light + dark)
 * avant de propager le DS aux composants reels (Phases 3 a 9).
 *
 * Cette page est ISOLEE : elle ne consomme aucune logique metier, aucun
 * hook, aucune donnee Supabase. Elle peut etre supprimee a la fin de la
 * migration sans impact (Phase 11).
 *
 * Acces : /ds-preview (route publique).
 */

import React, { useState, useEffect } from 'react';

const SAMPLE_CLUBS = [
  { name: 'Volley', token: 'volley', icon: '🏐' },
  { name: 'Théâtre', token: 'theatre', icon: '🎭' },
  { name: 'Photo', token: 'photo', icon: '📸' },
  { name: 'Rando', token: 'rando', icon: '🌱' },
  { name: 'Échecs', token: 'echecs', icon: '♟︎' },
] as const;

const PALETTE_LIGHT: Array<[string, string]> = [
  ['#fbf8f3', 'papier'],
  ['#f4efe6', 'papier-2'],
  ['#ede6d8', 'papier-3'],
  ['#1f1b16', 'encre'],
  ['#5a5048', 'encre-2'],
  ['#8a7f72', 'encre-3'],
  ['#c25a3c', 'terracotta'],
  ['#a84a2e', 'terracotta-deep'],
  ['#fbe5d9', 'accent-soft'],
  ['#fce896', 'highlight'],
  ['#5e8a5b', 'success'],
  ['#d49b3a', 'warning'],
  ['#b8553f', 'danger'],
  ['#5a7aa3', 'info'],
];

const PILL_VARIANTS = [
  { label: 'default', cls: 'bg-papier-2 text-encre-2 border border-[var(--ds-border)]' },
  { label: 'solid', cls: 'bg-encre text-papier border border-encre' },
  { label: 'accent', cls: 'bg-terracotta-soft text-terracotta-deep border border-[rgba(194,90,60,.15)]' },
  { label: 'success', cls: 'bg-ds-success-soft text-[#3f6b3d] border border-[rgba(94,138,91,.18)]' },
  { label: 'warning', cls: 'bg-ds-warning-soft text-[#8a6620] border border-[rgba(212,155,58,.22)]' },
  { label: 'danger', cls: 'bg-ds-danger-soft text-[#8a3a26] border border-[rgba(184,85,63,.18)]' },
  { label: 'info', cls: 'bg-ds-info-soft text-[#3d5878] border border-[rgba(90,122,163,.18)]' },
  { label: 'highlight', cls: 'bg-highlight text-[#6b5816] border border-[rgba(212,155,58,.18)]' },
];

export default function DSPreview() {
  // Bascule locale du dark mode pour comparer instantanement.
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  return (
    <div className="min-h-screen bg-papier text-encre font-sans">
      {/* ───── Header ───── */}
      <header className="border-b border-[var(--ds-border)] bg-papier sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[.12em] text-encre-3 mb-2">
              système de design · v1 · preview
            </div>
            <h1 className="font-display text-4xl leading-none">
              Direction A — <span className="ds-hl">papier chaleureux</span>
            </h1>
            <p className="mt-3 text-encre-2 text-[15px] max-w-2xl">
              Echantillon de validation. Bascule dark/light pour controler la coherence
              avant de propager le DS aux ecrans reels.
            </p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="px-4 py-2 rounded-ds-sm bg-encre text-papier font-semibold text-sm hover:opacity-90 transition"
          >
            {dark ? '☀ Mode clair' : '☾ Mode sombre'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ───── Section : Palette ───── */}
        <section className="bg-papier border border-[var(--ds-border)] rounded-ds-md p-6 shadow-ds-sm">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Palette principale
          </h2>
          <div className="grid grid-cols-7 gap-3">
            {PALETTE_LIGHT.map(([hex, name]) => (
              <div
                key={name}
                className="h-16 rounded-ds-sm border border-[var(--ds-border)] flex items-end p-2 font-mono text-[10px]"
                style={{ background: hex, color: ['#1f1b16', '#5a5048', '#a84a2e', '#b8553f', '#5e8a5b', '#5a7aa3', '#d49b3a'].includes(hex) ? '#fff' : '#1f1b16' }}
              >
                <div>
                  <div className="opacity-90">{name}</div>
                  <div className="opacity-60">{hex}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mt-6 mb-4">
            Couleurs par club (5 univers)
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {SAMPLE_CLUBS.map(c => (
              <div key={c.token} className={`ds-hero-${c.token} h-20 rounded-ds-sm flex items-center justify-center font-display text-xl`}>
                <span className="mr-2">{c.icon}</span> {c.name}
              </div>
            ))}
          </div>
        </section>

        {/* ───── Section : Typographie ───── */}
        <section className="bg-papier border border-[var(--ds-border)] rounded-ds-md p-6 shadow-ds-sm">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Typographie
          </h2>
          <div className="space-y-2">
            <div className="font-display text-5xl leading-tight">DM Serif Display · 48px</div>
            <div className="font-display italic text-3xl text-encre-2">DM Serif Display italic · 30px</div>
            <div className="font-sans text-2xl">DM Sans regular · 24px</div>
            <div className="font-sans font-semibold text-lg">DM Sans semibold · 18px</div>
            <div className="font-sans text-sm text-encre-2">DM Sans body · 14px — texte courant, lisible et discret.</div>
            <div className="font-mono text-xs text-encre-3 uppercase tracking-[.08em]">JetBrains Mono · labels techniques</div>
          </div>
        </section>

        {/* ───── Section : Boutons ───── */}
        <section className="bg-papier border border-[var(--ds-border)] rounded-ds-md p-6 shadow-ds-sm">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Boutons
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <button className="px-4 py-2.5 rounded-xl bg-terracotta text-white font-semibold hover:bg-terracotta-deep transition shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_1px_2px_rgba(168,74,46,.25)]">
              Action principale
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-papier text-encre font-semibold border border-[var(--ds-border-2)] hover:bg-papier-2 transition">
              Action secondaire
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-transparent text-encre font-semibold hover:bg-papier-2 transition">
              Ghost
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-encre text-papier font-semibold hover:opacity-90 transition">
              Inverse
            </button>
          </div>
        </section>

        {/* ───── Section : Pills ───── */}
        <section className="bg-papier border border-[var(--ds-border)] rounded-ds-md p-6 shadow-ds-sm">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Pills (badges sémantiques)
          </h2>
          <div className="flex flex-wrap gap-2">
            {PILL_VARIANTS.map(p => (
              <span
                key={p.label}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${p.cls}`}
              >
                {p.label}
              </span>
            ))}
          </div>
        </section>

        {/* ───── Section : Cards + avatar + progress ───── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-papier border border-[var(--ds-border)] rounded-ds-md p-5 shadow-ds-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="ds-av-1 w-10 h-10 rounded-full inline-flex items-center justify-center font-semibold text-sm">MD</div>
              <div>
                <div className="font-display text-lg leading-tight">Marie Dupont</div>
                <div className="font-mono text-[10px] uppercase tracking-[.08em] text-encre-3">Capitaine · Volley</div>
              </div>
            </div>
            <p className="text-sm text-encre-2">Match contre les Aigles samedi à 14h. <span className="ds-hl">Présence obligatoire</span>.</p>
            <div className="ds-progress mt-4"><span style={{ width: '72%' }} /></div>
            <div className="font-mono text-[10px] text-encre-3 mt-1">Inscriptions · 18/25</div>
          </div>

          <div className="bg-papier border border-[var(--ds-border)] rounded-ds-md p-5 shadow-ds-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-terracotta-soft text-terracotta-deep border border-[rgba(194,90,60,.15)]">Théâtre</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-highlight text-[#6b5816]">À ne pas rater</span>
            </div>
            <h3 className="font-display text-xl leading-tight mb-2">Première de la saison</h3>
            <p className="text-sm text-encre-2">La troupe joue son nouveau spectacle vendredi. Trois représentations.</p>
            <div className="mt-4 flex -space-x-2">
              <div className="ds-av-2 w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-semibold border-2 border-papier">AB</div>
              <div className="ds-av-3 w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-semibold border-2 border-papier">CD</div>
              <div className="ds-av-4 w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-semibold border-2 border-papier">EF</div>
              <div className="ds-av-5 w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-semibold border-2 border-papier">+12</div>
            </div>
          </div>

          <div className="ds-placeholder min-h-[180px]">
            Zone à imager · placeholder hachuré
          </div>
        </section>

        {/* ───── Section : Sidebar mock (desktop) ───── */}
        <section className="bg-papier border border-[var(--ds-border)] rounded-ds-md overflow-hidden shadow-ds-sm">
          <div className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 px-6 pt-6 mb-3">
            Chrome desktop (apercu)
          </div>
          <div className="flex h-72">
            <aside className="w-56 bg-papier-2 border-r border-[var(--ds-border)] p-4 space-y-1">
              {['Tableau de bord', 'Communications', 'Membres', 'Calendrier', 'Sponsors', 'Paramètres'].map((item, i) => (
                <div
                  key={item}
                  className={`px-3 py-2 rounded-lg text-sm font-medium cursor-default ${i === 1 ? 'bg-terracotta-soft text-terracotta-deep' : 'text-encre-2 hover:bg-papier-3'}`}
                >
                  {item}
                </div>
              ))}
            </aside>
            <div className="flex-1 p-6">
              <h3 className="font-display text-2xl mb-2">Communications</h3>
              <p className="text-sm text-encre-2 mb-4">Aperçu de la zone de contenu principale dans une vue admin desktop.</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-papier border border-[var(--ds-border)] rounded-ds-sm p-3 text-xs text-encre-2">
                    <div className="font-mono text-[10px] uppercase text-encre-3 mb-1">Carte {n}</div>
                    Contenu d'exemple sur fond papier.
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center font-mono text-[10px] uppercase tracking-[.12em] text-encre-3 py-6">
          Page d'echantillon · sera supprimee en Phase 11
        </footer>
      </main>
    </div>
  );
}
