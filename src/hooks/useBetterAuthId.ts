"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Hook to get the current Better Auth user ID.
 * Returns the ID string or undefined if not authenticated.
 */
export function useBetterAuthId(): string | undefined {
  const { data: session } = authClient.useSession();
  return session?.user?.id;
}
