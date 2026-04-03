import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { dash } from "@better-auth/infra";

export const auth = betterAuth({
  database: new Database("./auth.db"),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["https://dash.better-auth.com", "http://localhost:3000", "https://combined-judges-health-known.trycloudflare.com"],
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
