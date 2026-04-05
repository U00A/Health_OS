"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Spinner } from "@heroui/react";

interface VitalsTrendChartProps {
  patientId: Id<"patients">;
  metric: "systolic_bp" | "diastolic_bp" | "heart_rate" | "temperature" | "spo2" | "respiratory_rate" | "weight";
  unit: string;
  label: string;
  normalRange: [number, number];
  criticalRange?: [number, number];
  maxPoints?: number;
  patientAge?: number;
  patientSex?: "male" | "female";
}

export function VitalsTrendChart({
  patientId,
  metric,
  unit,
  label,
  normalRange,
  criticalRange,
  maxPoints = 20,
  patientAge,
  patientSex,
}: VitalsTrendChartProps) {
  const vitals = useQuery(api.vitals.listByPatient, patientId ? { patient_id: patientId } : "skip");

  if (vitals === undefined) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Spinner size="sm" />
        <span className="text-xs font-medium text-slate-400">Loading trend data...</span>
      </div>
    );
  }

  // Demographic-adjusted reference ranges based on age and sex
  const getAdjustedRange = (base: [number, number]): [number, number] => {
    let adjusted = [...base] as [number, number];
    // Age adjustments
    if (metric === "systolic_bp" && patientAge && patientAge > 60) {
      adjusted = [base[0] + 10, base[1] + 20]; // Elderly have higher normal BP
    }
    if (metric === "heart_rate" && patientAge && patientAge < 12) {
      adjusted = [base[0] + 20, base[1] + 30]; // Children have higher HR
    }
    // Sex adjustments
    if (metric === "temperature" && patientSex === "female") {
      adjusted = [base[0] + 0.2, base[1] + 0.3]; // Slightly higher for females
    }
    return adjusted;
  };

  const adjustedNormalRange = getAdjustedRange(normalRange);

  // Filter and sort vitals with the specified metric
  const sortedVitals = vitals
    .filter((v) => v[metric] !== null && v[metric] !== undefined)
    .sort((a, b) => a.recorded_at - b.recorded_at)
    .slice(-maxPoints);

  if (sortedVitals.length === 0) {
    return (
      <div className="text-center p-4 text-slate-400 text-sm">
        No {label.toLowerCase()} data recorded yet.
      </div>
    );
  }

  const values = sortedVitals.map((v) => v[metric] as number);
  const times = sortedVitals.map((v) => new Date(v.recorded_at));

  // Calculate chart bounds
  const allValues = [...values, ...normalRange];
  if (criticalRange) allValues.push(...criticalRange);
  const minVal = Math.floor(Math.min(...allValues) - 5);
  const maxVal = Math.ceil(Math.max(...allValues) + 5);

  const chartWidth = 100; // percentage
  const chartHeight = 120;

  const scaleY = (val: number) => {
    return chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  const scaleX = (index: number) => {
    return (index / (sortedVitals.length - 1 || 1)) * chartWidth;
  };

  // Build path
  const pathData = values
    .map((val, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(val)}`)
    .join(" ");

  // Determine trend
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const trend = lastValue > firstValue ? "up" : lastValue < firstValue ? "down" : "stable";

  // Check latest value status
  const isCritical = criticalRange
    ? lastValue < criticalRange[0] || lastValue > criticalRange[1]
    : lastValue < normalRange[0] || lastValue > normalRange[1];
  const isWarning = lastValue < normalRange[0] || lastValue > normalRange[1];

  const statusColor = isCritical
    ? "text-rose-600"
    : isWarning
    ? "text-amber-600"
    : "text-emerald-600";

  const trendIcon = trend === "up" ? <TrendingUp size={16} /> : trend === "down" ? <TrendingDown size={16} /> : <Minus size={16} />;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-black font-mono text-lg ${statusColor}`}>
            {lastValue}{unit}
          </span>
          <span className="text-slate-400">{trendIcon}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50/50">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
          className="w-full h-28"
          preserveAspectRatio="none"
        >
          {/* Normal range band */}
          <rect
            x="0"
            y={scaleY(normalRange[1])}
            width={chartWidth}
            height={scaleY(normalRange[0]) - scaleY(normalRange[1])}
            fill="#10b981"
            opacity="0.1"
          />

          {/* Critical range bands (if specified) */}
          {criticalRange && (
            <>
              <rect
                x="0"
                y={scaleY(criticalRange[1])}
                width={chartWidth}
                height={scaleY(criticalRange[0]) - scaleY(criticalRange[1])}
                fill="#ef4444"
                opacity="0.05"
              />
            </>
          )}

          {/* Grid lines */}
          {[normalRange[0], normalRange[1]].map((val, i) => (
            <g key={i}>
              <line
                x1="0"
                y1={scaleY(val)}
                x2={chartWidth}
                y2={scaleY(val)}
                stroke="#10b981"
                strokeWidth="0.3"
                strokeDasharray="2,2"
              />
              <text
                x={chartWidth + 1}
                y={scaleY(val) + 1}
                fontSize="4"
                fill="#94a3b8"
                textAnchor="start"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Data line */}
          <path
            d={pathData}
            fill="none"
            stroke={isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#3b82f6"}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {values.map((val, i) => (
            <circle
              key={i}
              cx={scaleX(i)}
              cy={scaleY(val)}
              r="1.2"
              fill={isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#3b82f6"}
            />
          ))}
        </svg>

        {/* Time labels */}
        <div className="flex justify-between text-[8px] text-slate-400 mt-1">
          <span>{times[0]?.toLocaleDateString()}</span>
          <span>{times[times.length - 1]?.toLocaleDateString()}</span>
        </div>

        {/* Range label */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded opacity-20" />
            <span>Normal: {normalRange[0]}-{normalRange[1]}{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}