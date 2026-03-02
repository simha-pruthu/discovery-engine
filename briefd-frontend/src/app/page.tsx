import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import ProblemSection from "@/components/landing/ProblemSection";
import EngineSection from "@/components/landing/EngineSection";
import MetricsSection from "@/components/landing/MetricsSection";
import WhoSection from "@/components/landing/WhoSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import LandingContactSection from "@/components/landing/LandingContactSection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <ProblemSection />
        <EngineSection />
        <MetricsSection />
        <WhoSection />
        <ComparisonSection />
        <LandingContactSection />
      </main>
      <Footer />
    </>
  );
}
