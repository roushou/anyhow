export { ok, err } from "./result.js";

// Re-declare locally so TypeScript can merge the generic type and the const.
import type { Result as _R } from "./result.js";
export type Result<T, E = Error> = _R<T, E>;

import { ResultStatic } from "./static.js";
export const Result = ResultStatic;

export { Pipeline, pipeline, type Stage } from "./pipeline.js";
export { Stepper, type StepState } from "./stepper.js";
