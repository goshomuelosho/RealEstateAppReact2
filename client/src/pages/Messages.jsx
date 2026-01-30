import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function Messages() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false); // 👈 same as Dashboard

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }

      const userId = userData.user.id;

      // 👤 Load my profile for NavBar
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", userId)
        .single();

      setProfile(myProfile || { id: userId });

      // 💬 Load all messages where I'm sender OR receiver
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("id, estate_id, sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading messages:", error);
        setLoading(false);
        // still allow fade-in so page doesn’t sit invisible
        setTimeout(() => setIsLoaded(true), 150);
        return;
      }

      if (!msgs || msgs.length === 0) {
        setConversations([]);
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 150); // 👈 same “after data” timing
        return;
      }

      // 📌 Collect all unique userIds that appear in these messages
      const userIdSet = new Set();
      msgs.forEach((m) => {
        userIdSet.add(m.sender_id);
        userIdSet.add(m.receiver_id);
      });

      const allUserIds = Array.from(userIdSet);

      // 👥 Load profiles for those users (names + avatars)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .in("id", allUserIds);

      if (profilesError) {
        console.error("Error loading message user profiles:", profilesError);
      }

      const profileById = {};
      (profilesData || []).forEach((p) => {
        profileById[p.id] = p;
      });

      // 🧠 Group conversations by (otherUserId + estateId)
      const map = new Map();

      msgs.forEach((m) => {
        const otherUserId = m.sender_id === userId ? m.receiver_id : m.sender_id;
        const otherUser =
          profileById[otherUserId] || { id: otherUserId, name: "Потребител" };

        const key = `${otherUserId}-${m.estate_id}`;

        // only keep the *first* (latest, because we sorted desc) message per convo
        if (!map.has(key)) {
          map.set(key, {
            otherUser,
            estateId: m.estate_id,
            lastMessage: m.content,
            lastAt: m.created_at,
          });
        }
      });

      setConversations(Array.from(map.values()));
      setLoading(false);

      // 👇 fade-in AFTER all loading & grouping like Dashboard
      setTimeout(() => setIsLoaded(true), 150);
    })();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        color: "#E2E8F0",
        position: "relative",
        overflow: "hidden",
        // 🔁 same core fade-in behavior as Dashboard
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <NavBar profile={profile} />

      <main
        style={{
          maxWidth: 900,
          margin: "2rem auto",
          padding: "0 1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg,#fff,#94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            // same “dim then brighten” pattern you used elsewhere
            opacity: isLoaded ? 1 : 0.3,
            transition: "opacity 0.4s ease",
          }}
        >
          Съобщения
        </h1>

        {loading ? (
          <p>Зареждане на разговорите…</p>
        ) : conversations.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Все още няма съобщения.</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              opacity: isLoaded ? 1 : 0.3,
              transition: "opacity 0.4s ease",
            }}
          >
            {conversations.map((conv, idx) => (
              <button
                key={idx}
                onClick={() =>
                  navigate(`/messages/${conv.estateId}/${conv.otherUser.id}`)
                }
                style={{
                  textAlign: "left",
                  background: "rgba(15,23,42,0.7)",
                  border: "1px solid rgba(148,163,184,0.4)",
                  borderRadius: 14,
                  padding: "0.9rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <img
                  src={conv.otherUser.avatar_url || "https://via.placeholder.com/36"}
                  alt="avatar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid rgba(148,163,184,0.7)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {conv.otherUser.name || "Потребител"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#94a3b8",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "260px",
                    }}
                  >
                    {conv.lastMessage}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
