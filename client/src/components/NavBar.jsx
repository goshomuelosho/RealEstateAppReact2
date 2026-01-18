import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NavBar({ profile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? { color: "#3b82f6", fontWeight: 700 }
      : { color: "#e2e8f0" };

  return (
    <header
      style={{
        padding: "1.25rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Logo (keep site name as-is) */}
      <Link
        to="/dashboard"
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textDecoration: "none",
        }}
      >
        🏠 Real Estate
      </Link>

      {/* MAIN NAVIGATION (Bulgarian UI) */}
      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link to="/marketplace" style={isActive("/marketplace")}>
          Пазар
        </Link>

        <Link to="/my-estates" style={isActive("/my-estates")}>
          Моите имоти
        </Link>

        <Link to="/messages" style={isActive("/messages")}>
          Съобщения
        </Link>
      </nav>

      {/* Profile pill */}
      {profile && (
        <div
          onClick={() => navigate("/profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50px",
            padding: "0.4rem 0.9rem",
          }}
        >
          <img
            src={profile.avatar_url || "https://via.placeholder.com/40"}
            alt="avatar"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          />

          <span style={{ fontWeight: 600, color: "#E2E8F0" }}>
            {profile.name || "Профил"}
          </span>
        </div>
      )}
    </header>
  );
}
