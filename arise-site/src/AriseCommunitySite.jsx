import React, { useState, useEffect } from "react";

// Set these in arise-site/.env as VITE_HERO_VIDEO_URL / VITE_PROMO_VIDEO_URL.
// Both are optional — leave unset and the hero falls back to the gradient
// background, and the promo slot shows a placeholder instead of a broken video.
const HERO_VIDEO_URL = import.meta.env.VITE_HERO_VIDEO_URL || "";
const PROMO_VIDEO_URL = import.meta.env.VITE_PROMO_VIDEO_URL || "";

const IMG = {
  logo: "https://lightcyan-elephant-814869.hostingersite.com/wp-content/uploads/2026/08/ChatGPT-Image-Aug-13-2026-03_50_04-PM.png",
  patta: "https://lightcyan-elephant-814869.hostingersite.com/wp-content/uploads/2026/08/Screenshot-2026-08-15-170610.png",
  bonny: "https://lightcyan-elephant-814869.hostingersite.com/wp-content/uploads/2026/08/bonny-e1786793010758.png",
  joseph: "https://lightcyan-elephant-814869.hostingersite.com/wp-content/uploads/2026/08/Screenshot-2026-08-15-170820-2.png",
  roney: "https://lightcyan-elephant-814869.hostingersite.com/wp-content/uploads/2026/08/350756036_956743608847777_1989990852913251343_n.jpg",
  mark: "https://lightcyan-elephant-814869.hostingersite.com/wp-content/uploads/2026/08/images-1.jpg",
};

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Join the team", href: "/volunteer" },
  { label: "Location", href: "#location" },
  { label: "Contact", href: "#contact" },
];

const SPEAKERS = [
  { name: "Bishop Samuel Patta", img: IMG.patta, description: "Description coming soon." },
  { name: "Bonny Kinkar", img: IMG.bonny, description: "Description coming soon." },
];

const ARTISTS = [
  { name: "Joseph Raj", img: IMG.joseph, description: "Description coming soon." },
  { name: "Roney Maben", img: IMG.roney, description: "Description coming soon." },
  { name: "Mark Tribhuvan", img: IMG.mark, description: "Description coming soon." },
];

function Flame() {
  return (
    <svg width="18" height="24" viewBox="0 0 18 24" fill="none" aria-hidden="true">
      <path
        d="M9 0C9 0 3 6.5 3 12.5C3 17.5 6 21 9 21C12 21 15 17.5 15 12.5C15 11 14.3 9.2 13.3 7.7C13.3 9.5 12.3 11 11 11C11.8 8.8 10.6 4.8 9 0Z"
        fill="#E3A857"
      />
      <path
        d="M9 13C9 13 7.3 15.2 7.3 17C7.3 18.7 8 20 9 20C10 20 10.7 18.7 10.7 17C10.7 15.9 10 14.3 9 13Z"
        fill="#1F1B2E"
      />
    </svg>
  );
}

