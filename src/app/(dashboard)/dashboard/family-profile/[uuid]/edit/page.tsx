"use client";

import EditMemberProfile from "@/components/dashboard/family-profile/EditMemberProfile";
import { useParams } from "next/navigation";

export default function EditFamilyProfilePage() {
  const params = useParams<{ uuid: string }>();

  return <EditMemberProfile uuid={params.uuid} />;
}
