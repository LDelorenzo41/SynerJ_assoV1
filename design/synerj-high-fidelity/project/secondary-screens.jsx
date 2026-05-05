// Secondary modules — Site public, Mailing, Sponsors, Invitations

// ─── Site public du club Volley ──────────────────────────────
function SitePublicScreen() {
  return (
    <Phone>
      {/* Fake browser chrome */}
      <div style={{
        height: 28, background: 'var(--papier-2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px',
        flexShrink: 0,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: '#e07a5f' }}/>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: '#e8c468' }}/>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: '#7aa885' }}/>
        <div className="mono" style={{
          flex: 1, fontSize: 10.5, color: 'var(--encre-3)',
          background: 'var(--papier)', borderRadius: 6,
          padding: '2px 8px', textAlign: 'center', marginLeft: 8,
          border: '1px solid var(--border)'
        }}>volley.synerj.app</div>
      </div>

      <div className="phone-scroll" style={{ padding: 0 }}>
        {/* Hero gradient */}
        <div className="hero-volley" style={{ padding: '20px 16px 22px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 999,
              background: 'var(--club-volley)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 22,
            }}>V</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--encre-2)', letterSpacing: '.06em' }}>SYNERJ · CLUB</div>
          </div>
          <div className="serif" style={{ fontSize: 32, lineHeight: 1, color: 'var(--encre)' }}>
            Volley Club
          </div>
          <div style={{ fontSize: 13, color: 'var(--encre-2)', marginTop: 4 }}>
            depuis 1998 · 34 membres · une famille
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14, padding: '8px 14px', fontSize: 13 }}>
            Rejoindre le club <Icon.ArrowRight size={13}/>
          </button>
        </div>

        <div style={{ padding: '14px 14px 80px' }}>
          <MobileSectionTitle>Prochains événements</MobileSectionTitle>
          <div className="card" style={{ padding: 10, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 46, textAlign: 'center', padding: '4px 0',
              background: 'var(--accent-soft)', borderRadius: 9, color: 'var(--terracotta-deep)'
            }}>
              <div className="mono" style={{ fontSize: 9 }}>SAM</div>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1 }}>17</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Tournoi ouvert</div>
              <div style={{ fontSize: 11.5, color: 'var(--encre-2)' }}>Gymnase A · venez encourager 🙌</div>
            </div>
          </div>

          <MobileSectionTitle>Nos partenaires</MobileSectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { tier: 'Or', bg: '#f4dc8c', fg: '#7a5e10' },
              { tier: 'Or', bg: '#f4dc8c', fg: '#7a5e10' },
              { tier: 'Argent', bg: '#d8d4cc', fg: '#3a342c' },
              { tier: 'Argent', bg: '#d8d4cc', fg: '#3a342c' },
              { tier: 'Bronze', bg: '#dcb892', fg: '#5a3a16' },
              { tier: 'Bronze', bg: '#dcb892', fg: '#5a3a16' },
            ].map((s, i) => (
              <div key={i} style={{
                aspectRatio: '1.4', borderRadius: 10,
                background:
                  'repeating-linear-gradient(45deg, rgba(31,27,22,.05) 0 1px, transparent 1px 7px), var(--papier-2)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'flex-end', padding: 6,
              }}>
                <span style={{
                  fontSize: 9, padding: '1.5px 6px', borderRadius: 999,
                  background: s.bg, color: s.fg, fontWeight: 600,
                }}>{s.tier}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, padding: 14, borderRadius: 14,
            background: 'var(--accent-soft)', textAlign: 'center'
          }}>
            <div className="serif" style={{ fontSize: 18, marginBottom: 4 }}>Rejoindre le club →</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-2)' }}>en 30 secondes</div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ─── Mailing (Club Admin mobile preview) ─────────────────────
