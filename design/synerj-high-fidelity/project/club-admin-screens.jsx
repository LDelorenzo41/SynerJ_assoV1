// Club Admin desktop — Tableau de bord, Composer une annonce, Membres

const ClubAdminSide = ({ active }) => (
  <aside className="desk-side">
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 14px', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--club-volley)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 17
      }}>V</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>Volley</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--encre-3)' }}>club admin</div>
      </div>
    </div>
    {[
      { id: 'dash', label: 'Tableau de bord', icon: Icon.Home },
      { id: 'fil', label: 'Fil', icon: Icon.Megaphone },
      { id: 'events', label: 'Événements', icon: Icon.Calendar },
      { id: 'members', label: 'Membres (34)', icon: Icon.Users },
      { id: 'mailing', label: 'Mailing', icon: Icon.Mail },
      { id: 'sponsors', label: 'Sponsors', icon: Icon.Trophy },
      { id: 'invites', label: 'Invitations', icon: Icon.Link },
      { id: 'site', label: 'Site public', icon: Icon.Globe },
      { id: 'settings', label: 'Paramètres', icon: Icon.Settings },
    ].map(it => {
      const I = it.icon;
      return (
        <div key={it.id} className={'nav-item ' + (active === it.id ? 'active' : '')}>
          <I size={15}/>{it.label}
        </div>
      );
    })}
  </aside>
);

