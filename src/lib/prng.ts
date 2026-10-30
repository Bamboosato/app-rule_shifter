/**
 * Mulberry32 擬似乱数生成器 (PRNG)
 * シード値から決定論的に 0 以上 1 未満の乱数を生成
 */
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 文字列（例: "20261028" や "stage3"）から32bit整数シード値を生成するハッシュ関数
 */
export function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash >>> 0;
}
