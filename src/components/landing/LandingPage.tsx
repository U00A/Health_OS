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
  Sparkles,
  Users,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

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
    description: "Comprehensive patient management with rich-text clinical reports, real-time history, and diagnostic support.",
    icon: Stethoscope,
    gradient: "from-blue-600 to-blue-700",
    shadow: "shadow-blue-200",
    link: "/doctor",
  },
  {
    title: "Medical Staff",
    description: "Real-time bed grid management, admission flows, and shift coordination for hospital operations.",
    icon: BedDouble,
    gradient: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-200",
    link: "/staff",
  },
  {
    title: "Pharmacists",
    description: "Automated prescription verification and secure, immutable dispense tracking system.",
    icon: Pill,
    gradient: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-200",
    link: "/pharmacy",
  },
  {
    title: "Lab Techs",
    description: "Integrated order queue, structured analysis pipelines, and result upload workflows.",
    icon: Microscope,
    gradient: "from-violet-500 to-indigo-600",
    shadow: "shadow-violet-200",
    link: "/lab",
  },
  {
    title: "Patients",
    description: "Personal health records portal with secure access to prescriptions, lab results, and clinical history.",
    icon: UserRound,
    gradient: "from-slate-600 to-slate-800",
    shadow: "shadow-slate-200",
    link: "/patient-portal",
  },
  {
    title: "Private Care",
    description: "Isolated high-security workspace for private practitioners with dedicated patient management.",
    icon: ShieldCheck,
    gradient: "from-teal-500 to-cyan-600",
    shadow: "shadow-teal-200",
    link: "/private",
  },
];

// We will dynamically construct these inside the component using real data
// but we keep the structure available in case needed.

