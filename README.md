# Chatbot - Gemini App

This project is a professional chatbot assistant that uses a clean Node.js backend to interface directly with Google's Gemini AI.

## Architecture

-   **Frontend**: Vanilla HTML/CSS/JS (located in `public/`). Uses `marked.js` for markdown and `DOMPurify` for security.
-   **Backend (`server.js`)**: Manages user registration, chat history, and static file serving. Interfaces directly with the Google Gemini API.
-   **Database**: Uses SQLite (`db.sqlite`) for persistent message storage.

## Prerequisites

-   Node.js (v14+)
-   Gemini API Key (get one at [aistudio.google.com](https://aistudio.google.com/))

## Setup

1.  **Clone the repository** (or navigate to the folder).
2.  **Environment Variables**: Ensure your `.env` file in the root directory contains your API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    PORT=5000
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```

## Running the App

1.  **Start the Server**:
    ```bash
    npm start
    ```
    Alternatively, for development with auto-restart:
    ```bash
    npm run dev
    ```

2.  **Open the App**:
    Navigate to `http://localhost:5000` in your browser.

## Features

-   **User Authentication**: Simple email-based login.
-   **Persistent History**: Conversations are saved to an SQLite database.
-   **Rich Formatting**: Supports markdown in chatbot responses.
-   **Direct AI Integration**: Communicates directly with Gemini 1.5 Flash.

