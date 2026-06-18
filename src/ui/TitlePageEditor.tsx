import { TitlePage } from "../io/osp";
import { Store } from "../state/store";

export function updateTitlePage(store: Store, patch: Partial<TitlePage>) {
  const cur = store.getState().osp.titlePage;
  store.getState().osp.titlePage = { ...cur, ...patch };
  store.markDirty();
}

const FIELDS: { key: keyof TitlePage; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "contact", label: "Contact" },
  { key: "draftDate", label: "Draft date" },
];

export function TitlePageEditor({ store }: { store: Store }) {
  const tp = store.getState().osp.titlePage;
  return (
    <div className="title-page">
      <h2>Title Page</h2>
      {FIELDS.map((f) => (
        <label key={f.key}>
          <span>{f.label}</span>
          <input
            defaultValue={tp[f.key]}
            onChange={(e) => updateTitlePage(store, { [f.key]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}
