import { Link } from "react-router-dom";
import "./LandingPage.css";

function IconClock() {
  return (
    <svg className="landing-feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" strokeLinecap="round" />
    </svg>
  );
}

function IconBars() {
  return (
    <svg className="landing-feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M5 19V5M12 19v-8M19 19V9" strokeLinecap="round" />
    </svg>
  );
}

function IconAiHead() {
  return (
    <svg className="landing-feature-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3.5 5.5V20h7v-4.5c2-1 3.5-3 3.5-5.5a7 7 0 0 0-7-7Z" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M9.5 14h5M10 17h4" strokeLinecap="round" />
      <circle cx="16" cy="8" r="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" />
      <path d="M16 6.5v3M14.5 8h3" strokeLinecap="round" />
    </svg>
  );
}

function CircuitBackdrop() {
  return (
    <svg className="landing-circuit" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path
        d="M20 80h60l20 20h80M40 200h100l30-40h90M320 60v80l-40 40v100M100 320h120l40-60"
        stroke="rgba(100, 180, 220, 0.35)"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="80" cy="80" r="3" fill="rgba(120, 200, 240, 0.5)" />
      <circle cx="240" cy="100" r="3" fill="rgba(160, 140, 220, 0.45)" />
      <circle cx="280" cy="240" r="3" fill="rgba(120, 200, 240, 0.4)" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <span className="landing-logo">Interrogatio</span>
        <button type="button" className="landing-login">
          Logar
        </button>
      </header>

      <main className="landing-main">
        <section className="landing-copy" aria-labelledby="landing-headline">
          <h1 id="landing-headline" className="landing-headline">
            Análise profissional de entrevistas com IA.
          </h1>
          <p className="landing-sub">
            Transforme suas entrevistas em insights claros e objetivos com feedback automático e inteligente.
          </p>
          <p className="landing-cta-line">
            <Link className="landing-demo-link" to="/analise">
              Ver análise em tempo real
            </Link>
          </p>
        </section>

        <section className="landing-hero" aria-label="Ilustração do produto">
          <div className="landing-hero-glow" />
          <CircuitBackdrop />

          <div className="landing-feature-icons" aria-hidden>
            <div className="landing-feature-ring"><IconClock /></div>
            <div className="landing-feature-ring"><IconBars /></div>
            <div className="landing-feature-ring"><IconAiHead /></div>
          </div>

          <div className="landing-figure">
            <div className="landing-figure-suit" />
            <div className="landing-figure-shirt" />
            <div className="landing-figure-head" />
            <div className="landing-tablet">
              <div className="landing-tablet-screen">
                <div className="landing-hud">
                  <div className="landing-hud-pie" />
                  <div className="landing-hud-bars">
                    <span /><span /><span /><span />
                  </div>
                  <div className="landing-hud-line" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
