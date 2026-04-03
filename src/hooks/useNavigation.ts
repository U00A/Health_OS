"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";

// Navigation history stack for SPA back-navigation
interface NavigationState {
  history: string[];
  currentIndex: number;
}

// Global navigation state (shared across components)
let navigationState: NavigationState = {
  history: [],
  currentIndex: -1,
};

// Analytics callback registry
type NavigationAnalyticsCallback = (
  from: string,
  to: string,
  metadata: {
    duration: number;
    source: string;
    timestamp: number;
  }
) => void;

const analyticsCallbacks: NavigationAnalyticsCallback[] = [];

// Register analytics callback
export function registerNavigationAnalytics(
  callback: NavigationAnalyticsCallback
): () => void {
  analyticsCallbacks.push(callback);
  return () => {
    const index = analyticsCallbacks.indexOf(callback);
    if (index > -1) analyticsCallbacks.splice(index, 1);
  };
}

function emitNavigationAnalytics(
  from: string,
  to: string,
  metadata: {
    duration: number;
    source: string;
    timestamp: number;
  }
): void {
  analyticsCallbacks.forEach((callback) => {
    try {
      callback(from, to, metadata);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Analytics callback error:", e);
    }
  });
}

/*
 * Get the default back route based on current pathname.
 * Routes are organized by section prefix.
 */
export function getDefaultBackRoute(currentPath: string): string {
  const segments = currentPath.split("/").filter(Boolean);

  // Deep pages -> their parent section
  if (segments.length >= 4) {
    return `/${segments.slice(0, 3).join("/")}`;
  }

  // Section pages (e.g. /pharmacy/inventory) -> section root
  if (segments.length >= 3) {
    return `/${segments.slice(0, 2).join("/")}`;
  }

  // Section roots -> home
  if (segments.length >= 2) {
    const section = segments[0];
    const sectionRoots = [
      "admin",
      "doctor",
      "private",
      "staff",
      "pharmacy",
      "lab",
      "patient-portal",
    ];
    if (sectionRoots.includes(section)) {
      return "/";
    }
  }

  return "/";
}

/*
 * Hook: useNavigation
 * Provides push/replace/back with history management and analytics.
 */
export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Push navigation with history tracking
  const push = useCallback(
    (href: string, metadata?: { source?: string }) => {
      const from = pathname || "/";

      // Update internal history
      navigationState.history.push(from);
      navigationState.currentIndex = navigationState.history.length - 1;

      emitNavigationAnalytics(from, href, {
        duration: 0,
        source: metadata?.source || "app",
        timestamp: Date.now(),
      });

      router.push(href);
    },
    [pathname, router]
  );

  // Replace current entry in history
  const replace = useCallback(
    (href: string, metadata?: { source?: string }) => {
      const from = pathname || "/";

      if (navigationState.currentIndex >= 0) {
        navigationState.history[navigationState.currentIndex] = href;
      }

      emitNavigationAnalytics(from, href, {
        duration: 0,
        source: metadata?.source || "app",
        timestamp: Date.now(),
      });

      router.replace(href);
    },
    [pathname, router]
  );

  // Back navigation with custom history support
  const back = useCallback(() => {
    if (navigationState.currentIndex > 0) {
      navigationState.currentIndex--;
      const previousPath = navigationState.history[navigationState.currentIndex];
      router.push(previousPath);
    } else {
      // Fallback to default back route
      const defaultBack = getDefaultBackRoute(pathname || "/");
      router.push(defaultBack);
    }
  }, [pathname, router]);

  // Can go back?
  const canGoBack = navigationState.currentIndex > 0;

  // Get default back route for current page
  const getBackRoute = useCallback(() => {
    return getDefaultBackRoute(pathname || "/");
  }, [pathname]);

  // Navigate to home
  const goHome = useCallback(() => {
    push("/", { source: "home-button" });
  }, [push]);

  // Navigate to section root
  const goSectionHome = useCallback(() => {
    const segments = (pathname || "/").split("/").filter(Boolean);
    if (segments.length >= 1) {
      push(`/${segments[0]}`, { source: "section-home" });
    } else {
      push("/", { source: "section-home" });
    }
  }, [pathname, push]);

  return {
    push,
    replace,
    back,
    canGoBack,
    getBackRoute,
    goHome,
    goSectionHome,
    currentPath: pathname || "/",
  };
}

/*
 * Hook: useBackHistory
 * Manually track browser history for SPA navigation.
 */
export function useBackHistory() {
  const router = useRouter();
  const pathname = usePathname();

  // Track navigation in history
  useEffect(() => {
    // Skip initial load
    if (navigationState.history.length === 0 ||
        navigationState.history[navigationState.history.length - 1] !== pathname) {
      navigationState.history.push(pathname || "/");
      navigationState.currentIndex = navigationState.history.length - 1;
    }
  }, [pathname]);

  // Get the URL we'd navigate back to without actually navigating
  const getBackUrl = useCallback(() => {
    if (navigationState.currentIndex > 0) {
      return navigationState.history[navigationState.currentIndex - 1];
    }
    return getDefaultBackRoute(pathname || "/");
  }, [pathname]);

  // Navigate to a specific position in history
  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < navigationState.history.length) {
        navigationState.currentIndex = index;
        router.push(navigationState.history[index]);
      }
    },
    [router]
  );

  // Clear navigation history (useful after login)
  const clearHistory = useCallback(() => {
    navigationState = {
      history: [pathname || "/"],
      currentIndex: 0,
    };
  }, [pathname]);

  return {
    backUrl: getBackUrl(),
    canGoBack: navigationState.currentIndex > 0,
    goTo,
    clearHistory,
    historyLength: navigationState.history.length,
  };
}

/*
 * Get section information for breadcrumb/section navigation
 */
export function useSectionInfo() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];

  const sectionMap: Record<string, { label: string; root: string; color: string }> = {
    admin: { label: "Admin Console", root: "/admin", color: "text-slate-900" },
    doctor: { label: "Doctor Portal", root: "/doctor", color: "text-blue-600" },
    private: { label: "Private Practice", root: "/private", color: "text-teal-500" },
    staff: { label: "Ward Operations", root: "/staff", color: "text-sky-500" },
    pharmacy: { label: "Dispensary", root: "/pharmacy", color: "text-emerald-500" },
    lab: { label: "Laboratory", root: "/lab", color: "text-violet-600" },
    "patient-portal": { label: "Patient Portal", root: "/patient-portal", color: "text-indigo-600" },
  };

  const currentSection = segments[0] ? sectionMap[segments[0]] : null;

  return {
    section: currentSection,
    sectionName: currentSection?.label || "HealthOS",
    sectionRoot: currentSection?.root || "/",
    sectionColor: currentSection?.color || "text-blue-600",
    breadcrumbs: buildBreadcrumbs(pathname || "/", segments),
  };
}

function buildBreadcrumbs(pathname: string, segments: string[]) {
  const breadcrumbs: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];

  let accumulatedPath = "";
  for (const segment of segments) {
    accumulatedPath += `/${segment}`;
    breadcrumbs.push({
      label: formatSegment(segment),
      href: accumulatedPath,
    });
  }

  return breadcrumbs;
}

function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}