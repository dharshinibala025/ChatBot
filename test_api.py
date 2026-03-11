import requests
import json

print("Testing Flask backend (port 5001)...")
try:
    response = requests.post(
        "http://127.0.0.1:5001/chat",
        json={"message": "Hello", "session_id": "test123"},
        timeout=10
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

print("Testing Node.js backend (port 5000)...")
try:
    # First register a test user
    reg_response = requests.post(
        "http://127.0.0.1:5000/api/register",
        json={"email": "test@example.com"},
        timeout=10
    )
    print(f"Registration Status: {reg_response.status_code}")
    user_data = reg_response.json()
    print(f"User Data: {user_data}")
    
    # Now test chat
    chat_response = requests.post(
        "http://127.0.0.1:5000/api/chat",
        json={
            "message": "Hello",
            "user_id": user_data.get("id"),
            "session_id": "test123"
        },
        timeout=30
    )
    print(f"Chat Status: {chat_response.status_code}")
    print(f"Chat Response: {chat_response.text}")
except Exception as e:
    print(f"Error: {e}")
