import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

// ✅ Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.send("Backend is running and connected to Supabase!");
});

function getConversationRoom({ estateId, userA, userB }) {
  if (!estateId || !userA || !userB) return null;

  const [firstUserId, secondUserId] = [String(userA), String(userB)].sort();
  return `conversation:${estateId}:${firstUserId}:${secondUserId}`;
}

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join_conversation", (payload) => {
    const room = getConversationRoom(payload || {});
    if (!room) return;

    socket.join(room);
  });

  socket.on("leave_conversation", (payload) => {
    const room = getConversationRoom(payload || {});
    if (!room) return;

    socket.leave(room);
  });

  socket.on("conversation_message", (payload) => {
    const { estateId, senderId, receiverId, message } = payload || {};
    const room = getConversationRoom({
      estateId,
      userA: senderId,
      userB: receiverId,
    });

    if (!room || !message?.id) return;

    socket.to(room).emit("conversation_message", message);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
