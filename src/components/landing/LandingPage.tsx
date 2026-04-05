"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ShieldCheck,
  Stethoscope,
  Microscope,
  Pill,
  BedDouble,
  UserRound,
  ArrowRight,
  Zap,
  ChevronRight,
  Users,
  Building2,
  Globe,
  Lock,
  Database,
  Sparkles,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import dynamic from "next/dynamic";

const InteractiveBackground = dynamic(() => import("./InteractiveBackground"), { ssr: false });

/* ════════════════════════════════════════════════
   Animated Counter Hook
   ════════════════════════════════════════════════ */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return { value, ref };
}

/* ════════════════════════════════════════════════
   Data
   ════════════════════════════════════════════════ */
const roles = [
  {
    title: "Doctors",
    description: "Rich-text clinical reports, AI-assisted diagnostics, and real-time patient history.",
    icon: Stethoscope,
    color: "text-blue-600",
    bg: "bg-blue-50",
    link: "/doctor",
  },
  {
    title: "Medical Staff",
    description: "Bed grid management, ward oversight, and real-time admission tracking flows.",
    icon: BedDouble,
    color: "text-sky-600",
    bg: "bg-sky-50",
    link: "/staff",
  },
  {
    title: "Pharmacists",
    description: "Immutable prescription tracking with automated interaction verification.",
    icon: Pill,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    link: "/pharmacy",
  },
  {
    title: "Lab Technicians",
    description: "Automated analysis pipelines and secure, structured result uploads.",
    icon: Microscope,
    color: "text-violet-600",
    bg: "bg-violet-50",
    link: "/lab",
  },
  {
    title: "Patients",
    description: "Personal health hub with instant access to your clinical history and records.",
    icon: UserRound,
    color: "text-slate-700",
    bg: "bg-slate-50",
    link: "/patient-portal",
  },
  {
    title: "Private Care",
    description: "Isolated, high-security clinical space for private practitioners.",
    icon: ShieldCheck,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    link: "/private",
  },
];

const features = [
  {
    title: "Global Reactivity",
    description: "Every change synchronizes instantly across all institutional interfaces.",
    icon: Zap,
    accent: "text-amber-500"
  },
  {
    title: "Immutable History",
    description: "Cryptographic logging ensures records can never be lost or tampered with.",
    icon: Database,
    accent: "text-blue-500"
  },
  {
    title: "Zero-Trust Security",
    description: "Strict role boundaries preventing cross-contamination of sensitive data.",
    icon: Lock,
    accent: "text-slate-400"
  },
];

/* ════════════════════════════════════════════════
   Animations
   ════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const fadeDelay = (i: number) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: "easeOut" as const },
  },
});

/* ════════════════════════════════════════════════
   Stat Card
   ════════════════════════════════════════════════ */
