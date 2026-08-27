"use client";

import { Crown, MapPin, UserMinus, Users } from "lucide-react";

import type { MeetupParticipantResponse } from "@/types/meetup-api";

/**
 * Turns an account-derived nickname into something readable. Emails are
 * reduced to their local part so the room never displays a full address.
 */
export function toDisplayName(
  nickname: string | null,
  fallback: string,
): string {
  const trimmed = (nickname ?? "").trim();

  if (!trimmed) {
    return fallback;
  }

  const atIndex = trimmed.indexOf("@");
  const localPart = atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;

  return localPart.replace(/[._-]+/g, " ").trim() || fallback;
}

const ROLE_LABEL: Record<string, string> = {
  HOST: "ម្ចាស់ផ្ទះ",
  GUEST: "ភ្ញៀវ",
  MEMBER: "សមាជិក",
};

interface MeetupParticipantsPanelProps {
  participants: readonly MeetupParticipantResponse[];
  departedCount: number;
  myParticipantUuid: string | null;
  votedParticipantUuids: ReadonlySet<string>;
  canModerate: boolean;
  removingUuid: string | null;
  onRemove: (participantUuid: string) => void;
}

export default function MeetupParticipantsPanel({
  participants,
  departedCount,
  myParticipantUuid,
  votedParticipantUuids,
  canModerate,
  removingUuid,
  onRemove,
}: MeetupParticipantsPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base! font-black text-slate-900 dark:text-white">
          <Users className="h-4 w-4 shrink-0 text-primary-600" />
          អ្នកចូលរួម
        </h2>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-black text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
          {participants.length}
          {departedCount > 0 ? ` · ចាកចេញ ${departedCount}` : ""}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {participants.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs font-semibold text-slate-400 dark:border-slate-800">
            កំពុងរង់ចាំអ្នកចូលរួម។
          </li>
        ) : (
          participants.map((participant, index) => {
            const isMe = Boolean(
              participant.uuid && participant.uuid === myParticipantUuid,
            );
            const isHost = participant.participantRole === "HOST";
            const hasVoted = Boolean(
              participant.uuid && votedParticipantUuids.has(participant.uuid),
            );
            const hasLocation =
              participant.locationLat !== null &&
              participant.locationLng !== null;
            const displayName = toDisplayName(
              participant.nickname,
              `សមាជិក ${index + 1}`,
            );

            return (
              <li
                key={participant.uuid || index}
                className={`flex items-center gap-3 rounded-2xl p-2.5 ${
                  isMe
                    ? "bg-primary-50 ring-1 ring-primary-200 dark:bg-primary-950/40 dark:ring-primary-900"
                    : "bg-slate-50 dark:bg-slate-950/60"
                }`}
              >
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${
                    isHost ? "bg-accent-500" : "bg-primary-600"
                  }`}
                >
                  {displayName.charAt(0).toUpperCase()}
                  {hasVoted && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 dark:border-slate-900"
                      title="បានបោះឆ្នោត"
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-black capitalize text-slate-800 dark:text-slate-200">
                      {displayName}
                    </span>
                    {isHost && (
                      <Crown className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                    )}
                    {isMe && (
                      <span className="shrink-0 rounded-md bg-primary-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                        អ្នក
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    {ROLE_LABEL[participant.participantRole ?? "MEMBER"] ??
                      "សមាជិក"}
                    {hasLocation && (
                      <>
                        <span aria-hidden="true">·</span>
                        <MapPin className="h-3 w-3 shrink-0" />
                        បានចែករំលែកទីតាំង
                      </>
                    )}
                  </span>
                </span>

                {canModerate && !isHost && participant.uuid && (
                  <button
                    type="button"
                    onClick={() => onRemove(participant.uuid as string)}
                    disabled={removingUuid === participant.uuid}
                    aria-label={`ដក ${displayName} ចេញពីការណាត់ជួប`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/40"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
