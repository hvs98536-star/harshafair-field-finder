import { Link } from "@tanstack/react-router";
import { Sprout, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-heading text-foreground">Farmora</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Button asChild variant="hero" size="default">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/auth" className="text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Login</Link>
            <Button asChild variant="hero" size="default">
              <Link to="/auth" onClick={() => setOpen(false)}>Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}