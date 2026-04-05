"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const LandingPage = dynamic(
  () => import("@/components/landing/LandingPage"),
  { ssr: false }
);

export default function Home() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
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
  }, [user, router]);

  if (isLoading || user === undefined) {
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
      {!user && <LandingPage />}
    </main>
  );
}