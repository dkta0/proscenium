import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SuggestionList } from "./SmartType";

describe("SuggestionList", () => {
  it("renders matching suggestions", () => {
    const { getByText } = render(<SuggestionList items={["HAMLET"]} active={0} onPick={() => {}} />);
    expect(getByText("HAMLET")).toBeTruthy();
  });
  it("renders nothing when empty", () => {
    const { container } = render(<SuggestionList items={[]} active={0} onPick={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
