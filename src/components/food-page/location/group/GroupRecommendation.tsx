"use client";
import type { Store } from "@/types/store";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoTrophyOutline,
} from "react-icons/io5";

import { FaStar, FaStore } from "react-icons/fa";

import type { MenuItem } from "@/types/manu";

import type {
  GroupMember,
  GroupStage,
  GroupVote,
} from "@/types/group-recommendation";

import type {
  Coordinates,
  LocationFiltersState,
  LocationViewMode,
  RecommendedStore,
} from "@/types/location";

import { calculateGroupMidpoint, offsetCoordinates } from "@/lib/location/geo";

import {
  buildRecommendedStores,
  filterAndSortRecommendedStores,
} from "@/lib/location/recommendation";

import { castOrReplaceVote, resolveWinningStore } from "@/lib/location/voting";

import MobileLocationToolbar from "../MobileLocationToolbar";
import LocationEmptyState from "../LocationEmptyState";

import GroupMemberList from "./GroupMemberList";
import GroupMeetingPoint from "./GroupMeetingPoint";
import GroupSetup from "./GroupSetup";
import GroupStoreCard from "./GroupStoreCard";
import VotingResult from "./VotingResult";

const FoodLocationMap = dynamic(() => import("../FoodLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[62dvh] min-h-[480px] animate-pulse rounded-[26px] bg-gray-100 md:h-[680px]" />
  ),
});

const CURRENT_MEMBER_UUID = "current-user";

interface GroupRecommendationProps {
  menuItems: MenuItem[];
  stores: Store[];
  userLocation: Coordinates | null;
  filters: LocationFiltersState;
  searchQuery: string;
  onOpenFilters: () => void;
  onResultCountChange: (count: number) => void;
}

interface VotingStore extends RecommendedStore {
  voteCount: number;
  percentage: number;
}

function createInitialMembers(userLocation: Coordinates | null): GroupMember[] {
  return [
    {
      uuid: CURRENT_MEMBER_UUID,
      name: "You",
      coordinates: userLocation,
      locationStatus: userLocation ? "ready" : "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: [],
      hasVoted: false,
    },
    {
      uuid: "member-dara",
      name: "Dara",
      coordinates: null,
      locationStatus: "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: ["peanut"],
      hasVoted: false,
    },
    {
      uuid: "member-lyta",
      name: "Lyta",
      coordinates: null,
      locationStatus: "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: ["shellfish"],
      hasVoted: false,
    },
    {
      uuid: "member-souheng",
      name: "Souheng",
      coordinates: null,
      locationStatus: "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: [],
      hasVoted: false,
    },
  ];
}

