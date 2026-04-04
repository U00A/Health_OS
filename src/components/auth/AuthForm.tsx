"use client";

import { useState, Suspense, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
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
  }, [searchParams]);

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
    setError("");
    setSuccess("");
  };

  const handleSignIn = () => {
    containerRef.current?.classList.remove("right-panel-active");
    setError("");
    setSuccess("");
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
    <div className="relative w-full max-w-[850px] mx-auto scale-[0.95] md:scale-100 transition-transform duration-500" style={{ minHeight: "580px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,600,800');
        
        .auth-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: 580px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: 'Montserrat', sans-serif;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.7s cubic-bezier(0.645, 0.045, 0.355, 1);
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
          opacity: 0;
        }

        .auth-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.7s;
        }

        @keyframes show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1);
          z-index: 100;
        }

        .auth-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 40%, #2563eb 70%, #06b6d4 100%);
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
          color: #FFFFFF;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
          transition: transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        .overlay-left { transform: translateX(-20%); }
        .auth-container.right-panel-active .overlay-left { transform: translateX(0); }
        .overlay-right { right: 0; transform: translateX(0); }
        .auth-container.right-panel-active .overlay-right { transform: translateX(20%); }

        .auth-form {
          background-color: rgba(255, 255, 255, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 45px;
          height: 100%;
          text-align: center;
        }

        .input-group {
          position: relative;
          width: 100%;
          margin: 10px 0;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          transition: color 0.3s;
        }

        .auth-input {
          background-color: #f8fafc;
          border: 2px solid transparent;
          padding: 12px 15px 12px 42px;
          width: 100%;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s;
          color: #1e293b;
        }

        .auth-input:focus {
          outline: none;
          border-color: #3b82f6;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .auth-input:focus + .input-icon {
          color: #3b82f6;
        }

        .auth-button {
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 700;
          padding: 14px 0;
          width: 100%;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all 0.3s;
          cursor: pointer;
          margin-top: 15px;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }

        .auth-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
        }

        .auth-button:active { transform: scale(0.98); }
        .auth-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .social-btn {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          cursor: pointer;
          color: #64748b;
        }

        .social-btn:hover {
          background: #f8fafc;
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-2px);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dc2626;
          font-size: 13px;
          margin-top: 12px;
          background: #fef2f2;
          padding: 10px 14px;
          border-radius: 12px;
          width: 100%;
          border: 1px solid #fee2e2;
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #059669;
          font-size: 13px;
          margin-top: 12px;
          background: #ecfdf5;
          padding: 10px 14px;
          border-radius: 12px;
          width: 100%;
          border: 1px solid #d1fae5;
        }
      `}</style>

      <div ref={containerRef} className="auth-container">
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => handleSubmit(e, true)} className="auth-form">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-blue-100 shadow-sm animate-in fade-in zoom-in duration-700">
               <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="auth-heading text-3xl mb-2">Create Account</h1>
            <p className="auth-text mb-6 text-slate-500 font-medium tracking-tight">Register your institutional node on the HealthOS network</p>
            
            <div className="input-group">
              <Mail className="input-icon w-4 h-4" />
              <input
                type="email"
                placeholder="Email Address"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <Lock className="input-icon w-4 h-4" />
              <input
                type="password"
                placeholder="Create Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <User className="input-icon w-4 h-4" />
              <select
                className="auth-input appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {error && <div className="error-message"><AlertCircle className="w-4 h-4" />{error}</div>}
            {success && <div className="success-message"><CheckCircle2 className="w-4 h-4" />{success}</div>}
            
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Sign Up"}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => handleSubmit(e, false)} className="auth-form">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-blue-100 shadow-sm animate-in fade-in zoom-in duration-700">
               <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="auth-heading text-3xl mb-2">Sign In</h1>
            <p className="auth-text mb-6 text-slate-500 font-medium tracking-tight">Access your clinical dashboard via secure protocol</p>
            
            <div className="input-group">
              <Mail className="input-icon w-4 h-4" />
              <input
                type="email"
                placeholder="Email Address"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <Lock className="input-icon w-4 h-4" />
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2 hover:underline">
              Forgot your password?
            </button>

            {error && <div className="error-message"><AlertCircle className="w-4 h-4" />{error}</div>}
            {success && <div className="success-message"><CheckCircle2 className="w-4 h-4" />{success}</div>}
            
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Sign In"}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="text-4xl font-black mb-4">Welcome Back!</h1>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">
                Access your personalized clinical dashboard and resume your healthcare journey.
              </p>
              <button className="bg-transparent border-2 border-white/80 rounded-full px-10 py-3 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors" onClick={handleSignIn}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="text-4xl font-black mb-4">New Here?</h1>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">
                Create your HealthOS node and join the network of modern medical professionals.
              </p>
              <button className="bg-transparent border-2 border-white/80 rounded-full px-10 py-3 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors" onClick={handleSignUp}>
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
    <Suspense fallback={<div className="mx-auto w-full max-w-md h-96 bg-white/10 rounded-3xl animate-pulse" />}>
      <AuthFormContent />
    </Suspense>
  );
}
