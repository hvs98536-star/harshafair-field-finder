import { supabase } from "@/integrations/supabase/client";

/** Get an existing 1:1 conversation between two users, or create one. Returns id. */
export async function getOrCreateConversation(meId: string, otherId: string): Promise<string> {
  if (meId === otherId) throw new Error("Cannot chat with yourself");
  const [a, b] = [meId, otherId].sort();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_a: a, user_b: b })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}