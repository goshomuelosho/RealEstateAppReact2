import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", bio: "", avatar_url: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // ✨ smooth fade-in

  // ✅ Toast
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // 🔐 Password Change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ✅ Load user + profile
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return navigate("/login");
      setUser(data.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileData) setProfile(profileData);
      setTimeout(() => setIsLoaded(true), 150); // ✨ delay for fade-in
    };
    init();
  }, [navigate]);

  // 🧠 Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 💾 Save Profile
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    let avatar_url = profile.avatar_url;
    if (avatarFile) {
      const fileName = `${user.id}-${Date.now()}-${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("estate-images")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        setSaving(false);
        return;
      }

      avatar_url = supabase.storage.from("estate-images").getPublicUrl(fileName).data.publicUrl;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: profile.name,
      bio: profile.bio,
      avatar_url,
      updated_at: new Date(),
    });

    if (error) alert(error.message);
    else showToastMessage("✅ Profile updated successfully!");
    setSaving(false);
  };

  // 🔐 Update Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!newPassword || newPassword.length < 6)
      return setPasswordMessage("❌ Password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return setPasswordMessage("❌ Passwords do not match");

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) setPasswordMessage(`⚠️ ${error.message}`);
    else {
      showToastMessage("🔐 Password updated!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    }
    setPasswordLoading(false);
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ✅ Toast Helper
  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div style={{ ...pageWrapper, opacity: isLoaded ? 1 : 0, transition: "opacity 0.4s ease" }}>
      {/* 🌌 Lights */}
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />

      {/* 🧭 Header */}
      <Header profile={profile} />

      {/* Main */}
      <main style={mainStyle}>
        <div style={cardContainer}>
          <form onSubmit={handleSave}>
            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={avatarWrapper}>
                <img
                  src={preview || profile.avatar_url || "https://via.placeholder.com/120"}
                  alt="Avatar"
                  style={avatarStyle}
                />
                <label htmlFor="avatar" style={avatarEditBtn}>✏️</label>
                <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </div>
            </div>

            {/* Name */}
            <div style={fieldGroup}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={fieldGroup}>
              <label style={labelStyle}>Email</label>
              <input
                type="text"
                value={user?.email || ""}
                style={{ ...inputStyle, opacity: 0.6 }}
                disabled
              />
            </div>

            {/* Bio */}
            <div style={fieldGroup}>
              <label style={labelStyle}>Bio</label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                style={{ ...inputStyle, height: "100px", resize: "vertical" }}
                placeholder="Tell us about yourself..."
              />
            </div>

            <button type="submit" disabled={saving} style={saveButton(saving)}>
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </form>

          {/* Password Change */}
          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} style={{ marginTop: "2rem" }}>
              <div style={fieldGroup}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={passwordLoading} style={saveButton(passwordLoading)}>
                {passwordLoading ? "Updating..." : "🔄 Update Password"}
              </button>
              {passwordMessage && (
                <p style={{
                  marginTop: "1rem",
                  textAlign: "center",
                  fontWeight: "600",
                  color: passwordMessage.startsWith("✅") ? "#10b981" : "#f87171",
                }}>
                  {passwordMessage}
                </p>
              )}
              <button type="button" onClick={() => setShowPasswordForm(false)} style={cancelButton}>
                Cancel
              </button>
            </form>
          ) : (
            <button onClick={() => setShowPasswordForm(true)} style={{ ...saveButton(false), marginTop: "1.5rem" }}>
              🔑 Change Password
            </button>
          )}

          {/* Logout */}
          <button onClick={handleLogout} style={logoutButton}>
            🚪 Log Out
          </button>
        </div>
      </main>

      {/* ✅ Toast */}
      {showToast && (
        <div style={toastContainer}>
          <div style={toastBox}>{toastMessage}</div>
        </div>
      )}
    </div>
  );
}

/* 🔹 Header */
function Header({ profile }) {
  const navigate = useNavigate();
  return (
    <header style={headerStyle}>
      <Link to="/dashboard" style={logoStyle}>
        🏠 Real Estate
      </Link>

      <nav>
        <Link to="/my-estates" style={{ color: "#e2e8f0" }}>
          My Estates
        </Link>
      </nav>

      <div style={profileBox} onClick={() => navigate("/profile")}>
        <img
          src={profile.avatar_url || "https://via.placeholder.com/40"}
          alt="Avatar"
          style={avatarSmall}
        />
        <span style={profileName}>{profile.name || "My Profile"}</span>
      </div>
    </header>
  );
}

/* 🎨 Styles */
const pageWrapper = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#0f172a,#1e293b,#334155)",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  color: "white",
};

const bgLight = (color, top, left, size) => ({
  position: "absolute",
  top,
  left,
  width: `${size}px`,
  height: `${size}px`,
  background: `radial-gradient(circle, ${color}33, transparent)`,
  borderRadius: "50%",
  filter: "blur(60px)",
});

const headerStyle = {
  padding: "1.25rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(15,23,42,0.6)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  zIndex: 10,
  position: "sticky",
  top: 0,
};

const logoStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textDecoration: "none",
};

const profileBox = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  cursor: "pointer",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "50px",
  padding: "0.4rem 0.9rem",
};

const avatarSmall = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(255,255,255,0.2)",
};

const profileName = { fontSize: "0.95rem", fontWeight: "600", color: "#E2E8F0" };

const mainStyle = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "2rem",
  animation: "fadeInUp 0.8s ease",
};

const cardContainer = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(15px)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "2rem",
  width: "100%",
  maxWidth: "500px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
};

const avatarWrapper = {
  position: "relative",
  width: "120px",
  height: "120px",
  margin: "0 auto 1rem",
};

const avatarStyle = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid rgba(255,255,255,0.3)",
};

const avatarEditBtn = {
  position: "absolute",
  bottom: 0,
  right: 0,
  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  borderRadius: "50%",
  padding: "0.4rem",
  cursor: "pointer",
};

const fieldGroup = { marginBottom: "1.2rem" };

const labelStyle = {
  display: "block",
  marginBottom: "0.4rem",
  fontSize: "0.85rem",
  color: "#cbd5e1",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "0.9rem 1.1rem",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.1)",
  color: "#f1f5f9",
  fontSize: "1rem",
  outline: "none",
};

const saveButton = (loading) => ({
  width: "100%",
  padding: "1rem",
  borderRadius: "12px",
  border: "none",
  color: "white",
  fontWeight: "700",
  background: loading
    ? "linear-gradient(135deg,#94a3b8,#64748b)"
    : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  cursor: loading ? "not-allowed" : "pointer",
  transition: "all 0.3s ease",
});

const cancelButton = {
  width: "100%",
  padding: "0.9rem",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.1)",
  color: "#e2e8f0",
  fontWeight: "600",
  marginTop: "1rem",
  border: "1px solid rgba(255,255,255,0.2)",
  cursor: "pointer",
};

const logoutButton = {
  width: "100%",
  marginTop: "1.5rem",
  padding: "1rem",
  background: "linear-gradient(135deg,#ef4444,#dc2626)",
  border: "none",
  borderRadius: "12px",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const toastContainer = {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  zIndex: 9999,
  animation: "fadeInOut 3s ease",
};

const toastBox = {
  background: "rgba(16,185,129,0.9)",
  color: "white",
  padding: "1rem 1.5rem",
  borderRadius: "10px",
  fontWeight: "600",
  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
};
