import { describe, expect, it } from "bun:test";
import { tree, TreeNode } from "./tree.js";

describe("TreeNode", () => {
  describe("construction", () => {
    it("creates a root node", () => {
      const root = new TreeNode("root");
      expect(root.value).toBe("root");
      expect(root.children).toEqual([]);
      expect(root.parent).toBeNull();
      expect(root.isRoot).toBe(true);
    });

    it("accepts children in constructor", () => {
      const root = new TreeNode("root", [new TreeNode("a"), new TreeNode("b")]);
      expect(root.children.length).toBe(2);
      expect(root.children[0]!.value).toBe("a");
      expect(root.children[0]!.parent).toBe(root);
    });
  });

  describe("addChild", () => {
    it("adds a plain value as a child node", () => {
      const root = new TreeNode("root");
      const child = root.addChild("child");
      expect(child).toBeInstanceOf(TreeNode);
      expect(child.value).toBe("child");
      expect(child.parent).toBe(root);
    });

    it("adds an existing TreeNode", () => {
      const root = new TreeNode("root");
      const existing = new TreeNode("existing");
      root.addChild(existing);
      expect(root.children).toContain(existing);
      expect(existing.parent).toBe(root);
    });

    it("returns the added node", () => {
      const root = new TreeNode("root");
      const child = root.addChild("leaf");
      expect(child.value).toBe("leaf");
    });
  });

  describe("removeChild", () => {
    it("removes a child by reference", () => {
      const root = new TreeNode("root");
      const child = root.addChild("c");
      expect(root.removeChild(child)).toBe(true);
      expect(root.children.length).toBe(0);
      expect(child.parent).toBeNull();
    });

    it("returns false for a non-child", () => {
      const root = new TreeNode("root");
      const other = new TreeNode("other");
      expect(root.removeChild(other)).toBe(false);
    });
  });

  describe("size", () => {
    it("counts all nodes in the subtree", () => {
      const root = tree("a", [tree("b", [tree("c")]), tree("d")]);
      expect(root.size).toBe(4); // a, b, c, d
    });

    it("leaf node has size 1", () => {
      const leaf = new TreeNode("leaf");
      expect(leaf.size).toBe(1);
    });
  });

  describe("depth", () => {
    it("root has depth 0", () => {
      const root = new TreeNode("root");
      expect(root.depth).toBe(0);
    });

    it("nested child has correct depth", () => {
      const root = tree("a", [tree("b", [tree("c")])]);
      const c = root.find((n) => n.value === "c")!;
      expect(c.depth).toBe(2);
    });
  });

  describe("height", () => {
    it("leaf has height 0", () => {
      const leaf = new TreeNode("leaf");
      expect(leaf.height).toBe(0);
    });

    it("balanced tree has correct height", () => {
      const root = tree("a", [tree("b", [tree("c")]), tree("d")]);
      expect(root.height).toBe(2);
    });
  });

  describe("isLeaf / isRoot", () => {
    it("root without children is both leaf and root", () => {
      const node = new TreeNode("solo");
      expect(node.isRoot).toBe(true);
      expect(node.isLeaf).toBe(true);
    });

    it("parent is not a leaf", () => {
      const parent = tree("p", [tree("c")]);
      expect(parent.isLeaf).toBe(false);
      expect(parent.children[0]!.isLeaf).toBe(true);
    });
  });

  describe("dfs", () => {
    it("traverses depth-first pre-order", () => {
      const root = tree("a", [tree("b", [tree("c"), tree("d")]), tree("e")]);
      const values = [...root.dfs()].map((n) => n.value);
      expect(values).toEqual(["a", "b", "c", "d", "e"]);
    });

    it("single node", () => {
      const root = new TreeNode("solo");
      expect([...root.dfs()].map((n) => n.value)).toEqual(["solo"]);
    });
  });

  describe("bfs", () => {
    it("traverses level by level", () => {
      const root = tree("a", [tree("b", [tree("c"), tree("d")]), tree("e")]);
      const values = [...root.bfs()].map((n) => n.value);
      expect(values).toEqual(["a", "b", "e", "c", "d"]);
    });

    it("single node", () => {
      const root = new TreeNode("solo");
      expect([...root.bfs()].map((n) => n.value)).toEqual(["solo"]);
    });
  });

  describe("map", () => {
    it("transforms every value in a new tree", () => {
      const root = tree(1, [tree(2), tree(3)]);
      const doubled = root.map((v) => v * 2);
      expect(doubled.value).toBe(2);
      expect(doubled.children[0]!.value).toBe(4);
      expect(doubled.children[1]!.value).toBe(6);
    });

    it("does not mutate the original", () => {
      const root = tree(1, [tree(2)]);
      root.map((v) => v * 10);
      expect(root.value).toBe(1);
      expect(root.children[0]!.value).toBe(2);
    });

    it("passes the node as second argument", () => {
      const root = tree("a", [tree("b")]);
      const result = root.map((_v, node) => node.children.length);
      expect(result.value).toBe(1); // root has 1 child
    });
  });

  describe("filter", () => {
    it("keeps matching nodes and prunes the rest", () => {
      const root = tree("a", [tree("b", [tree("x"), tree("y")]), tree("c")]);
      const filtered = root.filter((n) => n.value === "a" || n.value === "c");
      expect(filtered).not.toBeNull();
      expect(filtered!.children.length).toBe(1);
      expect(filtered!.children[0]!.value).toBe("c");
    });

    it("returns null when root is filtered out", () => {
      const root = tree("a");
      expect(root.filter(() => false)).toBeNull();
    });
  });

  describe("find", () => {
    it("finds the first matching node (DFS)", () => {
      const root = tree("a", [tree("b"), tree("c")]);
      const node = root.find((n) => n.value === "c");
      expect(node).not.toBeUndefined();
      expect(node!.value).toBe("c");
    });

    it("returns undefined when no match", () => {
      const root = tree("a");
      expect(root.find((n) => n.value === "z")).toBeUndefined();
    });

    it("finds a deeply nested node", () => {
      const root = tree("a", [tree("b", [tree("c", [tree("d")])])]);
      const node = root.find((n) => n.value === "d");
      expect(node).not.toBeUndefined();
      expect(node!.value).toBe("d");
      expect(node!.depth).toBe(3);
    });
  });

  describe("findAll", () => {
    it("finds all matching nodes", () => {
      const root = tree("a", [tree("leaf"), tree("branch", [tree("leaf")])]);
      const leaves = root.findAll((n) => n.value === "leaf");
      expect(leaves.length).toBe(2);
    });

    it("returns empty array when no match", () => {
      const root = tree("a");
      expect(root.findAll(() => false)).toEqual([]);
    });
  });

  describe("closest", () => {
    it("finds nearest matching ancestor", () => {
      const root = tree({ type: "root" }, [tree({ type: "section" }, [tree({ type: "item" })])]);
      const item = root.find((n) => n.value.type === "item")!;
      const section = item.closest((n) => n.value.type === "section");
      expect(section).not.toBeUndefined();
      expect(section!.value.type).toBe("section");
    });

    it("includes the node itself", () => {
      const root = tree("a");
      expect(root.closest((n) => n.value === "a")).toBe(root);
    });

    it("returns undefined when no match", () => {
      const leaf = tree("a", [tree("b")]).children[0]!;
      expect(leaf.closest(() => false)).toBeUndefined();
    });
  });

  describe("ancestors", () => {
    it("returns root-first ancestors excluding self", () => {
      const root = tree("a", [tree("b", [tree("c")])]);
      const c = root.find((n) => n.value === "c")!;
      const ancestors = c.ancestors();
      expect(ancestors.map((n) => n.value)).toEqual(["a", "b"]);
    });

    it("leaf has ancestor chain", () => {
      const root = tree("r", [tree("x", [tree("y")])]);
      const y = root.find((n) => n.value === "y")!;
      expect(y.ancestors().map((n) => n.value)).toEqual(["r", "x"]);
    });

    it("root has no ancestors", () => {
      const root = new TreeNode("r");
      expect(root.ancestors()).toEqual([]);
    });
  });

  describe("toArray", () => {
    it("defaults to DFS", () => {
      const root = tree("a", [tree("b"), tree("c")]);
      expect(root.toArray()).toEqual(["a", "b", "c"]);
    });

    it("bfs output is level-order", () => {
      const root = tree("a", [tree("b", [tree("d")]), tree("c")]);
      expect(root.toArray("bfs")).toEqual(["a", "b", "c", "d"]);
    });
  });

  describe("iterator", () => {
    it("default iteration is DFS", () => {
      const root = tree("a", [tree("b"), tree("c")]);
      expect([...root].map((n) => n.value)).toEqual(["a", "b", "c"]);
    });
  });

  describe("tree factory", () => {
    it("creates a tree from plain values", () => {
      const t = tree("root", ["a", "b"]);
      expect(t.value).toBe("root");
      expect(t.children[0]!.value).toBe("a");
      expect(t.children[1]!.value).toBe("b");
    });

    it("mixes plain values and existing nodes", () => {
      const existing = new TreeNode("existing");
      const t = tree("root", ["plain", existing]);
      expect(t.children[0]!.value).toBe("plain");
      expect(t.children[1]).toBe(existing);
    });
  });
});
