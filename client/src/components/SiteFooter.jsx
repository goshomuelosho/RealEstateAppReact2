import { Link } from "react-router-dom";

const footerWrap = {
  borderTop: "1px solid rgba(148,163,184,0.28)",
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(2,6,23,0.98) 100%)",
  color: "#e2e8f0",
  padding: "2rem 1.2rem 1.1rem",
};

const maxWrap = {
  maxWidth: 1180,
  margin: "0 auto",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1.25rem",
};

const colTitle = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 800,
  color: "#f8fafc",
};

const colText = {
  margin: "0.65rem 0 0",
  color: "rgba(226,232,240,0.84)",
  lineHeight: 1.6,
  fontSize: "0.92rem",
};

const linksList = {
  listStyle: "none",
  margin: "0.7rem 0 0",
  padding: 0,
  display: "grid",
  gap: "0.45rem",
};

const linkStyle = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: "0.92rem",
  fontWeight: 600,
};

const metaRow = {
  marginTop: "1.2rem",
  paddingTop: "0.9rem",
  borderTop: "1px solid rgba(148,163,184,0.24)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.8rem",
  flexWrap: "wrap",
  color: "#94a3b8",
  fontSize: "0.84rem",
};

const supportBadges = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.5rem",
  marginTop: "0.7rem",
};

const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  border: "1px solid rgba(148,163,184,0.32)",
  borderRadius: 999,
  padding: "0.2rem 0.55rem",
  fontSize: "0.8rem",
  color: "#cbd5e1",
  background: "rgba(15,23,42,0.5)",
};

export default function SiteFooter() {
  return (
    <footer style={footerWrap} role="contentinfo">
      <style>{`
        .site-footer-link:hover {
          color: #ffffff;
          text-decoration: underline;
        }
        .site-footer-link:focus-visible {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
          border-radius: 6px;
        }
      `}</style>

      <div style={maxWrap}>
        <div style={grid}>
          <section aria-labelledby="footer-about-title">
            <h2 id="footer-about-title" style={colTitle}>
              RealEstate
            </h2>
            <p style={colText}>
              Платформа за публикуване, управление и търсене на имоти. Тук ще
              намериш помощна и правна информация на едно място.
            </p>
          </section>

          <nav aria-label="Помощни страници">
            <h2 style={colTitle}>Помощ</h2>
            <ul style={linksList}>
              <li>
                <Link className="site-footer-link" style={linkStyle} to="/help">
                  Помощен център
                </Link>
              </li>
              <li>
                <Link className="site-footer-link" style={linkStyle} to="/contacts">
                  Контакти
                </Link>
              </li>
              <li>
                <Link className="site-footer-link" style={linkStyle} to="/sitemap">
                  Карта на сайта
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Правни страници">
            <h2 style={colTitle}>Правна информация</h2>
            <ul style={linksList}>
              <li>
                <Link className="site-footer-link" style={linkStyle} to="/terms">
                  Общи условия
                </Link>
              </li>
              <li>
                <Link className="site-footer-link" style={linkStyle} to="/privacy">
                  Защита на личните данни
                </Link>
              </li>
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" style={colTitle}>
              Контакт
            </h2>
            <ul style={linksList}>
              <li>
                <a
                  className="site-footer-link"
                  style={linkStyle}
                  href="mailto:support@realestateapp.bg"
                  aria-label="Изпрати имейл до support@realestateapp.bg"
                >
                  support@realestateapp.bg
                </a>
              </li>
              <li>
                <a
                  className="site-footer-link"
                  style={linkStyle}
                  href="tel:+35921234567"
                  aria-label="Обади се на +359 2 123 4567"
                >
                  +359 2 123 4567
                </a>
              </li>
              <li style={{ ...colText, margin: 0 }}>
                София, бул. Витоша 15, ет. 2
              </li>
            </ul>
          </section>
        </div>

        <div style={metaRow}>
          <span>© {new Date().getFullYear()} RealEstate. Всички права запазени.</span>
          <span>Последна актуализация: 25.02.2026</span>
        </div>
      </div>
    </footer>
  );
}

