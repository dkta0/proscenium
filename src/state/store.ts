import { OspDocument, emptyOsp, serializeOsp, deserializeOsp } from "../io/osp";

export interface DocState {
  osp: OspDocument;
  path: string | null;
  dirty: boolean;
}

export function createStore(initial: OspDocument = emptyOsp()) {
  let state: DocState = { osp: initial, path: null, dirty: false };
  const subs = new Set<() => void>();
  const notify = () => subs.forEach((f) => f());

  return {
    getState: () => state,
    subscribe(fn: () => void) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    markDirty() {
      state = { ...state, dirty: true };
      notify();
    },
    setDoc(doc: object) {
      state = { ...state, osp: { ...state.osp, doc }, dirty: true };
      notify();
    },
    setPath(path: string) {
      state = { ...state, path };
      notify();
    },
    loadFromString(json: string) {
      state = { osp: deserializeOsp(json), path: state.path, dirty: false };
      notify();
    },
    toSaveString() {
      const s = serializeOsp(state.osp);
      state = { ...state, dirty: false };
      notify();
      return s;
    },
  };
}

export type Store = ReturnType<typeof createStore>;
