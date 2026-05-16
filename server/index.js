import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Проверява дали са налични задължителните променливи на средата.
const REQUIRED_ENV_VARS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Инициализира Express приложението и HTTP сървъра.
const app = express();
const server = http.createServer(app);

// Зарежда позволените frontend адреси за CORS и socket връзки.
const rawClientOrigins =
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://127.0.0.1:5173";

const allowedClientOrigins = rawClientOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Проверява дали даден origin е позволен.
function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedClientOrigins.includes(origin);
}

// Валидира origin стойността при CORS заявките.
function corsOriginValidator(origin, callback) {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
}

app.use(
  cors({
    origin: corsOriginValidator,
    credentials: true,
  })
);
app.use(express.json());

// Създава административен Supabase клиент за сървърни операции.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

app.get("/", (req, res) => {
  res.send("Backend is running and connected to Supabase!");
});

// Нормализира имейл адреса преди проверка и сравнение.
function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

// Проверява дали имейл адресът вече съществува в Supabase Auth.
async function isAuthEmailRegistered(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  const perPage = 200;
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const users = data?.users || [];
    const exists = users.some((user) => normalizeEmail(user.email) === normalizedEmail);
    if (exists) return true;

    if (!data?.nextPage || users.length === 0) return false;
    page = data.nextPage;
  }
}

// Endpoint за предварителна проверка на вече регистриран имейл.
app.post("/auth/check-email", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      res.status(400).json({ exists: false, error: "Email is required." });
      return;
    }

    const exists = await isAuthEmailRegistered(email);
    res.status(200).json({ exists });
  } catch (error) {
    console.error("Auth email check error:", error);
    res.status(500).json({ exists: false, error: "Could not check email." });
  }
});

// Генерира уникално име на conversation room по имот и участници.
function getConversationRoom({ estateId, userA, userB }) {
  if (!estateId || !userA || !userB) return null;

  const [firstUserId, secondUserId] = [String(userA), String(userB)].sort();
  return `conversation:${estateId}:${firstUserId}:${secondUserId}`;
}

// Извлича и нормализира данните за конкретен разговор.
function parseConversationPayload(payload = {}) {
  const estateId = String(payload.estateId || "").trim();
  const userA = String(payload.userA || payload.senderId || "").trim();
  const userB = String(payload.userB || payload.receiverId || "").trim();

  if (!estateId || !userA || !userB) return null;

  return { estateId, userA, userB };
}

// Извлича access token от socket заявката.
function getSocketToken(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authHeader = socket.handshake?.headers?.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

// Създава Socket.IO сървър със същите CORS ограничения.
const io = new Server(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Валидира всяка нова socket връзка чрез Supabase потребителя.
io.use(async (socket, next) => {
  try {
    const token = getSocketToken(socket);
    if (!token) {
      next(new Error("Unauthorized socket: missing access token"));
      return;
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.id) {
      next(new Error("Unauthorized socket: invalid access token"));
      return;
    }

    socket.data.userId = data.user.id;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Socket authentication failed"));
  }
});

// Обработва realtime събитията за разговорите.
io.on("connection", (socket) => {
  socket.on("join_conversation", (payload) => {
    // Разрешава присъединяване само на участници в разговора.
    const conversation = parseConversationPayload(payload);
    if (!conversation) return;

    if (
      socket.data.userId !== conversation.userA &&
      socket.data.userId !== conversation.userB
    ) {
      return;
    }

    const room = getConversationRoom(conversation);
    if (!room) return;

    socket.join(room);
  });

  socket.on("leave_conversation", (payload) => {
    // Премахва socket връзката от room на разговора.
    const conversation = parseConversationPayload(payload);
    if (!conversation) return;

    if (
      socket.data.userId !== conversation.userA &&
      socket.data.userId !== conversation.userB
    ) {
      return;
    }

    const room = getConversationRoom(conversation);
    if (!room) return;

    socket.leave(room);
  });

  socket.on("conversation_message", (payload) => {
    // Препраща съобщението към другия участник в същия room.
    const { message } = payload || {};
    const conversation = parseConversationPayload(payload);
    if (!conversation || !message?.id) return;

    if (socket.data.userId !== conversation.userA) {
      return;
    }

    if (
      String(message.estate_id || "") !== conversation.estateId ||
      String(message.sender_id || "") !== conversation.userA ||
      String(message.receiver_id || "") !== conversation.userB
    ) {
      return;
    }

    const room = getConversationRoom(conversation);

    if (!room) return;

    socket.to(room).emit("conversation_message", message);
  });
});

// Стартира backend сървъра на зададения порт.
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed client origins: ${allowedClientOrigins.join(", ")}`);
});

