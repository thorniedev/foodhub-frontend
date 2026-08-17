"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoBookmarkOutline,
  IoHomeOutline,
  IoBriefcaseOutline,
  IoCafeOutline,
  IoFitnessOutline,
  IoStar,
  IoStarOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoAddOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoCloseOutline,
  IoWarningOutline,
} from "react-icons/io5";
import {
  useListSavedLocationsQuery,
  useCreateSavedLocationMutation,
  useUpdateSavedLocationMutation,
  useDeleteSavedLocationMutation,
  useSetDefaultSavedLocationMutation,
} from "@/app/store/savedLocationApi";
import {
  useGetCurrentUserQuery,
  useGetBackendUserQuery,
} from "@/app/store/auth/currentUserApi";
import type { SavedLocation } from "@/types/saved-location";
import type { Coordinates } from "@/types/location";

interface SavedLocationsManagerProps {
  currentCoordinates: Coordinates | null;
  currentAddress?: string | null;
  onSelectLocation: (location: {
    latitude: number;
    longitude: number;
    label: string;
  }) => void;
  onSwitchToMap: () => void;
}

function getLocationIcon(label: string) {
  const lower = label.toLowerCase();
  if (/home|ផ្ទះ/i.test(lower)) {
    return <IoHomeOutline className="text-[24px] text-emerald-600" />;
  }
  if (/work|office|ការិយាល័យ/i.test(lower)) {
    return <IoBriefcaseOutline className="text-[24px] text-blue-600" />;
  }
  if (/cafe|coffee|កាហ្វេ/i.test(lower)) {
    return <IoCafeOutline className="text-[24px] text-amber-600" />;
  }
  if (/gym|fitness|កីឡា/i.test(lower)) {
    return <IoFitnessOutline className="text-[24px] text-purple-600" />;
  }
  return <IoBookmarkOutline className="text-[24px] text-primary-700" />;
}

