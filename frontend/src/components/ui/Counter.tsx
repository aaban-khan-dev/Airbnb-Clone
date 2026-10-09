import { Minus, Plus } from "lucide-react";

// "Adults  (–) 2 (+)" row used for guest counts
export function Counter({
  label,
  description,
  value,
  min = 0,
  max = 16,
  onChange,
}: {
  label: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-semibold">{label}</p>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        <RoundButton label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          <Minus size={14} />
        </RoundButton>
        <span className="w-4 text-center">{value}</span>
        <RoundButton label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          <Plus size={14} />
        </RoundButton>
      </div>
    </div>
  );
}

function RoundButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-muted/50 text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-muted/50"
    >
      {children}
    </button>
  );
}
