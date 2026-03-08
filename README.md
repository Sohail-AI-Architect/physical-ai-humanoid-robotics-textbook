# Physical AI & Humanoid Robotics

> AI-Native University Textbook & Learning Platform | Built with Docusaurus v3

## Live Deployment

🌐 **[https://Sohail-AI-Architect.github.io/physical-ai-humanoid-robotics-textbook/](https://Sohail-AI-Architect.github.io/physical-ai-humanoid-robotics-textbook/)**

## Features

- **Interactive Textbook** — 20+ chapters covering Physical AI, Humanoid Robotics, ROS 2, NVIDIA Isaac, and more
- **RAG Chatbot** — AI-powered Q&A chatbot using Cohere embeddings + OpenRouter Gemini Flash with Qdrant vector store
- **Authentication & Personalization** — User auth, personalized learning, and Urdu translation support
- **GitHub Pages Deployment** — Automated CI/CD with `gh-pages` branch

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Book / Frontend | Docusaurus v3 + TypeScript + React 18 + Tailwind CSS |
| RAG Chatbot | FastAPI + Cohere Embeddings + OpenRouter Gemini Flash + Qdrant Cloud |
| Backend API | FastAPI + Uvicorn + Python 3.11 |
| Vector Store | Qdrant Cloud (1536-dim cosine similarity) |
| Auth & i18n | Firebase Auth + Urdu Translation |

## Quickstart

```bash
npm install
npm run start
# Opens at http://localhost:3000/physical-ai-humanoid-robotics-textbook/
```

## Backend (RAG Chatbot)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Build

```bash
npm run build
```

## Deployment

```bash
GIT_USER=Sohail-AI-Architect npm run deploy
```

## Repository Structure

```
├── docs/              # Textbook chapters (MDX)
├── src/               # Docusaurus theme & components
├── backend/           # FastAPI RAG chatbot backend
├── static/            # Static assets
└── docusaurus.config.ts
```

## Author

Built by **Sohail Nawaz** ([@Sohail-AI-Architect](https://github.com/Sohail-AI-Architect))

## License

This project is open source.
