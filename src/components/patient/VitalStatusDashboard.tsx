"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { 
  Activity, Heart, Thermometer, Droplets, Wind, 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  CheckCircle, Clock, ArrowUp, ArrowDown, 
  Brain, Zap, Shield, Target
} from "lucide-react";
import { Spinner, Card, Chip } from "@heroui/react";

interface VitalStatusDashboardProps {
  patientId: Id<"patients">;
}

const VITAL_RANGES = {
  systolic_bp: { min: 90, max: 120, criticalLow: 70, criticalHigh: 180, label: "BP Systolic", unit: "mmHg", icon: Heart },
  diastolic_bp: { min: 60, max: 80, criticalLow: 40, criticalHigh: 120, label: "BP Diastolic", unit: "mmHg", icon: Heart },
  heart_rate: { min: 60, max: 100, criticalLow: 40, criticalHigh: 150, label: "Heart Rate", unit: "bpm", icon: Activity },
  temperature: { min: 36.1, max: 37.2, criticalLow: 35, criticalHigh: 40, label: "Temperature", unit: "°C", icon: Thermometer },
  spo2: { min: 95, max: 100, criticalLow: 85, criticalHigh: 100, label: "SpO2", unit: "%", icon: Droplets },
  respiratory_rate: { min: 12, max: 20, criticalLow: 8, criticalHigh: 30, label: "Respiratory Rate", unit: "/min", icon: Wind },
};

function getVitalStatus(value: number, vitalKey: string): { status: string; color: string; bgColor: string; borderColor: string } {
  const range = VITAL_RANGES[vitalKey as keyof typeof VITAL_RANGES];
  if (!range) return { status: "unknown", color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
  
  if (value <= range.criticalLow || value >= range.criticalHigh) {
    return { status: "critical", color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" };
  }
  if (value < range.min || value > range.max) {
    return { status: "warning", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" };
  }
  return { status: "normal", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" };
}

function getTrendIcon(trend: "up" | "down" | "stable") {
  if (trend === "up") return <ArrowUp size={14} className="text-rose-500" />;
  if (trend === "down") return <ArrowDown size={14} className="text-blue-500" />;
  return <Minus size={14} className="text-gray-400" />;
}

function calculateTrend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const recent = values.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const oldAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const diff = avg - oldAvg;
  if (Math.abs(diff) < 2) return "stable";
  return diff > 0 ? "up" : "down";
}

// Circular Gauge Component
function CircularGauge({ value, min, max, label, unit, icon: Icon, color }: {
  value: number; min: number; max: number; label: string; unit: string; icon: any; color: string;
}) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const status = getVitalStatus(value, label.toLowerCase().replace(" ", "_"));
  
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={16} className={status.color} />
          <span className={`text-lg font-black ${status.color}`}>{value}</span>
          <span className="text-[8px] text-gray-400">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-gray-600 mt-2">{label}</span>
    </div>
  );
}

// Hexagonal Status Indicator
function HexagonIndicator({ value, label, status }: { value: string; label: string; status: "normal" | "warning" | "critical" }) {
  const colors = {
    normal: { fill: "#10b981", stroke: "#059669" },
    warning: { fill: "#f59e0b", stroke: "#d97706" },
    critical: { fill: "#ef4444", stroke: "#dc2626" },
  };
  
  return (
    <div className="flex flex-col items-center p-3">
      <svg width="50" height="50" viewBox="0 0 50 50">
        <polygon
          points="25,2 47,14 47,36 25,48 3,36 3,14"
          fill={colors[status].fill}
          stroke={colors[status].stroke}
          strokeWidth="2"
          className="transition-all duration-500"
        />
        <text x="25" y="28" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
          {value}
        </text>
      </svg>
      <span className="text-[10px] font-bold text-gray-500 mt-1">{label}</span>
    </div>
  );
}

// Diamond Status Card
function DiamondCard({ title, value, unit, status, trend }: {
  title: string; value: number; unit: string; status: string; trend: "up" | "down" | "stable";
}) {
  const statusColors: Record<string, string> = {
    normal: "from-emerald-400 to-emerald-600",
    warning: "from-amber-400 to-amber-600",
    critical: "from-rose-400 to-rose-600",
  };
  
  return (
    <div className="relative p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-1">
          {getTrendIcon(trend)}
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusColors[status] || statusColors.normal}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${status === "critical" ? "text-rose-600" : status === "warning" ? "text-amber-600" : "text-gray-900"}`}>
          {value}
        </span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
      <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${status === "critical" ? "text-rose-500" : status === "warning" ? "text-amber-500" : "text-emerald-500"}`}>
        {status}
      </div>
    </div>
  );
}

// Mini Sparkline Chart
function SparklineChart({ values, color, height = 40 }: { values: number[]; color: string; height?: number }) {
  if (values.length < 2) return null;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 120;
  
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(" ");
  
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#gradient-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
      })}
    </svg>
  );
}

