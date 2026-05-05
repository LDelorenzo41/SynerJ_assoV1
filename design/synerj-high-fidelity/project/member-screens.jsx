// Member mobile screens — Fil, Calendrier, MyClub Volley

// ─── 1. FIL ───────────────────────────────────────────────────
function FilScreen() {
  const [liked, setLiked] = React.useState({ tom: false, noe: true });
  const [likeAnim, setLikeAnim] = React.useState(null);
  const toggleLike = (key) => {
    setLiked(prev => ({ ...prev, [key]: !prev[key] }));
    setLikeAnim(key);
    setTimeout(() => setLikeAnim(null), 400);
  };

  return (
    <Phone>
      <AppBar
        title={<>Bonjour Marie <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--encre-2)' }}>·</span> <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--terracotta-deep)', fontWeight: 600 }}>7 nouvelles</span></>}
        subtitle="ta tribu, en direct"
        right={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--encre-2)', position: 'relative' }}>
          <Icon.Bell size={20}/>
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 999, background: 'var(--terracotta)', border: '1.5px solid var(--papier)' }}/>
        </button>}
      />
      {/* Filter chips */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid var(--border)' }} className="scrollbar-hide">
        <Chip active>Tout</Chip>
        <Chip>Mon club</Chip>
        <Chip>Bureau</Chip>
        <Chip><Icon.AlertCircle size={12}/> Urgent</Chip>
      </div>

      <div className="phone-scroll" style={{ padding: '12px 12px 80px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>

        {/* Urgent pinned */}
        <div style={{
          background: 'var(--accent-soft)',
          borderRadius: 14,
          padding: 12,
          border: '1px solid rgba(194,90,60,.18)',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="pill danger" style={{ fontSize: 10.5 }}><Icon.AlertCircle size={11}/> Urgent</span>
            <span className="pill highlight" style={{ fontSize: 10.5 }}>📌 Épinglé</span>
            <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--encre-3)', fontFamily: 'var(--font-mono)' }}>il y a 1h</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar name="Léa Bureau" n={1} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Léa · Bureau</div>
              <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.4, color: 'var(--encre)' }}>
                Match à <span className="hl">15h reporté à 17h</span> aujourd'hui — fuite d'eau au gymnase. Pensez à prévenir vos co-équipiers 🙏
              </div>
            </div>
          </div>
        </div>

        {/* Bureau pinned — cotisations */}
        <div style={{
          background: 'linear-gradient(180deg, var(--highlight-soft) 0%, #fef3a8 100%)',
          borderRadius: 14,
          padding: 12,
          border: '1px solid rgba(212,155,58,.22)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="pill" style={{ background: 'rgba(31,27,22,.08)', fontSize: 10.5 }}>Bureau · Asso</span>
            <span className="pill highlight" style={{ fontSize: 10.5 }}>📌 Épinglé</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar name="Marc B" n={3} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Marc · Trésorier</div>
              <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.4 }}>
                <strong>Cotisations 2026</strong> ouvertes 🌱<br/>
                Plus que 12 personnes à l'appel. Tu peux régler en 2 min.
              </div>
              <button className="btn btn-primary" style={{ marginTop: 8, padding: '7px 12px', fontSize: 13 }}>
                Régler ma cotisation <Icon.ArrowRight size={13}/>
              </button>
            </div>
          </div>
        </div>

        {/* Photo grid post */}
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Avatar name="Tom" n={3} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Tom · Volley</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)' }}>tournoi de samedi · 4h</div>
            </div>
            <Icon.MoreV size={16} style={{ color: 'var(--encre-3)' }}/>
          </div>
          <div style={{ fontSize: 13.5, marginBottom: 8 }}>
            Le tournoi de samedi 🏐 trop fier de cette équipe ! Photos en vrac ⬇️
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, borderRadius: 10, overflow: 'hidden' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: 78, position: 'relative',
                background: i === 1 ? 'linear-gradient(135deg, #f7c4ad, #efb098)'
                  : i === 2 ? 'linear-gradient(135deg, #ddd5e8, #c8bedc)'
                  : i === 3 ? 'linear-gradient(135deg, #f8ecc4, #e6c97d)'
                  : 'linear-gradient(135deg, #dcebd9, #aac8a3)',
              }}>
                {i === 4 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(31,27,22,.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontFamily: 'var(--font-display)', fontSize: 22
                  }}>+5</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, fontSize: 12.5, color: 'var(--encre-2)' }}>
            <button onClick={() => toggleLike('tom')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: liked.tom ? 'var(--terracotta)' : 'var(--encre-2)' }}>
              <span className={likeAnim === 'tom' ? 'like-pulse' : ''} style={{ display: 'inline-flex' }}>
                {liked.tom ? <Icon.HeartFill size={16}/> : <Icon.Heart size={16}/>}
              </span>
              {12 + (liked.tom ? 1 : 0)}
            </button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Comment size={15}/> 4</span>
            <span style={{ marginLeft: 'auto' }} className="mono">3 photos · +5</span>
          </div>
        </div>

        {/* Question post */}
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Avatar name="Noé" n={4} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Noé · Théâtre</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--encre-3)' }}>hier · 18h</div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>
            Quelqu'un dispo pour aider au montage des décors <span className="hl-soft">samedi matin</span> ? 🎭 Café et croissants offerts 🥐
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, fontSize: 12.5, color: 'var(--encre-2)' }}>
            <button onClick={() => toggleLike('noe')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: liked.noe ? 'var(--terracotta)' : 'var(--encre-2)' }}>
              <span className={likeAnim === 'noe' ? 'like-pulse' : ''} style={{ display: 'inline-flex' }}>
                {liked.noe ? <Icon.HeartFill size={16}/> : <Icon.Heart size={16}/>}
              </span>
              {7 + (liked.noe ? 1 : 0)}
            </button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Comment size={15}/> 3 réponses</span>
          </div>
        </div>

        <FAB icon={Icon.Edit}/>
      </div>

      <TabBar active="fil"/>
    </Phone>
  );
}

