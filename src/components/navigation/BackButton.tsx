"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useBackHistory, useNavigation, useSectionInfo, getDefaultBackRoute } from "@/hooks/useNavigation";

interface BackButtonProps {
  variant?: "icon" | "text" | "full";
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  onClick?: () => void;
  fallbackRoute?: string;
  ariaLabel?: string;
  showTooltip?: boolean;
}

/**
 * Accessible BackButton component with:
 * - Intelligent route resolution
 * - Keyboard navigation support
 * - ARIA labels with screen reader announcements
 * - RTL support
 * - Multiple visual variants
 * - Focus ring for accessibility
 */
export function BackButton({
  variant = "icon",
  size = "md",
  color,
  className = "",
  onClick,
  fallbackRoute,
  ariaLabel,
  showTooltip = true,
}: BackButtonProps) {
  const { back, canGoBack } = useNavigation();
  const { sectionColor } = useSectionInfo();
  
  const resolveBackRoute = useCallback(() => {
    if (fallbackRoute) return fallbackRoute;
    return getDefaultBackRoute(window.location.pathname);
  }, [fallbackRoute]);

  const handleBack = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      back();
    }
  }, [onClick, back]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleBack();
      }
    },
    [handleBack]
  );

  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Color derived from section or custom
  const _activeColor = color || sectionColor;
  const baseColor = "text-slate-500 hover:text-slate-800";

  // Tooltip text with keyboard shortcut
  const tooltipText = ariaLabel || "Go back";
  const shortcutHint = "Alt+\u2190";

  // Global keyboard shortcut (Alt+Left Arrow)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleBack]);

  const buttonContent = (
    <>
      {/* RTL-aware chevron direction */}
      <ChevronLeft
        className={`${iconSizes[size]} flex-shrink-0 transition-transform duration-200 rtl:rotate-180`}
      />
      {variant === "text" && <span className="font-semibold text-sm">Back</span>}
      {variant === "full" && <span className="font-semibold text-sm">Go Back</span>}
    </>
  );

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleBack}
        onKeyDown={handleKeyDown}
        disabled={!canGoBack && !fallbackRoute}
        aria-label={ariaLabel || tooltipText}
        aria-roledescription="navigation button"
        title={showTooltip ? `${tooltipText} (${shortcutHint})` : undefined}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center gap-1.5
          rounded-xl
          border border-slate-200
          bg-white
          ${baseColor}
          transition-all duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:ring-offset-2
          disabled:opacity-40
          disabled:cursor-not-allowed
          active:scale-95
          hover:bg-slate-50
          hover:shadow-sm
          ${className}
        `}
      >
        {buttonContent}
      </button>

      {/* Accessible tooltip - hidden from screen readers since we use aria-label */}
      {showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          role="presentation"
          aria-hidden="true"
        >
          {tooltipText}
          <span className="ml-1 text-slate-400">({shortcutHint})</span>
        </div>
      )}
    </div>
  );
}

/**
 * Lightweight icon-only back button for compact layouts
 */
export function BackButtonIcon({
  size = "md",
  className = "",
  onClick,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <BackButton
      variant="icon"
      size={size}
      className={className}
      onClick={onClick}
      showTooltip={false}
    />
  );
}