// Overall Health Score Ring
function HealthScoreRing({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#10b981", text: "text-emerald-600" };
    if (s >= 60) return { stroke: "#f59e0b", text: "text-amber-600" };
    return { stroke: "#ef4444", text: "text-rose-600" };
  };
  
  const { stroke, text } = getColor(score);
  
  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black ${text}`}>{score}</span>
        <span className="text-xs text-gray-400 font-bold">/ 100</span>
      </div>
    </div>
  );
}

export function VitalStatusDashboard({ patientId }: VitalStatusDashboardProps) {
  const vitals = useQuery(api.vitals.listByPatient, patientId ? { patient_id: patientId } : "skip");
  const latestVitals = useQuery(api.vitals.getLatestForPatient, patientId ? { patient_id: patientId } : "skip");
  
  if (vitals === undefined || latestVitals === undefined) {
    return (
      <div className="flex items-center gap-3 p-8">
        <Spinner size="lg" />
        <span className="text-sm font-medium text-gray-400">Loading vital status...</span>
      </div>
    );
  }
  
  if (!latestVitals) {
    return (
      <div className="p-8 text-center">
        <Activity size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-400 font-medium">No vitals recorded yet.</p>
      </div>
    );
  }
  
  // Calculate health score based on vitals
  const calculateHealthScore = () => {
    let score = 100;
    const v = latestVitals;
    
    if (v.systolic_bp) {
      if (v.systolic_bp < 90 || v.systolic_bp > 140) score -= 15;
      else if (v.systolic_bp < 100 || v.systolic_bp > 130) score -= 5;
    }
    if (v.heart_rate) {
      if (v.heart_rate < 50 || v.heart_rate > 110) score -= 15;
      else if (v.heart_rate < 60 || v.heart_rate > 100) score -= 5;
    }
    if (v.temperature) {
      if (v.temperature < 36 || v.temperature > 38) score -= 15;
      else if (v.temperature < 36.5 || v.temperature > 37.5) score -= 5;
    }
    if (v.spo2) {
      if (v.spo2 < 90) score -= 20;
      else if (v.spo2 < 95) score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  const healthScore = calculateHealthScore();
  
  // Get trend data
  const sortedVitals = [...vitals].sort((a, b) => a.recorded_at - b.recorded_at).slice(-10);
  const heartRateTrend = sortedVitals.filter(v => v.heart_rate).map(v => v.heart_rate!);
  const bpTrend = sortedVitals.filter(v => v.systolic_bp).map(v => v.systolic_bp!);
  const spo2Trend = sortedVitals.filter(v => v.spo2).map(v => v.spo2!);
  const tempTrend = sortedVitals.filter(v => v.temperature).map(v => v.temperature!);
  
  const v = latestVitals;
  
  return (
    <div className="space-y-6">
      {/* Health Score Header */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <HealthScoreRing score={healthScore} />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-gray-900 mb-2">Overall Health Status</h3>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Chip 
                size="sm" 
                color={healthScore >= 80 ? "success" : healthScore >= 60 ? "warning" : "danger"}
                variant="soft"
                className="font-bold"
              >
                {healthScore >= 80 ? "Stable" : healthScore >= 60 ? "Monitor" : "Attention Needed"}
              </Chip>
              <Chip size="sm" variant="soft" className="font-bold bg-gray-100">
                <Clock size={12} />
                Last updated: {new Date(latestVitals.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Chip>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Based on {vitals.length} vital sign recordings
            </p>
          </div>
        </div>
      </div>
      
      {/* Circular Gauges */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Target size={16} className="text-blue-500" />
          Vital Signs Overview
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {v.heart_rate && (
            <CircularGauge value={v.heart_rate} min={40} max={150} label="Heart Rate" unit="bpm" icon={Activity} color="#3b82f6" />
          )}
          {v.systolic_bp && (
            <CircularGauge value={v.systolic_bp} min={60} max={200} label="Systolic" unit="mmHg" icon={Heart} color="#ef4444" />
          )}
          {v.temperature && (
            <CircularGauge value={v.temperature} min={34} max={42} label="Temp" unit="°C" icon={Thermometer} color="#f59e0b" />
          )}
          {v.spo2 && (
            <CircularGauge value={v.spo2} min={70} max={100} label="SpO2" unit="%" icon={Droplets} color="#10b981" />
          )}
          {v.respiratory_rate && (
            <CircularGauge value={v.respiratory_rate} min={5} max={35} label="Resp Rate" unit="/min" icon={Wind} color="#8b5cf6" />
          )}
          {v.weight && (
            <CircularGauge value={v.weight} min={30} max={150} label="Weight" unit="kg" icon={Shield} color="#06b6d4" />
          )}
        </div>
      </div>
      
      {/* Status Indicators with Hexagons */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          Status Indicators
        </h4>
        <div className="flex flex-wrap justify-center gap-4">
          {v.heart_rate && (
            <HexagonIndicator 
              value={v.heart_rate > 100 ? "↑" : v.heart_rate < 60 ? "↓" : "✓"} 
              label="Heart Rate" 
              status={getVitalStatus(v.heart_rate, "heart_rate").status as "normal" | "warning" | "critical"} 
            />
          )}
          {v.systolic_bp && (
            <HexagonIndicator 
              value={v.systolic_bp > 120 ? "↑" : v.systolic_bp < 90 ? "↓" : "✓"} 
              label="Blood Pressure" 
              status={getVitalStatus(v.systolic_bp, "systolic_bp").status as "normal" | "warning" | "critical"} 
            />
          )}
          {v.spo2 && (
            <HexagonIndicator 
              value={v.spo2 < 95 ? "!" : "✓"} 
              label="Oxygen" 
              status={getVitalStatus(v.spo2, "spo2").status as "normal" | "warning" | "critical"} 
            />
          )}
          {v.temperature && (
            <HexagonIndicator 
              value={v.temperature > 37.2 ? "↑" : v.temperature < 36.1 ? "↓" : "✓"} 
              label="Temperature" 
              status={getVitalStatus(v.temperature, "temperature").status as "normal" | "warning" | "critical"} 
            />
          )}
        </div>
      </div>
      
      {/* Diamond Cards with Trends */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {v.heart_rate && (
          <DiamondCard 
            title="Heart Rate" 
            value={v.heart_rate} 
            unit="bpm" 
            status={getVitalStatus(v.heart_rate, "heart_rate").status}
            trend={calculateTrend(heartRateTrend)}
          />
        )}
        {v.systolic_bp && (
          <DiamondCard 
            title="Blood Pressure" 
            value={v.systolic_bp} 
            unit="mmHg" 
            status={getVitalStatus(v.systolic_bp, "systolic_bp").status}
            trend={calculateTrend(bpTrend)}
          />
        )}
        {v.spo2 && (
          <DiamondCard 
            title="SpO2" 
            value={v.spo2} 
            unit="%" 
            status={getVitalStatus(v.spo2, "spo2").status}
            trend={calculateTrend(spo2Trend)}
          />
        )}
        {v.temperature && (
          <DiamondCard 
            title="Temperature" 
            value={v.temperature} 
            unit="°C" 
            status={getVitalStatus(v.temperature, "temperature").status}
            trend={calculateTrend(tempTrend)}
          />
        )}
      </div>
      
      {/* Sparkline Trends */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Brain size={16} className="text-purple-500" />
          Trend Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {heartRateTrend.length > 1 && (
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700">Heart Rate Trend</span>
                {getTrendIcon(calculateTrend(heartRateTrend))}
              </div>
              <SparklineChart values={heartRateTrend} color="#3b82f6" />
            </div>
          )}
          {bpTrend.length > 1 && (
            <div className="p-3 bg-rose-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-700">Blood Pressure Trend</span>
                {getTrendIcon(calculateTrend(bpTrend))}
              </div>
              <SparklineChart values={bpTrend} color="#ef4444" />
            </div>
          )}
          {spo2Trend.length > 1 && (
            <div className="p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700">SpO2 Trend</span>
                {getTrendIcon(calculateTrend(spo2Trend))}
              </div>
              <SparklineChart values={spo2Trend} color="#10b981" />
            </div>
          )}
          {tempTrend.length > 1 && (
            <div className="p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-700">Temperature Trend</span>
                {getTrendIcon(calculateTrend(tempTrend))}
              </div>
              <SparklineChart values={tempTrend} color="#f59e0b" />
            </div>
          )}
        </div>
      </div>
      
      {/* Alerts Section */}
      {(getVitalStatus(v.heart_rate ?? 0, "heart_rate").status === "critical" ||
        getVitalStatus(v.systolic_bp ?? 0, "systolic_bp").status === "critical" ||
        getVitalStatus(v.spo2 ?? 0, "spo2").status === "critical" ||
        getVitalStatus(v.temperature ?? 0, "temperature").status === "critical") && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-rose-500 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-bold text-rose-800">Critical Vital Alert</h4>
              <p className="text-sm text-rose-600 mt-1">
                One or more vital signs are in the critical range. Immediate medical attention may be required.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {v.heart_rate && getVitalStatus(v.heart_rate, "heart_rate").status === "critical" && (
                  <Chip size="sm" color="danger" variant="soft">Heart Rate: {v.heart_rate} bpm</Chip>
                )}
                {v.systolic_bp && getVitalStatus(v.systolic_bp, "systolic_bp").status === "critical" && (
                  <Chip size="sm" color="danger" variant="soft">BP: {v.systolic_bp}/{v.diastolic_bp} mmHg</Chip>
                )}
                {v.spo2 && getVitalStatus(v.spo2, "spo2").status === "critical" && (
                  <Chip size="sm" color="danger" variant="soft">SpO2: {v.spo2}%</Chip>
                )}
                {v.temperature && getVitalStatus(v.temperature, "temperature").status === "critical" && (
                  <Chip size="sm" color="danger" variant="soft">Temp: {v.temperature}°C</Chip>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
