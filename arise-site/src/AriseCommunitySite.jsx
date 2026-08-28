import React, { useState, useEffect } from "react";
import { useI18n } from "./i18n";
import LanguageSelector from "./LanguageSelector";

// Optional Vite overrides are useful for externally hosted videos. The bundled
// public files remain the production default so media works without env setup.
const HERO_VIDEO_URL = import.meta.env.VITE_HERO_VIDEO_URL || "/videos/arise-hero.mp4";
const PROMO_VIDEO_URL = import.meta.env.VITE_PROMO_VIDEO_URL || "/videos/arise-promo.mp4";
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "contact@example.com";
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/arisecommunityindia?igsi=MWg1Z3U3OWVkdGQ5Zw==";
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL || "https://youtube.com/@arisecommunityindia?si=I60nStg4PXCN30Ut";

const IMG = {
  logo: "/images/arise-logo-new.png",
  patta: "/images/speakers/patta.webp",
  bonny: "/images/speakers/bonny.webp",
  joseph: "/images/artists/joseph.webp",
  roney: "/images/artists/roney.webp",
  mark: "/images/artists/mark.webp",
};

const NAV_LINKS = [
  { key: "home", href: "#home" },
  { key: "about", href: "#about" },
  { key: "location", href: "#location" },
  { key: "contact", href: "#contact" },
];

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { key: "join", href: "/volunteer" },
  { key: "register", href: "/register" },
  { key: "give", href: "/give" },
];

const FOOTER_LINKS = [
  ...NAV_LINKS,
  { key: "join", href: "/volunteer" },
  { key: "register", href: "/register" },
  { key: "give", href: "/give" },
];

const SPEAKERS = [
  { name: "Bishop Samuel Patta", img: IMG.patta },
  { name: "Bonny Kinkar", img: IMG.bonny },
];

const ARTISTS = [
  { name: "Joseph Raj", img: IMG.joseph },
  { name: "Roney Maben", img: IMG.roney },
  { name: "Mark Tribhuvan", img: IMG.mark },
];

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
      preload="metadata"
      aria-hidden="true"
      onError={() => setErrored(true)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function PortraitImage({ src, alt, className }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) return <div className={className ? `${className} arise-portrait-fallback` : "arise-portrait-fallback"} aria-hidden="true" />;
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
    />
  );
}

function SocialIcon({ kind }) {
  if (kind === "youtube") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.5 0-4.7.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.2.3-.3.9-.4 1.9-.1 1.2-.1 1.5-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.4 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.2.9.3 1.9.4 1.2.1 1.5.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.2-.3.3-.9.4-1.9.1-1.2.1-1.5.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.2-.9-.3-1.9-.4 1.2-.1 1.5-.1 4.7-.1zM12 6.9a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 0 0 6.6zm6.5-9.6a1.2 1.2 0 1 0-2.4 0 1.2 1.2 0 0 0 2.4 0z" />
    </svg>
  );
}

function PromoVideo({ src }) {
  const { t } = useI18n();
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
      <span>{t("join.videoPlaceholder")}</span>
    </div>
  );
}

