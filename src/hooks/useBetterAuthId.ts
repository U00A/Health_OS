"use client";

import { useState, useEffect } from "react";

export function useBetterAuthId(): string | undefined {
  const [betterAuthId, setBetterAuthId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setBetterAuthId(data.user?.id);
      } catch {
        setBetterAuthId(undefined);
      }
    }
    fetchSession();
  }, []);

  return betterAuthId;
}