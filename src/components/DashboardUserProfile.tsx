"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "@/app/store/auth/currentUserApi";

import {
  useGetMemberProfilesQuery,
  useGetMediaAccessUrlQuery,
} from "@/app/store/memberProfileApi";

import type { MemberProfile } from "@/types/member-profile/member-profile";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { LuLayoutDashboard } from "react-icons/lu";

interface DashboardUserProfileProps {
  avatarUrl?: string | null;
  showEmail?: boolean;
  alwaysShowText?: boolean;
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "Could not update your profile.";
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DashboardUserProfile({
  avatarUrl,
  showEmail = false,
  alwaysShowText = false,
}: DashboardUserProfileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
  });

  const {
    data: user,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCurrentUserQuery();
  console.log("current user data ,", user);
  const [updateCurrentUser, { isLoading: isUpdating }] =
    useUpdateCurrentUserMutation();

  /* Fetch default profile to get its avatarMediaUuid */
  const { data: profilesData } = useGetMemberProfilesQuery();
  const defaultProfile = useMemo<MemberProfile | undefined>(
    () => profilesData?.contents?.find((p) => p.isDefault),
    [profilesData],
  );

  /* Resolve avatar CDN URL from the default profile's avatarMediaUuid */
  const { data: avatarAccessUrlData } = useGetMediaAccessUrlQuery(
    defaultProfile?.avatarMediaUuid ?? "",
    { skip: !defaultProfile?.avatarMediaUuid },
  );

  /* Use fetched CDN URL, falling back to the avatarUrl prop */
  const resolvedAvatarUrl = avatarAccessUrlData?.url ?? avatarUrl ?? null;

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    });
  }, [user]);

  const userName = useMemo(() => {
    if (!user) {
      return "FoodHub User";
    }

    const fullName = [user.firstName, user.lastName]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(" ")
      .trim();

    return fullName || user.username || user.primaryEmail || "FoodHub User";
  }, [user]);

  const avatarInitial = useMemo(() => {
    if (!user) {
      return "U";
    }

    const initialSource =
      user.firstName ||
      user.lastName ||
      user.username ||
      user.primaryEmail ||
      "U";

    return initialSource.trim().charAt(0).toUpperCase();
  }, [user]);

  const handleViewDetails = () => {
    setIsMenuOpen(false);
    setIsDetailsOpen(true);
    setIsEditing(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    window.location.assign("/api/auth/logout");
  };

  const handleCancelEditing = () => {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    });

    setIsEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSave = async () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    if (!firstName) {
      setErrorMessage("First name is required.");
      return;
    }

    if (!lastName) {
      setErrorMessage("Last name is required.");
      return;
    }

    try {
      await updateCurrentUser({
        firstName,
        lastName,
      }).unwrap();

      setIsEditing(false);
      setErrorMessage("");
      setSuccessMessage("Your profile was updated successfully.");
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

        <div
          className={`space-y-1 ${
            alwaysShowText ? "block" : "hidden sm:block"
          }`}
        >
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

          {showEmail && (
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          )}
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-red-600 transition hover:bg-red-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <RefreshCw className="h-5 w-5" />
        </div>

        <span
          className={`text-base font-medium ${
            alwaysShowText ? "block" : "hidden sm:block"
          }`}
        >
          Retry profile
        </span>
      </button>
    );
  }

  return (
    <>
      <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <PopoverTrigger
          type="button"
          aria-label="Open user menu"
          aria-expanded={isMenuOpen}
          className="group flex max-w-64 items-center gap-1 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136C34]/30 dark:hover:bg-slate-800"
        >
          <div className="relative shrink-0">
            {resolvedAvatarUrl ? (
              <Image
                src={resolvedAvatarUrl}
                alt={userName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E36914] text-base font-bold text-white shadow-sm">
                {avatarInitial}
              </div>
            )}

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          </div>

          <div
            className={`min-w-0 flex-1 text-left ${
              alwaysShowText ? "block" : "hidden sm:block"
            }`}
          >
            {/* <p className="truncate text-base font-semibold text-slate-700 group-hover:text-[#136C34] dark:text-slate-200">
              {userName}
            </p> */}

            {showEmail && (
              <p className="truncate text-base text-slate-500">
                {user.primaryEmail}
              </p>
            )}
          </div>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            } ${alwaysShowText ? "block" : "hidden sm:block"}`}
          />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-72 rounded-2xl border border-slate-200 p-2 shadow-xl dark:border-slate-800"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 p-3 dark:border-slate-800">
            {resolvedAvatarUrl ? (
              <Image
                src={resolvedAvatarUrl}
                alt={userName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E36914] text-lg font-bold text-white">
                {avatarInitial}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                {userName}
              </p>

              <p className="truncate text-base text-slate-500">
                {user.primaryEmail}
              </p>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <button
              type="button"
              onClick={handleViewDetails}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-[#136C34] dark:text-slate-200 dark:hover:bg-emerald-950/40"
            >
              <UserRound className="h-5 w-5" />

              <span className="flex-1"> គណនី</span>
            </button>
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-[#136C34] dark:text-slate-200 dark:hover:bg-emerald-950/40"
            >
              <LuLayoutDashboard />
              <span className="flex-1">ផ្ទាំងគ្រប់គ្រង</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-5 w-5" />

              <span className="flex-1">ចាកចេញ</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);

          if (!open) {
            setIsEditing(false);
            setErrorMessage("");
            setSuccessMessage("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {/* <DialogHeader>
            <DialogTitle className="">My profile</DialogTitle>

            <DialogDescription className="text-base">
              View and update your FoodHub account.
            </DialogDescription>
          </DialogHeader> */}
          <div>
            <p className="text-2xl font-bold">My profile</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              {resolvedAvatarUrl ? (
                <Image
                  src={resolvedAvatarUrl}
                  alt={userName}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E36914] text-2xl font-bold text-white">
                  {avatarInitial}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-xl font-bold">{userName}</p>

                <p className="mt-1 truncate text-base text-slate-500">
                  {user.primaryEmail}
                </p>

                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-base font-medium text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  {user.status}
                </span>
              </div>
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-base text-emerald-700">
                <Check className="h-5 w-5 shrink-0" />
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-base text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Personal information</h3>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-base font-medium transition hover:border-[#136C34] hover:text-[#136C34]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-base font-medium">First name</span>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={form.firstName}
                    disabled={!isEditing || isUpdating}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-base outline-none focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-base font-medium">Last name</span>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={form.lastName}
                    disabled={!isEditing || isUpdating}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-base outline-none focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                  />
                </div>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-base font-medium">Email</span>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={user.primaryEmail}
                  disabled
                  className="h-11 w-full rounded-xl border bg-slate-50 pl-10 pr-3 text-base text-slate-500 dark:bg-slate-900"
                />
              </div>
            </label>

            {isEditing && (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={isUpdating}
                  className="rounded-xl border px-5 py-2.5 text-base font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#0f592b] disabled:opacity-60"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* <div className="rounded-2xl border p-4">
              <h3 className="text-lg font-semibold">Account details</h3>

              <dl className="mt-4 space-y-3 text-base">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Username</dt>

                  <dd className="break-all text-right font-medium">
                    {user.username}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Email verified</dt>

                  <dd className="font-medium">
                    {user.emailVerified ? "Yes" : "No"}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Last login</dt>

                  <dd className="text-right font-medium">
                    {formatDate(user.lastLoginAt)}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Account created</dt>

                  <dd className="text-right font-medium">
                    {formatDate(user.createdAt)}
                  </dd>
                </div>
              </dl>
            </div> */}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 text-base font-medium text-slate-600"
            >
              <RefreshCw
                className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh profile
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
