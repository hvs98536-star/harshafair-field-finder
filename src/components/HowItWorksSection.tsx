import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Sign Up", description: "Create your account as a Farmer or Buyer in seconds." },
  { step: "02", title: "List or Browse", description: "Farmers list crops. Buyers browse and filter by location, price, and type." },
  { step: "03", title: "Connect & Trade", description: "Send offers, negotiate directly, and close deals—no middlemen." },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary">How It Works</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground">
            Three simple steps to better farming
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-primary/20 mb-4">{s.step}</div>
              <h3 className="text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}