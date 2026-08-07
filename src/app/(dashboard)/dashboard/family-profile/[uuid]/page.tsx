"use client";

import { useParams, useSearchParams } from "next/navigation";

import ProfileDetailView from "./ProfileDetailView";
import ProfileEditForm from "./ProfileEditForm";

export default function FamilyProfilePage() {
  const params = useParams<{ uuid: string }>();
  const searchParams = useSearchParams();

  const uuid = params.uuid;
  const isEditMode = searchParams.get("mode") === "edit";

  if (isEditMode) {
    return <ProfileEditForm uuid={uuid} />;
  }

  return <ProfileDetailView uuid={uuid} />;
}
