// server.js — Express + MongoDB + Gemini
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

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
  console.error("❌ No Gemini API keys found in .env!");
  process.exit(1);
}

console.log(`ℹ️  Loaded ${apiKeys.length} Gemini API key(s)`);

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
    const { message, user_id, session_id: clientSession } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    if (!message) return res.status(400).json({ error: "message required" });

    const session_id = clientSession || uuidv4();

    // Save user message
    await Message.create({ userId: user_id, sessionId: session_id, role: "user", content: message });

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

    const assistantReply = await sendWithKeyRotation(chatSession, message, session_id);

    // Save assistant reply
    await Message.create({ userId: user_id, sessionId: session_id, role: "assistant", content: assistantReply });

    res.json({ reply: assistantReply, session_id });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "server error", details: err.message });
  }
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

const PORT = process.env.PORT || 5000;

// Start server only after MongoDB is connected
mongoose.connect(mongodbUri)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`✅ Node server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    if (err.message.includes("authentication failed")) {
      console.error("👉 TIP: Check your MONGODB_URI in the .env file. Ensure the username and password are correct.");
    }
    process.exit(1);
  });
