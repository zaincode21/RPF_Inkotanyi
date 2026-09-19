import { useState, useEffect } from "react";
import { ImageUpload } from "./ImageUpload";
import { toast } from "sonner";
import { BrandLogo } from "./BrandLogo";

export function ProfilePage({
  navigateTo,
  onLogout,
  currentUser,
  users,
  selectedUserId,
  onUpdateUser,
  token,
}) {
  const isLeader = currentUser?.role === "Leader";
  const profileUser =
    selectedUserId && isLeader
      ? users.find((u) => u.id === selectedUserId) || currentUser
      : currentUser;

  const [formData, setFormData] = useState({
    fullName: profileUser.fullName,
    email: profileUser.email,
    phone: profileUser.phone,
    username: profileUser.username,
    profileImage: profileUser.profileImage || "",
  });

  useEffect(() => {
    setFormData({
      fullName: profileUser.fullName,
      email: profileUser.email,
      phone: profileUser.phone,
      username: profileUser.username,
      profileImage: profileUser.profileImage || "",
    });
  }, [profileUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.username) {
      toast.error("Please fill in all required fields");
      return;
    }
    onUpdateUser(profileUser.id, formData);
    toast.success("Profile updated successfully!");
  };

  const canEdit = currentUser.id === profileUser.id || isLeader;

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
              className={dest === 'profile' ? 'active' : ''}
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
          alt="Profile" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">Profile</div>
          <h1 className="db-banner-greeting">
            Account <em>settings</em>
          </h1>
          <p className="db-banner-sub">Update your Inkotanyi membership details.</p>
        </div>
        <span className="db-banner-deco">P</span>
      </div>

      {/* ── BODY ── */}
      <div className="db-body dot-bg">

        <div className="db-section" style={{ padding: '0', overflow: 'visible' }}>
          <div className="db-section-header" style={{ padding: '32px 40px 0' }}>
            <h2 className="db-section-title">Identity <em className="serif-accent">Management</em></h2>
          </div>
          
          <div className="db-section-body" style={{ padding: '40px' }}>
            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'flex', gap: '48px', marginBottom: '48px' }}>
                {/* Avatar Section */}
                <div style={{ flexShrink: 0 }}>
                  <div className="eyebrow" style={{ marginBottom: '16px' }}>PROFILE PHOTO</div>
                  <div style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--white)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', position: 'relative' }}>
                    {canEdit ? (
                      <ImageUpload
                        value={formData.profileImage}
                        onChange={(url) => setFormData({ ...formData, profileImage: url })}
                        placeholder="Upload"
                        className="h-full w-full"
                        token={token}
                      />
                    ) : (
                      <img src={formData.profileImage || 'https://via.placeholder.com/160'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '12px', textAlign: 'center' }}>
                    {canEdit ? 'Click image to upload new' : 'View only mode'}
                  </p>
                </div>

                {/* Main Fields */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div className="form-group">
                    <label className="eyebrow" style={{ fontSize: '9px', marginBottom: '8px' }}>FULL NAME</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="form-group">
                    <label className="eyebrow" style={{ fontSize: '9px', marginBottom: '8px' }}>USERNAME</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="form-group">
                    <label className="eyebrow" style={{ fontSize: '9px', marginBottom: '8px' }}>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="form-group">
                    <label className="eyebrow" style={{ fontSize: '9px', marginBottom: '8px' }}>PHONE NUMBER</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div style={{ background: 'var(--cream)', padding: '24px 32px', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '40px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: '9px', color: 'var(--muted)' }}>ACCOUNT STATUS</div>
                  <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                    {profileUser.approved ? 'Verified Member' : <em style={{ color: 'var(--red)' }}>Pending Approval</em>}
                  </div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: '9px', color: 'var(--muted)' }}>ACCESS ROLE</div>
                  <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>
                    {profileUser.role.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: '9px', color: 'var(--muted)' }}>MEMBER SINCE</div>
                  <div style={{ fontSize: '18px', fontFamily: 'var(--font-serif)', marginTop: '4px' }}>2025</div>
                </div>
              </div>

              {canEdit && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="submit" className="btn btn--primary">
                    <span>Save Profile Changes</span>
                  </button>
                  <button type="button" className="btn btn--ghost" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} 
                    onClick={() => setFormData({
                      fullName: profileUser.fullName, email: profileUser.email,
                      phone: profileUser.phone, username: profileUser.username,
                      profileImage: profileUser.profileImage || ""
                    })}>
                    <span>Reset Fields</span>
                  </button>
                </div>
              )}
            </form>

            {isLeader && profileUser.id !== currentUser.id && (
              <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn--ghost btn--sm" style={{ borderColor: 'transparent', color: 'var(--red)' }} onClick={() => navigateTo('members')}>
                  <span>← Return to Member Directory</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QUICK CARDS */}
        <div className="stats-row" style={{ marginTop: '24px' }}>
           <div className="stat-card ink" style={{ padding: '32px' }}>
             <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
             <div className="stat-card-label" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>PLATFORM ACTIVITY</div>
             <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginTop: '4px' }}>Excellent</div>
           </div>
           <div className="stat-card ink" style={{ padding: '32px' }}>
             <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
             <div className="stat-card-label" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>MEMBERSHIP TIER</div>
             <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginTop: '4px' }}>Standard Member</div>
           </div>
           <div className="stat-card ink" style={{ padding: '32px' }}>
             <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
             <div className="stat-card-label" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>ENGAGEMENT RANK</div>
             <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginTop: '4px' }}>Top 10%</div>
           </div>
        </div>

      </div>
    </div>
  );
}