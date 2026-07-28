// components/dashboard/notifications/NotificationsEmptyState.tsx
import { BellOff } from "lucide-react";

export default function NotificationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <BellOff className="h-5 w-5 text-slate-400" />
      </span>
      <p className="text-sm font-medium text-slate-600">មិនមានការជូនដំណឹងត្រូវនឹងលក្ខខណ្ឌនេះទេ</p>
      <p className="text-xs text-slate-400">សូមសាកល្បងប្តូរតម្រង ឬបិទ &quot;មិនទាន់អានប៉ុណ្ណោះ&quot;</p>
    </div>
  );
}