const features = [
  {
    title: "Real-Time Sync",
    description: "Every change propagates instantly across all connected clinical interfaces via WebSocket.",
    icon: Zap,
  },
  {
    title: "Immutable Audit Trail",
    description: "Cryptographically signed append-only logs ensure medical history can never be altered.",
    icon: ShieldCheck,
  },
  {
    title: "Role-Gated Access",
    description: "Six specialized interfaces with strict data isolation between hospital departments.",
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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════ */
function StatCard({ stat }: { stat: { label: string; value: number; prefix?: string; suffix?: string; icon: React.ComponentType<{ className?: string }> } }) {
  const { value: count, ref: cardRef } = useCounter(stat.value, 2000);
  const displayValue = String(count);
  return (
    <div ref={cardRef} key={stat.label}>
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-slate-100 text-center hover:shadow-xl hover:shadow-slate-100 transition-all hover:-translate-y-1 group"
      >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform border border-blue-100/50">
        <stat.icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2 tracking-tight font-mono">
        {stat.prefix}{displayValue}{stat.suffix}
      </div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        {stat.label}
      </div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const liveStats = useQuery(api.stats.getLandingStats);
  
  const dynamicStats = [
    { label: "Active Users", value: liveStats?.totalUsers || 0, icon: Users },
    { label: "Registered Patients", value: liveStats?.totalPatients || 0, icon: UserRound },
    { label: "Partner Hospitals", value: liveStats?.totalHospitals || 0, icon: Building2 },
    { label: "Active Admissions", value: liveStats?.activeAdmissions || 0, icon: BedDouble },
  ];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const mockupScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="flex flex-col w-full bg-white text-slate-900 selection:bg-blue-100">

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm shadow-slate-100 border-b border-slate-100"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Health<span className="text-blue-600">OS</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="#platform" className="hover:text-blue-600 transition-colors">Platform</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login?flow=signIn" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors hidden sm:block px-4 py-2">
              Log In
            </Link>
            <Link
              href="/login?flow=signUp"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} id="platform" className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Ambient Blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[15%] w-[80%] h-[80%] rounded-full bg-blue-100/30 blur-[120px]" />
          <div className="absolute bottom-[0%] -left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-100/30 blur-[120px]" />
          <div className="absolute top-[20%] left-[40%] w-[30%] h-[30%] rounded-full bg-violet-100/20 blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10 w-full">
          {/* Left — Copy */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-widest uppercase mb-8 border border-blue-100">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Hospital Architecture
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.92] mb-8 text-slate-900">
                The OS for{" "}
                <span className="text-gradient">Modern Medicine.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg lg:text-xl text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
                Unified clinical workflows, real-time hospital synchronization, and immutable patient records built for the Algerian healthcare future.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
                <Link
                  href="/login?flow=signUp"
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-1 transition-all flex items-center gap-3 text-base"
                >
                  Start Your Registry
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                        <UserRound className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-slate-400 leading-tight">
                    Trusted by<br /><span className="text-slate-900">500+ Institutions</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right — Dashboard Mockup */}
          <motion.div style={{ y: mockupY, scale: mockupScale }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }}
            >
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] lg:rounded-[3rem] p-4 lg:p-6 relative overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200/50">
                <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm p-6 lg:p-8 border border-slate-100 relative overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8 lg:mb-10">
                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-100">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-28 h-3 bg-slate-900 rounded-full" />
                        <div className="w-16 h-2 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-4 lg:space-y-5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                        className="flex gap-4 items-center p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          i === 0 ? "bg-blue-50" : i === 1 ? "bg-emerald-50" : "bg-violet-50"
                        }`}>
                          <HeartPulse className={`w-5 h-5 ${
                            i === 0 ? "text-blue-600" : i === 1 ? "text-emerald-600" : "text-violet-600"
                          }`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="w-2/3 h-3 bg-slate-900/[0.06] rounded-full" />
                          <div className="w-1/2 h-2 bg-slate-100 rounded-full" />
                        </div>
                        <div className={`w-16 h-6 rounded-full ${
                          i === 0 ? "bg-emerald-50" : i === 1 ? "bg-blue-50" : "bg-amber-50"
                        }`} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Floating Card */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-2 -right-2 lg:bottom-4 lg:right-4 bg-white shadow-2xl rounded-2xl p-4 border border-slate-100 flex items-center gap-3 z-20"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live Traffic</div>
                      <div className="text-base font-black text-slate-900 font-mono tracking-tight">{liveStats ? liveStats.totalUsers : "..."} Active</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-slate-200 flex justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-slate-300" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FEATURES STRIP ═══ */}
      <section className="py-20 px-6 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8 lg:gap-12"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SOLUTIONS GRID ═══ */}
      <section id="solutions" className="py-28 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 lg:mb-24 gap-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 border border-blue-100">
                Interfaces
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-5 leading-[0.92]">
                Built for the<br /><span className="text-gradient">Whole Team.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
                Six specialized, real-time interfaces optimized for every hospital department.
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href="/login?flow=signUp"
                className="bg-slate-900 text-white font-bold h-14 px-10 rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm"
              >
                Get Access <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {roles.map((role) => (
              <motion.div key={role.title} variants={fadeUp}>
                <Link href={role.link} className="group block h-full">
                  <div className="p-8 lg:p-10 bg-white rounded-[2rem] border border-slate-100 hover:border-slate-200 transition-all hover:shadow-xl hover:shadow-slate-100 flex flex-col h-full relative overflow-hidden">
                    {/* Gradient Glow on Hover */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.06] blur-3xl transition-opacity duration-500`} />

                    <div className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-7 shadow-lg ${role.shadow} group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-slate-900 tracking-tight">{role.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8 text-[15px] flex-grow">
                      {role.description}
                    </p>
                    <div className="inline-flex items-center gap-2 font-bold text-blue-600 text-sm group-hover:gap-3 transition-all">
                      Launch Interface
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS & SECURITY ═══ */}
      <section id="security" className="py-28 lg:py-40 px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-20 lg:mb-28"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-8 leading-[0.92]">
              Clinical Data you<br />can <span className="text-gradient italic">actually</span> trust.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg lg:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Every action is cryptographically signed. Every report is immutable. HealthOS ensures medical history can never be altered or lost.
            </motion.p>
          </motion.div>

          {/* Stat Cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {dynamicStats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="px-6 pb-28 lg:pb-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-[2.5rem] lg:rounded-[3.5rem] p-12 md:p-20 lg:p-28 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.07] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/[0.07] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-12 right-16 opacity-[0.04]">
            <HeartPulse className="w-48 h-48 text-white" strokeWidth={0.5} />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-10 leading-[0.92]">
              Modernize your<br />Clinical Node.
            </h2>
            <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto mb-12 leading-relaxed">
              Join 500+ healthcare institutions already running on HealthOS infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login?flow=signUp"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold h-16 px-12 rounded-2xl shadow-2xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg"
              >
                Start Free Registry
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login?flow=signIn"
                className="border border-slate-700 text-white font-bold h-16 px-12 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-lg"
              >
                Enterprise Login
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 lg:py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">Health<span className="text-blue-600">OS</span></span>
          </div>
          <div className="flex gap-10 text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em]">
            <a href="#security" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Compliance</a>
          </div>
          <div className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">
            &copy; 2026 HealthOS Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}