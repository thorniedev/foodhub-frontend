import type { CatalogMenuItem } from "@/types/catalog-menu-item";

/**
 * The detail page uses the same menu-item data structure.
 * Keeping this alias means you do not maintain two conflicting copies.
 */
export type CatalogMenuItemDetail = CatalogMenuItem;

export interface CatalogMenuItemDetailResponse {
  status: number;
  message: string;
  payload: CatalogMenuItemDetail;
  timestamp: string;
}

export interface GetCatalogMenuItemDetailParams {
  uuid: string;

  /**
   * Optional recommendation context.
   */
  sessionUuid?: string;

  /**
   * Optional location context.
   */
  latitude?: number;
  longitude?: number;
}