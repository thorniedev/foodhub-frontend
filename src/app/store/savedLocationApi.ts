import { baseApi } from "./baseApi";

import type {
  SavedLocation,
  CreateSavedLocationRequest,
  UpdateSavedLocationRequest,
} from "@/types/saved-location";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapPayload(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (
    "payload" in value &&
    value.payload !== undefined &&
    value.payload !== null
  ) {
    return value.payload;
  }

  if ("data" in value && value.data !== undefined && value.data !== null) {
    return value.data;
  }

  return value;
}

function normalizeSavedLocation(value: unknown): SavedLocation | null {
  if (!isRecord(value)) {
    return null;
  }

  const uuid = typeof value.uuid === "string" ? value.uuid : "";
  const label = typeof value.label === "string" ? value.label : "";

  if (!uuid && !label) {
    return null;
  }

  return {
    id: typeof value.id === "number" ? value.id : null,
    uuid: uuid || (typeof value.id === "number" ? String(value.id) : ""),
    label: label || "Saved Location",
    addressLine:
      typeof value.addressLine === "string"
        ? value.addressLine
        : typeof value.address === "string"
          ? value.address
          : null,
    latitude:
      typeof value.latitude === "number"
        ? value.latitude
        : typeof value.lat === "number"
          ? value.lat
          : 0,
    longitude:
      typeof value.longitude === "number"
        ? value.longitude
        : typeof value.lng === "number"
          ? value.lng
          : 0,
    isDefault: Boolean(value.isDefault || value.default),
    notes: typeof value.notes === "string" ? value.notes : null,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : null,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export const savedLocationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/v1/saved-locations */
    listSavedLocations: builder.query<SavedLocation[], void>({
      query: () => ({
        url: "/saved-locations",
        method: "GET",
      }),
      transformResponse: (response: unknown): SavedLocation[] => {
        const unwrapped = unwrapPayload(response);
        const list = Array.isArray(unwrapped)
          ? unwrapped
          : isRecord(unwrapped) && Array.isArray(unwrapped.items)
            ? unwrapped.items
            : isRecord(unwrapped) && Array.isArray(unwrapped.contents)
              ? unwrapped.contents
              : isRecord(unwrapped) && Array.isArray(unwrapped.content)
                ? unwrapped.content
                : [];

        return list
          .map(normalizeSavedLocation)
          .filter((item): item is SavedLocation => item !== null);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((loc) => ({
                type: "SavedLocation" as const,
                id: loc.uuid,
              })),
              { type: "SavedLocation" as const, id: "LIST" },
            ]
          : [{ type: "SavedLocation" as const, id: "LIST" }],
    }),

    /** POST /api/v1/saved-locations */
    createSavedLocation: builder.mutation<
      SavedLocation,
      CreateSavedLocationRequest
    >({
      query: (body) => ({
        url: "/saved-locations",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): SavedLocation => {
        const unwrapped = unwrapPayload(response);
        return (
          normalizeSavedLocation(unwrapped) ?? {
            uuid: "",
            label: "",
            latitude: 0,
            longitude: 0,
          }
        );
      },
      invalidatesTags: [{ type: "SavedLocation", id: "LIST" }],
    }),

    /** GET /api/v1/saved-locations/{locationUuid} */
    getSavedLocation: builder.query<SavedLocation | null, string>({
      query: (locationUuid) => ({
        url: `/saved-locations/${encodeURIComponent(locationUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): SavedLocation | null => {
        const unwrapped = unwrapPayload(response);
        return normalizeSavedLocation(unwrapped);
      },
      providesTags: (_result, _error, locationUuid) => [
        { type: "SavedLocation", id: locationUuid },
      ],
    }),

    /** PATCH /api/v1/saved-locations/{locationUuid} */
    updateSavedLocation: builder.mutation<
      SavedLocation,
      { locationUuid: string; body: UpdateSavedLocationRequest }
    >({
      query: ({ locationUuid, body }) => ({
        url: `/saved-locations/${encodeURIComponent(locationUuid)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown): SavedLocation => {
        const unwrapped = unwrapPayload(response);
        return (
          normalizeSavedLocation(unwrapped) ?? {
            uuid: "",
            label: "",
            latitude: 0,
            longitude: 0,
          }
        );
      },
      invalidatesTags: (_result, _error, { locationUuid }) => [
        { type: "SavedLocation", id: locationUuid },
        { type: "SavedLocation", id: "LIST" },
      ],
    }),

    /** DELETE /api/v1/saved-locations/{locationUuid} */
    deleteSavedLocation: builder.mutation<{ success: boolean }, string>({
      query: (locationUuid) => ({
        url: `/saved-locations/${encodeURIComponent(locationUuid)}`,
        method: "DELETE",
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: (_result, _error, locationUuid) => [
        { type: "SavedLocation", id: locationUuid },
        { type: "SavedLocation", id: "LIST" },
      ],
    }),

    /** PUT /api/v1/saved-locations/{locationUuid}/default */
    setDefaultSavedLocation: builder.mutation<SavedLocation, string>({
      query: (locationUuid) => ({
        url: `/saved-locations/${encodeURIComponent(locationUuid)}/default`,
        method: "PUT",
      }),
      transformResponse: (response: unknown): SavedLocation => {
        const unwrapped = unwrapPayload(response);
        return (
          normalizeSavedLocation(unwrapped) ?? {
            uuid: "",
            label: "",
            latitude: 0,
            longitude: 0,
          }
        );
      },
      invalidatesTags: [{ type: "SavedLocation", id: "LIST" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useListSavedLocationsQuery,
  useCreateSavedLocationMutation,
  useGetSavedLocationQuery,
  useUpdateSavedLocationMutation,
  useDeleteSavedLocationMutation,
  useSetDefaultSavedLocationMutation,
} = savedLocationApi;