// ─── 2. CALENDRIER ────────────────────────────────────────────
function CalendrierScreen() {
  const days = [
    { d: 'L', n: '12' }, { d: 'M', n: '13' }, { d: 'M', n: '14' },
    { d: 'J', n: '15', active: true },
    { d: 'V', n: '16' }, { d: 'S', n: '17' }, { d: 'D', n: '18' },
  ];

  return (
    <Phone>
      <AppBar
        title="Mon calendrier"
        subtitle="ce qui rythme la vie collective"
        right={<span className="pill accent" style={{ fontSize: 11 }}>3 à venir</span>}
      />

      {/* Tabs */}
      <div style={{ padding: '10px 12px 4px', display: 'flex', gap: 6, flexShrink: 0 }}>
        <Chip active>À venir</Chip>
        <Chip>Mes inscriptions</Chip>
        <Chip>Passés</Chip>
      </div>

      {/* Week strip */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px 4px', flexShrink: 0 }}>
        {days.map((day, i) => (
          <div key={i} style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '7px 2px',
            borderRadius: 10,
            background: day.active ? 'var(--terracotta)' : 'transparent',
            color: day.active ? '#fff' : 'var(--encre-2)',
          }}>
            <div className="mono" style={{ fontSize: 9.5, opacity: .8 }}>{day.d}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1 }}>{day.n}</div>
            {day.active && <div style={{ width: 4, height: 4, borderRadius: 999, background: '#fff' }}/>}
          </div>
        ))}
      </div>

      <div className="phone-scroll" style={{ padding: '0 12px 80px' }}>
        <MobileSectionTitle>Cette semaine</MobileSectionTitle>

        {/* Hero event */}
        <div className="card fade-up" style={{ overflow: 'hidden', padding: 0, marginBottom: 12 }}>
          <div style={{ position: 'relative', height: 110 }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #f7c4ad 0%, #c25a3c 100%)',
            }}>
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 110" style={{ opacity: .25 }}>
                <defs>
                  <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r=".7" fill="#fff"/>
                  </pattern>
                </defs>
                <rect width="200" height="110" fill="url(#dots)"/>
              </svg>
            </div>
            <div style={{ position: 'absolute', top: 8, left: 8 }}>
              <span className="pill" style={{
                background: 'rgba(31,27,22,.78)', color: '#fce896',
                fontSize: 10, border: 'none'
              }}>✦ cover IA</span>
            </div>
            <div style={{ position: 'absolute', bottom: 8, left: 12, right: 12, color: '#fff' }}>
              <div className="mono" style={{ fontSize: 10, opacity: .9, letterSpacing: '.05em' }}>JEU 15 · 19:00 · GYMNASE A</div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>Tournoi inter-clubs</div>
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <span className="pill"><Icon.Map size={11}/> Gymnase A</span>
              <span className="pill success"><Icon.Users size={11}/> 18 / 24 inscrits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4].map(i => (
                  <Avatar key={i} name={['Marie','Tom','Léa','Noé'][i-1]} n={i} size={26}
                    style={{ marginLeft: i === 1 ? 0 : -8, border: '2px solid var(--papier)' }}/>
                ))}
                <div className="avatar" style={{
                  width: 26, height: 26, marginLeft: -8, fontSize: 10,
                  background: 'var(--accent-soft)', color: 'var(--terracotta-deep)',
                  border: '2px solid var(--papier)'
                }}>+14</div>
              </div>
              <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 13 }}>
                Je viens
              </button>
            </div>
          </div>
        </div>

        {/* Compact event */}
        <div className="card" style={{ padding: 10, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 48, flexShrink: 0,
            textAlign: 'center', padding: '6px 0',
            background: 'var(--club-theatre-soft)', borderRadius: 10,
            color: '#4a3e6b'
          }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.05em' }}>SAM</div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>17</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Répétition Théâtre</div>
            <div style={{ fontSize: 12, color: 'var(--encre-2)', marginTop: 1 }}>14:00 · Salle Pasteur · 8 inscrits</div>
          </div>
          <span className="pill success" style={{ fontSize: 10.5 }}><Icon.Check size={11}/></span>
        </div>

        <MobileSectionTitle>Semaine prochaine</MobileSectionTitle>

        <div className="card" style={{ padding: 10, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 48, flexShrink: 0,
            textAlign: 'center', padding: '6px 0',
            background: 'var(--club-rando-soft)', borderRadius: 10,
            color: '#3f6b3d'
          }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.05em' }}>DIM</div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>25</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Rando Mont Aiguille</div>
            <div style={{ fontSize: 12, color: 'var(--encre-2)', marginTop: 1 }}>8:00 · départ Mairie · 12 inscrits</div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}>+ Je viens</button>
        </div>

        <div className="card" style={{ padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 48, flexShrink: 0,
            textAlign: 'center', padding: '6px 0',
            background: 'var(--club-photo-soft)', borderRadius: 10,
            color: '#6b5816'
          }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.05em' }}>JEU</div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>29</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Sortie photo · golden hour</div>
            <div style={{ fontSize: 12, color: 'var(--encre-2)', marginTop: 1 }}>18:30 · Quais · 6 inscrits</div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}>+ Je viens</button>
        </div>
      </div>

      <TabBar active="agenda"/>
    </Phone>
  );
}

