// Design System screen — color palette, typography, components

function DSScreen() {
  return (
    <div style={{ width: 1180, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, justifyContent: 'space-between' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--encre-3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            système de design · v1
          </div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1, color: 'var(--encre)' }}>
            Direction A — <span className="hl">papier chaleureux</span>
          </div>
          <div style={{ marginTop: 8, color: 'var(--encre-2)', fontSize: 15, maxWidth: 640 }}>
            Pas un dashboard corporate. Un QG numérique chaleureux où l'on retrouve sa tribu — papier off-white, encre dense, terracotta sincère, et ce surligneur jaune comme on en faisait au lycée.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="pill accent">terracotta · #c25a3c</span>
          <span className="pill">DM Serif Display</span>
          <span className="pill">DM Sans</span>
        </div>
      </div>

      {/* Palette */}
      <div className="ds-section">
        <div className="ds-h">Palette</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {[
            ['#fbf8f3', 'papier', 'var(--encre)'],
            ['#f4efe6', 'papier-2', 'var(--encre)'],
            ['#1f1b16', 'encre', '#fbf8f3'],
            ['#5a5048', 'encre-2', '#fbf8f3'],
            ['#c25a3c', 'terracotta', '#fff'],
            ['#fbe5d9', 'accent-soft', 'var(--encre)'],
            ['#fce896', 'highlight', 'var(--encre)'],
            ['#5e8a5b', 'success', '#fff'],
            ['#d49b3a', 'warning', '#fff'],
            ['#b8553f', 'danger', '#fff'],
            ['#5a7aa3', 'info', '#fff'],
            ['#fbf8f3', '—', 'var(--encre)'],
          ].map((c, i) => (
            <div key={i} className="swatch" style={{ background: c[0], color: c[2] }}>
              <div>
                <div style={{ fontSize: 10, opacity: .85 }}>{c[1]}</div>
                <div style={{ fontSize: 9.5, opacity: .7 }}>{c[0]}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ds-h" style={{ marginTop: 18 }}>Couleurs par club</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            ['Volley', '#d97757', '🏐'],
            ['Théâtre', '#6b5b95', '🎭'],
            ['Photo', '#c4a032', '📸'],
            ['Rando', '#5e8a5b', '🌱'],
            ['Échecs', '#2d4a5a', '♟︎'],
          ].map(([name, hex, em]) => (
            <div key={name} style={{
              borderRadius: 12, padding: '12px 14px',
              background: hex, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 1px 2px rgba(0,0,0,.08)',
            }}>
              <div>
                <div className="serif" style={{ fontSize: 18 }}>{name}</div>
                <div className="mono" style={{ fontSize: 10, opacity: .8 }}>{hex}</div>
              </div>
              <div style={{ fontSize: 22 }}>{em}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Typo */}
      <div className="ds-section">
        <div className="ds-h">Typographie</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div>
            <div className="serif" style={{ fontSize: 56, lineHeight: 1, color: 'var(--encre)' }}>
              Tu es <span className="hl">chez toi</span>.
            </div>
            <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 14, color: 'var(--encre)' }}>
              DM Serif Display · 32px
            </div>
            <div style={{ fontSize: 18, marginTop: 6, color: 'var(--encre)' }}>
              DM Sans 400 · 18px — corps de texte agréable à lire pour des annonces, des descriptions de soirée, des mots du bureau.
            </div>
            <div style={{ fontSize: 15, marginTop: 4, color: 'var(--encre-2)' }}>
              DM Sans 400 · 15px — texte secondaire, infos pratiques.
            </div>
            <div className="mono" style={{ fontSize: 11, marginTop: 10, color: 'var(--encre-3)', letterSpacing: '.04em' }}>
              JET · MONO · 11PX — métadonnées, codes, dates techniques
            </div>
          </div>
          <div>
            <div className="ds-h" style={{ marginBottom: 10 }}>Échelle</div>
            {[32, 24, 18, 15, 14, 12, 11].map(s => (
              <div key={s} style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                gap: 12, padding: '6px 0',
                borderBottom: '1px dashed var(--border)'
              }}>
                <div style={{ fontSize: s, fontFamily: 'var(--font-sans)' }}>Bonjour Marie</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)' }}>{s}px</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Composants */}
      <div className="ds-section">
        <div className="ds-h">Composants</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {/* Boutons */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', marginBottom: 8 }}>BOUTONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
              <button className="btn btn-primary">Je viens <Icon.ArrowRight size={15}/></button>
              <button className="btn btn-secondary">Voir l'événement</button>
              <button className="btn btn-ghost"><Icon.Plus size={15}/> Nouveau post</button>
            </div>
          </div>
          {/* Pills */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', marginBottom: 8 }}>PILLS · BADGES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span className="pill">Normal</span>
              <span className="pill accent">Bureau</span>
              <span className="pill highlight">📌 Épinglé</span>
              <span className="pill danger"><Icon.AlertCircle size={11}/> Urgent</span>
              <span className="pill success"><Icon.Check size={11}/> Inscrit</span>
              <span className="pill info">Public</span>
              <span className="pill warning">À traiter</span>
              <span className="pill solid">Membre actif</span>
            </div>
          </div>
          {/* Avatars */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', marginBottom: 8 }}>AVATARS</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Avatar name="Marie" n={1} size={40}/>
              <Avatar name="Léa" n={2} size={40}/>
              <Avatar name="Tom" n={3} size={40}/>
              <Avatar name="Noé" n={4} size={40}/>
              <Avatar name="Sam" n={5} size={40}/>
              <Avatar name="Eli" n={6} size={40}/>
            </div>
            <div style={{ display: 'flex', marginTop: 10 }}>
              {[1,2,3,4].map(i => (
                <Avatar key={i} name={['Marie','Tom','Noé','Léa'][i-1]} n={i} size={28}
                  style={{ marginLeft: i === 1 ? 0 : -8, border: '2px solid var(--papier)' }}/>
              ))}
              <div className="avatar" style={{
                width: 28, height: 28, marginLeft: -8,
                background: 'var(--accent-soft)', color: 'var(--terracotta-deep)',
                fontSize: 11, border: '2px solid var(--papier)'
              }}>+9</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
          {/* Card example */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar name="Léa" n={2} size={32}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>Léa · Bureau</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)' }}>il y a 2h</div>
              </div>
              <span className="pill highlight">📌 Épinglé</span>
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.45 }}>
              Réunion générale ce <span className="hl-soft">jeudi 19h</span> au foyer. Tous les capitaines peuvent venir 🙏
            </div>
          </div>

          {/* Image placeholder */}
          <HatchPlaceholder height={108} caption="cover IA · golden hour · gymnase A" badge="✦ IA"/>
        </div>
      </div>

      {/* Voix */}
      <div className="ds-section" style={{ background: 'linear-gradient(180deg, var(--papier) 0%, var(--accent-soft) 130%)' }}>
        <div className="ds-h">Voix &amp; ton</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--encre)' }}>« Bonjour Marie 👋 »</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--encre)', marginTop: 4 }}>« Je viens »</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--encre)', marginTop: 4 }}>« Notre maison »</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--encre)', marginTop: 4 }}>« Chez nous »</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', marginBottom: 6 }}>MOTS-CLÉS ÉMOTIONNELS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Appartenance', 'Fierté collective', 'Convivialité', 'Engagement', 'Reconnaissance', 'Énergie positive', 'Proximité'].map(w => (
                <span key={w} style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: 'var(--papier)', border: '1px solid var(--border)',
                  fontSize: 12, fontWeight: 500
                }}>{w}</span>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--encre-2)' }}>
              <strong style={{ color: 'var(--danger)' }}>À bannir :</strong> « Veuillez compléter le formulaire », ton administratif, jargon, listes interminables sans visage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DSScreen = DSScreen;
