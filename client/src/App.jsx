import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyEstates from "./pages/MyEstates";
import AddEstate from "./pages/AddEstate";
import EditEstate from "./pages/EditEstate";
import EstateDetail from "./pages/EstateDetail";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";

/* NEW PAGES */
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";

/* ✅ NEW: Admin dashboard page */
import AdminDashboard from "./pages/AdminDashboard";
import HelpCenter from "./pages/HelpCenter";
import Contacts from "./pages/Contacts";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import SiteMapPage from "./pages/SiteMapPage";
import SiteFooter from "./components/SiteFooter";

function RouteLoadingCover({ text }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        color: "#e2e8f0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "3px solid rgba(226,232,240,0.32)",
            borderTopColor: "#38bdf8",
            animation: "routeCoverSpin 0.8s linear infinite",
          }}
        />
        <span style={{ fontWeight: 700, letterSpacing: 0.2 }}>{text}</span>
      </div>
    </div>
  );
}

/** ✅ Guard: only logged users */
function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setOk(!!data?.user);
      setLoading(false);
    })();
  }, []);

  if (loading) return null; // can replace with spinner
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}

/** ✅ Guard: only admins */
function RequireAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;

      if (!user) {
        setOk(false);
        setLoading(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Admin check error:", error);
        setOk(false);
      } else {
        setOk(!!profileData?.is_admin);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <RouteLoadingCover text="Проверка на админ достъп..." />;
  }
  if (!ok) return <Navigate to="/my-estates" replace />;
  return children;
}

/** ✅ Root redirect based on role */
function RootRedirect() {
  const [loading, setLoading] = useState(true);
  const [to, setTo] = useState("/login");

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;

      if (!user) {
        setTo("/login");
        setLoading(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      // ✅ admin -> /admin, user -> /my-estates
      if (!error && profileData?.is_admin) setTo("/admin");
      else setTo("/my-estates");

      setLoading(false);
    })();
  }, []);

  if (loading) return null;
  return <Navigate to={to} replace />;
}

const ROUTE_TRANSITION_MS = 280;

function AppShell() {
  const location = useLocation();
  const isFirstRenderRef = useRef(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    setIsTransitioning(true);
    const timerId = window.setTimeout(
      () => setIsTransitioning(false),
      ROUTE_TRANSITION_MS
    );

    return () => window.clearTimeout(timerId);
  }, [location.key]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes routeCoverSpin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .route-transition-content,
          .route-transition-footer {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="route-transition-content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
          transition: `opacity ${ROUTE_TRANSITION_MS}ms ease, transform ${ROUTE_TRANSITION_MS}ms ease`,
          willChange: "opacity, transform",
        }}
      >
        <Outlet />
      </div>

      <div
        className="route-transition-footer"
        style={{
          opacity: isTransitioning ? 0 : 1,
          visibility: isTransitioning ? "hidden" : "visible",
          pointerEvents: isTransitioning ? "none" : "auto",
          transition: `opacity ${Math.round(ROUTE_TRANSITION_MS * 0.7)}ms ease`,
        }}
      >
        <SiteFooter />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* 🔓 Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Info routes */}
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/sitemap" element={<SiteMapPage />} />

        {/* ✅ Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/my-estates"
          element={
            <RequireAuth>
              <MyEstates />
            </RequireAuth>
          }
        />
        <Route
          path="/add-estate"
          element={
            <RequireAuth>
              <AddEstate />
            </RequireAuth>
          }
        />
        <Route
          path="/edit-estate/:id"
          element={
            <RequireAuth>
              <EditEstate />
            </RequireAuth>
          }
        />
        <Route
          path="/estate/:id"
          element={
            <RequireAuth>
              <EstateDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/marketplace"
          element={
            <RequireAuth>
              <Marketplace />
            </RequireAuth>
          }
        />

        {/* 📩 Messaging system */}
        <Route
          path="/messages"
          element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          }
        />
        <Route
          path="/messages/:estateId/:otherUserId"
          element={
            <RequireAuth>
              <Conversation />
            </RequireAuth>
          }
        />

        {/* ✅ Normal dashboard (for everyone logged in) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        {/* 🛡️ Admin-only Dashboard */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
