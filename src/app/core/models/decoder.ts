/** Small runtime decoders: HTTP JSON enters as unknown, never as a trusted cast. */
export class DataValidationError extends Error {
  constructor(
    readonly path: string,
    detail: string,
  ) {
    super(`${path}: ${detail}`);
    this.name = 'DataValidationError';
  }
}
export type Decoder<T> = (value: unknown, path: string) => T;
export const fail = (path: string, detail: string): never => {
  throw new DataValidationError(path, detail);
};
export const text: Decoder<string> = (value, path) =>
  typeof value === 'string' && value.trim().length > 0
    ? value
    : fail(path, 'expected non-empty string');
export const boolean: Decoder<boolean> = (value, path) =>
  typeof value === 'boolean' ? value : fail(path, 'expected boolean');
export const number: Decoder<number> = (value, path) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fail(path, 'expected finite non-negative number');
export const integer: Decoder<number> = (value, path) => {
  const result = number(value, path);
  return Number.isSafeInteger(result) ? result : fail(path, 'expected safe integer');
};
export const positiveInteger: Decoder<number> = (value, path) => {
  const result = integer(value, path);
  return result > 0 ? result : fail(path, 'expected positive integer');
};
export const nullable =
  <T>(decode: Decoder<T>): Decoder<T | null> =>
  (value, path) =>
    value === null ? null : decode(value, path);
export const array =
  <T>(decode: Decoder<T>): Decoder<readonly T[]> =>
  (value, path) =>
    Array.isArray(value)
      ? value.map((item: unknown, index) => decode(item, `${path}[${index}]`))
      : fail(path, 'expected array');
export const oneOf =
  <T extends string>(...values: readonly T[]): Decoder<T> =>
  (value, path) => {
    for (const option of values) if (value === option) return option;
    return fail(path, `expected one of ${values.join(', ')}`);
  };
export const pattern =
  (expression: RegExp): Decoder<string> =>
  (value, path) => {
    const result = text(value, path);
    return expression.test(result) ? result : fail(path, 'invalid format');
  };
export const id = pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const timestamp: Decoder<string> = (value, path) => {
  const result = pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/)(value, path);
  const time = Date.parse(result);
  if (
    !Number.isFinite(time) ||
    new Date(time).toISOString() !== result.replace(/(?<!\.\d{3})Z$/, '.000Z')
  )
    fail(path, 'invalid UTC timestamp');
  return result;
};
export const url: Decoder<string> = (value, path) => {
  const result = text(value, path);
  try {
    const parsed = new URL(result);
    if (['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password)
      return result;
  } catch {
    /* report a validation error below */
  }
  return fail(path, 'expected public HTTP(S) URL without credentials');
};
export type Shape<T> = { readonly [K in keyof T]-?: Decoder<T[K]> };
export const object =
  <T>(shape: Shape<T>): Decoder<T> =>
  (value, path) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
      return fail(path, 'expected object');
    const source = value as Record<string, unknown>;
    const result = {} as T;
    for (const key of Object.keys(shape) as (keyof T & string)[])
      result[key] = shape[key](source[key], `${path}.${key}`);
    return result;
  };
