import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import EngineSection from "@/components/landing/EngineSection";
import MetricsSection from "@/components/landing/MetricsSection";
import WhoSection from "@/components/landing/WhoSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import CTASection from "@/components/landing/CTASection";
import LandingContactSection from "@/components/landing/LandingContactSection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProblemSection />
      <EngineSection />
      <MetricsSection />
      <WhoSection />
      <ComparisonSection />
      <CTASection />
      <LandingContactSection />
    </>
  );
}
