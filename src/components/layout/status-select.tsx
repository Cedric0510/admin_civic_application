import { NativeSelect } from "@/components/ui/native-select";

export function StatusSelect<T extends string>({
  value,
  options,
  label,
  disabled,
  onChange,
}: {
  value: T;
  options: Record<T, string>;
  label: string;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <NativeSelect
      value={value}
      aria-label={label}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as T)}
      className="h-8 w-auto rounded-lg px-2"
    >
      {(Object.keys(options) as T[]).map((key) => (
        <option key={key} value={key}>
          {options[key]}
        </option>
      ))}
    </NativeSelect>
  );
}
