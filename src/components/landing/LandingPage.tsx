"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Microscope,
  Pill,
  BedDouble,
  UserRound,
  ArrowRight,
  HeartPulse,
  LayoutDashboard,
  Lock,
  Zap,
  ChevronRight,
  Users,
  Building2,
  Globe,
  Database
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import dynamic from 'next/dynamic';

const InteractiveBackground = dynamic(() => import('./InteractiveBackground'), { ssr: false });

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
    description: "Rich-text clinical reports, AI-assisted diagnostics, and real-time history.",
    icon: Stethoscope,
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-900/50",
    link: "/doctor",
  },
  {
    title: "Medical Staff",
    description: "Bed grid management and real-time admission tracking flows.",
    icon: BedDouble,
    gradient: "from-sky-500 to-cyan-600",
    shadow: "shadow-sky-900/50",
    link: "/staff",
  },
  {
    title: "Pharmacists",
    description: "Immutable prescription tracking with automated interaction verification.",
    icon: Pill,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-900/50",
    link: "/pharmacy",
  },
  {
    title: "Lab Techs",
    description: "Automated analysis pipelines and secure, structured result uploads.",
    icon: Microscope,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-900/50",
    link: "/lab",
  },
  {
    title: "Patients",
    description: "Personal health hub with instant access to your clinical history and lab results.",
    icon: UserRound,
    gradient: "from-slate-400 to-slate-600",
    shadow: "shadow-slate-800/50",
    link: "/patient-portal",
  },
  {
    title: "Private Care",
    description: "Isolated, high-security enclave for private practitioners.",
    icon: ShieldCheck,
    gradient: "from-fuchsia-500 to-pink-600",
    shadow: "shadow-fuchsia-900/50",
    link: "/private",
  },
];

const features = [
  {
    title: "Global Reactivity",
    description: "Every change synchronizes instantly across all institutional interfaces.",
    icon: Zap,
  },
  {
    title: "Immutable Architecture",
    description: "Cryptographic logging ensures records can never fade or be manipulated.",
    icon: Database,
  },
  {
    title: "Zero-Trust Isolation",
    description: "Six strict role horizons preventing cross-contamination of sensitive data.",
    icon: Lock,
  },
];

/* ════════════════════════════════════════════════
   Framer Motion Variants
   ════════════════════════════════════════════════ */
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ════════════════════════════════════════════════
   Components
   ════════════════════════════════════════════════ */
