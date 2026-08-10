"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  IoAddOutline,
  IoArrowForwardOutline,
  IoInformationCircleOutline,
  IoLinkOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

import type { GroupLocationMember } from "@/types/group-location";

import type { Coordinates } from "@/types/location";

import GroupMemberLocationCard, {
  type GroupMemberLocationDraft,
} from "./GroupMemberLocationCard";

interface GroupLocationSetupProps {
  groupName: string;
  members: GroupLocationMember[];
  currentLocation: Coordinates | null;
  sourceStoreCount: number;

  onGroupNameChange: (name: string) => void;
  onMembersChange: (members: GroupLocationMember[]) => void;
  onCalculate: () => void;
}

interface ResolveMapResponse {
  coordinates?: Coordinates;
  resolvedUrl?: string;
  label?: string;
  source?: "url" | "geocoding";
  error?: string;
}

const EMPTY_DRAFT: GroupMemberLocationDraft = {
  mapUrl: "",
  status: "idle",
  errorMessage: "",
  resolvedLabel: "",
  resolvedUrl: "",
};

function createMemberUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

function normalizeCoordinates(
  coordinates:
    | {
        latitude?: unknown;
        longitude?: unknown;
        accuracy?: unknown;
      }
    | null
    | undefined,
): Coordinates | null {
  if (!coordinates) {
    return null;
  }

  const latitude = toFiniteNumber(coordinates.latitude);

  const longitude = toFiniteNumber(coordinates.longitude);

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

  const accuracy = toFiniteNumber(coordinates.accuracy);

  return {
    latitude,
    longitude,
    ...(accuracy !== null && accuracy >= 0
      ? {
          accuracy,
        }
      : {}),
  };
}