function MailingScreen() {
  return (
    <Phone>
      <AppBar
        title="Mailing"
        subtitle="toucher au-delà de l'app"
        right={<button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 12 }}><Icon.Plus size={13}/></button>}
      />
      <div style={{ padding: '10px 12px 6px', display: 'flex', gap: 6, flexShrink: 0 }}>
        <Chip active>Tout</Chip>
        <Chip>Brouillons</Chip>
        <Chip>Envoyés</Chip>
        <Chip>Auto</Chip>
      </div>

      <div className="phone-scroll" style={{ padding: '6px 12px 16px' }}>
        {/* Draft */}
        <div className="card" style={{ padding: 12, marginBottom: 10, borderColor: 'rgba(212,155,58,.32)', background: 'linear-gradient(180deg, var(--papier) 0%, var(--highlight-soft) 220%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span className="pill warning" style={{ fontSize: 10 }}>Brouillon</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--encre-3)' }}>écrit hier · 14:22</span>
          </div>
          <div className="serif" style={{ fontSize: 18, lineHeight: 1.15, marginBottom: 4 }}>Relance cotisations</div>
          <div style={{ fontSize: 12.5, color: 'var(--encre-2)', marginBottom: 10, lineHeight: 1.4 }}>
            « Salut {'{prénom}'} 👋 plus que 12 d'entre nous à régler la cotisation… »
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="pill" style={{ fontSize: 10 }}>→ 12 destinataires</span>
            <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '5px 10px', fontSize: 12 }}>
              <Icon.Send size={12}/> Envoyer
            </button>
          </div>
        </div>

        {/* Sent */}
        <div className="card" style={{ padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span className="pill success" style={{ fontSize: 10 }}><Icon.Check size={10}/> Envoyé</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--encre-3)' }}>il y a 5 jours</span>
          </div>
          <div className="serif" style={{ fontSize: 17, lineHeight: 1.15, marginBottom: 8 }}>Inscription tournoi printemps</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { v: '34', l: 'envois' },
              { v: '78%', l: 'ouverts' },
              { v: '23', l: 'inscrits' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--papier-2)', borderRadius: 9, padding: '7px 8px',
                textAlign: 'center'
              }}>
                <div className="serif" style={{ fontSize: 17 }}>{s.v}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--encre-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <MobileSectionTitle>Modèles</MobileSectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { t: 'Bienvenue', e: '👋', tone: 'var(--accent-soft)' },
            { t: 'Cotisation', e: '🌱', tone: 'var(--success-soft)' },
            { t: 'Événement', e: '🏆', tone: 'var(--highlight-soft)' },
            { t: 'AG annuelle', e: '🤝', tone: 'var(--info-soft)' },
          ].map((m, i) => (
            <div key={i} className="card" style={{ padding: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: m.tone, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, marginBottom: 6
              }}>{m.e}</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{m.t}</div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--encre-3)', marginTop: 2 }}>modèle</div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// ─── Sponsors ────────────────────────────────────────────────
function SponsorsScreen() {
  const tiers = [
    { name: 'Platine', count: 1, bg: '#1f1b16', fg: '#fbf8f3', accent: '#e8e3d6' },
    { name: 'Or', count: 3, bg: '#c4a032', fg: '#fff', accent: '#f4dc8c' },
    { name: 'Argent', count: 4, bg: '#8a8377', fg: '#fff', accent: '#d8d4cc' },
    { name: 'Bronze', count: 6, bg: '#a06a3a', fg: '#fff', accent: '#dcb892' },
    { name: 'Partenaire', count: 8, bg: '#5a5048', fg: '#fff', accent: '#e0d8c8' },
  ];

  return (
    <Phone>
      <AppBar
        title="Sponsors"
        subtitle="22 partenaires · merci 🙏"
        right={<button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 12 }}><Icon.Plus size={13}/></button>}
      />
      <div className="phone-scroll" style={{ padding: '12px 12px 16px' }}>
        {tiers.map((t, i) => (
          <div key={i} className="card" style={{ padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                padding: '3px 10px', borderRadius: 999,
                background: t.bg, color: t.fg,
                fontSize: 11, fontWeight: 600,
                border: '1px solid rgba(0,0,0,.05)'
              }}>{t.name}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--encre-3)' }}>× {t.count}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {Array.from({ length: t.count }).map((_, j) => (
                <div key={j} style={{
                  aspectRatio: '1', borderRadius: 8,
                  background:
                    'repeating-linear-gradient(45deg, rgba(31,27,22,.05) 0 1px, transparent 1px 6px), ' + t.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'rgba(31,27,22,.5)'
                }}>logo</div>
              ))}
              <button style={{
                aspectRatio: '1', borderRadius: 8,
                background: 'var(--papier)',
                border: '1.5px dashed var(--border-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--encre-3)', cursor: 'pointer'
              }}>
                <Icon.Plus size={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Phone>
  );
}

