import { describe, it, expect } from "vitest";
import { createFilteredList } from "./filtered-list.svelte.js";

describe("createFilteredList", () => {
  const items = [
    { name: "Alice", role: "admin" },
    { name: "Bob", role: "user" },
    { name: "Charlie", role: "admin" },
  ];

  it("returns all items when no search", () => {
    const list = createFilteredList(items, { searchFields: ["name", "role"] });
    expect(list.filtered).toEqual(items);
  });

  it("filters by search", () => {
    const list = createFilteredList(items, { searchFields: ["name", "role"] });
    list.setSearch("ali");
    expect(list.filtered).toEqual([{ name: "Alice", role: "admin" }]);
  });

  it("sorts by key", () => {
    const list = createFilteredList(items, { searchFields: ["name"], sortKey: "name" });
    // Initial sortKey is "name", so setSort toggles to desc first
    list.setSort("name");
    expect(list.filtered[0]!.name).toBe("Charlie");
    list.setSort("name"); // toggle back to asc
    expect(list.filtered[0]!.name).toBe("Alice");
  });
});
