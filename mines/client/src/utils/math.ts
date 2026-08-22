export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount).replace('INR', '₹').trim();
}

export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(2)}×`;
}

/**
 * Calculates risk description based on mine count
 */
export function getRiskLevel(mineCount: number, totalTiles: number = 25): { label: string; color: string } {
  const ratio = mineCount / totalTiles;
  if (mineCount === 1) return { label: 'Low Risk', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
  if (ratio <= 0.15) return { label: 'Medium-Low Risk', color: 'text-teal-400 bg-teal-950/40 border-teal-500/30' };
  if (ratio <= 0.3) return { label: 'Medium Risk', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' };
  if (ratio <= 0.5) return { label: 'High Risk', color: 'text-orange-400 bg-orange-950/40 border-orange-500/30' };
  if (ratio <= 0.8) return { label: 'Extreme Risk', color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' };
  return { label: 'Maximum Risk', color: 'text-red-500 bg-red-950/60 border-red-500/50' };
}
