import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Calendar, Package, Sprout, Leaf, Loader2, User as UserIcon, Phone, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ProfileCompleteness } from "@/components/ProfileCompleteness";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MatchScore } from "@/components/MatchScore";
import { calcMatchScore } from "@/lib/matching";
import { pushRecent } from "@/lib/recentlyViewed";
import { useAuth } from "@/hooks/useAuth";
import { getOrCreateConversation } from "@/lib/messages";
import { toast } from "sonner";

export const Route = createFileRoute("/listings/$id")({
  head: () => ({ meta: [{ title: "Crop Listing — Farmora" }] }),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [farmer, setFarmer] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate({ to: "/auth" }); return; }
    pushRecent("listing", id);
    (async () => {
      const { data: l } = await supabase.from("crop_listings").select("*").eq("id", id).maybeSingle();
      setListing(l);
      if (l) {
        const [{ data: p }, { data: r }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", l.farmer_id).maybeSingle(),
          supabase.from("crop_listings").select("*").eq("status", "active").neq("id", id).ilike("crop_name", `%${l.crop_name}%`).limit(6),
        ]);
        setFarmer(p);
        setRelated((r as any[]) || []);
      }
      setLoading(false);
    })();
  }, [id, user, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Listing not found.</div>;

  const images: string[] = listing.image_urls?.length ? listing.image_urls : [];
  const myReqs: any[] = []; // could fetch buyer requests for score
  const score = profile?.role === "buyer" ? calcMatchScore({
    cropA: listing.crop_name, cropB: listing.crop_name,
    locA: listing.location, locB: profile?.location,
    qtyA: listing.quantity_numeric, qtyB: null,
    priceA: listing.price_numeric, priceB: null,
  }) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid lg:grid-cols-5 gap-8 mt-4">
          <div className="lg:col-span-3 space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
              {images[active] ? <img src={images[active]} alt={listing.crop_name} className="h-full w-full object-cover" /> : <span className="text-7xl">🌾</span>}
              <FavoriteButton itemType="listing" itemId={listing.id} className="absolute top-3 right-3" />
              {listing.is_organic && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-green-600 text-white text-xs font-medium px-2 py-1">
                  <Leaf className="h-3 w-3" /> Organic
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((u, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                    <img src={u} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {score > 0 && <MatchScore score={score} />}
              </div>
              <h1 className="text-3xl font-bold">{listing.crop_name}</h1>
              <p className="text-2xl font-bold text-primary mt-2">{listing.price}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /> {listing.quantity}</p>
              {listing.available_date && <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Available {new Date(listing.available_date).toLocaleDateString()}</p>}
              {listing.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {listing.location}</p>}
            </div>
            {listing.notes && <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3 italic">{listing.notes}</p>}

            {farmer && (
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {farmer.profile_image_url ? <img src={farmer.profile_image_url} className="h-full w-full rounded-full object-cover" /> : <UserIcon className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{farmer.full_name || "Farmer"}</p>
                      <p className="text-xs text-muted-foreground truncate">{farmer.farming_type || "Farmer"} {farmer.district && `• ${farmer.district}`}</p>
                    </div>
                    {farmer.is_verified && <VerifiedBadge role="farmer" />}
                  </div>
                  {farmer.bio && <p className="text-xs text-muted-foreground">{farmer.bio}</p>}
                  <ProfileCompleteness profile={farmer} />
                  {farmer.phone && (
                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button asChild variant="outline" size="sm" className="flex-1"><a href={`tel:${farmer.phone}`}><Phone className="h-3.5 w-3.5 mr-1" /> Call</a></Button>
                      <Button asChild variant="hero" size="sm" className="flex-1"><a href={`https://wa.me/${farmer.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp</a></Button>
                    </div>
                  )}
                  {user && user.id !== farmer.id && (
                    <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                      try {
                        const cid = await getOrCreateConversation(user.id, farmer.id);
                        navigate({ to: "/messages/$id", params: { id: cid } });
                      } catch (e: any) { toast.error(e.message); }
                    }}>
                      <Send className="h-3.5 w-3.5 mr-1" /> Message in app
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Sprout className="h-5 w-5 text-primary" /> Related listings</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {related.map((r) => (
                <Link key={r.id} to="/listings/$id" params={{ id: r.id }} className="block rounded-xl overflow-hidden border border-border hover:shadow-md transition">
                  {r.image_urls?.[0] ? <img src={r.image_urls[0]} className="h-24 w-full object-cover" /> : <div className="h-24 bg-muted flex items-center justify-center text-3xl">🌾</div>}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{r.crop_name}</p>
                    <p className="text-xs text-primary font-semibold truncate">{r.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}