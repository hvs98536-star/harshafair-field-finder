import { ShieldCheck } from "lucide-react";

export function VerifiedBadge({ role, className = "" }: { role?: string; className?: string }) {
  const label = role === "buyer" ? "Trusted Buyer" : "Verified Farmer";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 ${className}`}>
      <ShieldCheck className="h-3 w-3" /> {label}
    </span>
  );
}