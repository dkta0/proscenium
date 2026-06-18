import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StagePlayEditor } from "./Editor";
import { createStore } from "../state/store";

describe("StagePlayEditor", () => {
  it("mounts with an editable surface", () => {
    const { container } = render(<StagePlayEditor store={createStore()} />);
    expect(container.querySelector(".ProseMirror")).toBeTruthy();
  });
});
