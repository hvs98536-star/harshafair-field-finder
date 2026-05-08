import { Sparkles } from "lucide-react";

export function MatchScore({ score }: { score: number }) {
  if (score <= 0) return null;
  const tone =
    score >= 75 ? "bg-primary text-primary-foreground" :
    score >= 50 ? "bg-primary/20 text-primary" :
    "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
      <Sparkles className="h-3 w-3" /> {score}% match
    </span>
  );
}