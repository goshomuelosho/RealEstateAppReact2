import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../components/NavBar";

/* =========================
   🎨 Styles
   ========================= */
const bgLight = (color, top, left, size) => ({
  position: "absolute",
  top,
  left,
  width: `${size}px`,
  height: `${size}px`,
  background: `radial-gradient(circle, ${color}33, transparent)`,
  borderRadius: "50%",
  filter: "blur(60px)",
  opacity: 0.8,
  pointerEvents: "none", // ✅ don't block clicks
});

const btnPrimary = {
  padding: "1rem 2rem",
  fontSize: "1.1rem",
  fontWeight: "700",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
};

const btnSecondary = {
  padding: "1rem 2rem",
  fontSize: "1.1rem",
  fontWeight: "700",
  background: "linear-gradient(135deg, #10b981, #059669)",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
};

const footerStyle = {
  textAlign: "center",
  padding: "1rem",
  color: "#94a3b8",
  fontSize: "0.9rem",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  background: "rgba(15,23,42,0.5)",
};

/* === Insights styles === */
const insightsWrap = {
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto 0",
  padding: "0 1.25rem 2rem",
};

const insightsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
  transition: "opacity 0.4s ease",
};

const card = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(14px)",
  borderRadius: "16px",
  padding: "1rem 1.1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.9rem",
  minHeight: "86px",
};

const iconBubble = {
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  display: "grid",
  placeItems: "center",
  fontSize: "1.25rem",
  background: "linear-gradient(135deg, #334155, #1f2937)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const statTextWrap = { display: "flex", flexDirection: "column" };
const statLabel = {
  color: "#cbd5e1",
  fontSize: "0.85rem",
  marginBottom: "0.15rem",
};
const statValue = {
  color: "#f8fafc",
  fontWeight: 800,
  fontSize: "1.25rem",
  lineHeight: 1,
};

const skeletonBar = {
  height: "16px",
  width: "70%",
  borderRadius: "6px",
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%)",
  backgroundSize: "300px 100%",
  animation: "shimmer 1.6s infinite",
};

const skeletonBig = { ...skeletonBar, height: "22px", width: "50%" };

/* =========================
   🚀 Dashboard
   ========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔢 insights state
  const [stats, setStats] = useState({
    totalValue: 0,
    totalEstates: 0,
    avgPrice: 0,
    added30d: 0,
  });
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", data.user.id)
        .single();

      setProfile(profileData || {});
      setTimeout(() => setIsLoaded(true), 150); // smooth fade-in

      // Fetch estates for insights
      setInsightsLoading(true);
      const { data: estates } = await supabase
        .from("estates")
        .select("price, created_at")
        .eq("user_id", data.user.id);

      const totalEstates = estates?.length || 0;
      const totalValue = (estates || []).reduce(
        (s, e) => s + (Number(e.price) || 0),
        0
      );
      const avgPrice = totalEstates ? Math.round(totalValue / totalEstates) : 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const added30d = (estates || []).filter(
        (e) => new Date(e.created_at) >= thirtyDaysAgo
      ).length;

      setStats({ totalValue, totalEstates, avgPrice, added30d });
      setInsightsLoading(false);
    };

    fetchProfileAndStats();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        overflow: "hidden",
        color: "#E2E8F0",
        transition: "opacity 0.4s ease",
        opacity: isLoaded ? 1 : 0,
      }}
    >
      {/* 🌌 Floating Gradient Lights */}
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>

      {/* 🧭 Global NavBar with Marketplace link */}
      <NavBar profile={profile} />

      {/* 🏡 Hero Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "2.25rem 1.5rem 2rem",
          position: "relative",
          zIndex: 1,
          animation: "fadeInUp 0.8s ease",
        }}
      >
        <div style={{ maxWidth: "750px" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #ffffff, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: "opacity 0.4s ease",
              opacity: isLoaded ? 1 : 0.3,
            }}
          >
            Добре дошли във вашето табло за имоти 
          </h1>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "1.15rem",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
              transition: "opacity 0.4s ease",
              opacity: isLoaded ? 1 : 0.3,
            }}
          >
            Управлявай лесно обявите си. Добавяй, редактирай и следи
            портфолиото си от имоти — всичко на едно място.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
              opacity: isLoaded ? 1 : 0.3,
              transition: "opacity 0.4s ease",
            }}
          >
            <Link to="/add-estate">
              <button style={btnPrimary}>Добави нов имот</button>
            </Link>

            <Link to="/my-estates">
              <button style={btnSecondary}>Виж моите имоти</button>
            </Link>
          </div>
        </div>
      </main>

      {/* 🧮 Insights Strip (below hero) */}
      <section style={{ paddingTop: "0.5rem", paddingBottom: "1.5rem" }}>
        <div style={insightsWrap}>
          <div style={{ ...insightsGrid, opacity: isLoaded ? 1 : 0.3 }}>
            {/* Total Value */}
            <InsightCard
              icon="💰"
              iconBg="linear-gradient(135deg,#1f2937,#334155)"
              label="Обща стойност на портфолиото"
              valueRenderer={(v) => `${Number(v || 0).toLocaleString()} $`}
              loading={insightsLoading}
              valueKey="totalValue"
            />

            {/* Total Estates */}
            <InsightCard
              icon="🏠"
              iconBg="linear-gradient(135deg,#0b3b62,#1e40af)"
              label="Общо имоти"
              valueRenderer={(v) => v}
              loading={insightsLoading}
              valueKey="totalEstates"
            />

            {/* Average Price */}
            <InsightCard
              icon="📊"
              iconBg="linear-gradient(135deg,#14532d,#065f46)"
              label="Средна цена"
              valueRenderer={(v) =>
                v ? `${Number(v).toLocaleString()} $` : "—"
              }
              loading={insightsLoading}
              valueKey="avgPrice"
            />

            {/* Added Last 30 Days */}
            <InsightCard
              icon="🗓️"
              iconBg="linear-gradient(135deg,#5b21b6,#7c3aed)"
              label="Добавени за последните 30 дни"
              valueRenderer={(v) => v}
              loading={insightsLoading}
              valueKey="added30d"
            />
          </div>
        </div>
      </section>

      {/* 📜 Footer */}
      <footer style={footerStyle}>
        © {new Date().getFullYear()} RealEstate | Създадено с ❤️
      </footer>
    </div>
  );

  // Nested so it can read styles above without re-declaring
  function InsightCard({ icon, iconBg, label, valueRenderer, loading, valueKey }) {
    const value =
      valueKey === "totalValue"
        ? stats.totalValue
        : valueKey === "totalEstates"
        ? stats.totalEstates
        : valueKey === "avgPrice"
        ? stats.avgPrice
        : stats.added30d;

    return (
      <div style={card}>
        <div style={{ ...iconBubble, background: iconBg }}>{icon}</div>
        {loading ? (
          <div style={statTextWrap}>
            <div style={skeletonBig} />
            <div style={{ ...skeletonBar, width: "40%", marginTop: "8px" }} />
          </div>
        ) : (
          <div style={statTextWrap}>
            <span style={statLabel}>{label}</span>
            <span style={statValue}>{valueRenderer(value)}</span>
          </div>
        )}
      </div>
    );
  }
}
