import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CTASection } from "@/components/CTASection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Farmora — Fair Prices. Direct Markets. Better Farming." },
      { name: "description", content: "Direct farmer-to-buyer marketplace. Sell crops at fair prices with no middlemen." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}
