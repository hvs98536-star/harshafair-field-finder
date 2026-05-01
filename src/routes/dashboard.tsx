import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Sprout, Plus, Package, HandCoins, MapPin, LogOut, Search, Filter, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Listing = {
  id: string;
  crop_name: string;
  quantity: string;
  price: string;
  location: string;
  available_date: string | null;
  notes: string | null;
  status: string;
  farmer_id: string;
  created_at: string;
  profiles?: { full_name: string } | null;
};

type Offer = {
  id: string;
  listing_id: string;
  buyer_id: string;
  offered_price: string;
  offered_qty: string;
  message: string | null;
  status: string;
  crop_listings?: { crop_name: string } | null;
  profiles?: { full_name: string } | null;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Farmora" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const role = profile?.role || "farmer";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">Farmora</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{role}</span>
            {profile?.full_name && <span className="ml-2 text-sm text-muted-foreground">— {profile.full_name}</span>}
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === "farmer" ? (
          <FarmerDashboard userId={user.id} showForm={showForm} setShowForm={setShowForm} location={profile?.location || ""} />
        ) : (
          <BuyerDashboard userId={user.id} />
        )}
      </div>
    </div>
  );
}

function FarmerDashboard({ userId, showForm, setShowForm, location }: { userId: string; showForm: boolean; setShowForm: (v: boolean) => void; location: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState({ crop_name: "", quantity: "", price: "", location: "", available_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const [{ data: l }, { data: o }] = await Promise.all([
      supabase.from("crop_listings").select("*").eq("farmer_id", userId).order("created_at", { ascending: false }),
      supabase.from("offers").select("*, crop_listings(crop_name), profiles(full_name)").filter("listing_id", "in", `(${(await supabase.from("crop_listings").select("id").eq("farmer_id", userId)).data?.map(r => r.id).join(",") || "00000000-0000-0000-0000-000000000000"})`),
    ]);
    setListings((l as Listing[]) || []);
    setOffers((o as Offer[]) || []);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    setSaving(true);
    const { error } = await supabase.from("crop_listings").insert({
      farmer_id: userId,
      crop_name: form.crop_name,
      quantity: form.quantity,
      price: form.price,
      location: form.location || location,
      available_date: form.available_date || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Listing created!");
    setForm({ crop_name: "", quantity: "", price: "", location: "", available_date: "", notes: "" });
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("crop_listings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    loadData();
  };

  const handleOfferAction = async (offerId: string, status: "accepted" | "rejected") => {
    const { error } = await supabase.from("offers").update({ status }).eq("id", offerId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Offer ${status}`);
    loadData();
  };

  const activeCount = listings.filter(l => l.status === "active").length;

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Manage your crop listings and offers</p>
        </div>
        <Button variant="hero" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Listing
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader><CardTitle>Create Crop Listing</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Crop Name *</label>
                <input value={form.crop_name} onChange={e => setForm(f => ({ ...f, crop_name: e.target.value }))} required className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Tomatoes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quantity *</label>
                <input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 500 kg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Expected Price *</label>
                <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. ₹25/kg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Availability Date</label>
                <input type="date" value={form.available_date} onChange={e => setForm(f => ({ ...f, available_date: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Village / City, State" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Organic, freshly harvested..." />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="hero" onClick={handleCreate} disabled={saving || !form.crop_name || !form.quantity || !form.price}>{saving ? "Creating..." : "Create Listing"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{activeCount}</p><p className="text-sm text-muted-foreground">Active Listings</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center"><HandCoins className="h-5 w-5 text-accent-foreground" /></div><div><p className="text-2xl font-bold text-foreground">{offers.length}</p><p className="text-sm text-muted-foreground">Offers Received</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-farm-green-light flex items-center justify-center"><MapPin className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{location || "—"}</p><p className="text-sm text-muted-foreground">Your Location</p></div></div></CardContent></Card>
      </div>

      {offers.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Offers</h2>
          <div className="space-y-3 mb-8">
            {offers.map((o) => (
              <Card key={o.id}>
                <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{o.crop_listings?.crop_name} — {o.profiles?.full_name || "Buyer"}</p>
                    <p className="text-sm text-muted-foreground">{o.offered_price} for {o.offered_qty}</p>
                    {o.message && <p className="text-xs text-muted-foreground mt-1">"{o.message}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status === "pending" ? (
                      <>
                        <Button size="sm" variant="hero" onClick={() => handleOfferAction(o.id, "accepted")}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => handleOfferAction(o.id, "rejected")}>Reject</Button>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-primary capitalize">{o.status}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-4">Your Listings</h2>
      {listings.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No listings yet. Create your first one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <Card key={l.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground text-lg">{l.crop_name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(l.id)} className="text-destructive h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>📦 {l.quantity} · {l.price}</p>
                  {l.available_date && <p>📅 {l.available_date}</p>}
                  <p>📍 {l.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function BuyerDashboard({ userId }: { userId: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [offerModal, setOfferModal] = useState<Listing | null>(null);
  const [offerForm, setOfferForm] = useState({ price: "", qty: "", message: "" });
  const [sending, setSending] = useState(false);

  const loadListings = useCallback(async () => {
    const { data } = await supabase.from("crop_listings").select("*, profiles(full_name)").eq("status", "active").order("created_at", { ascending: false });
    setListings((data as Listing[]) || []);
  }, []);

  useEffect(() => { loadListings(); }, [loadListings]);

  const filtered = listings.filter((l) =>
    l.crop_name.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  const sendOffer = async () => {
    if (!offerModal) return;
    setSending(true);
    const { error } = await supabase.from("offers").insert({
      listing_id: offerModal.id,
      buyer_id: userId,
      offered_price: offerForm.price,
      offered_qty: offerForm.qty,
      message: offerForm.message || null,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Offer sent!");
    setOfferModal(null);
    setOfferForm({ price: "", qty: "", message: "" });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Browse Crops</h1>
        <p className="text-muted-foreground">Find fresh produce directly from farmers</p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Search crops, locations..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((l) => (
          <Card key={l.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-foreground text-lg">{l.crop_name}</h3>
                <span className="text-sm font-bold text-primary">{l.price}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>📦 {l.quantity}</p>
                {l.available_date && <p>📅 Available: {l.available_date}</p>}
                <p>📍 {l.location}</p>
                <p>👨‍🌾 {l.profiles?.full_name || "Farmer"}</p>
              </div>
              <Button variant="hero" size="sm" className="mt-4 w-full" onClick={() => { setOfferModal(l); setOfferForm({ price: "", qty: "", message: "" }); }}>
                Send Offer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No crops found matching your search.</div>
      )}

      {offerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOfferModal(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground">Send Offer for {offerModal.crop_name}</h3>
            <p className="text-sm text-muted-foreground">Listed at {offerModal.price} — {offerModal.quantity}</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Your Price *</label>
              <input value={offerForm.price} onChange={e => setOfferForm(f => ({ ...f, price: e.target.value }))} required className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. ₹22/kg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quantity *</label>
              <input value={offerForm.qty} onChange={e => setOfferForm(f => ({ ...f, qty: e.target.value }))} required className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 200 kg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message (optional)</label>
              <input value={offerForm.message} onChange={e => setOfferForm(f => ({ ...f, message: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Quick delivery needed..." />
            </div>
            <div className="flex gap-3">
              <Button variant="hero" onClick={sendOffer} disabled={sending || !offerForm.price || !offerForm.qty}>{sending ? "Sending..." : "Send Offer"}</Button>
              <Button variant="outline" onClick={() => setOfferModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}