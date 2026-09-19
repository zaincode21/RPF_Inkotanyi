import { useEffect, useMemo, useState } from 'react';
import { BrandLogo } from "./BrandLogo";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isPastEvent(date) {
  if (!date) return false;
  return startOfDay(date) < startOfDay(new Date());
}

/** Attendance opens on the event date (and stays open after). */
function eventHasStarted(date) {
  if (!date) return false;
  return startOfDay(date) <= startOfDay(new Date());
}

function eventStatusLabel(date) {
  if (!date) return '';
  if (isPastEvent(date)) return 'Past';
  if (eventHasStarted(date)) return 'Today — open';
  return 'Not started';
}

export function AttendancePage({
  navigateTo,
  onLogout,
  currentUser,
  events = [],
  users = [],
  attendance = [],
  onSaveAttendance,
  initialEventId = null,
}) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aPast = isPastEvent(a.date);
      const bPast = isPastEvent(b.date);
      // Past events first (attendance usually taken after the event), then by date desc
      if (aPast !== bPast) return aPast ? -1 : 1;
      return new Date(b.date) - new Date(a.date);
    });
  }, [events]);

  const [selectedEventId, setSelectedEventId] = useState(
    initialEventId || sortedEvents[0]?.id || ''
  );
  // Draft marks: { [userId]: true | false }
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const isLeader = currentUser?.role === 'Leader';
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventIsPast = selectedEvent ? isPastEvent(selectedEvent.date) : false;
  const canMarkAttendance = selectedEvent ? eventHasStarted(selectedEvent.date) : false;

  // Keep selection in sync when events load / initialEventId changes
  useEffect(() => {
    if (initialEventId && events.some(e => e.id === initialEventId)) {
      setSelectedEventId(initialEventId);
      return;
    }
    if (!selectedEventId && sortedEvents[0]?.id) {
      setSelectedEventId(sortedEvents[0].id);
    }
  }, [initialEventId, events, sortedEvents, selectedEventId]);

  // Load saved attendance into draft when event or attendance data changes.
  // RSVP-only rows (present=false, never saved by leader) stay unmarked until the leader sets them.
  useEffect(() => {
    if (!selectedEventId) {
      setDraft({});
      return;
    }
    let savedIds = [];
    try {
      savedIds = JSON.parse(localStorage.getItem(`att-saved-${selectedEventId}`) || '[]');
    } catch {
      savedIds = [];
    }
    const next = {};
    attendance
      .filter(a => a.eventId === selectedEventId)
      .forEach(a => {
        if (!a.userId) return;
        // Include if marked present, or previously saved by a leader (incl. absents)
        if (a.present === true || savedIds.includes(a.userId)) {
          next[a.userId] = a.present === true;
        }
      });
    setDraft(next);
    setSavedFlash(false);
  }, [selectedEventId, attendance]);

  const getSaved = (eventId, userId) => {
    const row = attendance.find(a => a.eventId === eventId && a.userId === userId);
    if (!row) return null;
    try {
      const savedIds = JSON.parse(localStorage.getItem(`att-saved-${eventId}`) || '[]');
      if (row.present === true || savedIds.includes(userId)) return row;
    } catch {
      if (row.present === true) return row;
    }
    return null;
  };

  const setMark = (userId, present) => {
    if (!canMarkAttendance) return;
    setDraft(prev => ({ ...prev, [userId]: present }));
    setSavedFlash(false);
  };

  const approvedMembers = useMemo(
    () => users.filter(u => u.approved && u.role !== 'Guest'),
    [users]
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedEventId) return false;
    return approvedMembers.some(u => {
      const draftVal = draft[u.id];
      if (draftVal === undefined) return false;
      const saved = getSaved(selectedEventId, u.id);
      if (!saved) return true;
      return saved.present !== draftVal;
    });
  }, [draft, approvedMembers, selectedEventId, attendance]);

  const calculateStats = () => {
    const values = Object.values(draft);
    const present = values.filter(v => v === true).length;
    const absent = values.filter(v => v === false).length;
    const total = present + absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, rate };
  };

  const myAttendance = currentUser
    ? attendance.filter(a => a.userId === currentUser.id)
    : [];

  const stats = calculateStats();

  const handleSave = async () => {
    if (!selectedEventId || !onSaveAttendance || !canMarkAttendance) return;
    const marks = approvedMembers
      .filter(u => draft[u.id] !== undefined)
      .map(u => ({ userId: u.id, present: draft[u.id] === true }));

    if (marks.length === 0) {
      return;
    }

    setSaving(true);
    try {
      await onSaveAttendance(selectedEventId, marks);
      try {
        localStorage.setItem(
          `att-saved-${selectedEventId}`,
          JSON.stringify(marks.map(m => m.userId))
        );
      } catch {
        /* ignore */
      }
      setSavedFlash(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* ── TOPBAR ── */}
      <div className="db-topbar">
        <div className="topbar-logo" onClick={() => navigateTo('home')}>
          <BrandLogo size="sm" />
        </div>
        <div className="topbar-nav">
          {[
            ['DASHBOARD', isLeader ? 'leader-dashboard' : 'member-dashboard'],
            ['NEWS','news'],
            ['PROGRESS','achievements'],
            ['RESOURCES','resources'],
            ['EVENTS','events'],
            ['ATTENDANCE','attendance'],
            isLeader ? ['MEMBERS','members'] : null,
            ['PROFILE', 'profile']
          ].filter(Boolean).map(([lbl,dest]) => (
            <button key={dest}
              className={dest === 'attendance' ? 'active' : ''}
              onClick={() => navigateTo(dest)}>
              {lbl}
            </button>
          ))}
        </div>
        <div className="topbar-right">
          <span className="topbar-user-name">Signed in as <em>{currentUser?.fullName}</em></span>
          <button className="topbar-logout" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      {/* ── BANNER ── */}
      <div className="db-banner">
        <img src="/hero-inkotanyi.png"
          alt="Attendance" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">Attendance</div>
          <h1 className="db-banner-greeting">
            Mark <em>presence</em>
          </h1>
          <p className="db-banner-sub">
            {isLeader
              ? 'Take attendance on or after the event date. You can edit after saving.'
              : 'Review your event participation history.'}
          </p>
        </div>
        <span className="db-banner-deco">A</span>
      </div>

      {/* ── BODY ── */}
      <div className="db-body dot-bg">

        {!currentUser ? (
          <div className="db-section">
            <div className="empty-state" style={{ padding: '80px' }}>
              <div className="empty-state-heading">Authentication Required</div>
              <p className="empty-state-sub" style={{ marginBottom: '24px' }}>Please login to view attendance records</p>
              <button className="btn btn--primary" onClick={() => navigateTo('login')}>
                <span>Sign In Now</span>
              </button>
            </div>
          </div>
        ) : isLeader ? (
          <>
            {/* EVENT SELECTION */}
            <div className="db-section">
              <div className="db-section-body" style={{ padding: '22px 28px' }}>
                <div className="eyebrow" style={{ fontSize: '9px', marginBottom: '10px' }}>Select Event</div>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer', maxWidth: '560px' }}
                >
                  {sortedEvents.length === 0 && <option value="">No events yet</option>}
                  {sortedEvents.map(event => {
                    const status = eventStatusLabel(event.date);
                    return (
                      <option key={event.id} value={event.id}>
                        [{status}] {event.title} — {new Date(event.date).toLocaleDateString()}
                      </option>
                    );
                  })}
                </select>
                {selectedEvent && (
                  <p style={{
                    marginTop: '12px',
                    fontSize: '13px',
                    color: canMarkAttendance ? 'var(--text-muted)' : 'var(--amber)',
                  }}>
                    {canMarkAttendance
                      ? (eventIsPast
                        ? 'This event has ended — you can still take and edit attendance.'
                        : 'Event day has started — you can mark and save attendance.')
                      : `Attendance opens on ${new Date(selectedEvent.date).toLocaleDateString()}. Marking is locked until then.`}
                  </p>
                )}
              </div>
            </div>

            {/* STATS */}
            {selectedEvent && (
              <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                  { label: 'Total Marked', num: stats.total, cls: 'ink', deco: 'T', stroke: '#2DA5DE', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
                  { label: 'Present', num: stats.present, cls: 'green', deco: 'P', stroke: '#16a34a', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
                  { label: 'Absent', num: stats.absent, cls: 'red', deco: 'X', stroke: '#E21526', icon: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></> },
                  { label: 'Rate', num: stats.rate, suffix: '%', cls: 'ink', deco: '%', stroke: '#2DA5DE', icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></> },
                ].map(s => (
                  <div key={s.label} className={`stat-card ${s.cls}`}>
                    <span className="stat-card-deco">{s.deco}</span>
                    <div className="stat-card-top">
                      <div className="stat-card-icon">
                        <svg viewBox="0 0 24 24" stroke={s.stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px' }}>{s.icon}</svg>
                      </div>
                      <div className="stat-card-num" style={{ fontSize: '42px' }}>{s.num}<em>{s.suffix}</em></div>
                    </div>
                    <div className="stat-card-label" style={{ fontSize: '9px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ATTENDANCE TABLE */}
            {selectedEvent && (
              <div className="db-section">
                <div className="db-section-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="db-section-title">Mark <em className="serif-accent">Attendance</em></h2>
                    <div className="section-count" style={{ marginTop: '6px' }}>
                      {new Date(selectedEvent.date).toLocaleDateString()}
                      {' · '}{eventStatusLabel(selectedEvent.date)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {savedFlash && !hasUnsavedChanges && canMarkAttendance && (
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>
                        Saved — you can still edit
                      </span>
                    )}
                    {hasUnsavedChanges && canMarkAttendance && (
                      <span style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: 500 }}>
                        Unsaved changes
                      </span>
                    )}
                    <button
                      className="btn btn--primary"
                      disabled={saving || !hasUnsavedChanges || !canMarkAttendance}
                      onClick={handleSave}
                      style={{ opacity: saving || !canMarkAttendance ? 0.7 : 1 }}
                      title={!canMarkAttendance ? 'Attendance opens on the event date' : undefined}
                    >
                      <span>{saving ? 'Saving…' : 'Save Attendance'}</span>
                    </button>
                  </div>
                </div>
                <div className="db-section-body" style={{ padding: '0 32px 32px' }}>
                  {!canMarkAttendance ? (
                    <div className="empty-state" style={{ padding: '48px 32px', marginBottom: '20px' }}>
                      <div className="empty-state-heading" style={{ fontSize: '22px' }}>
                        Attendance not open yet
                      </div>
                      <p className="empty-state-sub" style={{ marginTop: '8px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                        You can mark presence starting on{' '}
                        <strong>{new Date(selectedEvent.date).toLocaleDateString()}</strong>
                        {' '}(the event date). Until then, members can still RSVP from Events.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                      Mark Present or Absent for approved members, then click <strong>Save Attendance</strong>.
                      You can come back later to edit and save again.
                    </p>
                  )}
                  <div className="rsvp-list" style={{ opacity: canMarkAttendance ? 1 : 0.55, pointerEvents: canMarkAttendance ? 'auto' : 'none' }}>
                    {approvedMembers.length === 0 ? (
                      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                        No approved members found. Approve members first, then mark attendance here.
                      </div>
                    ) : (
                      approvedMembers.map((user) => {
                        const draftVal = draft[user.id];
                        const isPresent = draftVal === true;
                        const isAbsent = draftVal === false;
                        const hasMark = draftVal !== undefined;
                        const saved = getSaved(selectedEvent.id, user.id);
                        const rsvpd = (selectedEvent.rsvps || []).includes(user.id);

                        return (
                          <div className="rsvp-item" key={user.id}>
                            <div className="member-card__initials-wrap" style={{ width: '44px', height: '44px', fontSize: '15px', marginBottom: 0 }}>
                              {user.profileImage
                                ? <img src={user.profileImage} alt={user.fullName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                : user.fullName?.split(' ').map(w=>w[0]).join('')}
                            </div>
                            <div className="rsvp-info">
                              <div className="rsvp-title" style={{ fontSize: '17px', marginBottom: 0 }}>{user.fullName}</div>
                              <div className="rsvp-meta" style={{ marginTop: '2px' }}>
                                <span className="rsvp-meta-item">{user.email}</span>
                                <span className="rsvp-badge" style={{ padding: '2px 8px', fontSize: '8.5px' }}>{user.role}</span>
                                {rsvpd && (
                                  <span className="rsvp-badge" style={{ padding: '2px 8px', fontSize: '8.5px', background: '#EAF6FC', color: 'var(--blue-dark)', borderColor: '#B6E3F5' }}>
                                    RSVP’d
                                  </span>
                                )}
                                {saved && (
                                  <span className="rsvp-badge" style={{
                                    padding: '2px 8px', fontSize: '8.5px',
                                    background: '#F3F6F8', color: 'var(--text-muted)', borderColor: 'var(--border)',
                                  }}>
                                    Saved
                                  </span>
                                )}
                                {hasMark && (
                                  <span className="rsvp-badge" style={{
                                    padding: '2px 8px', fontSize: '8.5px',
                                    background: isPresent ? '#f0fdf4' : '#fef2f2',
                                    color: isPresent ? '#16a34a' : 'var(--red)',
                                    borderColor: isPresent ? '#bbf7d0' : '#fca5a5',
                                  }}>
                                    {isPresent ? 'Present' : 'Absent'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                className={`btn btn--sm ${isPresent ? 'btn--primary' : 'btn--ghost'}`}
                                style={isPresent ? { background: '#16a34a' } : { color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                                onClick={() => setMark(user.id, true)}
                              >
                                <span>Present</span>
                              </button>
                              <button
                                type="button"
                                className={`btn btn--sm ${isAbsent ? 'btn--primary' : 'btn--ghost'}`}
                                style={isAbsent ? { background: 'var(--red)' } : { color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                                onClick={() => setMark(user.id, false)}
                              >
                                <span>Absent</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {approvedMembers.length > 0 && canMarkAttendance && (
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                      {hasUnsavedChanges && (
                        <span style={{ fontSize: '12px', color: 'var(--amber)' }}>Don’t forget to save</span>
                      )}
                      <button
                        className="btn btn--primary"
                        disabled={saving || !hasUnsavedChanges}
                        onClick={handleSave}
                      >
                        <span>{saving ? 'Saving…' : 'Save Attendance'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* MEMBER VIEW */}
            <div className="db-section">
              <div className="db-section-header">
                <h2 className="db-section-title">My <em className="serif-accent">History</em></h2>
                <div className="section-count">{myAttendance.length} records</div>
              </div>
              <div className="db-section-body" style={{ padding: '0 32px 32px' }}>
                <div className="rsvp-list">
                  {myAttendance.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                      No attendance history found.
                    </div>
                  ) : (
                    myAttendance.map(record => {
                      const event = events.find(e => e.id === record.eventId);
                      if (!event) return null;
                      return (
                        <div className="rsvp-item" key={record.id} style={{ borderLeft: `4px solid ${record.present ? '#16a34a' : 'var(--red)'}`, paddingLeft: '20px' }}>
                          <img
                            className="rsvp-img"
                            src={event.image || '/hero-inkotanyi.png'} alt={event.title}
                            onError={e => { e.target.style.display = 'none'; }}
                            style={{ width: '100px', height: '60px' }}
                          />
                          <div className="rsvp-info">
                            <div className="rsvp-title">{event.title}</div>
                            <div className="rsvp-meta">
                              <span className="rsvp-meta-item">{new Date(event.date).toLocaleDateString()}</span>
                              <span className="rsvp-meta-item">{event.location}</span>
                              {isPastEvent(event.date) && (
                                <span className="rsvp-badge" style={{ padding: '2px 8px', fontSize: '8.5px' }}>Past</span>
                              )}
                            </div>
                          </div>
                          <div className="rsvp-badge" style={record.present ? { background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' } : { background: '#fef2f2', color: 'var(--red)', borderColor: '#fca5a5' }}>
                            {record.present ? 'Present' : 'Absent'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[
                { label: 'Total Events', num: myAttendance.length, cls: 'ink', deco: 'E', stroke: '#2DA5DE', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></> },
                { label: 'Attended', num: myAttendance.filter(a => a.present).length, cls: 'green', deco: 'A', stroke: '#16a34a', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
                { label: 'Engagement Rate', num: myAttendance.length > 0 ? Math.round((myAttendance.filter(a => a.present).length / myAttendance.length) * 100) : 0, suffix: '%', cls: 'red', deco: '%', stroke: '#E21526', icon: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></> },
              ].map(s => (
                <div key={s.label} className={`stat-card ${s.cls}`}>
                  <span className="stat-card-deco">{s.deco}</span>
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <svg viewBox="0 0 24 24" stroke={s.stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px' }}>{s.icon}</svg>
                    </div>
                    <div className="stat-card-num">{s.num}<em>{s.suffix}</em></div>
                  </div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
