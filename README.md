# 🤖 AI Resume Analyzer

A full-stack MERN + TypeScript application that uses OpenAI GPT-4o-mini to analyze resumes against job descriptions.

## ✨ Features

- **AI-Powered Analysis** — GPT-4o-mini extracts skills, scores ATS compatibility, generates suggestions
- **JWT Auth** — Secure registration/login with role-based access
- **Real-Time Updates** — Socket.io notifies when analysis completes
- **Beautiful UI** — Dark glassmorphism design with Tailwind CSS
- **Charts & Visualizations** — Radar chart, bar chart, score rings
- **Resume Storage** — Upload PDF, DOCX, or TXT files

## 🗂 Project Structure

```
ai-resume-analyzer/
├── server/          # Express + TypeScript backend
│   ├── src/
│   │   ├── models/       # Mongoose models (User, Resume, Analysis)
│   │   ├── routes/       # Express routes (auth, resume, analysis)
│   │   ├── middleware/   # JWT auth middleware
│   │   ├── services/     # OpenAI service
│   │   ├── socket/       # Socket.io handlers
│   │   └── index.ts      # Entry point
│   └── .env
└── client/          # React + Vite + Tailwind frontend
    └── src/
        ├── context/      # Auth + Socket context
        ├── pages/        # Dashboard, Analyze, History, Detail
        └── components/   # Layout, ScoreRing
```

## 🚀 Quick Start

### 1. Install & Run Server

```bash
cd server
npm install
npm run dev
```

Server runs on http://localhost:5001

### 2. Install & Run Client

```bash
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173

## 🔑 Environment Variables (server/.env)

Already configured with your keys. To reset:

```
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_key
CLIENT_URL=http://localhost:5173
```

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| AI | OpenAI GPT-4o-mini |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Real-time | Socket.io |
| Charts | Recharts |
| File upload | Multer + pdf-parse + mammoth |

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/resume/upload | Yes | Upload resume file |
| GET | /api/resume | Yes | Get all resumes |
| DELETE | /api/resume/:id | Yes | Delete resume |
| POST | /api/analysis/analyze | Yes | Run AI analysis |
| GET | /api/analysis | Yes | Get all analyses |
| GET | /api/analysis/:id | Yes | Get single analysis |
| DELETE | /api/analysis/:id | Yes | Delete analysis |

## ⚠️ Security Note

Regenerate your OpenAI API key after testing — never share it publicly!
