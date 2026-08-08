"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EditMemberProfileProps {
  uuid: string;
}

export default function EditMemberProfile({
  uuid,
}: EditMemberProfileProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/dashboard/family-profile/${uuid}`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-[17px] font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-5 w-5" />
        ត្រឡប់ទៅព័ត៌មានលម្អិត
      </Link>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-[28px] font-bold text-slate-900">
          កែប្រែព័ត៌មានគណនី
        </h1>

        <p className="mt-2 text-[17px] text-slate-500">
          Profile UUID: {uuid}
        </p>
      </div>
    </div>
  );
}