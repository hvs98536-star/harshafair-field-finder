export interface MatchInput {
  cropA: string;
  cropB: string;
  locA?: string;
  locB?: string;
  qtyA?: number | null;
  qtyB?: number | null;
  priceA?: number | null;
  priceB?: number | null;
}

export function calcMatchScore(i: MatchInput): number {
  let score = 0;
  if (i.cropA && i.cropB && i.cropA.toLowerCase().trim() === i.cropB.toLowerCase().trim()) {
    score += 50;
  } else if (i.cropA && i.cropB && (i.cropA.toLowerCase().includes(i.cropB.toLowerCase()) || i.cropB.toLowerCase().includes(i.cropA.toLowerCase()))) {
    score += 25;
  }
  if (i.locA && i.locB) {
    const a = i.locA.toLowerCase();
    const b = i.locB.toLowerCase();
    if (a === b) score += 25;
    else if (a.split(/[, ]+/).some((t) => t && b.includes(t))) score += 12;
  }
  if (i.qtyA && i.qtyB) {
    const ratio = Math.min(i.qtyA, i.qtyB) / Math.max(i.qtyA, i.qtyB);
    score += Math.round(15 * ratio);
  }
  if (i.priceA && i.priceB) {
    const diff = Math.abs(i.priceA - i.priceB) / Math.max(i.priceA, i.priceB);
    score += Math.round(10 * Math.max(0, 1 - diff));
  }
  return Math.min(100, score);
}

export function profileCompleteness(p: Record<string, any> | null | undefined): number {
  if (!p) return 0;
  const fields = ["full_name", "phone", "location", "district", "state", "profile_image_url", "bio", "business_name"];
  const filled = fields.filter((f) => p[f] && String(p[f]).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}