function StatCard({ stat }: { stat: { label: string; value: number; prefix?: string; suffix?: string; icon: React.ComponentType<{ className?: string }> } }) {
  const { value: count, ref: cardRef } = useCounter(stat.value, 2000);
  const displayValue = String(count);
  return (
    <div ref={cardRef} key={stat.label}>
      <motion.div
        variants={fadeUp}
        className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 text-center hover:bg-slate-800/60 transition-all hover:-translate-y-1 group hover:border-blue-500/30 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] duration-500"
      >
      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform border border-blue-500/20">
        <stat.icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 shadow-blue-500" />
      </div>
      <div className="text-3xl font-black text-white mb-2 tracking-tight font-mono">
        {stat.prefix}{displayValue}{stat.suffix}
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        {stat.label}
      </div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const liveStats = useQuery(api.stats.getLandingStats);
  
  const dynamicStats = [
    { label: "Active Nodes", value: liveStats?.totalUsers || 0, icon: Users },
    { label: "Secured Records", value: liveStats?.totalPatients || 0, icon: UserRound },
    { label: "Institutions", value: liveStats?.totalHospitals || 0, icon: Building2 },
    { label: "Live Admissions", value: liveStats?.activeAdmissions || 0, icon: BedDouble },
  ];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const mockupScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const mockupRotateX = useTransform(scrollYProgress, [0, 1], [5, 15]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#020617] text-slate-200 selection:bg-blue-500/30 overflow-hidden font-sans">
      
      {/* ═══ ABSOLUTE CANVAS BKG ═══ */}
      <InteractiveBackground />

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#020617]/80 backdrop-blur-2xl shadow-xl shadow-slate-900/50 border-b border-white/5 py-4"
          : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_-5px_rgba(37,99,235,0.6)] group-hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.8)] group-hover:scale-105 transition-all duration-500">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Health<span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">OS</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <a href="#ecosystem" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Ecosystem</a>
            <a href="#architecture" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Architecture</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login?flow=signIn" className="text-[13px] font-bold text-slate-300 hover:text-white transition-colors hidden sm:block px-4">
              SIGN IN
            </Link>
            <Link
              href="/login?flow=signUp"
              className="relative overflow-hidden group bg-white text-slate-950 font-bold text-[13px] px-6 py-2.5 rounded-full hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-all duration-500"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              GET STARTED
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 min-h-screen flex items-center perspective-1000">
        
        {/* Glow Effects */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 w-full">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full flex flex-col items-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="max-w-4xl flex flex-col items-center"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-bold tracking-[0.25em] uppercase mb-8 backdrop-blur-md">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                The Protocol for Modern Healthcare
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 text-white drop-shadow-2xl">
                Operate at the <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                  Speed of Thought.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg lg:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-medium">
                High-performance clinical infrastructure built for zero-latency operations, immutable record-keeping, and unified inter-departmental flows.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  href="/login?flow=signUp"
                  className="group bg-blue-600 text-white font-bold h-14 px-10 rounded-2xl shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.7)] hover:bg-blue-500 transition-all duration-300 flex items-center gap-3 text-sm tracking-wide"
                >
                  INITIALIZE PLATFORM
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center gap-4 border border-white/10 bg-white/5 rounded-2xl h-14 px-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">System Online</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating UI Mockup */}
            <motion.div 
              style={{ scale: mockupScale, rotateX: mockupRotateX }}
              className="mt-20 w-full max-w-5xl mx-auto perspective-[2000px] transform-style-3d hidden sm:block"
            >
              <div className="relative rounded-[2rem] border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                {/* Mockup Topbar */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                
                <div className="p-8 grid grid-cols-12 gap-8 h-[500px]">
                  {/* Sidebar */}
                  <div className="col-span-3 border-r border-white/5 pr-4 space-y-4">
                    <div className="flex items-center gap-3 px-3 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                      <LayoutDashboard className="w-4 h-4" />
                      <div className="text-sm font-bold">Terminal</div>
                    </div>
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 opacity-50">
                        <div className="w-4 h-4 rounded bg-white/10" />
                        <div className="w-20 h-2.5 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Content Area */}
                  <div className="col-span-9 space-y-6 relative">
                    <div className="flex justify-between items-center">
                       <div className="space-y-2">
                         <div className="w-48 h-5 rounded-md bg-white/10" />
                         <div className="w-32 h-3 rounded-md bg-white/5" />
                       </div>
                    </div>
                    
                    {/* Animated Lines */}
                    <div className="space-y-3">
                      {[0,1,2].map(i => (
                        <motion.div 
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 1 + (i * 0.2), duration: 0.8 }}
                          className="w-full h-16 rounded-xl border border-white/5 bg-white/[0.02] flex items-center px-4 gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="w-1/3 h-2 rounded bg-white/20" />
                            <div className="w-1/4 h-2 rounded bg-white/10" />
                          </div>
                          <div className="w-16 h-2 rounded bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
                        </motion.div>
                      ))}
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS MATRIX ═══ */}
      <section id="architecture" className="py-24 px-6 bg-black border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
           <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {dynamicStats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CAPABILITIES (ECOSYSTEM) ═══ */}
      <section id="ecosystem" className="py-32 px-6 relative z-10 bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20 lg:mb-28">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
                Six Specialized <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                   Operating Environments.
                </span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                HealthOS doesn't compromise. Each role features dedicated sub-systems hyper-optimized for their specific workflows and latency requirements.
              </motion.p>
            </motion.div>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {roles.map((role) => (
              <motion.div key={role.title} variants={fadeUp}>
                <Link href={role.link} className="group block h-full">
                  <div className="p-8 lg:p-10 bg-slate-900/30 backdrop-blur-sm rounded-[2rem] border border-white/5 hover:bg-slate-800/40 hover:border-white/10 transition-all duration-500 h-full relative overflow-hidden flex flex-col items-start gap-4">
                    
                    {/* Glowing Accent */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700 pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2`} />

                    <div className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center shadow-lg ${role.shadow} group-hover:scale-110 transition-transform duration-500`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-white tracking-tight mt-2">{role.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium text-[15px] flex-grow">
                      {role.description}
                    </p>
                    
                    <div className="inline-flex items-center gap-2 font-bold text-white text-[11px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all duration-300 mt-4">
                      Initialize <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-6 border-y border-white/5 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-12 lg:gap-16"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 py-32 lg:py-48 relative z-10 bg-black overflow-hidden">
        
        {/* Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-blue-600/20 blur-[150px] pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold tracking-[0.25em] uppercase mb-8">
            <Activity className="w-3.5 h-3.5" />
            Enterprise Readout
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Care is Here.
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
            Deploy the most advanced clinical operating system into your institution today.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/login?flow=signUp"
              className="bg-white text-black font-bold h-14 px-10 rounded-full hover:bg-slate-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase"
            >
              Deploy Node
            </Link>
            <Link
              href="/login?flow=signIn"
              className="bg-transparent border border-white/20 text-white font-bold h-14 px-10 rounded-full hover:bg-white/5 transition-all flex items-center justify-center text-sm tracking-widest uppercase"
            >
              Authentication Context
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 bg-black border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold tracking-tight text-white">Health<span className="text-blue-500">OS</span></span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Protocol</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Registry</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Cryptography</span>
          </div>
          <div className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
            &copy; 2026 HealthOS Arch
          </div>
        </div>
      </footer>
    </div>
  );
}