function ClubAdminDashboard() {
  return (
    <div className="desk">
      <ClubAdminSide active="dash"/>
      <div className="desk-main">
        <div className="desk-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.08em', marginBottom: 4 }}>VOLLEY · TABLEAU DE BORD</div>
            <div className="serif" style={{ fontSize: 32, lineHeight: 1 }}>Bonjour Léa 👋</div>
            <div style={{ fontSize: 13, color: 'var(--encre-2)', marginTop: 4 }}>Voici ce qui se joue ce <span className="hl-soft">jeudi matin</span>.</div>
          </div>
          <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
            <Icon.Plus size={14}/> Poster une annonce
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px 32px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* À traiter */}
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>↳ À TRAITER (3)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--highlight-soft)', border: '1px solid rgba(212,155,58,.22)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>2 inscriptions à valider</div>
                <div style={{ fontSize: 11.5, color: 'var(--encre-2)' }}>Sara M. · Hugo P. veulent rejoindre</div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--accent-soft)', border: '1px solid rgba(194,90,60,.18)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>3 cotisations en retard</div>
                <div style={{ fontSize: 11.5, color: 'var(--encre-2)' }}>cliquer pour relancer</div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--papier-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>1 question sur le fil</div>
                <div style={{ fontSize: 11.5, color: 'var(--encre-2)' }}>Noé : aide pour décors samedi</div>
              </div>
            </div>
          </div>

          {/* 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>↳ ACTIVITÉ DU FIL</div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {[
                  { name: 'Tom', n: 3, role: 'Volley', text: 'Photos du tournoi de samedi 🏐', meta: '12 ❤︎ · 4 💬' },
                  { name: 'Noé', n: 4, role: 'Théâtre', text: 'Coup de main décors samedi ?', meta: '7 ❤︎ · 3 💬' },
                  { name: 'Léa', n: 2, role: 'Bureau', text: 'Match reporté à 17h aujourd\'hui', meta: '24 ❤︎ · épinglé' },
                ].map((p, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <Avatar name={p.name} n={p.n} size={32}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}><span style={{ color: 'var(--encre)' }}>{p.name}</span> <span style={{ color: 'var(--encre-3)', fontWeight: 500 }}>· {p.role}</span></div>
                      <div style={{ fontSize: 12.5, color: 'var(--encre-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.text}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)' }}>{p.meta}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>↳ LE CLUB EN CHIFFRES</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { v: '34', l: 'membres', tone: 'var(--accent-soft)', color: 'var(--terracotta-deep)' },
                  { v: '+3', l: 'ce mois', tone: 'var(--success-soft)', color: '#3f6b3d' },
                  { v: '5', l: 'évts à venir', tone: 'var(--info-soft)', color: '#3d5878' },
                  { v: '78%', l: 'cotis. payées', tone: 'var(--highlight-soft)', color: '#6b5816' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '14px 12px', borderRadius: 12, background: s.tone, border: '1px solid var(--border)' }}>
                    <div className="serif" style={{ fontSize: 28, lineHeight: 1, color: s.color }}>{s.v}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--encre-2)', marginTop: 4, letterSpacing: '.04em' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClubAdminCompose() {
  return (
    <div className="desk">
      <ClubAdminSide active="fil"/>
      <div className="desk-main">
        <div className="desk-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.08em', marginBottom: 4 }}>VOLLEY · FIL</div>
            <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>Nouvelle annonce</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>Brouillon</button>
            <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>Publier <Icon.Send size={13}/></button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 32px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, overflow: 'auto' }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 6 }}>TITRE</div>
            <div style={{ fontSize: 17, fontWeight: 600, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>Réunion générale jeudi 19h</div>

            <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', letterSpacing: '.06em', marginTop: 16, marginBottom: 6 }}>MESSAGE</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--encre-2)', minHeight: 110 }}>
              Salut la tribu,<br/><br/>
              Petit rappel — on se retrouve <span className="hl-soft">jeudi 19h au foyer</span>.<br/>
              Au programme : tournoi de printemps, points cotisations, et photo de groupe 📸<br/><br/>
              <span style={{ color: 'var(--encre-3)' }}>Capitaines, votre présence compte.</span>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost" style={{ padding: '5px 8px', fontSize: 12 }}><Icon.Image size={14}/> Photo</button>
              <button className="btn btn-ghost" style={{ padding: '5px 8px', fontSize: 12 }}><Icon.Sparkle size={14}/> IA</button>
              <button className="btn btn-ghost" style={{ padding: '5px 8px', fontSize: 12 }}>📎</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>PRIORITÉ</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="pill solid" style={{ fontSize: 11.5 }}>Normal</span>
                <span className="pill" style={{ fontSize: 11.5 }}>Important</span>
                <span className="pill" style={{ fontSize: 11.5 }}>Urgent</span>
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>CIBLE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { l: 'Tous les membres (34)', on: false },
                  { l: 'Capitaines uniquement', on: true },
                ].map((c, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: '1.5px solid ' + (c.on ? 'var(--terracotta)' : 'var(--border-2)'),
                      background: c.on ? 'var(--terracotta)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>{c.on && <Icon.Check size={11} strokeWidth={2.5}/>}</span>
                    {c.l}
                  </label>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>OPTIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, color: 'var(--encre-2)' }}>
                <div>📌 Épingler en haut</div>
                <div>✉️ Notifier par email</div>
                <div>🔔 Pousser une notif</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClubAdminMembers() {
  const members = [
    { name: 'Léa Martin', role: 'Capitaine', cotis: 'payé', n: 1, d: 12 },
    { name: 'Tom Garcia', role: 'Coach', cotis: 'payé', n: 3, d: 8 },
    { name: 'Noé Bobin', role: 'Membre', cotis: 'payé', n: 4, d: 4 },
    { name: 'Marie Petit', role: 'Trésorière', cotis: 'relancé', n: 2, d: 2 },
    { name: 'Sam Roux', role: 'Membre', cotis: 'payé', n: 5, d: 1 },
    { name: 'Eli Lecoq', role: 'Membre', cotis: 'payé', n: 6, d: 6 },
    { name: 'Paul Martin', role: 'Nouveau', cotis: '—', n: 1, d: 0 },
  ];
  return (
    <div className="desk">
      <ClubAdminSide active="members"/>
      <div className="desk-main">
        <div className="desk-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.08em', marginBottom: 4 }}>VOLLEY · MEMBRES</div>
            <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>Membres · 34</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>Exporter</button>
            <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>+ Inviter</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '18px 32px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <Chip active>Tous (34)</Chip>
            <Chip>Bureau (5)</Chip>
            <Chip>Cotis. en retard (3)</Chip>
            <Chip>Nouveaux (2)</Chip>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px 80px',
              padding: '10px 16px',
              fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--encre-3)',
              letterSpacing: '.06em',
              borderBottom: '1px solid var(--border)',
              background: 'var(--papier-2)'
            }}>
              <span>MEMBRE</span><span>RÔLE</span><span>COTIS.</span><span>DERN. ACTIVITÉ</span><span></span>
            </div>
            {members.map((m, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px 80px',
                padding: '10px 16px', alignItems: 'center',
                borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: 13,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={m.name} n={m.n} size={28}/>
                  {m.name}
                </div>
                <div style={{ color: 'var(--encre-2)' }}>{m.role}</div>
                <div>
                  {m.cotis === 'payé' && <span className="pill success" style={{ fontSize: 10.5 }}><Icon.Check size={10}/> payé</span>}
                  {m.cotis === 'relancé' && <span className="pill warning" style={{ fontSize: 10.5 }}>relancé</span>}
                  {m.cotis === '—' && <span className="pill" style={{ fontSize: 10.5 }}>—</span>}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--encre-3)' }}>il y a {m.d}j</div>
                <div style={{ textAlign: 'right' }}>
                  <Icon.MoreV size={16} style={{ color: 'var(--encre-3)' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ClubAdminDashboard = ClubAdminDashboard;
window.ClubAdminCompose = ClubAdminCompose;
window.ClubAdminMembers = ClubAdminMembers;
