"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, Tab, Card, Button } from "@heroui/react";

const roles = [
  { label: "Patient", value: "patient" },
  { label: "État Doctor", value: "medecin_etat" },
  { label: "Private Doctor", value: "private_doctor" },
  { label: "Medical Staff", value: "medical_staff" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Laboratory", value: "laboratory" },
  { label: "Administrator", value: "admin" },
];

function AuthFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const syncUser = useMutation(api.auth_sync.syncUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(searchParams.get("flow") === "signUp" ? "signup" : "signin");

  // Listen for demo-fill events
  const handleDemoFill = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { email: string; password: string };
    setEmail(detail.email);
    setPassword(detail.password);
    setSelectedTab("signin");
  }, []);

  useEffect(() => {
    window.addEventListener("demo-fill", handleDemoFill);
    return () => window.removeEventListener("demo-fill", handleDemoFill);
  }, [handleDemoFill]);

  const handleSubmit = async (e: React.FormEvent, isSignUpMode: boolean) => {
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
      if (isSignUpMode) {
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

        if (result.data?.user) {
          await syncUser({
            betterAuthId: result.data.user.id,
            email,
            name: result.data.user.name,
            role,
          });
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message || "Authentication failed.");
          setIsLoading(false);
          return;
        }

        if (result.data?.user) {
          await syncUser({
            betterAuthId: result.data.user.id,
            email,
            name: result.data.user.name,
          });
        }
      }

      setSuccess(isSignUpMode ? "Account created! Redirecting..." : "Success! Redirecting...");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      console.error("Auth error:", err);
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        className="w-full"
      >
        <Tab key="signin">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sign In
          </div>
        </Tab>
        <Tab key="signup">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Sign Up
          </div>
        </Tab>
      </Tabs>

      {selectedTab === "signin" && (
        <Card className="p-6 space-y-6 mt-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Welcome Back</h2>
            <p className="text-sm text-slate-600">Access your clinical dashboard</p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </Card>
      )}

      {selectedTab === "signup" && (
        <Card className="p-6 space-y-6 mt-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Create Account</h2>
            <p className="text-sm text-slate-600">Join the HealthOS network</p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Account Role
              </label>
              <div className="relative group">
                <select
                  className="w-full h-12 p-3 pl-4 rounded-xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-700 outline-none hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 appearance-none transition-all cursor-pointer shadow-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Activity size={14} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-1 italic">
                Select your clinical or administrative role
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

export function AuthForm() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-md h-96 bg-white/10 rounded-3xl animate-pulse" />}>
      <AuthFormContent />
    </Suspense>
  );
}
