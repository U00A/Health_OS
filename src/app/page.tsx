"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const LandingPage = dynamic(
  () => import("@/components/landing/LandingPage"),
  { ssr: false }
);

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const betterAuthId = session?.user?.id;
  const user = useQuery(
    api.users.current,
    betterAuthId ? { betterAuthId } : "skip"
  );
  const router = useRouter();

  useEffect(() => {
    if (session?.user && user === null) {
      // User authenticated but not found in Convex — possible stale session
      void authClient.signOut();
    } else if (session?.user && user) {
      switch (user.role) {
        case "admin": router.replace("/admin"); break;
        case "medecin_etat": router.replace("/doctor"); break;
        case "private_doctor": router.replace("/private"); break;
        case "medical_staff": router.replace("/staff"); break;
        case "pharmacy": router.replace("/pharmacy"); break;
        case "laboratory": router.replace("/lab"); break;
        case "patient":
        default: router.replace("/patient-portal"); break;
      }
    }
  }, [session, user, router]);

  if (isPending || (session?.user && user === undefined)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase animate-pulse">Initializing Interface</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {!session?.user && <LandingPage />}
    </main>
  );
}
