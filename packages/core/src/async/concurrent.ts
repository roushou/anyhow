export async function concurrent<T>(fns: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = Array.from({ length: fns.length });
  let cursor = 0;
  const run = async () => {
    while (cursor < fns.length) {
      const i = cursor++;
      results[i] = await fns[i]!();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, fns.length) }, run));
  return results;
}
