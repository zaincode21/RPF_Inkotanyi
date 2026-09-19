import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChevronDown } from "lucide-react";

/* ─── VISION SECTION ─── */
function VisionSection({ side, title, desc, points, img, deco }) {
  const isReverse = side === 'right';
  return (
    <section className={`vision-section ${isReverse ? 'vision-section--reverse' : ''} dot-grid`}>
      <div className="vision-section__img-col">
        <img src={img} alt={title} className="vision-section__img" />
        <div className="vision-section__img-overlay" />
      </div>
      <div className="vision-section__content">
        <span className="deco-letter vision-section__deco">{deco}</span>
        <div className="eyebrow">RPF Vision</div>
        <h2 className="vision-section__heading" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="vision-section__desc">{desc}</p>
        <ul className="vision-section__points">
          {points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </section>
  );
}

/* ─── POLICY CONFIGURATOR ─── */
function PolicyConfigurator() {
  const [activeTab, setActiveTab] = useState('education');
  const [openItems, setOpenItems] = useState(['curriculum']);
  const [priorities, setPriorities] = useState({ curriculum: 85, infrastructure: 60, teacher: 75 });

  const toggleItem = (id) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const updatePriority = (id, val) => {
    setPriorities(prev => ({ ...prev, [id]: parseInt(val) }));
  };

  const tabs = [
    { id: 'education', label: 'Education' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'economy', label: 'Economy' }
  ];

  const items = [
    { id: 'curriculum', label: 'National Curriculum Reform', desc: 'Modernizing learning pathways to focus on digital literacy and vocational excellence.' },
    { id: 'infrastructure', label: 'School Infrastructure', desc: 'Building smart classrooms and sustainable facilities in every district.' },
    { id: 'teacher', label: 'Teacher Empowerment', desc: 'Investing in competitive salaries and continuous professional development.' }
  ];

  return (
    <section className="policy-section dot-grid--dark">
      <div className="policy-grid">
        <div className="policy-left-col">
          <div className="eyebrow eyebrow--dark">Interactive Policy</div>
          <h2 className="policy-heading t-light">Shape Our <em className="serif-accent">Priorities.</em></h2>
          <p className="policy-sub" style={{ maxWidth: '340px', marginTop: '16px', marginBottom: '36px' }}>
            Adjust the sliders to see how we prioritize resources for a better future.
          </p>
          <div className="flex gap-sm flex-wrap">
            {tabs.map(t => (
              <button 
                key={t.id} 
                className={`btn btn--pill ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="policy-right-col">
          <div className="flex-col">
            {items.map(item => (
              <div key={item.id} className={`policy-item ${openItems.includes(item.id) ? 'is-open' : ''}`}>
                <div className="policy-item__top" onClick={() => toggleItem(item.id)} style={{ cursor: 'pointer' }}>
                  <span className="policy-item__label">{item.label}</span>
                  <ChevronDown className={`policy-item__chevron ${openItems.includes(item.id) ? 'is-rotated' : ''}`} />
                </div>
                <div className="policy-item__desc">
                  <p className="t-meta t-light-muted" style={{ marginBottom: '14px' }}>{item.desc}</p>
                  <div className="policy-slider-row">
                    <input 
                      type="range" min="0" max="100" 
                      value={priorities[item.id]} 
                      onChange={(e) => updatePriority(item.id, e.target.value)}
                      className="policy-slider" 
                    />
                    <span className="policy-value">{priorities[item.id]}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────── */
export function LandingPage({ navigateTo }) {
  return (
    <div className="dot-grid">
      <Header navigateTo={navigateTo} />

      {/* ── HERO ── */}
      <section className="hero-split">
        <div className="hero-panel">
          <span className="deco-letter deco-letter--light hero-panel__deco">I</span>
          <div className="eyebrow eyebrow--dark">Rwandan Patriotic Front</div>
          <h1 className="hero-panel__heading">
            Inko<em className="serif-accent">tanyi</em>
          </h1>
          <p className="hero-panel__sub">
            The official member portal for RPF Inkotanyi — register, follow events, and serve Rwanda with unity, work, and patriotism.
          </p>
          
          <div className="flex gap-md" style={{ marginTop: '44px' }}>
            <button className="btn btn--red" onClick={() => navigateTo('register')}>
              <span>Join Inkotanyi</span>
            </button>
            <button className="btn btn--ghost-dark" onClick={() => navigateTo('login')}>
              <span>Member Sign In</span>
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="flex-col">
                <div className="hero-stat__num">30<em>+</em></div>
                <div className="hero-stat__label">Districts</div>
              </div>
            </div>
            <div className="hero-stat">
              <div className="flex-col">
                <div className="hero-stat__num">RPF</div>
                <div className="hero-stat__label">Inkotanyi</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-image-side">
        <img src="/hero-inkotanyi.png" alt="FPR Inkotanyi gathering" />
          <div className="hero-image-side__caption">
            <p className="t-meta t-light-faint" style={{ fontStyle: 'italic' }}>
              Unity · Work · Patriotism.<br />Serving Rwanda.
            </p>
          </div>
        </div>
      </section>

      {/* ── VISION SECTIONS ── */}
      <VisionSection 
        side="left"
        deco="U"
        title="National <em class='serif-accent'>Unity.</em>"
        desc="Inkotanyi stands for a Rwanda where every citizen belongs — healing, reconciliation, and shared purpose across all communities."
        points={['Unity and reconciliation', 'Dignity for every Rwandan', 'Strong institutions for peace']}
        img="/hero-inkotanyi.png"
      />

      <div className="container" style={{ padding: '0 56px' }}>
        <div style={{ height: '1px', background: 'var(--border)', opacity: 0.5 }} />
      </div>

      <VisionSection 
        side="right"
        deco="D"
        title="National <em class='serif-accent'>Development.</em>"
        desc="From liberation to transformation — RPF priorities for jobs, infrastructure, health, education, and a knowledge-based economy."
        points={['Infrastructure and energy access', 'Jobs for youth and women', 'Quality health and education']}
        img="/hero-inkotanyi.png"
      />

      {/* ── POLICY ── */}
      <PolicyConfigurator />

      {/* ── CTA ── */}
      <section className="cta-band">
        <div className="cta-band__text">
          <h2 className="cta-band__heading">Serve with <em className="serif-accent">Inkotanyi.</em></h2>
          <p className="cta-band__sub">Register as an RPF member and take part in the work of building Rwanda.</p>
        </div>
        <button className="btn btn--white" onClick={() => navigateTo('register')}>
          <span>Become a Member</span>
        </button>
      </section>

      <Footer navigateTo={navigateTo} />
    </div>
  );
}