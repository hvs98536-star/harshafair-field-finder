import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Trash2, Loader2, Users, Sprout, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Farmora" }] }),
  component: AdminPage,
});

type Tab = "users" | "listings" | "requests";

function AdminPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("listings");
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (profile && profile.role !== "admin") { toast.error("Admins only"); navigate({ to: "/dashboard" }); }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    setBusy(true);
    const table = tab === "users" ? "profiles" : tab === "listings" ? "crop_listings" : "buyer_requests";
    supabase.from(table).select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      setRows(data || []); setBusy(false);
    });
  }, [tab, profile]);

  const remove = async (table: "crop_listings" | "buyer_requests", id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((x) => x.filter((r) => r.id !== id));
    toast.success("Deleted");
  };

  if (loading || !profile || profile.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <h1 className="text-2xl font-bold mt-4 mb-4 flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Admin Moderation</h1>

        <div className="flex gap-2 mb-6 border-b border-border">
          {([
            { k: "listings" as const, l: "Listings", I: Sprout },
            { k: "requests" as const, l: "Requests", I: HandCoins },
            { k: "users" as const, l: "Users", I: Users },
          ]).map(({ k, l, I }) => (
            <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <I className="h-4 w-4" /> {l}
            </button>
          ))}
        </div>

        {busy ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nothing to moderate.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className="flex-1 min-w-0">
                  {tab === "users" && <p className="font-medium truncate">{r.full_name || "(no name)"} <span className="text-xs text-muted-foreground capitalize">· {r.role}</span></p>}
                  {tab !== "users" && <p className="font-medium truncate">{r.crop_name} <span className="text-xs text-muted-foreground">· {tab === "listings" ? r.price : r.offer_price}</span></p>}
                  <p className="text-xs text-muted-foreground truncate">{r.location || r.phone || ""} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                {tab !== "users" && (
                  <button onClick={() => remove(tab === "listings" ? "crop_listings" : "buyer_requests", r.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}