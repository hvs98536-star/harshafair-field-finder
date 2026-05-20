import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRecent } from "@/lib/recentlyViewed";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favorites — Farmora" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: favs } = await supabase.from("favorites").select("*").eq("user_id", user.id);
      const listIds = (favs || []).filter((f) => f.item_type === "listing").map((f) => f.item_id);
      const reqIds = (favs || []).filter((f) => f.item_type === "request").map((f) => f.item_id);
      const [{ data: l }, { data: r }] = await Promise.all([
        listIds.length ? supabase.from("crop_listings").select("*").in("id", listIds) : Promise.resolve({ data: [] as any[] }),
        reqIds.length ? supabase.from("buyer_requests").select("*").in("id", reqIds) : Promise.resolve({ data: [] as any[] }),
      ]);
      setListings(l || []);
      setRequests(r || []);

      const recent = getRecent();
      const rL = recent.filter((x) => x.type === "listing").map((x) => x.id);
      const rR = recent.filter((x) => x.type === "request").map((x) => x.id);
      const [{ data: rl }, { data: rr }] = await Promise.all([
        rL.length ? supabase.from("crop_listings").select("*").in("id", rL) : Promise.resolve({ data: [] as any[] }),
        rR.length ? supabase.from("buyer_requests").select("*").in("id", rR) : Promise.resolve({ data: [] as any[] }),
      ]);
      setRecentListings(rl || []);
      setRecentRequests(rr || []);
      setBusy(false);
    })();
  }, [user]);

  if (loading || busy) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const empty = listings.length + requests.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <h1 className="text-3xl font-bold mt-4 flex items-center gap-2"><Heart className="h-7 w-7 text-primary" /> Saved items</h1>

        {empty ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl mt-6">
            <Heart className="h-10 w-10 mx-auto mb-3" />
            <p className="font-medium text-foreground">No favorites yet</p>
            <p className="text-sm mt-1">Tap the heart icon on any listing or request to save it here.</p>
          </div>
        ) : (
          <div className="space-y-10 mt-6">
            {listings.length > 0 && <Section title="Saved listings" items={listings} type="listing" />}
            {requests.length > 0 && <Section title="Saved buyer requests" items={requests} type="request" />}
          </div>
        )}

        {(recentListings.length + recentRequests.length) > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Recently viewed</h2>
            {recentListings.length > 0 && <Section title="" items={recentListings} type="listing" />}
            {recentRequests.length > 0 && <Section title="" items={recentRequests} type="request" />}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, type }: { title: string; items: any[]; type: "listing" | "request" }) {
  return (
    <div>
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <Link
            key={it.id}
            to={type === "listing" ? "/listings/$id" : "/requests/$id"}
            params={{ id: it.id }}
            className="block rounded-xl overflow-hidden border border-border hover:shadow-md transition"
          >
            {it.image_urls?.[0]
              ? <img src={it.image_urls[0]} alt={it.crop_name || "Saved item"} className="h-32 w-full object-cover" />
              : <div className="h-32 bg-muted flex items-center justify-center text-4xl">{type === "listing" ? "🌾" : "🛒"}</div>}
            <div className="p-3">
              <p className="text-sm font-medium truncate">{it.crop_name}</p>
              <p className="text-sm text-primary font-semibold truncate">{type === "listing" ? it.price : it.offer_price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}