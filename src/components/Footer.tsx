import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Farmora</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Farmora. Fair prices. Direct markets. Better farming.
          </p>
        </div>
      </div>
    </footer>
  );
}