// ─── Invitations ─────────────────────────────────────────────
function InvitationsScreen() {
  return (
    <Phone>
      <AppBar
        title="Invitations"
        subtitle="grandir notre tribu"
      />
      <div className="phone-scroll" style={{ padding: '12px 12px 16px' }}>

        {/* Magic link card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, #f7c4ad 100%)',
          borderRadius: 16, padding: 14, marginBottom: 12,
          border: '1px solid rgba(194,90,60,.18)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon.Sparkle size={14} style={{ color: 'var(--terracotta-deep)' }}/>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '.06em', color: 'var(--terracotta-deep)' }}>LIEN MAGIQUE</span>
          </div>
          <div className="serif" style={{ fontSize: 18, lineHeight: 1.15, marginBottom: 8 }}>
            Un lien, et c'est parti.
          </div>
          <div className="mono" style={{
            fontSize: 11, padding: '7px 10px',
            background: 'rgba(255,255,255,.7)', borderRadius: 8,
            color: 'var(--encre)', wordBreak: 'break-all', marginBottom: 10,
            border: '1px solid rgba(255,255,255,.5)',
          }}>
            synerj.app/j/volley-7Kp9
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '7px 0', fontSize: 12, background: 'rgba(255,255,255,.7)' }}>
              <Icon.Copy size={13}/> Copier
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '7px 0', fontSize: 12, background: 'rgba(255,255,255,.7)' }}>
              <Icon.QR size={13}/> QR
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '7px 0', fontSize: 12, background: 'rgba(255,255,255,.7)' }}>
              <Icon.Share size={13}/> Partager
            </button>
          </div>
        </div>

        {/* Email invite */}
        <div className="card" style={{ padding: 12, marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 6 }}>PAR EMAIL</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 8, border: '1px solid var(--border-2)', borderRadius: 10, minHeight: 44, alignItems: 'center', marginBottom: 8 }}>
            <span className="pill" style={{ fontSize: 11 }}>camille.b@mail.com <Icon.X size={10}/></span>
            <span className="pill" style={{ fontSize: 11 }}>julien@mail.com <Icon.X size={10}/></span>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--encre-3)', minWidth: 80 }}>+ ajouter…</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }}>
            <Icon.Send size={13}/> Envoyer 2 invitations
          </button>
        </div>

        <MobileSectionTitle>En cours · 6</MobileSectionTitle>
        {[
          { name: 'Camille B', email: 'camille.b@…', status: 'pending', n: 1 },
          { name: 'Julien M', email: 'julien@…', status: 'pending', n: 2 },
          { name: 'Sarah K', email: 'sarah.k@…', status: 'joined', n: 4 },
          { name: 'Paul N', email: 'paul.n@…', status: 'joined', n: 5 },
        ].map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 4px',
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none'
          }}>
            <Avatar name={p.name} n={p.n} size={32}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)' }}>{p.email}</div>
            </div>
            {p.status === 'pending'
              ? <span className="pill warning" style={{ fontSize: 10 }}><Icon.Clock size={10}/> en attente</span>
              : <span className="pill success" style={{ fontSize: 10 }}><Icon.Check size={10}/> a rejoint</span>}
          </div>
        ))}
      </div>
    </Phone>
  );
}

window.SitePublicScreen = SitePublicScreen;
window.MailingScreen = MailingScreen;
window.SponsorsScreen = SponsorsScreen;
window.InvitationsScreen = InvitationsScreen;