// ─── 3. MyClub Volley ────────────────────────────────────────
function MyClubScreen() {
  return (
    <Phone>
      <AppBar
        title="Volley Club"
        subtitle="ma maison · 34 membres"
        left={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--encre-2)', padding: 0 }}><Icon.Chevron size={20} style={{ transform: 'rotate(180deg)' }}/></button>}
        right={<button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--encre-2)' }}><Icon.MoreV size={20}/></button>}
      />

      <div className="phone-scroll" style={{ padding: '12px 12px 80px' }}>
        {/* Hero */}
        <div className="hero-volley" style={{
          borderRadius: 16, padding: '18px 16px',
          position: 'relative', overflow: 'hidden',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999,
              background: 'var(--club-volley)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'var(--font-display)', fontSize: 32,
              boxShadow: '0 2px 8px rgba(168,74,46,.25)'
            }}>V</div>
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 24, lineHeight: 1, color: 'var(--encre)' }}>Volley</div>
              <div style={{ fontSize: 12, color: 'var(--encre-2)', marginTop: 2 }}>fondé en 1998 · ma maison depuis 3 ans</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                <span className="pill" style={{ background: 'rgba(255,255,255,.7)', fontSize: 10.5, padding: '2px 8px' }}><Icon.Check size={10}/> Membre actif</span>
                <span className="pill" style={{ background: 'rgba(31,27,22,.85)', color: '#fff', borderColor: 'transparent', fontSize: 10.5, padding: '2px 8px' }}><Icon.Trophy size={10}/> Capitaine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aujourd'hui */}
        <MobileSectionTitle>Aujourd'hui chez nous</MobileSectionTitle>
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span className="serif" style={{ fontSize: 18 }}>Entraînement à 19h</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--encre-3)' }}>· Gymnase A</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--encre-2)', marginBottom: 10 }}>
            On vise les 12 — encore 4 places.
          </div>
          <div className="progress" style={{ marginBottom: 8 }}>
            <span style={{ width: '67%' }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'var(--encre-2)' }}>
              <strong style={{ color: 'var(--encre)' }}>8</strong> / 12 inscrits
            </div>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5 }}>Je viens</button>
          </div>
        </div>

        {/* 2x2 actions */}
        <MobileSectionTitle>Ressources</MobileSectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { icon: Icon.Users, label: 'Trombi', sub: '34 visages', tone: 'var(--accent-soft)', color: 'var(--terracotta-deep)' },
            { icon: Icon.Building, label: 'Équipements', sub: '12 dispos', tone: 'var(--info-soft)', color: '#3d5878' },
            { icon: Icon.Calendar, label: 'Réservations', sub: 'gymnase A', tone: 'var(--success-soft)', color: '#3f6b3d' },
            { icon: Icon.Globe, label: 'Site public', sub: 'volley.synerj.app', tone: 'var(--highlight-soft)', color: '#6b5816' },
          ].map((a, i) => {
            const I = a.icon;
            return (
              <button key={i} className="card" style={{
                padding: 12, textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 6,
                cursor: 'pointer', borderColor: 'var(--border)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: a.tone, color: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <I size={16} strokeWidth={1.8}/>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--encre-3)', marginTop: 1 }}>{a.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tribu horizontal scroll */}
        <MobileSectionTitle action={<span className="mono" style={{ fontSize: 10, color: 'var(--terracotta)' }}>tout voir →</span>}>
          La tribu · 34
        </MobileSectionTitle>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginLeft: -2, paddingLeft: 2 }} className="scrollbar-hide">
          {[
            { name: 'Marie L', role: 'Capitaine', n: 1 },
            { name: 'Tom V', role: 'Coach', n: 3 },
            { name: 'Léa B', role: 'Trésorière', n: 2 },
            { name: 'Noé P', role: 'Membre', n: 4 },
            { name: 'Sam R', role: 'Membre', n: 5 },
            { name: 'Eli M', role: 'Membre', n: 6 },
          ].map((p, i) => (
            <div key={i} style={{
              flexShrink: 0, width: 78,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <Avatar name={p.name} n={p.n} size={52}/>
              <div style={{ fontSize: 11.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'var(--encre-3)', textAlign: 'center' }}>{p.role}</div>
            </div>
          ))}
        </div>
      </div>

      <TabBar active="club"/>
    </Phone>
  );
}

window.FilScreen = FilScreen;
window.CalendrierScreen = CalendrierScreen;
window.MyClubScreen = MyClubScreen;
