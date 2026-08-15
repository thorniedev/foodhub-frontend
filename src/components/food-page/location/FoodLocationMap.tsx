// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";

// import {
//   Circle,
//   MapContainer,
//   Marker,
//   Popup,
//   TileLayer,
//   useMap,
//   ZoomControl,
// } from "react-leaflet";

// import {
//   divIcon,
//   latLngBounds,
//   type DivIcon,
//   type Map as LeafletMap,
// } from "leaflet";

// import {
//   IoContractOutline,
//   IoLayersOutline,
//   IoLocateOutline,
//   IoLocationOutline,
//   IoNavigateOutline,
//   IoPeopleOutline,
//   IoRestaurantOutline,
//   IoStar,
// } from "react-icons/io5";

// import type {
//   Coordinates,
//   RecommendationMode,
//   RecommendedStore,
// } from "@/types/location";

// interface MapGroupMember {
//   uuid: string;
//   name: string;
//   coordinates: Coordinates | null;
// }

// interface FoodLocationMapProps {
//   mode: RecommendationMode;
//   userLocation: Coordinates | null;
//   groupMembers?: MapGroupMember[];
//   meetingPoint?: Coordinates | null;
//   stores: RecommendedStore[];
//   selectedStoreId: string | null;
//   radiusKm: number;
//   onSelectStore: (storeId: string) => void;
// }

// type SafeLatLng = [number, number];

// type MapStyle = "voyager" | "light";

// interface ValidStoreEntry {
//   store: RecommendedStore;
//   position: SafeLatLng;
// }

// interface ValidMemberEntry {
//   member: MapGroupMember;
//   position: SafeLatLng;
//   index: number;
// }

// const DEFAULT_MAP_CENTER: SafeLatLng = [11.5564, 104.9282];

// const MAP_TILES = {
//   voyager: {
//     label: "Standard",
//     url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
//   },

//   light: {
//     label: "Light",
//     url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
//   },
// } as const;

// const MEMBER_COLORS = [
//   "#7c3aed",
//   "#ea580c",
//   "#0891b2",
//   "#db2777",
//   "#2563eb",
//   "#9333ea",
//   "#059669",
//   "#ca8a04",
// ] as const;

// const HTML_ESCAPE_MAP: Record<string, string> = {
//   "&": "&amp;",
//   "<": "&lt;",
//   ">": "&gt;",
//   '"': "&quot;",
//   "'": "&#039;",
// };

// function escapeHtml(value: string): string {
//   return value.replace(
//     /[&<>"']/g,
//     (character) => HTML_ESCAPE_MAP[character] ?? character,
//   );
// }

// function toFiniteNumber(value: unknown): number | null {
//   if (typeof value === "number") {
//     return Number.isFinite(value) ? value : null;
//   }

//   if (typeof value === "string") {
//     const normalizedValue = value.trim();

//     if (!normalizedValue) {
//       return null;
//     }

//     const parsedValue = Number(normalizedValue);

//     return Number.isFinite(parsedValue) ? parsedValue : null;
//   }

//   return null;
// }

// function getSafeLatLng(
//   value:
//     | {
//         latitude?: unknown;
//         longitude?: unknown;
//       }
//     | null
//     | undefined,
// ): SafeLatLng | null {
//   if (!value) {
//     return null;
//   }

//   const latitude = toFiniteNumber(value.latitude);

//   const longitude = toFiniteNumber(value.longitude);

//   if (
//     latitude === null ||
//     longitude === null ||
//     latitude < -90 ||
//     latitude > 90 ||
//     longitude < -180 ||
//     longitude > 180
//   ) {
//     return null;
//   }

//   return [latitude, longitude];
// }

// function isSafeLatLng(
//   value: SafeLatLng | null | undefined,
// ): value is SafeLatLng {
//   if (!value) {
//     return false;
//   }

//   const [latitude, longitude] = value;

//   return (
//     Number.isFinite(latitude) &&
//     Number.isFinite(longitude) &&
//     latitude >= -90 &&
//     latitude <= 90 &&
//     longitude >= -180 &&
//     longitude <= 180
//   );
// }

// function invalidateLeafletSize(map: LeafletMap): void {
//   const container = map.getContainer();

//   if (!container?.isConnected) {
//     return;
//   }

//   try {
//     map.invalidateSize({
//       animate: false,
//       pan: false,
//     });
//   } catch {
//     // The map may be unmounting. Ignore resize work in that case.
//   }
// }

// function safelySetView(
//   map: LeafletMap,
//   target: SafeLatLng,
//   zoom: number,
// ): void {
//   if (!isSafeLatLng(target)) {
//     return;
//   }

//   try {
//     map.stop();

//     invalidateLeafletSize(map);

//     map.setView(target, zoom, {
//       animate: false,
//     });
//   } catch {
//     // Do not let a Leaflet transition error break the Location page.
//   }
// }

// function safelyFlyTo(
//   map: LeafletMap,
//   target: SafeLatLng,
//   zoom: number,
//   duration = 0.65,
// ): number | null {
//   if (typeof window === "undefined" || !isSafeLatLng(target)) {
//     return null;
//   }

//   map.stop();

//   invalidateLeafletSize(map);

//   return window.requestAnimationFrame(() => {
//     const container = map.getContainer();

//     if (!container?.isConnected) {
//       return;
//     }

//     try {
//       const currentCenter = map.getCenter();
//       const currentZoom = map.getZoom();

//       const alreadyAtTarget =
//         Math.abs(currentCenter.lat - target[0]) < 0.000005 &&
//         Math.abs(currentCenter.lng - target[1]) < 0.000005 &&
//         Math.abs(currentZoom - zoom) < 0.01;

//       if (alreadyAtTarget) {
//         return;
//       }

//       map.flyTo(target, zoom, {
//         animate: true,
//         duration,
//         easeLinearity: 0.25,
//       });
//     } catch {
//       /*
//        * A rapid card-scroll can interrupt a Leaflet animation while the map
//        * is also being resized. Falling back to setView keeps the UI usable
//        * instead of allowing the map transition to throw into React.
//        */
//       safelySetView(map, target, zoom);
//     }
//   });
// }

// function getSafeRadiusMeters(radiusKm: unknown): number {
//   const safeRadius = toFiniteNumber(radiusKm);

//   if (safeRadius === null || safeRadius <= 0) {
//     return 5_000;
//   }

//   return Math.min(Math.max(safeRadius, 0.1), 100) * 1_000;
// }

// function getMemberInitial(name: string, index: number): string {
//   const normalizedName = name.trim();

//   if (!normalizedName) {
//     return String(index + 1);
//   }

//   const firstCharacter = Array.from(normalizedName)[0];

//   return escapeHtml(firstCharacter?.toUpperCase() || String(index + 1));
// }

// function formatRating(value: unknown): string {
//   const rating = toFiniteNumber(value);

//   if (rating === null || rating <= 0) {
//     return "ថ្មី";
//   }

//   return rating.toFixed(1);
// }

// function formatDistance(value: unknown): string {
//   const distance = toFiniteNumber(value);

//   if (distance === null || distance < 0) {
//     return "មិនមានចម្ងាយ";
//   }

