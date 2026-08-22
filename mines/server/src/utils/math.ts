/**
 * Game Mathematics Utility for Mines
 * 
 * Spec formulas:
 * T = Total Tiles (e.g. 25)
 * M = Number of Mines (e.g. 3)
 * S = Number of Safe Tiles = T - M (e.g. 22)
 * P = Number of Safe Picks already made (e.g. 1, 2, 3...)
 * 
 * Probability of making P safe picks:
 * Probability = C(S, P) / C(T, P) = (S! * (T-P)!) / ((S-P)! * T!)
 * Stepwise: Probability(P) = Product_{i=0}^{P-1} (S - i) / (T - i)
 * 
 * Fair Multiplier = 1 / Probability
 * Final Multiplier = Fair Multiplier * (1 - House Edge)
 */

export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;

  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return res;
}

/**
 * Calculates the exact probability of picking `picksCount` safe tiles without hitting a mine.
 */
export function calculateProbability(totalTiles: number, mineCount: number, picksCount: number): number {
  if (picksCount <= 0) return 1.0;
  const safeTiles = totalTiles - mineCount;
  if (picksCount > safeTiles) return 0.0;

  let prob = 1.0;
  for (let i = 0; i < picksCount; i++) {
    prob *= (safeTiles - i) / (totalTiles - i);
  }
  return prob;
}

/**
 * Calculates the final multiplier for a given pick count.
 */
export function calculateMultiplier(
  totalTiles: number,
  mineCount: number,
  picksCount: number,
  houseEdge: number = 0.05
): number {
  if (picksCount <= 0) return 1.0;
  const prob = calculateProbability(totalTiles, mineCount, picksCount);
  if (prob <= 0) return 0.0;

  const fairMultiplier = 1.0 / prob;
  const multiplier = fairMultiplier * (1.0 - houseEdge);
  
  // Truncate to 2 decimal places to prevent floating point inaccuracies, but minimum 1.01x if > 1.0
  const rounded = Math.floor(multiplier * 100) / 100;
  return Math.max(1.01, rounded);
}

/**
 * Helper to calculate payout given bet amount and multiplier.
 */
export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.floor(betAmount * multiplier * 100) / 100;
}

/**
 * Pre-calculates step multipliers for all possible safe picks on a board.
 */
export function calculateMultiplierSteps(
  totalTiles: number,
  mineCount: number,
  houseEdge: number = 0.05
): number[] {
  const safeTiles = totalTiles - mineCount;
  const steps: number[] = [];
  for (let p = 1; p <= safeTiles; p++) {
    steps.push(calculateMultiplier(totalTiles, mineCount, p, houseEdge));
  }
  return steps;
}
