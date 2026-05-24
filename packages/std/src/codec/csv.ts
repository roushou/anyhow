import { ok, type Result } from "../result/result.js";
import type { Codec, CodecError } from "./codec.js";

/**
 * Options for the CSV codec.
 */
export interface CsvOpts {
  /** Field delimiter (default: `","`). */
  delimiter?: string;
  /** Whether the first row contains header names (default: `true`). */
  header?: boolean;
}

/**
 * Creates a codec for CSV data with the given options.
 *
 * When `header` is `true` (the default), the first row is treated as column
 * names and each subsequent row is decoded as an object mapping column name
 * to value.
 *
 * @example
 * ```ts
 * const tsv = csvCodec({ delimiter: "\t" });
 * csv.decode("name,age\\nAlice,30\\nBob,25");
 * // Ok([{ name: "Alice", age: "30" }, { name: "Bob", age: "25" }])
 * ```
 */
export function csvCodec(opts: CsvOpts = {}): Codec<Record<string, string>[]> {
  const delimiter = opts.delimiter ?? ",";
  const header = opts.header ?? true;

  return {
    encode(rows: Record<string, string>[]): string {
      if (rows.length === 0) return "";
      const keys = Object.keys(rows[0]!);
      const lines = [keys.join(delimiter)];
      for (const row of rows) {
        lines.push(
          keys.map((k) => escapeCsvField(String(row[k] ?? ""), delimiter)).join(delimiter),
        );
      }
      return lines.join("\n");
    },

    decode(input: string): Result<Record<string, string>[], CodecError> {
      const lines = input.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length === 0) return ok([]);

      if (header) {
        const headers = parseLine(lines[0]!, delimiter);
        const rows: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const fields = parseLine(lines[i]!, delimiter);
          const row: Record<string, string> = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]!] = fields[j] ?? "";
          }
          rows.push(row);
        }
        return ok(rows);
      }

      return ok(
        lines.map((l) => {
          const fields = parseLine(l, delimiter);
          const row: Record<string, string> = {};
          for (let i = 0; i < fields.length; i++) {
            row[String(i)] = fields[i]!;
          }
          return row;
        }),
      );
    },
  };
}

/** Default CSV codec with headers. */
export const csv: Codec<Record<string, string>[]> = csvCodec();

// ── Helpers ──

function parseLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function escapeCsvField(field: string, delimiter: string): string {
  if (field.includes(delimiter) || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
