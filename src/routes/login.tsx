import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Farmora" },
      { name: "description", content: "Sign in or create your Farmora account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<"farmer" | "buyer">("farmer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard", search: { role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Farmora</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSignup ? "Join the farming revolution" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your name" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone or Email</label>
            <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter phone or email" />
          </div>

          {!isSignup && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input type="password" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
            </div>
          )}

          {isSignup && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">I am a</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${role === "farmer" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-input hover:border-primary/50"}`}
                  >
                    🌾 Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${role === "buyer" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-input hover:border-primary/50"}`}
                  >
                    🛒 Buyer
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Village / City, State" />
              </div>
            </>
          )}

          <Button type="submit" variant="hero" size="xl" className="w-full">
            {isSignup ? "Create Account" : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}