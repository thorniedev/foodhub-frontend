import { IoLocationOutline } from "react-icons/io5";

interface LocationEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function LocationEmptyState({
  title = "រកមិនឃើញហាងនៅទីតាំងនេះ",
  description = "សូមសាកល្បងបង្កើនចម្ងាយ ឬកែប្រែជម្រើសតម្រងរបស់អ្នក។",
  actionLabel,
  onAction,
}: LocationEmptyStateProps) {
  return (
    <div className="rounded-[26px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <IoLocationOutline className="mx-auto text-[54px] text-primary-300" />

      <p className="mt-4 text-[22px] font-semibold text-primary-900">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-lg text-[16px] leading-7 text-gray-500">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-primary-800 px-5 py-3 text-[16px] font-semibold text-white transition hover:bg-primary-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
