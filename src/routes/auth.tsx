import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sprout, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Farmora" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [role, setRole] = useState<"farmer" | "buyer" | "transporter" | "agent">("farmer");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    location: "",
    district: "",
    state: "",
    business_name: "",
    farming_type: "",
  });

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const email = form.email.trim() || `${form.phone.replace(/\D/g, "")}@farmora.app`;
        const { error } = await supabase.auth.signUp({
          email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: form.full_name,
              role,
              phone: form.phone,
              location: form.location,
              district: form.district,
              state: form.state,
              business_name: form.business_name,
              farming_type: form.farming_type,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created!");
        navigate({ to: "/dashboard" });
      } else {
        const email = form.email.trim() || `${form.phone.replace(/\D/g, "")}@farmora.app`;
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: form.password,
        });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const input = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Farmora</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === "signup" ? "Join the farmer-buyer marketplace" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={submit} className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { r: "farmer", l: "🌾 Farmer" },
                    { r: "buyer", l: "🛒 Buyer" },
                    { r: "transporter", l: "🚚 Transporter" },
                    { r: "agent", l: "🤝 Agent" },
                  ] as const).map(({ r, l }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${role === r ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-input hover:border-primary/50"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input className={input} value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
              </div>
              {role === "buyer" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Business / Shop Name</label>
                  <input className={input} value={form.business_name} onChange={(e) => update("business_name", e.target.value)} placeholder="e.g. FreshMart" />
                </div>
              )}
              {role === "farmer" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Farming Type</label>
                  <input className={input} value={form.farming_type} onChange={(e) => update("farming_type", e.target.value)} placeholder="e.g. Organic vegetables" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">District</label>
                  <input className={input} value={form.district} onChange={(e) => update("district", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input className={input} value={form.state} onChange={(e) => update("state", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Village / Location</label>
                <input className={input} value={form.location} onChange={(e) => update("location", e.target.value)} />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input className={input} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxxxxxxx" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (optional)</label>
            <input type="email" className={input} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className={input} value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
          </div>

          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "Create Account" : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary font-medium hover:underline">
              {mode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}