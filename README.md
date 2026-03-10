# Incubator OS

A lightweight tool to capture and structure insights from startup incubator trainings, mentor sessions, and workshops.

## Features

- Capture raw notes from sessions (title, date, mentor, topic, notes)
- AI-powered analysis: automatically extract summary, key insights, action items, and tags
- Search across all sessions
- Clean, minimal dark UI

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **SQLite** + **Prisma ORM**
- **Claude API** for AI summarization

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com/))

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Initialize the database
npx prisma db push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Management

```bash
# View/edit data in Prisma Studio
npx prisma studio
```

## Usage

1. Click **+ New Session** to create a session note
2. Fill in the title, date, mentor, topic, and paste your raw notes
3. On the session detail page, click **Analyze with AI** to extract structured insights
4. Use the search bar on the sessions list to find past sessions

## Future Roadmap

- Embeddings storage for semantic search
- Vector search with pgvector or similar
- AI chat interface over all sessions (RAG)
- Export to PDF/Notion
