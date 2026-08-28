import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeHub } from './components/home/HomeHub';
import { OptiLogicModule } from './components/optilogic/OptiLogicModule';
import { DigitalShowcaseSection } from './components/showcase/DigitalShowcaseSection';
import { CartDrawer } from './components/showcase/CartDrawer';
import { ProductDetailModal } from './components/showcase/ProductDetailModal';
import { SkillsAssessmentSection } from './components/skills/SkillsAssessmentSection';
import { JobsSection } from './components/jobs/JobsSection';
import { CreditsSection } from './components/credits/CreditsSection';
import { TrainingCoursesSection } from './components/training/TrainingCoursesSection';
import { PsychologicalSupportSection } from './components/psychology/PsychologicalSupportSection';
import { BusinessOptimizerSection } from './components/optimizer/BusinessOptimizerSection';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    isCartOpen,
    setIsCartOpen,
    selectedProduct,
    setSelectedProduct,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inicio' && <HomeHub />}
        {activeTab === 'optilogic' && <OptiLogicModule />}
        {activeTab === 'vitrina' && (
          <DigitalShowcaseSection onOpenProductDetail={(prod) => setSelectedProduct(prod)} />
        )}
        {activeTab === 'habilidades' && <SkillsAssessmentSection />}
        {activeTab === 'empleo' && <JobsSection />}
        {activeTab === 'creditos' && <CreditsSection />}
        {activeTab === 'capacitacion' && <TrainingCoursesSection />}
        {activeTab === 'psicologia' && <PsychologicalSupportSection />}
        {activeTab === 'optimizador' && <BusinessOptimizerSection />}
      </main>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
