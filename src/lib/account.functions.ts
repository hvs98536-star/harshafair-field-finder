import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    // Clean up user-owned rows (RLS-bypassing admin client)
    await supabaseAdmin.from("crop_listings").delete().eq("farmer_id", userId);
    await supabaseAdmin.from("buyer_requests").delete().eq("buyer_id", userId);
    await supabaseAdmin.from("favorites").delete().eq("user_id", userId);
    await supabaseAdmin.from("offers").delete().eq("buyer_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });