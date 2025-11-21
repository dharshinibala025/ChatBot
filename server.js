// server.js — Express + SQLite + Gemini (via Python Flask)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fetch from "node-fetch";
import sqlite3 from "sqlite3";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// open or create SQLite DB
const db = new sqlite3.Database(path.join(__dirname, "db.sqlite"));

// create tables if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    session_id TEXT,
    role TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

// helper functions
function createUser(email) {
  const id = uuidv4();
  db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(id, email);
  return { id, email };
}
function getUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}
function getUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}
function saveMessage(user_id, session_id, role, content) {
  db.prepare(
    "INSERT INTO messages (user_id, session_id, role, content) VALUES (?, ?, ?, ?)"
  ).run(user_id, session_id, role, content);
}

// register user
app.post("/api/register", (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "email required" });

    const existing = getUserByEmail(email);
    if (existing) return res.json(existing);

    const user = createUser(email);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// get user
app.get("/api/user/:id", (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "not found" });
  res.json(user);
});

// ✅ CHAT ENDPOINT (calls Flask backend)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, user_id, session_id: clientSession } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    if (!message) return res.status(400).json({ error: "message required" });

    const session_id = clientSession || uuidv4();
    saveMessage(user_id, session_id, "user", message);

    // Call Flask Gemini backend
    const flaskResponse = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id }),
    });

    const raw = await flaskResponse.text();
console.log("Flask raw response:", raw);

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error("Flask did NOT return JSON!");
  return res.status(500).json({
    error: "Flask returned non-JSON response",
    raw_response: raw
  });
}

    const assistantReply = data.reply || "(no reply from Gemini)";

    saveMessage(user_id, session_id, "assistant", assistantReply);

    res.json({ reply: assistantReply, session_id });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// clear messages
app.post("/api/clear", (req, res) => {
  const user_id = req.body.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  db.prepare("DELETE FROM messages WHERE user_id = ?").run(user_id);
  res.json({ status: "cleared" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Node server running at http://localhost:${PORT}`)
);
