import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const PUBLIC_LINKS = [
  { label: "News", page: "news" },
  { label: "Events", page: "events" },
  { label: "Progress", page: "achievements" },
  { label: "Resources", page: "resources" },
];

const PILLARS = [
  {
    kiny: "Demokrasi",
    en: "Democracy",
    desc: "Transparent leadership and accountable institutions for every Rwandan.",
  },
  {
    kiny: "Ubumwe",
    en: "Unity",
    desc: "One nation, one people — reconciliation and shared purpose across communities.",
  },
  {
    kiny: "Amajyambere",
    en: "Development",
    desc: "Jobs, infrastructure, health, and education that lift every household.",
  },
];

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HomePage({ navigateTo, events = [], users = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const upcoming = (events.length ? events : []).slice(0, 3);
  const leaders = (users.length ? users : []).slice(0, 6);

  return (
    <div className="home-page">
      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nav__logo" onClick={() => navigateTo("home")}>
          <BrandLogo size="md" />
        </div>

        <div className="nav__links md:flex hidden">
          {PUBLIC_LINKS.map((link) => (
            <button
              key={link.page}
              className="nav__link"
              onClick={() => navigateTo(link.page)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="nav__actions">
          <button className="nav__sign-in hidden md:flex" onClick={() => navigateTo("login")}>
            Sign in
          </button>
          <button className="btn btn--red btn--sm" onClick={() => navigateTo("register")}>
            <span>Join</span>
          </button>
          <button
            className="nav__menu-btn md:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>

        {menuOpen && (
          <div className="nav__drawer">
            {PUBLIC_LINKS.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  setMenuOpen(false);
                  navigateTo(link.page);
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                navigateTo("login");
              }}
            >
              Sign in
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO: brand + headline + line + CTAs + full-bleed image ── */}
      <section className="hero-home">
        <div
          className="hero-home__media"
          style={{
            backgroundImage: "url('/hero-inkotanyi.png')",
          }}
          role="img"
          aria-label="FPR Inkotanyi national congress"
        />
        <div className="hero-home__veil" />

        <div className="hero-home__inner">
          <motion.div
            className="hero-home__brand"
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
          >
            <BrandLogo size="xl" />
          </motion.div>

          <motion.p
            className="hero-home__eyebrow"
            initial="hidden"
            animate="show"
            custom={1}
            variants={fadeUp}
          >
            Rwandan Patriotic Front
          </motion.p>

          <motion.h1
            className="hero-home__title"
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
          >
            Serve Rwanda with{" "}
            <em>Inkotanyi</em>
          </motion.h1>

          <motion.p
            className="hero-home__sub"
            initial="hidden"
            animate="show"
            custom={3}
            variants={fadeUp}
          >
            The official member portal — register, follow events, and take part in our mission of democracy, unity, and development.
          </motion.p>

          <motion.div
            className="hero-home__cta"
            initial="hidden"
            animate="show"
            custom={4}
            variants={fadeUp}
          >
            <button className="btn btn--red" onClick={() => navigateTo("register")}>
              <span>Become a Member</span>
            </button>
            <button className="btn btn--ghost" onClick={() => navigateTo("login")}>
              <span>Member Sign In</span>
            </button>
          </motion.div>
        </div>

        <motion.div
          className="hero-home__scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-hidden
        >
          <span />
        </motion.div>
      </section>

      {/* ── PILLARS (one job: values) ── */}
      <section className="pillars">
        <div className="container pillars__grid">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.kiny}
              className="pillar"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              variants={fadeUp}
            >
              <span className="pillar__index">0{i + 1}</span>
              <h2 className="pillar__kiny">{p.kiny}</h2>
              <p className="pillar__en">{p.en}</p>
              <p className="pillar__desc">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section className="section-home">
        <div className="container">
          <div className="section-home__head">
            <div>
              <div className="eyebrow">Calendar</div>
              <h2 className="t-heading-xl">
                Upcoming <em className="serif-accent">events</em>
              </h2>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => navigateTo("events")}>
              <span>View all</span>
            </button>
          </div>

          {upcoming.length === 0 ? (
            <p className="t-body" style={{ marginTop: 24 }}>
              No upcoming events yet. Check back soon.
            </p>
          ) : (
            <div className="event-list">
              {upcoming.map((ev, i) => (
                <motion.button
                  key={ev.id}
                  type="button"
                  className="event-row"
                  onClick={() => navigateTo("events")}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  custom={i}
                  variants={fadeUp}
                >
                  <div className="event-row__date">
                    <span className="event-row__day">
                      {ev.date ? new Date(ev.date).getDate() : "—"}
                    </span>
                    <span className="event-row__mon">
                      {ev.date
                        ? new Date(ev.date).toLocaleDateString("en-GB", { month: "short" })
                        : ""}
                    </span>
                  </div>
                  <div className="event-row__body">
                    <h3>{ev.title || ev.eventName}</h3>
                    <p>{ev.description || "FPR Inkotanyi member gathering."}</p>
                    <span className="event-row__meta">
                      {formatDate(ev.date)}
                      {ev.location ? ` · ${ev.location}` : ""}
                    </span>
                  </div>
                  <span className="event-row__arrow" aria-hidden>
                    →
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MEMBERS STRIP ── */}
      {leaders.length > 0 && (
        <section className="section-home section-home--muted">
          <div className="container">
            <div className="section-home__head">
              <div>
                <div className="eyebrow">Community</div>
                <h2 className="t-heading-xl">
                  Approved <em className="serif-accent">members</em>
                </h2>
              </div>
              <button className="btn btn--primary btn--sm" onClick={() => navigateTo("login")}>
                <span>Sign in to manage</span>
              </button>
            </div>

            <div className="member-strip">
              {leaders.map((m) => {
                const name = m.fullName || "Member";
                const initials =
                  m.initials ||
                  name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                return (
                  <div className="member-chip" key={m.id}>
                    <div className="member-chip__avatar">{initials}</div>
                    <div>
                      <div className="member-chip__name">{name}</div>
                      <div className="member-chip__role">{m.role || "Member"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="cta-home">
        <div className="cta-home__inner container">
          <BrandLogo size="md" />
          <h2>
            Ready to serve with <em>Inkotanyi</em>?
          </h2>
          <p>
            Register online. Leaders approve new members. Then access events, news, and FPR Inkotanyi resources.
          </p>
          <button className="btn btn--white" onClick={() => navigateTo("register")}>
            <span>Join Inkotanyi</span>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-home">
        <div className="container footer-home__grid">
          <div>
            <BrandLogo size="lg" />
            <p className="footer-home__desc">
              Official member portal of the Rwandan Patriotic Front (FPR Inkotanyi).
            </p>
          </div>
          <div>
            <span className="footer-home__label">Explore</span>
            {PUBLIC_LINKS.map((l) => (
              <button key={l.page} className="footer-home__link" onClick={() => navigateTo(l.page)}>
                {l.label}
              </button>
            ))}
          </div>
          <div>
            <span className="footer-home__label">Contact</span>
            <a className="footer-home__link" href="mailto:info@rpfinkotanyi.rw">
              info@rpfinkotanyi.rw
            </a>
            <a className="footer-home__link" href="https://rpfinkotanyi.rw/" target="_blank" rel="noreferrer">
              rpfinkotanyi.rw
            </a>
            <span className="footer-home__muted">BP: 195, Kigali · Rwanda</span>
          </div>
        </div>
        <div className="container footer-home__bottom">
          <span>© {new Date().getFullYear()} FPR Inkotanyi. Demokrasi · Ubumwe · Amajyambere.</span>
        </div>
      </footer>
    </div>
  );
}
