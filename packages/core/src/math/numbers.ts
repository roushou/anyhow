/**
 * Returns `true` if `n` is even.
 *
 * @param n - The number to check.
 * @returns `true` if `n` is an even integer.
 *
 * @example
 * ```ts
 * isEven(2); // true
 * isEven(3); // false
 * ```
 */
export const isEven = (n: number): boolean => n % 2 === 0;

/**
 * Returns `true` if `n` is odd.
 *
 * @param n - The number to check.
 * @returns `true` if `n` is an odd integer.
 *
 * @example
 * ```ts
 * isOdd(3); // true
 * isOdd(2); // false
 * ```
 */
export const isOdd = (n: number): boolean => n % 2 !== 0;

/**
 * Returns `true` if `n` is a safe integer.
 *
 * @param n - The number to check.
 * @returns `true` if `n` is an integer (not a float, not NaN, not Infinity).
 *
 * @example
 * ```ts
 * isInteger(3);   // true
 * isInteger(3.14); // false
 * ```
 */
export const isInteger = (n: number): boolean => Number.isInteger(n);

/**
 * Returns `true` if `n` is a finite number that is not an integer.
 *
 * @param n - The number to check.
 * @returns `true` if `n` is a float.
 *
 * @example
 * ```ts
 * isFloat(3.14); // true
 * isFloat(3);    // false
 * ```
 */
export const isFloat = (n: number): boolean => Number.isFinite(n) && !Number.isInteger(n);

/**
 * Returns the sign of `n` — `1` for positive, `-1` for negative, `0` for zero.
 *
 * @param n - The number.
 * @returns `1`, `-1`, or `0`.
 *
 * @example
 * ```ts
 * sign(42);  // 1
 * sign(-5);  // -1
 * sign(0);   // 0
 * ```
 */
export const sign = (n: number): number => (n > 0 ? 1 : n < 0 ? -1 : 0);

/**
 * Returns `true` if `n` is in `[min, max]` (inclusive).
 *
 * @param n - The value to check.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns `true` if `n` is in the range.
 *
 * @example
 * ```ts
 * inRange(5, 0, 10);  // true
 * inRange(15, 0, 10); // false
 * ```
 */
export const inRange = (n: number, min: number, max: number): boolean => n >= min && n <= max;

/**
 * Returns the greatest common divisor of `a` and `b`.
 *
 * @param a - First number.
 * @param b - Second number.
 * @returns The GCD.
 *
 * @example
 * ```ts
 * gcd(12, 18); // 6
 * ```
 */
export const gcd = (a: number, b: number): number => {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return Math.abs(a);
};

/**
 * Returns the least common multiple of `a` and `b`.
 *
 * @param a - First number.
 * @param b - Second number.
 * @returns The LCM.
 *
 * @example
 * ```ts
 * lcm(4, 6); // 12
 * ```
 */
export const lcm = (a: number, b: number): number =>
  a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b);

/**
 * Returns `true` if `n` is prime.
 *
 * @param n - The number to check.
 * @returns `true` if `n` is prime.
 *
 * @example
 * ```ts
 * isPrime(7);  // true
 * isPrime(10); // false
 * ```
 */
export const isPrime = (n: number): boolean => {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

/**
 * Returns the factorial of `n`.
 *
 * @param n - A non-negative integer.
 * @returns `n!`.
 *
 * @example
 * ```ts
 * factorial(5); // 120
 * ```
 */
export const factorial = (n: number): number => {
  if (!Number.isInteger(n) || n < 0) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

/**
 * Returns the nth Fibonacci number (0-indexed: fib(0)=0, fib(1)=1).
 *
 * @param n - A non-negative integer.
 * @returns The nth Fibonacci number.
 *
 * @example
 * ```ts
 * fibonacci(6); // 8
 * ```
 */
export const fibonacci = (n: number): number => {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n === 0) return 0;
  let a = 0,
    b = 1;
  for (let i = 1; i < n; i++) {
    const t = b;
    b = a + b;
    a = t;
  }
  return b;
};

/**
 * Returns `true` if `n` is a power of two.
 *
 * @param n - The number to check.
 * @returns `true` if `n` is a power of two.
 *
 * @example
 * ```ts
 * isPowerOfTwo(8);  // true
 * isPowerOfTwo(10); // false
 * ```
 */
export const isPowerOfTwo = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;
