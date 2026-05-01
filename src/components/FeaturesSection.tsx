import { motion } from "framer-motion";
import { Wheat, HandCoins, MapPin, Bell } from "lucide-react";

const features = [
  {
    icon: Wheat,
    title: "Bulk Crop Listings",
    description: "List your harvest with quantity, price, and availability. Reach thousands of buyers instantly.",
  },
  {
    icon: HandCoins,
    title: "Direct Offers & Negotiation",
    description: "Buyers send price offers directly. No middlemen taking your margin.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified when buyers match your crop or when prices meet your expectations.",
  },
  {
    icon: MapPin,
    title: "Location Discovery",
    description: "Find crops and farmers nearby. Reduce transport costs and get fresher produce.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary">Why Farmora</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
            Everything farmers and buyers need
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Built for the agricultural ecosystem. Fair, transparent, and efficient.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-background p-6 hover:shadow-lg transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}