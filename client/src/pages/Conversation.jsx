import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";
import { getSocketConfig } from "../utils/socket";

function isConversationMessage(message, estateId, firstUserId, secondUserId) {
  if (!message) return false;

  if (String(message.estate_id || "") !== String(estateId || "")) {
    return false;
  }

  const senderId = String(message.sender_id || "");
  const receiverId = String(message.receiver_id || "");
  const userA = String(firstUserId || "");
  const userB = String(secondUserId || "");

  return (
    (senderId === userA && receiverId === userB) ||
    (senderId === userB && receiverId === userA)
  );
}

function mergeMessage(prevMessages, incomingMessage) {
  if (!incomingMessage?.id) return prevMessages;

  const existingIndex = prevMessages.findIndex(
    (message) => message.id === incomingMessage.id
  );

  if (existingIndex !== -1) {
    const next = [...prevMessages];
    next[existingIndex] = { ...next[existingIndex], ...incomingMessage };
    return next;
  }

  const next = [...prevMessages, incomingMessage];
  next.sort(
    (a, b) =>
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );
  return next;
}

export default function Conversation() {
  const { estateId, otherUserId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null); // current user profile
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const socketRef = useRef(null);

  // 👇 same fade-in state as Dashboard
  const [isLoaded, setIsLoaded] = useState(false);

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
        .select("id, name, avatar_url, is_admin")
        .eq("id", currentUserId)
        .single();
      setProfile(me || { id: currentUserId });

      const { data: other } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", otherUserId)
        .single();
      setOtherUser(other || { id: otherUserId });

      // fetch existing messages in this conversation
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .eq("estate_id", estateId)
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages(msgs || []);
      }

      setLoading(false);

      // 👇 identical fade trigger to Dashboard
      setTimeout(() => setIsLoaded(true), 150);
    })();
  }, [estateId, otherUserId, navigate]);

  useEffect(() => {
    if (!profile?.id || !otherUser?.id || !estateId || loading) return;

    const roomPayload = {
      estateId: String(estateId),
      userA: profile.id,
      userB: otherUser.id,
    };

    let isCancelled = false;
    let socket = null;
    let handleConnect = null;
    let handleConversationMessage = null;
    let handleConnectError = null;

    const connectSocket = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Socket auth session error:", error);
          return;
        }

        const token = data?.session?.access_token;
        if (!token) {
          console.error("Socket auth token missing.");
          return;
        }

        const { url: socketUrl, path: socketPath } = getSocketConfig();
        socket = io(socketUrl, {
          path: socketPath,
          withCredentials: true,
          auth: { token },
        });

        if (isCancelled) {
          socket.disconnect();
          return;
        }

        socketRef.current = socket;

        handleConnect = () => {
          socket.emit("join_conversation", roomPayload);
        };

        handleConversationMessage = (incomingMessage) => {
          if (
            !isConversationMessage(
              incomingMessage,
              estateId,
              profile.id,
              otherUser.id
            )
          ) {
            return;
          }

          setMessages((prev) => mergeMessage(prev, incomingMessage));
        };

        socket.on("connect", handleConnect);
        socket.on("conversation_message", handleConversationMessage);

        if (socket.connected) {
          handleConnect();
        }

        handleConnectError = (socketError) => {
          console.error(
            "Socket connection error:",
            socketError?.message || socketError
          );
        };
        socket.on("connect_error", handleConnectError);
      } catch (connectError) {
        console.error("Socket setup failed:", connectError);
      }
    };

    connectSocket();

    return () => {
      isCancelled = true;
      if (!socket) return;

      socket.emit("leave_conversation", roomPayload);
      if (handleConnect) {
        socket.off("connect", handleConnect);
      }
      if (handleConversationMessage) {
        socket.off("conversation_message", handleConversationMessage);
      }
      if (handleConnectError) {
        socket.off("connect_error", handleConnectError);
      }
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [estateId, loading, otherUser?.id, profile?.id]);

  useEffect(() => {
    if (!profile?.id || !otherUser?.id || !estateId) return;

    const firstUserId = String(profile.id);
    const secondUserId = String(otherUser.id);
    const channelName = `conversation:db:${String(estateId)}:${[
      firstUserId,
      secondUserId,
    ]
      .sort()
      .join(":")}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `estate_id=eq.${estateId}`,
        },
        (payload) => {
          const incomingMessage = payload.new;
          if (
            !isConversationMessage(
              incomingMessage,
              estateId,
              firstUserId,
              secondUserId
            )
          ) {
            return;
          }

          setMessages((prev) => mergeMessage(prev, incomingMessage));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `estate_id=eq.${estateId}`,
        },
        (payload) => {
          const incomingMessage = payload.new;
          if (
            !isConversationMessage(
              incomingMessage,
              estateId,
              firstUserId,
              secondUserId
            )
          ) {
            return;
          }

          setMessages((prev) => mergeMessage(prev, incomingMessage));
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Conversation realtime channel error.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [estateId, otherUser?.id, profile?.id]);

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

      setMessages((prev) => mergeMessage(prev, data));

      socketRef.current?.emit("conversation_message", {
        estateId: String(estateId),
        senderId: profile.id,
        receiverId: otherUser.id,
        message: data,
      });

      setContent("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Неуспешно изпращане на съобщение.");
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
        transition: "opacity 0.4s ease",
        opacity: isLoaded ? 1 : 0,
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
            ← Назад
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
                Чат с {otherUser.name || "Потребител"}
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
            <p style={{ color: "#94a3b8" }}>Зареждане на съобщения…</p>
          ) : messages.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>
              Няма съобщения. Кажи „Здрасти“ 👋
            </p>
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
            placeholder="Напиши съобщение…"
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
            {sending ? "Изпращане…" : "Изпрати"}
          </button>
        </form>
      </main>
    </div>
  );
}
