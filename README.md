# Incubator OS

A web app for startup incubation programs to capture raw notes from training sessions, mentor meetings, and workshops — then use AI to structure them into insights, action items, and knowledge articles.

## Features

- **Session Management** — Create, edit, and delete sessions with a rich text editor (images, formatting, lists)
- **AI Insight Builder** — Automatically extract summaries, key insights, and topic tags from your notes
- **Knowledge Base** — Generate structured AI articles from session notes, persisted and regenerable
- **Action Board** — Manually create and track action items with priority levels (High / Medium / Low) linked to sessions
- **Fix Spelling** — AI-powered proofreading that preserves your formatting, with before/after diff view
- **Multi-Provider AI** — Choose between Gemini (free tier), Anthropic, or OpenRouter — configured directly in the app
- **Dashboard** — Overview with pending actions, mentor stats, topic cloud, and insight summary
- **Search** — Full-text search across all sessions and topics
- **Dark UI** — SuperDesign aesthetic with wobbly borders, hard shadows, and a playful look

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **SQLite** + **Prisma ORM**
- **Multi-provider AI**: Google Gemini, Anthropic Claude, OpenRouter

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

```bash
# Install dependencies
npm install

# Initialize the database
npx prisma db push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configure AI

Go to **Settings** in the sidebar to connect your AI provider:

- **Google Gemini** (default) — free tier available at [aistudio.google.com](https://aistudio.google.com/apikey)
- **Anthropic Claude** — requires credits at [console.anthropic.com](https://console.anthropic.com/)
- **OpenRouter** — many free models at [openrouter.ai](https://openrouter.ai/keys)

No `.env` editing needed — everything is configured in-app.

### Database Management

```bash
# View/edit data in Prisma Studio
npx prisma studio
```

## Usage

1. **Create a session** — Click **+ New Session**, fill in title, date, mentor, topic, and your raw notes
2. **Analyze with AI** — On the session page or from the Insights page, click to extract structured insights
3. **Generate articles** — In the Knowledge Base, generate AI-written articles from your analyzed sessions
4. **Track actions** — Go to the Action Board to create and manage your action items
5. **Configure AI** — Visit Settings to switch providers or update your API key