export default function ArisePage() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    document.title = `${t("brand")} | ${t("hero.chip")}`;
  }, [t]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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
          position: fixed; top: 0; left: 0; right: 0; z-index: 80;
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
        .arise-nav-logo img { height: 40px; width: auto; display: block; border-radius: 4px; }
        .arise-nav-logo span { font-family: 'Fraunces', serif; font-size: 18px; letter-spacing: 0.03em; }
        .arise-nav-groups { display: flex; align-items: center; gap: 24px; }
        .arise-nav-links { display: flex; gap: 30px; }
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
        .arise-nav-actions { display: flex; align-items: center; gap: 10px; padding-left: 24px; border-left: 1px solid rgba(227,168,87,0.28); }
        .arise-nav-action { color: var(--ink); background: var(--gold); border: 1px solid var(--gold); border-radius: 999px; padding: 10px 17px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-decoration: none; white-space: nowrap; transition: background 0.25s ease, color 0.25s ease, transform 0.15s ease; }
        .arise-nav-action:hover { background: transparent; color: var(--gold); transform: translateY(-1px); }
        .arise-nav-action.secondary { background: transparent; color: var(--gold); }
        .arise-nav-action.secondary:hover { background: var(--gold); color: var(--ink); }
        .arise-language { display: flex; align-items: center; gap: 6px; color: var(--lav); font-size: 12px; white-space: nowrap; }
        .arise-language button { border: 0; padding: 2px; background: transparent; color: var(--lav); font: inherit; cursor: pointer; }
        .arise-language button.active, .arise-language button:hover { color: var(--gold); }
        .arise-nav-burger {
          position: relative; z-index: 90;
          display: none; background: none; border: none; color: var(--cream);
          font-size: 22px; cursor: pointer; padding: 8px; line-height: 1;
        }
        .arise-mobile-menu {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; z-index: 70;
          padding: 86px 6vw 28px;
          flex-direction: column; gap: 16px;
          background: rgba(31,27,46,0.97);
          box-shadow: 0 18px 40px rgba(0,0,0,0.35);
        }
        .arise-mobile-menu.open { display: flex; }
        .arise-mobile-menu a { color: var(--cream); text-decoration: none; font-size: 15px; }
        .arise-mobile-menu .arise-language { padding-top: 8px; }

        .arise-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          padding: 140px 6vw 170px;
          background: linear-gradient(180deg, #1F1B2E 0%, #1B1729 60%, #17131F 100%);
        }
        .arise-hero-media { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .arise-hero-video { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
        .arise-hero-overlay {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 50% 18%, rgba(31,27,46,0.28), transparent 58%),
            linear-gradient(180deg, rgba(31,27,46,0.62) 0%, rgba(27,23,41,0.58) 42%, rgba(23,19,31,0.88) 100%);
        }
        .arise-hero-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 760px;
        }
        .arise-hero-content h1,
        .arise-hero-sub,
        .arise-hero-meta,
        .arise-hero-chip {
          text-shadow: 0 2px 18px rgba(15,12,24,0.72), 0 0 28px rgba(15,12,24,0.4);
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
          color: #E8E2EE;
          max-width: 620px;
          line-height: 1.75;
          margin: 0 auto 36px;
          font-weight: 400;
        }
        .arise-hero-meta {
          display: flex; flex-wrap: wrap; gap: 28px; justify-content: center;
          margin-bottom: 40px;
        }
        .arise-hero-meta div { text-align: left; }
        .arise-hero-meta .label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #D8D2E4; margin-bottom: 4px; }
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
          background: transparent;
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
        .arise-card-frame img,
        .arise-card-frame .arise-portrait-fallback {
          width: 100%; height: 100%; object-fit: cover; object-position: center 18%;
          display: block; filter: none;
        }
        .arise-portrait-fallback { background: var(--panel-2); }
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
        .arise-person-modal-content img,
        .arise-person-modal-content .arise-portrait-fallback {
          width: min(72vw, 240px);
          aspect-ratio: 4 / 5;
          height: auto;
          object-fit: cover;
          object-position: center 18%;
          border-radius: 4px;
          margin: 0 auto 18px;
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
        .arise-footer-logo img { height: 36px; width: auto; display: block; border-radius: 4px; }
        .arise-social-links { flex-direction: row; gap: 14px; }
        .arise-social-links a {
          display: inline-flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 50%;
          border: 1px solid rgba(227,168,87,0.35); color: var(--gold);
        }
        .arise-social-links a:hover { color: var(--cream); border-color: var(--gold); }
        .arise-footer-logo span { font-family: 'Fraunces', serif; font-size: 17px; }
        .arise-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 22px; max-width: 1080px; margin: 0 auto;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;
          font-size: 12px; color: var(--lav);
        }

        @media (max-width: 820px) {
          .arise-nav-groups { display: none; }
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
          .arise-hero-sub { color: #F0EBF6; }
        }
        @media (prefers-reduced-motion: reduce) {
          .arise-btn, .arise-nav-links a::after { transition: none; }
        }
      `}</style>

      <nav className={`arise-nav ${scrolled ? "scrolled" : ""}`} id="home">
        <div className="arise-nav-logo">
          <img src={IMG.logo} alt={`${t("brand")} logo`} />
        </div>
        <div className="arise-nav-groups">
          <div className="arise-nav-links">
            {NAV_LINKS.map((l) => (
              <a key={l.key} href={l.href}>{t(`nav.${l.key}`)}</a>
            ))}
          </div>
          <div className="arise-nav-actions">
            <a className="arise-nav-action" href="/volunteer">{t("nav.join")}</a>
            <a className="arise-nav-action secondary" href="/register">{t("nav.register")}</a>
            <a className="arise-nav-action secondary" href="/give">{t("nav.give")}</a>
            <LanguageSelector />
          </div>
        </div>
        <button
          className="arise-nav-burger"
          aria-label={t("common.toggleMenu")}
          aria-expanded={menuOpen}
          aria-controls="arise-mobile-menu"
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>
      <div id="arise-mobile-menu" className={`arise-mobile-menu ${menuOpen ? "open" : ""}`}>
        {MOBILE_LINKS.map((l) => (
          <a key={l.key} href={l.href} onClick={() => setMenuOpen(false)}>{t(`nav.${l.key}`)}</a>
        ))}
        <LanguageSelector />
      </div>

      <header className="arise-hero">
        <div className="arise-hero-media" aria-hidden="true">
          <HeroBackgroundVideo src={HERO_VIDEO_URL} />
          <div className="arise-hero-overlay" />
        </div>
        <div className="arise-hero-content">
          <h1 className="arise-display">
            {t("hero.titleBefore")} <em>{t("hero.titleEmphasis")}</em>
          </h1>
          <p className="arise-hero-sub">
            {t("hero.description")}
          </p>
          <div className="arise-hero-meta">
            <div>
              <div className="label">{t("hero.venueLabel")}</div>
              <div className="value">{t("hero.venue")}</div>
            </div>
            <div>
              <div className="label">{t("hero.datesLabel")}</div>
              <div className="value">{t("hero.dates")}</div>
            </div>
          </div>
          <a className="arise-btn" href="/register">{t("hero.register")}</a>
        </div>
      </header>

      <div className="arise-content">
        <section className="arise-panel" id="join">
          <div className="arise-joinus">
            <div className="arise-promo-frame">
              <PromoVideo src={PROMO_VIDEO_URL} />
            </div>
            <div className="arise-joinus-copy">
              <span className="arise-eyebrow">{t("join.eyebrow")}</span>
              <h2 className="arise-display">{t("join.title")}</h2>
              <p>{t("join.description")}</p>
              <a className="arise-btn" href="/give">{t("nav.give")}</a>
            </div>
          </div>
        </section>

        <section className="arise-panel" id="speakers">
          <span className="arise-eyebrow">{t("people.speakersEyebrow")}</span>
          <h2 className="arise-display">{t("people.speakersTitle")}</h2>
          <div className="arise-grid two">
            {SPEAKERS.map((s) => (
              <button
                className="arise-card arise-card-button"
                key={s.name}
                type="button"
                onClick={() => setSelectedPerson(s)}
                aria-label={t("people.viewDetails", { name: s.name })}
              >
                <div className="arise-card-frame">
                  <PortraitImage src={s.img} alt={s.name} />
                </div>
                <h3>{s.name}</h3>
              </button>
            ))}
          </div>
        </section>

        <section className="arise-panel" id="artists">
          <span className="arise-eyebrow">{t("people.artistsEyebrow")}</span>
          <h2 className="arise-display">{t("people.artistsTitle")}</h2>
          <div className="arise-grid three">
            {ARTISTS.map((a) => (
              <button
                className="arise-card arise-card-button"
                key={a.name}
                type="button"
                onClick={() => setSelectedPerson(a)}
                aria-label={t("people.viewDetails", { name: a.name })}
              >
                <div className="arise-card-frame">
                  <PortraitImage src={a.img} alt={a.name} />
                </div>
                <h3>{a.name}</h3>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="arise-location" id="location">
        <div className="arise-location-copy">
          <span className="arise-eyebrow">{t("location.eyebrow")}</span>
          <div className="arise-location-name">{t("location.name")}</div>
          <div className="arise-location-sub">{t("location.sub")}</div>
          <p>{t("location.description")}</p>
          <a className="arise-btn" href="https://maps.google.com/maps?q=DON%20BOSCO%20SEAWOODS%20MUMBAI" target="_blank" rel="noopener noreferrer">{t("location.directions")}</a>
        </div>
        <div className="arise-map-frame">
          <iframe
            title={t("location.mapTitle")}
            src="https://maps.google.com/maps?q=DON%20BOSCO%20SEAWOODS%20MUMBAI&t=m&z=13&output=embed&iwloc=near"
            loading="lazy"
          />
        </div>
      </section>

      <section className="arise-panel arise-about" id="about">
        <span className="arise-eyebrow">{t("about.eyebrow")}</span>
        <h2 className="arise-display">{t("about.title")}</h2>
        <p>{t("about.description")}</p>
        <div className="arise-about-stats">
          <div className="arise-about-stat">
            <div className="num">40+</div>
            <div className="label">{t("about.years")}</div>
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
              aria-label={t("common.close")}
            >
              ×
            </button>
            <PortraitImage src={selectedPerson.img} alt={selectedPerson.name} />
            <h2 id="person-modal-title" className="arise-display">{selectedPerson.name}</h2>
            <p>{t("people.descriptionSoon")}</p>
          </div>
        </div>
      )}

      <footer className="arise-footer" id="contact">
        <div className="arise-footer-grid">
          <div>
            <div className="arise-footer-logo">
              <img src={IMG.logo} alt={`${t("brand")} logo`} />
            </div>
            <p style={{ color: "var(--lav)", fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>{t("footer.description")}</p>
          </div>
          <div>
            <h4>{t("footer.menu")}</h4>
            <ul>
              {FOOTER_LINKS.map((l) => (
                <li key={l.key}><a href={l.href}>{t(`nav.${l.key}`)}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{t("footer.contact")}</h4>
            <ul>
              <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
            </ul>
            <h4 style={{ marginTop: 24 }}>{t("footer.socials")}</h4>
            <ul className="arise-social-links">
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={t("footer.instagram")}>
                  <SocialIcon kind="instagram" />
                </a>
              </li>
              <li>
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label={t("footer.youtube")}>
                  <SocialIcon kind="youtube" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="arise-footer-bottom">
          <span>{t("footer.copyright")}</span>
          <span>{t("footer.city")}</span>
        </div>
      </footer>
    </div>
  );
}
