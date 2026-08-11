import { PromoVoucher } from "@/types/restaurant";
import { PiTicketBold } from "react-icons/pi";

type Props = {
  voucher: PromoVoucher;
};

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("km-KH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** One of the "20% off orders over $15" coupon cards under the hero. */
export default function VoucherCard({ voucher }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-primary-100 bg-primary-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-800 text-2xl text-white">
        <PiTicketBold />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-primary-900">
          {voucher.discountLabel}
          <span className="ml-2 text-sm font-medium text-gray-600">
            {voucher.title.replace(voucher.discountLabel, "").trim()}
          </span>
        </p>
        <p className="text-xs text-gray-500">
          ចំណាយតិចបំផុត ${voucher.minSpend.toFixed(2)} · ផុតកំណត់
          {formatExpiry(voucher.expiresAt)}
        </p>
      </div>
    </div>
  );
}
