import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Sprout, ShoppingCart, Truck, Handshake, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Farmora — Discover Farmers, Buyers, Agents & Transporters" },
      { name: "description", content: "Browse public profiles of farmers, buyers, agents and transporters. No login required." },
    ],
  }),
  component: Directory,
});

type Category = "all" | "farmer" | "buyer" | "agent" | "transporter";

interface ProfileRow {
  id: string;
  full_name: string;
  role: string;
  location: string;
  district: string;
  state: string;
  business_name: string;
  farming_type: string;
  profile_image_url: string;
  is_verified: boolean;
  updated_at: string;
  created_at: string;
}

const CATEGORIES: { key: Category; label: string; icon: any; color: string }[] = [
  { key: "all", label: "All", icon: Search, color: "bg-muted text-foreground" },
  { key: "farmer", label: "Farmers", icon: Sprout, color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { key: "buyer", label: "Buyers", icon: ShoppingCart, color: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { key: "agent", label: "Agents", icon: Handshake, color: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { key: "transporter", label: "Transporters", icon: Truck, color: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
];

function Directory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, role, location, district, state, business_name, farming_type, profile_image_url, is_verified, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(200);
      const { data: listings } = await supabase
        .from("crop_listings")
        .select("farmer_id");
      if (!active) return;
      const c: Record<string, number> = {};
      (listings ?? []).forEach((l: any) => { c[l.farmer_id] = (c[l.farmer_id] ?? 0) + 1; });
      setCounts(c);
      setProfiles((profs as ProfileRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (cat !== "all" && p.role !== cat) return false;
      if (q && !`${p.full_name} ${p.business_name} ${p.farming_type}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (loc && !`${p.location} ${p.district} ${p.state}`.toLowerCase().includes(loc.toLowerCase())) return false;
      return true;
    });
  }, [profiles, cat, q, loc]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Sprout className="h-4 w-4 text-primary" /> Farmora — Public Directory
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Discover farmers, buyers, agents & transporters
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Browse all registered users — no login required. Click any profile to see their listings and contact details.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, crop, business..."
                className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="Filter by location, district, state"
                className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = cat === c.key;
              const count = c.key === "all" ? profiles.length : profiles.filter((p) => p.role === c.key).length;
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    active ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {c.label}
                  <span className={`ml-1 text-[11px] ${active ? "opacity-90" : "text-muted-foreground"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No profiles match your filters</h3>
            <p className="text-sm text-muted-foreground mt-1">Try clearing the search or selecting a different category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProfileCard
                key={p.id}
                p={p}
                listingCount={counts[p.id] ?? 0}
                onOpen={(id) => {
                  if (!user) {
                    toast.info("Please sign in to view this profile");
                    navigate({ to: "/auth" });
                  } else {
                    navigate({ to: "/u/$id", params: { id } });
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileCard({ p, listingCount, onOpen }: { p: ProfileRow; listingCount: number; onOpen: (id: string) => void }) {
  const cat = CATEGORIES.find((c) => c.key === p.role) ?? CATEGORIES[0];
  const Icon = cat.icon;
  const initials = (p.full_name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const place = [p.location, p.district, p.state].filter(Boolean).join(", ");

  return (
    <button
      type="button"
      onClick={() => onOpen(p.id)}
      className="group block w-full text-left rounded-2xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {p.profile_image_url ? (
          <img src={p.profile_image_url} alt={p.full_name} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary">
              {p.full_name || "Unnamed user"}
            </h3>
            {p.is_verified && <ShieldCheck className="h-4 w-4 text-primary shrink-0" />}
          </div>
          {p.business_name && <p className="text-xs text-muted-foreground truncate">{p.business_name}</p>}
          <span className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cat.color}`}>
            <Icon className="h-3 w-3" /> {cat.label.replace(/s$/, "")}
          </span>
        </div>
      </div>

      {place && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> <span className="truncate">{place}</span>
        </div>
      )}
      {p.farming_type && (
        <p className="mt-1 text-xs text-muted-foreground truncate">🌱 {p.farming_type}</p>
      )}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {p.role === "farmer" ? `${listingCount} listing${listingCount === 1 ? "" : "s"}` : "View profile"}
        </span>
        <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
      </div>
    </button>
  );
}
