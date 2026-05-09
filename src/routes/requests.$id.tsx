import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Package, Loader2, User as UserIcon, Phone, MessageCircle, ShoppingCart, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ProfileCompleteness } from "@/components/ProfileCompleteness";
import { FavoriteButton } from "@/components/FavoriteButton";
import { pushRecent } from "@/lib/recentlyViewed";
import { useAuth } from "@/hooks/useAuth";
import { getOrCreateConversation } from "@/lib/messages";
import { toast } from "sonner";

export const Route = createFileRoute("/requests/$id")({
  head: () => ({ meta: [{ title: "Buyer Request — Farmora" }] }),
  component: RequestDetail,
});

function RequestDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [req, setReq] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate({ to: "/auth" }); return; }
    pushRecent("request", id);
    (async () => {
      const { data: r } = await supabase.from("buyer_requests").select("*").eq("id", id).maybeSingle();
      setReq(r);
      if (r) {
        const [{ data: p }, { data: rel }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", r.buyer_id).maybeSingle(),
          supabase.from("crop_listings").select("*").eq("status", "active").ilike("crop_name", `%${r.crop_name}%`).limit(6),
        ]);
        setBuyer(p);
        setRelated((rel as any[]) || []);
      }
      setLoading(false);
    })();
  }, [id, user, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!req) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Request not found.</div>;

  const images: string[] = req.image_urls?.length ? req.image_urls : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="grid lg:grid-cols-5 gap-8 mt-4">
          <div className="lg:col-span-3 space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
              {images[active] ? <img src={images[active]} className="h-full w-full object-cover" /> : <span className="text-7xl">🛒</span>}
              <FavoriteButton itemType="request" itemId={req.id} className="absolute top-3 right-3" />
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
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Looking for</p>
              <h1 className="text-3xl font-bold">{req.crop_name}</h1>
              <p className="text-2xl font-bold text-primary mt-2">Offer: {req.offer_price}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /> Needs {req.quantity_needed}</p>
              {req.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {req.location}</p>}
            </div>
            {req.notes && <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3 italic">{req.notes}</p>}

            {buyer && (
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {buyer.profile_image_url ? <img src={buyer.profile_image_url} className="h-full w-full rounded-full object-cover" /> : <UserIcon className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{buyer.business_name || buyer.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{buyer.district || buyer.location || "Buyer"}</p>
                    </div>
                    {buyer.is_verified && <VerifiedBadge role="buyer" />}
                  </div>
                  {buyer.bio && <p className="text-xs text-muted-foreground">{buyer.bio}</p>}
                  <ProfileCompleteness profile={buyer} />
                  {buyer.phone && (
                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button asChild variant="outline" size="sm" className="flex-1"><a href={`tel:${buyer.phone}`}><Phone className="h-3.5 w-3.5 mr-1" /> Call</a></Button>
                      <Button asChild variant="hero" size="sm" className="flex-1"><a href={`https://wa.me/${buyer.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp</a></Button>
                    </div>
                  )}
                  {user && user.id !== buyer.id && (
                    <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                      try {
                        const cid = await getOrCreateConversation(user.id, buyer.id);
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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Matching crop listings</h2>
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