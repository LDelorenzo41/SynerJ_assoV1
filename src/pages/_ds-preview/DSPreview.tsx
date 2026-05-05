/**
 * Page d'echantillon du Design System "Direction A — papier chaleureux".
 *
 * Phase 2b : la page consomme desormais les primitives de
 * src/components/ui/ — c'est la double vocation de cette page :
 *   1) valider visuellement les tokens (light + dark)
 *   2) servir de showcase / banc d'essai pour les composants UI
 *      avant qu'ils ne soient propages dans les vraies pages.
 *
 * Cette page est ISOLEE : elle ne consomme aucune logique metier, aucun
 * hook applicatif, aucune donnee Supabase. Elle sera supprimee en
 * Phase 11.
 *
 * Acces : /ds-preview (route publique).
 */

import { useState, useEffect } from 'react';
import { Bell, Search, Plus, Heart, Send, Filter } from 'lucide-react';
import {
  Button,
  Pill,
  Card,
  Avatar,
  Chip,
  AppBar,
  MobileSectionTitle,
  FAB,
  HatchPlaceholder,
} from '../../components/ui';

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

const DARK_TEXT_HEXES = ['#1f1b16', '#5a5048', '#a84a2e', '#b8553f', '#5e8a5b', '#5a7aa3', '#d49b3a'];

