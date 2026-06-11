// server.js — Express + MongoDB + Gemini
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";

dotenv.config();

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client/dist")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, '-'));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images, videos, common docs, zip
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'text/plain',
    'application/zip', 'application/x-zip-compressed'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type: " + file.mimetype), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// MongoDB URI
const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chatbot";

// Schemas
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  email: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  title: { type: String, default: "New Conversation" },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  file: {
    url: { type: String },
    name: { type: String },
    type: { type: String }, // Mongoose interprets object with 'type' field as a type-definition unless wrapped properly.
    size: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);

// ─── Gemini API Key Rotation ──────────────────────────────────────────────
// Loads all keys from .env (GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, ...)
const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean); // removes undefined entries

if (apiKeys.length === 0) {
  console.warn("⚠️  No Gemini API keys found! Please configure GEMINI_API_KEY in your environment variables.");
} else {
  console.log(`ℹ️  Loaded ${apiKeys.length} Gemini API key(s)`);
}

let currentKeyIndex = 0;

function getGeminiModel() {
  const key = apiKeys[currentKeyIndex];
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "You are a professional chatbot assistant. Keep responses clean and short.",
    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
  });
}

async function sendWithKeyRotation(chatSession, message, sessionId) {
  for (let attempt = 0; attempt < apiKeys.length * 2; attempt++) {
    try {
      const result = await chatSession.sendMessage(message);
      return result.response.text().trim() || "(no reply)";
    } catch (e) {
      const isQuota = e.status === 429 || e.status === 400 || e.status === 404 || e.status === 403;
      if (isQuota) {
        const nextIndex = (currentKeyIndex + 1) % apiKeys.length;
        if (nextIndex === currentKeyIndex) {
          throw new Error("All API keys are exhausted. Please try again later.");
        }
        console.warn(`⚠️  Key #${currentKeyIndex + 1} failed (${e.status}), switching to key #${nextIndex + 1}...`);
        currentKeyIndex = nextIndex;
        // Reset chat session with new key
        const newModel = getGeminiModel();
        chatSession = newModel.startChat({ history: [] });
        chatSessions.set(sessionId, chatSession);
      } else {
        throw e;
      }
    }
  }
  throw new Error("All API keys failed.");
}

const chatSessions = new Map();

// Register user
app.post("/api/register", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "email required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, id: uuidv4() });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, user_id, session_id: clientSession, file } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    if (apiKeys.length === 0) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your Vercel Environment Variables." });
    }

    const session_id = clientSession || uuidv4();
    const finalMessage = message || (file ? `[Uploaded file: ${file.name}]` : "");

    // Save user message
    await Message.create({ 
      userId: user_id, 
      sessionId: session_id, 
      role: "user", 
      content: finalMessage,
      file: file || undefined
    });

    // Handle Conversation Title
    let conv = await Conversation.findOne({ sessionId: session_id });
    if (!conv) {
      const title = message.length > 40 ? message.slice(0, 40) + "..." : message;
      await Conversation.create({ sessionId: session_id, userId: user_id, title });
    }

    // Gemini Chat with key rotation
    let chatSession = chatSessions.get(session_id);
    if (!chatSession) {
      chatSession = getGeminiModel().startChat({ history: [] });
      chatSessions.set(session_id, chatSession);
    }

    const assistantReply = await sendWithKeyRotation(chatSession, finalMessage, session_id);

    // Save assistant reply
    await Message.create({ userId: user_id, sessionId: session_id, role: "assistant", content: assistantReply });

    res.json({ reply: assistantReply, session_id });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "server error", details: err.message });
  }
});

// File Upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided or file type rejected." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware for Multer (e.g. file size exceeded)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Get history
app.get("/api/history", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    const conversations = await Conversation.find({ userId: user_id }).sort({ createdAt: -1 });
    const rows = conversations.map(c => ({
      id: c.sessionId,
      content: c.title,
      created_at: c.createdAt
    }));
    res.json(rows);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Get conversation messages
app.get("/api/conversation/:id", async (req, res) => {
  try {
    const session_id = req.params.id;
    const msgs = await Message.find({ sessionId: session_id }).sort({ createdAt: 1 });

    if (msgs.length === 0) return res.status(404).json({ error: "not found" });
    res.json(msgs);
  } catch (err) {
    console.error("Conversation error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Rename conversation
app.post("/api/conversation/rename", async (req, res) => {
  try {
    const { session_id, title } = req.body;
    await Conversation.findOneAndUpdate({ sessionId: session_id }, { title });
    res.json({ status: "renamed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete conversation
app.post("/api/conversation/delete", async (req, res) => {
  try {
    const { session_id } = req.body;
    await Message.deleteMany({ sessionId: session_id });
    await Conversation.deleteOne({ sessionId: session_id });
    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all history
app.post("/api/clear", async (req, res) => {
  try {
    const { user_id } = req.body;
    await Message.deleteMany({ userId: user_id });
    await Conversation.deleteMany({ userId: user_id });
    res.json({ status: "cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB (Asynchronously, to prevent serverless startup crashes)
mongoose.connect(mongodbUri)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    if (err.message.includes("authentication failed")) {
      console.error("👉 TIP: Check your MONGODB_URI in the .env file.");
    }
  });

// Only bind to port if running locally (not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Node server running at http://localhost:${PORT}`);
  });
}

// Export the Express app instance for Vercel serverless runner
export default app;
