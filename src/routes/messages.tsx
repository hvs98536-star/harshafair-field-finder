import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Farmora" }] }),
  component: MessagesPage,
});

type Conv = { id: string; user_a: string; user_b: string; last_message_at: string };
type Profile = { id: string; full_name: string; profile_image_url: string; role: string };

function MessagesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [lastMsgs, setLastMsgs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      const list = (data as Conv[]) || [];
      setConvs(list);
      if (list.length) {
        const otherIds = Array.from(new Set(list.map((c) => (c.user_a === user.id ? c.user_b : c.user_a))));
        const { data: ps } = await supabase.from("profiles").select("id,full_name,profile_image_url,role").in("id", otherIds);
        const map: Record<string, Profile> = {};
        (ps as Profile[] | null)?.forEach((p) => { map[p.id] = p; });
        setProfiles(map);
        const previews: Record<string, string> = {};
        await Promise.all(list.map(async (c) => {
          const { data: m } = await supabase.from("messages").select("body").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
          if (m) previews[c.id] = (m as any).body;
        }));
        setLastMsgs(previews);
      }
      setBusy(false);
    };
    load();
    const ch = supabase
      .channel(`conv-list-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <h1 className="text-2xl font-bold mt-4 mb-4 flex items-center gap-2"><MessageCircle className="h-6 w-6 text-primary" /> Messages</h1>

        {busy ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : convs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Open a listing or request and tap "Message" to start chatting</p>
          </div>
        ) : (
          <div className="space-y-2">
            {convs.map((c) => {
              const otherId = c.user_a === user!.id ? c.user_b : c.user_a;
              const p = profiles[otherId];
              return (
                <Link key={c.id} to="/messages/$id" params={{ id: c.id }} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 overflow-hidden">
                    {p?.profile_image_url ? <img src={p.profile_image_url} alt={`${p?.full_name || "Contact"} profile picture`} className="h-full w-full object-cover" /> : (p?.full_name?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{lastMsgs[c.id] || "No messages yet"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(c.last_message_at).toLocaleDateString()}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}