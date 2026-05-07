import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout, Plus, Package, HandCoins, MapPin, LogOut, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockListings = [
  { id: 1, crop: "Tomatoes", qty: "500 kg", price: "₹25/kg", date: "Jun 15, 2026", location: "Nashik, MH", farmer: "Ramesh P." },
  { id: 2, crop: "Wheat", qty: "2 ton", price: "₹2,200/quintal", date: "Jul 1, 2026", location: "Indore, MP", farmer: "Suresh K." },
  { id: 3, crop: "Onions", qty: "800 kg", price: "₹18/kg", date: "Jun 20, 2026", location: "Pune, MH", farmer: "Priya S." },
  { id: 4, crop: "Rice", qty: "5 ton", price: "₹3,500/quintal", date: "Aug 10, 2026", location: "Thanjavur, TN", farmer: "Karthik R." },
  { id: 5, crop: "Potatoes", qty: "1 ton", price: "₹15/kg", date: "Jun 25, 2026", location: "Agra, UP", farmer: "Aman G." },
];

const mockOffers = [
  { id: 1, crop: "Tomatoes", buyer: "FreshMart", price: "₹22/kg", qty: "200 kg", status: "pending" },
  { id: 2, crop: "Wheat", buyer: "GrainCo", price: "₹2,100/quintal", qty: "1 ton", status: "accepted" },
  { id: 3, crop: "Onions", buyer: "VegWorld", price: "₹20/kg", qty: "500 kg", status: "pending" },
];

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search.role as string) || "farmer",
  }),
  head: () => ({
    meta: [{ title: "Dashboard — Farmora" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { role } = Route.useSearch();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">Farmora</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{role}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = role === "farmer" ? "buyer" : "farmer";
                window.location.href = `/dashboard?role=${next}`;
              }}
              className="text-muted-foreground"
            >
              Switch to {role === "farmer" ? "Buyer" : "Farmer"}
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === "farmer" ? (
          <FarmerDashboard showForm={showForm} setShowForm={setShowForm} />
        ) : (
          <BuyerDashboard />
        )}
      </div>
    </div>
  );
}

function FarmerDashboard({ showForm, setShowForm }: { showForm: boolean; setShowForm: (v: boolean) => void }) {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Manage your crop listings and offers</p>
        </div>
        <Button variant="hero" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Listing
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Crop Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Crop Name</label>
                <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Tomatoes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 500 kg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Expected Price</label>
                <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. ₹25/kg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Availability Date</label>
                <input type="date" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Village / City, State" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
                <input className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Organic, freshly harvested..." />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="hero" onClick={() => setShowForm(false)}>Create Listing</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <HandCoins className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Offers Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-farm-green-light flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Nashik</p>
                <p className="text-sm text-muted-foreground">Your Location</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Offers</h2>
      <div className="space-y-3 mb-8">
        {mockOffers.map((o) => (
          <Card key={o.id}>
            <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{o.crop} — {o.buyer}</p>
                <p className="text-sm text-muted-foreground">{o.price} for {o.qty}</p>
              </div>
              <div className="flex items-center gap-2">
                {o.status === "pending" ? (
                  <>
                    <Button size="sm" variant="hero">Accept</Button>
                    <Button size="sm" variant="outline">Reject</Button>
                  </>
                ) : (
                  <span className="text-sm font-medium text-primary capitalize">{o.status}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Listings */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Your Listings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockListings.slice(0, 3).map((l) => (
          <Card key={l.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground text-lg">{l.crop}</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>📦 {l.qty} · {l.price}</p>
                <p>📅 {l.date}</p>
                <p>📍 {l.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function BuyerDashboard() {
  const [search, setSearch] = useState("");
  const filtered = mockListings.filter((l) =>
    l.crop.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Browse Crops</h1>
        <p className="text-muted-foreground">Find fresh produce directly from farmers</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search crops, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="default">
          <Filter className="h-4 w-4 mr-1" /> Filter
        </Button>
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((l) => (
          <Card key={l.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-foreground text-lg">{l.crop}</h3>
                <span className="text-sm font-bold text-primary">{l.price}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>📦 {l.qty}</p>
                <p>📅 Available: {l.date}</p>
                <p>📍 {l.location}</p>
                <p>👨‍🌾 {l.farmer}</p>
              </div>
              <Button variant="hero" size="sm" className="mt-4 w-full">
                Send Offer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No crops found matching your search.
        </div>
      )}
    </>
  );
}