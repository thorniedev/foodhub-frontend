"use client";

import { useEffect, useState } from "react";
import { X, Filter, RotateCcw, Check, Flame, DollarSign, Clock, ShieldCheck, ChevronDown, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetDiscoveryFiltersQuery } from "@/app/store/searchApi";
import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { isDrinkCategory, isFoodCategory, type CategoryFilterType } from "@/lib/category-filter";
import { CustomSelect } from "@/components/shared/CustomSelect";
import type { CustomerSearchRequest, FilterItemOption } from "@/types/search";

interface DiscoveryFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CustomerSearchRequest;
  onApplyFilters: (newFilters: CustomerSearchRequest) => void;
  onResetFilters: () => void;
}

function formatAgeGroupOptionLabel(a: FilterItemOption | any): string {
  const item = a as any;
  const min = item?.minAge ?? item?.minimumAge ?? item?.min_age;
  const max = item?.maxAge ?? item?.maximumAge ?? item?.max_age;

  if (min !== undefined && min !== null && max !== undefined && max !== null) {
    return `${a.name} (${min}-${max})`;
  }
  if (min !== undefined && min !== null && (max === undefined || max === null)) {
    return `${a.name} (${min}+)`;
  }
  if ((min === undefined || min === null) && max !== undefined && max !== null) {
    return `${a.name} (≤${max})`;
  }

  // Fallback ranges for standard FoodHub age groups
  const key = `${a.name || ""} ${a.code || ""}`.toLowerCase();
  if (key.includes("កុមារតូច") || key.includes("toddler") || key.includes("infant")) {
    return `${a.name} (0-2)`;
  }
  if (key.includes("កុមារ") || key.includes("child") || key.includes("kid")) {
    return `${a.name} (3-12)`;
  }
  if (key.includes("យុវវ័យ") || key.includes("យុវជន") || key.includes("teen") || key.includes("youth")) {
    return `${a.name} (13-17)`;
  }
  if (key.includes("មនុស្សពេញវ័យ") || key.includes("adult")) {
    return `${a.name} (18-59)`;
  }
  if (key.includes("មនុស្សវ័យចំណាស់") || key.includes("វ័យចំណាស់") || key.includes("senior") || key.includes("elderly")) {
    return `${a.name} (60+)`;
  }

  return a.name;
}

