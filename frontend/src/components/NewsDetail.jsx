import { BrandLogo } from "./BrandLogo";
export function NewsDetail({ navigateTo, onLogout, currentUser, newsItem }) {
  if (!newsItem) return null;
  const isLeader = currentUser?.role === "Leader";
  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

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
            ['MEMBERS','members'],
            ['PROFILE','profile']
          ].map(([lbl,dest]) => (
            <button key={dest} className={dest === 'news' ? 'active' : ''} onClick={() => navigateTo(dest)}>{lbl}</button>
          ))}
        </div>
        <div className="topbar-right">
           <button className="topbar-logout" onClick={() => navigateTo('news')}>← Back to News</button>
        </div>
      </div>

      {/* ── ARTICLE HEADER ── */}
      <div className="db-body dot-bg" style={{ paddingTop: '60px' }}>
        <article className="db-section" style={{ maxWidth: '800px', margin: '0 auto', background: 'transparent' }}>
          <div className="news-meta" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
             {newsItem.type === 'OPINION' && <span className="opinion-badge">Guest Corner</span>}
             <span className="eyebrow">{newsItem.author}</span>
             <span className="eyebrow" style={{ color: 'var(--muted)' }}>{fmt(newsItem.publishDate)}</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '56px', lineHeight: '1.1', color: 'var(--ink)', marginBottom: '40px' }}>
            {newsItem.title}
          </h1>

          {newsItem.coverImage && (
            <div className="ev-img-wrap" style={{ height: '450px', marginBottom: '60px', borderRadius: '0' }}>
              <img src={newsItem.coverImage} alt={newsItem.title} className="ev-img" />
            </div>
          )}

          <div style={{ fontSize: '20px', lineHeight: '1.7', color: '#333', fontFamily: 'var(--font-geist)', whiteSpace: 'pre-wrap' }}>
            {newsItem.content}
          </div>

          <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow">SHARE THIS STORY</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn btn--sm btn--ghost" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}><span>𝕏</span></button>
                <button className="btn btn--sm btn--ghost" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}><span>fb</span></button>
              </div>
            </div>
            <button className="btn btn--primary" onClick={() => navigateTo('news')}>
              <span>Return to Archive</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
