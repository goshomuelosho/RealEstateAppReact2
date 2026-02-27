import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

function mapConversations(messages, currentUserId, profileById) {
  const map = new Map();
  const normalizedUserId = String(currentUserId || "");

  messages.forEach((message) => {
    const senderId = String(message.sender_id || "");
    const receiverId = String(message.receiver_id || "");
    const otherUserId = senderId === normalizedUserId ? receiverId : senderId;

    const otherUser =
      profileById[otherUserId] || { id: otherUserId, name: "Потребител" };

    const key = `${otherUserId}-${message.estate_id}`;
    if (!map.has(key)) {
      map.set(key, {
        otherUser,
        estateId: message.estate_id,
        lastMessage: message.content,
        lastAt: message.created_at,
      });
    }
  });

  return Array.from(map.values());
}

export default function Messages() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false); // 👈 same as Dashboard

  useEffect(() => {
    let isCancelled = false;
    let fadeTimerId = null;
    let refreshTimerId = null;
    let messagesChannel = null;

    const loadConversations = async (userId) => {
      const normalizedUserId = String(userId || "");

      // 💬 Load all messages where I'm sender OR receiver
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("id, estate_id, sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${normalizedUserId},receiver_id.eq.${normalizedUserId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      if (!msgs || msgs.length === 0) {
        if (!isCancelled) {
          setConversations([]);
        }
        return;
      }

      // 📌 Collect all unique userIds that appear in these messages
      const userIdSet = new Set();
      msgs.forEach((m) => {
        userIdSet.add(String(m.sender_id || ""));
        userIdSet.add(String(m.receiver_id || ""));
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
        profileById[String(p.id)] = p;
      });

      if (!isCancelled) {
        setConversations(mapConversations(msgs, normalizedUserId, profileById));
      }
    };

    const scheduleConversationsReload = (userId) => {
      if (refreshTimerId) {
        window.clearTimeout(refreshTimerId);
      }

      refreshTimerId = window.setTimeout(() => {
        loadConversations(userId);
      }, 120);
    };

    const bootstrap = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }

      const userId = String(userData.user.id);

      // 👤 Load my profile for NavBar
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", userId)
        .single();

      if (!isCancelled) {
        setProfile(myProfile || { id: userId });
      }

      await loadConversations(userId);

      if (!isCancelled) {
        setLoading(false);
        fadeTimerId = window.setTimeout(() => setIsLoaded(true), 150);
      }

      messagesChannel = supabase
        .channel(`messages:list:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const changedMessage = payload.new || payload.old;
            if (!changedMessage) return;

            const senderId = String(changedMessage.sender_id || "");
            const receiverId = String(changedMessage.receiver_id || "");
            if (senderId !== userId && receiverId !== userId) return;

            scheduleConversationsReload(userId);
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.error("Messages realtime channel error.");
          }
        });
    };

    bootstrap();

    return () => {
      isCancelled = true;
      if (fadeTimerId) {
        window.clearTimeout(fadeTimerId);
      }
      if (refreshTimerId) {
        window.clearTimeout(refreshTimerId);
      }
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
      }
    };
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
            {conversations.map((conv) => (
              <button
                key={`${conv.estateId}-${conv.otherUser.id}`}
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
