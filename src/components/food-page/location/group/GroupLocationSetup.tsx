"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoAddOutline,
  IoArrowForwardOutline,
  IoInformationCircleOutline,
  IoLocationOutline,
  IoPeopleOutline,
} from "react-icons/io5";

import type { Coordinates } from "@/types/location";
import type { GroupLocationMember } from "@/types/group-location";

import GroupMemberLocationCard, {
  type GroupMemberCoordinateDraft,
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

const TEST_LOCATION_ONE: Coordinates = {
  latitude: 11.585434662926424,
  longitude: 104.90141312449312,
};

const TEST_LOCATION_TWO: Coordinates = {
  latitude: 11.542467002255107,
  longitude: 104.91519888192772,
};

function createMemberUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDraft(member: GroupLocationMember): GroupMemberCoordinateDraft {
  return {
    latitude:
      member.coordinates?.latitude !== undefined
        ? String(member.coordinates.latitude)
        : "",
    longitude:
      member.coordinates?.longitude !== undefined
        ? String(member.coordinates.longitude)
        : "",
  };
}

function parseCoordinates(
  draft: GroupMemberCoordinateDraft,
): Coordinates | null {
  if (!draft.latitude.trim() || !draft.longitude.trim()) {
    return null;
  }

  const latitude = Number(draft.latitude);
  const longitude = Number(draft.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
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
    Record<string, GroupMemberCoordinateDraft>
  >(() =>
    Object.fromEntries(members.map((member) => [member.uuid, toDraft(member)])),
  );

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<string, GroupMemberCoordinateDraft> = {};

      members.forEach((member) => {
        next[member.uuid] = current[member.uuid] ?? toDraft(member);
      });

      return next;
    });
  }, [members]);

  const readyCount = useMemo(
    () =>
      members.filter(
        (member) =>
          member.locationStatus === "ready" && member.coordinates !== null,
      ).length,
    [members],
  );

  const canCalculate =
    readyCount >= 2 && sourceStoreCount > 0 && groupName.trim().length > 0;

  const updateMember = (
    memberUuid: string,
    updater: (member: GroupLocationMember) => GroupLocationMember,
  ) => {
    onMembersChange(
      members.map((member) =>
        member.uuid === memberUuid ? updater(member) : member,
      ),
    );
  };

  const updateCoordinate = (
    memberUuid: string,
    field: keyof GroupMemberCoordinateDraft,
    value: string,
  ) => {
    const currentDraft = drafts[memberUuid] ?? {
      latitude: "",
      longitude: "",
    };

    const nextDraft = {
      ...currentDraft,
      [field]: value,
    };

    setDrafts((current) => ({
      ...current,
      [memberUuid]: nextDraft,
    }));

    const coordinates = parseCoordinates(nextDraft);

    updateMember(memberUuid, (member) => ({
      ...member,
      coordinates,
      locationStatus: coordinates ? "ready" : "waiting",
    }));
  };

  const useCoordinates = (memberUuid: string, coordinates: Coordinates) => {
    setDrafts((current) => ({
      ...current,
      [memberUuid]: {
        latitude: String(coordinates.latitude),
        longitude: String(coordinates.longitude),
      },
    }));

    updateMember(memberUuid, (member) => ({
      ...member,
      coordinates,
      locationStatus: "ready",
    }));
  };

  const addMember = () => {
    const friendNumber = members.length;

    onMembersChange([
      ...members,
      {
        uuid: createMemberUuid(),
        name: `មិត្តភក្តិ ${friendNumber}`,
        coordinates: null,
        locationStatus: "waiting",
        requiredDietaryCodes: [],
        blockedAllergenCodes: [],
        hasVoted: false,
      },
    ]);
  };

  const removeMember = (memberUuid: string) => {
    if (members.length <= 2) return;

    onMembersChange(members.filter((member) => member.uuid !== memberUuid));

    setDrafts((current) => {
      const next = { ...current };
      delete next[memberUuid];
      return next;
    });
  };

  const useTestLocations = () => {
    const nextMembers = members.map((member, index) => {
      if (index === 0) {
        return {
          ...member,
          coordinates: TEST_LOCATION_ONE,
          locationStatus: "ready" as const,
        };
      }

      if (index === 1) {
        return {
          ...member,
          coordinates: TEST_LOCATION_TWO,
          locationStatus: "ready" as const,
        };
      }

      return member;
    });

    const firstMember = nextMembers[0];
    const secondMember = nextMembers[1];

    if (!firstMember || !secondMember) return;

    setDrafts((current) => ({
      ...current,
      [firstMember.uuid]: {
        latitude: String(TEST_LOCATION_ONE.latitude),
        longitude: String(TEST_LOCATION_ONE.longitude),
      },
      [secondMember.uuid]: {
        latitude: String(TEST_LOCATION_TWO.latitude),
        longitude: String(TEST_LOCATION_TWO.longitude),
      },
    }));

    onMembersChange(nextMembers);
  };

  return (
    <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-6 lg:p-8">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 rounded-[22px] border border-primary-100 bg-primary-50/60 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block min-w-0">
            <span className="flex items-center gap-2 text-[17px] font-bold text-primary-900">
              <IoPeopleOutline className="text-[21px] text-primary-700" />
              ឈ្មោះក្រុម
            </span>
            <input
              value={groupName}
              onChange={(event) => onGroupNameChange(event.target.value)}
              placeholder="FoodHub Dinner Group"
              className="mt-2 min-h-13 w-full rounded-[17px] border border-primary-100 bg-white px-4 text-[17px] text-primary-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            />
          </label>

          <button
            type="button"
            onClick={addMember}
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 text-[17px] font-bold text-primary-800 transition hover:bg-primary-50 lg:w-auto"
          >
            <IoAddOutline className="text-[23px]" />
            បន្ថែមមិត្តភក្តិ
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[18px] border border-amber-100 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <IoInformationCircleOutline className="mt-0.5 shrink-0 text-[22px] text-amber-600" />
            <p className="text-[16px] leading-7 text-amber-800">
              ត្រូវការទីតាំងត្រឹមត្រូវយ៉ាងហោចណាស់ 2 នាក់។
              មិត្តភក្តិមិនចាំបាច់ចូលក្រុមនៅជំហាននេះទេ—ពួកគេចូលតាមតំណបោះឆ្នោតនៅពេលក្រោយ។
            </p>
          </div>

          {process.env.NODE_ENV !== "production" && (
            <button
              type="button"
              onClick={useTestLocations}
              className="shrink-0 rounded-full bg-white px-4 py-2 text-[16px] font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100"
            >
              ប្រើទីតាំងសាកល្បង
            </button>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <AnimatePresence initial={false}>
            {members.map((member, index) => (
              <GroupMemberLocationCard
                key={member.uuid}
                index={index}
                member={member}
                draft={drafts[member.uuid] ?? toDraft(member)}
                canRemove={index > 0 && members.length > 2}
                canUseCurrentLocation={index === 0 && currentLocation !== null}
                onNameChange={(name) =>
                  updateMember(member.uuid, (current) => ({
                    ...current,
                    name,
                  }))
                }
                onCoordinateChange={(field, value) =>
                  updateCoordinate(member.uuid, field, value)
                }
                onUseCurrentLocation={() => {
                  if (currentLocation) {
                    useCoordinates(member.uuid, currentLocation);
                  }
                }}
                onRemove={() => removeMember(member.uuid)}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="rounded-[18px] bg-gray-50 px-4 py-3">
            <p className="flex items-center gap-2 text-[16px] font-semibold text-gray-600">
              <IoLocationOutline className="text-[20px] text-primary-700" />
              {readyCount >= 2
                ? `${readyCount} ទីតាំងរួចរាល់—អាចគណនាចំណុចកណ្ដាលបាន។`
                : `បញ្ចូលទីតាំងបន្ថែម ${2 - readyCount} នាក់ទៀត។`}
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: canCalculate ? 0.98 : 1 }}
            disabled={!canCalculate}
            onClick={onCalculate}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-7 text-[18px] font-bold text-white shadow-[0_12px_28px_rgba(249,115,22,0.25)] transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            ស្វែងរកហាងសម្រាប់ក្រុម
            <IoArrowForwardOutline className="text-[22px]" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
