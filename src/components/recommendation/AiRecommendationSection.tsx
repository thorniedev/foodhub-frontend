// components/recommendation/AiRecommendationSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Users, User, AlertCircle, RefreshCw, MapPin, DollarSign } from "lucide-react";
import { 
  fetchUserProfiles, 
  getRecommendations 
} from "@/services/recommendationService";
import { 
  ProfileSummary, 
  RecommendationItemDto, 
  CreateSessionRequest 
} from "@/types/recommendation";

interface Props {
  authToken?: string; // Or retrieve from your auth context / session hook
}

export default function AiRecommendationSection({ authToken }: Props) {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedMode, setSelectedMode] = useState<"DEFAULT" | "SPECIFIC" | "ALL">("DEFAULT");
  const [selectedProfileUuid, setSelectedProfileUuid] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [items, setItems] = useState<RecommendationItemDto[]>([]);

  // 1. Fetch user profiles on mount
  useEffect(() => {
    async function loadProfiles() {
      try {
        const userProfiles = await fetchUserProfiles(authToken);
        setProfiles(userProfiles);

        const defaultProfile = userProfiles.find((p) => p.isDefault) || userProfiles[0];
        if (defaultProfile) {
          setSelectedProfileUuid(defaultProfile.uuid);
        }
      } catch (err: any) {
        console.error("Error loading profiles:", err);
      }
    }
    loadProfiles();
  }, [authToken]);

  // 2. Trigger recommendations
  async function handleGetRecommendations() {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let targetProfiles = [];
      let mode: "SINGLE" | "GROUP" = "SINGLE";

      if (selectedMode === "ALL") {
        mode = "GROUP";
        targetProfiles = profiles.map((p, idx) => ({
          profileId: p.uuid,
          isPrimary: p.isDefault || idx === 0,
        }));
      } else if (selectedMode === "SPECIFIC") {
        mode = "SINGLE";
        targetProfiles = [
          {
            profileId: selectedProfileUuid,
            isPrimary: true,
          },
        ];
      } else {
        // DEFAULT mode
        const defaultProf = profiles.find((p) => p.isDefault) || profiles[0];
        if (!defaultProf) {
          throw new Error("No profile found. Please create a profile first.");
        }
        mode = "SINGLE";
        targetProfiles = [
          {
            profileId: defaultProf.uuid,
            isPrimary: true,
          },
        ];
      }

      const requestPayload: CreateSessionRequest = {
        mode,
        requestSource: "WEB",
        searchRadiusKm: 5.0,
        currencyCode: "USD",
        requestedLimit: 20,
        profiles: targetProfiles,
      };

      const result = await getRecommendations(requestPayload, authToken);
      setItems(result.items || []);
    } catch (err: any) {
      console.error("Recommendation error:", err);
      setError(err.message || "Failed to fetch recommendations");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const defaultProfile = profiles.find((p) => p.isDefault);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AI Food Recommendation
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Personalized & allergy-safe recommendations tailored to your dining group
            </p>
          </div>

          {/* Trigger Button */}
          <button
            disabled={loading || profiles.length === 0}
            onClick={handleGetRecommendations}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Finding Food..." : "Find Best Matches"}
          </button>
        </div>

        {/* Profile Selector Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 uppercase mr-2">Recommend For:</span>

          {/* Option 1: Default Profile */}
          <button
            onClick={() => setSelectedMode("DEFAULT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedMode === "DEFAULT"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Default {defaultProfile ? `(${defaultProfile.profileName})` : ""}
          </button>

          {/* Option 2: Specific Profile */}
          <button
            onClick={() => setSelectedMode("SPECIFIC")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedMode === "SPECIFIC"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Specific Profile
          </button>

          {/* Option 3: All Profiles (Group Mode) */}
          <button
            onClick={() => setSelectedMode("ALL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedMode === "ALL"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All Profiles (Group Mode)
          </button>

          {/* Dropdown when Specific Profile is selected */}
          {selectedMode === "SPECIFIC" && (
            <select
              value={selectedProfileUuid}
              onChange={(e) => setSelectedProfileUuid(e.target.value)}
              className="ml-2 text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {profiles.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.profileName} {p.isDefault ? "★ (Default)" : `(${p.relationship})`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Recommendation Results or Fallback State */}
      {hasSearched && !loading && (
        <div>
          {items.length > 0 ? (
            /* Results Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <div
                  key={item.uuid}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Title + Match Score */}
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {item.menuItemName}
                      </h3>
                      <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {Math.round(item.finalScore * 100)}% Match
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                      {item.storeName}
                    </p>

                    {/* AI Reason Badge */}
                    {item.reasonText && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-2.5 text-xs text-amber-800 dark:text-amber-300 mb-3">
                        <span className="font-semibold">💡 Why recommended:</span> {item.reasonText}
                      </div>
                    )}
                  </div>

                  {/* Footer: Price and Distance */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1 text-sm text-zinc-900 dark:text-zinc-100 font-bold">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      {item.priceSnapshot != null ? item.priceSnapshot.toFixed(2) : "--"} {item.currencyCode || "USD"}
                    </span>
                    {item.distanceKm != null && (
                      <span className="flex items-center gap-1 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.distanceKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Strict Fallback State (Zero matching items) */
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-4">
              <div className="p-4 bg-amber-100 dark:bg-amber-950/50 rounded-2xl text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No Matching Food Found
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                We filtered out dishes that conflicted with your dietary, allergy, or budget restrictions to ensure safety.
              </p>
              <button
                onClick={handleGetRecommendations}
                className="mt-2 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 underline"
              >
                Retry with default search radius
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