//   if (distance < 1) {
//     return `${Math.round(distance * 1_000)} m`;
//   }

//   return `${distance.toFixed(1)} km`;
// }

// function getStoreDisplayName(store: RecommendedStore): string {
//   return store.localName?.trim() || store.name?.trim() || "Food store";
// }

// function getStoreAddress(store: RecommendedStore): string {
//   return [store.addressLine, store.commune, store.district, store.city]
//     .filter(Boolean)
//     .join(", ");
// }

// function getStoreStatus(store: RecommendedStore): {
//   label: string;
//   className: string;
// } {
//   const operatingStatus = String(store.operatingStatus ?? "")
//     .trim()
//     .toUpperCase();

//   if (store.isOpenNow === true || operatingStatus === "OPEN") {
//     return {
//       label: "បើកឥឡូវនេះ",
//       className: "text-emerald-600",
//     };
//   }

//   if (
//     store.isOpenNow === false ||
//     operatingStatus === "CLOSED" ||
//     operatingStatus === "TEMPORARILY_CLOSED" ||
//     operatingStatus === "PERMANENTLY_CLOSED"
//   ) {
//     return {
//       label: "បានបិទ",
//       className: "text-red-500",
//     };
//   }

//   return {
//     label: "មិនទាន់ដឹង",
//     className: "text-slate-500",
//   };
// }

// function createDirectionsUrl(position: SafeLatLng): string {
//   const [latitude, longitude] = position;

//   const destination = encodeURIComponent(`${latitude},${longitude}`);

//   return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
// }

// function createStoreMarker(selected: boolean): DivIcon {
//   const selectedClass = selected ? " foodhub-store-pin--selected" : "";

//   return divIcon({
//     className: "foodhub-leaflet-div-icon",

//     html: `
//       <div class="foodhub-store-pin${selectedClass}">
//         <span class="foodhub-store-pin__pulse"></span>

//         <span class="foodhub-store-pin__body">
//           <svg
//             viewBox="0 0 24 24"
//             aria-hidden="true"
//             class="foodhub-store-pin__icon"
//           >
//             <path
//               fill="currentColor"
//               d="M8.1 13.34 6.91 12.15c-1.13-1.13-1.75-2.64-1.75-4.24V2h1.5v5.91c0 .39.05.78.14 1.15h.86V2h1.5v7.06h.86c.09-.37.14-.76.14-1.15V2h1.5v5.91c0 1.6-.62 3.11-1.75 4.24L8.72 13.34V22H8.1v-8.66Zm8.24-1.03V22h-1.5v-8.31c-1.55-.62-2.68-2.42-2.68-4.55 0-2.67 1.77-4.84 3.94-4.84s3.94 2.17 3.94 4.84c0 2.13-1.13 3.93-2.7 4.55v-1.38Z"
//             />
//           </svg>
//         </span>

//         <span class="foodhub-store-pin__tip"></span>
//       </div>
//     `,

//     iconSize: selected ? [58, 66] : [48, 58],

//     iconAnchor: selected ? [29, 62] : [24, 54],

//     popupAnchor: selected ? [0, -58] : [0, -50],
//   });
// }

// function createUserMarker(): DivIcon {
//   return divIcon({
//     className: "foodhub-leaflet-div-icon",

//     html: `
//       <div class="foodhub-user-marker">
//         <span class="foodhub-user-marker__pulse"></span>
//         <span class="foodhub-user-marker__ring"></span>
//         <span class="foodhub-user-marker__dot"></span>
//       </div>
//     `,

//     iconSize: [52, 52],
//     iconAnchor: [26, 26],
//     popupAnchor: [0, -23],
//   });
// }

// function createMeetingPointMarker(): DivIcon {
//   return divIcon({
//     className: "foodhub-leaflet-div-icon",

//     html: `
//       <div class="foodhub-meeting-marker">
//         <span class="foodhub-meeting-marker__pulse"></span>

//         <span class="foodhub-meeting-marker__body">
//           <svg
//             viewBox="0 0 24 24"
//             aria-hidden="true"
//             class="foodhub-meeting-marker__icon"
//           >
//             <path
//               fill="currentColor"
//               d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm-6 8v-1c0-2.76 2.69-5 6-5s6 2.24 6 5v1H6Zm11.5-7.5a3 3 0 1 0 0-6 5.46 5.46 0 0 1 0 6Zm-11 0a5.46 5.46 0 0 1 0-6 3 3 0 1 0 0 6Z"
//             />
//           </svg>
//         </span>

//         <span class="foodhub-meeting-marker__tip"></span>
//       </div>
//     `,

//     iconSize: [58, 66],
//     iconAnchor: [29, 62],
//     popupAnchor: [0, -58],
//   });
// }

// function createMemberMarker(name: string, index: number): DivIcon {
//   const initial = getMemberInitial(name, index);

//   const color = MEMBER_COLORS[index % MEMBER_COLORS.length];

//   return divIcon({
//     className: "foodhub-leaflet-div-icon",

//     html: `
//       <div
//         class="foodhub-member-marker"
//         style="--foodhub-member-color: ${color}"
//       >
//         <span class="foodhub-member-marker__ring"></span>

//         <span class="foodhub-member-marker__avatar">
//           ${initial}
//         </span>
//       </div>
//     `,

//     iconSize: [46, 46],
//     iconAnchor: [23, 23],
//     popupAnchor: [0, -22],
//   });
// }

// function MapViewportController({
//   center,
//   selectedStorePosition,
// }: {
//   center: SafeLatLng;
//   selectedStorePosition: SafeLatLng | null;
// }) {
//   const map = useMap();

//   const frameRef = useRef<number | null>(null);

//   const timeoutRef = useRef<number | null>(null);

//   const firstViewAppliedRef = useRef(false);

//   const centerLatitude = center[0];

//   const centerLongitude = center[1];

//   const selectedLatitude = selectedStorePosition?.[0] ?? null;

//   const selectedLongitude = selectedStorePosition?.[1] ?? null;

//   /*
//    * Leaflet does not always detect width/height changes caused by a
//    * responsive Tailwind grid or sticky column. When that happens, only part
//    * of the tile layer is painted and flyTo can run with stale pixel bounds.
//    *
//    * ResizeObserver keeps Leaflet's internal size synchronized with the
//    * actual map element.
//    */
//   useEffect(() => {
//     const container = map.getContainer();

//     if (!container) {
//       return;
//     }

//     let resizeFrame: number | null = null;

//     const refreshSize = () => {
//       if (resizeFrame !== null) {
//         window.cancelAnimationFrame(resizeFrame);
//       }

//       resizeFrame = window.requestAnimationFrame(() => {
//         invalidateLeafletSize(map);
//       });
//     };

//     refreshSize();

//     const firstTimeout = window.setTimeout(refreshSize, 80);

//     const secondTimeout = window.setTimeout(refreshSize, 280);

//     const resizeObserver =
//       typeof ResizeObserver !== "undefined"
//         ? new ResizeObserver(refreshSize)
//         : null;

//     resizeObserver?.observe(container);

//     window.addEventListener("resize", refreshSize);

//     return () => {
//       resizeObserver?.disconnect();

//       window.removeEventListener("resize", refreshSize);

//       window.clearTimeout(firstTimeout);