export default function DSPreview() {
  // Bascule locale du dark mode pour comparer instantanement.
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [activeChip, setActiveChip] = useState<string>('all');

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
          <Button variant="primary" onClick={() => setDark(d => !d)}>
            {dark ? '☀ Mode clair' : '☾ Mode sombre'}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ───── Section : Palette ───── */}
        <Card padding="lg">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Palette principale
          </h2>
          <div className="grid grid-cols-7 gap-3">
            {PALETTE_LIGHT.map(([hex, name]) => (
              <div
                key={name}
                className="h-16 rounded-ds-sm border border-[var(--ds-border)] flex items-end p-2 font-mono text-[10px]"
                style={{ background: hex, color: DARK_TEXT_HEXES.includes(hex) ? '#fff' : '#1f1b16' }}
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
        </Card>

        {/* ───── Section : Typographie ───── */}
        <Card padding="lg">
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
        </Card>

        {/* ───── Section : Boutons (primitives) ───── */}
        <Card padding="lg">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Boutons (primitive Button)
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary">Action principale</Button>
              <Button variant="secondary">Action secondaire</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" leftIcon={<Plus size={16} />}>Avec icone</Button>
              <Button variant="primary" rightIcon={<Send size={16} />}>Envoyer</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="secondary" size="sm" fullWidth className="max-w-xs">FullWidth (capped)</Button>
            </div>
          </div>
        </Card>

        {/* ───── Section : Pills ───── */}
        <Card padding="lg">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Pills (primitive Pill, 9 variantes)
          </h2>
          <div className="flex flex-wrap gap-2">
            <Pill>default</Pill>
            <Pill variant="solid">solid</Pill>
            <Pill variant="accent">accent</Pill>
            <Pill variant="success">success</Pill>
            <Pill variant="warning">warning</Pill>
            <Pill variant="danger">danger</Pill>
            <Pill variant="info">info</Pill>
            <Pill variant="highlight">highlight</Pill>
            <Pill variant="ghost">ghost</Pill>
            <Pill variant="accent" icon={<Bell size={12} />}>avec icone</Pill>
          </div>
        </Card>

        {/* ───── Section : Chips (filtres) ───── */}
        <Card padding="lg">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 mb-4">
            Chips (filtre actif/inactif — clic pour basculer)
          </h2>
          <div className="flex flex-wrap gap-2">
            <Chip leftIcon={<Filter size={14} />} active={activeChip === 'all'} onClick={() => setActiveChip('all')}>
              Tous les clubs
            </Chip>
            {SAMPLE_CLUBS.map(c => (
              <Chip key={c.token} active={activeChip === c.token} onClick={() => setActiveChip(c.token)}>
                <span>{c.icon}</span> {c.name}
              </Chip>
            ))}
          </div>
        </Card>

        {/* ───── Section : Cards + avatar + progress + placeholder ───── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name="Marie Dupont" size={40} n={1} />
              <div>
                <div className="font-display text-lg leading-tight">Marie Dupont</div>
                <div className="font-mono text-[10px] uppercase tracking-[.08em] text-encre-3">Capitaine · Volley</div>
              </div>
            </div>
            <p className="text-sm text-encre-2">Match contre les Aigles samedi à 14h. <span className="ds-hl">Présence obligatoire</span>.</p>
            <div className="ds-progress mt-4"><span style={{ width: '72%' }} /></div>
            <div className="font-mono text-[10px] text-encre-3 mt-1">Inscriptions · 18/25</div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Pill variant="accent">Théâtre</Pill>
              <Pill variant="highlight">À ne pas rater</Pill>
            </div>
            <h3 className="font-display text-xl leading-tight mb-2">Première de la saison</h3>
            <p className="text-sm text-encre-2">La troupe joue son nouveau spectacle vendredi. Trois représentations.</p>
            <div className="mt-4 flex -space-x-2">
              <Avatar name="Alice B" size={32} n={2} className="border-2 border-papier" />
              <Avatar name="Carl D" size={32} n={3} className="border-2 border-papier" />
              <Avatar name="Eve F" size={32} n={4} className="border-2 border-papier" />
              <Avatar name="+12" size={32} n={5} className="border-2 border-papier" />
            </div>
          </Card>

          <HatchPlaceholder height={180} caption="Zone à imager · placeholder hachuré" badge="PLACEHOLDER" />
        </section>

        {/* ───── Section : AppBar + MobileSectionTitle + FAB (mobile shell) ───── */}
        <Card padding="none" className="overflow-hidden">
          <div className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 px-6 pt-6 mb-3">
            Mobile · AppBar + MobileSectionTitle + FAB
          </div>
          <div className="px-6 pb-6 flex justify-center">
            {/* Mock d'un ecran de telephone simplifie */}
            <div className="relative w-[320px] h-[520px] rounded-[28px] border-[6px] border-[#1a1814] overflow-hidden bg-papier shadow-ds-md">
              <AppBar
                title="Fil"
                subtitle="3 nouvelles publications"
                left={<Avatar name="Yo Lo" size={32} n={1} />}
                right={<button className="p-1.5 rounded-lg hover:bg-papier-2"><Bell size={18} /></button>}
              />
              <MobileSectionTitle action={<button className="text-[11px] text-terracotta-deep">Tout voir</button>}>
                Aujourd'hui
              </MobileSectionTitle>
              <div className="px-4 space-y-2">
                <Card padding="sm">
                  <div className="flex items-start gap-2">
                    <Avatar name="Volley Club" size={28} n={1} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-tight">Volley Club</div>
                      <div className="text-xs text-encre-2 mt-0.5">Match samedi 14h · présence requise</div>
                    </div>
                    <Heart size={16} className="text-encre-3 mt-0.5" />
                  </div>
                </Card>
                <Card padding="sm">
                  <div className="flex items-start gap-2">
                    <Avatar name="Theatre" size={28} n={2} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-tight">Troupe Théâtre</div>
                      <div className="text-xs text-encre-2 mt-0.5">Répétition générale ce soir 20h</div>
                    </div>
                  </div>
                </Card>
              </div>
              <MobileSectionTitle>Hier</MobileSectionTitle>
              <div className="px-4">
                <HatchPlaceholder height={70} caption="Placeholder photo de la rando" />
              </div>
              <FAB icon={<Plus size={22} strokeWidth={2} />} />
              {/* Faux tabbar */}
              <div className="absolute bottom-0 left-0 right-0 h-14 border-t border-[var(--ds-border)] bg-papier flex items-center justify-around text-[11px] text-encre-3">
                <span className="text-terracotta">Fil</span>
                <span>Agenda</span>
                <span>Mon club</span>
                <span>Plus</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ───── Section : Sidebar mock (desktop) ───── */}
        <Card padding="none" className="overflow-hidden">
          <div className="font-mono text-[11px] uppercase tracking-[.08em] text-encre-3 px-6 pt-6 mb-3">
            Desktop · chrome (apercu)
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-2xl">Communications</h3>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" leftIcon={<Search size={14} />}>Rechercher</Button>
                  <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>Nouvelle</Button>
                </div>
              </div>
              <p className="text-sm text-encre-2 mb-4">Aperçu de la zone de contenu principale dans une vue admin desktop.</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(n => (
                  <Card key={n} padding="sm">
                    <div className="font-mono text-[10px] uppercase text-encre-3 mb-1">Carte {n}</div>
                    <div className="text-xs text-encre-2">Contenu d'exemple sur fond papier.</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <footer className="text-center font-mono text-[10px] uppercase tracking-[.12em] text-encre-3 py-6">
          Page d'echantillon · sera supprimee en Phase 11
        </footer>
      </main>
    </div>
  );
}
