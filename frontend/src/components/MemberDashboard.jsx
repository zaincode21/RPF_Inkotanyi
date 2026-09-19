import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

/* ── MOCK DATA ── */
const MOCK_USER = {
  id: 'u1',
  fullName: 'Jean Hakizimana',
  role: 'Policy Director',
  email: 'jean.haki@rpfinkotanyi.rw',
};

export function MemberDashboard({ navigateTo, onLogout, currentUser = MOCK_USER, events = [], attendance = [], onRSVP }) {
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const myRSVPs    = upcomingEvents.filter(e => e.rsvps.includes(currentUser.id));
  const myAtt      = attendance.filter(a => a.userId === currentUser.id);
  const attRate    = myAtt.length > 0
    ? Math.round((myAtt.filter(a => a.present).length / myAtt.length) * 100) : 0;

  const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* ── TOPBAR ── */}
      <div className="db-topbar">
        <div className="topbar-logo" onClick={() => navigateTo('home')}>
          <BrandLogo size="sm" />
        </div>

        <div className="topbar-nav">
          {[
            ['DASHBOARD','member-dashboard'],
            ['NEWS','news'],
            ['PROGRESS','achievements'],
            ['RESOURCES','resources'],
            ['EVENTS','events'],
            ['ATTENDANCE','attendance'],
            currentUser?.role === 'Leader' ? ['MEMBERS','members'] : null,
            ['PROFILE','profile']
          ].filter(Boolean).map(([lbl,dest]) => (
            <button key={dest}
              className={dest === 'member-dashboard' ? 'active' : ''}
              onClick={() => navigateTo(dest)}>
              {lbl}
            </button>
          ))}
        </div>

        <div className="topbar-right">
          <span className="topbar-user-name">Signed in as <em>{currentUser.fullName}</em></span>
          <button className="topbar-logout" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      {/* ── BANNER ── */}
      <div className="db-banner">
        <img
          src="/hero-inkotanyi.png"
          alt="Banner"
          onError={e => e.target.style.display = 'none'}
        />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">Member workspace</div>
          <h1 className="db-banner-greeting">
            Welcome, <em>{currentUser.fullName.split(' ')[0]}.</em>
          </h1>
          <p className="db-banner-sub">Your FPR Inkotanyi events, RSVPs, and attendance.</p>
        </div>
        <span className="db-banner-deco">M</span>
      </div>

      {/* ── BODY ── */}
      <div className="db-body">

        {/* STAT CARDS */}
        <div className="stats-row">
          {[
            {
              cls: 'red', deco: 'R', num: myRSVPs.length, suffix: '', label: 'My RSVPs',
              icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
              iconColor: '#E21526',
            },
            {
              cls: 'ink', deco: 'A', num: myAtt.filter(a => a.present).length, suffix: '', label: 'Events Attended',
              icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
              iconColor: '#2DA5DE',
            },
            {
              cls: 'green', deco: '%', num: attRate, suffix: '%', label: 'Attendance Rate',
              icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
              iconColor: '#16a34a',
            },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <span className="stat-card-deco">{s.deco}</span>
              <div className="stat-card-top">
                <div className="stat-card-icon">
                  <svg viewBox="0 0 24 24" stroke={s.iconColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div className="stat-card-num">
                  {s.num}<em>{s.suffix}</em>
                </div>
              </div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── URUBUGA (ANNOUNCEMENTS) ── */}
        <div className="db-section" style={{ borderLeft: '4px solid var(--red)' }}>
          <div className="db-section-header" style={{ paddingBottom: '12px' }}>
            <h2 className="db-section-title">Urubuga <em className="serif-accent">rw’Abanyamuryango</em></h2>
            <span className="rsvp-badge">Internal Announcements</span>
          </div>
          <div className="db-section-body" style={{ padding: '0 32px 32px' }}>
            <div className="rsvp-list">
              {[
                { title: 'Internal Elections Update', date: '2024-05-15', msg: 'Nominations for village-level leadership are now open until next Friday.' },
                { title: 'Community Outreach Day', date: '2024-05-20', msg: 'All members are encouraged to join the upcoming Umuganda focusing on rural infrastructure.' }
              ].map((ann, i) => (
                <div key={i} className="rsvp-item">
                  <div style={{ flex: 1 }}>
                    <div className="rsvp-title" style={{ fontSize: '18px' }}>{ann.title}</div>
                    <div className="rsvp-meta" style={{ marginTop: '4px' }}>{ann.msg}</div>
                  </div>
                  <div className="eyebrow" style={{ fontSize: '9px' }}>{ann.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ELECTION TRACKER ── */}
        <div className="db-section">
          <div className="db-section-header">
            <h2 className="db-section-title">Election <em className="serif-accent">Tracking</em></h2>
            <div className="section-count">Village to Provincial</div>
          </div>
          <div className="db-section-body" style={{ padding: '0 32px 32px' }}>
             <div className="grid-3" style={{ gap: '20px' }}>
               {[
                 { level: 'Village', status: 'Completed', color: '#16a34a' },
                 { level: 'District', status: 'In Progress', color: '#d97706' },
                 { level: 'Provincial', status: 'Upcoming', color: 'var(--muted)' }
               ].map((lvl, i) => (
                 <div key={i} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--white)' }}>
                    <div className="eyebrow" style={{ fontSize: '9px' }}>LEVEL</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '8px 0' }}>{lvl.level}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: lvl.color }} />
                      <span style={{ fontSize: '11px', fontWeight: '600', color: lvl.color }}>{lvl.status}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* MY UPCOMING RSVPS */}
        {myRSVPs.length > 0 && (
          <div className="db-section">
            <div className="db-section-header">
              <h2 className="db-section-title">My <em className="serif-accent">Upcoming Events</em></h2>
            </div>
            <div className="db-section-body">
              <div className="rsvp-list">
                {myRSVPs.map(ev => (
                  <div className="rsvp-item" key={ev.id}>
                    <img
                      className="rsvp-img"
                      src={ev.image || '/hero-inkotanyi.png'} alt={ev.title}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div className="rsvp-info">
                      <div className="rsvp-title">{ev.title}</div>
                      <div className="rsvp-meta">
                        <span className="rsvp-meta-item">
                          <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {fmt(ev.date)} · {ev.time}
                        </span>
                        <span className="rsvp-meta-item">
                          <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {ev.location}
                        </span>
                      </div>
                    </div>
                    <div className="rsvp-badge">
                      <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      Confirmed
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALL UPCOMING EVENTS */}
        <div className="db-section">
          <div className="db-section-header">
            <h2 className="db-section-title">All <em className="serif-accent">Upcoming Events</em></h2>
            <button className="btn btn--primary btn--sm" onClick={() => navigateTo('events')}>
              <span>View All →</span>
            </button>
          </div>
          <div className="db-section-body">
            {upcomingEvents.length === 0
              ? <div className="empty-state" style={{ padding: '40px', textAlign: 'center', fontStyle: 'italic', color: 'var(--text-faint)' }}>No upcoming events scheduled.</div>
              : (
              <div className="grid-3" style={{ gap: '2px' }}>
                {upcomingEvents.slice(0, 6).map(ev => {
                  const rsvpd = ev.rsvps.includes(currentUser.id);
                  return (
                    <div className="ev-card" key={ev.id}>
                      <div className="ev-img-wrap">
                        <img className="ev-img" src={ev.image || '/hero-inkotanyi.png'} alt={ev.title}
                          onError={e => e.target.style.display='none'} />
                        <span className="ev-img-date">{fmt(ev.date)}</span>
                        {rsvpd && <span className="ev-img-rsvpd">RSVP'd</span>}
                      </div>
                      <div className="ev-body">
                        <div className="ev-title">{ev.title}</div>
                        <div className="ev-desc">{ev.description}</div>
                        <div className="ev-location">
                          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {ev.location}
                        </div>
                        <button
                          className={`ev-rsvp-btn ${rsvpd ? 'rsvpd' : 'not-rsvpd'}`}
                          onClick={() => onRSVP(ev.id, currentUser.id)}
                        >
                          {rsvpd
                            ? 'Cancel RSVP'
                            : <span>RSVP Now</span>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="quick-links" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
           <button className="quick-link" onClick={() => navigateTo('resources')}>
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width:'24px', height:'24px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 21 8"/></svg>
              </div>
              <div className="quick-link-title" style={{ fontSize: '22px' }}>Manifesto</div>
              <div className="quick-link-sub">Download 2024–2029 Vision</div>
              <span className="quick-link-arrow">↗</span>
            </button>
            <button className="quick-link" onClick={() => navigateTo('achievements')}>
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width:'24px', height:'24px' }}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <div className="quick-link-title" style={{ fontSize: '22px' }}>Progress</div>
              <div className="quick-link-sub">National Development Metrics</div>
              <span className="quick-link-arrow">↗</span>
            </button>
            <button className="quick-link" onClick={() => navigateTo('news')}>
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width:'24px', height:'24px' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
              </div>
              <div className="quick-link-title" style={{ fontSize: '22px' }}>News</div>
              <div className="quick-link-sub">Latest Party Updates</div>
              <span className="quick-link-arrow">↗</span>
            </button>
        </div>

      </div>
    </div>
  );
}