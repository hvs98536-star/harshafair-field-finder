import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sprout, Plus, Package, HandCoins, MapPin, LogOut, Search, Phone, MessageCircle, User as UserIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uploadImages } from "@/lib/uploadImages";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Farmora" }] }),
  component: DashboardPage,
});

type Listing = {
  id: string;
  farmer_id: string;
  crop_name: string;
  quantity: string;
  price: string;
  location: string;
  notes: string | null;
  available_date: string | null;
  image_urls: string[];
  created_at: string;
};

type RequestRow = {
  id: string;
  buyer_id: string;
  crop_name: string;
  quantity_needed: string;
  offer_price: string;
  location: string;
  notes: string | null;
  image_urls: string[];
  created_at: string;
};

type ProfileLite = { id: string; full_name: string; phone: string; business_name: string; profile_image_url: string; role: string };

function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">Farmora</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{profile.role}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-muted-foreground mr-2">Hi, {profile.full_name || "there"}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile.role === "farmer" ? <FarmerView /> : <BuyerView />}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function ContactButtons({ phone }: { phone: string }) {
  if (!phone) return <span className="text-xs text-muted-foreground">No phone</span>;
  const wa = phone.replace(/\D/g, "");
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline" className="flex-1">
        <a href={`tel:${phone}`}><Phone className="h-3.5 w-3.5 mr-1" /> Call</a>
      </Button>
      <Button asChild size="sm" variant="hero" className="flex-1">
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp</a>
      </Button>
    </div>
  );
}

