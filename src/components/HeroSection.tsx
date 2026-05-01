import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-farm.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Lush green farmland with fresh produce"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            🌾 Direct Farm-to-Buyer Marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Sell Your Crops at the Price{" "}
            <span className="text-primary">You Deserve</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Direct connection with buyers. No middlemen. Transparent pricing for every harvest.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="hero" size="xl">
              <Link to="/login">Start Selling</Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <Link to="/login">Find Crops</Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">2,500+</span>
              <span>Active Farmers</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">10,000+</span>
              <span>Crop Listings</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">₹50Cr+</span>
              <span>Trade Volume</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}