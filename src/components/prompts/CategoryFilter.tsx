'use client';

interface CategoryFilterProps {
  keys: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
  getLabel: (key: string) => string;
}

export default function CategoryFilter({
  keys,
  selected,
  onSelect,
  label,
  getLabel,
}: CategoryFilterProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              selected === key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {getLabel(key)}
          </button>
        ))}
      </div>
    </div>
  );
}