function ImagePicker({ files, setFiles }: { files: File[]; setFiles: (f: File[]) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Photos</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
      />
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- FARMER ---------------- */
function FarmerView() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [buyers, setBuyers] = useState<Record<string, ProfileLite>>({});
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    const [l, r] = await Promise.all([
      supabase.from("crop_listings").select("*").eq("farmer_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("buyer_requests").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setListings((l.data as Listing[]) || []);
    const reqs = (r.data as RequestRow[]) || [];
    setRequests(reqs);
    const ids = [...new Set(reqs.map((x) => x.buyer_id))];
    if (ids.length) {
      const { data } = await supabase.from("profiles").select("id,full_name,phone,business_name,profile_image_url,role").in("id", ids);
      const map: Record<string, ProfileLite> = {};
      (data || []).forEach((p: any) => (map[p.id] = p));
      setBuyers(map);
    }
  };
  useEffect(() => { refresh(); }, []);

  const filteredReqs = requests.filter((r) =>
    r.crop_name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Post your crops and discover buyers</p>
        </div>
        <Button variant="hero" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> New Listing
        </Button>
      </div>

      {showForm && <ListingForm onDone={() => { setShowForm(false); refresh(); }} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Package className="h-5 w-5 text-primary" />} value={listings.length.toString()} label="Active Listings" />
        <StatCard icon={<HandCoins className="h-5 w-5 text-primary" />} value={requests.length.toString()} label="Buyer Requests" />
        <StatCard icon={<MapPin className="h-5 w-5 text-primary" />} value={profile?.district || profile?.location || "—"} label="Your Area" />
      </div>

      <h2 className="text-lg font-semibold mb-4">Your Listings</h2>
      {listings.length === 0 ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="No listings yet" subtitle="Post your first crop listing to get discovered by buyers." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {listings.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 mt-10 gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Buyer Requests</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className={`${inputCls} pl-10`} placeholder="Search crop or location" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {filteredReqs.length === 0 ? (
        <EmptyState icon={<HandCoins className="h-8 w-8" />} title="No buyer requests" subtitle="Check back soon — buyers post new requests every day." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReqs.map((r) => <RequestCard key={r.id} r={r} buyer={buyers[r.buyer_id]} />)}
        </div>
      )}
    </>
  );
}

function ListingForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ crop_name: "", quantity: "", price: "", location: "", available_date: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!f.crop_name || !f.quantity || !f.price) {
      toast.error("Crop, quantity and price are required");
      return;
    }
    setBusy(true);
    try {
      let urls: string[] = [];
      if (files.length) urls = await uploadImages("crop-images", user!.id, files);
      const { error } = await supabase.from("crop_listings").insert({
        farmer_id: user!.id,
        crop_name: f.crop_name,
        quantity: f.quantity,
        price: f.price,
        location: f.location,
        available_date: f.available_date || null,
        notes: f.notes,
        image_urls: urls,
      });
      if (error) throw error;
      toast.success("Listing posted!");
      onDone();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>Post New Crop Listing</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Crop Name *"><input className={inputCls} value={f.crop_name} onChange={(e) => setF({ ...f, crop_name: e.target.value })} /></Field>
          <Field label="Quantity *"><input className={inputCls} placeholder="500 kg" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
          <Field label="Expected Price *"><input className={inputCls} placeholder="₹25/kg" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
          <Field label="Available Date"><input type="date" className={inputCls} value={f.available_date} onChange={(e) => setF({ ...f, available_date: e.target.value })} /></Field>
          <Field label="Location"><input className={inputCls} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
          <Field label="Notes"><input className={inputCls} placeholder="Organic, freshly harvested..." value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        </div>
        <ImagePicker files={files} setFiles={setFiles} />
        <div className="flex gap-3">
          <Button variant="hero" onClick={submit} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Post Listing</Button>
          <Button variant="outline" onClick={onDone}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- BUYER ---------------- */
function BuyerView() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [farmers, setFarmers] = useState<Record<string, ProfileLite>>({});
  const [myReqs, setMyReqs] = useState<RequestRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    const [l, r] = await Promise.all([
      supabase.from("crop_listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(50),
      supabase.from("buyer_requests").select("*").eq("buyer_id", user!.id).order("created_at", { ascending: false }),
    ]);
    const ls = (l.data as Listing[]) || [];
    setListings(ls);
    setMyReqs((r.data as RequestRow[]) || []);
    const ids = [...new Set(ls.map((x) => x.farmer_id))];
    if (ids.length) {
      const { data } = await supabase.from("profiles").select("id,full_name,phone,business_name,profile_image_url,role").in("id", ids);
      const map: Record<string, ProfileLite> = {};
      (data || []).forEach((p: any) => (map[p.id] = p));
      setFarmers(map);
    }
  };
  useEffect(() => { refresh(); }, []);

  const filtered = listings.filter((l) =>
    l.crop_name.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  // recommended matches: farmer crops where any of buyer's open requests match crop_name
  const myCrops = new Set(myReqs.map((r) => r.crop_name.toLowerCase()));
  const matches = filtered.filter((l) => myCrops.has(l.crop_name.toLowerCase()));

  return (
    <>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Discover farmers and post your purchase requests</p>
        </div>
        <Button variant="hero" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Post Request
        </Button>
      </div>

      {showForm && <RequestForm onDone={() => { setShowForm(false); refresh(); }} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Package className="h-5 w-5 text-primary" />} value={listings.length.toString()} label="Available Listings" />
        <StatCard icon={<HandCoins className="h-5 w-5 text-primary" />} value={myReqs.length.toString()} label="My Requests" />
        <StatCard icon={<MapPin className="h-5 w-5 text-primary" />} value={profile?.business_name || profile?.location || "—"} label="Your Business" />
      </div>

      {matches.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4">⭐ Recommended Matches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {matches.map((l) => <ListingCard key={l.id} l={l} farmer={farmers[l.farmer_id]} highlight />)}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">All Crop Listings</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className={`${inputCls} pl-10`} placeholder="Search crop or location" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="No crops found" subtitle="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map((l) => <ListingCard key={l.id} l={l} farmer={farmers[l.farmer_id]} />)}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4 mt-10">My Posted Requests</h2>
      {myReqs.length === 0 ? (
        <EmptyState icon={<HandCoins className="h-8 w-8" />} title="No requests yet" subtitle="Post a request and let farmers reach out to you." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myReqs.map((r) => <RequestCard key={r.id} r={r} mine />)}
        </div>
      )}
    </>
  );
}

function RequestForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ crop_name: "", quantity_needed: "", offer_price: "", location: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!f.crop_name || !f.quantity_needed || !f.offer_price) {
      toast.error("Crop, quantity and offer price are required");
      return;
    }
    setBusy(true);
    try {
      let urls: string[] = [];
      if (files.length) urls = await uploadImages("request-images", user!.id, files);
      const { error } = await supabase.from("buyer_requests").insert({
        buyer_id: user!.id,
        crop_name: f.crop_name,
        quantity_needed: f.quantity_needed,
        offer_price: f.offer_price,
        location: f.location,
        notes: f.notes,
        image_urls: urls,
      });
      if (error) throw error;
      toast.success("Request posted!");
      onDone();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>Post Purchase Request</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Crop Needed *"><input className={inputCls} value={f.crop_name} onChange={(e) => setF({ ...f, crop_name: e.target.value })} /></Field>
          <Field label="Quantity *"><input className={inputCls} placeholder="1 ton" value={f.quantity_needed} onChange={(e) => setF({ ...f, quantity_needed: e.target.value })} /></Field>
          <Field label="Offer Price *"><input className={inputCls} placeholder="₹22/kg" value={f.offer_price} onChange={(e) => setF({ ...f, offer_price: e.target.value })} /></Field>
          <Field label="Delivery Location"><input className={inputCls} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
          <Field label="Notes"><input className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        </div>
        <ImagePicker files={files} setFiles={setFiles} />
        <div className="flex gap-3">
          <Button variant="hero" onClick={submit} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Post Request</Button>
          <Button variant="outline" onClick={onDone}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- shared cards ---------------- */
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
          <div>
            <p className="text-2xl font-bold truncate max-w-[160px]">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">{icon}</div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function ListingCard({ l, farmer, highlight }: { l: Listing; farmer?: ProfileLite; highlight?: boolean }) {
  return (
    <Card className={`hover:shadow-md transition-shadow overflow-hidden ${highlight ? "ring-2 ring-primary/40" : ""}`}>
      {l.image_urls?.[0] ? (
        <img src={l.image_urls[0]} alt={l.crop_name} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-5xl">🌾</div>
      )}
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">{l.crop_name}</h3>
          <span className="font-bold text-primary text-sm">{l.price}</span>
        </div>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>📦 {l.quantity}</p>
          {l.available_date && <p>📅 {new Date(l.available_date).toLocaleDateString()}</p>}
          {l.location && <p>📍 {l.location}</p>}
          {farmer && <p className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" /> {farmer.full_name}</p>}
        </div>
        {farmer && <div className="mt-3"><ContactButtons phone={farmer.phone} /></div>}
      </CardContent>
    </Card>
  );
}

function RequestCard({ r, buyer, mine }: { r: RequestRow; buyer?: ProfileLite; mine?: boolean }) {
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {r.image_urls?.[0] ? (
        <img src={r.image_urls[0]} alt={r.crop_name} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center text-5xl">🛒</div>
      )}
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">{r.crop_name}</h3>
          <span className="font-bold text-primary text-sm">{r.offer_price}</span>
        </div>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>📦 Needs {r.quantity_needed}</p>
          {r.location && <p>📍 {r.location}</p>}
          {r.notes && <p className="line-clamp-2">📝 {r.notes}</p>}
          {buyer && <p className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" /> {buyer.business_name || buyer.full_name}</p>}
        </div>
        {mine ? (
          <p className="mt-3 text-xs text-muted-foreground">Posted {new Date(r.created_at).toLocaleDateString()}</p>
        ) : (
          buyer && <div className="mt-3"><ContactButtons phone={buyer.phone} /></div>
        )}
      </CardContent>
    </Card>
  );
}