//       window.clearTimeout(secondTimeout);

//       if (resizeFrame !== null) {
//         window.cancelAnimationFrame(resizeFrame);
//       }
//     };
//   }, [map]);

//   /*
//    * Follow the active FoodCard.
//    *
//    * We debounce very slightly because the active card may change many times
//    * while the user is scrolling. Before each move we stop the previous
//    * Leaflet animation and recalculate the map size.
//    */
//   useEffect(() => {
//     const hasSelectedPosition =
//       selectedLatitude !== null && selectedLongitude !== null;

//     const target: SafeLatLng = hasSelectedPosition
//       ? [selectedLatitude, selectedLongitude]
//       : [centerLatitude, centerLongitude];

//     if (!isSafeLatLng(target)) {
//       return;
//     }

//     if (timeoutRef.current !== null) {
//       window.clearTimeout(timeoutRef.current);
//     }

//     if (frameRef.current !== null) {
//       window.cancelAnimationFrame(frameRef.current);
//     }

//     timeoutRef.current = window.setTimeout(
//       () => {
//         map.stop();

//         invalidateLeafletSize(map);

//         /*
//          * On the first map render, setView is safer because Leaflet may still
//          * be calculating the dimensions of the sticky/responsive container.
//          * After that, selected FoodCards use the smooth flyTo animation.
//          */
//         if (!firstViewAppliedRef.current) {
//           safelySetView(map, target, hasSelectedPosition ? 16 : 14);

//           firstViewAppliedRef.current = true;

//           return;
//         }

//         frameRef.current = safelyFlyTo(
//           map,
//           target,
//           hasSelectedPosition ? 16 : 14,
//           hasSelectedPosition ? 0.62 : 0.5,
//         );
//       },
//       hasSelectedPosition ? 70 : 30,
//     );

//     return () => {
//       if (timeoutRef.current !== null) {
//         window.clearTimeout(timeoutRef.current);
//         timeoutRef.current = null;
//       }

//       if (frameRef.current !== null) {
//         window.cancelAnimationFrame(frameRef.current);
//         frameRef.current = null;
//       }

//       // map.stop();
//     };
//   }, [
//     centerLatitude,
//     centerLongitude,
//     map,
//     selectedLatitude,
//     selectedLongitude,
//   ]);

//   return null;
// }

// function FloatingMapControls({
//   allPositions,
//   focusPosition,
// }: {
//   allPositions: SafeLatLng[];
//   focusPosition: SafeLatLng;
// }) {
//   const map = useMap();

//   const handleLocate = () => {
//     if (!isSafeLatLng(focusPosition)) {
//       return;
//     }

//     safelyFlyTo(map, focusPosition, 16, 0.62);
//   };

//   const handleFitAll = () => {
//     const safePositions = allPositions.filter(isSafeLatLng);

//     if (safePositions.length === 0) {
//       return;
//     }

//     map.stop();

//     invalidateLeafletSize(map);

//     if (safePositions.length === 1) {
//       safelyFlyTo(map, safePositions[0], 15, 0.62);

//       return;
//     }

//     const bounds = latLngBounds(safePositions);

//     window.requestAnimationFrame(() => {
//       try {
//         map.fitBounds(bounds, {
//           animate: true,
//           duration: 0.65,
//           paddingTopLeft: [50, 100],
//           paddingBottomRight: [50, 80],
//           maxZoom: 15,
//         });
//       } catch {
//         const fallbackPosition = safePositions[0];

//         if (fallbackPosition) {
//           safelySetView(map, fallbackPosition, 14);
//         }
//       }
//     });
//   };

//   return (
//     <div className="leaflet-top leaflet-right foodhub-map-action-position">
//       <div className="leaflet-control foodhub-map-action-control">
//         <button
//           type="button"
//           title="Go to current location"
//           aria-label="Go to current location"
//           onMouseDown={(event) => event.stopPropagation()}
//           onDoubleClick={(event) => event.stopPropagation()}
//           onClick={(event) => {
//             event.preventDefault();
//             event.stopPropagation();
//             handleLocate();
//           }}
//         >
//           <IoLocateOutline />
//         </button>

//         <span className="foodhub-map-action-divider" />

