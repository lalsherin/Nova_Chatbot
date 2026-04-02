# Nova AI — Intelligent Chatbot

A beautiful, modern AI chatbot powered by **Groq's** lightning-fast LLM inference using the **Llama 3.3 70B** model.

![Nova AI Chatbot](https://img.shields.io/badge/Powered%20by-Groq-blueviolet) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- ⚡ **Lightning-fast responses** via Groq inference
- 🧠 **Llama 3.3 70B** model for high-quality answers
- 💬 **Conversation memory** across messages
- 📝 **Markdown rendering** with syntax highlighting
- 📋 **One-click code copy** for code blocks
- 🌙 **Stunning dark UI** with glassmorphism effects
- 📱 **Fully responsive** — works on mobile & desktop
- 🔒 **Secure** — API key stays on the server

## Quick Start (Local)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A [Groq API key](https://console.groq.com/keys)

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/groq-chatbot.git
   cd groq-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the root directory
   ```
   GROQ_API_KEY=your_groq_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Render (Free — Recommended for Public Use)

[Render](https://render.com) provides free hosting for Node.js apps. Here's how:

1. Push your code to GitHub (see below)
2. Go to [render.com](https://render.com) and sign up with GitHub
3. Click **"New" → "Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variable:
   - Key: `GROQ_API_KEY`
   - Value: `your_groq_api_key_here`
7. Click **Deploy** — your app will be live at `https://your-app.onrender.com`

## Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Nova AI Chatbot"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/groq-chatbot.git
git branch -M main
git push -u origin main
```

> ⚠️ **Important:** The `.gitignore` file ensures your `.env` (containing your API key) is **never** pushed to GitHub. Always set API keys as environment variables on your hosting platform.

## Project Structure

```
groq-chatbot/
├── public/
│   ├── index.html    # Frontend HTML
│   ├── style.css     # Styles & animations
│   └── app.js        # Frontend JavaScript
├── server.js         # Express backend (Groq proxy)
├── package.json      # Dependencies
├── .env              # API key (not committed)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## License

MIT — feel free to use and modify.
