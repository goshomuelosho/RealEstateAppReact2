import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

export default function Conversation() {
  const { estateId, otherUserId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null); // current user profile
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }
      const currentUserId = userData.user.id;

      const { data: me } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", currentUserId)
        .single();
      setProfile(me || { id: currentUserId });

      const { data: other } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", otherUserId)
        .single();
      setOtherUser(other || { id: otherUserId });

      // fetch existing messages in this conversation
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .eq("estate_id", estateId)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages(msgs || []);
      }

      setLoading(false);
    })();
  }, [estateId, otherUserId, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !profile || !otherUser) return;

    try {
      setSending(true);
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            estate_id: estateId,
            sender_id: profile.id,
            receiver_id: otherUser.id,
            content: content.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      setContent("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
        color: "#E2E8F0",
      }}
    >
      <NavBar profile={profile} />

      <main
        style={{
          maxWidth: 900,
          margin: "2rem auto",
          padding: "0 1.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 120px)",
        }}
      >
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: "transparent",
              color: "#E2E8F0",
              padding: "0.3rem 0.8rem",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
          {otherUser && (
            <>
              <img
                src={otherUser.avatar_url || "https://via.placeholder.com/32"}
                alt="other"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(148,163,184,0.7)",
                }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                }}
              >
                Chat with {otherUser.name || "User"}
              </h2>
            </>
          )}
        </div>

        {/* Messages list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            borderRadius: 16,
            background: "rgba(15,23,42,0.85)",
            border: "1px solid rgba(148,163,184,0.35)",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading messages…</p>
          ) : messages.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No messages yet. Say hi 👋</p>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === profile?.id;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    padding: "0.6rem 0.9rem",
                    borderRadius: 14,
                    background: isMine
                      ? "linear-gradient(135deg,#3b82f6,#1d4ed8)"
                      : "rgba(15,23,42,0.9)",
                    color: "#f9fafb",
                    fontSize: "0.95rem",
                  }}
                >
                  {m.content}
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSend}
          style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message…"
            style={{
              flex: 1,
              padding: "0.8rem 1rem",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: "rgba(15,23,42,0.9)",
              color: "#E2E8F0",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            style={{
              padding: "0.8rem 1.4rem",
              borderRadius: 999,
              border: "none",
              background: sending
                ? "linear-gradient(135deg,#94a3b8,#64748b)"
                : "linear-gradient(135deg,#10b981,#059669)",
              color: "#fff",
              fontWeight: 700,
              cursor: sending || !content.trim() ? "not-allowed" : "pointer",
            }}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
