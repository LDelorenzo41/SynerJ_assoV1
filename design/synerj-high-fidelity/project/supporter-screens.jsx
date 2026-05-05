// Supporter screens — Empty state, Public fil with locks, Conversion

function SupporterEmptyScreen() {
  return (
    <Phone>
      <AppBar title="Bienvenue chez SynerJ 🌱"/>
      <div className="phone-scroll" style={{ padding: '20px 18px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingTop: 24 }}>
          <div className="serif" style={{ fontSize: 30, lineHeight: 1.05, color: 'var(--terracotta)', textAlign: 'center' }}>
            Trouve <span style={{ color: 'var(--encre)' }}>ta tribu</span>
          </div>
          <div style={{ fontSize: 13.5, textAlign: 'center', marginTop: 10, color: 'var(--encre-2)', lineHeight: 1.45 }}>
            Pour l'instant tu n'es dans aucun club.<br/>Découvre ce qui se passe près de toi.
          </div>
        </div>

        <div style={{
          margin: '22px 0 14px',
          height: 150, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--accent-soft) 0%, #f8ecc4 50%, #dcebd9 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 150" style={{ position: 'absolute', inset: 0, opacity: .3 }}>
            <defs>
              <pattern id="dots2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r=".8" fill="rgba(31,27,22,.3)"/>
              </pattern>
            </defs>
            <rect width="200" height="150" fill="url(#dots2)"/>
          </svg>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--encre-2)', position: 'relative' }}>
            illustration · « place du village »
          </span>
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 14,
          background: 'var(--highlight-soft)',
          border: '1px solid rgba(212,155,58,.22)',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, lineHeight: 1.4 }}>
            🔍 <strong>5 clubs</strong> t'attendent : Volley, Théâtre, Photo, Rando, Échecs
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>
            Explorer les clubs
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>
            J'ai un code
          </button>
        </div>

        <div style={{ marginTop: 6, padding: 10, fontSize: 12, color: 'var(--encre-3)', textAlign: 'center', fontStyle: 'italic' }}>
          💡 <span style={{ color: 'var(--encre-2)' }}>Tu peux suivre 2 clubs gratuitement avant de rejoindre.</span>
        </div>
      </div>

      <TabBar active="fil" items={[
        { id: 'fil', label: 'Découvrir', icon: Icon.Compass },
        { id: 'agenda', label: 'Évts', icon: Icon.Calendar },
        { id: 'club', label: 'Mes clubs', icon: Icon.Heart },
        { id: 'plus', label: 'Plus', icon: Icon.Menu },
      ]}/>
    </Phone>
  );
}

function SupporterFilScreen() {
  return (
    <Phone>
      <AppBar
        title="Salut Camille 👋"
        right={<span className="pill solid" style={{ fontSize: 10.5 }}>Supporter</span>}
      />

      <div className="phone-scroll" style={{ padding: '12px 12px 80px' }}>
        {/* Soft conversion card */}
        <div style={{
          background: 'var(--accent-soft)',
          borderRadius: 14, padding: 12,
          border: '1px solid rgba(194,90,60,.18)',
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            Tu suis 2 clubs : <span style={{ color: 'var(--terracotta-deep)' }}>Volley · Théâtre</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--encre-2)', lineHeight: 1.4, marginBottom: 8 }}>
            Tu vois les actus publiques. Pour participer aux events réservés membres, rejoins-en un !
          </div>
          <button style={{
            background: 'var(--highlight)', color: 'var(--encre)',
            border: '1px solid rgba(212,155,58,.3)',
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}>→ devenir membre</button>
        </div>

        {/* Public post — visible */}
        <div className="card" style={{ padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 999,
              background: 'var(--club-volley)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 16,
            }}>V</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Volley · public</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)' }}>4h</div>
            </div>
            <span className="pill info" style={{ fontSize: 10 }}><Icon.Globe size={10}/> public</span>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>
            🏐 Tournoi ouvert ce samedi — <span className="hl-soft">venez encourager</span> !
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: 'var(--encre-2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Heart size={14}/> 41</span>
          </div>
        </div>

        {/* Locked post */}
        <div className="card" style={{ padding: 12, marginBottom: 10, opacity: .65, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Avatar name="Noé" n={2} size={28}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Théâtre · 🔒 réservé membres</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--encre-3)', fontStyle: 'italic' }}>
            Rejoins le club pour lire ce post
          </div>
        </div>
      </div>

      <TabBar active="fil" items={[
        { id: 'fil', label: 'Fil', icon: Icon.Home },
        { id: 'agenda', label: 'Évts publics', icon: Icon.Calendar },
        { id: 'club', label: 'Mes clubs', icon: Icon.Heart },
        { id: 'plus', label: 'Plus', icon: Icon.Menu },
      ]}/>
    </Phone>
  );
}

function SupporterConversionScreen() {
  return (
    <Phone>
      <AppBar
        title="Rejoindre Volley"
        left={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--encre-2)', padding: 0 }}><Icon.Chevron size={20} style={{ transform: 'rotate(180deg)' }}/></button>}
      />

      <div className="phone-scroll" style={{ padding: '16px 14px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 14 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 999,
            background: 'var(--club-volley)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 38,
            boxShadow: '0 4px 14px rgba(168,74,46,.28)'
          }}>V</div>
          <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, marginTop: 12 }}>Volley Club</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--encre-3)', marginTop: 3 }}>34 membres · depuis 1998</div>
        </div>

        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>→ EN DEVENANT MEMBRE</div>
          {[
            'Accès aux entraînements',
            'Inscription aux tournois',
            'Fil interne & trombi',
            'Réservation salle & matos',
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13 }}>
              <Icon.Check size={15} style={{ color: 'var(--success)' }} strokeWidth={2}/>
              {b}
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--highlight-soft)',
          borderRadius: 12, padding: '14px 16px',
          border: '1px solid rgba(212,155,58,.22)',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--encre-2)' }}>Cotisation annuelle</div>
            <div className="serif" style={{ fontSize: 32, lineHeight: 1, color: 'var(--encre)' }}>40 €</div>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-2)', marginTop: 2 }}>réduite étudiant : 20 €</div>
        </div>
      </div>

      {/* sticky CTA */}
      <div style={{
        padding: '10px 14px 14px', borderTop: '1px solid var(--border)',
        background: 'var(--papier)', flexShrink: 0
      }}>
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px 0', fontSize: 14 }}>
          Je rejoins la tribu <Icon.ArrowRight size={15}/>
        </button>
      </div>
    </Phone>
  );
}

window.SupporterEmptyScreen = SupporterEmptyScreen;
window.SupporterFilScreen = SupporterFilScreen;
window.SupporterConversionScreen = SupporterConversionScreen;
