import { betterAuth } from "better-auth";
import pg from "pg";

const { Pool } = pg;

// Manually construct connection config to avoid DATABASE_URL escape issues
function buildPoolConfig() {
  const raw = process.env.DATABASE_URL || "";
  try {
    const url = new URL(raw);
    return {
      host: url.hostname,
      port: Number(url.port) || 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: { rejectUnauthorized: false },
    };
  } catch (e) {
    console.error("[auth] Failed to parse DATABASE_URL, falling back to raw string:", e);
    return {
      connectionString: raw,
      ssl: { rejectUnauthorized: false },
    };
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  database: new Pool(buildPoolConfig()),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      softwareBackground: {
        type: "string",
        required: false,
        defaultValue: "[]",
        input: true,
      },
      gpuTier: {
        type: "string",
        required: false,
        defaultValue: "None",
        input: true,
      },
      ramTier: {
        type: "string",
        required: false,
        defaultValue: "16GB",
        input: true,
      },
      hasJetson: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      robotPlatform: {
        type: "string",
        required: false,
        defaultValue: "None",
        input: true,
      },
    },
  },
  trustedOrigins: (origin) => {
    const allowed = [
      "http://localhost:3000",
      "http://localhost:3000/physical-ai-humanoid-robotics-textbook",
      "http://localhost:8000",
      "https://iqra-sohail-2025-physical-ai-humanoid-robotics-textbook.hf.space",
      "https://Sohail-AI-Architect.github.io",
      "https://sohail-ai-architect.github.io",
    ];
    if (allowed.includes(origin)) return true;
    if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
    return false;
  },
});
