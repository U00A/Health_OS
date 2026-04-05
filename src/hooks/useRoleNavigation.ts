"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useBetterAuthId } from "./useBetterAuthId";
import {
  UserRole,
  ROLE_NAVIGATION,
  ROLE_MOBILE_NAV,
  ROLE_COLORS,
  ROLE_TITLES,
  canAccessRole,
} from "@/lib/navigation-config";

/**
 * Hook to get user's role and role-filtered navigation items.
 * Automatically filters navigation based on authenticated user's role.
 */
export function useRoleNavigation() {
  const authId = useBetterAuthId();
  
  // Fetch user from Convex to get role
  const user = useQuery(
    api.users.current,
    authId ? { betterAuthId: authId } : "skip"
  );

  const role = (user?.role || "patient") as UserRole;

  const sections = useMemo(() => {
    return ROLE_NAVIGATION[role] || [];
  }, [role]);

  const mobileItems = useMemo(() => {
    return ROLE_MOBILE_NAV[role] || [];
  }, [role]);

  const roleColor = ROLE_COLORS[role] || "bg-blue-600";
  const roleTitle = ROLE_TITLES[role] || "HealthOS";

  // Check if user can access a specific path
  const canAccess = (path: string) => canAccessRole(role, path);

  return {
    role,
    sections,
    mobileItems,
    roleColor,
    roleTitle,
    canAccess,
    isLoading: !user,
  };
}