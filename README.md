# Physical AI & Humanoid Robotics

> AI-Native University Textbook & Learning Platform | Built with Docusaurus v3

## Live Deployment

🌐 **https://Sohail-AI-Architect.github.io/physical-ai-humanoid-robotics-textbook/**

## Quickstart

```bash
npm install
npm run start
# Opens at http://localhost:3000/physical-ai-humanoid-robotics-textbook/
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Book / Frontend | Docusaurus v3 + TypeScript + Tailwind CSS |
| Chatbot (coming soon) | Custom ChatKit + OpenAI Agents SDK |
| Backend API (coming soon) | FastAPI + Uvicorn |

Built with ❤️ by [Panaversity](https://panaversity.org)

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
