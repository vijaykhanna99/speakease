import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import SpeechAudiologySection from '@/components/home/SpeechAudiologySection';
import SpecializationsSection from '@/components/home/SpecializationsSection';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedTherapists from '@/components/home/FeaturedTherapists';
import ConditionsSection from '@/components/home/ConditionsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import TrustSection from '@/components/home/TrustSection';
import DownloadBanner from '@/components/home/DownloadBanner';

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Header />
      <HeroSection />
      <StatsBar />
      <SpeechAudiologySection />
      <SpecializationsSection />
      <HowItWorks />
      <FeaturedTherapists />
      <ConditionsSection />
      <TestimonialsSection />
      <TrustSection />
      <DownloadBanner />
      <Footer />
    </main>
  );
}
