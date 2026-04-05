"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input, Button, Select, SelectItem, Tabs, Tab, Card } from "@heroui/react";

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
  const syncUser = useMutation(api.authSync.syncUser);
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
        variant="underlined"
        classNames={{
          tabList: "grid w-full grid-cols-2",
          cursor: "w-full bg-gradient-to-r from-blue-600 to-indigo-600",
          tab: "max-w-full",
          tabContent: "group-data-[selected=true]:text-blue-600",
        }}
      >
        <Tab
          key="signin"
          title={
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sign In
            </div>
          }
        >
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Welcome Back</h2>
              <p className="text-sm text-slate-600">Access your clinical dashboard</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                startContent={<Mail className="w-4 h-4 text-slate-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                variant="bordered"
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                startContent={<Lock className="w-4 h-4 text-slate-400" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                variant="bordered"
              />

              <div className="flex justify-end">
                <Button variant="light" size="sm" className="text-blue-600">
                  Forgot password?
                </Button>
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Card>
        </Tab>

        <Tab
          key="signup"
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Sign Up
            </div>
          }
        >
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Create Account</h2>
              <p className="text-sm text-slate-600">Join the HealthOS network</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                startContent={<Mail className="w-4 h-4 text-slate-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                variant="bordered"
              />

              <Input
                type="password"
                label="Password"
                placeholder="Create a password"
                startContent={<Lock className="w-4 h-4 text-slate-400" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                variant="bordered"
              />

              <Select
                label="Role"
                placeholder="Select your role"
                startContent={<User className="w-4 h-4 text-slate-400" />}
                selectedKeys={[role]}
                onSelectionChange={(keys) => setRole(Array.from(keys)[0] as string)}
                variant="bordered"
              >
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </Select>

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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
                size="lg"
                isLoading={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Card>
        </Tab>
      </Tabs>
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
