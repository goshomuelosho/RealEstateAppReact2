import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

  if (loading) return null; // can replace with spinner
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

function App() {
  return (
    <Routes>
      {/* 🔓 Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
    </Routes>
  );
}

export default App;
