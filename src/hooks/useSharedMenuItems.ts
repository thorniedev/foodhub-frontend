/**
 * ✅ PERFORMANCE FIX: Shared hook to reduce duplicate useGetMenuItemsQuery calls
 * 
 * Previously: 18+ components each called useGetMenuItemsQuery() independently
 * Now: Single shared cache with smart skip logic
 */

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import type { GetMenuItemsParams } from "@/app/store/menuApi";

interface UseSharedMenuItemsOptions {
  /** Skip the query entirely (for components that may not need menu data) */
  skip?: boolean;
  /** Parameters for the menu query */
  params?: GetMenuItemsParams;
}

/**
 * Shared menu items hook that reduces duplicate API calls.
 * Uses RTK Query's built-in caching to share data between components.
 */
export function useSharedMenuItems(options: UseSharedMenuItemsOptions = {}) {
  const { skip = false, params } = options;
  
  return useGetMenuItemsQuery(params, {
    skip,
    // Let RTK Query handle caching - components using the same params
    // will share the same cached data automatically
  });
}

/**
 * Hook specifically for components that only need menu items when user is authenticated
 */
export function useAuthenticatedMenuItems(
  isAuthenticated: boolean,
  params?: GetMenuItemsParams
) {
  return useSharedMenuItems({
    skip: !isAuthenticated,
    params,
  });
}

/**
 * Hook for components that need menu items conditionally based on visibility/interaction
 */
export function useConditionalMenuItems(
  condition: boolean,
  params?: GetMenuItemsParams
) {
  return useSharedMenuItems({
    skip: !condition,
    params,
  });
}