function getRecommendationPercentage(score: number): number {
  const normalizedScore = score <= 1 ? score * 100 : score;

  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

export default function GroupRecommendation({
  menuItems,
  stores: backendStores,
  userLocation,
  filters,
  searchQuery,
  onOpenFilters,
  onResultCountChange,
}: GroupRecommendationProps) {
  const [stage, setStage] = useState<GroupStage>("setup");

  const [groupName, setGroupName] = useState("FoodHub Dinner Group");

  const [inviteCode, setInviteCode] = useState("FH-28A9");

  const [members, setMembers] = useState<GroupMember[]>(() =>
    createInitialMembers(userLocation),
  );

  const [meetingPoint, setMeetingPoint] = useState<Coordinates | null>(null);

  const [votes, setVotes] = useState<GroupVote[]>([]);

  const [view, setView] = useState<LocationViewMode>("list");

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const [winner, setWinner] = useState<RecommendedStore | null>(null);

  const [votingPanelOpen, setVotingPanelOpen] = useState(false);

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.uuid === CURRENT_MEMBER_UUID
          ? {
              ...member,
              coordinates: userLocation,
              locationStatus: "ready",
            }
          : member,
      ),
    );
  }, [userLocation]);

  const recommendedStores = useMemo(
    () =>
      buildRecommendedStores({
        menuItems,
        stores: backendStores,
        referencePoint: meetingPoint,
        groupMembers: members,
        votes,
      }),
    [backendStores, meetingPoint, members, menuItems, votes],
  );

  const filteredStores = useMemo(
    () =>
      filterAndSortRecommendedStores({
        stores: recommendedStores,
        filters,
        mode: "group",
        searchQuery,
      }),
    [filters, recommendedStores, searchQuery],
  );

  useEffect(() => {
    const canShowResults = stage === "recommendations" || stage === "voting";

    onResultCountChange(canShowResults ? filteredStores.length : 0);
  }, [filteredStores.length, onResultCountChange, stage]);

  const currentVote = useMemo(
    () => votes.find((vote) => vote.memberUuid === CURRENT_MEMBER_UUID),
    [votes],
  );

  const votedCount = useMemo(
    () => new Set(votes.map((vote) => vote.memberUuid)).size,
    [votes],
  );

  const votingStores = useMemo<VotingStore[]>(() => {
    return filteredStores
      .map((store) => {
        const voteCount = votes.filter(
          (vote) => vote.storeUuid === store.uuid,
        ).length;

        const percentage =
          votedCount > 0 ? Math.round((voteCount / votedCount) * 100) : 0;

        return {
          ...store,
          voteCount,
          percentage,
        };
      })
      .sort((first, second) => {
        if (second.voteCount !== first.voteCount) {
          return second.voteCount - first.voteCount;
        }

        if (second.recommendationScore !== first.recommendationScore) {
          return second.recommendationScore - first.recommendationScore;
        }

        return first.distanceKm - second.distanceKm;
      });
  }, [filteredStores, votedCount, votes]);

  const startGroup = (name: string) => {
    setGroupName(name);

    setInviteCode(`FH-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);

    setMembers(createInitialMembers(userLocation));

    setVotes([]);
    setMeetingPoint(null);
    setWinner(null);
    setSelectedStoreId(null);
    setStage("waiting");
  };

  const joinGroup = (code: string) => {
    setGroupName("Joined FoodHub Group");
    setInviteCode(code);

    setMembers(createInitialMembers(userLocation));

    setVotes([]);
    setMeetingPoint(null);
    setWinner(null);
    setSelectedStoreId(null);
    setStage("waiting");
  };

  const simulateMemberLocations = () => {
    const origin =
      userLocation ??
      ({
        latitude: 11.5564,
        longitude: 104.9282,
      } satisfies Coordinates);

    const offsets = [
      {
        latitude: 0,
        longitude: 0,
      },
      {
        latitude: 0.018,
        longitude: -0.015,
      },
      {
        latitude: -0.014,
        longitude: 0.02,
      },
      {
        latitude: 0.01,
        longitude: 0.024,
      },
    ];

    setMembers((currentMembers) =>
      currentMembers.map((member, index) => ({
        ...member,
        coordinates: offsetCoordinates(
          origin,
          offsets[index]?.latitude ?? 0,
          offsets[index]?.longitude ?? 0,
        ),
        locationStatus: "ready",
      })),
    );
  };

  const calculateMidpointAndRecommend = () => {
    const midpoint = calculateGroupMidpoint(members);

    if (!midpoint) {
      return;
    }

    setMeetingPoint(midpoint);
    setStage("recommendations");
  };

  const createSeededVotes = (): GroupVote[] => {
    const seededVotes: GroupVote[] = [];

    members
      .filter((member) => member.uuid !== CURRENT_MEMBER_UUID)
      .forEach((member, index) => {
        const store =
          filteredStores[index % Math.max(filteredStores.length, 1)];

        if (!store) {
          return;
        }

        seededVotes.push({
          memberUuid: member.uuid,
          storeUuid: store.uuid,
          createdAt: new Date().toISOString(),
        });
      });

    return seededVotes;
  };

  const beginVotingIfNeeded = () => {
    if (stage === "voting") {
      return;
    }

    setVotes(createSeededVotes());
    setStage("voting");
  };

  const openVotingPanel = (storeUuid?: string) => {
    if (filteredStores.length === 0) {
      return;
    }

    beginVotingIfNeeded();

    if (storeUuid) {
      setSelectedStoreId(storeUuid);
    }

    setVotingPanelOpen(true);
  };

  const closeVotingPanel = () => {
    setVotingPanelOpen(false);
  };

  const castVote = (storeUuid: string) => {
    setSelectedStoreId(storeUuid);

    setVotes((currentVotes) =>
      castOrReplaceVote(currentVotes, CURRENT_MEMBER_UUID, storeUuid),
    );
  };

  const finishVoting = () => {
    const winningStore = resolveWinningStore(filteredStores, votes);

    if (!winningStore) {
      return;
    }

    setWinner(winningStore);
    setVotingPanelOpen(false);
    setStage("completed");
  };

  const restart = () => {
    setStage("setup");
    setMeetingPoint(null);
    setVotes([]);
    setWinner(null);
    setSelectedStoreId(null);
    setVotingPanelOpen(false);

    onResultCountChange(0);
  };

  if (stage === "setup") {
    return <GroupSetup onCreateGroup={startGroup} onJoinGroup={joinGroup} />;
  }

  if (stage === "waiting") {
    return (
      <GroupMemberList
        groupName={groupName}
        inviteCode={inviteCode}
        members={members}
        onSimulateLocations={simulateMemberLocations}
        onCalculateMidpoint={calculateMidpointAndRecommend}
      />
    );
  }

  if (stage === "completed" && winner) {
    return <VotingResult winner={winner} onRestart={restart} />;
  }

  if (!meetingPoint) {
    return (
      <LocationEmptyState
        title="មិនអាចគណនាចំណុចកណ្ដាល"
        description="សូមរង់ចាំរហូតដល់សមាជិកក្រុមបានចែករំលែកទីតាំងរួចរាល់។"
      />
    );
  }

  const storeList = (
    <div className="space-y-4 2xl:max-h-[calc(100vh-330px)] 2xl:overflow-y-auto 2xl:pr-1 2xl:[scrollbar-width:none] 2xl:[&::-webkit-scrollbar]:hidden">
      {filteredStores.length === 0 ? (
        <LocationEmptyState />
      ) : (
        filteredStores.map((store) => (
          <GroupStoreCard
            key={store.uuid}
            store={store}
            selected={selectedStoreId === store.uuid}
            votingEnabled={stage === "recommendations" || stage === "voting"}
            hasVoted={currentVote?.storeUuid === store.uuid}
            onSelect={() => setSelectedStoreId(store.uuid)}
            onVote={() => openVotingPanel(store.uuid)}
          />
        ))
      )}
    </div>
  );

  const map = (
    <FoodLocationMap
      mode="group"
      userLocation={userLocation}
      groupMembers={members}
      meetingPoint={meetingPoint}
      stores={filteredStores}
      selectedStoreId={selectedStoreId}
      radiusKm={filters.radiusKm}
      onSelectStore={setSelectedStoreId}
    />
  );

  return (
    <section>
      <GroupMeetingPoint meetingPoint={meetingPoint} members={members} />

      {stage === "recommendations" && (
        <div className="mb-5 flex flex-col gap-4 rounded-[22px] border border-primary-100 bg-primary-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[17px] font-semibold text-primary-900">
              {filteredStores.length} group-safe stores found
            </p>

            <p className="mt-1 text-[16px] leading-7 text-gray-600">
              ពិនិត្យមើលហាងដែលបានណែនាំ ហើយបើកផ្ទាំងបោះឆ្នោតសម្រាប់ក្រុម។
            </p>
          </div>

          <button
            type="button"
            disabled={filteredStores.length === 0}
            onClick={() => openVotingPanel()}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-[16px] font-semibold text-white transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IoTrophyOutline className="text-[20px]" />
            បើកផ្ទាំងបោះឆ្នោត
          </button>
        </div>
      )}

      {stage === "voting" && (
        <div className="mb-5 flex flex-col gap-4 rounded-[22px] border border-primary-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <IoTrophyOutline className="text-[22px]" />
            </div>

            <div>
              <p className="text-[17px] font-semibold text-primary-900">
                ការបោះឆ្នោតកំពុងដំណើរការ
              </p>

              <p className="mt-1 text-[16px] leading-7 text-gray-500">
                {votedCount} ក្នុងចំណោម {members.length} សមាជិកបានបោះឆ្នោត។
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openVotingPanel()}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary-800 px-5 text-[16px] font-semibold text-white transition hover:bg-primary-700"
          >
            <IoPeopleOutline className="text-[20px]" />
            មើលការបោះឆ្នោត
          </button>
        </div>
      )}

      <MobileLocationToolbar
        view={view}
        onViewChange={setView}
        onOpenFilters={onOpenFilters}
      />

      <div className="2xl:hidden">{view === "list" ? storeList : map}</div>

      <div className="hidden min-w-0 gap-5 2xl:grid 2xl:grid-cols-[minmax(380px,42%)_minmax(0,58%)]">
        <div className="min-w-0">{storeList}</div>

        <div className="min-w-0">
          <div className="sticky top-24">{map}</div>
        </div>
      </div>

      <VotingPanel
        open={votingPanelOpen}
        stores={votingStores}
        memberCount={members.length}
        votedCount={votedCount}
        selectedStoreId={currentVote?.storeUuid ?? null}
        onVote={castVote}
        onFinish={finishVoting}
        onClose={closeVotingPanel}
      />
    </section>
  );
}

interface VotingPanelProps {
  open: boolean;
  stores: VotingStore[];
  memberCount: number;
  votedCount: number;
  selectedStoreId: string | null;
  onVote: (storeUuid: string) => void;
  onFinish: () => void;
  onClose: () => void;
}

function VotingPanel({
  open,
  stores,
  memberCount,
  votedCount,
  selectedStoreId,
  onVote,
  onFinish,
  onClose,
}: VotingPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="group-voting-panel"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-[3px] md:items-center md:p-6"
        >
          <button
            type="button"
            aria-label="Close voting panel"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-voting-title"
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative z-10 flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-gray-100 bg-[#fafaf8] shadow-2xl md:h-auto md:max-h-[88dvh] md:max-w-5xl md:rounded-[28px]"
          >
            <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-primary-700">
                    <IoTrophyOutline className="text-[21px]" />

                    <p className="text-[16px] font-semibold">Group voting</p>
                  </div>

                  <h2
                    id="group-voting-title"
                    className="mt-1 text-[21px] font-semibold leading-8 text-primary-900 sm:text-[23px]"
                  >
                    ជ្រើសរើសហាងសម្រាប់ក្រុម
                  </h2>

                  <p className="mt-1 text-[16px] leading-7 text-gray-500">
                    សមាជិកម្នាក់អាចបោះឆ្នោតបានមួយសំឡេង
                    និងអាចផ្លាស់ប្ដូរបានមុនបញ្ចប់។
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close voting panel"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                >
                  <IoCloseOutline className="text-[24px]" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <VotingSummary
                  icon={<IoPeopleOutline />}
                  label="បានបោះឆ្នោត"
                  value={`${votedCount} / ${memberCount}`}
                />

                <VotingSummary
                  icon={<FaStore />}
                  label="ហាងណែនាំ"
                  value={String(stores.length)}
                />

                <div className="col-span-2 sm:col-span-1">
                  <VotingSummary
                    icon={<IoCheckmarkCircleOutline />}
                    label="សំឡេងរបស់អ្នក"
                    value={selectedStoreId ? "បានបោះឆ្នោត" : "មិនទាន់បោះឆ្នោត"}
                  />
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              {stores.length === 0 ? (
                <LocationEmptyState
                  title="មិនមានហាងសម្រាប់បោះឆ្នោត"
                  description="សូមពិនិត្យតម្រង ឬគណនាការណែនាំសម្រាប់ក្រុមម្តងទៀត។"
                />
              ) : (
                <div className="space-y-3">
                  {stores.map((store, index) => (
                    <VotingStoreRow
                      key={store.uuid}
                      rank={index + 1}
                      store={store}
                      selected={selectedStoreId === store.uuid}
                      onVote={() => onVote(store.uuid)}
                    />
                  ))}
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[16px] leading-7 text-gray-500">
                  {selectedStoreId
                    ? "អ្នកអាចផ្លាស់ប្ដូរសំឡេងឆ្នោតរបស់អ្នកបាន។"
                    : "សូមជ្រើសរើសហាងមួយដើម្បីបោះឆ្នោត។"}
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-11 rounded-full border border-gray-200 bg-white px-5 text-[16px] font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    បិទ
                  </button>

                  <button
                    type="button"
                    disabled={votedCount === 0}
                    onClick={onFinish}
                    className="min-h-11 rounded-full bg-primary-800 px-5 text-[16px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    បញ្ចប់ការបោះឆ្នោត
                  </button>
                </div>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface VotingStoreRowProps {
  rank: number;
  store: VotingStore;
  selected: boolean;
  onVote: () => void;
}

function VotingStoreRow({
  rank,
  store,
  selected,
  onVote,
}: VotingStoreRowProps) {
  return (
    <article
      className={`rounded-[20px] border bg-white p-4 transition ${
        selected
          ? "border-primary-600 ring-2 ring-primary-100"
          : "border-gray-100 hover:border-primary-200 hover:shadow-sm"
      }`}
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-semibold ${
            rank === 1
              ? "bg-yellow-100 text-yellow-700"
              : rank === 2
                ? "bg-gray-200 text-gray-700 dark:text-gray-100"
                : rank === 3
                  ? "bg-orange-100 text-orange-700"
                  : "bg-primary-50 text-primary-700"
          }`}
        >
          {rank}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[17px] font-semibold text-primary-900">
              {store.localName || store.name}
            </h3>

            {selected && (
              <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[14px] dark:text-emerald-400 font-semibold text-primary-800">
                សំឡេងរបស់អ្នក
              </span>
            )}
          </div>

          {store.localName && (
            <p className="mt-0.5 truncate text-[16px] text-gray-500">
              {store.name}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-gray-500">
            <span className="flex items-center gap-1.5 text-yellow-500">
              <FaStar />
              {store.averageRating}
            </span>

            <span className="flex items-center gap-1.5">
              <IoLocationOutline />
              {store.distanceKm.toFixed(1)} km
            </span>

            <span>{store.menuCount} មុខម្ហូប</span>

            <span>
              {getRecommendationPercentage(store.recommendationScore)}% match
            </span>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[15px] font-medium text-gray-600">
                {store.voteCount} votes
              </span>

              <span className="text-[15px] font-semibold text-primary-700">
                {store.percentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${store.percentage}%`,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="h-full rounded-full bg-primary-700"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onVote}
          className={`min-h-11 w-full shrink-0 rounded-full px-5 text-[16px] font-semibold transition sm:w-auto ${
            selected
              ? "border border-primary-200 bg-primary-50 text-primary-800"
              : "bg-primary-800 text-white hover:bg-primary-700"
          }`}
        >
          {selected ? "បានបោះឆ្នោត" : "បោះឆ្នោត"}
        </button>
      </div>
    </article>
  );
}

interface VotingSummaryProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function VotingSummary({ icon, label, value }: VotingSummaryProps) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-gray-100 bg-gray-50 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[18px] text-primary-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[14px] text-gray-500">{label}</p>

        <p className="truncate text-[16px] font-semibold text-primary-900">
          {value}
        </p>
      </div>
    </div>
  );
}
