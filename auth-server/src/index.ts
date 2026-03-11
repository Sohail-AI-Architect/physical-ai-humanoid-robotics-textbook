import "dotenv/config";
import express from "express";
import cors from "cors";
import { auth } from "./auth.js";
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://iqra-sohail-2025-physical-ai-humanoid-robotics-textbook.hf.space",
        "https://sohail-ai-architect.github.io",
        "https://Sohail-AI-Architect.github.io",
        "https://physical-ai-humanoid-robotics-textb-two-zeta.vercel.app",
      ];
      if (!origin || allowed.includes(origin) || /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  })
);

const authHandler = toNodeHandler(auth);

app.all("/api/auth/*", (req, res) => {
  return authHandler(req, res);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-server" });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
