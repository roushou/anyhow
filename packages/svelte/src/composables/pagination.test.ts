import { describe, it, expect } from "vitest";
import { createPagination } from "./pagination.svelte.js";

describe("createPagination", () => {
  it("returns initial state", () => {
    const pag = createPagination({ total: 100, perPage: 10 });
    expect(pag.page).toBe(1);
    expect(pag.perPage).toBe(10);
    expect(pag.total).toBe(100);
    expect(pag.totalPages).toBe(10);
  });

  it("navigates pages", () => {
    const pag = createPagination({ total: 100, perPage: 10 });
    pag.next();
    expect(pag.page).toBe(2);
    pag.prev();
    expect(pag.page).toBe(1);
  });

  it("cannot go past boundaries", () => {
    const pag = createPagination({ total: 100, perPage: 10 });
    pag.setPage(10);
    pag.next();
    expect(pag.page).toBe(10);

    pag.setPage(1);
    pag.prev();
    expect(pag.page).toBe(1);
  });

  it("resets to page 1", () => {
    const pag = createPagination({ total: 100, perPage: 10 });
    pag.setPage(5);
    pag.reset();
    expect(pag.page).toBe(1);
  });
});
