import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { BrandLogo } from "./BrandLogo";

export function NewsPage({ navigateTo, onLogout, currentUser, news = [], onNewsChange }) {
  const isLeader = currentUser?.role === "Leader";
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: currentUser?.fullName || "Admin",
    type: "NEWS",
    coverImage: "/hero-inkotanyi.png"
  });

  const featured = news[0];
  const sidebarNews = news.slice(1, 4);
  const regularNews = news.slice(4);

  const fmt = d => new Date(d || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const openCreate = () => {
    setEditingNews(null);
    setFormData({
      title: "",
      content: "",
      author: currentUser?.fullName || "Admin",
      type: "NEWS",
      coverImage: "/hero-inkotanyi.png"
    });
    setShowForm(true);
  };

  const openEdit = (n) => {
    setEditingNews(n);
    setFormData({ ...n });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news article?")) return;
    try {
      await api.deleteNews(id);
      toast.success("News deleted");
      if (onNewsChange) onNewsChange(news.filter(n => n.id !== id));
    } catch (err) {
      toast.error("Failed to delete news");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingNews) {
        const res = await api.updateNews(editingNews.id, formData);
        toast.success("Article updated");
        if (onNewsChange) onNewsChange(news.map(n => n.id === editingNews.id ? res.data : n));
      } else {
        const res = await api.createNews(formData);
        toast.success("Article posted successfully");
        if (onNewsChange) onNewsChange([res.data, ...news]);
      }
      setShowForm(false);
    } catch (err) {
      toast.error("Failed to save article");
    } finally {
      setLoading(false);
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
            <button key={dest} className={dest === 'news' ? 'active' : ''} onClick={() => navigateTo(dest)}>{lbl}</button>
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
          alt="News" onError={e => e.target.style.display='none'} />
        <div className="db-banner-overlay" />
        <div className="db-banner-content">
          <div className="eyebrow eyebrow-light">News</div>
          <h1 className="db-banner-greeting">
            Press & <em>updates</em>
          </h1>
          <p className="db-banner-sub">Official statements and stories from FPR Inkotanyi.</p>
          {isLeader && (
            <button className="btn btn--primary" style={{ marginTop: '24px' }} onClick={openCreate}>
              <span>+ Post News / Blog</span>
            </button>
          )}
        </div>
        <span className="db-banner-deco">N</span>
      </div>

      {/* ── BIG FORM MODAL ── */}
      {showForm && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="modal-content" style={{ 
            maxWidth: '1000px', 
            width: '95%', 
            background: 'white', 
            padding: '60px', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            boxShadow: '0 40px 100px rgba(0,0,0,0.2)'
          }}>
             <h2 className="serif-accent" style={{ fontSize: '48px', marginBottom: '40px' }}>
               {editingNews ? 'Edit Story' : 'New Story'}
             </h2>
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input 
                      type="text" className="form-input" required style={{ fontSize: '24px', fontWeight: '700' }}
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                       <option value="NEWS">Official News</option>
                       <option value="OPINION">Opinion / Blog</option>
                       <option value="EVENT">Announcement</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">Author</label>
                    <input type="text" className="form-input" required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cover Image URL</label>
                    <input type="text" className="form-input" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Content (Markdown supported)</label>
                  <textarea 
                    className="form-input" style={{ height: '300px', padding: '24px', lineHeight: '1.8', fontSize: '16px' }} required
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                    placeholder="Write your story here..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '20px' }}>
                   <button type="button" className="btn btn--ghost" style={{ padding: '12px 32px', border: '1px solid var(--border)' }} onClick={() => setShowForm(false)}>Cancel</button>
                   <button type="submit" className="btn btn--primary" style={{ padding: '12px 48px' }} disabled={loading}>
                      <span>{loading ? 'Posting...' : (editingNews ? 'Update Story' : 'Post Story')}</span>
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="db-body dot-bg">
        <div className="db-section">
          <div className="news-grid">
            {/* Main Featured Section */}
            <div className="news-main">
              {featured && (
                <div className="news-card-hero">
                  <div className="ev-img-wrap" style={{ height: '500px', cursor: 'pointer' }} onClick={() => navigateTo('news-detail', null, featured.id)}>
                    <img src={featured.coverImage} alt={featured.title} className="ev-img" />
                    <span className="ev-img-date">{fmt(featured.publishDate)}</span>
                  </div>
                  <div className="news-meta" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                       {featured.type === 'OPINION' && <span className="opinion-badge">Guest Corner</span>}
                       <span className="eyebrow">{featured.author}</span>
                     </div>
                     {isLeader && (
                       <div style={{ display: 'flex', gap: '8px' }}>
                         <button className="btn btn--sm btn--ghost" onClick={() => openEdit(featured)}>Edit</button>
                         <button className="btn btn--sm" style={{ background: '#fef2f2', color: 'var(--red)', border: 'none' }} onClick={() => handleDelete(featured.id)}>Delete</button>
                       </div>
                     )}
                  </div>
                  <h2 
                    className="news-card-hero-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', lineHeight: '1.1', color: 'var(--ink)', cursor: 'pointer' }}
                    onClick={() => navigateTo('news-detail', null, featured.id)}
                  >
                    {featured.title}
                  </h2>
                  <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: '1.6' }}>{featured.content.substring(0, 200)}...</p>
                  <button className="btn btn--primary btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigateTo('news-detail', null, featured.id)}>
                    <span>Read Full Story</span>
                  </button>
                </div>
              )}

              {/* Regular News List */}
              <div className="grid-2" style={{ gap: '40px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
                {regularNews.map(n => (
                  <div key={n.id} className="news-card-hero">
                    <div className="ev-img-wrap" style={{ height: '240px', cursor: 'pointer' }} onClick={() => navigateTo('news-detail', null, n.id)}>
                      <img src={n.coverImage} alt={n.title} className="ev-img" />
                    </div>
                    <div className="news-meta" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                       <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                         {n.type === 'OPINION' && <span className="opinion-badge">Guest Corner</span>}
                         <span className="eyebrow" style={{ fontSize: '9px' }}>{n.author}</span>
                       </div>
                       {isLeader && (
                         <div style={{ display: 'flex', gap: '8px' }}>
                           <button className="btn btn--sm btn--ghost" onClick={() => openEdit(n)} style={{ padding: '2px 8px' }}>Edit</button>
                           <button className="btn btn--sm" onClick={() => handleDelete(n.id)} style={{ padding: '2px 8px', background: '#fef2f2', color: 'var(--red)', border: 'none' }}>Delete</button>
                         </div>
                       )}
                    </div>
                    <h3 
                      style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', cursor: 'pointer' }}
                      onClick={() => navigateTo('news-detail', null, n.id)}
                    >
                      {n.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="news-sidebar">
              <div className="eyebrow" style={{ marginBottom: '24px', borderBottom: '2px solid var(--red)', paddingBottom: '8px', display: 'inline-block' }}>LATEST UPDATES</div>
              {sidebarNews.map(n => (
                <div key={n.id} className="news-card-sm">
                  <div className="ev-img-wrap" style={{ cursor: 'pointer' }} onClick={() => navigateTo('news-detail', null, n.id)}>
                    <img src={n.coverImage} alt={n.title} className="ev-img" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="ev-title" style={{ cursor: 'pointer' }} onClick={() => navigateTo('news-detail', null, n.id)}>{n.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="eyebrow" style={{ fontSize: '8px', color: 'var(--muted)' }}>{fmt(n.publishDate)}</span>
                      {isLeader && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn--ghost" onClick={() => openEdit(n)} style={{ padding: '0px', fontSize: '8px', border: 'none' }}>Edit</button>
                          <button className="btn btn--ghost" onClick={() => handleDelete(n.id)} style={{ padding: '0px', fontSize: '8px', border: 'none', color: 'var(--red)' }}>Del</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="stat-card red" style={{ marginTop: '40px', padding: '24px' }}>
                <div className="eyebrow eyebrow-light">NEWSLETTER</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'white', marginTop: '8px' }}>Stay Informed</h3>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: '12px 0 20px' }}>Get the latest Inkotanyi updates delivered to your inbox.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="email" className="form-input" placeholder="Your email" style={{ background: 'white', color: 'black', height: '36px' }} />
                  <button className="btn btn--primary btn--sm" style={{ background: 'var(--ink)', height: '36px' }}><span>Join</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