function StatCard({ stat }: { stat: { label: string; value: number; suffix?: string; icon: React.ElementType } }) {
  const { value, ref } = useCounter(stat.value, 2000);
  return (
    <div ref={ref} className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white border-b-slate-100 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.08)]">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <stat.icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1 tabular-nums tracking-tighter">
        {value.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ROLE CARD
   ════════════════════════════════════════════════ */
function RoleCard({ role, i }: { role: typeof roles[0]; i: number }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeDelay(i)}>
      <Link href={role.link} className="group block h-full">
        <div className="relative bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-[0_8px_30px_-16px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:border-blue-100 transition-all duration-500 h-full overflow-hidden flex flex-col">
          <div className="relative z-10 flex flex-col h-full">
            <div className={`${role.bg} w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform`}>
              <role.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${role.color}`} />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">{role.title}</h3>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium flex-1">{role.description}</p>
            <div className="flex items-center gap-2 mt-4 sm:mt-6 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all">
              <span className="text-slate-900">Launch Portal</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */
export default function LandingPage() {
  const liveStats = useQuery(api.stats.getLandingStats);

  const statsData = [
    { label: "Active Nodes", value: liveStats?.totalUsers ?? 0, icon: Users },
    { label: "Patient Records", value: liveStats?.totalPatients ?? 0, suffix: "+", icon: UserRound },
    { label: "Institutions", value: liveStats?.totalHospitals ?? 0, suffix: "+", icon: Building2 },
    { label: "Active Admissions", value: liveStats?.activeAdmissions ?? 0, icon: BedDouble },
  ];

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 relative">
      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-2xl border-b border-slate-100 py-3 shadow-sm" : "bg-transparent py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden border border-slate-100">
              <Image src="/favicon.png" alt="HealthOS" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 italic">Health<span className="text-blue-600">OS</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
            <a href="#ecosystem" className="hover:text-blue-600 transition-colors">Ecosystem</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">Sign in</Link>
            <Link
              href="/login?flow=signUp"
              className="bg-slate-900 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-40 pb-20 md:pt-52 lg:pb-36 px-6 overflow-hidden">
        {/* Interactive Canvas Background */}
        <InteractiveBackground />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s'}} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2.5 bg-white/60 backdrop-blur-md border border-white border-b-blue-100/50 text-blue-600 font-extrabold text-[10px] px-5 py-2.5 rounded-full uppercase tracking-[0.2em] mb-10 shadow-lg shadow-blue-900/5">
                <Globe className="w-4 h-4 text-blue-500" />
                Next-Gen Healthcare Architecture
              </div>
              <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[0.93] mb-6 sm:mb-8">
                Operating System for <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 drop-shadow-sm">
                  Modern Medicine.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500/90 font-medium max-w-2xl mx-auto mb-12 leading-relaxed px-4">
                Unified clinical protocols, real-time vitals, and immutable patient records — architected for speed and clinical precision.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link
                  href="/login?flow=signUp"
                  className="inline-flex items-center gap-3 font-black h-14 px-10 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-95"
                >
                  Launch Platform
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#ecosystem"
                  className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl border border-white bg-white/50 backdrop-blur-md text-slate-700 font-bold text-sm hover:bg-white hover:border-blue-100 transition-all active:scale-95"
                >
                  Explore Ecosystem
                </Link>
              </div>
            </motion.div>
        </div>

        {/* Hero Visual Mockup */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-24 max-w-5xl mx-auto">
            <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-3 border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
              <div className="overflow-hidden rounded-[1.8rem] bg-slate-900 aspect-16/10 sm:aspect-video relative shadow-2xl">
                 <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 opacity-90" />
                 
                 {/* Mock UI Content */}
                 <div className="absolute inset-0 p-6 sm:p-10 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/80" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-32 h-2 rounded-full bg-white/10" />
                          <div className="w-8 h-8 rounded-full bg-white/10" />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-6 flex-1">
                       <div className="col-span-3 space-y-4">
                          {[1,2,3,4].map(i => (
                             <div key={i} className="h-10 rounded-xl bg-white/5 border border-white/5" />
                          ))}
                       </div>
                       <div className="col-span-9 space-y-6">
                          <div className="grid grid-cols-3 gap-6">
                             {[1,2,3].map(i => (
                                <div key={i} className="h-32 rounded-2xl bg-white/3 border border-white/5 p-4">
                                   <div className="w-12 h-2 rounded-full bg-blue-500/40 mb-4" />
                                   <div className="w-20 h-4 rounded-full bg-white/10" />
                                </div>
                             ))}
                          </div>
                          <div className="flex-1 rounded-2xl bg-linear-to-b from-white/5 to-transparent border border-white/5 p-6 relative overflow-hidden">
                             <div className="w-40 h-2 rounded-full bg-white/10 mb-8" />
                             <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-blue-500/20 via-blue-500/5 to-transparent" style={{ clipPath: 'polygon(0 100%, 0 45%, 10% 38%, 20% 55%, 30% 41%, 40% 64%, 50% 32%, 60% 77%, 70% 28%, 80% 55%, 90% 42%, 100% 61%, 100% 100%)' }} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
        </motion.div>
      </section>

      {/* ═══ STATS ═══ */}
      {liveStats && (
        <section className="py-20 px-6 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {statsData.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ ECOSYSTEM ROLES ═══ */}
      <section id="ecosystem" className="py-28 md:py-36 px-6 relative bg-white/40">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <div className="text-center max-w-3xl mx-auto mb-20 md:mb-24">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[1.05]">
                Specialized <span className="text-blue-600">Environments.</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                Hyper-optimized portals for every clinical stakeholder, connected by a unified data fabric.
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roles.map((r, i) => (
              <RoleCard key={r.title} role={r} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CORE FEATURES ═══ */}
      <section id="features" className="py-28 px-6 bg-slate-100/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                Platform <span className="text-blue-600">Pillars.</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium tracking-tight">Architected for the next generation of clinical coordination.</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" variants={fadeDelay(i)} viewport={{ once: true }}>
                <div className="space-y-6 group">
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <f.icon className={`w-7 h-7 ${f.accent}`} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{f.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-lg">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="bg-slate-925 rounded-[4rem] p-12 md:p-32 relative overflow-hidden text-center bg-slate-900 shadow-2xl shadow-blue-900/20">
              <div className="absolute -top-32 -right-40 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
              <div className="absolute -bottom-32 -left-40 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[80px]" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-10 border border-white/10">
                  <Sparkles className="w-8 h-8 text-blue-300" />
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-8 leading-[1.05]">
                  Deploy Your <br />Health Node.
                </h2>
                <p className="text-xl text-blue-100/70 leading-relaxed mb-12 font-medium">
                  Join the network of modern institutions running on HealthOS.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/login?flow=signUp" className="group inline-flex items-center gap-4 font-black text-lg h-16 px-12 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] active:scale-95">
                    Launch Now
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-slate-200/50 bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 p-2 shadow-sm border border-slate-100">
              <Image src="/favicon.png" alt="HealthOS" width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800 italic">Health<span className="text-blue-600">OS</span></span>
          </div>
          <div className="flex gap-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            <span className="cursor-pointer hover:text-blue-600 transition-colors">Protocol</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors">Security</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors">Cryptography</span>
          </div>
          <div className="text-sm font-bold text-slate-400 tracking-tight">
            © {new Date().getFullYear()} HealthOS. Unified Medical Architecture.
          </div>
        </div>
      </footer>
    </div>
  );
}
