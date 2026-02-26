import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";

const BASE_NAV_ITEMS = [
  { path: "/marketplace", label: "Пазар" },
  { path: "/my-estates", label: "Моите имоти" },
  { path: "/messages", label: "Съобщения" },
];

export default function NavBar({ profile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = !!profile?.is_admin;
  const navItems = useMemo(
    () =>
      isAdmin
        ? [...BASE_NAV_ITEMS, { path: "/admin", label: "Админ" }]
        : BASE_NAV_ITEMS,
    [isAdmin]
  );

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const goToProfile = () => navigate("/profile");

  return (
    <div className="app-navbar-shell">
      <header className="app-navbar">
        <Link to="/dashboard" className="app-navbar__logo" aria-label="Начало">
          <span className="app-navbar__logo-icon" aria-hidden="true">
            🏠
          </span>
          <span className="app-navbar__logo-text">RealEstate</span>
        </Link>

        <nav className="app-navbar__links" aria-label="Основна навигация">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`app-navbar__link${isActive(item.path) ? " is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="app-navbar__actions">
          <button
            type="button"
            className={`app-navbar__menu-button${isMenuOpen ? " is-open" : ""}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-links"
            aria-label={isMenuOpen ? "Затвори менюто" : "Отвори менюто"}
          >
            <span className="app-navbar__menu-line" />
          </button>

          {profile && (
            <button
              type="button"
              className="app-navbar__profile"
              onClick={goToProfile}
              aria-label="Профил"
            >
              <img
                src={profile.avatar_url || "https://via.placeholder.com/40"}
                alt="avatar"
                className="app-navbar__avatar"
              />
              <span className="app-navbar__profile-name">
                {profile.name || "Профил"}
              </span>
            </button>
          )}
        </div>
      </header>

      <nav
        id="mobile-nav-links"
        className={`app-navbar__mobile-menu${isMenuOpen ? " is-open" : ""}`}
        aria-label="Мобилна навигация"
      >
        {navItems.map((item) => (
          <Link
            key={`mobile-${item.path}`}
            to={item.path}
            onClick={() => setIsMenuOpen(false)}
            className={`app-navbar__mobile-link${isActive(item.path) ? " is-active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
