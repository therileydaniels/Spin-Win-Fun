// Weighted Probability Pattern implementation for QuickWheel.
// See Z:\0000 Documents\App Docs\WEIGHTED_PROBABILITY_PATTERN.md
//
// QuickWheel uses weighted mode only (no exact-pick concept) over
// independent items (wheel segments are unrelated to each other, unlike a
// derived distribution such as summed dice), so the fair default is always
// flat 100/n and there is no `mode`/`exactIndex` wrapper here.

// Runs on every slider drag tick. Sets weights[changedIndex] directly, then
// redistributes the remaining 100 - newValue across every other weight,
// scaled proportionally to preserve their relative shares. Always returns an
// array that sums to exactly 100.
export function normalizeWeights(
  weights: number[],
  changedIndex: number,
  newValue: number
): number[] {
  const result = [...weights];
  const oldValue = result[changedIndex];
  result[changedIndex] = newValue;

  const delta = newValue - oldValue;
  if (Math.abs(delta) < 0.01) return result;

  const otherIndices = result.map((_, i) => i).filter((i) => i !== changedIndex);
  const otherSum = otherIndices.reduce((sum, i) => sum + result[i], 0);
  const remaining = 100 - newValue;

  if (otherSum === 0) {
    const share = remaining / otherIndices.length;
    otherIndices.forEach((i) => (result[i] = share));
  } else {
    otherIndices.forEach((i) => {
      result[i] = Math.max(0, result[i] * (remaining / otherSum));
      if (result[i] < 0.5) result[i] = 0;
    });
  }

  const total = result.reduce((a, b) => a + b, 0);
  const drift = 100 - total;
  if (Math.abs(drift) > 0.01) {
    const largestIdx = otherIndices.reduce(
      (best, i) => (result[i] > result[best] ? i : best),
      otherIndices[0]
    );
    result[largestIdx] += drift;
  }

  return result;
}

// "Fair" for QuickWheel is always flat, since wheel segments are independent
// items, not a derived/compound distribution. `domainType` is kept in the
// signature to match the pattern doc's naming convention even though only
// "independent" is used today.
export function computeFairDefault(domainType: "independent", n: number): number[] {
  if (n <= 0) return [];
  const share = 100 / n;
  const result = Array(n).fill(share);
  const total = result.reduce((a: number, b: number) => a + b, 0);
  result[result.length - 1] += 100 - total;
  return result;
}

// Classic cumulative ("roulette wheel") weighted selection. Also used
// client-side in Embed.tsx, which has no server round-trip for its own
// preview spins.
export function selectWeightedIndex(weights: number[], excludedIndices: number[] = []): number {
  const available = weights
    .map((w, i) => ({ w, i }))
    .filter(({ i }) => !excludedIndices.includes(i));

  if (available.length === 0) return 0;

  const total = available.reduce((sum, { w }) => sum + w, 0);

  if (total === 0) {
    return available[Math.floor(Math.random() * available.length)].i;
  }

  const r = Math.random() * total;
  let cumulative = 0;
  for (const { w, i } of available) {
    cumulative += w;
    if (r < cumulative) return i;
  }
  return available[available.length - 1].i;
}

// Adding a segment carves out a fair 1/n share, scaling the existing weights
// down proportionally so their relative weighting is preserved.
export function addWeightForNewSegment(weights: number[]): number[] {
  const n = weights.length + 1;
  const newShare = 100 / n;
  const scale = (100 - newShare) / 100;
  const result = [...weights.map((w) => w * scale), newShare];
  const total = result.reduce((a, b) => a + b, 0);
  const drift = 100 - total;
  if (Math.abs(drift) > 0.01) result[result.length - 1] += drift;
  return result;
}

// Removing a segment redistributes its share back across the rest,
// proportionally to what they already held.
export function removeWeightAtIndex(weights: number[], index: number): number[] {
  const remaining = weights.filter((_, i) => i !== index);
  if (remaining.length === 0) return remaining;

  const remainingSum = remaining.reduce((a, b) => a + b, 0);
  if (remainingSum === 0) return computeFairDefault("independent", remaining.length);

  const scale = 100 / remainingSum;
  const result = remaining.map((w) => w * scale);
  const drift = 100 - result.reduce((a, b) => a + b, 0);
  if (Math.abs(drift) > 0.01) {
    const largestIdx = result.reduce((best, w, i) => (w > result[best] ? i : best), 0);
    result[largestIdx] += drift;
  }
  return result;
}

// Migration helper for loaded weights: brings legacy data (the old
// zero-means-equal-odds sentinel, or a save-time total that never had to sum
// to 100) in line with the "always sums to exactly 100" invariant. A no-op
// for already-valid weights.
export function normalizeLoadedWeights(weights: number[]): number[] {
  if (weights.length === 0) return weights;

  const total = weights.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  if (total <= 0) return computeFairDefault("independent", weights.length);
  if (Math.abs(total - 100) < 0.01) return weights;

  const scale = 100 / total;
  const result = weights.map((w) => (Number.isFinite(w) ? Math.max(0, w) * scale : 0));
  const drift = 100 - result.reduce((a, b) => a + b, 0);
  if (Math.abs(drift) > 0.01) {
    const largestIdx = result.reduce((best, w, i) => (w > result[best] ? i : best), 0);
    result[largestIdx] += drift;
  }
  return result;
}
