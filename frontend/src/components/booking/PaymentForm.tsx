"use client";

import { CreditCard, Lock } from "lucide-react";

export type CardDetails = { number: string; expiry: string; cvv: string; name: string };

export const EMPTY_CARD: CardDetails = { number: "", expiry: "", cvv: "", name: "" };

/** Checks the mock card form. Card details never leave the browser:
 *  payment is mocked, so nothing is sent to or stored by the backend. */
export function validateCard(card: CardDetails): string | null {
  if (card.number.replace(/\s/g, "").length !== 16) return "Enter a 16-digit card number";
  const match = card.expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) return "Enter the expiry date as MM/YY";
  if (!/^\d{3,4}$/.test(card.cvv)) return "Enter a 3 or 4 digit CVV";
  if (card.name.trim().length < 2) return "Enter the name on the card";
  return null;
}

// "4242424242424242" -> "4242 4242 4242 4242"
function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

// "1228" -> "12/28"
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function PaymentForm({
  card,
  onChange,
}: {
  card: CardDetails;
  onChange: (card: CardDetails) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-line px-4 py-3">
        <CreditCard size={20} />
        <span className="font-semibold">Credit or debit card</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#b0b0b0]">
        <Field
          label="Card number"
          value={card.number}
          placeholder="4242 4242 4242 4242"
          inputMode="numeric"
          onChange={(v) => onChange({ ...card, number: formatCardNumber(v) })}
          icon={<Lock size={14} className="text-muted" />}
        />
        <div className="grid grid-cols-2 border-t border-[#b0b0b0]">
          <Field
            label="Expiration"
            value={card.expiry}
            placeholder="MM/YY"
            inputMode="numeric"
            onChange={(v) => onChange({ ...card, expiry: formatExpiry(v) })}
          />
          <div className="border-l border-[#b0b0b0]">
            <Field
              label="CVV"
              value={card.cvv}
              placeholder="123"
              inputMode="numeric"
              onChange={(v) => onChange({ ...card, cvv: v.replace(/\D/g, "").slice(0, 4) })}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-[#b0b0b0]">
        <Field
          label="Name on card"
          value={card.name}
          placeholder="Your name"
          onChange={(v) => onChange({ ...card, name: v })}
        />
      </div>

      <p className="mt-3 text-xs text-muted">
        Demo checkout: no real payment is taken and card details are never sent to the server. Any
        16-digit number works, e.g. 4242 4242 4242 4242.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  inputMode,
  icon,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  inputMode?: "numeric";
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 focus-within:bg-surface">
      <span className="flex-1">
        <span className="block text-xs text-muted">{label}</span>
        <input
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none placeholder:text-muted/60"
        />
      </span>
      {icon}
    </label>
  );
}
