import { formatPrice, plural } from "@/lib/format";

/** "₹18,500 x 3 nights / Cleaning fee / Service fee / Total" used by the
 *  booking card, the checkout page and the trip details page. */
export function PriceBreakdown({
  nightlyPrice,
  nights,
  cleaningFee,
  serviceFee,
  totalPrice,
  totalLabel = "Total before taxes",
}: {
  nightlyPrice: number;
  nights: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  totalLabel?: string;
}) {
  return (
    <dl className="space-y-3">
      <Row label={`${formatPrice(nightlyPrice)} x ${plural(nights, "night")}`} amount={nightlyPrice * nights} />
      <Row label="Cleaning fee" amount={cleaningFee} />
      <Row label="Service fee" amount={serviceFee} />
      <div className="flex justify-between border-t border-line pt-5 font-semibold">
        <dt>{totalLabel}</dt>
        <dd>{formatPrice(totalPrice)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between">
      <dt className="underline decoration-line underline-offset-2">{label}</dt>
      <dd>{formatPrice(amount)}</dd>
    </div>
  );
}
