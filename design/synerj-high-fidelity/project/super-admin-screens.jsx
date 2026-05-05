// Super Admin desktop — Vue d'ensemble + Tous les clubs

const SuperAdminSide = ({ active }) => (
  <aside className="desk-side desk-side-dark">
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 14px', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--terracotta)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 17
      }}>A</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1, color: '#f4ece0' }}>Asso Étudiante</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'rgba(214,205,191,.55)' }}>super admin</div>
      </div>
    </div>
    {[
      { id: 'overview', label: 'Vue d\'ensemble', icon: Icon.Home },
      { id: 'clubs', label: 'Clubs (5)', icon: Icon.Folder },
      { id: 'members', label: 'Tous les membres', icon: Icon.Users },
      { id: 'announces', label: 'Annonces asso', icon: Icon.Megaphone },
      { id: 'cal', label: 'Calendrier global', icon: Icon.Calendar },
      { id: 'sponsors', label: 'Sponsors asso', icon: Icon.Trophy },
      { id: 'finances', label: 'Finances', icon: Icon.Wallet },
      { id: 'settings', label: 'Paramètres', icon: Icon.Settings },
    ].map(it => {
      const I = it.icon;
      return (
        <div key={it.id} className={'nav-item nav-item-dark ' + (active === it.id ? 'active' : '')}>
          <I size={15}/>{it.label}
        </div>
      );
    })}
  </aside>
);

function SuperAdminOverview() {
  return (
    <div className="desk">
      <SuperAdminSide active="overview"/>
      <div className="desk-main">
        <div className="desk-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.08em', marginBottom: 4 }}>ASSO · VUE D'ENSEMBLE</div>
            <div className="serif" style={{ fontSize: 32, lineHeight: 1 }}>5 clubs, 127 personnes</div>
            <div style={{ fontSize: 13, color: 'var(--encre-2)', marginTop: 4 }}>18 événements ce mois · une <span className="hl-soft">belle saison</span> ✦</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>Rapport mensuel</button>
            <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>+ Annonce asso</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 32px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { v: '127', l: 'membres', s: '+9 ce mois', tone: 'var(--accent-soft)', color: 'var(--terracotta-deep)' },
              { v: '5', l: 'clubs actifs', s: 'tous OK', tone: 'var(--success-soft)', color: '#3f6b3d' },
              { v: '18', l: 'évts ce mois', s: '3 ce week-end', tone: 'var(--highlight-soft)', color: '#6b5816' },
              { v: '12', l: 'sponsors', s: 'or × 3', tone: 'var(--info-soft)', color: '#3d5878' },
            ].map((k, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: k.tone, border: '1px solid var(--border)' }}>
                <div className="serif" style={{ fontSize: 32, lineHeight: 1, color: k.color }}>{k.v}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--encre-2)', marginTop: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>{k.l}</div>
                <div style={{ fontSize: 11, color: 'var(--encre-2)', marginTop: 4 }}>{k.s}</div>
              </div>
            ))}
          </div>

          {/* 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>↳ MES CLUBS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Volley', letter: 'V', color: 'var(--club-volley)', soft: 'var(--club-volley-soft)', members: 34, evts: 5 },
                  { name: 'Théâtre', letter: 'T', color: 'var(--club-theatre)', soft: 'var(--club-theatre-soft)', members: 22, evts: 3 },
                  { name: 'Photo', letter: 'P', color: 'var(--club-photo)', soft: 'var(--club-photo-soft)', members: 18, evts: 2 },
                  { name: 'Rando', letter: 'R', color: 'var(--club-rando)', soft: 'var(--club-rando-soft)', members: 41, evts: 4 },
                  { name: 'Échecs', letter: 'É', color: 'var(--club-echecs)', soft: 'var(--club-echecs-soft)', members: 12, evts: 4 },
                ].map((c, i) => (
                  <div key={i} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, background: c.soft, border: '1px solid rgba(31,27,22,.08)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 19 }}>{c.letter}</div>
                    <div style={{ flex: 1 }}>
                      <div className="serif" style={{ fontSize: 17, lineHeight: 1.1 }}>{c.name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-2)', marginTop: 2 }}>{c.members} membres · {c.evts} évts à venir</div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12, background: 'rgba(255,255,255,.7)' }}>ouvrir →</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.06em', marginBottom: 8 }}>↳ À TON ATTENTION</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="card" style={{ padding: 12, borderLeft: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--club-volley)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12 }}>V</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>Volley · 3 nouveaux membres</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--encre-2)', marginBottom: 6 }}>cette semaine</div>
                </div>

                <div className="card" style={{ padding: 12, background: 'var(--highlight-soft)', borderColor: 'rgba(212,155,58,.22)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--club-theatre)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12 }}>T</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>Théâtre · demande budget gala</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--encre-2)' }}>à valider · 480 €</div>
                </div>

                <div className="card" style={{ padding: 12, background: 'var(--accent-soft)', borderColor: 'rgba(194,90,60,.18)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--club-rando)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12 }}>R</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>Rando · publie sa saison</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--encre-2)' }}>à relire · 6 sorties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuperAdminClubs() {
  const clubs = [
    { name: 'Volley', cat: 'sport', letter: 'V', color: 'var(--club-volley)', soft: 'var(--club-volley-soft)', members: 34, evts: 5 },
    { name: 'Théâtre', cat: 'culture', letter: 'T', color: 'var(--club-theatre)', soft: 'var(--club-theatre-soft)', members: 22, evts: 3 },
    { name: 'Photo', cat: 'culture', letter: 'P', color: 'var(--club-photo)', soft: 'var(--club-photo-soft)', members: 18, evts: 2 },
    { name: 'Rando', cat: 'sport', letter: 'R', color: 'var(--club-rando)', soft: 'var(--club-rando-soft)', members: 41, evts: 4 },
    { name: 'Échecs', cat: 'loisirs', letter: 'É', color: 'var(--club-echecs)', soft: 'var(--club-echecs-soft)', members: 12, evts: 4 },
  ];

  return (
    <div className="desk">
      <SuperAdminSide active="clubs"/>
      <div className="desk-main">
        <div className="desk-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)', letterSpacing: '.08em', marginBottom: 4 }}>ASSO · CLUBS</div>
            <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>Tous les clubs</div>
          </div>
          <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>+ Créer un club</button>
        </div>

        <div style={{ flex: 1, padding: '20px 32px', overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {clubs.map((c, i) => (
              <div key={i} className="card" style={{
                padding: 16,
                background: c.soft,
                border: '1px solid rgba(31,27,22,.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22 }}>{c.letter}</div>
                  <div>
                    <div className="serif" style={{ fontSize: 19, lineHeight: 1.1 }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--encre-2)', marginTop: 2 }}>{c.cat}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--encre-2)', marginBottom: 12 }}>
                  {c.members} membres · {c.evts} évts
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'rgba(255,255,255,.7)' }}>voir</button>
                  <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'rgba(255,255,255,.7)' }}>régler</button>
                </div>
              </div>
            ))}
            <div style={{
              borderRadius: 14, border: '1.5px dashed var(--border-2)',
              minHeight: 156, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 6, color: 'var(--encre-3)',
              cursor: 'pointer'
            }}>
              <Icon.Plus size={20}/>
              <span style={{ fontSize: 13, fontWeight: 500 }}>nouveau club</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SuperAdminOverview = SuperAdminOverview;
window.SuperAdminClubs = SuperAdminClubs;