function HeroBackgroundVideo({ src }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) return null;
  return (
    <video
      className="arise-hero-video"
      autoPlay
      muted
      loop
      playsInline
      onError={() => setErrored(true)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function PromoVideo({ src }) {
  const [errored, setErrored] = useState(false);
  if (src && !errored) {
    return (
      <video
        className="arise-promo-video"
        controls
        playsInline
        onError={() => setErrored(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  }
  return (
    <div className="arise-promo-placeholder">
      <div className="arise-promo-play">▶</div>
      <span>Promo video placeholder</span>
    </div>
  );
}

export default function ArisePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    document.title = "Arise Association | Arise Conference 2026";
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!selectedPerson) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedPerson(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPerson]);

  return (
    <div className="arise-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@300;400;500;600&display=swap');

        .arise-root {
          --ink: #1F1B2E;
          --panel: #2A2440;
          --panel-2: #241F38;
          --gold: #E3A857;
          --ember: #D97A6C;
          --cream: #F7F3EC;
          --lav: #A79FBF;
          font-family: 'Work Sans', sans-serif;
          background: var(--ink);
          color: var(--cream);
          width: 100%;
          overflow-x: hidden;
        }
        .arise-root * { box-sizing: border-box; }
        .arise-display { font-family: 'Fraunces', serif; }
        .arise-eyebrow {
          font-family: 'Work Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 500;
        }

        .arise-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 6vw;
          transition: background 0.3s ease, box-shadow 0.3s ease;
          background: transparent;
        }
        .arise-nav.scrolled {
          background: rgba(31, 27, 46, 0.92);
          backdrop-filter: blur(6px);
        }
        .arise-nav-logo { display: flex; align-items: center; gap: 10px; }
        .arise-nav-logo img { height: 38px; width: auto; border-radius: 4px; }
        .arise-nav-logo span { font-family: 'Fraunces', serif; font-size: 18px; letter-spacing: 0.03em; }
        .arise-nav-links { display: flex; gap: 34px; }
        .arise-nav-links a {
          color: var(--cream); text-decoration: none; font-size: 14px; font-weight: 400;
          position: relative; padding-bottom: 4px; opacity: 0.85;
        }
        .arise-nav-links a:hover { opacity: 1; }
        .arise-nav-links a::after {
          content: ''; position: absolute; left: 0; bottom: 0; width: 0; height: 1px;
          background: var(--gold); transition: width 0.25s ease;
        }
        .arise-nav-links a:hover::after { width: 100%; }
        .arise-nav-burger { display: none; background: none; border: none; color: var(--cream); font-size: 22px; cursor: pointer; }
        .arise-mobile-menu {
          display: none; flex-direction: column; gap: 18px; padding: 22px 6vw 26px;
          background: rgba(31,27,46,0.97);
        }
        .arise-mobile-menu a { color: var(--cream); text-decoration: none; font-size: 15px; }

        .arise-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          padding: 140px 6vw 170px;
          background: linear-gradient(180deg, #1F1B2E 0%, #1B1729 60%, #17131F 100%);
        }
        .arise-hero-media { position: absolute; inset: 0; z-index: 0; }
        .arise-hero-video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .arise-hero-overlay {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(227,168,87,0.16), transparent 55%),
            linear-gradient(180deg, rgba(31,27,46,0.55) 0%, rgba(27,23,41,0.75) 55%, rgba(23,19,31,0.95) 100%);
        }
        .arise-hero-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 760px;
        }
        .arise-hero-chip {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1px solid rgba(227,168,87,0.4);
          border-radius: 999px;
          padding: 7px 18px;
          font-size: 13px;
          letter-spacing: 0.04em;
          color: var(--gold);
          margin-bottom: 26px;
        }
        .arise-hero h1 {
          font-size: clamp(44px, 8vw, 96px);
          line-height: 0.98;
          font-weight: 500;
          margin: 0 0 18px;
          letter-spacing: -0.01em;
        }
        .arise-hero h1 em { font-style: italic; color: var(--gold); }
        .arise-hero-sub {
          font-size: clamp(15px, 1.6vw, 18px);
          color: var(--lav);
          max-width: 620px;
          line-height: 1.75;
          margin: 0 auto 36px;
          font-weight: 300;
        }
        .arise-hero-meta {
          display: flex; flex-wrap: wrap; gap: 28px; justify-content: center;
          margin-bottom: 40px;
        }
        .arise-hero-meta div { text-align: left; }
        .arise-hero-meta .label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--lav); margin-bottom: 4px; }
        .arise-hero-meta .value { font-family: 'Fraunces', serif; font-size: 19px; }

        .arise-btn {
          display: inline-block;
          font-family: 'Work Sans', sans-serif;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.04em;
          padding: 15px 38px;
          border-radius: 2px;
          background: var(--gold);
          color: #1F1B2E;
          text-decoration: none;
          border: 1px solid var(--gold);
          transition: background 0.25s ease, color 0.25s ease, transform 0.15s ease;
          cursor: pointer;
        }
        .arise-btn:hover { background: transparent; color: var(--gold); transform: translateY(-2px); }

        .arise-content {
          position: relative; z-index: 2;
          margin-top: -110px;
          padding: 0 6vw 20px;
          display: flex; flex-direction: column; gap: 56px;
        }
        .arise-panel {
          max-width: 1040px;
          width: 100%;
          margin: 0 auto;
          background: var(--panel);
          border: 1px solid rgba(227,168,87,0.25);
          border-radius: 10px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.45);
          padding: 56px 50px;
          text-align: center;
        }

        .arise-joinus { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; align-items: center; text-align: left; }
        .arise-joinus-copy h2 { margin: 8px 0 18px; font-size: clamp(28px, 4vw, 38px); }
        .arise-joinus-copy p { color: var(--lav); line-height: 1.75; font-weight: 300; margin: 0 0 26px; }
        .arise-promo-frame {
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          background: var(--panel-2);
          border: 1px solid rgba(227,168,87,0.3);
        }
        .arise-promo-video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .arise-promo-placeholder {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
          color: var(--lav); font-size: 13px; letter-spacing: 0.03em;
        }
        .arise-promo-play {
          width: 54px; height: 54px; border-radius: 50%;
          border: 1.5px solid var(--gold); color: var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; padding-left: 3px;
        }

        .arise-about-stats { display: flex; justify-content: center; gap: 60px; margin: 30px 0 8px; flex-wrap: wrap; }
        .arise-about-stat .num { font-family: 'Fraunces', serif; font-size: 40px; color: var(--gold); line-height: 1; }
        .arise-about-stat .label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--lav); margin-top: 8px; }
        .arise-about p { color: var(--lav); line-height: 1.8; font-weight: 300; max-width: 640px; margin: 0 auto; }

        .arise-panel h2 {
          font-family: 'Fraunces', serif; font-weight: 500;
          font-size: clamp(28px, 4vw, 38px);
          margin: 8px 0 8px;
        }
        .arise-panel .arise-grid { margin-top: 40px; }

        .arise-grid { display: grid; gap: 30px; max-width: 1080px; margin: 0 auto; }
        .arise-grid.two { grid-template-columns: repeat(2, minmax(220px, 1fr)); max-width: 620px; }
        .arise-grid.three { grid-template-columns: repeat(3, minmax(180px, 1fr)); }

        .arise-card { text-align: center; }
        .arise-card-button {
          appearance: none;
          border: 0;
          padding: 0;
          color: inherit;
          font: inherit;
          cursor: pointer;
        }
        .arise-card-button:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 6px;
        }
        .arise-card-frame {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
          aspect-ratio: 4 / 5;
          background: var(--panel);
        }
        .arise-card-frame::after {
          content: '';
          position: absolute; inset: 0;
          border: 1px solid rgba(227,168,87,0.35);
          pointer-events: none;
        }
        .arise-card-frame img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(0.92); }
        .arise-card h3 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 19px; margin: 0; }

        .arise-person-modal {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          background: rgba(23,19,31,0.78);
        }
        .arise-person-modal-content {
          position: relative;
          width: min(100%, 440px);
          background: var(--panel);
          border: 1px solid rgba(227,168,87,0.35);
          border-radius: 6px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.55);
          padding: 28px;
          text-align: center;
        }
        .arise-person-modal-content img {
          width: 120px; height: 150px; object-fit: cover;
          border-radius: 4px; margin-bottom: 18px;
        }
        .arise-person-modal-content h2 {
          font-family: 'Fraunces', serif; font-weight: 500;
          font-size: 28px; margin: 0 0 10px;
        }
        .arise-person-modal-content p { color: var(--lav); line-height: 1.7; margin: 0; }
        .arise-person-modal-close {
          position: absolute; top: 10px; right: 12px;
          border: 0; background: transparent; color: var(--cream);
          font-size: 24px; line-height: 1; padding: 4px 8px; cursor: pointer;
        }
        .arise-person-modal-close:hover { color: var(--gold); }

        .arise-location {
          background: var(--panel-2);
          padding: 90px 6vw;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 50px;
          align-items: center;
        }
        .arise-location-copy { text-align: left; }
        .arise-location-copy p { color: var(--lav); line-height: 1.8; font-weight: 300; margin: 18px 0 26px; max-width: 420px; }
        .arise-location-name { font-family: 'Fraunces', serif; font-size: 30px; margin: 6px 0 2px; }
        .arise-location-sub { color: var(--gold); font-size: 14px; letter-spacing: 0.03em; margin-bottom: 20px; }
        .arise-map-frame { border-radius: 4px; overflow: hidden; border: 1px solid rgba(227,168,87,0.3); height: 340px; }
        .arise-map-frame iframe { width: 100%; height: 100%; border: 0; filter: grayscale(0.3) invert(0.92) contrast(0.9); }

        .arise-footer { background: #17131F; padding: 70px 6vw 30px; }
        .arise-footer-grid {
          display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 40px;
          max-width: 1080px; margin: 0 auto 50px; text-align: left;
        }
        .arise-footer h4 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 16px; margin: 0 0 18px; color: var(--gold); }
        .arise-footer ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .arise-footer a { color: var(--lav); text-decoration: none; font-size: 14px; }
        .arise-footer a:hover { color: var(--cream); }
        .arise-footer-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .arise-footer-logo img { height: 34px; border-radius: 4px; }
        .arise-footer-logo span { font-family: 'Fraunces', serif; font-size: 17px; }
        .arise-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 22px; max-width: 1080px; margin: 0 auto;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;
          font-size: 12px; color: var(--lav);
        }

        @media (max-width: 820px) {
          .arise-nav-links { display: none; }
          .arise-nav-burger { display: block; }
          .arise-grid.three { grid-template-columns: 1fr 1fr; }
          .arise-location { grid-template-columns: 1fr; }
          .arise-footer-grid { grid-template-columns: 1fr; }
          .arise-hero-meta { flex-direction: column; align-items: center; }
          .arise-hero-meta div { text-align: center; }
          .arise-content { margin-top: -60px; gap: 40px; }
          .arise-panel { padding: 38px 26px; }
          .arise-joinus { grid-template-columns: 1fr; text-align: center; }
          .arise-joinus-copy { text-align: center; }
          .arise-about-stats { gap: 36px; }
        }
        @media (max-width: 520px) {
          .arise-grid.two, .arise-grid.three { grid-template-columns: 1fr; max-width: 320px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .arise-btn, .arise-nav-links a::after { transition: none; }
        }
      `}</style>

      <nav className={`arise-nav ${scrolled ? "scrolled" : ""}`} id="home">
        <div className="arise-nav-logo">
          <img src={IMG.logo} alt="Arise Association logo" />
          <span>Arise Association</span>
        </div>
        <div className="arise-nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href}>{l.label}</a>
          ))}
        </div>
        <button
          className="arise-nav-burger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>
      {menuOpen && (
        <div className="arise-mobile-menu">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
        </div>
      )}

      <header className="arise-hero">
        <div className="arise-hero-media" aria-hidden="true">
          <HeroBackgroundVideo src={HERO_VIDEO_URL} />
          <div className="arise-hero-overlay" />
        </div>
        <div className="arise-hero-content">
          <div className="arise-hero-chip">
            <Flame />
            Arise Conference 2026
          </div>
          <h1 className="arise-display">
            Your time <em>has come</em>
          </h1>
          <p className="arise-hero-sub">
            This Christmas, Arise Association invites you to a special celebration of hope,
            faith, and new beginnings. Every season has a purpose, and a new chapter can
            bring restoration and new possibilities into our lives. Come with your family
            and friends. Come with expectation.
          </p>
          <div className="arise-hero-meta">
            <div>
              <div className="label">Venue</div>
              <div className="value">Don Bosco, Nerul</div>
            </div>
            <div>
              <div className="label">Dates</div>
              <div className="value">December 11–13</div>
            </div>
          </div>
          <a className="arise-btn" href="/volunteer">Register here</a>
        </div>
      </header>

      <div className="arise-content">
        <section className="arise-panel" id="join">
          <div className="arise-joinus">
            <div className="arise-promo-frame">
              <PromoVideo src={PROMO_VIDEO_URL} />
            </div>
            <div className="arise-joinus-copy">
              <span className="arise-eyebrow">Join us</span>
              <h2 className="arise-display">A night to remember</h2>
              <p>
                Watch a quick look at what to expect this December — worship, teaching,
                and a room full of people believing for a new season together.
              </p>
              <a className="arise-btn" href="/volunteer">Give Now</a>
            </div>
          </div>
        </section>

        <section className="arise-panel" id="speakers">
          <span className="arise-eyebrow">Voices for the evening</span>
          <h2 className="arise-display">Our speakers</h2>
          <div className="arise-grid two">
            {SPEAKERS.map((s) => (
              <button
                className="arise-card arise-card-button"
                key={s.name}
                type="button"
                onClick={() => setSelectedPerson(s)}
                aria-label={`View details for ${s.name}`}
              >
                <div className="arise-card-frame">
                  <img src={s.img} alt={s.name} />
                </div>
                <h3>{s.name}</h3>
              </button>
            ))}
          </div>
        </section>

        <section className="arise-panel" id="artists">
          <span className="arise-eyebrow">Sound of the evening</span>
          <h2 className="arise-display">Worship artists</h2>
          <div className="arise-grid three">
            {ARTISTS.map((a) => (
              <button
                className="arise-card arise-card-button"
                key={a.name}
                type="button"
                onClick={() => setSelectedPerson(a)}
                aria-label={`View details for ${a.name}`}
              >
                <div className="arise-card-frame">
                  <img src={a.img} alt={a.name} />
                </div>
                <h3>{a.name}</h3>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="arise-location" id="location">
        <div className="arise-location-copy">
          <span className="arise-eyebrow">How to get there</span>
          <div className="arise-location-name">Don Bosco Nerul</div>
          <div className="arise-location-sub">Nerul, Navi Mumbai</div>
          <p>
            Use the map to easily locate the venue and plan your journey to Arise
            Conference 2026. We look forward to welcoming you.
          </p>
          <a className="arise-btn" href="https://maps.google.com/maps?q=DON%20BOSCO%20SEAWOODS%20MUMBAI" target="_blank" rel="noopener noreferrer">
            Get directions
          </a>
        </div>
        <div className="arise-map-frame">
          <iframe
            title="Don Bosco Nerul location"
            src="https://maps.google.com/maps?q=DON%20BOSCO%20SEAWOODS%20MUMBAI&t=m&z=13&output=embed&iwloc=near"
            loading="lazy"
          />
        </div>
      </section>

      <section className="arise-panel arise-about" id="about">
        <span className="arise-eyebrow">Who we are</span>
        <h2 className="arise-display">40+ years of ministry</h2>
        <p>
          For more than 40 years, Arise Association has been a home for worship,
          prayer, and community across generations. What began as a small gathering
          has grown into a movement that keeps pointing people toward hope, purpose,
          and new beginnings — the same spirit we're carrying into Arise Conference 2026.
        </p>
        <div className="arise-about-stats">
          <div className="arise-about-stat">
            <div className="num">40+</div>
            <div className="label">Years of ministry</div>
          </div>
        </div>
      </section>

      {selectedPerson && (
        <div
          className="arise-person-modal"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedPerson(null);
          }}
        >
          <div
            className="arise-person-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="person-modal-title"
          >
            <button
              className="arise-person-modal-close"
              type="button"
              onClick={() => setSelectedPerson(null)}
              aria-label="Close details"
            >
              ×
            </button>
            <img src={selectedPerson.img} alt={selectedPerson.name} />
            <h2 id="person-modal-title" className="arise-display">{selectedPerson.name}</h2>
            <p>{selectedPerson.description}</p>
          </div>
        </div>
      )}

      <footer className="arise-footer" id="contact">
        <div className="arise-footer-grid">
          <div>
            <div className="arise-footer-logo">
              <img src={IMG.logo} alt="Arise Association logo" />
              <span>Arise Association</span>
            </div>
            <p style={{ color: "var(--lav)", fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
              A warm and vibrant community offering worship, prayer, biblical teaching,
              ministries, events, and opportunities to give.
            </p>
          </div>
          <div>
            <h4>Menu</h4>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.label}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:simplesamj@gmail.com">simplesamj@gmail.com</a></li>
              <li><a href="tel:+919829102890">(+91) 9829102890</a></li>
            </ul>
            <h4 style={{ marginTop: 24 }}>Socials</h4>
            <ul style={{ flexDirection: "row", gap: 16 }}>
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://instagram.com/arisecommunityindia" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="arise-footer-bottom">
          <span>© 2026 Arise Association. All rights reserved.</span>
          <span>Nerul, Navi Mumbai</span>
        </div>
      </footer>
    </div>
  );
}
