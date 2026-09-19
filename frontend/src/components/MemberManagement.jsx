import { useState } from 'react';
import { BrandLogo } from "./BrandLogo";

export function MemberManagement({
  navigateTo,
  onLogout,
  currentUser,
  users = [],
  onApproveUser,
  onRejectUser,
  onDeactivateUser,
  onUpdateUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const isLeader = currentUser?.role === 'Leader';

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'approved' && user.approved) ||
      (filterStatus === 'pending' && !user.approved);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const approvedMembers = users.filter(u => u.approved);
  const pendingMembers = users.filter(u => !u.approved);

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
            ['NEWS', 'news'],
            ['PROGRESS', 'achievements'],
            ['RESOURCES', 'resources'],
            ['EVENTS', 'events'],
            ['ATTENDANCE', 'attendance'],
            ['MEMBERS', 'members'],
            ['PROFILE', 'profile']
          ].map(([lbl, dest]) => (
            <button key={dest}
              className={dest === 'members' ? 'active' : ''}
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
          alt="Members" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">Members</div>
          <h1 className="db-banner-greeting">
            Member <em>directory</em>
          </h1>
          <p className="db-banner-sub">Approve applicants and manage FPR Inkotanyi member profiles.</p>
        </div>
        <span className="db-banner-deco">M</span>
      </div>

      {/* ── BODY ── */}
      <div className="db-body dot-bg">
        
        {/* STATS ROW */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { cls: 'green', deco: 'A', num: approvedMembers.length, label: 'Approved Members', stroke: '#16a34a',
              icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
            { cls: 'red', deco: 'P', num: pendingMembers.length, label: 'Pending Approval', stroke: '#E21526',
              icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
            { cls: 'ink', deco: 'T', num: users.length, label: 'Total Users', stroke: '#2DA5DE',
              icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <span className="stat-card-deco">{s.deco}</span>
              <div className="stat-card-top">
                <div className="stat-card-icon">
                  <svg viewBox="0 0 24 24" stroke={s.stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px' }}>{s.icon}</svg>
                </div>
                <div className="stat-card-num">{s.num}</div>
              </div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTERS & SEARCH */}
        <div className="db-section" style={{ padding: '0' }}>
          <div className="db-section-body" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="form-input"
                  style={{ background: 'transparent', padding: '12px 0 12px 40px' }}
                />
                <svg viewBox="0 0 24 24" stroke="var(--text-faint)" fill="none" strokeWidth="2" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '18px' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'approved', 'pending'].map(st => (
                  <button
                    key={st}
                    onClick={() => { setFilterStatus(st); setCurrentPage(1); }}
                    className={`btn btn--sm ${filterStatus === st ? 'btn--primary' : 'btn--ghost'}`}
                    style={filterStatus !== st ? { color: 'var(--text-muted)', borderColor: 'var(--border)' } : {}}
                  >
                    <span>{st.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MEMBERS TABLE */}
        <div className="db-section">
          <div className="db-section-header">
            <h2 className="db-section-title">Directory <em className="serif-accent">Registry</em></h2>
            <div className="section-count">{filteredUsers.length} total</div>
          </div>
          <div className="db-section-body" style={{ padding: '0 32px 32px' }}>
            <div className="rsvp-list">
              {paginatedUsers.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                  No members found matching your criteria.
                </div>
              ) : (
                paginatedUsers.map((u) => (
                  <div className="rsvp-item" key={u.id}>
                    <div className="member-card__initials-wrap" style={{ width: '48px', height: '48px', fontSize: '16px', marginBottom: 0 }}>
                      {u.profileImage
                        ? <img src={u.profileImage} alt={u.fullName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : u.fullName?.split(' ').map(w=>w[0]).join('')}
                    </div>
                    <div className="rsvp-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="rsvp-title" style={{ fontSize: '18px', marginBottom: 0 }}>{u.fullName}</div>
                        <span className={`rsvp-badge`} style={u.approved ? {} : { color: '#b45309', background: '#fffbeb', borderColor: '#fcd34d' }}>
                          {u.approved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                      <div className="rsvp-meta" style={{ marginTop: '4px' }}>
                        <span className="rsvp-meta-item">{u.email}</span>
                        <span className="rsvp-meta-item" style={{ color: 'var(--red)', fontWeight: '500' }}>{u.role.toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      {!u.approved ? (
                        <>
                          <button className="btn btn--primary btn--sm" style={{ background: '#15803d' }} onClick={() => onApproveUser(u.id)}>
                            <span>Approve</span>
                          </button>
                          <button className="btn btn--ghost btn--sm" style={{ color: 'var(--red)', borderColor: 'rgba(196,30,30,0.2)' }} onClick={() => onRejectUser(u.id)}>
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn--ghost btn--sm" onClick={() => navigateTo('profile', u.id)}>
                            <span>Edit Profile</span>
                          </button>
                          {u.role !== 'Leader' && (
                            <button className="btn btn--ghost btn--sm" style={{ color: 'var(--text-faint)' }} onClick={() => onDeactivateUser(u.id)}>
                              <span>Deactivate</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                >
                  <span>Prev</span>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn btn--sm ${currentPage === i + 1 ? 'btn--primary' : 'btn--ghost'}`}
                    style={currentPage !== i + 1 ? { width: '40px', padding: '0', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' } : { width: '40px', padding: '0', display: 'flex', justifyContent: 'center' }}
                  >
                    <span>{i + 1}</span>
                  </button>
                ))}
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                >
                  <span>Next</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