//         <button
//           type="button"
//           title="Fit all locations"
//           aria-label="Fit all locations"
//           onMouseDown={(event) => event.stopPropagation()}
//           onDoubleClick={(event) => event.stopPropagation()}
//           onClick={(event) => {
//             event.preventDefault();
//             event.stopPropagation();
//             handleFitAll();
//           }}
//         >
//           <IoContractOutline />
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function FoodLocationMap({
//   mode,
//   userLocation,
//   groupMembers = [],
//   meetingPoint,
//   stores,
//   selectedStoreId,
//   radiusKm,
//   onSelectStore,
// }: FoodLocationMapProps) {
//   const [mapStyle, setMapStyle] = useState<MapStyle>("voyager");

//   const userPosition = useMemo(
//     () => getSafeLatLng(userLocation),
//     [userLocation?.latitude, userLocation?.longitude],
//   );

//   const meetingPointPosition = useMemo(
//     () => getSafeLatLng(meetingPoint),
//     [meetingPoint?.latitude, meetingPoint?.longitude],
//   );

//   const validStoreEntries = useMemo<ValidStoreEntry[]>(
//     () =>
//       stores.flatMap((store) => {
//         const position = getSafeLatLng(store);

//         if (!position) {
//           return [];
//         }

//         return [
//           {
//             store,
//             position,
//           },
//         ];
//       }),
//     [stores],
//   );

//   const validMemberEntries = useMemo<ValidMemberEntry[]>(
//     () =>
//       groupMembers.flatMap((member, index) => {
//         const position = getSafeLatLng(member.coordinates);

//         if (!position) {
//           return [];
//         }

//         return [
//           {
//             member,
//             position,
//             index,
//           },
//         ];
//       }),
//     [groupMembers],
//   );

//   const mapCenter = useMemo<SafeLatLng>(() => {
//     if (mode === "group" && meetingPointPosition) {
//       return meetingPointPosition;
//     }

//     if (userPosition) {
//       return userPosition;
//     }

//     const firstStorePosition = validStoreEntries[0]?.position;

//     if (firstStorePosition) {
//       return firstStorePosition;
//     }

//     return DEFAULT_MAP_CENTER;
//   }, [meetingPointPosition, mode, userPosition, validStoreEntries]);

//   const safeMapCenter = isSafeLatLng(mapCenter)
//     ? mapCenter
//     : DEFAULT_MAP_CENTER;

//   const selectedStoreEntry = useMemo(
//     () =>
//       validStoreEntries.find(({ store }) => store.uuid === selectedStoreId) ??
//       null,
//     [selectedStoreId, validStoreEntries],
//   );

//   const selectedStorePosition =
//     selectedStoreEntry?.position && isSafeLatLng(selectedStoreEntry.position)
//       ? selectedStoreEntry.position
//       : null;

//   const radiusMeters = useMemo(() => getSafeRadiusMeters(radiusKm), [radiusKm]);

//   const allPositions = useMemo<SafeLatLng[]>(() => {
//     const positions: Array<SafeLatLng | null> = [
//       userPosition,
//       meetingPointPosition,

//       ...validMemberEntries.map(({ position }) => position),

//       ...validStoreEntries.map(({ position }) => position),
//     ];

//     return positions.filter(isSafeLatLng);
//   }, [
//     meetingPointPosition,
//     userPosition,
//     validMemberEntries,
//     validStoreEntries,
//   ]);

//   const focusPosition = useMemo(() => {
//     if (mode === "group" && meetingPointPosition) {
//       return meetingPointPosition;
//     }

//     return userPosition ?? meetingPointPosition ?? safeMapCenter;
//   }, [meetingPointPosition, mode, safeMapCenter, userPosition]);

//   const userMarkerIcon = useMemo(() => createUserMarker(), []);

//   const meetingPointIcon = useMemo(() => createMeetingPointMarker(), []);

//   const currentTile = MAP_TILES[mapStyle];

//   return (
//     <div className="foodhub-map relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 shadow-[0_18px_50px_rgba(15,23,42,0.10)] sm:rounded-[28px]">
//       <MapContainer
//         center={safeMapCenter}
//         zoom={14}
//         minZoom={5}
//         maxZoom={20}
//         zoomControl={false}
//         scrollWheelZoom
//         doubleClickZoom
//         touchZoom
//         className="h-[64dvh] min-h-[520px] w-full sm:h-[650px] md:min-h-[600px] lg:h-[720px] 2xl:h-[calc(100dvh-100px)] 2xl:min-h-[620px] 2xl:max-h-[900px]"
//       >
//         <TileLayer
//           key={mapStyle}
//           attribution="&copy; OpenStreetMap contributors &copy; CARTO"
//           url={currentTile.url}
//           subdomains="abcd"
//           maxZoom={20}
//         />

//         <MapViewportController
//           center={safeMapCenter}
//           selectedStorePosition={selectedStorePosition}
//         />

//         <FloatingMapControls
//           allPositions={allPositions}
//           focusPosition={focusPosition}
//         />

//         <ZoomControl position="bottomright" />

//         <Circle
//           center={safeMapCenter}
//           radius={radiusMeters}
//           interactive={false}
//           pathOptions={{
//             color: mode === "group" ? "#f97316" : "#2563eb",

//             fillColor: mode === "group" ? "#fb923c" : "#3b82f6",

//             fillOpacity: 0.055,
//             opacity: 0.55,
//             weight: 1.5,
//             dashArray: "6 8",
//           }}
//         />

//         {userPosition && (
//           <Marker
//             position={userPosition}
//             icon={userMarkerIcon}
//             zIndexOffset={1_200}
//           >
//             <Popup
//               className="foodhub-map-popup"
//               closeButton={false}
//               minWidth={220}
//               maxWidth={280}
//             >
//               <div className="p-1">
//                 <div className="flex items-center gap-3">
//                   <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//                     <IoLocateOutline className="text-[23px]" />
//                   </span>

//                   <div>
//                     <p className="text-[17px] font-bold text-slate-900">
//                       ទីតាំងរបស់អ្នក
//                     </p>

//                     <p className="mt-0.5 text-[17px] text-slate-500">
//                       ទីតាំងបច្ចុប្បន្ន
//                     </p>
//                   </div>
//                 </div>

//                 {typeof userLocation?.accuracy === "number" &&
//                   Number.isFinite(userLocation.accuracy) && (
//                     <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[17px] text-slate-600">
//                       ភាពត្រឹមត្រូវប្រហែល {Math.round(userLocation.accuracy)}
//                       ម៉ែត្រ
//                     </p>
//                   )}
//               </div>
//             </Popup>
//           </Marker>
//         )}

//         {mode === "group" &&
//           validMemberEntries.map(({ member, position, index }) => (
//             <Marker
//               key={member.uuid}
//               position={position}
//               icon={createMemberMarker(member.name, index)}
//               zIndexOffset={900 + index}
//             >
//               <Popup
//                 className="foodhub-map-popup"
//                 closeButton={false}
//                 minWidth={200}
//               >
//                 <div className="flex items-center gap-3 p-1">
//                   <span
//                     className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[17px] font-bold text-white"
//                     style={{
//                       backgroundColor:
//                         MEMBER_COLORS[index % MEMBER_COLORS.length],
//                     }}
//                   >
//                     {Array.from(member.name.trim() || String(index + 1))[0]}
//                   </span>

//                   <div className="min-w-0">
//                     <p className="truncate text-[17px] font-bold text-slate-900">
//                       {member.name || `Member ${index + 1}`}
//                     </p>

//                     <p className="mt-0.5 text-[17px] text-slate-500">
//                       ទីតាំងសមាជិកក្រុម
//                     </p>
//                   </div>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}

//         {mode === "group" && meetingPointPosition && (
//           <Marker
//             position={meetingPointPosition}
//             icon={meetingPointIcon}
//             zIndexOffset={1_300}
//           >
//             <Popup
//               className="foodhub-map-popup"
//               closeButton={false}
//               minWidth={230}
//             >
//               <div className="p-1">
//                 <div className="flex items-center gap-3">
//                   <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
//                     <IoPeopleOutline className="text-[23px]" />
//                   </span>

//                   <div>
//                     <p className="text-[17px] font-bold text-slate-900">
//                       ចំណុចកណ្ដាលក្រុម
//                     </p>

//                     <p className="mt-0.5 text-[17px] text-slate-500">
//                       ទីតាំងសមរម្យសម្រាប់មនុស្សគ្រប់គ្នា
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </Popup>
//           </Marker>
//         )}

//         {validStoreEntries.map(({ store, position }) => {
//           const selected = selectedStoreId === store.uuid;

//           const displayName = getStoreDisplayName(store);

//           const displayAddress = getStoreAddress(store);

//           const storeStatus = getStoreStatus(store);

//           const directionsUrl = createDirectionsUrl(position);

//           return (
//             <Marker
//               key={store.uuid}
//               position={position}
//               icon={createStoreMarker(selected)}
//               zIndexOffset={selected ? 1_100 : 500}
//               riseOnHover
//               eventHandlers={{
//                 click: () => onSelectStore(store.uuid),
//               }}
//             >
//               <Popup
//                 className="foodhub-map-popup"
//                 closeButton={false}
//                 minWidth={250}
//                 maxWidth={310}
//                 autoPanPadding={[40, 40]}
//               >
//                 <div className="w-[250px] max-w-[calc(100vw-78px)] p-1 sm:w-[278px]">
//                   <div className="flex items-start gap-3">
//                     <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
//                       <IoRestaurantOutline className="text-[24px]" />
//                     </span>

//                     <div className="min-w-0 flex-1">
//                       <p
//                         role="heading"
//                         aria-level={3}
//                         className="line-clamp-2 text-[18px] font-bold leading-6 text-slate-900"
//                       >
//                         {displayName}
//                       </p>

//                       <p
//                         className={`mt-1 text-[17px] font-semibold ${storeStatus.className}`}
//                       >
//                         {storeStatus.label}
//                       </p>
//                     </div>
//                   </div>

//                   {displayAddress && (
//                     <p className="mt-3 flex items-start gap-2 text-[17px] leading-6 text-slate-500">
//                       <IoLocationOutline className="mt-1 shrink-0 text-[17px] text-primary-600" />

//                       <span>{displayAddress}</span>
//                     </p>
//                   )}

//                   <div className="mt-3 flex flex-wrap items-center gap-2">
//                     <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-amber-50 px-3 text-[17px] font-semibold text-amber-700">
//                       <IoStar className="text-[17px]" />
//                       {formatRating(store.averageRating)}
//                     </span>

//                     <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-[17px] font-semibold text-blue-700">
//                       <IoNavigateOutline className="text-[17px]" />
//                       {formatDistance(store.distanceKm)}
//                     </span>
//                   </div>

//                   <div className="mt-4 grid grid-cols-2 gap-2">
//                     <button
//                       type="button"
//                       onClick={() => onSelectStore(store.uuid)}
//                       className="flex min-h-11 items-center justify-center rounded-xl bg-primary-800 px-3 text-[17px] font-bold text-white transition hover:bg-primary-700"
//                     >
//                       ជ្រើសរើស
//                     </button>

//                     <a
//                       href={directionsUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[17px] font-bold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:text-primary-dark"
//                     >
//                       <IoNavigateOutline className="text-[18px]" />
//                       ទិសដៅ
//                     </a>
//                   </div>
//                 </div>
//               </Popup>
//             </Marker>
//           );
//         })}
//       </MapContainer>

//       {/* Map style selector */}
//       <div className="pointer-events-auto absolute left-3 top-3 z-[500] flex items-center gap-1 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-[0_8px_28px_rgba(15,23,42,0.17)] backdrop-blur-md sm:left-4 sm:top-4">
//         <span className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500">
//           <IoLayersOutline className="text-[20px]" />
//         </span>

//         {(Object.keys(MAP_TILES) as MapStyle[]).map((style) => {
//           const active = mapStyle === style;

//           return (
//             <button
//               key={style}
//               type="button"
//               onClick={() => setMapStyle(style)}
//               className={`min-h-9 rounded-xl px-3 text-[17px] font-bold transition sm:px-4 sm:text-[17px] ${
//                 active
//                   ? "bg-primary-800 text-white shadow-sm"
//                   : "text-slate-600 hover:bg-slate-100"
//               }`}
//             >
//               {MAP_TILES[style].label}
//             </button>
//           );
//         })}
//       </div>

//       {/* Responsive legend */}
//       <div className="pointer-events-none absolute bottom-3 left-3 z-[500] hidden items-center gap-4 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-[17px] font-semibold text-slate-600 shadow-[0_8px_28px_rgba(15,23,42,0.14)] backdrop-blur-md md:flex">
//         <span className="inline-flex items-center gap-2">
//           <span className="h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow" />
//           អ្នក
//         </span>

//         {mode === "group" && (
//           <>
//             <span className="inline-flex items-center gap-2">
//               <span className="h-3 w-3 rounded-full border-2 border-white bg-violet-600 shadow" />
//               សមាជិក
//             </span>

//             <span className="inline-flex items-center gap-2">
//               <span className="h-3 w-3 rounded-full border-2 border-white bg-orange-500 shadow" />
//               ចំណុចកណ្ដាល
//             </span>
//           </>
//         )}

//         <span className="inline-flex items-center gap-2">
//           <span className="h-3 w-3 rounded-full border-2 border-white bg-primary-700 shadow" />
//           ហាង
//         </span>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";

import {
  divIcon,
  latLngBounds,
  type DivIcon,
  type Map as LeafletMap,
} from "leaflet";

import {
  IoContractOutline,
  IoLayersOutline,
  IoLocateOutline,
  IoLocationOutline,
  IoNavigateOutline,
  IoPeopleOutline,
  IoRestaurantOutline,
  IoStar,
} from "react-icons/io5";

import type {
  Coordinates,
  RecommendationMode,
  RecommendedStore,
} from "@/types/location";

interface MapGroupMember {
  uuid: string;
  name: string;
  coordinates: Coordinates | null;
}

interface FoodLocationMapProps {
  mode: RecommendationMode;
  userLocation: Coordinates | null;
  groupMembers?: MapGroupMember[];
  meetingPoint?: Coordinates | null;
  stores: RecommendedStore[];
  selectedStoreId: string | null;
  radiusKm: number;
  onSelectStore: (storeId: string) => void;
}

type SafeLatLng = [number, number];

type MapStyle = "voyager" | "light" | "satellite";

interface ValidStoreEntry {
  store: RecommendedStore;
  position: SafeLatLng;
}

interface ValidMemberEntry {
  member: MapGroupMember;
  position: SafeLatLng;
  index: number;
}

const DEFAULT_MAP_CENTER: SafeLatLng = [11.5564, 104.9282];

interface MapTileConfig {
  label: string;
  url: string;
  attribution: string;
  subdomains?: string;
}

const MAP_TILES: Record<MapStyle, MapTileConfig> = {
  voyager: {
    label: "ផែនទី",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    subdomains: "abcd",
  },

  light: {
    label: "ស្រាល",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    subdomains: "abcd",
  },

  satellite: {
    label: "ផ្កាយរណប",
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

const MEMBER_COLORS = [
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#db2777",
  "#2563eb",
  "#9333ea",
  "#059669",
  "#ca8a04",
] as const;

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) => HTML_ESCAPE_MAP[character] ?? character,
  );
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return null;
    }

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function getSafeLatLng(
  value:
    | {
        latitude?: unknown;
        longitude?: unknown;
      }
    | null
    | undefined,
): SafeLatLng | null {
  if (!value) {
    return null;
  }

  const latitude = toFiniteNumber(value.latitude);

  const longitude = toFiniteNumber(value.longitude);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return [latitude, longitude];
}

function isSafeLatLng(
  value: SafeLatLng | null | undefined,
): value is SafeLatLng {
  if (!value) {
    return false;
  }

  const [latitude, longitude] = value;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function invalidateLeafletSize(map: LeafletMap): void {
  const container = map.getContainer();

  if (!container?.isConnected) {
    return;
  }

  try {
    map.invalidateSize({
      animate: false,
      pan: false,
    });
  } catch {
    // The map may be unmounting. Ignore resize work in that case.
  }
}

function safelySetView(
  map: LeafletMap,
  target: SafeLatLng,
  zoom: number,
): void {
  if (!isSafeLatLng(target)) {
    return;
  }

  try {
    map.stop();

    invalidateLeafletSize(map);

    map.setView(target, zoom, {
      animate: false,
    });
  } catch {
    // Do not let a Leaflet transition error break the Location page.
  }
}

function safelyFlyTo(
  map: LeafletMap,
  target: SafeLatLng,
  zoom: number,
  duration = 0.65,
): number | null {
  if (typeof window === "undefined" || !isSafeLatLng(target)) {
    return null;
  }

  map.stop();

  invalidateLeafletSize(map);

  return window.requestAnimationFrame(() => {
    const container = map.getContainer();

    if (!container?.isConnected) {
      return;
    }

    try {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      const alreadyAtTarget =
        Math.abs(currentCenter.lat - target[0]) < 0.000005 &&
        Math.abs(currentCenter.lng - target[1]) < 0.000005 &&
        Math.abs(currentZoom - zoom) < 0.01;

      if (alreadyAtTarget) {
        return;
      }

      map.flyTo(target, zoom, {
        animate: true,
        duration,
        easeLinearity: 0.25,
      });
    } catch {
      /*
       * A rapid card-scroll can interrupt a Leaflet animation while the map
       * is also being resized. Falling back to setView keeps the UI usable
       * instead of allowing the map transition to throw into React.
       */
      safelySetView(map, target, zoom);
    }
  });
}

function getSafeRadiusMeters(radiusKm: unknown): number {
  const safeRadius = toFiniteNumber(radiusKm);

  if (safeRadius === null || safeRadius <= 0) {
    return 5_000;
  }

  return Math.min(Math.max(safeRadius, 0.1), 100) * 1_000;
}

function getMemberInitial(name: string, index: number): string {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return String(index + 1);
  }

  const firstCharacter = Array.from(normalizedName)[0];

  return escapeHtml(firstCharacter?.toUpperCase() || String(index + 1));
}

function formatRating(value: unknown): string {
  const rating = toFiniteNumber(value);

  if (rating === null || rating <= 0) {
    return "ថ្មី";
  }

  return rating.toFixed(1);
}

function formatDistance(value: unknown): string {
  const distance = toFiniteNumber(value);

  if (distance === null || distance < 0) {
    return "មិនមានចម្ងាយ";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1_000)} m`;
  }

  return `${distance.toFixed(1)} km`;
}

function getStoreDisplayName(store: RecommendedStore): string {
  return store.localName?.trim() || store.name?.trim() || "Food store";
}

function getStoreAddress(store: RecommendedStore): string {
  return [store.addressLine, store.commune, store.district, store.city]
    .filter(Boolean)
    .join(", ");
}

function getStoreStatus(store: RecommendedStore): {
  label: string;
  className: string;
} {
  const operatingStatus = String(store.operatingStatus ?? "")
    .trim()
    .toUpperCase();

  if (store.isOpenNow === true || operatingStatus === "OPEN") {
    return {
      label: "បើកឥឡូវនេះ",
      className: "text-emerald-600",
    };
  }

  if (
    store.isOpenNow === false ||
    operatingStatus === "CLOSED" ||
    operatingStatus === "TEMPORARILY_CLOSED" ||
    operatingStatus === "PERMANENTLY_CLOSED"
  ) {
    return {
      label: "បានបិទ",
      className: "text-red-500",
    };
  }

  return {
    label: "មិនទាន់ដឹង",
    className: "text-slate-500",
  };
}

function createDirectionsUrl(position: SafeLatLng): string {
  const [latitude, longitude] = position;

  const destination = encodeURIComponent(`${latitude},${longitude}`);

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

function createStoreMarker(selected: boolean): DivIcon {
  const selectedClass = selected ? " foodhub-store-pin--selected" : "";

  return divIcon({
    className: "foodhub-leaflet-div-icon",

    html: `
      <div class="foodhub-store-pin${selectedClass}">
        <span class="foodhub-store-pin__pulse"></span>

        <span class="foodhub-store-pin__body">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            class="foodhub-store-pin__icon"
          >
            <path
              fill="currentColor"
              d="M8.1 13.34 6.91 12.15c-1.13-1.13-1.75-2.64-1.75-4.24V2h1.5v5.91c0 .39.05.78.14 1.15h.86V2h1.5v7.06h.86c.09-.37.14-.76.14-1.15V2h1.5v5.91c0 1.6-.62 3.11-1.75 4.24L8.72 13.34V22H8.1v-8.66Zm8.24-1.03V22h-1.5v-8.31c-1.55-.62-2.68-2.42-2.68-4.55 0-2.67 1.77-4.84 3.94-4.84s3.94 2.17 3.94 4.84c0 2.13-1.13 3.93-2.7 4.55v-1.38Z"
            />
          </svg>
        </span>

        <span class="foodhub-store-pin__tip"></span>
      </div>
    `,

    iconSize: selected ? [58, 66] : [48, 58],

    iconAnchor: selected ? [29, 62] : [24, 54],

    popupAnchor: selected ? [0, -58] : [0, -50],
  });
}

function createUserMarker(): DivIcon {
  return divIcon({
    className: "foodhub-leaflet-div-icon",

    html: `
      <div class="foodhub-user-marker">
        <span class="foodhub-user-marker__pulse"></span>
        <span class="foodhub-user-marker__ring"></span>
        <span class="foodhub-user-marker__dot"></span>
      </div>
    `,

    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -23],
  });
}

function createMeetingPointMarker(): DivIcon {
  return divIcon({
    className: "foodhub-leaflet-div-icon",

    html: `
      <div class="foodhub-meeting-marker">
        <span class="foodhub-meeting-marker__pulse"></span>

        <span class="foodhub-meeting-marker__body">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            class="foodhub-meeting-marker__icon"
          >
            <path
              fill="currentColor"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm-6 8v-1c0-2.76 2.69-5 6-5s6 2.24 6 5v1H6Zm11.5-7.5a3 3 0 1 0 0-6 5.46 5.46 0 0 1 0 6Zm-11 0a5.46 5.46 0 0 1 0-6 3 3 0 1 0 0 6Z"
            />
          </svg>
        </span>

        <span class="foodhub-meeting-marker__tip"></span>
      </div>
    `,

    iconSize: [58, 66],
    iconAnchor: [29, 62],
    popupAnchor: [0, -58],
  });
}

function createMemberMarker(name: string, index: number): DivIcon {
  const initial = getMemberInitial(name, index);

  const color = MEMBER_COLORS[index % MEMBER_COLORS.length];

  return divIcon({
    className: "foodhub-leaflet-div-icon",

    html: `
      <div
        class="foodhub-member-marker"
        style="--foodhub-member-color: ${color}"
      >
        <span class="foodhub-member-marker__ring"></span>

        <span class="foodhub-member-marker__avatar">
          ${initial}
        </span>
      </div>
    `,

    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -22],
  });
}

function MapViewportController({
  center,
  selectedStorePosition,
}: {
  center: SafeLatLng;
  selectedStorePosition: SafeLatLng | null;
}) {
  const map = useMap();

  const frameRef = useRef<number | null>(null);

  const timeoutRef = useRef<number | null>(null);

  const firstViewAppliedRef = useRef(false);

  const centerLatitude = center[0];

  const centerLongitude = center[1];

  const selectedLatitude = selectedStorePosition?.[0] ?? null;

  const selectedLongitude = selectedStorePosition?.[1] ?? null;

  /*
   * Leaflet does not always detect width/height changes caused by a
   * responsive Tailwind grid or sticky column. When that happens, only part
   * of the tile layer is painted and flyTo can run with stale pixel bounds.
   *
   * ResizeObserver keeps Leaflet's internal size synchronized with the
   * actual map element.
   */
  useEffect(() => {
    const container = map.getContainer();

    if (!container) {
      return;
    }

    let resizeFrame: number | null = null;

    const refreshSize = () => {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        invalidateLeafletSize(map);
      });
    };

    refreshSize();

    const firstTimeout = window.setTimeout(refreshSize, 80);

    const secondTimeout = window.setTimeout(refreshSize, 280);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(refreshSize)
        : null;

    resizeObserver?.observe(container);

    window.addEventListener("resize", refreshSize);

    return () => {
      resizeObserver?.disconnect();

      window.removeEventListener("resize", refreshSize);

      window.clearTimeout(firstTimeout);

      window.clearTimeout(secondTimeout);

      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }
    };
  }, [map]);

  /*
   * Follow the active FoodCard.
   *
   * We debounce very slightly because the active card may change many times
   * while the user is scrolling. Before each move we stop the previous
   * Leaflet animation and recalculate the map size.
   */
  useEffect(() => {
    const hasSelectedPosition =
      selectedLatitude !== null && selectedLongitude !== null;

    const target: SafeLatLng = hasSelectedPosition
      ? [selectedLatitude, selectedLongitude]
      : [centerLatitude, centerLongitude];

    if (!isSafeLatLng(target)) {
      return;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    timeoutRef.current = window.setTimeout(
      () => {
        map.stop();

        invalidateLeafletSize(map);

        /*
         * On the first map render, setView is safer because Leaflet may still
         * be calculating the dimensions of the sticky/responsive container.
         * After that, selected FoodCards use the smooth flyTo animation.
         */
        if (!firstViewAppliedRef.current) {
          safelySetView(map, target, hasSelectedPosition ? 16 : 14);

          firstViewAppliedRef.current = true;

          return;
        }

        frameRef.current = safelyFlyTo(
          map,
          target,
          hasSelectedPosition ? 16 : 14,
          hasSelectedPosition ? 0.62 : 0.5,
        );
      },
      hasSelectedPosition ? 70 : 30,
    );

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      // map.stop();
    };
  }, [
    centerLatitude,
    centerLongitude,
    map,
    selectedLatitude,
    selectedLongitude,
  ]);

  return null;
}

function FloatingMapControls({
  allPositions,
  focusPosition,
}: {
  allPositions: SafeLatLng[];
  focusPosition: SafeLatLng;
}) {
  const map = useMap();

  const handleLocate = () => {
    if (!isSafeLatLng(focusPosition)) {
      return;
    }

    safelyFlyTo(map, focusPosition, 16, 0.62);
  };

  const handleFitAll = () => {
    const safePositions = allPositions.filter(isSafeLatLng);

    if (safePositions.length === 0) {
      return;
    }

    map.stop();

    invalidateLeafletSize(map);

    if (safePositions.length === 1) {
      safelyFlyTo(map, safePositions[0], 15, 0.62);

      return;
    }

    const bounds = latLngBounds(safePositions);

    window.requestAnimationFrame(() => {
      try {
        map.fitBounds(bounds, {
          animate: true,
          duration: 0.65,
          paddingTopLeft: [50, 100],
          paddingBottomRight: [50, 80],
          maxZoom: 15,
        });
      } catch {
        const fallbackPosition = safePositions[0];

        if (fallbackPosition) {
          safelySetView(map, fallbackPosition, 14);
        }
      }
    });
  };

  return (
    <div className="leaflet-top leaflet-right foodhub-map-action-position">
      <div className="leaflet-control foodhub-map-action-control">
        <button
          type="button"
          title="Go to current location"
          aria-label="Go to current location"
          onMouseDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleLocate();
          }}
        >
          <IoLocateOutline />
        </button>

        <span className="foodhub-map-action-divider" />

        <button
          type="button"
          title="Fit all locations"
          aria-label="Fit all locations"
          onMouseDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleFitAll();
          }}
        >
          <IoContractOutline />
        </button>
      </div>
    </div>
  );
}

export default function FoodLocationMap({
  mode,
  userLocation,
  groupMembers = [],
  meetingPoint,
  stores,
  selectedStoreId,
  radiusKm,
  onSelectStore,
}: FoodLocationMapProps) {
  const [mapStyle, setMapStyle] = useState<MapStyle>("voyager");

  const userPosition = useMemo(
    () => getSafeLatLng(userLocation),
    [userLocation?.latitude, userLocation?.longitude],
  );

  const meetingPointPosition = useMemo(
    () => getSafeLatLng(meetingPoint),
    [meetingPoint?.latitude, meetingPoint?.longitude],
  );

  const validStoreEntries = useMemo<ValidStoreEntry[]>(
    () =>
      stores.flatMap((store) => {
        const position = getSafeLatLng(store);

        if (!position) {
          return [];
        }

        return [
          {
            store,
            position,
          },
        ];
      }),
    [stores],
  );

  const validMemberEntries = useMemo<ValidMemberEntry[]>(
    () =>
      groupMembers.flatMap((member, index) => {
        const position = getSafeLatLng(member.coordinates);

        if (!position) {
          return [];
        }

        return [
          {
            member,
            position,
            index,
          },
        ];
      }),
    [groupMembers],
  );

  const mapCenter = useMemo<SafeLatLng>(() => {
    if (mode === "group" && meetingPointPosition) {
      return meetingPointPosition;
    }

    if (userPosition) {
      return userPosition;
    }

    const firstStorePosition = validStoreEntries[0]?.position;

    if (firstStorePosition) {
      return firstStorePosition;
    }

    return DEFAULT_MAP_CENTER;
  }, [meetingPointPosition, mode, userPosition, validStoreEntries]);

  const safeMapCenter = isSafeLatLng(mapCenter)
    ? mapCenter
    : DEFAULT_MAP_CENTER;

  const selectedStoreEntry = useMemo(
    () =>
      validStoreEntries.find(({ store }) => store.uuid === selectedStoreId) ??
      null,
    [selectedStoreId, validStoreEntries],
  );

  const selectedStorePosition =
    selectedStoreEntry?.position && isSafeLatLng(selectedStoreEntry.position)
      ? selectedStoreEntry.position
      : null;

  const radiusMeters = useMemo(() => getSafeRadiusMeters(radiusKm), [radiusKm]);

  const allPositions = useMemo<SafeLatLng[]>(() => {
    const positions: Array<SafeLatLng | null> = [
      userPosition,
      meetingPointPosition,

      ...validMemberEntries.map(({ position }) => position),

      ...validStoreEntries.map(({ position }) => position),
    ];

    return positions.filter(isSafeLatLng);
  }, [
    meetingPointPosition,
    userPosition,
    validMemberEntries,
    validStoreEntries,
  ]);

  const focusPosition = useMemo(() => {
    if (mode === "group" && meetingPointPosition) {
      return meetingPointPosition;
    }

    return userPosition ?? meetingPointPosition ?? safeMapCenter;
  }, [meetingPointPosition, mode, safeMapCenter, userPosition]);

  const userMarkerIcon = useMemo(() => createUserMarker(), []);

  const meetingPointIcon = useMemo(() => createMeetingPointMarker(), []);

  const currentTile = MAP_TILES[mapStyle];

  return (
    <div className="foodhub-map relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 shadow-[0_18px_50px_rgba(15,23,42,0.10)] sm:rounded-[28px]">
      <MapContainer
        center={safeMapCenter}
        zoom={14}
        minZoom={5}
        maxZoom={20}
        zoomControl={false}
        scrollWheelZoom
        doubleClickZoom
        touchZoom
        className="h-[64dvh] min-h-[520px] w-full sm:h-[650px] md:min-h-[600px] lg:h-[720px] 2xl:h-[calc(100dvh-100px)] 2xl:min-h-[620px] 2xl:max-h-[900px]"
      >
        <TileLayer
          key={mapStyle}
          attribution={currentTile.attribution}
          url={currentTile.url}
          {...(currentTile.subdomains
            ? {
                subdomains: currentTile.subdomains,
              }
            : {})}
          maxZoom={20}
        />

        <MapViewportController
          center={safeMapCenter}
          selectedStorePosition={selectedStorePosition}
        />

        <FloatingMapControls
          allPositions={allPositions}
          focusPosition={focusPosition}
        />

        <ZoomControl position="bottomright" />

        <Circle
          center={safeMapCenter}
          radius={radiusMeters}
          interactive={false}
          pathOptions={{
            color: mode === "group" ? "#f97316" : "#2563eb",

            fillColor: mode === "group" ? "#fb923c" : "#3b82f6",

            fillOpacity: 0.055,
            opacity: 0.55,
            weight: 1.5,
            dashArray: "6 8",
          }}
        />

        {userPosition && (
          <Marker
            position={userPosition}
            icon={userMarkerIcon}
            zIndexOffset={1_200}
          >
            <Popup
              className="foodhub-map-popup"
              closeButton={false}
              minWidth={220}
              maxWidth={280}
            >
              <div className="p-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <IoLocateOutline className="text-[23px]" />
                  </span>

                  <div>
                    <p className="text-[17px] font-bold text-slate-900">
                      ទីតាំងរបស់អ្នក
                    </p>

                    <p className="mt-0.5 text-[17px] text-slate-500">
                      ទីតាំងបច្ចុប្បន្ន
                    </p>
                  </div>
                </div>

                {typeof userLocation?.accuracy === "number" &&
                  Number.isFinite(userLocation.accuracy) && (
                    <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[17px] text-slate-600">
                      ភាពត្រឹមត្រូវប្រហែល {Math.round(userLocation.accuracy)}
                      ម៉ែត្រ
                    </p>
                  )}
              </div>
            </Popup>
          </Marker>
        )}

        {mode === "group" &&
          validMemberEntries.map(({ member, position, index }) => (
            <Marker
              key={member.uuid}
              position={position}
              icon={createMemberMarker(member.name, index)}
              zIndexOffset={900 + index}
            >
              <Popup
                className="foodhub-map-popup"
                closeButton={false}
                minWidth={200}
              >
                <div className="flex items-center gap-3 p-1">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[17px] font-bold text-white"
                    style={{
                      backgroundColor:
                        MEMBER_COLORS[index % MEMBER_COLORS.length],
                    }}
                  >
                    {Array.from(member.name.trim() || String(index + 1))[0]}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-bold text-slate-900">
                      {member.name || `Member ${index + 1}`}
                    </p>

                    <p className="mt-0.5 text-[17px] text-slate-500">
                      ទីតាំងសមាជិកក្រុម
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {mode === "group" && meetingPointPosition && (
          <Marker
            position={meetingPointPosition}
            icon={meetingPointIcon}
            zIndexOffset={1_300}
          >
            <Popup
              className="foodhub-map-popup"
              closeButton={false}
              minWidth={230}
            >
              <div className="p-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <IoPeopleOutline className="text-[23px]" />
                  </span>

                  <div>
                    <p className="text-[17px] font-bold text-slate-900">
                      ចំណុចកណ្ដាលក្រុម
                    </p>

                    <p className="mt-0.5 text-[17px] text-slate-500">
                      ទីតាំងសមរម្យសម្រាប់មនុស្សគ្រប់គ្នា
                    </p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {validStoreEntries.map(({ store, position }) => {
          const selected = selectedStoreId === store.uuid;

          const displayName = getStoreDisplayName(store);

          const displayAddress = getStoreAddress(store);

          const storeStatus = getStoreStatus(store);

          const directionsUrl = createDirectionsUrl(position);

          return (
            <Marker
              key={store.uuid}
              position={position}
              icon={createStoreMarker(selected)}
              zIndexOffset={selected ? 1_100 : 500}
              riseOnHover
              eventHandlers={{
                click: () => onSelectStore(store.uuid),
              }}
            >
              <Popup
                className="foodhub-map-popup"
                closeButton={false}
                minWidth={250}
                maxWidth={310}
                autoPanPadding={[40, 40]}
              >
                <div className="w-[250px] max-w-[calc(100vw-78px)] p-1 sm:w-[278px]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                      <IoRestaurantOutline className="text-[24px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        role="heading"
                        aria-level={3}
                        className="line-clamp-2 text-[18px] font-bold leading-6 text-slate-900"
                      >
                        {displayName}
                      </p>

                      <p
                        className={`mt-1 text-[17px] font-semibold ${storeStatus.className}`}
                      >
                        {storeStatus.label}
                      </p>
                    </div>
                  </div>

                  {displayAddress && (
                    <p className="mt-3 flex items-start gap-2 text-[17px] leading-6 text-slate-500">
                      <IoLocationOutline className="mt-1 shrink-0 text-[17px] text-primary-600" />

                      <span>{displayAddress}</span>
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-amber-50 px-3 text-[17px] font-semibold text-amber-700">
                      <IoStar className="text-[17px]" />
                      {formatRating(store.averageRating)}
                    </span>

                    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-[17px] font-semibold text-blue-700">
                      <IoNavigateOutline className="text-[17px]" />
                      {formatDistance(store.distanceKm)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectStore(store.uuid)}
                      className="flex min-h-11 items-center justify-center rounded-xl bg-primary-800 px-3 text-[17px] font-bold text-white transition hover:bg-primary-700"
                    >
                      ជ្រើសរើស
                    </button>

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[17px] font-bold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:text-primary-dark"
                    >
                      <IoNavigateOutline className="text-[18px]" />
                      ទិសដៅ
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map style selector */}
      <div className="pointer-events-auto absolute left-3 top-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-[0_8px_28px_rgba(15,23,42,0.17)] backdrop-blur-md sm:left-4 sm:top-4 sm:max-w-none">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500">
          <IoLayersOutline className="text-[20px]" />
        </span>

        {(Object.keys(MAP_TILES) as MapStyle[]).map((style) => {
          const active = mapStyle === style;

          return (
            <button
              key={style}
              type="button"
              onClick={() => setMapStyle(style)}
              className={`min-h-9 rounded-xl px-3 text-[17px] font-bold transition sm:px-4 sm:text-[17px] ${
                active
                  ? "bg-primary-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {MAP_TILES[style].label}
            </button>
          );
        })}
      </div>

      {/* Responsive legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] hidden items-center gap-4 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-[17px] font-semibold text-slate-600 shadow-[0_8px_28px_rgba(15,23,42,0.14)] backdrop-blur-md md:flex">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow" />
          អ្នក
        </span>

        {mode === "group" && (
          <>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-white bg-violet-600 shadow" />
              សមាជិក
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-white bg-orange-500 shadow" />
              ចំណុចកណ្ដាល
            </span>
          </>
        )}

        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-white bg-primary-700 shadow" />
          ហាង
        </span>
      </div>
    </div>
  );
}
