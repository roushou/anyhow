/**
 * Polyfill DOM APIs not provided by jsdom.
 *
 * jsdom does not include DataTransfer, ClipboardEvent, or DragEvent —
 * these are needed by clipboard, paste, and drag-and-drop tests.
 */

if (typeof DataTransfer === "undefined") {
  class DataTransferPolyfill {
    items: DataTransferItemList;
    files: FileList;
    private _data: Map<string, string> = new Map();

    constructor() {
      const filesList: File[] = [];
      const itemList = {
        _items: [] as any[],
        add: (data: string | File, type?: string) => {
          if (typeof data === "string") {
            itemList._items.push({
              kind: "string",
              type: type ?? "text/plain",
              data,
              getAsFile: () => null,
              getAsString: (cb: (s: string) => void) => cb(data),
            });
          } else {
            itemList._items.push({
              kind: "file",
              type: data.type,
              getAsFile: () => data,
              getAsString: () => {},
            });
            filesList.push(data);
          }
        },
      } as any;
      Object.defineProperty(itemList, "length", {
        get() {
          return itemList._items.length;
        },
      });
      this.items = new Proxy(itemList, {
        get(target, prop) {
          if (typeof prop === "string" && /^\d+$/.test(prop)) return target._items[Number(prop)];
          return Reflect.get(target, prop, target);
        },
      }) as any;
      this.files = {
        get length() {
          return filesList.length;
        },
        item(i: number) {
          return filesList[i] ?? null;
        },
        [Symbol.iterator]() {
          let i = 0;
          return {
            next: () =>
              i < filesList.length
                ? { value: filesList[i++]!, done: false }
                : { value: undefined, done: true },
          };
        },
      } as any;
    }

    setData(type: string, value: string) {
      this._data.set(type, value);
    }

    getData(type: string): string {
      return this._data.get(type) ?? "";
    }

    clearData() {
      this._data.clear();
    }
  }

  (globalThis as any).DataTransfer = DataTransferPolyfill;
}

if (typeof ClipboardEvent === "undefined") {
  class ClipboardEventPolyfill extends Event {
    clipboardData: DataTransfer | null;
    constructor(type: string, init?: any) {
      super(type, { bubbles: true, ...init });
      this.clipboardData = init?.clipboardData ?? null;
    }
  }
  (globalThis as any).ClipboardEvent = ClipboardEventPolyfill;
}

if (typeof DragEvent === "undefined") {
  class DragEventPolyfill extends Event {
    dataTransfer: DataTransfer | null;
    constructor(type: string, init?: any) {
      super(type, { bubbles: true, ...init });
      this.dataTransfer = init?.dataTransfer ?? null;
    }
  }
  (globalThis as any).DragEvent = DragEventPolyfill;
}
