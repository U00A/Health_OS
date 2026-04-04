"use client";

import { useState, Suspense, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize panel state from URL on mount
  useEffect(() => {
    if (searchParams.get("flow") === "signUp" && containerRef.current) {
      containerRef.current.classList.add("right-panel-active");
    }
  }, []); // Only run on mount

  // Listen for demo-fill events
  const handleDemoFill = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { email: string; password: string };
    setEmail(detail.email);
    setPassword(detail.password);
    // Switch to sign-in panel when demo is selected
    containerRef.current?.classList.remove("right-panel-active");
  }, []);

  useEffect(() => {
    window.addEventListener("demo-fill", handleDemoFill);
    return () => window.removeEventListener("demo-fill", handleDemoFill);
  }, [handleDemoFill]);

  const handleSignUp = () => {
    containerRef.current?.classList.add("right-panel-active");
  };

  const handleSignIn = () => {
    containerRef.current?.classList.remove("right-panel-active");
  };

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

      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      console.error("Auth error:", err);
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[768px]" style={{ minHeight: "520px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }

        .auth-container {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: 520px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-family: 'Montserrat', sans-serif;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }

        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
        }

        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        .auth-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
        }

        .auth-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.6s;
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 100;
        }

        .auth-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 25%, #3b82f6 50%, #06b6d4 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          color: #FFFFFF;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .auth-container.right-panel-active .overlay {
          transform: translateX(50%);
        }

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .overlay-left {
          transform: translateX(-20%);
        }

        .auth-container.right-panel-active .overlay-left {
          transform: translateX(0);
        }

        .overlay-right {
          right: 0;
          transform: translateX(0);
        }

        .auth-container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }

        .auth-form {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 30px;
          height: 100%;
          text-align: center;
        }

        .auth-input {
          background-color: rgba(238, 238, 238, 0.9);
          border: 2px solid transparent;
          padding: 12px 15px;
          margin: 8px 0;
          width: 100%;
          border-radius: 8px;
          backdrop-filter: blur(5px);
          font-family: 'Montserrat', sans-serif;
          transition: all 0.2s ease;
        }

        .auth-input:focus {
          outline: none;
          border-color: #3b82f6;
          background-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .auth-select {
          background-color: rgba(238, 238, 238, 0.9);
          border: 2px solid transparent;
          padding: 12px 15px;
          margin: 8px 0;
          width: 100%;
          border-radius: 8px;
          backdrop-filter: blur(5px);
          font-family: 'Montserrat', sans-serif;
          cursor: pointer;
          appearance: none;
          transition: all 0.2s ease;
        }

        .auth-select:focus {
          outline: none;
          border-color: #3b82f6;
          background-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .auth-button {
          border-radius: 20px;
          border: 1px solid #3b82f6;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: bold;
          padding: 12px 45px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 80ms ease-in;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          margin-top: 10px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .auth-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .auth-button:active {
          transform: scale(0.95) translateY(0);
        }

        .auth-button:focus {
          outline: none;
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .auth-button.ghost {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: none;
        }

        .auth-button.ghost:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .auth-heading {
          font-weight: 800;
          margin: 0;
          font-family: 'Montserrat', sans-serif;
          color: #1e293b;
        }

        .auth-text {
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          letter-spacing: 0.5px;
          margin: 15px 0 20px;
          font-family: 'Montserrat', sans-serif;
          color: #64748b;
        }

        .auth-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #475569;
          text-align: left;
          width: 100%;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 8px;
          background: rgba(220, 38, 38, 0.08);
          padding: 10px 14px;
          border-radius: 8px;
          width: 100%;
          border: 1px solid rgba(220, 38, 38, 0.15);
        }

        .success-message {
          color: #059669;
          font-size: 12px;
          margin-top: 8px;
          background: rgba(5, 150, 105, 0.08);
          padding: 10px 14px;
          border-radius: 8px;
          width: 100%;
          border: 1px solid rgba(5, 150, 105, 0.15);
        }
      `}</style>

      {/* Animated Background - HealthOS Blue Theme */}
      <div className="absolute inset-0 overflow-hidden rounded-[10px] -z-10">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #06b6d4 100%)",
          }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/60"
            style={{
              width: `${3 + (i % 4)}px`,
              height: `${3 + (i % 4)}px`,
              top: `${10 + i * 15}%`,
              left: `${(i * 20 + 10) % 100}%`,
              animation: `float ${6 + i}s ease-in-out infinite`,
              animationDelay: `${i}s`,
            }}
          />
        ))}
      </div>

      <div ref={containerRef} className="auth-container" id="auth-container">
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => handleSubmit(e, true)} className="auth-form">
            <h1 className="auth-heading text-2xl">Create Account</h1>
            <p className="auth-text">Join HealthOS and connect with your care team</p>
            <input
              type="email"
              placeholder="Email address"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Create password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="w-full text-left">
              <label className="auth-label">Your Role</label>
              <div className="relative">
                <select
                  className="auth-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => handleSubmit(e, false)} className="auth-form">
            <h1 className="auth-heading text-2xl">Sign In</h1>
            <p className="auth-text">Access your HealthOS dashboard securely</p>
            <input
              type="email"
              placeholder="Email address"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Overlay Panels with HealthOS Branding */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="mb-6">
                <svg width="50" height="50" viewBox="0 0 50 50" className="mx-auto mb-4">
                  <path d="M25 5 L30 20 L45 20 L33 30 L37 45 L25 35 L13 45 L17 30 L5 20 L20 20 Z" fill="rgba(255,255,255,0.9)" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">Welcome Back!</h1>
              <p className="text-white/90 text-sm mb-6 leading-relaxed">
                Access your patient records, real-time vitals monitoring, and care team communications with complete security
              </p>
              <button
                className="ghost auth-button"
                onClick={handleSignIn}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="mb-6">
                <svg width="50" height="50" viewBox="0 0 50 50" className="mx-auto mb-4">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" />
                  <path d="M15 25 L22 32 L35 18" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">Join HealthOS</h1>
              <p className="text-white/90 text-sm mb-6 leading-relaxed">
                Create your account to access unified healthcare records, vital sign tracking, and seamless clinical coordination
              </p>
              <button
                className="ghost auth-button"
                onClick={handleSignUp}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthForm() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-md h-96 bg-white/50 rounded-3xl animate-pulse" />
    }>
      <AuthFormContent />
    </Suspense>
  );
}
