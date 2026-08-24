// components/dashboard/notifications/NotificationsEmptyState.tsx
import { BellOff } from "lucide-react";

interface NotificationsEmptyStateProps {
  title?: string;
  description?: string;
}

export default function NotificationsEmptyState({
  title = "មិនមានការជូនដំណឹងត្រូវនឹងលក្ខខណ្ឌនេះទេ",
  description = 'សូមសាកល្បងប្តូរតម្រង ឬបិទ "មិនទាន់អានប៉ុណ្ណោះ"',
}: NotificationsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <BellOff className="h-5 w-5 text-slate-400" />
      </span>
      <p className="text-md font-medium text-slate-600">{title}</p>
      <p className="text-base text-slate-400">{description}</p>
    </div>
  );
}
