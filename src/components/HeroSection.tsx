import React from 'react';
import { ArrowRight, Play, Shield } from 'lucide-react';

interface HeroSectionProps {
  onShowDemo: () => void;
}

export default function HeroSection({ onShowDemo }: HeroSectionProps) {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Connectez vos
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}associations{" "}
            </span>
            et clubs
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            La plateforme tout-en-un pour gérer associations, clubs et membres. 
            Organisez des événements, connectez vos communautés et développez votre impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              Créer votre association aujourd'hui !
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={onShowDemo}
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Voir la démo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-500">100% sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}