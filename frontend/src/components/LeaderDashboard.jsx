import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

/* ── MOCK DATA ── */
const MOCK_LEADER = {
  id: 'leader1',
  fullName: 'Amara Nkosi',
  role: 'Secretary General',
  email: 'amara.nkosi@rpfinkotanyi.rw',
};

export function LeaderDashboard({ navigateTo, onLogout, currentUser = MOCK_LEADER, users = [], events = [], attendance = [], onApproveUser, onRejectUser }) {
  const approved  = users.filter(u => u.approved);
  const pending   = users.filter(u => !u.approved);
  const upcoming  = events.filter(e => new Date(e.date) >= new Date()).slice(0, 3);
  const attRate   = attendance.length > 0
    ? Math.round((attendance.filter(a => a.present).length / attendance.length) * 100) : 0;
  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const STATS = [
    { cls:'red',   deco:'M', num: approved.length,  suffix:'',  label:'Total Members',
      icon:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>, stroke:'#E21526' },
    { cls:'ink',   deco:'E', num: upcoming.length,  suffix:'',  label:'Upcoming Events',
      icon:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, stroke:'#2DA5DE' },
    { cls:'amber', deco:'P', num: pending.length,   suffix:'',  label:'Pending Approvals',
      icon:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></>, stroke:'#b45309' },
    { cls:'green', deco:'%', num: attRate,           suffix:'%', label:'Attendance Rate',
      icon:<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>, stroke:'#15803d' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* TOPBAR */}
      <div className="db-topbar">
        <div className="topbar-logo" onClick={() => navigateTo('home')}>
          <BrandLogo size="sm" />
        </div>
        <div className="topbar-nav">
          {[
            ['DASHBOARD','leader-dashboard'],
            ['NEWS','news'],
            ['PROGRESS','achievements'],
            ['RESOURCES','resources'],
            ['MEMBERS','members'],
            ['EVENTS','events'],
            ['ATTENDANCE','attendance'],
            ['PROFILE','profile']
          ].map(([l,d]) => (
            <button key={d} className={d==='leader-dashboard'?'active':''} onClick={() => navigateTo(d)}>{l}</button>
          ))}
        </div>
        <div className="topbar-right">
          <span className="topbar-role-badge">Leader</span>
          <span className="topbar-user-name"><em>{currentUser.fullName}</em></span>
          <button className="topbar-logout" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      {/* BANNER */}
      <div className="db-banner">
        <img src="/hero-inkotanyi.png"
          alt="Banner" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">FPR Inkotanyi Leadership</div>
          <h1 className="db-banner-greeting">
            Welcome back, <em>{currentUser.fullName.split(' ')[0]}.</em>
          </h1>
          <p className="db-banner-sub">Manage members, events, and attendance for Inkotanyi.</p>
        </div>
        <span className="db-banner-deco">L</span>
      </div>

      <div className="db-body">

        {/* STAT CARDS */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <span className="stat-card-deco" style={{ fontSize: '72px' }}>{s.deco}</span>
              <div className="stat-card-top">
                <div className="stat-card-icon">
                  <svg viewBox="0 0 24 24" stroke={s.stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px' }}>{s.icon}</svg>
                </div>
                <div className="stat-card-num" style={{ fontSize: '48px' }}>{s.num}<em>{s.suffix}</em></div>
              </div>
              <div className="stat-card-label" style={{ fontSize: '10px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* PENDING APPROVALS */}
        {pending.length > 0 && (
          <div className="db-section" style={{ borderTop: '2px solid #b45309' }}>
            <div className="db-section-header">
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <h2 className="db-section-title">Pending <em className="serif-accent">Approvals</em></h2>
                <span className="rsvp-badge" style={{ color: '#b45309', background: '#fffbeb', borderColor: '#fcd34d' }}>{pending.length} awaiting</span>
              </div>
            </div>
            <div className="db-section-body">
              <div className="rsvp-list">
                {pending.map(m => (
                  <div className="rsvp-item" key={m.id}>
                    <div className="member-card__initials-wrap" style={{ width: '44px', height: '44px', fontSize: '18px', marginBottom: 0 }}>
                      {m.profileImage
                        ? <img src={m.profileImage} alt={m.fullName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : m.fullName?.split(' ').map(w=>w[0]).join('')}
                    </div>
                    <div className="rsvp-info">
                      <div className="rsvp-title" style={{ fontSize: '17px' }}>{m.fullName}</div>
                      <div className="rsvp-meta">
                        <span className="rsvp-meta-item">{m.email}</span>
                        {m.phone && <span className="rsvp-meta-item">{m.phone}</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn--primary btn--sm" style={{ background: '#15803d' }} onClick={() => onApproveUser(m.id)}>
                        <span>Approve</span>
                      </button>
                      <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red)', borderColor: 'rgba(196,30,30,0.2)' }} onClick={() => onRejectUser(m.id)}>
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEMBERS OVERVIEW STRIP */}
        <div className="quote-section" style={{ padding: '28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20, position:'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--red)' }} />
          <div style={{ display:'flex', alignItems:'center', gap:28 }}>
            {[
              { n: approved.length, s: '', l: 'Approved Members' },
              { n: pending.length,  s: '', l: 'Pending Review' },
              { n: attRate,         s: '%',l: 'Overall Attendance' },
            ].map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap: 28 }}>
                {i > 0 && <div style={{ width:'1px', height:'44px', background:'rgba(255,255,255,0.1)' }} />}
                <div>
                  <div className="stat-num-xl" style={{ fontSize: '42px' }}>{s.n}<em>{s.s}</em></div>
                  <div className="stat-label-xl" style={{ marginTop: '4px', fontSize: '10px' }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn--red btn--sm" onClick={() => navigateTo('members')}>
            <span>Manage All Members →</span>
          </button>
        </div>

        {/* UPCOMING EVENTS */}
        <div className="db-section">
          <div className="db-section-header">
            <h2 className="db-section-title">Upcoming <em className="serif-accent">Events</em></h2>
            <button className="btn btn--primary btn--sm" onClick={() => navigateTo('events')}>
              <span>Manage Events →</span>
            </button>
          </div>
          <div className="db-section-body">
            {upcoming.length === 0
              ? <div className="empty-state" style={{ padding: '40px', textAlign: 'center', fontStyle: 'italic', color: 'var(--text-faint)' }}>No upcoming events scheduled.</div>
              : (
              <div className="grid-3" style={{ gap: '2px' }}>
                {upcoming.map(ev => (
                  <div className="ev-card" key={ev.id} onClick={() => navigateTo('events')} style={{ cursor: 'pointer' }}>
                    <div className="ev-img-wrap">
                      <img className="ev-img" src={ev.image || '/hero-inkotanyi.png'} alt={ev.title}
                        onError={e => e.target.style.display='none'} />
                      <span className="ev-img-date">{fmt(ev.date)} · {ev.time}</span>
                    </div>
                    <div className="ev-body">
                      <div className="ev-title">{ev.title}</div>
                      <div className="ev-desc">{ev.description}</div>
                      <div className="ev-rsvp-count" style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '600' }}>{ev.rsvps.length} RSVPs</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-links" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { dest:'members',    title:'Manage Members',   sub:'Approve and manage FPR Inkotanyi members',
              icon:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
            { dest:'events',     title:'Create Event',     sub:'Schedule and publish new party gatherings',
              icon:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></> },
            { dest:'attendance', title:'Track Attendance', sub:'Monitor participation across all events',
              icon:<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></> },
          ].map(a => (
            <button key={a.dest} className="quick-link" onClick={() => navigateTo(a.dest)}>
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width:'18px' }}>{a.icon}</svg>
              </div>
              <div className="quick-link-title" style={{ fontSize: '22px' }}>{a.title}</div>
              <div className="quick-link-sub">{a.sub}</div>
              <span className="quick-link-arrow">↗</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}