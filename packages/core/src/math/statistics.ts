export const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

export const average = (ns: number[]) => sum(ns) / ns.length;

export const median = (ns: number[]) => {
  const s = [...ns].sort((a, b) => a - b),
    m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};
