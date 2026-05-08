import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export interface Filters {
  search: string;
  location: string;
  priceMin: string;
  priceMax: string;
  qtyMin: string;
  qtyMax: string;
  organic: boolean;
  sort: "recent" | "price_asc" | "price_desc";
}

export const defaultFilters: Filters = {
  search: "", location: "", priceMin: "", priceMax: "", qtyMin: "", qtyMax: "", organic: false, sort: "recent",
};

const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function FilterBar({ value, onChange, showOrganic = true }: { value: Filters; onChange: (f: Filters) => void; showOrganic?: boolean }) {
  const [open, setOpen] = useState(false);
  const set = (k: keyof Filters, v: any) => onChange({ ...value, [k]: v });
  const reset = () => onChange(defaultFilters);
  const active = JSON.stringify(value) !== JSON.stringify(defaultFilters);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 mb-6 space-y-3">
      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className={`${inp} pl-9`} placeholder="Search crop name…" value={value.search} onChange={(e) => set("search", e.target.value)} />
        </div>
        <select className={inp + " w-auto"} value={value.sort} onChange={(e) => set("sort", e.target.value)}>
          <option value="recent">Recent</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        <button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        {active && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-border">
          <input className={inp} placeholder="Location" value={value.location} onChange={(e) => set("location", e.target.value)} />
          <input className={inp} placeholder="Min ₹" inputMode="numeric" value={value.priceMin} onChange={(e) => set("priceMin", e.target.value)} />
          <input className={inp} placeholder="Max ₹" inputMode="numeric" value={value.priceMax} onChange={(e) => set("priceMax", e.target.value)} />
          <input className={inp} placeholder="Min qty" inputMode="numeric" value={value.qtyMin} onChange={(e) => set("qtyMin", e.target.value)} />
          <input className={inp} placeholder="Max qty" inputMode="numeric" value={value.qtyMax} onChange={(e) => set("qtyMax", e.target.value)} />
          {showOrganic && (
            <label className="flex items-center gap-2 text-sm col-span-2 sm:col-span-1">
              <input type="checkbox" checked={value.organic} onChange={(e) => set("organic", e.target.checked)} className="h-4 w-4 rounded border-input" />
              Organic only
            </label>
          )}
        </div>
      )}
    </div>
  );
}

export function applyFilters<T extends { crop_name: string; location: string; price_numeric?: number | null; quantity_numeric?: number | null; is_organic?: boolean; created_at: string }>(items: T[], f: Filters): T[] {
  let out = items.filter((it) => {
    if (f.search && !it.crop_name.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.location && !(it.location || "").toLowerCase().includes(f.location.toLowerCase())) return false;
    const pn = it.price_numeric ?? null;
    if (f.priceMin && (pn == null || pn < Number(f.priceMin))) return false;
    if (f.priceMax && (pn == null || pn > Number(f.priceMax))) return false;
    const qn = it.quantity_numeric ?? null;
    if (f.qtyMin && (qn == null || qn < Number(f.qtyMin))) return false;
    if (f.qtyMax && (qn == null || qn > Number(f.qtyMax))) return false;
    if (f.organic && !it.is_organic) return false;
    return true;
  });
  if (f.sort === "price_asc") out = [...out].sort((a, b) => (a.price_numeric ?? 1e15) - (b.price_numeric ?? 1e15));
  else if (f.sort === "price_desc") out = [...out].sort((a, b) => (b.price_numeric ?? -1) - (a.price_numeric ?? -1));
  else out = [...out].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return out;
}