export default function SavedLocationsManager({
  currentCoordinates,
  currentAddress,
  onSelectLocation,
  onSwitchToMap,
}: SavedLocationsManagerProps) {
  const { data: authUser } = useGetCurrentUserQuery();
  const { data: backendUser } = useGetBackendUserQuery();
  const isLoggedIn = Boolean(authUser || backendUser?.id);

  const { data: savedLocations = [], isLoading } = useListSavedLocationsQuery(
    undefined,
    { skip: !isLoggedIn },
  );

  const [createSavedLocation, { isLoading: isCreating }] =
    useCreateSavedLocationMutation();
  const [updateSavedLocation, { isLoading: isUpdating }] =
    useUpdateSavedLocationMutation();
  const [deleteSavedLocation, { isLoading: isDeleting }] =
    useDeleteSavedLocationMutation();
  const [setDefaultSavedLocation, { isLoading: isSettingDefault }] =
    useSetDefaultSavedLocationMutation();

  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [locationToDelete, setLocationToDelete] = useState<SavedLocation | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Add new location form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState(currentAddress || "");
  const [newLat, setNewLat] = useState(
    currentCoordinates?.latitude ? String(currentCoordinates.latitude) : "",
  );
  const [newLng, setNewLng] = useState(
    currentCoordinates?.longitude ? String(currentCoordinates.longitude) : "",
  );

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleSetDefault = async (loc: SavedLocation) => {
    try {
      await setDefaultSavedLocation(loc.uuid).unwrap();
      showFeedback(`បានកំណត់ "${loc.label}" ជាទីតាំងចម្បង! ⭐`);
    } catch {
      showFeedback("មិនអាចកំណត់ជាទីតាំងចម្បងបានទេ។", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      await deleteSavedLocation(locationToDelete.uuid).unwrap();
      showFeedback(`បានលុប "${locationToDelete.label}" រួចរាល់!`);
      setLocationToDelete(null);
    } catch {
      showFeedback("មិនអាចលុបទីតាំងបានទេ។", "error");
    }
  };

  const handleStartEdit = (loc: SavedLocation) => {
    setEditingUuid(loc.uuid);
    setEditLabel(loc.label);
  };

  const handleSaveEdit = async (loc: SavedLocation) => {
    if (!editLabel.trim()) return;
    try {
      await updateSavedLocation({
        locationUuid: loc.uuid,
        body: { label: editLabel.trim() },
      }).unwrap();
      setEditingUuid(null);
      showFeedback(`បានកែប្រែ "${editLabel}" រួចរាល់! ✏️`);
    } catch {
      showFeedback("មិនអាចកែប្រែទីតាំងបានទេ។", "error");
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(newLat);
    const lng = Number(newLng);

    if (!newLabel.trim()) {
      showFeedback("សូមបញ្ចូលឈ្មោះទីតាំង។", "error");
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      showFeedback("សូមបញ្ចូលកូអរដោនេត្រឹមត្រូវ ឬជ្រើសលើផែនទី។", "error");
      return;
    }

    try {
      await createSavedLocation({
        label: newLabel.trim(),
        addressLine: newAddress.trim() || null,
        latitude: lat,
        longitude: lng,
      }).unwrap();
      setShowAddForm(false);
      setNewLabel("");
      showFeedback(`បានបន្ថែម "${newLabel}" ទៅក្នុងទីតាំងបានរក្សាទុក! ✅`);
    } catch {
      showFeedback("មិនអាចបន្ថែមទីតាំងបានទេ។", "error");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <IoBookmarkOutline className="text-[32px]" />
        </div>
        <p className="mt-4 text-[20px] font-bold text-primary-900">
          សូមចូលគណនីដើម្បីគ្រប់គ្រងទីតាំង
        </p>
        <p className="mt-2 max-w-md text-[17px] leading-7 text-gray-500">
          ការចូលគណនីអនុញ្ញាតឱ្យអ្នករក្សាទុកអាសយដ្ឋានផ្ទះ ការិយាល័យ
          និងទីតាំងផ្សេងៗ ដើម្បីប្រើប្រាស់បានលឿន។
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-y-auto p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* DELETE CONFIRMATION CUSTOM MODAL (NO BROWSER POPUP) */}
      <AnimatePresence>
        {locationToDelete && (
          <div className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <IoWarningOutline className="text-[26px]" />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-slate-900">
                    បញ្ជាក់ការលុបទីតាំង
                  </p>
                  <p className="text-[17px] text-slate-500">
                    លុបចេញពីបញ្ជី
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[17px] leading-7 text-slate-600">
                តើអ្នកពិតជាចង់លុបទីតាំង{" "}
                <span className="font-bold text-slate-900">
                  &quot;{locationToDelete.label}&quot;
                </span>{" "}
                នេះចេញពីបញ្ជីទីតាំងដែលបានរក្សាទុកមែនទេ?
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLocationToDelete(null)}
                  className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-[17px] font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="min-h-12 flex-1 rounded-2xl bg-red-600 px-5 text-[17px] font-bold text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-60"
                >
                  {isDeleting ? "កំពុងលុប..." : "លុបទីតាំង (Delete)"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-[17px] font-semibold shadow-md ${
              feedbackMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <IoCheckmarkCircle className="text-[22px]" />
            <span>{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <p className="text-[22px] font-bold text-slate-900">
            ទីតាំងបានរក្សាទុករបស់អ្នក
          </p>
          <p className="text-[17px] text-slate-500">
            {savedLocations.length} ទីតាំងនៅក្នុងគណនីរបស់អ្នក
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentCoordinates && (
            <button
              type="button"
              onClick={() => {
                setNewLat(String(currentCoordinates.latitude));
                setNewLng(String(currentCoordinates.longitude));
                setNewAddress(currentAddress || "");
                setNewLabel("ផ្ទះរបស់ខ្ញុំ");
                setShowAddForm(true);
              }}
              className="flex min-h-11 items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-4 text-[17px] font-bold text-primary-800 transition hover:bg-primary-100 active:scale-95"
            >
              <IoLocationOutline className="text-[20px] text-primary-700" />
              រក្សាទុក GPS បច្ចុប្បន្ន
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-primary-800 px-5 text-[17px] font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            {showAddForm ? (
              <>
                <IoCloseOutline className="text-[20px]" />
                បិទ
              </>
            ) : (
              <>
                <IoAddOutline className="text-[22px]" />
                បន្ថែមទីតាំង
              </>
            )}
          </button>
        </div>
      </div>

      {/* ADD LOCATION FORM (COLLAPSIBLE) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateNew}
            className="mb-6 overflow-hidden rounded-3xl border border-primary-200 bg-primary-50/40 p-5 shadow-sm"
          >
            <p className="text-[19px] font-bold text-primary-900">
              បន្ថែមទីតាំងថ្មី
            </p>
            <p className="text-[17px] text-slate-500">
              បញ្ចូលព័ត៌មានទីតាំងដើម្បីរក្សាទុកក្នុងគណនីរបស់អ្នក
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[17px] font-bold text-slate-700">
                  ឈ្មោះទីតាំង (Label) *
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="ឧ. ផ្ទះ, ការិយាល័យ, ហាងកាហ្វេ..."
                  className="mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[17px] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-[17px] font-bold text-slate-700">
                  អាសយដ្ឋាន (Address)
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="ឧ. ផ្លូវ ២៧១, សង្កាត់បឹងសាឡាង..."
                  className="mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[17px] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-[17px] font-bold text-slate-700">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  placeholder="11.5564"
                  className="mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[17px] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-[17px] font-bold text-slate-700">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  placeholder="104.9282"
                  className="mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[17px] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            {/* PRESET CHIPS */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[17px] font-semibold text-slate-500">
                ឈ្មោះលឿន:
              </span>
              {["ផ្ទះ", "ការិយាល័យ", "សាលារៀន", "ខុនដូ", "កន្លែងហាត់ប្រាណ"].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewLabel(preset)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1 text-[17px] font-semibold text-slate-700 hover:border-primary-400 hover:bg-primary-50"
                  >
                    {preset}
                  </button>
                ),
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="min-h-11 rounded-2xl border border-slate-200 bg-white px-5 text-[17px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="min-h-11 rounded-2xl bg-primary-800 px-6 text-[17px] font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                {isCreating ? "កំពុងរក្សាទុក..." : "រក្សាទុក (Save)"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* SAVED LOCATIONS LIST */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-800" />
        </div>
      ) : savedLocations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <IoLocationOutline className="text-[28px]" />
          </div>
          <p className="mt-3 text-[19px] font-bold text-slate-800">
            មិនទាន់មានទីតាំងបានរក្សាទុកទេ
          </p>
          <p className="mt-1 max-w-sm text-[17px] leading-7 text-slate-500">
            ជ្រើសរើសទីតាំងលើផែនទី ហើយចុច &quot;រក្សាទុកទីតាំង&quot;
            ឬចុចប៊ូតុង &quot;បន្ថែមទីតាំង&quot; ខាងលើ។
          </p>
          <button
            type="button"
            onClick={onSwitchToMap}
            className="mt-4 flex min-h-11 items-center gap-2 rounded-full border border-primary-300 bg-primary-50 px-6 text-[17px] font-bold text-primary-800 transition hover:bg-primary-100"
          >
           ទៅកាន់ផែនទី
          </button>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {savedLocations.map((loc) => {
            const isDefault = Boolean(loc.isDefault);
            const isEditing = editingUuid === loc.uuid;

            return (
              <div
                key={loc.uuid}
                className={`relative flex flex-col justify-between rounded-3xl border p-4 sm:p-5 transition ${
                  isDefault
                    ? "border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                        {getLocationIcon(loc.label)}
                      </div>

                      <div className="min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="min-h-9 rounded-xl border border-primary-400 px-3 text-[17px] font-bold text-slate-900 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(loc)}
                              disabled={isUpdating}
                              className="min-h-9 rounded-xl bg-primary-800 px-3 text-[17px] font-bold text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUuid(null)}
                              className="min-h-9 rounded-xl bg-slate-200 px-2.5 text-[17px] text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <p className="truncate text-[18px] font-bold text-slate-900">
                            {loc.label}
                          </p>
                        )}

                        {isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[14px] font-bold text-amber-800">
                            <IoStar className="text-[14px] text-amber-600" />
                            ទីតាំងចម្បង (Default)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TOP ACTIONS: Set Default, Edit, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title={isDefault ? "ទីតាំងចម្បង" : "កំណត់ជាទីតាំងចម្បង"}
                        onClick={() => handleSetDefault(loc)}
                        disabled={isSettingDefault || isDefault}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                          isDefault
                            ? "text-amber-500 cursor-default"
                            : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                        }`}
                      >
                        {isDefault ? (
                          <IoStar className="text-[20px]" />
                        ) : (
                          <IoStarOutline className="text-[20px]" />
                        )}
                      </button>

                      <button
                        type="button"
                        title="កែប្រែឈ្មោះ"
                        onClick={() => handleStartEdit(loc)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <IoPencilOutline className="text-[18px]" />
                      </button>

                      <button
                        type="button"
                        title="លុបទីតាំង"
                        onClick={() => setLocationToDelete(loc)}
                        disabled={isDeleting}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <IoTrashOutline className="text-[18px]" />
                      </button>
                    </div>
                  </div>

                  {loc.addressLine && (
                    <p className="mt-3 line-clamp-2 text-[17px] leading-6 text-slate-600">
                      {loc.addressLine}
                    </p>
                  )}

                  <p className="mt-1 text-[17px] font-semibold text-slate-400">
                    {Number(loc.latitude).toFixed(4)},{" "}
                    {Number(loc.longitude).toFixed(4)}
                  </p>
                </div>

                {/* BOTTOM ACTION: USE THIS LOCATION */}
                <button
                  type="button"
                  onClick={() =>
                    onSelectLocation({
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      label: loc.label,
                    })
                  }
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary-50 px-4 text-[17px] font-bold text-primary-800 transition hover:bg-primary-800 hover:text-white"
                >
                  <IoLocationOutline className="text-[20px]" />
                  ប្រើទីតាំងនេះ (Use Location)
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
