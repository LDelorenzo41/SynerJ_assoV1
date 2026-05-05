// Shared primitives — phone shell, status bar, signal/battery, etc.

function SignalIcon() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" className="signal-svg">
      <rect x="0" y="7" width="3" height="4" rx=".6"/>
      <rect x="4.5" y="5" width="3" height="6" rx=".6"/>
      <rect x="9" y="2.5" width="3" height="8.5" rx=".6"/>
      <rect x="13.5" y="0" width="3" height="11" rx=".6"/>
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 4.5C3 3 5 2 7.5 2s4.5 1 6.5 2.5"/>
      <path d="M3 6.5c1.4-1 2.8-1.5 4.5-1.5s3.1.5 4.5 1.5"/>
      <path d="M5 8.5c.8-.5 1.6-.8 2.5-.8s1.7.3 2.5.8"/>
      <circle cx="7.5" cy="10" r=".7" fill="currentColor"/>
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="26" height="11" viewBox="0 0 26 11" fill="none" stroke="currentColor" strokeWidth="1" className="battery-svg">
      <rect x="0.5" y="0.5" width="22" height="10" rx="2.5"/>
      <rect x="2" y="2" width="16" height="7" rx="1" fill="currentColor" stroke="none"/>
      <rect x="23.5" y="3.5" width="1.5" height="4" rx=".5" fill="currentColor"/>
    </svg>
  );
}

function StatusBar({ time = '9:41' }) {
  return (
    <div className="phone-statusbar">
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function Phone({ children, statusTime }) {
  return (
    <div className="phone">
      <div className="phone-notch"></div>
      <StatusBar time={statusTime} />
      <div className="phone-screen">
        <div className="phone-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// Mobile bottom tabbar (4 icons)
function TabBar({ active = 'fil', items }) {
  const def = items || [
    { id: 'fil',     label: 'Fil',      icon: Icon.Home },
    { id: 'agenda',  label: 'Agenda',   icon: Icon.Calendar },
    { id: 'club',    label: 'Mon club', icon: Icon.Heart },
    { id: 'plus',    label: 'Plus',     icon: Icon.Menu },
  ];
  return (
    <div className="tabbar">
      {def.map(it => {
        const I = it.icon;
        return (
          <button key={it.id} className={active === it.id ? 'active' : ''}>
            <I size={20} strokeWidth={active === it.id ? 1.9 : 1.6}/>
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Avatar with initials, n=1..6 picks pastel
function Avatar({ name = '?', size = 36, n = 1, src, style }) {
  const initials = name
    .split(' ')
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`avatar av-${((n - 1) % 6) + 1}`}
      style={{
        width: size, height: size,
        fontSize: Math.round(size * 0.38),
        ...style
      }}
    >
      {src ? <img src={src} alt="" /> : initials}
    </div>
  );
}

// Hatched placeholder w/ optional caption (mono)
function HatchPlaceholder({ caption, height = 120, style, label, badge }) {
  return (
    <div className="placeholder" style={{ height, position: 'relative', ...style }}>
      {badge && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(31,27,22,.78)', color: '#fce896',
          padding: '3px 7px', borderRadius: 6,
          fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.04em'
        }}>
          {badge}
        </div>
      )}
      <span style={{ opacity: .85 }}>{caption || label}</span>
    </div>
  );
}

// Mobile app-bar (top of phone screen)
function AppBar({ title, subtitle, left, right, accent }) {
  return (
    <div style={{
      padding: '8px 16px 10px',
      display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: '1px solid var(--border)',
      background: 'var(--papier)',
      flexShrink: 0,
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          lineHeight: 1.15,
          color: 'var(--encre)'
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontSize: 11.5, color: 'var(--encre-3)',
            fontFamily: 'var(--font-sans)',
            marginTop: 1,
          }}>{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}

// Section title (mobile)
function MobileSectionTitle({ children, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '10px 16px 6px',
      fontFamily: 'var(--font-mono)', fontSize: 10.5,
      color: 'var(--encre-3)', textTransform: 'uppercase', letterSpacing: '.08em'
    }}>
      <span>{children}</span>
      {action}
    </div>
  );
}

// Chip (filter chip)
function Chip({ active, children, color }) {
  return (
    <button style={{
      border: '1px solid ' + (active ? 'var(--encre)' : 'var(--border-2)'),
      background: active ? 'var(--encre)' : 'var(--papier)',
      color: active ? 'var(--papier)' : 'var(--encre-2)',
      padding: '6px 12px', borderRadius: 999,
      fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12.5,
      cursor: 'pointer', flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {children}
    </button>
  );
}

// FAB
function FAB({ icon, onClick, label }) {
  const I = icon || Icon.Plus;
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 14, bottom: 78,
      width: 52, height: 52, borderRadius: 999,
      background: 'var(--terracotta)', color: '#fff',
      border: 'none', cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(168,74,46,.32), inset 0 1px 0 rgba(255,255,255,.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3,
    }}>
      <I size={22} strokeWidth={2}/>
    </button>
  );
}

Object.assign(window, {
  Phone, StatusBar, TabBar, Avatar, HatchPlaceholder,
  AppBar, MobileSectionTitle, Chip, FAB,
  SignalIcon, WifiIcon, BatteryIcon,
});
