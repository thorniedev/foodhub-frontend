export interface SavedLocation {
  id?: number | null;
  uuid: string;
  label: string;
  addressLine?: string | null;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateSavedLocationRequest {
  label: string;
  addressLine?: string | null;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  notes?: string | null;
}

export interface UpdateSavedLocationRequest {
  label?: string;
  addressLine?: string | null;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  notes?: string | null;
}
