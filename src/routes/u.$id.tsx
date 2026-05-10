import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Phone, Mail, ShieldCheck, Sprout, ShoppingCart, Truck, Handshake, Package, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/u/$id")({
  head: () => ({ meta: [{ title: "Profile — Farmora" }] }),
  component: PublicProfile,
});

const ROLE_META: Record<string, { label: string; Icon: any; color: string }> = {
  farmer: { label: "Farmer", Icon: Sprout, color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  buyer: { label: "Buyer", Icon: ShoppingCart, color: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  agent: { label: "Agent", Icon: Handshake, color: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  transporter: { label: "Transporter", Icon: Truck, color: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
  admin: { label: "Admin", Icon: ShieldCheck, color: "bg-muted text-foreground" },
};

function PublicProfile() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: p }, { data: l }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("crop_listings").select("*").eq("farmer_id", id).order("created_at", { ascending: false }),
        supabase.from("buyer_requests").select("*").eq("buyer_id", id).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setProfile(p);
      setListings(l ?? []);
      setRequests(r ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto p-8"><div className="h-40 rounded-2xl bg-muted animate-pulse" /></div>;
  }
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <Link to="/" className="text-primary mt-4 inline-block">← Back to directory</Link>
      </div>
    );
  }

  const meta = ROLE_META[profile.role] ?? ROLE_META.farmer;
  const Icon = meta.Icon;
  const place = [profile.location, profile.district, profile.state].filter(Boolean).join(", ");
  const initials = (profile.full_name || "U").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const isOwn = user?.id === profile.id;
  const showItems = profile.role === "buyer" ? requests : listings;
  const itemKind = profile.role === "buyer" ? "request" : "listing";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to directory
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {profile.profile_image_url ? (
              <img src={profile.profile_image_url} alt={profile.full_name} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/15 text-primary text-2xl flex items-center justify-center font-bold">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.full_name || "Unnamed"}</h1>
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                  <Icon className="h-3.5 w-3.5" /> {meta.label}
                </span>
                {profile.business_name && <span className="text-sm text-muted-foreground">· {profile.business_name}</span>}
              </div>
              {place && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {place}
                </p>
              )}
              {profile.farming_type && (
                <p className="mt-1 text-sm text-muted-foreground">🌱 {profile.farming_type}</p>
              )}
              {profile.bio && <p className="mt-3 text-sm text-foreground">{profile.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted">
                    <Phone className="h-4 w-4" /> {profile.phone}
                  </a>
                )}
                {user && !isOwn && (
                  <Link to="/messages" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                    <Mail className="h-4 w-4" /> Message
                  </Link>
                )}
                {!user && (
                  <Link to="/auth" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                    Sign in to contact
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {profile.role === "buyer" ? "Buyer requests" : "Crop listings"}
            <span className="text-sm font-normal text-muted-foreground">({showItems.length})</span>
          </h2>

          {showItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No listings available currently</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {showItems.map((item: any) => (
                <Link
                  key={item.id}
                  to={itemKind === "listing" ? "/listings/$id" : "/requests/$id"}
                  params={{ id: item.id }}
                  className="block bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
                >
                  {item.image_urls?.[0] ? (
                    <img src={item.image_urls[0]} alt={item.crop_name} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 w-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Sprout className="h-8 w-8" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">{item.crop_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {itemKind === "listing" ? item.quantity : item.quantity_needed} · ₹{itemKind === "listing" ? item.price : item.offer_price}
                    </p>
                    {item.location && (
                      <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.location}
                      </p>
                    )}
                    {item.available_date && (
                      <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(item.available_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}