import { describe, it, expect } from "vitest";
import { createUndoRedo } from "./undo-redo.svelte.js";

describe("createUndoRedo", () => {
  it("starts with the initial value", () => {
    const history = createUndoRedo("hello");
    expect(history.value).toBe("hello");
  });

  it("canUndo is false at start", () => {
    const history = createUndoRedo(0);
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
  });

  it("push adds a new value and enables undo", () => {
    const history = createUndoRedo("a");
    history.push("b");
    expect(history.value).toBe("b");
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it("undo goes back to the previous value", () => {
    const history = createUndoRedo("a");
    history.push("b");
    history.undo();
    expect(history.value).toBe("a");
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);
  });

  it("redo goes forward after undo", () => {
    const history = createUndoRedo("a");
    history.push("b");
    history.undo();
    history.redo();
    expect(history.value).toBe("b");
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it("push after undo discards redo history", () => {
    const history = createUndoRedo("a");
    history.push("b");
    history.push("c");
    history.undo(); // back to "b"
    history.undo(); // back to "a"
    history.push("d"); // new branch — "c" is discarded

    expect(history.value).toBe("d");
    expect(history.canRedo).toBe(false);
  });

  it("respects maxSize", () => {
    const history = createUndoRedo(0, 3);
    history.push(1);
    history.push(2);
    history.push(3);
    history.push(4);

    // History should be capped at 3 entries: [2, 3, 4]
    history.undo();
    expect(history.value).toBe(3);
    history.undo();
    expect(history.value).toBe(2);
    history.undo();
    // Can't go further — 0 and 1 were evicted
    expect(history.value).toBe(2);
    expect(history.canUndo).toBe(false);
  });

  it("works with object values", () => {
    const history = createUndoRedo({ x: 0 });
    history.push({ x: 1 });
    expect(history.value).toEqual({ x: 1 });
    history.undo();
    expect(history.value).toEqual({ x: 0 });
  });

  it("deep-clones objects so mutations don't affect history", () => {
    const history = createUndoRedo({ items: [1, 2, 3] });
    const snapshot = { items: [4, 5, 6] };
    history.push(snapshot);

    // Mutate the original object
    snapshot.items.push(7);

    // The history entry should be unaffected
    expect(history.value).toEqual({ items: [4, 5, 6] });
  });
});
