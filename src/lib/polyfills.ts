// pdf.js 6 uses a few very new JavaScript features that older browsers (and older Chromium builds)
// do not have yet. These small stand-ins behave the same for what pdf.js needs. Import this before pdf.js.

type Keyed<K, V> = { has(k: K): boolean; get(k: K): V | undefined; set(k: K, v: V): unknown };

function addKeyedHelpers(proto: object) {
  const p = proto as Record<string, unknown>;
  if (!p.getOrInsert) {
    p.getOrInsert = function <K, V>(this: Keyed<K, V>, key: K, value: V): V {
      if (this.has(key)) return this.get(key) as V;
      this.set(key, value);
      return value;
    };
  }
  if (!p.getOrInsertComputed) {
    p.getOrInsertComputed = function <K, V>(this: Keyed<K, V>, key: K, compute: (k: K) => V): V {
      if (this.has(key)) return this.get(key) as V;
      const value = compute(key);
      this.set(key, value);
      return value;
    };
  }
}

addKeyedHelpers(Map.prototype);
addKeyedHelpers(WeakMap.prototype);

const math = Math as unknown as { sumPrecise?: (values: Iterable<number>) => number };
if (!math.sumPrecise) {
  math.sumPrecise = (values) => {
    let sum = 0;
    for (const v of values) sum += v;
    return sum;
  };
}
