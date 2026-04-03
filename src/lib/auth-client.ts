import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    sentinelClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
