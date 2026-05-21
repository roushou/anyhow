export { some, none } from "./option.js";

// Re-declare locally so TypeScript can merge the generic type and the const.
import type { Option as _O } from "./option.js";
export type Option<T> = _O<T>;

import { OptionStatic } from "./static.js";
export const Option = OptionStatic;
