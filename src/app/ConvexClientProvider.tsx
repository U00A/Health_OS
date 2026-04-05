"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";

// Create a single Convex client instance with memory-friendly options
let convexInstance: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient {
  if (!convexInstance) {
    convexInstance = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
      unsavedChangesWarning: false,
    });
  }
  return convexInstance;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const convex = useMemo(() => getConvexClient(), []);

  return (
    <ConvexProvider client={convex}>
      <HeroUIProvider navigate={router.push}>
        {children}
      </HeroUIProvider>
    </ConvexProvider>
  );
}
