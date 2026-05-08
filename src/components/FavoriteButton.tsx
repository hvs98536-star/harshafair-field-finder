import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function FavoriteButton({ itemType, itemId, className = "" }: { itemType: "listing" | "request"; itemId: string; className?: string }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("id").eq("user_id", user.id).eq("item_type", itemType).eq("item_id", itemId).maybeSingle()
      .then(({ data }) => setFav(!!data));
  }, [user, itemType, itemId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save favorites"); return; }
    setBusy(true);
    try {
      if (fav) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("item_type", itemType).eq("item_id", itemId);
        setFav(false);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, item_type: itemType, item_id: itemId });
        setFav(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "Remove favorite" : "Save favorite"}
      className={`inline-flex items-center justify-center h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors ${className}`}
    >
      <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    </button>
  );
}