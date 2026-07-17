export default function CategoryFilter({ categories, selected, onSelect }) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition
          ${
            selected === ""
              ? "bg-[var(--color-storefront)] text-white"
              : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
          }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition
            ${
              selected === category
                ? "bg-[var(--color-storefront)] text-white"
                : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-overlay)]"
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
