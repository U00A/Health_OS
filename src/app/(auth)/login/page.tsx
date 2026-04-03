"use client";

import { useState, Suspense, useEffect } from "react";
import { Mail, Lock, ShieldCheck, Activity, ArrowRight, UserPlus, LogIn, ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { DemoCredentials } from "@/components/auth/DemoCredentials";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const roles = [
  { label: "Patient", value: "patient" },
  { label: "État Doctor", value: "medecin_etat" },
  { label: "Private Doctor", value: "private_doctor" },
  { label: "Medical Staff", value: "medical_staff" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Laboratory", value: "laboratory" },
  { label: "Administrator", value: "admin" },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const syncUser = useMutation(api.authSync.syncUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signIn" | "signUp">("signIn");

  useEffect(() => {
    const flow = searchParams.get("flow");
    if (flow === "signUp" || flow === "signIn") {
      setTimeout(() => setActiveTab(flow), 0);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (activeTab === "signUp") {
        // Register with Better Auth
        const result = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });

        if (result.error) {
          setError(result.error.message || "Registration failed.");
          setIsLoading(false);
          return;
        }

        // Sync user to Convex
        if (result.data?.user) {
          await syncUser({
            betterAuthId: result.data.user.id,
            email,
            name: result.data.user.name,
            role,
          });
        }
      } else {
        // Sign in with Better Auth
        const result = await authClient.signIn.email({
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message || "Authentication failed.");
          setIsLoading(false);
          return;
        }

        // Sync user to Convex
        if (result.data?.user) {
          await syncUser({
            betterAuthId: result.data.user.id,
            email,
            name: result.data.user.name,
          });
        }
      }

      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      console.error("Auth error:", err);
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-blue-900/5 border border-white/80 p-10">
        <div className="text-center mb-9">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {activeTab === "signIn" ? "Welcome back" : "Create account"}
          </h2>
          <p className="mt-2.5 text-sm text-slate-400 font-medium">
            {activeTab === "signIn"
              ? "Authenticate into your hospital node."
              : "Join the unified healthcare network."}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => { setActiveTab("signIn"); setError(""); setSuccess(""); }}
            className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "signIn"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("signUp"); setError(""); setSuccess(""); }}
            className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "signUp"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                id="auth-email"
                type="email"
                placeholder="doctor@hospital.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-13 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-13 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                autoComplete={activeTab === "signUp" ? "new-password" : "current-password"}
              />
            </div>
          </div>

          {/* Role Select (only on Register) */}
          {activeTab === "signUp" && (
            <div>
              <label htmlFor="auth-role" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  id="auth-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-13 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 flex items-center gap-2.5">
              <Activity className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-semibold border border-emerald-100">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {activeTab === "signIn" ? "Authenticate" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <DemoCredentials 
          onSelect={(email, password) => {
            setEmail(email);
            setPassword(password);
            setActiveTab("signIn");
            setError("");
          }} 
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background blur orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 text-white flex-col justify-between p-12 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDBMNDAgNDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L2c+PC9zdmc+')] z-[1]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 font-extrabold text-3xl tracking-tight mb-2">
            <Activity className="h-9 w-9 text-blue-300" />
            <span>HealthOS</span>
          </div>
          <p className="text-blue-200 font-medium text-sm tracking-wide">Unified Medical Architecture</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-black leading-tight">
            Secure, Role-Gated <br />Clinical Infrastructure.
          </h1>
          <p className="text-lg text-blue-100/80 font-light max-w-md leading-relaxed">
            Seamlessly coordinate ward admissions, pharmacy dispensing, and encrypted patient care channels on an immutable data fabric.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm font-medium text-blue-200/70">
          <ShieldCheck className="w-5 h-5" />
          <span>End-to-End Encrypted Platform Operations</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-28 z-10">
        <Suspense fallback={
          <div className="mx-auto w-full max-w-md h-96 bg-white/50 rounded-3xl animate-pulse" />
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
