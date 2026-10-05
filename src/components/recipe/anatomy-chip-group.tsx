"use client";

interface OptionItem {
  id: string;
  label: string;
}

interface AnatomyChipGroupProps {
  label: string;
  options: readonly OptionItem[] | OptionItem[];
  selected: string | string[];
  multiple?: boolean;
  onSelect: (label: string) => void;
}

export function AnatomyChipGroup({
  label,
  options,
  selected,
  multiple = false,
  onSelect,
}: AnatomyChipGroupProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((item) => {
          const isActive = multiple
            ? Array.isArray(selected) && selected.includes(item.label)
            : selected === item.label;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isActive
                  ? "bg-amber-500 text-black border-amber-500 font-bold"
                  : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
