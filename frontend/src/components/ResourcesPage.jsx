import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { BrandLogo } from "./BrandLogo";

export function ResourcesPage({ navigateTo, onLogout, currentUser, resources = [], onResourcesChange }) {
  const isLeader = currentUser?.role === "Leader";
  const [activeTab, setActiveTab] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newRes, setNewRes] = useState({
    title: "",
    description: "",
    category: "MANIFESTO",
    fileUrl: "https://example.com/demo.pdf"
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingRes, setEditingRes] = useState(null);

  const categories = ["All", "MANIFESTO", "HISTORY", "STRUCTURE", "GUIDELINE"];
  const filtered = activeTab === "All" ? resources : resources.filter(r => r.category === activeTab);

  const openEdit = (res) => {
    setEditingRes(res);
    setNewRes({ ...res });
    setShowAddForm(true);
  };

  const openCreate = () => {
    setEditingRes(null);
    setNewRes({ title: "", description: "", category: "MANIFESTO", fileUrl: "https://example.com/demo.pdf" });
    setSelectedFile(null);
    setShowAddForm(true);
  };

  const handleDownload = (e, res) => {
    // If it's a locally "uploaded" file in this session
    if (res.localContent) {
      e.preventDefault();
      const url = window.URL.createObjectURL(res.localContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.title.replace(/\s+/g, '_') + '.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }

    if (res.fileUrl && res.fileUrl.includes('example.com')) {
      e.preventDefault();
      const blob = new Blob([`Mock PDF Content for: ${res.title}`], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.title.replace(/\s+/g, '_') + '.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...newRes,
        fileUrl: selectedFile ? `local://${selectedFile.name}` : newRes.fileUrl
      };
      
      let finalRes;
      if (editingRes) {
        finalRes = await api.updateResource(editingRes.id, payload);
        toast.success("Resource updated successfully");
        if (onResourcesChange) {
           onResourcesChange(resources.map(r => r.id === editingRes.id ? finalRes.data : r));
        }
      } else {
        finalRes = await api.createResource(payload);
        const augmented = { ...finalRes.data, localContent: selectedFile };
        toast.success("Resource uploaded successfully");
        if (onResourcesChange) onResourcesChange([...resources, augmented]);
      }

      setShowAddForm(false);
      setNewRes({ title: "", description: "", category: "MANIFESTO", fileUrl: "https://example.com/demo.pdf" });
      setSelectedFile(null);
      setEditingRes(null);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.deleteResource(id);
      toast.success("Resource deleted");
      if (onResourcesChange) onResourcesChange(resources.filter(r => r.id !== id));
    } catch (err) {
      toast.error("Failed to delete resource");
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
            <button key={dest} className={dest === 'resources' ? 'active' : ''} onClick={() => navigateTo(dest)}>{lbl}</button>
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
          alt="Resources" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">Resources</div>
          <h1 className="db-banner-greeting">
            Library & <em>archives</em>
          </h1>
          <p className="db-banner-sub">Policies, training materials, and official Inkotanyi documents.</p>
          
          {isLeader && (
            <button className="btn btn--primary" style={{ marginTop: '24px' }} onClick={() => setShowAddForm(true)}>
              <span>+ Add New Resource</span>
            </button>
          )}
        </div>
        <span className="db-banner-deco">R</span>
      </div>

      {/* ── ADD FORM MODAL ── */}
      {showAddForm && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '90%', background: 'white', padding: '40px' }}>
             <h2 className="serif-accent" style={{ fontSize: '32px', marginBottom: '24px' }}>Add Resource</h2>
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input 
                    type="text" className="form-input" required 
                    value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" style={{ height: '100px', padding: '12px' }} required
                    value={newRes.description} onChange={e => setNewRes({...newRes, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input" 
                    value={newRes.category} onChange={e => setNewRes({...newRes, category: e.target.value})}
                  >
                    <option value="MANIFESTO">MANIFESTO</option>
                    <option value="HISTORY">HISTORY</option>
                    <option value="STRUCTURE">STRUCTURE</option>
                    <option value="GUIDELINE">GUIDELINE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Attach PDF Document</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileChange}
                      style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }}
                    />
                    <div className="form-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                      <span style={{ color: selectedFile ? 'var(--ink)' : 'var(--muted)', fontSize: '13px' }}>
                        {selectedFile ? selectedFile.name : 'Select a PDF file...'}
                      </span>
                      <button type="button" className="btn btn--ghost btn--sm" style={{ padding: '4px 8px' }}>Browse</button>
                    </div>
                  </div>
                  {!selectedFile && (
                    <div style={{ marginTop: '8px' }}>
                      <label className="form-label" style={{ fontSize: '10px' }}>Or provide a URL</label>
                      <input 
                        type="text" className="form-input"
                        value={newRes.fileUrl} onChange={e => setNewRes({...newRes, fileUrl: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                   <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Cancel</button>
                   <button type="submit" className="btn btn--primary" style={{ flex: 1 }} disabled={loading}>
                      <span>{loading ? 'Adding...' : 'Create Resource'}</span>
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
             <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', width: '100%', overflowX: 'auto', paddingBottom: '2px' }}>
               {categories.map(cat => {
                 const count = cat === "All" ? resources.length : resources.filter(r => r.category === cat).length;
                 
                 return (
                   <button 
                    key={cat} 
                    style={{ 
                      padding: '20px 4px', 
                      background: 'none', 
                      border: 'none', 
                      borderBottom: activeTab === cat ? '3px solid var(--red)' : '3px solid transparent',
                      color: activeTab === cat ? 'var(--ink)' : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => setActiveTab(cat)}
                   >
                     {cat}
                     <span style={{ 
                       fontSize: '10px', 
                       background: activeTab === cat ? 'var(--red)' : 'var(--border)', 
                       color: activeTab === cat ? 'white' : 'var(--muted)',
                       padding: '2px 6px',
                       borderRadius: '10px'
                     }}>
                       {count}
                     </span>
                   </button>
                 );
               })}
             </div>
          </div>

          <div className="db-section-body">
            <div className="resource-grid">
              {filtered.map(res => (
                <div key={res.id} className="resource-card">
                  <div className="resource-card-cat">{res.category}</div>
                  <h3 className="resource-card-title">{res.title}</h3>
                  <p className="resource-card-desc">{res.description}</p>
                  <div className="resource-download">
                    <span className="resource-format">PDF / 2.4 MB</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isLeader && (
                        <>
                          <button className="btn btn--ghost btn--sm" onClick={() => openEdit(res)}>
                            <span>Edit</span>
                          </button>
                          <button className="btn btn--sm" style={{ background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }} onClick={() => handleDelete(res.id)}>
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                      <a 
                        href={res.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn--primary btn--sm"
                        onClick={(e) => handleDownload(e, res)}
                      >
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HISTORICAL HIGHLIGHT */}
        <div className="db-section" style={{ background: 'var(--ink)', color: 'white', border: 'none', padding: '80px 40px', marginTop: '48px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="eyebrow eyebrow-light" style={{ color: 'var(--red)' }}>ESTABLISHED 1987</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', margin: '24px 0' }}>The Legacy of Unity</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '40px' }}>
              From the liberation struggle to national reconstruction, Inkotanyi has remained central to Rwanda’s stability and progress. Explore our history in the archives.
            </p>
            <button className="btn btn--primary" style={{ background: 'var(--red)' }}>
              <span>View Historical Archives</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
