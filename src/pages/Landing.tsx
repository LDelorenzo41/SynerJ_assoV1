import React, { useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import RegistrationForms from '../components/RegistrationForms';
import Footer from '../components/Footer';

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection onShowDemo={() => setShowDemo(true)} />
      <FeaturesSection />
      <HowItWorksSection />
      <RegistrationForms />
      <Footer showDemo={showDemo} setShowDemo={setShowDemo} />
    </div>
  );
}