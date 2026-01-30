import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../components/NavBar";

/* 🎨 Simple styles (same vibe) */
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
  pointerEvents: "none",
});

const page = (loaded) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  position: "relative",
  overflow: "hidden",
  color: "#E2E8F0",
  opacity: loaded ? 1 : 0,
  transition: "opacity 0.4s ease",
});

const main = {
  flex: 1,
  padding: "2.25rem 1.5rem 2rem",
  position: "relative",
  zIndex: 1,
};

const wrap = { maxWidth: 1200, margin: "0 auto" };

const title = {
  margin: 0,
  fontSize: "2.2rem",
  fontWeight: 900,
  background: "linear-gradient(135deg,#fff,#94a3b8)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subText = { color: "#cbd5e1", marginTop: 10, marginBottom: 0 };

const grid = {
  marginTop: "1.25rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1rem",
};

const statCard = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: "1rem 1.1rem",
  backdropFilter: "blur(14px)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minHeight: 90,
};

const label = { color: "#cbd5e1", fontSize: "0.9rem" };
const value = {
  color: "#f8fafc",
  fontSize: "1.5rem",
  fontWeight: 900,
  lineHeight: 1.1,
};

const section = {
  marginTop: 18,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  padding: "1rem 1.1rem",
};

const sectionTitle = {
  margin: 0,
  fontSize: "1.15rem",
  fontWeight: 900,
  color: "#f8fafc",
};

const sectionHint = { color: "rgba(226,232,240,0.8)", marginTop: 6 };

const tableWrap = {
  marginTop: 12,
  overflow: "hidden",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
};

const table = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  background: "rgba(15,23,42,0.45)",
};

const th = {
  textAlign: "left",
  fontSize: 13,
  color: "rgba(226,232,240,0.9)",
  padding: "0.85rem 0.9rem",
  borderBottom: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(15,23,42,0.65)",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const td = {
  padding: "0.8rem 0.9rem",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(226,232,240,0.92)",
  verticalAlign: "top",
  fontSize: 14,
};

const pill = (variant = "neutral") => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0.25rem 0.55rem",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background:
    variant === "admin"
      ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.18))"
      : variant === "public"
      ? "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.18))"
      : "rgba(255,255,255,0.06)",
  color:
    variant === "admin"
      ? "#fde68a"
      : variant === "public"
      ? "#bbf7d0"
      : "rgba(226,232,240,0.9)",
});

const btn = (variant = "ghost") => ({
  padding: "0.55rem 0.75rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background:
    variant === "primary"
      ? "linear-gradient(135deg,#3b82f6,#1d4ed8)"
      : variant === "danger"
      ? "linear-gradient(135deg,#ef4444,#dc2626)"
      : "rgba(255,255,255,0.06)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
  whiteSpace: "nowrap",
  opacity: variant === "disabled" ? 0.6 : 1,
});

const input = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  outline: "none",
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

function fmtMoney(n) {
  return `${Number(n || 0).toLocaleString()} $`;
}

function shortId(id) {
  if (!id) return "—";
  return String(id).slice(0, 8) + "…";
}

/**
 * ✅ Safe select helper:
 * Tries select strings in order until one succeeds (prevents 400 due to missing columns).
 */
