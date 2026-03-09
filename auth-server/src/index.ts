import "dotenv/config";
import express from "express";
import cors from "cors";
import { auth } from "./auth.js";
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
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
