/**
 * Navigation Analytics Module
 * 
 * Captures navigation patterns, user journeys, and engagement metrics
 * throughout the HealthOS application.
 * 
 * Events tracked:
 * - page_view: When a user navigates to a new page
 * - back_navigation: When user uses back button
 * - section_switch: When user switches between major sections
 * - breadcrumb_click: When user clicks a breadcrumb link
 * - mobile_nav_click: When user clicks mobile bottom nav
 * - keyboard_nav: When user uses keyboard shortcuts
 * - navigation_error: When navigation fails or encounters issues
 */

export interface NavigationEvent {
  event: string;
  timestamp: number;
  from: string;
  to: string;
  metadata: Record<string, string | number | boolean>;
}

// Analytics callback type
type NavigationAnalyticsHandler = (event: NavigationEvent) => void;

const handlers: NavigationAnalyticsHandler[] = [];

/**
 * Register an analytics handler
 * @returns Unsubscribe function
 */
export function registerAnalyticsHandler(handler: NavigationAnalyticsHandler): () => void {
  handlers.push(handler);
  return () => {
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  };
}

/**
 * Emit a navigation event
 */
export function emitNavigationEvent(
  event: string,
  from: string,
  to: string,
  metadata: Record<string, string | number | boolean> = {}
): void {
  const navigationEvent: NavigationEvent = {
    event,
    timestamp: Date.now(),
    from,
    to,
    metadata: {
      ...metadata,
      timestamp: Date.now(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    },
  };

  handlers.forEach((handler) => {
    try {
      handler(navigationEvent);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Navigation analytics handler error:", e);
    }
  });
}

/**
 * Track page view
 */
export function trackPageView(from: string, to: string, source?: string): void {
  emitNavigationEvent("page_view", from, to, { source: source || "navigation" });
}

/**
 * Track back navigation
 */
export function trackBackNavigation(from: string, to: string): void {
  emitNavigationEvent("back_navigation", from, to, { method: "back_button" });
}

/**
 * Track section switch
 */
export function trackSectionSwitch(from: string, to: string): void {
  emitNavigationEvent("section_switch", from, to, { is_cross_section: true });
}

/**
 * Track breadcrumb click
 */
export function trackBreadcrumbClick(from: string, to: string, label: string): void {
  emitNavigationEvent("breadcrumb_click", from, to, { breadcrumb_label: label });
}

/**
 * Track mobile nav click
 */
export function trackMobileNavClick(from: string, to: string, label: string): void {
  emitNavigationEvent("mobile_nav_click", from, to, { nav_label: label });
}

/**
 * Track keyboard navigation
 */
export function trackKeyboardNavigation(from: string, to: string, shortcut: string): void {
  emitNavigationEvent("keyboard_nav", from, to, { shortcut });
}

/**
 * Track navigation error
 */
export function trackNavigationError(from: string, to: string, error: string): void {
  emitNavigationEvent("navigation_error", from, to, { error_message: error });
}

/**
 * Export analytics data (for sending to external service)
 */
export function getNavigationSummary(): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  topDestinations: Array<{ path: string; count: number }>;
  topSources: Array<{ path: string; count: number }>;
} {
  // This is a placeholder - in production, you'd track events in a store
  return {
    totalEvents: 0,
    eventsByType: {},
    topDestinations: [],
    topSources: [],
  };
}