async function safeSelect(tableName, selectCandidates, builderFn) {
  let lastError = null;

  for (const sel of selectCandidates) {
    try {
      let q = supabase.from(tableName).select(sel);
      if (builderFn) q = builderFn(q);
      const { data, error } = await q;

      if (!error) return { data: data || [], usedSelect: sel, error: null };

      lastError = error;
    } catch (e) {
      lastError = e;
    }
  }

  return { data: [], usedSelect: null, error: lastError };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEstates: 0,
    publicEstates: 0,
    totalValue: 0,
  });

  const [loading, setLoading] = useState(true);

  // USERS + ESTATES
  const [users, setUsers] = useState([]);
  const [estates, setEstates] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userSearch, setUserSearch] = useState("");

  // group estates by user_id
  const estatesByUser = useMemo(() => {
    const m = new Map();
    for (const e of estates) {
      const uid = e.user_id;
      if (!m.has(uid)) m.set(uid, []);
      m.get(uid).push(e);
    }
    return m;
  }, [estates]);

  const computedUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();

    return (users || [])
      .map((u) => {
        const list = estatesByUser.get(u.id) || [];
        const estatesCount = list.length;
        const publicCount = list.filter((x) => !!x.is_public).length;
        const totalValue = list.reduce((s, x) => s + (Number(x.price) || 0), 0);
        return { ...u, estatesCount, publicCount, totalValue, _estates: list };
      })
      .filter((u) => {
        if (!q) return true;
        return (
          (u.name || "").toLowerCase().includes(q) ||
          String(u.id || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.estatesCount || 0) - (a.estatesCount || 0));
  }, [users, estatesByUser, userSearch]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }

      // load profile + admin flag (fallback ако липсват колони)
      const profRes = await safeSelect(
        "profiles",
        ["id, name, avatar_url, is_admin", "id, name, is_admin", "id, is_admin", "id"],
        (q) => q.eq("id", userData.user.id).single()
      );

      if (profRes.error || !profRes.data) {
        console.error("Admin profile fetch error:", profRes.error);
        navigate("/login");
        return;
      }

      const p = profRes.data;
      const isAdmin = !!p?.is_admin;

      if (!isAdmin) {
        navigate("/my-estates");
        return;
      }

      setProfile(p);

      // ✅ Admin stats: total users (count)
      const { count: usersCount, error: usersCountErr } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      if (usersCountErr) console.error("Admin usersCount error:", usersCountErr);

      // ✅ Estates list (fallback)
      const estatesRes = await safeSelect(
        "estates",
        [
          "id,user_id,title,price,is_public,created_at",
          "id,user_id,title,price,is_public",
          "id,user_id,price,is_public",
          "id,user_id,is_public",
          "id,user_id",
          "id",
        ],
        (q) => q
      );

      if (estatesRes.error) {
        console.error("Admin estates fetch error:", estatesRes.error);
      }

      const estatesData = estatesRes.data || [];
      const totalEstates = estatesData.length;
      const publicEstates = estatesData.filter((e) => !!e.is_public).length;
      const totalValue = estatesData.reduce(
        (s, e) => s + (Number(e.price) || 0),
        0
      );

      setStats({
        totalUsers: usersCount || 0,
        totalEstates,
        publicEstates,
        totalValue,
      });

      setEstates(estatesData);

      // ✅ Users list (fallback)
      const usersRes = await safeSelect(
        "profiles",
        [
          "id,name,avatar_url,is_admin,created_at",
          "id,name,avatar_url,is_admin",
          "id,name,is_admin",
          "id,is_admin",
          "id,name",
          "id",
        ],
        (q) => q
      );

      if (usersRes.error) {
        console.error("Admin users fetch error:", usersRes.error);
        setUsers([]);
      } else {
        setUsers(usersRes.data || []);
      }

      setLoading(false);
      setTimeout(() => setLoaded(true), 150);
    })();
  }, [navigate]);

  return (
    <div style={page(loaded)}>
      <div style={bgLight("#f59e0b", "12%", "8%", 320)} />
      <div style={bgLight("#3b82f6", "75%", "85%", 420)} />

      <NavBar profile={profile} />

      <main style={main}>
        <div style={wrap}>
          <h1 style={title}>🛡️ Admin Dashboard</h1>
          <p style={subText}>Потребители и имоти.</p>

          {/* Stats */}
          <div style={grid}>
            <div style={statCard}>
              <div style={label}>Общо потребители</div>
              <div style={value}>{stats.totalUsers}</div>
            </div>

            <div style={statCard}>
              <div style={label}>Общо имоти</div>
              <div style={value}>{stats.totalEstates}</div>
            </div>

            <div style={statCard}>
              <div style={label}>Публични в Пазара</div>
              <div style={value}>{stats.publicEstates}</div>
            </div>

            <div style={statCard}>
              <div style={label}>Обща стойност (всички имоти)</div>
              <div style={value}>{fmtMoney(stats.totalValue)}</div>
            </div>
          </div>

          {/* USERS */}
          <div style={section}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={sectionTitle}>👥 Потребители</h2>
                <div style={sectionHint}>
                  Виж всички users + колко имота имат. Можеш да разгънеш user и да
                  видиш имотите му.
                </div>
              </div>

              <div style={{ minWidth: 280, flex: "1 1 320px", maxWidth: 420 }}>
                <input
                  style={input}
                  placeholder="Търси по име / id…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={tableWrap}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>User</th>
                    <th style={th}>Role</th>
                    <th style={th}>Имот(и)</th>
                    <th style={th}>Публични</th>
                    <th style={th}>Обща стойност</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {computedUsers.map((u) => {
                    const isOpen = expandedUser === u.id;
                    return (
                      <FragmentRow
                        key={u.id}
                        user={u}
                        isOpen={isOpen}
                        onToggle={() =>
                          setExpandedUser((prev) =>
                            prev === u.id ? null : u.id
                          )
                        }
                      />
                    );
                  })}

                  {!loading && computedUsers.length === 0 && (
                    <tr>
                      <td style={td} colSpan={6}>
                        Няма намерени потребители.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer style={footerStyle}>
        © {new Date().getFullYear()} Admin Panel | Създадено с ❤️
      </footer>
    </div>
  );
}

/* small helper row component (keeps main clean) */
function FragmentRow({ user, isOpen, onToggle }) {
  return (
    <>
      <tr>
        <td style={td}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={user.avatar_url || "https://via.placeholder.com/36"}
              alt="avatar"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 900, color: "#fff" }}>
                {user.name || "Без име"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(226,232,240,0.75)" }}>
                {shortId(user.id)}
              </div>
            </div>
          </div>
        </td>

        <td style={td}>
          {user.is_admin ? (
            <span style={pill("admin")}>ADMIN</span>
          ) : (
            <span style={pill("neutral")}>USER</span>
          )}
        </td>

        <td style={td}>{user.estatesCount}</td>
        <td style={td}>{user.publicCount}</td>
        <td style={td}>{fmtMoney(user.totalValue)}</td>

        <td style={td}>
          <button style={btn("ghost")} onClick={onToggle}>
            {isOpen ? "Скрий имоти" : "Виж имоти"}
          </button>
        </td>
      </tr>

      {isOpen && (
        <tr>
          <td style={{ ...td, background: "rgba(15,23,42,0.35)" }} colSpan={6}>
            {user._estates?.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 10,
                }}
              >
                {user._estates
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.created_at || 0) - new Date(a.created_at || 0)
                  )
                  .map((e) => (
                    <div
                      key={e.id}
                      style={{
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.06)",
                        padding: "0.85rem 0.9rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontWeight: 900, color: "#fff" }}>
                          {e.title || "Без заглавие"}
                        </div>
                        <div style={{ fontWeight: 900 }}>{fmtMoney(e.price)}</div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {e.is_public ? (
                          <span style={pill("public")}>PUBLIC</span>
                        ) : (
                          <span style={pill("neutral")}>PRIVATE</span>
                        )}
                        <span style={pill("neutral")}>{shortId(e.id)}</span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <Link to={`/estate/${e.id}`} style={{ textDecoration: "none" }}>
                          <button style={btn("primary")}>Детайли</button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ color: "rgba(226,232,240,0.8)" }}>Няма имоти.</div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
