import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { Pool } from "pg";
import { dash } from "@better-auth/infra";

const dbAdapter = process.env.POSTGRES_URL 
  ? new Pool({ 
      connectionString: process.env.POSTGRES_URL, 
      ssl: process.env.NODE_ENV === "production" ? true : false 
    }) 
  : new Database("./auth.db");

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const auth = betterAuth({
  database: dbAdapter,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getBaseURL(),
  trustedOrigins: [
    "https://dash.better-auth.com", 
    "http://localhost:3000", 
    "https://combined-judges-health-known.trycloudflare.com",
    "https://health-os-one.vercel.app"
  ],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "patient",
        input: true,
      },
    },
  },
  plugins: [
    dash(),
  ],
});
