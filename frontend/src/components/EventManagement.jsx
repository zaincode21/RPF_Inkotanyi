import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

/* ── MOCK/DEFAULT DATA ── */
const BLANK = {
  title: '', description: '', date: '', time: '', location: '',
  image: '/hero-inkotanyi.png',
};

/* ─────────────────────────────────────────────
   CONFIRM DIALOG
───────────────────────────────────────────── */
function ConfirmDialog({ eventTitle, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-title">Delete <em>event?</em></div>
        <p className="confirm-desc">
          "<strong>{eventTitle}</strong>" will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-md" style={{ marginTop: '24px' }}>
          <button className="btn btn--red btn--sm flex-1" onClick={onConfirm}>
            <span>Yes, delete</span>
          </button>
          <button className="btn btn--ghost btn--sm flex-1" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }} onClick={onCancel}>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EVENT CARD
───────────────────────────────────────────── */
function Icon({ children, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function EventCard({ event, currentUser, isLeader, isPast, onRSVP, onEdit, onDeleteRequest, navigateTo }) {
  const rsvpd = currentUser && event.rsvps.includes(currentUser.id);
  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div className={`ev-card${isPast ? ' ev-card--past' : ''}`}>
      <div className="ev-img-wrap">
        <img className="ev-img" src={event.image || '/hero-inkotanyi.png'} alt={event.title}
          onError={e => e.target.style.display='none'} />
        <div className="ev-img-shade" />
        {isPast && <span className="ev-past-tag">Past</span>}
        {rsvpd && !isPast && <span className="ev-rsvpd-tag">RSVP’d</span>}
        <div className="ev-img-meta">
          <div className="ev-img-date">
            {fmt(event.date)}{event.time ? ` · ${event.time}` : ''}
          </div>
          {isPast && <div className="ev-img-title">{event.title}</div>}
        </div>
      </div>

      <div className="ev-body">
        {!isPast && <h3 className="ev-title">{event.title}</h3>}
        <p className="ev-desc">{event.description}</p>
        <div className="ev-meta">
          <div className="ev-meta-row">
            <Icon size={13}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </Icon>
            {event.location}
          </div>
          <div className="ev-meta-row">
            <Icon size={13}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </Icon>
            {isPast ? `${event.rsvps.length} attended` : `${event.rsvps.length} RSVPs`}
          </div>
        </div>
      </div>

      {!isPast && (currentUser || isLeader) && (
        <>
          <div className="ev-card-sep" />
          <div className="ev-actions">
            {currentUser && currentUser.role === 'Member' && (
              <button
                className={`ev-rsvp-btn ${rsvpd ? 'rsvpd' : 'not-rsvpd'}`}
                onClick={() => onRSVP(event.id, currentUser.id)}
              >
                {rsvpd ? 'Cancel RSVP' : <span>RSVP Now</span>}
              </button>
            )}
            {isLeader && (
              <div className="ev-leader-row">
                <button type="button" className="ev-edit-btn" onClick={() => onEdit(event)}>
                  <Icon size={14}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </Icon>
                  Edit
                </button>
                <button type="button" className="ev-delete-btn" onClick={() => onDeleteRequest(event)}>
                  <Icon size={14}>
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </Icon>
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {isPast && isLeader && (
        <>
          <div className="ev-card-sep" />
          <div className="ev-actions">
            <button
              type="button"
              className="ev-rsvp-btn not-rsvpd"
              onClick={() => navigateTo('attendance', null, event.id)}
            >
              <span>Take / Edit Attendance</span>
            </button>
            <div className="ev-leader-row" style={{ marginTop: '8px' }}>
              <button type="button" className="ev-edit-btn" onClick={() => onEdit(event)}>
                <Icon size={14}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </Icon>
                Edit
              </button>
              <button type="button" className="ev-delete-btn" onClick={() => onDeleteRequest(event)}>
                <Icon size={14}>
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </Icon>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   EVENT FORM
───────────────────────────────────────────── */
function EventForm({ formData, setFormData, onSubmit, onCancel, isEditing, error }) {
  return (
    <div className="create-form-wrap event-form">
      <div className="create-form-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            {isEditing ? 'Edit event' : 'Schedule event'}
          </div>
          <h2 className="create-form-title">
            {isEditing ? <>Update <em>event</em></> : <>Create <em>event</em></>}
          </h2>
          <p className="event-form__hint">
            Add title, place, and time. Members will see this on the calendar.
          </p>
        </div>
        <button type="button" className="create-form-close" onClick={onCancel} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="create-form-body event-form__body">
        <div className="event-form__layout">
          {/* Cover preview column */}
          <div className="event-form__cover">
            <div className="event-form__cover-label">Cover image</div>
            <div className="event-form__cover-preview">
              <img
                src={formData.image || '/hero-inkotanyi.png'}
                alt="Cover preview"
                onError={e => { e.target.src = '/hero-inkotanyi.png'; }}
              />
              <div className="event-form__cover-shade" />
              {(formData.date || formData.time) && (
                <div className="event-form__cover-meta">
                  {formData.date
                    ? new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Date'}
                  {formData.time ? ` · ${formData.time}` : ''}
                </div>
              )}
            </div>
            <input
              className="form-input"
              type="url"
              placeholder="Paste image URL (optional)"
              value={formData.image}
              onChange={e => setFormData(p => ({ ...p, image: e.target.value }))}
            />
            <p className="event-form__cover-note">Leave blank to use the default Inkotanyi image.</p>
          </div>

          {/* Fields column */}
          <div className="event-form__fields">
            {error && (
              <div className="alert alert--error" style={{ marginBottom: 20 }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="ev-title">Event title</label>
              <input
                id="ev-title"
                className="form-input"
                type="text"
                placeholder="e.g. District Unity Meeting"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ev-location">Location</label>
              <input
                id="ev-location"
                className="form-input"
                type="text"
                placeholder="e.g. Amahoro Stadium, Kigali"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
              />
            </div>

            <div className="event-form__row">
              <div className="form-group">
                <label htmlFor="ev-date">Date</label>
                <input
                  id="ev-date"
                  className="form-input"
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ev-time">Time</label>
                <input
                  id="ev-time"
                  className="form-input"
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ev-desc">Description</label>
              <textarea
                id="ev-desc"
                className="form-textarea"
                rows={4}
                placeholder="What is this event about? Who should attend?"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="event-form__actions">
              <button type="button" className="btn btn--primary" onClick={onSubmit}>
                <span>{isEditing ? 'Save changes' : 'Publish event'}</span>
              </button>
              <button type="button" className="btn btn--ghost" onClick={onCancel}>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EVENT MANAGEMENT PAGE
───────────────────────────────────────────── */
export function EventManagement({ navigateTo, onLogout, currentUser, events = [], onCreateEvent, onUpdateEvent, onDeleteEvent, onRSVP }) {
  const [isCreating,    setIsCreating]    = useState(false);
  const [editingEvent,  setEditingEvent]  = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [formData,      setFormData]      = useState(BLANK);
  const [formError,     setFormError]     = useState('');

  const isLeader = currentUser?.role === 'Leader';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcoming = events.filter(e => new Date(e.date) >= now).sort((a,b) => new Date(a.date)-new Date(b.date));
  const past     = events.filter(e => new Date(e.date) <  now).sort((a,b) => new Date(b.date)-new Date(a.date));

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      setFormError('Please fill in title, location, date, time, and description.');
      return;
    }
    setFormError('');
    const payload = {
      ...formData,
      image: formData.image?.trim() || '/hero-inkotanyi.png',
    };
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, payload);
    } else {
      onCreateEvent(payload);
    }
    setIsCreating(false); setEditingEvent(null); setFormData(BLANK);
  };

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    setFormError('');
    setFormData({ title:ev.title, description:ev.description, date:ev.date.split('T')[0],
      time:ev.time||'', location:ev.location||'', image:ev.image||'' });
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsCreating(false); setEditingEvent(null); setFormData(BLANK); setFormError('');
  };

  const handleDeleteConfirm = () => {
    onDeleteEvent(confirmTarget.id);
    setConfirmTarget(null);
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>

      {/* TOPBAR (Synchronized with Dashboard) */}
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
            ['MEMBERS','members'],
            ['PROFILE', 'profile']
          ].map(([lbl,dest]) => (
            <button key={dest}
              className={dest === 'events' ? 'active' : ''}
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

      {/* BANNER (Synchronized with Dashboard) */}
      <div className="db-banner">
        <img src="/hero-inkotanyi.png"
          alt="Banner" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">Events</div>
          <h1 className="db-banner-greeting">
            Party <em>calendar</em>
          </h1>
          <p className="db-banner-sub">
            {isLeader ? 'Create, manage, and track FPR Inkotanyi events.' : 'Browse upcoming Inkotanyi events and manage your RSVPs.'}
          </p>
        </div>
        <span className="db-banner-deco">E</span>
      </div>

      {/* BODY (Synchronized with Dashboard) */}
      <div className="db-body dot-bg" style={{ paddingTop: '48px' }}>

        {/* CREATE BUTTON */}
        {isLeader && !isCreating && (
          <div style={{ marginBottom: '24px' }}>
            <button className="btn btn--red btn--sm" onClick={() => setIsCreating(true)}>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create New Event
              </span>
            </button>
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        {isCreating && isLeader && (
          <div style={{ marginBottom: '40px' }}>
            <EventForm
              formData={formData}
              setFormData={(updater) => {
                setFormError('');
                setFormData(updater);
              }}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={!!editingEvent}
              error={formError}
            />
          </div>
        )}

        {/* UPCOMING EVENTS */}
        <div className="db-section">
          <div className="db-section-header">
            <div>
              <div className="section-count" style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                {upcoming.length} event{upcoming.length !== 1 ? 's' : ''}
              </div>
              <h2 className="db-section-title">Upcoming <em className="serif-accent">Events</em></h2>
            </div>
            {isLeader && !isCreating && (
              <button className="btn btn--primary btn--sm" onClick={() => { setFormError(''); setIsCreating(true); }}>
                <span>+ New Event</span>
              </button>
            )}
          </div>

          <div className="db-section-body">
            {upcoming.length === 0
              ? (
                <div className="empty-state" style={{ padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--border)' }}>
                  <div className="empty-state-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontStyle: 'italic', color: 'var(--text-faint)' }}>No upcoming events scheduled.</div>
                  {isLeader && <p className="empty-state-sub" style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Schedule your first event to get started.</p>}
                </div>
              )
              : (
                <div className="ev-grid">
                  {upcoming.map(ev => (
                    <EventCard key={ev.id} event={ev} currentUser={currentUser}
                      isLeader={isLeader} isPast={false}
                      onRSVP={onRSVP} onEdit={handleEdit}
                      onDeleteRequest={setConfirmTarget}
                      navigateTo={navigateTo} />
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* PAST EVENTS */}
        {past.length > 0 && (
          <div className="db-section" style={{ marginTop: '24px' }}>
            <div className="db-section-header">
              <div>
                <div className="section-count" style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  {past.length} past event{past.length !== 1 ? 's' : ''}
                </div>
                <h2 className="db-section-title">Past <em className="serif-accent">Events</em></h2>
              </div>
            </div>
            <div className="db-section-body">
              <div className="ev-grid">
                {past.map(ev => (
                  <EventCard key={ev.id} event={ev} currentUser={currentUser}
                    isLeader={isLeader} isPast={true}
                    onRSVP={onRSVP} onEdit={handleEdit}
                    onDeleteRequest={setConfirmTarget}
                    navigateTo={navigateTo} />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CONFIRM DELETE DIALOG */}
      {confirmTarget && (
        <ConfirmDialog
          eventTitle={confirmTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

    </div>
  );
}
