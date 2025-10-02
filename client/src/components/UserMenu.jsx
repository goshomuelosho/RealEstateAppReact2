// src/components/UserMenu.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", data.user.id)
        .single();

      setUserData({
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || "User",
        avatar_url: profile?.avatar_url || "https://via.placeholder.com/40",
      });
    };
    loadUser();
  }, []);

  if (!userData) return null;

  return (
    <div
      onClick={() => navigate("/profile")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: "pointer",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "30px",
        padding: "0.4rem 0.8rem",
        border: "1px solid rgba(255,255,255,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <img
        src={userData.avatar_url}
        alt={userData.name}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      />
      <span
        style={{
          fontSize: "0.95rem",
          fontWeight: "600",
          color: "#E2E8F0",
        }}
      >
        {userData.name}
      </span>
    </div>
  );
}
