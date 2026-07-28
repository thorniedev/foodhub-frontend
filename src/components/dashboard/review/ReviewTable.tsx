// "use client";

// import { Star, Ban, Pencil, Trash2 } from "lucide-react";
// import type { RatingReviewItem } from "@/types/review";

// interface ReviewTableProps {
//   items: RatingReviewItem[];
//   onBlock?: (id: string) => void;
//   onEdit?: (id: string) => void;
//   onDelete?: (id: string) => void;
// }

// const categoryStyles: Record<string, string> = {
//   meal: "bg-orange-100 text-orange-600",
//   drink: "bg-sky-100 text-sky-600",
//   shop: "bg-purple-100 text-purple-600",
// };

// export default function ReviewTable({
//   items,
//   onBlock,
//   onEdit,
//   onDelete,
// }: ReviewTableProps) {
//   return (
//     <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
//       <div className="grid grid-cols-[2fr_0.8fr_0.9fr_2.2fr_0.8fr] gap-4 border-b border-slate-100 px-6 py-3 text-sm font-medium text-slate-400">
//         <span>មួបអាហារ</span>
//         <span>ការវាយតម្លៃ</span>
//         <span>កាលបរិច្ឆេទ</span>
//         <span>ការពិពណ៌នា</span>
//         <span className="text-right">សកម្មភាព</span>
//       </div>

//       <div className="divide-y divide-slate-100">
//         {items.map((item) => (
//           <div
//             key={item.id}
//             className="grid grid-cols-[2fr_0.8fr_0.9fr_2.2fr_0.8fr] items-center gap-4 px-6 py-4"
//           >
//             <div className="flex items-center gap-3">
//               <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   src={item.imageUrl}
//                   alt={item.name}
//                   className="h-full w-full object-cover"
//                 />
//               </div>
//               <div>
//                 <p className="font-semibold text-slate-800">{item.name}</p>
//                 <span
//                   className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
//                     categoryStyles[item.category] ??
//                     "bg-slate-100 text-slate-600"
//                   }`}
//                 >
//                   {item.categoryLabel}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center gap-1 font-semibold text-amber-500">
//               <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
//               {item.rating.toFixed(1)}
//             </div>

//             <span className="text-sm text-slate-500">{item.date}</span>

//             <p className="line-clamp-2 text-sm text-slate-500">
//               {item.description}
//             </p>

//             <div className="flex items-center justify-end gap-1.5">
//               <IconButton
//                 label="ទប់ស្កាត់"
//                 onClick={() => onBlock?.(item.id)}
//                 tone="neutral"
//               >
//                 <Ban className="h-4 w-4" />
//               </IconButton>
//               <IconButton
//                 label="កែសម្រួល"
//                 onClick={() => onEdit?.(item.id)}
//                 tone="info"
//               >
//                 <Pencil className="h-4 w-4" />
//               </IconButton>
//               <IconButton
//                 label="លុប"
//                 onClick={() => onDelete?.(item.id)}
//                 tone="danger"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </IconButton>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function IconButton({
//   children,
//   label,
//   onClick,
//   tone,
// }: {
//   children: React.ReactNode;
//   label: string;
//   onClick?: () => void;
//   tone: "neutral" | "info" | "danger";
// }) {
//   const toneClasses = {
//     neutral: "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
//     info: "text-sky-500 hover:bg-sky-50",
//     danger: "text-red-500 hover:bg-red-50",
//   }[tone];

//   return (
//     <button
//       type="button"
//       aria-label={label}
//       onClick={onClick}
//       className={`rounded-lg p-2 transition-colors ${toneClasses}`}
//     >
//       {children}
//     </button>
//   );
// }


"use client";

import { Star, Ban, Pencil, Trash2 } from "lucide-react";
import type { RatingReviewItem } from "@/types/review";

interface ReviewTableProps {
  items: RatingReviewItem[];
  onBlock?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const categoryStyles: Record<string, string> = {
  meal: "bg-orange-100 text-orange-600",
  drink: "bg-sky-100 text-sky-600",
  shop: "bg-purple-100 text-purple-600",
};

export default function ReviewTable({
  items,
  onBlock,
  onEdit,
  onDelete,
}: ReviewTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header row — desktop/tablet only */}
      <div className="hidden grid-cols-[2fr_0.8fr_0.9fr_2.2fr_0.8fr] gap-4 border-b border-slate-100 px-6 py-3 text-sm font-medium text-slate-400 md:grid">
        <span>មួបអាហារ</span>
        <span>ការវាយតម្លៃ</span>
        <span>កាលបរិច្ឆេទ</span>
        <span>ការពិពណ៌នា</span>
        <span className="text-right">សកម្មភាព</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id}>
            {/* Desktop/tablet row */}
            <div className="hidden grid-cols-[2fr_0.8fr_0.9fr_2.2fr_0.8fr] items-center gap-4 px-6 py-4 md:grid">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <span
                    className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                      categoryStyles[item.category] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.categoryLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
              </div>

              <span className="text-sm text-slate-500">{item.date}</span>

              <p className="line-clamp-2 text-sm text-slate-500">
                {item.description}
              </p>

              <div className="flex items-center justify-end gap-1.5">
                <IconButton
                  label="ទប់ស្កាត់"
                  onClick={() => onBlock?.(item.id)}
                  tone="neutral"
                >
                  <Ban className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="កែសម្រួល"
                  onClick={() => onEdit?.(item.id)}
                  tone="info"
                >
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="លុប"
                  onClick={() => onDelete?.(item.id)}
                  tone="danger"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            {/* Mobile card — stacked layout */}
            <div className="flex flex-col gap-3 px-4 py-4 md:hidden">
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold text-slate-800">
                      {item.name}
                    </p>
                    <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {item.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                        categoryStyles[item.category] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.categoryLabel}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>

              <p className="line-clamp-2 text-sm text-slate-500">
                {item.description}
              </p>

              <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
                <IconButton
                  label="ទប់ស្កាត់"
                  onClick={() => onBlock?.(item.id)}
                  tone="neutral"
                >
                  <Ban className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="កែសម្រួល"
                  onClick={() => onEdit?.(item.id)}
                  tone="info"
                >
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="លុប"
                  onClick={() => onDelete?.(item.id)}
                  tone="danger"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  tone: "neutral" | "info" | "danger";
}) {
  const toneClasses = {
    neutral: "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
    info: "text-sky-500 hover:bg-sky-50",
    danger: "text-red-500 hover:bg-red-50",
  }[tone];

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${toneClasses}`}
    >
      {children}
    </button>
  );
}