import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
            Ready to grow your profits?
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            Join thousands of farmers and buyers already trading on Farmora.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold rounded-xl">
              <Link to="/auth">Start Selling</Link>
            </Button>
            <Button asChild size="xl" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold rounded-xl bg-transparent">
              <Link to="/auth">Browse Crops</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}