/**
 * Svelte action that handles paste events with typed clipboard item parsing.
 *
 * Listens for `paste` events on the bound node, extracts `ClipboardItem`
 * data, and calls `onPaste` with structured items. Supports filtering by
 * accepted kind (`text`, `image`, `file`, or `all`).
 *
 * @param node - The DOM node to listen on.
 * @param opts.accept - Filter paste events to a specific kind (default: `"all"`).
 * @param opts.onPaste - Called with the parsed paste items (may be async).
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPaste } from "@anyhow/svelte/actions";
 * </script>
 *
 * <textarea
 *   use:createPaste={{
 *     accept: "image",
 *     onPaste: async (items) => {
 *       for (const item of items) {
 *         const file = item.getAsFile();
 *         if (file) await upload(file);
 *       }
 *     },
 *   }}
 * />
 * ```
 */
import { listen } from "../listen.js";

/** A single item extracted from a paste event. */
export interface PasteItem {
  /** The kind of paste data: `"text"`, `"image"`, or `"file"`. */
  kind: "text" | "image" | "file";
  /** The text content, if `kind === "text"`. */
  text?: string;
  /** Returns the item as a `File`, if available. */
  getAsFile(): File | null;
}

export function createPaste(
  node: HTMLElement,
  opts: {
    accept?: "text" | "image" | "file" | "all";
    onPaste: (items: PasteItem[]) => void | Promise<void>;
  },
): { destroy(): void } {
  const accept = opts.accept ?? "all";

  async function onPasteEvent(e: ClipboardEvent) {
    const items: PasteItem[] = [];

    if (e.clipboardData) {
      // Try structured clipboard items first (images, files)
      if (e.clipboardData.items) {
        // Iterate safely — some environments lack full DataTransferItemList support
        const length = e.clipboardData.items.length;
        for (let i = 0; i < length; i++) {
          const data = e.clipboardData.items[i];
          if (!data) continue;

          if (!matchesAccept(accept, data.kind as string, data.type)) continue;

          items.push({
            kind: kindLabel(data.kind as string, data.type),
            text: data.kind === "string" ? await getText(data) : undefined,
            getAsFile: () => data.getAsFile(),
          });
        }
      }

      // Fallback: plain text
      if (items.length === 0) {
        const text = e.clipboardData.getData("text/plain");
        if (text && (accept === "all" || accept === "text")) {
          items.push({ kind: "text", text, getAsFile: () => null });
        }
      }
    }

    if (items.length > 0) {
      e.preventDefault();
      await opts.onPaste(items);
    }
  }

  return listen(node, "paste", onPasteEvent);
}

function getText(item: DataTransferItem): Promise<string> {
  return new Promise((resolve) => {
    item.getAsString((s) => resolve(s));
  });
}

/**
 * Checks whether a clipboard item matches the accept filter.
 * Browser `DataTransferItem.kind` is `"string"` or `"file"`.
 */
function matchesAccept(accept: string, kind: string, type: string): boolean {
  if (accept === "all") return true;
  if (accept === "text") return kind === "string";
  if (accept === "image") return kind === "file" && type.startsWith("image/");
  if (accept === "file") return kind === "file";
  return true;
}

/**
 * Maps browser `DataTransferItem.kind` + `type` to a user-facing label.
 */
function kindLabel(kind: string, type: string): "text" | "image" | "file" {
  if (kind === "string") return "text";
  if (type.startsWith("image/")) return "image";
  return "file";
}
