export const isString = (v: unknown): v is string => typeof v === "string";
export const isNumber = (v: unknown): v is number => typeof v === "number";
export const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";
export const isObject = (v: unknown): v is object => !!v && typeof v === "object";
export const isDefined = <T>(v: T): v is NonNullable<T> => v !== null && v !== undefined;
