import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# --- 1. SETUP AND CONFIGURATION ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- 2. FLASK APP INITIALIZATION ---
app = Flask(__name__)
CORS(app)

# --- 3. GEMINI MODEL SETUP ---
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config,
    system_instruction="You are an expert chatbot assistant, output format should be maximum of two lines",
)

# --- 4. CONVERSATION HISTORY MANAGEMENT ---
chat_sessions = {}

# --- 5. API ENDPOINT FOR CHATTING ---
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON body"}), 400

        user_input = data.get("message")
        session_id = data.get("session_id", "default_session")

        if not user_input:
            return jsonify({"error": "Message required"}), 400

        # Create or load session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = model.start_chat(history=[])

        chat_session = chat_sessions[session_id]

        # Call Gemini API safely
        try:
            gemini_response = chat_session.send_message(user_input)
        except Exception as api_error:
            return jsonify({
                "error": "Gemini API error",
                "details": str(api_error)
            }), 500

        reply_text = getattr(gemini_response, "text", "(no reply)")

        return jsonify({
            "reply": reply_text,
            "session_id": session_id
        })

    except Exception as e:
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500


# --- 6. RUN THE FLASK APP ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
