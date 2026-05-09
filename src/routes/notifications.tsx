import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Farmora" }] }),
  component: NotificationsPage,
});

type Notif = { id: string; type: string; title: string; body: string; link: string; read_at: string | null; created_at: string };

function NotificationsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      setItems((data as Notif[]) || []);
      setBusy(false);
    };
    load();
    const ch = supabase
      .channel(`notif-page-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loading, navigate]);

  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    toast.success("Marked all as read");
  };
  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((x) => x.filter((n) => n.id !== id));
  };
  const open = async (n: Notif) => {
    if (!n.read_at) await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
    if (n.link) navigate({ to: n.link });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
          {items.some((n) => !n.read_at) && (
            <Button variant="outline" size="sm" onClick={markAll}><CheckCheck className="h-4 w-4 mr-1" /> Mark all read</Button>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Notifications</h1>

        {busy ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} className={`flex gap-3 p-4 rounded-xl border transition ${n.read_at ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => open(n)}>
                  <p className="font-medium text-sm truncate">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground truncate">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}