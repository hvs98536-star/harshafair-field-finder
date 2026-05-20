import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/messages/$id")({
  head: () => ({ meta: [{ title: "Chat — Farmora" }] }),
  component: ChatPage,
});

type Msg = { id: string; sender_id: string; body: string; created_at: string };
type Profile = { id: string; full_name: string; phone: string; profile_image_url: string; role: string };

function ChatPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [other, setOther] = useState<Profile | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (!user) return;
    let unsub: any;
    (async () => {
      const { data: c, error } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
      if (error || !c) { toast.error("Conversation not found"); navigate({ to: "/messages" }); return; }
      const otherId = c.user_a === user.id ? c.user_b : c.user_a;
      const { data: p } = await supabase.from("profiles").select("id,full_name,phone,profile_image_url,role").eq("id", otherId).maybeSingle();
      setOther(p as Profile);
      const { data: m } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true }).limit(500);
      setMsgs((m as Msg[]) || []);
      setBusy(false);
      // Mark notifications referencing this convo as read
      await supabase.from("notifications").update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id).is("read_at", null).eq("link", `/messages/${id}`);

      const ch = supabase
        .channel(`chat-${id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
          (payload) => { setMsgs((prev) => [...prev, payload.new as Msg]); })
        .subscribe();
      unsub = ch;
    })();
    return () => { if (unsub) supabase.removeChannel(unsub); };
  }, [id, user, loading, navigate]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true);
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ conversation_id: id, sender_id: user.id, body });
    if (error) { toast.error(error.message); setText(body); }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 h-16">
          <Button variant="ghost" size="sm" aria-label="Back to conversations" onClick={() => navigate({ to: "/messages" })}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
            {other?.profile_image_url ? <img src={other.profile_image_url} alt={`${other?.full_name || "Contact"} profile picture`} className="h-full w-full object-cover" /> : (other?.full_name?.[0] || "?").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate text-base">Chat with {other?.full_name || "…"}</h1>
            <p className="text-xs text-muted-foreground capitalize">{other?.role}</p>
          </div>
          {other?.phone && (
            <Button asChild variant="outline" size="sm"><a href={`tel:${other.phone}`} aria-label={`Call ${other.full_name || "contact"}`}><Phone className="h-4 w-4" /></a></Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {busy ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : msgs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Say hi 👋</p>
          ) : msgs.map((m) => {
            const mine = m.sender_id === user!.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                  {m.body}
                  <div className={`text-[10px] mt-1 opacity-70 ${mine ? "text-primary-foreground" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={send} className="border-t border-border bg-card p-3 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <label htmlFor="chat-message-input" className="sr-only">Message</label>
          <input
            id="chat-message-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            aria-label="Type a message"
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" variant="hero" size="sm" aria-label="Send message" disabled={sending || !text.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}