import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# -----------------------------
# 1. CONFIGURATION
# -----------------------------
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

# Gemini model config
generation_config = {
    "temperature": 0.9,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 4096,
    "response_mime_type": "text/plain",
}

print("Initializing Gemini model: gemini-1.5-flash...")
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
    system_instruction="You are a professional chatbot assistant. Keep responses clean and short.",
)

# Store chat sessions in memory
chat_sessions = {}

# -----------------------------
# 2. /chat ENDPOINT
# -----------------------------
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON body"}), 400

        user_message = data.get("message")
        session_id = data.get("session_id", "default")

        if not user_message:
            return jsonify({"error": "Message required"}), 400

        print(f"[{session_id}] User message: {user_message}")


        # Create chat session if not exists
        if session_id not in chat_sessions:
            chat_sessions[session_id] = model.start_chat(history=[])

        chat_session = chat_sessions[session_id]

        # Call Gemini
        try:
            response = chat_session.send_message(user_message)
        except Exception as e:
            return jsonify({
                "error": "Gemini API Error",
                "details": str(e)
            }), 500

        # Extract reply
        reply = "(no reply)"
        if hasattr(response, "text") and response.text:
            reply = response.text.strip()
        elif hasattr(response, "candidates"):
            try:
                reply = response.candidates[0].content.parts[0].text.strip()
            except:
                pass

        print(f"[{session_id}] Gemini reply: {reply}")

        return jsonify({
            "reply": reply,
            "session_id": session_id
        })

    except Exception as e:
        return jsonify({
            "error": "Flask Server Error",
            "details": str(e)
        }), 500

# -----------------------------
# 3. START SERVER
# -----------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
