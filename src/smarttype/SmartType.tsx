export function SuggestionList({
  items,
  active,
  onPick,
}: {
  items: string[];
  active: number;
  onPick: (s: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="smarttype">
      {items.map((it, i) => (
        <li key={it} className={i === active ? "active" : ""} onMouseDown={() => onPick(it)}>
          {it}
        </li>
      ))}
    </ul>
  );
}