export default function DiscoveryFilterSheet({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: DiscoveryFilterSheetProps) {
  const { data: filterOptions, isLoading } = useGetDiscoveryFiltersQuery();
  const { data: profileResponse } = useGetMemberProfilesQuery();

  const memberProfiles = Array.isArray(profileResponse)
    ? profileResponse
    : profileResponse?.contents ?? [];

  const [draft, setDraft] = useState<CustomerSearchRequest>(filters);
  const [categoryType, setCategoryType] = useState<CategoryFilterType>("ALL");
  const [categoryQuery, setCategoryQuery] = useState("");

  // Sync draft state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  const filteredCategories = (filterOptions?.categories || []).filter((cat) => {
    if (categoryType === "FOOD" && !isFoodCategory(cat)) return false;
    if (categoryType === "DRINK" && !isDrinkCategory(cat)) return false;
    if (categoryQuery.trim()) {
      return (cat.name || "")
        .toLowerCase()
        .includes(categoryQuery.trim().toLowerCase());
    }
    return true;
  });

  if (!isOpen) return null;

  const toggleArrayItem = (key: keyof CustomerSearchRequest, value: string) => {
    const currentArray = (draft[key] as string[]) || [];
    const exists = currentArray.includes(value);
    const updated = exists
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];

    setDraft({
      ...draft,
      [key]: updated.length > 0 ? updated : undefined,
    });
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  // Count active filters
  const activeCount =
    (draft.categoryUuids?.length || 0) +
    (draft.cuisineUuids?.length || 0) +
    (draft.mealTypeUuids?.length || 0) +
    (draft.dietaryTypeUuids?.length || 0) +
    (draft.excludeAllergenUuids?.length || 0) +
    (draft.seasonUuids?.length || 0) +
    (draft.eventUuids?.length || 0) +
    (draft.weatherConditionUuids?.length || 0) +
    (draft.ageGroupUuids?.length || 0) +
    (draft.provinces?.length || 0) +
    (draft.cities?.length || 0) +
    (draft.openNow ? 1 : 0) +
    (draft.minimumPrice !== undefined || draft.maximumPrice !== undefined ? 1 : 0) +
    (draft.minimumSpiceLevel !== undefined || draft.maximumSpiceLevel !== undefined ? 1 : 0) +
    (draft.maxPreparationTimeMinutes !== undefined ? 1 : 0) +
    (draft.profileUuid ? 1 : 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex justify-end bg-black/60 backdrop-blur-sm overflow-hidden">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Responsive Drawer Sheet */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative z-10 flex flex-col w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                តម្រងស្វែងរក
              </h2>
              {activeCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white">
                  {activeCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 animate-pulse">
                កំពុងទាញយកជម្រើសតម្រង...
              </div>
            ) : (
              <>
                {/* Profile Safety Evaluation (Hidden per request)
                <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-sm text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      វាយតម្លៃសុវត្ថិភាពម្ហូប
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    ជ្រើសរើសប្រវត្តិរូបដើម្បីពិនិត្យអាលែហ្ស៊ី និងការហាមឃាត់ធាតុផ្សំសម្រាប់អ្នក។
                  </p>
                  <CustomSelect
                    value={draft.profileUuid || ""}
                    onChange={(val) =>
                      setDraft({
                        ...draft,
                        profileUuid: val || undefined,
                      })
                    }
                    options={[
                      { value: "", label: "-- មិនជ្រើសរើសប្រវត្តិរូប --" },
                      ...memberProfiles.map((p) => ({
                        value: p.uuid,
                        label: `${p.profileName || (p as any).name} ${p.relationship ? `(${p.relationship})` : ""}`,
                        icon: "👤",
                      })),
                    ]}
                    className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-[15px] font-medium text-slate-900 dark:text-white"
                  />
                </div>
                */}

                {/* Sort Option */}
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                    តម្រៀបតាម
                  </label>
                  <CustomSelect
                    value={draft.sort || "NEWEST"}
                    onChange={(val) => setDraft({ ...draft, sort: val })}
                    options={[
                      { value: "NEWEST", label: "ថ្មីបំផុត" },
                      { value: "DISTANCE_ASC", label: "ចំងាយជិតបំផុត" },
                      { value: "PRICE_ASC", label: "តម្លៃទាបទៅខ្ពស់" },
                      { value: "PRICE_DESC", label: "តម្លៃខ្ពស់ទៅទាប" },
                    ]}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-[15px] font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Open Now Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    បើកដំណើរការឥឡូវនេះ
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.openNow)}
                    onChange={(e) => setDraft({ ...draft, openNow: e.target.checked })}
                    className="h-5 w-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Categories */}
                {filterOptions?.categories && filterOptions.categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                      ប្រភេទម្ហូប និងភេសជ្ជៈ
                    </label>

                    {/* Category Type Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setCategoryType("ALL")}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                          categoryType === "ALL"
                            ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        ទាំងអស់
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryType("FOOD")}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                          categoryType === "FOOD"
                            ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        ម្ហូប
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryType("DRINK")}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                          categoryType === "DRINK"
                            ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        ភេសជ្ជៈ
                      </button>
                    </div>

                    {/* Keep Searchbox */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        value={categoryQuery}
                        onChange={(e) => setCategoryQuery(e.target.value)}
                        placeholder={
                          categoryType === "FOOD"
                            ? "ស្វែងរកប្រភេទម្ហូប..."
                            : categoryType === "DRINK"
                              ? "ស្វែងរកប្រភេទភេសជ្ជៈ..."
                              : "ស្វែងរកប្រភេទម្ហូប ឬភេសជ្ជៈ..."
                        }
                        className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {filteredCategories.map((cat) => {
                        const selected = draft.categoryUuids?.includes(cat.uuid);
                        return (
                          <button
                            key={cat.uuid}
                            type="button"
                            onClick={() => toggleArrayItem("categoryUuids", cat.uuid)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                              selected
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                      {filteredCategories.length === 0 && (
                        <p className="text-xs text-slate-400 py-1">រកមិនឃើញប្រភេទដែលត្រូវគ្នា</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cuisines */}
                {filterOptions?.cuisines && filterOptions.cuisines.length > 0 && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                      ស្ទាយម្ហូប / តំបន់
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.cuisines.map((c) => {
                        const selected = draft.cuisineUuids?.includes(c.uuid);
                        return (
                          <button
                            key={c.uuid}
                            type="button"
                            onClick={() => toggleArrayItem("cuisineUuids", c.uuid)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                              selected
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dietary Types */}
                {filterOptions?.dietaryTypes && filterOptions.dietaryTypes.length > 0 && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                      របបអាហារ
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.dietaryTypes.map((d) => {
                        const selected = draft.dietaryTypeUuids?.includes(d.uuid);
                        return (
                          <button
                            key={d.uuid}
                            type="button"
                            onClick={() => toggleArrayItem("dietaryTypeUuids", d.uuid)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                              selected
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {d.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Age Groups */}
                {filterOptions?.ageGroups && filterOptions.ageGroups.length > 0 && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                      ក្រុមអាយុ
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.ageGroups.map((a) => {
                        const selected = draft.ageGroupUuids?.includes(a.uuid);
                        return (
                          <button
                            key={a.uuid}
                            type="button"
                            onClick={() => toggleArrayItem("ageGroupUuids", a.uuid)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                              selected
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {formatAgeGroupOptionLabel(a)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Exclude Allergens */}
                {filterOptions?.allergens && filterOptions.allergens.length > 0 && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-sm text-rose-700 dark:text-rose-400">
                      ជៀសវាងអាលែហ្ស៊ី
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.allergens.map((alg) => {
                        const selected = draft.excludeAllergenUuids?.includes(alg.uuid);
                        return (
                          <button
                            key={alg.uuid}
                            type="button"
                            onClick={() => toggleArrayItem("excludeAllergenUuids", alg.uuid)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                              selected
                                ? "bg-rose-600 text-white border-rose-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            }`}
                          >
                            {alg.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                    កម្រិតតម្លៃ
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-500">អប្បបរមា ($)</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={draft.minimumPrice ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            minimumPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">អតិបរមា ($)</span>
                      <input
                        type="number"
                        placeholder="100"
                        value={draft.maximumPrice ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            maximumPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Spice Level */}
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                    កម្រិតហឹរ
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "ទាំងអស់", min: undefined, max: undefined },
                      { label: "មិនហឹរ (0)", min: 0, max: 0 },
                      { label: "ហឹរតិច (1-2)", min: 1, max: 2 },
                      { label: "ហឹរខ្លាំង (3+)", min: 3, max: 5 },
                    ].map((spice, idx) => {
                      const isSelected =
                        draft.minimumSpiceLevel === spice.min &&
                        draft.maximumSpiceLevel === spice.max;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              minimumSpiceLevel: spice.min,
                              maximumSpiceLevel: spice.max,
                            })
                          }
                          className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                            isSelected
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50"
                          }`}
                        >
                          {spice.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Max Prep Time */}
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-slate-900 dark:text-white">
                    រយៈពេលរៀបចំអតិបរមា
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "15 នាទី", val: 15 },
                      { label: "30 នាទី", val: 30 },
                      { label: "45 នាទី", val: 45 },
                    ].map((pt) => (
                      <button
                        key={pt.val}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            maxPreparationTimeMinutes:
                              draft.maxPreparationTimeMinutes === pt.val ? undefined : pt.val,
                          })
                        }
                        className={`p-2 rounded-xl text-xs font-semibold border transition text-center ${
                          draft.maxPreparationTimeMinutes === pt.val
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        ⏱️ {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <RotateCcw className="h-4 w-4" />
              កំណត់ឡើងវិញ
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-md"
            >
              <Check className="h-4 w-4" />
              អនុវត្តតម្រង
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
