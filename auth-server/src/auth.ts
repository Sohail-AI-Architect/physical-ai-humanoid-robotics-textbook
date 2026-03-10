import { betterAuth } from "better-auth";
import pg from "pg";

const { Pool } = pg;

// Sanitize DATABASE_URL: remove stray backslashes that break connection parsing
const rawDbUrl = process.env.DATABASE_URL || "";
const sanitizedDbUrl = rawDbUrl.replace(/\\(?![nrt\\])/g, "");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  database: new Pool({
    connectionString: sanitizedDbUrl,
    ssl: { rejectUnauthorized: false },
  }),
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
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3000/physical-ai-humanoid-robotics-textbook",
    "http://localhost:8000",
    "https://iqra-sohail-2025-physical-ai-humanoid-robotics-textbook.hf.space",
    "https://Sohail-AI-Architect.github.io",
    "https://sohail-ai-architect.github.io",
  ],
});
