/**
 * Svelte action that creates a file drop zone with reactive drag-over state.
 *
 * Handles `dragenter`, `dragover`, `dragleave`, and `drop` events.
 * Prevents the browser's default file-open behavior, filters files by
 * `accept` MIME types / extensions and `maxSize`, and separates rejected
 * files with a reason (`"size"` or `"type"`).
 *
 * `isRejected` tracks the case where the user drags a file that would be
 * rejected over the zone — useful for red-border / error feedback.
 *
 * @param node - The DOM node acting as the drop target.
 * @param opts.accept - Allowed MIME types or file extensions.
 * @param opts.multiple - Allow multiple files (default: `true`).
 * @param opts.maxSize - Maximum file size in bytes.
 * @param opts.onDrop - Called with accepted files and rejected files.
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createDropZone } from "@anyhow/svelte/actions";
 *
 *   const dropZone = createDropZone({
 *     accept: ["image/*"],
 *     onDrop: (files, rejected) => {
 *       if (rejected.length) showToast("Some files were rejected");
 *       uploadFiles(files);
 *     },
 *   });
 * </script>
 *
 * <div
 *   use:dropZone.action
 *   class:dropZone.active={dropZone.isOver}
 * >
 *   {#if dropZone.isOver}Drop here{/if}
 * </div>
 * ```
 */
import { listen } from "../listen.js";

/** A file that was rejected from the drop zone. */
export interface RejectedFile {
  file: File;
  reason: "size" | "type";
}

export function createDropZone(opts: {
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  onDrop: (files: File[], rejected: RejectedFile[]) => void;
}): {
  readonly isOver: boolean;
  readonly isRejected: boolean;
  action: (node: HTMLElement) => { destroy(): void };
} {
  let isOver = $state(false);
  let isRejected = $state(false);

  function action(node: HTMLElement) {
    let counter = 0;

    function accepts(file: File): boolean {
      if (!opts.accept || opts.accept.length === 0) return true;

      return opts.accept.some((pattern) => {
        // Extension match: ".pdf"
        if (pattern.startsWith(".")) {
          return file.name.toLowerCase().endsWith(pattern.toLowerCase());
        }
        // MIME type match: "image/*" or "image/png"
        if (pattern.endsWith("/*")) {
          return file.type.startsWith(pattern.slice(0, -1));
        }
        return file.type === pattern;
      });
    }

    function processFiles(files: FileList | File[]) {
      const accepted: File[] = [];
      const rejected: RejectedFile[] = [];

      for (const file of files) {
        if (!accepts(file)) {
          rejected.push({ file, reason: "type" });
        } else if (opts.maxSize !== undefined && file.size > opts.maxSize) {
          rejected.push({ file, reason: "size" });
        } else {
          accepted.push(file);
        }
      }

      if (accepted.length > 0 || rejected.length > 0) {
        opts.onDrop(accepted, rejected);
      }
    }

    const clear = listen(node, "dragenter", (e: DragEvent) => {
      e.preventDefault();
      counter++;
      isOver = true;

      // Check if any dragged file would be rejected
      if (e.dataTransfer?.items) {
        let anyRejected = false;
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i]!;
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file && !accepts(file)) anyRejected = true;
          }
        }
        isRejected = anyRejected;
      }
    });

    const over = listen(node, "dragover", (e: DragEvent) => {
      e.preventDefault();
    });

    const leave = listen(node, "dragleave", () => {
      counter--;
      if (counter <= 0) {
        isOver = false;
        isRejected = false;
        counter = 0;
      }
    });

    const drop = listen(node, "drop", (e: DragEvent) => {
      e.preventDefault();
      isOver = false;
      isRejected = false;
      counter = 0;

      if (e.dataTransfer?.files) {
        processFiles(e.dataTransfer.files);
      }
    });

    return {
      destroy() {
        clear.destroy();
        over.destroy();
        leave.destroy();
        drop.destroy();
      },
    };
  }

  return {
    get isOver() {
      return isOver;
    },
    get isRejected() {
      return isRejected;
    },
    action,
  };
}
