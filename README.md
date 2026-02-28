<div align="center">

# Fixy

### Turn any website, document, or content into a production-ready AI chatbot — in minutes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Powered by Gemini](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## What is Fixy?

Fixy is a self-serve AI chatbot platform. Point it at a website, upload a PDF, or paste raw text — Fixy crawls, chunks, embeds, and serves a semantically-aware chatbot that answers visitor questions based on your actual content. Drop a single `<script>` tag on your site and it's live.

No ML expertise required. No prompt engineering. Just your content.

---

## Features

| | Feature | Description |
|---|---|---|
| **Ingestion** | Website Crawler | Recursively scrapes and indexes any public website |
| | Document Upload | Ingest PDF and plain-text files directly |
| | Text Input | Paste raw content and have it indexed instantly |
| **AI** | Semantic Search | Vector similarity search with `all-MiniLM-L6-v2` embeddings |
| | LLM Responses | Grounded answers powered by Google Gemini |
| | Context-Aware | Retrieval-augmented generation keeps answers on-topic |
| **Integration** | Embed Widget | One `<script>` tag — fully self-contained, zero dependencies |
| | Customizable UI | Set brand colors, bot name, avatar, welcome message, and position |
| | REST API | Public chat API secured per-website via `x-api-secret` |
| **Dashboard** | Multi-site | Manage chatbots for unlimited websites from one place |
| | Analytics | Track requests, sessions, and chatbot performance over time |
| | Live Testing | Test chatbot responses directly in the dashboard |
| | API Key Management | Rotate secrets and manage access per website |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Dashboard (React)                   │
│  Add website / Upload PDF / Paste text                   │
└──────────────────────────┬──────────────────────────────┘
                           │ JWT-authenticated REST API
┌──────────────────────────▼──────────────────────────────┐
│                    Backend (Express + TS)                 │
│                                                          │
│  Ingestion Pipeline                                      │
│  ┌──────────┐   ┌──────────┐   ┌───────────────────┐   │
│  │ Scraper  │──▶│ Chunker  │──▶│ Embedding Service  │   │
│  │ (Puppeteer)  │(paragraph│   │(all-MiniLM-L6-v2) │   │
│  └──────────┘   │  based)  │   └────────┬──────────┘   │
│                 └──────────┘            │               │
│                                         ▼               │
│  Chat Pipeline            ┌──────────────────────────┐  │
│  ┌────────────┐           │  PostgreSQL + pgvector    │  │
│  │  Gemini    │◀──────────│  (Neon serverless)        │  │
│  │  (LLM)     │  top-k    └──────────────────────────┘  │
│  └────────────┘  chunks                                  │
└─────────────────────────────────────────────────────────┘
                           │ x-api-secret
┌──────────────────────────▼──────────────────────────────┐
│              Embeddable Widget (vanilla JS)               │
│              Deployed on any website via <script>         │
└─────────────────────────────────────────────────────────┘
```

---

## Getting Started

### 1. Self-hosted setup

**Prerequisites:** Node.js 20+, PostgreSQL with pgvector, a Neon (or standard Postgres) database

```bash
# Clone the repository
git clone https://github.com/your-org/fixy.git
cd fixy

# Backend
cd be
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm install
npx prisma db push
npm run dev

# Frontend (new terminal)
cd ../fe
cp .env.example .env          # set VITE_API_BASE_URL
npm install
npm run dev
```

### 2. Using the dashboard

1. **Create an account** at your Fixy instance
2. **Add a knowledge source** — website URL, PDF upload, or pasted text
3. **Wait for processing** — typically under two minutes
4. **Test your chatbot** using the built-in chat interface
5. **Copy the embed snippet** from the Settings page

### 3. Embedding on your website

```html
<script
  src="https://your-fixy-api/widget.js"
  data-website-id="YOUR_WEBSITE_ID"
  data-api-url="https://your-fixy-api"
  async
></script>
```

That's it. No framework, no build step, no dependencies.

---

## Tech Stack

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Framer Motion
- TanStack Query, React Router, Recharts

**Backend**
- Node.js, Express, TypeScript
- Prisma ORM, PostgreSQL (Neon), pgvector
- Multer (file uploads), pdf-parse (PDF extraction)

**AI / ML**
- Embeddings: `all-MiniLM-L6-v2` via Xenova Transformers (runs locally, no external API)
- LLM: Google Gemini (`gemini-2.0-flash`)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo and create a feature branch
2. Follow the existing code style (ESLint + Prettier configs included)
3. Add or update tests where applicable
4. Open a pull request against `main`

---

## License

[MIT](LICENSE)

---

<div align="center">
  <sub>Built by the Fixy team</sub>
</div>
