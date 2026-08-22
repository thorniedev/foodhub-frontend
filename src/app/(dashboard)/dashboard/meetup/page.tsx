"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Link2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Vote,
  ExternalLink,
  Plus,
  Utensils,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Navigation,
} from "lucide-react";

interface MeetupHistoryItem {
  uuid: string;
  shareToken: string;
  title: string;
  mode: "FRIENDS" | "GUEST_LINK";
  status: "VOTING" | "DECIDED" | "COLLECTING";
  createdAt: string;
  participantCount: number;
  locationName?: string;
  radiusKm: number;
  winnerStore?: {
    name: string;
    foodTitle?: string;
    rating: number;
    mapsDirectionsUrl: string;
  };
}

const DEFAULT_HISTORY_SESSIONS: MeetupHistoryItem[] = [
  {
    uuid: "meetup-demo-1",
    shareToken: "fh_demo_friends",
    title: "ញ៉ាំបាយថ្ងៃត្រង់ជាមួយក្រុមការងារ BKK",
    mode: "FRIENDS",
    status: "DECIDED",
    createdAt: "2026-08-22T12:30:00Z",
    participantCount: 4,
    locationName: "BKK1, Phnom Penh",
    radiusKm: 3,
    winnerStore: {
      name: "Khmer Surin Restaurant",
      foodTitle: "Fish Amok & Fresh Coconut",
      rating: 4.8,
      mapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=11.5516,104.9250",
    },
  },
  {
    uuid: "meetup-demo-2",
    shareToken: "fh_demo_guest",
    title: "Weekend Team Dinner & Drinks",
    mode: "GUEST_LINK",
    status: "VOTING",
    createdAt: "2026-08-23T02:00:00Z",
    participantCount: 6,
    locationName: "Toul Kork, Phnom Penh",
    radiusKm: 5,
  },
];

export default function DashboardMeetupHistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"FRIENDS" | "GUEST_LINK">("FRIENDS");
  const [historyList, setHistoryList] = useState<MeetupHistoryItem[]>(DEFAULT_HISTORY_SESSIONS);

  useEffect(() => {
    // Load any saved meetup sessions created in the current browser
    try {
      const savedItems: MeetupHistoryItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("foodhub-meetup-share-")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.uuid) {
                savedItems.push({
                  uuid: parsed.uuid,
                  shareToken: parsed.shareToken || parsed.uuid,
                  title: parsed.title || "FoodHub Dining Meetup",
                  mode: parsed.inviteMode === "GUEST_LINK" ? "GUEST_LINK" : "FRIENDS",
                  status: parsed.status || "VOTING",
                  createdAt: parsed.createdAt || new Date().toISOString(),
                  participantCount: parsed.participantCount || 2,
                  radiusKm: parsed.radiusKm || 3,
                });
              }
            } catch {
              // ignore malformed items
            }
          }
        }
      }

      if (savedItems.length > 0) {
        // Merge with defaults avoiding duplicate UUIDs
        setHistoryList((prev) => {
          const existingUuids = new Set(prev.map((i) => i.uuid));
          const newUnique = savedItems.filter((i) => !existingUuids.has(i.uuid));
          return [...newUnique, ...prev];
        });
      }
    } catch {
      // localStorage unavailable or restricted
    }
  }, []);

  const filteredList = historyList.filter((item) => item.mode === activeTab);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ប្រវត្តិនៃការណាត់ញ៉ាំ (Meetup History)
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            ពិនិត្យមើលបន្ទប់បោះឆ្នោត និងលទ្ធផលហាងដែលបានសម្រេចពីមុន
          </p>
        </div>

        <Link
          href="/menu/location"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-98 shrink-0"
        >
          <Plus className="h-4 w-4" />
          បង្កើត Meetup ថ្មី (ទីតាំង)
        </Link>
      </div>

      {/* 2 Option Tabs: Friend Mode & Guest Link Mode */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab("FRIENDS")}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
            activeTab === "FRIENDS"
              ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Friend Mode ({historyList.filter((i) => i.mode === "FRIENDS").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("GUEST_LINK")}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
            activeTab === "GUEST_LINK"
              ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Link2 className="h-4 w-4" />
          <span>Guest Link Mode ({historyList.filter((i) => i.mode === "GUEST_LINK").length})</span>
        </button>
      </div>

      {/* History Items List */}
      {filteredList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Utensils className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">
            មិនទាន់មានប្រវត្តិ Meetup ក្នុង Mode នេះនៅឡើយទេ
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            ចូលទៅកាន់ផ្ទាំងទីតាំង ដើម្បីចាប់ផ្តើមបង្កើតការណាត់ជួបញ៉ាំអាហារជាមួយមិត្តភក្តិ ឬផ្ញើតំណភ្ញៀវ!
          </p>
          <Link
            href="/menu/location"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" /> ចាប់ផ្តើមឥឡូវនេះ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredList.map((item) => (
            <div
              key={item.uuid}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Top status & mode header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        item.mode === "FRIENDS"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {item.mode === "FRIENDS" ? (
                        <>
                          <Users className="h-3 w-3" /> Friend Mode
                        </>
                      ) : (
                        <>
                          <Link2 className="h-3 w-3" /> Guest Link
                        </>
                      )}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        item.status === "DECIDED"
                          ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                      }`}
                    >
                      {item.status === "DECIDED" ? (
                        <>
                          <Trophy className="h-3 w-3" /> បានសម្រេច (Decided)
                        </>
                      ) : (
                        <>
                          <Vote className="h-3 w-3 animate-pulse" /> កំពុងបោះឆ្នោត (Voting)
                        </>
                      )}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Meetup Title */}
                <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition dark:text-white dark:group-hover:text-emerald-400">
                  {item.title}
                </h3>

                {/* Details */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {item.participantCount} សមាជិក
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    កាំស្វែងរក {item.radiusKm} km
                  </span>
                </div>

                {/* Winner Card (if decided) */}
                {item.winnerStore && (
                  <div className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        🏆 ហាងដែលឈ្នះឆ្នោត (Winner)
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        ⭐ {item.winnerStore.rating}
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-sm text-slate-800 dark:text-slate-200">
                      {item.winnerStore.name}
                    </p>
                    {item.winnerStore.foodTitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.winnerStore.foodTitle}
                      </p>
                    )}
                    <a
                      href={item.winnerStore.mapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      <Navigation className="h-3.5 w-3.5" /> បើកមើលក្នុង Google Maps &rarr;
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/meet/${item.shareToken}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-98 dark:bg-slate-800 dark:hover:bg-emerald-600"
                >
                  <Vote className="h-3.5 w-3.5" />
                  ចូលបន្ទប់បោះឆ្នោត (Enter Room)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/meet/${item.shareToken}`;
                    navigator.clipboard.writeText(url);
                    alert("បានចម្លងតំណភ្ជាប់!");
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  title="Copy Link"
                >
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
