import { betterAuth } from "better-auth";
import pg from "pg";

const { Pool } = pg;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
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
  ],
});
