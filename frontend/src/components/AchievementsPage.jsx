import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { BrandLogo } from "./BrandLogo";

export function AchievementsPage({ navigateTo, onLogout, currentUser, achievements = [], onAchievementsChange }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingAch, setEditingAch] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLeader = currentUser?.role === "Leader";
  const categories = ["All", ...new Set(achievements.map(a => a.category))];
  const filtered = activeCategory === "All" ? achievements : achievements.filter(a => a.category === activeCategory);

  const [formData, setFormData] = useState({
    title: "",
    category: "Infrastructure",
    description: "",
    currentProgress: 0,
    targetValue: 100,
    unit: "%",
    yearLabel: "2024 Result"
  });

  const openEdit = (ach) => {
    setEditingAch(ach);
    setFormData({ ...ach });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingAch(null);
    setFormData({
      title: "",
      category: "Infrastructure",
      description: "",
      currentProgress: 0,
      targetValue: 100,
      unit: "%",
      yearLabel: "2024 Result"
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAch) {
        const res = await api.updateAchievement(editingAch.id, formData);
        toast.success("Progress updated successfully");
        if (onAchievementsChange) onAchievementsChange(achievements.map(a => a.id === editingAch.id ? res.data : a));
      } else {
        const res = await api.createAchievement(formData);
        toast.success("New target created successfully");
        if (onAchievementsChange) onAchievementsChange([...achievements, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this target?")) return;
    try {
      await api.deleteAchievement(id);
      toast.success("Target deleted");
      if (onAchievementsChange) onAchievementsChange(achievements.filter(a => a.id !== id));
    } catch (err) {
      toast.error("Failed to delete target");
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
            ['PROFILE','profile']
          ].filter(Boolean).map(([lbl,dest]) => (
            <button key={dest} className={dest === 'achievements' ? 'active' : ''} onClick={() => navigateTo(dest)}>{lbl}</button>
          ))}
        </div>
        <div className="topbar-right">
          <span className="topbar-user-name"><em>{currentUser?.fullName || 'Guest'}</em></span>
          {currentUser ? <button className="topbar-logout" onClick={onLogout}>Sign out</button> : <button className="topbar-logout" onClick={() => navigateTo('login')}>Login</button>}
        </div>
      </div>

      {/* ── BANNER ── */}
      <div className="db-banner">
        <img src="/hero-inkotanyi.png"
          alt="Achievements" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">Achievements</div>
          <h1 className="db-banner-greeting">
            Progress & <em>impact</em>
          </h1>
          <p className="db-banner-sub">Milestones and national development highlights.</p>
          {isLeader && (
            <button className="btn btn--primary" style={{ marginTop: '24px' }} onClick={openCreate}>
              <span>+ Add New Target</span>
            </button>
          )}
        </div>
        <span className="db-banner-deco">P</span>
      </div>

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="modal-content" style={{ 
            maxWidth: '900px', 
            width: '95%', 
            background: 'white', 
            padding: '60px', 
            borderRadius: '0', 
            boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)' 
          }}>
             <h2 className="serif-accent" style={{ fontSize: '48px', marginBottom: '40px', color: 'var(--ink)' }}>
                {editingAch ? 'Update Progress' : 'New Target'}
             </h2>
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input type="text" className="form-input" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" style={{ height: '100px', padding: '16px', lineHeight: '1.6' }} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Current Value</label>
                    <input type="number" className="form-input" required value={formData.currentProgress} onChange={e => setFormData({...formData, currentProgress: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Value</label>
                    <input type="number" className="form-input" required value={formData.targetValue} onChange={e => setFormData({...formData, targetValue: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input type="text" className="form-input" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Year Label (e.g. 2024 Status)</label>
                    <input type="text" className="form-input" required value={formData.yearLabel} onChange={e => setFormData({...formData, yearLabel: e.target.value})} />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'flex-end' }}>
                   <button type="button" className="btn btn--ghost" style={{ padding: '12px 32px', color: 'var(--ink)', border: '1px solid var(--border)' }} onClick={() => setShowForm(false)}>
                      <span>Cancel</span>
                   </button>
                   <button type="submit" className="btn btn--primary" style={{ padding: '12px 32px' }} disabled={loading}>
                      <span>{loading ? 'Saving...' : (editingAch ? 'Update Progress' : 'Create Target')}</span>
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="db-body dot-bg">
        <div className="db-section">
          <div className="db-section-header">
            <div style={{ display: 'flex', gap: '12px' }}>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`btn btn--sm ${activeCategory === cat ? 'btn--primary' : 'btn--ghost'}`}
                  style={{ borderRadius: '20px', padding: '4px 16px' }}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="db-section-body">
            <div className="grid-3" style={{ gap: '32px' }}>
              {filtered.map(ach => {
                const percent = Math.min((ach.currentProgress / ach.targetValue) * 100, 100);
                return (
                  <div key={ach.id} className="stat-card ink" style={{ padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: '16px' }}>{ach.category}</div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px' }}>{ach.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-faint)', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>{ach.description}</p>
                    
                    <div className="progress-container">
                      <div className="progress-meta">
                        <span>{ach.yearLabel}</span>
                        <span>{ach.currentProgress.toLocaleString()}{ach.unit} / {ach.targetValue.toLocaleString()}{ach.unit}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '11px', fontWeight: '700' }}>{Math.round(percent)}% COMPLETE</span>
                       {isLeader ? (
                         <div style={{ display: 'flex', gap: '8px' }}>
                           <button className="btn btn--sm btn--ghost" style={{ padding: '4px 12px', border: '1px solid var(--red)', color: 'var(--ink)' }} onClick={() => openEdit(ach)}>
                             <span style={{ fontWeight: '700' }}>Edit</span>
                           </button>
                           <button className="btn btn--sm" style={{ padding: '4px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(ach.id)}>
                             <span>Delete</span>
                           </button>
                         </div>
                       ) : (
                         <span style={{ fontSize: '11px', color: 'var(--muted)' }}>TARGET: 2029</span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
