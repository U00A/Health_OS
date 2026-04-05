"use client";

import { useState, useEffect } from "react";

export function useBetterAuthId(): string | undefined {
  const [authId, setAuthId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        // Prefer deterministic betterAuthId for Convex query compatibility
        setAuthId(data.user?.betterAuthId || data.user?.id);
      } catch {
        setAuthId(undefined);
      }
    }
    fetchSession();
  }, []);

  return authId;
}