function createGoogleMapsUrl(coordinates: Coordinates): string {
  const query = encodeURIComponent(
    `${coordinates.latitude},${coordinates.longitude}`,
  );

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function createInitialDraft(
  member: GroupLocationMember,
): GroupMemberLocationDraft {
  const coordinates = normalizeCoordinates(member.coordinates);

  if (!coordinates) {
    return {
      ...EMPTY_DRAFT,
    };
  }

  return {
    mapUrl: "",
    status: "ready",
    errorMessage: "",
    resolvedLabel: "ទីតាំងបច្ចុប្បន្ន",
    resolvedUrl: createGoogleMapsUrl(coordinates),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "មិនអាចរកទីតាំងពី Google Maps link នេះបានទេ។";
}

export default function GroupLocationSetup({
  groupName,
  members,
  currentLocation,
  sourceStoreCount,
  onGroupNameChange,
  onMembersChange,
  onCalculate,
}: GroupLocationSetupProps) {
  const [drafts, setDrafts] = useState<
    Record<string, GroupMemberLocationDraft>
  >(() =>
    Object.fromEntries(
      members.map((member) => [member.uuid, createInitialDraft(member)]),
    ),
  );

  const membersRef = useRef(members);

  const requestVersionsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    setDrafts((currentDrafts) => {
      const nextDrafts: Record<string, GroupMemberLocationDraft> = {};

      for (const member of members) {
        nextDrafts[member.uuid] =
          currentDrafts[member.uuid] ?? createInitialDraft(member);
      }

      return nextDrafts;
    });
  }, [members]);

  const safeCurrentLocation = useMemo(
    () => normalizeCoordinates(currentLocation),
    [
      currentLocation?.latitude,
      currentLocation?.longitude,
      currentLocation?.accuracy,
    ],
  );

  const readyCount = useMemo(
    () =>
      members.filter(
        (member) =>
          member.locationStatus === "ready" &&
          normalizeCoordinates(member.coordinates) !== null,
      ).length,
    [members],
  );

  const canCalculate =
    groupName.trim().length > 0 && readyCount >= 2 && sourceStoreCount > 0;

  const commitMembers = (nextMembers: GroupLocationMember[]) => {
    membersRef.current = nextMembers;
    onMembersChange(nextMembers);
  };

  const updateMember = (
    memberUuid: string,
    updater: (member: GroupLocationMember) => GroupLocationMember,
  ) => {
    const nextMembers = membersRef.current.map((member) =>
      member.uuid === memberUuid ? updater(member) : member,
    );

    commitMembers(nextMembers);
  };

  const handleNameChange = (memberUuid: string, name: string) => {
    updateMember(memberUuid, (member) => ({
      ...member,
      name,
    }));
  };

  const handleMapUrlChange = (memberUuid: string, mapUrl: string) => {
    requestVersionsRef.current[memberUuid] =
      (requestVersionsRef.current[memberUuid] ?? 0) + 1;

    setDrafts((currentDrafts) => ({
      ...currentDrafts,

      [memberUuid]: {
        ...(currentDrafts[memberUuid] ?? EMPTY_DRAFT),

        mapUrl,
        status: "idle",
        errorMessage: "",
        resolvedLabel: "",
        resolvedUrl: "",
      },
    }));

    updateMember(memberUuid, (member) => ({
      ...member,
      coordinates: null,
      locationStatus: "waiting",
    }));
  };

  const handleResolveMapUrl = async (memberUuid: string) => {
    const draft = drafts[memberUuid];

    const mapUrl = draft?.mapUrl.trim() ?? "";

    if (!mapUrl) {
      setDrafts((currentDrafts) => ({
        ...currentDrafts,

        [memberUuid]: {
          ...(currentDrafts[memberUuid] ?? EMPTY_DRAFT),

          status: "error",
          errorMessage: "សូមបញ្ចូល Google Maps link ជាមុនសិន។",
        },
      }));

      return;
    }

    const requestVersion = (requestVersionsRef.current[memberUuid] ?? 0) + 1;

    requestVersionsRef.current[memberUuid] = requestVersion;

    setDrafts((currentDrafts) => ({
      ...currentDrafts,

      [memberUuid]: {
        ...(currentDrafts[memberUuid] ?? EMPTY_DRAFT),

        status: "resolving",
        errorMessage: "",
      },
    }));

    try {
      const response = await fetch("/api/maps/resolve", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          mapUrl,
        }),
      });

      const data = (await response.json()) as ResolveMapResponse;

      if (requestVersionsRef.current[memberUuid] !== requestVersion) {
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Google Maps link នេះមិនអាចប្រើបានទេ។");
      }

      const coordinates = normalizeCoordinates(data.coordinates);

      if (!coordinates) {
        throw new Error("Google Maps link មិនមានទីតាំងត្រឹមត្រូវទេ។");
      }

      setDrafts((currentDrafts) => ({
        ...currentDrafts,

        [memberUuid]: {
          ...(currentDrafts[memberUuid] ?? EMPTY_DRAFT),

          mapUrl,
          status: "ready",
          errorMessage: "",

          resolvedLabel: data.label || "Google Maps location",

          resolvedUrl: data.resolvedUrl || mapUrl,
        },
      }));

      updateMember(memberUuid, (member) => ({
        ...member,
        coordinates,
        locationStatus: "ready",
      }));
    } catch (error) {
      if (requestVersionsRef.current[memberUuid] !== requestVersion) {
        return;
      }

      setDrafts((currentDrafts) => ({
        ...currentDrafts,

        [memberUuid]: {
          ...(currentDrafts[memberUuid] ?? EMPTY_DRAFT),

          status: "error",
          errorMessage: getErrorMessage(error),
          resolvedLabel: "",
          resolvedUrl: "",
        },
      }));

      updateMember(memberUuid, (member) => ({
        ...member,
        coordinates: null,
        locationStatus: "waiting",
      }));
    }
  };

  const handleUseCurrentLocation = (memberUuid: string) => {
    if (!safeCurrentLocation) {
      return;
    }

    requestVersionsRef.current[memberUuid] =
      (requestVersionsRef.current[memberUuid] ?? 0) + 1;

    const resolvedUrl = createGoogleMapsUrl(safeCurrentLocation);

    setDrafts((currentDrafts) => ({
      ...currentDrafts,

      [memberUuid]: {
        mapUrl: "",
        status: "ready",
        errorMessage: "",
        resolvedLabel: "ទីតាំងបច្ចុប្បន្នរបស់ខ្ញុំ",
        resolvedUrl,
      },
    }));

    updateMember(memberUuid, (member) => ({
      ...member,
      coordinates: safeCurrentLocation,
      locationStatus: "ready",
    }));
  };

  const handleAddMember = () => {
    const currentMembers = membersRef.current;

    const friendNumber = currentMembers.length;

    const newMember: GroupLocationMember = {
      uuid: createMemberUuid(),
      name: `មិត្តភក្តិ ${friendNumber}`,
      coordinates: null,
      locationStatus: "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: [],
      hasVoted: false,
    };

    commitMembers([...currentMembers, newMember]);

    setDrafts((currentDrafts) => ({
      ...currentDrafts,

      [newMember.uuid]: {
        ...EMPTY_DRAFT,
      },
    }));
  };

  const handleRemoveMember = (memberUuid: string) => {
    const currentMembers = membersRef.current;

    if (currentMembers.length <= 2) {
      return;
    }

    commitMembers(
      currentMembers.filter((member) => member.uuid !== memberUuid),
    );

    setDrafts((currentDrafts) => {
      const nextDrafts = {
        ...currentDrafts,
      };

      delete nextDrafts[memberUuid];

      return nextDrafts;
    });

    delete requestVersionsRef.current[memberUuid];
  };

  return (
    <section className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <IoPeopleOutline className="text-[23px]" />
            </span>

            <div className="min-w-0">
              <p className="text-[23px] font-bold leading-[1.45] text-primary-900 sm:text-[27px]">
                បន្ថែមទីតាំងសម្រាប់ក្រុម
              </p>

              <p className="mt-1 max-w-2xl text-[16px] leading-7 text-slate-500">
                បញ្ចូល Google Maps link របស់មិត្តភក្តិម្នាក់ៗ។ FoodHub
                នឹងរកទីតាំង និងគណនាចំណុចកណ្ដាលដោយស្វ័យប្រវត្តិ។
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[16px] font-semibold text-emerald-700">
            {readyCount}/{members.length} ទីតាំងរួចរាល់
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[16px] font-semibold text-slate-600">
            <IoStorefrontOutline className="text-[18px]" />
            {sourceStoreCount} ហាង
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-[22px] border border-primary-100 bg-primary-50/50 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block min-w-0">
          <span className="text-[16px] font-bold text-primary-900">
            ឈ្មោះក្រុម
          </span>

          <input
            type="text"
            value={groupName}
            onChange={(event) => onGroupNameChange(event.target.value)}
            placeholder="FoodHub Dinner Group"
            className="mt-2 min-h-[50px] w-full rounded-2xl border border-primary-100 bg-white px-4 text-[16px] text-primary-900 outline-none transition placeholder:text-slate-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
          />
        </label>

        <button
          type="button"
          onClick={handleAddMember}
          className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-5 text-[16px] font-bold text-primary-800 dark:text-primary-dark transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-100 lg:w-auto"
        >
          <IoAddOutline className="text-[22px]" />
          បន្ថែមមិត្តភក្តិ
        </button>
      </div>
      {/* 
      <div className="mt-4 rounded-[18px] border border-amber-100 bg-amber-50 px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <IoInformationCircleOutline className="mt-0.5 shrink-0 text-[22px] text-amber-600" />

          <div className="min-w-0">
            <p className="text-[16px] font-bold text-amber-800">
              របៀបយកទីតាំងពី Google Maps
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[16px] leading-7 text-amber-800">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                1. បើក Google Maps
              </span>

              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                2. ជ្រើសរើសទីតាំង
              </span>

              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                3. ចុច Share
              </span>

              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                4. Copy link
              </span>
            </div>
          </div>
        </div>
      </div> */}

      <div className="mt-5 space-y-4">
        <AnimatePresence initial={false}>
          {members.map((member, index) => (
            <GroupMemberLocationCard
              key={member.uuid}
              index={index}
              member={member}
              draft={
                drafts[member.uuid] ?? {
                  ...EMPTY_DRAFT,
                }
              }
              canRemove={index > 0 && members.length > 2}
              canUseCurrentLocation={
                index === 0 && safeCurrentLocation !== null
              }
              onNameChange={(name) => handleNameChange(member.uuid, name)}
              onMapUrlChange={(value) => handleMapUrlChange(member.uuid, value)}
              onResolveMapUrl={() => void handleResolveMapUrl(member.uuid)}
              onUseCurrentLocation={() => handleUseCurrentLocation(member.uuid)}
              onRemove={() => handleRemoveMember(member.uuid)}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="rounded-[18px] bg-slate-50 px-4 py-3">
          <p className="flex items-start gap-2 text-[16px] font-semibold leading-7 text-slate-600">
            {readyCount >= 2 ? (
              <IoLinkOutline className="mt-0.5 shrink-0 text-[20px] text-emerald-700" />
            ) : (
              <IoLocationOutline className="mt-0.5 shrink-0 text-[20px] text-primary-700" />
            )}

            <span>
              {readyCount >= 2
                ? `${readyCount} ទីតាំងរួចរាល់។ អាចស្វែងរកហាងសម្រាប់ក្រុមបាន។`
                : `ត្រូវការទីតាំងរួចរាល់បន្ថែម ${Math.max(
                    0,
                    2 - readyCount,
                  )} នាក់ទៀត។`}
            </span>
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{
            scale: canCalculate ? 0.98 : 1,
          }}
          disabled={!canCalculate}
          onClick={onCalculate}
          className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 text-[17px] font-bold text-white shadow-[0_12px_28px_rgba(249,115,22,0.23)] transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none sm:w-auto"
        >
          ស្វែងរកហាងសម្រាប់ក្រុម
          <IoArrowForwardOutline className="text-[21px]" />
        </motion.button>
      </div>
    </section>
  );
}
