import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import TrustSection from '@/components/landing/TrustSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ProcessSection from '@/components/landing/ProcessSection';
import ReportPreviewSection from '@/components/landing/ReportPreviewSection';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTASection from '@/components/landing/FinalCTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 antialiased">
      <LandingHeader />
      <main>
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <ProcessSection />
        <ReportPreviewSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <footer className="border-t border-slate-200/90 bg-white px-4 py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:px-6">
        <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
          名貫補習班 · 升國一數學線上弱點檢測
        </p>
      </footer>
    </div>
  );
}
