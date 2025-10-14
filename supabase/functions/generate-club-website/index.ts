// supabase/functions/generate-club-website/index.ts
// ✅ VERSION SIMPLIFIÉE SANS IA : Génère le HTML directement

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateWebsiteHTML({
  clubName,
  description,
  clubEmail,
  themeColor,
  heroImageUrl,
  illustrationImageUrl,
  schedules,
  locations,
  pricings
}: {
  clubName: string
  description: string
  clubEmail: string
  themeColor: string
  heroImageUrl: string
  illustrationImageUrl?: string
  schedules: string[]
  locations: string[]
  pricings: string[]
}): string {
  
  // Générer les sections conditionnelles
  const schedulesSection = schedules.length > 0 ? `
  <!-- HORAIRES -->
  <section class="animate-on-scroll py-24 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-5xl font-extrabold text-gray-900 mb-16 text-center">
        Nos <span class="gradient-text">horaires</span>
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${schedules.map(schedule => `
        <div class="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style="background: ${themeColor}20;">
              <svg class="w-6 h-6" style="color: ${themeColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-lg font-semibold text-gray-800 leading-relaxed">${schedule}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : '';

  const locationsSection = locations.length > 0 ? `
  <!-- LIEUX -->
  <section class="animate-on-scroll py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-5xl font-extrabold text-gray-900 mb-16 text-center">
        Où nous <span class="gradient-text">trouver</span>
      </h2>
      <div class="grid md:grid-cols-2 gap-8">
        ${locations.map(location => `
        <div class="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style="background: ${themeColor}20;">
              <svg class="w-6 h-6" style="color: ${themeColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <p class="text-lg font-medium text-gray-800">${location}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : '';

  const pricingsSection = pricings.length > 0 ? `
  <!-- TARIFS -->
  <section class="animate-on-scroll py-24 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-5xl font-extrabold text-gray-900 mb-16 text-center">
        Nos <span class="gradient-text">tarifs</span>
      </h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${pricings.map((pricing, index) => `
        <div class="relative bg-gradient-to-br ${index === 0 ? `from-[${themeColor}] to-[${themeColor}dd]` : 'from-gray-50 to-white'} p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${index === 0 ? '' : 'border border-gray-100'}">
          ${index === 0 ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">Populaire</div>' : ''}
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style="background: ${index === 0 ? 'white' : themeColor + '20'};">
              <svg class="w-6 h-6" style="color: ${index === 0 ? themeColor : themeColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-lg font-bold ${index === 0 ? 'text-white' : 'text-gray-800'}">${pricing}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : '';

  const illustrationSection = illustrationImageUrl ? `
    <div class="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
      <img src="${illustrationImageUrl}" alt="Illustration" class="w-full h-auto">
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${clubName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { 
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      overflow-x: hidden;
      width: 100%;
    }
    
    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(40px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    .hero-section {
      animation: fadeInUp 1s ease-out;
    }
    
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    
    .animate-on-scroll.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .gradient-text {
      background: linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body class="antialiased bg-white">

  <!-- 🎯 HERO SECTION -->
  <section class="hero-section relative h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${heroImageUrl}');"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
    
    <div class="relative z-10 text-center px-6 max-w-5xl mx-auto">
      <h1 class="text-6xl md:text-8xl font-extrabold text-white mb-6 drop-shadow-2xl leading-tight">
        ${clubName}
      </h1>
      <p class="text-2xl md:text-3xl text-white/95 mb-10 font-light leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
        ${description}
      </p>
      <a href="#contact" 
         class="inline-block px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-full hover:scale-110 hover:shadow-2xl transition-all duration-300 shadow-xl">
        Nous rejoindre →
      </a>
    </div>
    
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <svg class="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  </section>

  <!-- À PROPOS -->
  <section class="animate-on-scroll py-24 px-6 bg-gradient-to-b from-white to-gray-50">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-5xl md:text-6xl font-extrabold text-gray-900 mb-16 text-center leading-tight">
        À propos de <span class="gradient-text">${clubName}</span>
      </h2>
      
      <div class="grid md:grid-cols-${illustrationImageUrl ? '2' : '1'} gap-16 items-center">
        <div class="space-y-6">
          <p class="text-xl text-gray-700 leading-relaxed">
            ${description}
          </p>
        </div>
        ${illustrationSection}
      </div>
    </div>
  </section>

  ${schedulesSection}
  ${locationsSection}
  ${pricingsSection}

  <!-- CONTACT -->
  <section id="contact" class="animate-on-scroll py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-5xl font-extrabold text-gray-900 mb-16">
        Contactez-<span class="gradient-text">nous</span>
      </h2>
      
      <div class="bg-white p-12 rounded-3xl shadow-2xl">
        <p class="text-xl text-gray-700 mb-8">
          Pour toute information, n'hésitez pas à nous écrire :
        </p>
        
        <a href="mailto:${clubEmail}?subject=Contact depuis le site ${clubName}" 
           class="inline-block px-12 py-5 text-xl font-bold text-white rounded-full hover:scale-110 hover:shadow-2xl transition-all duration-300"
           style="background: linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%);">
          📧 ${clubEmail}
        </a>
        
        <p class="text-gray-600 mt-8 text-sm">
          Cliquez pour ouvrir votre client mail
        </p>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <p class="text-gray-400 text-lg">
        © <span id="year"></span> ${clubName}. Tous droits réservés.
      </p>
    </div>
  </footer>

  <script>
    // Année dynamique
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Animations au scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
      });
    });
    
    // Smooth scroll pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  </script>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      clubId, 
      clubName, 
      description, 
      themeColor, 
      heroImageUrl, 
      illustrationImageUrl,
      schedules = [],
      locations = [],
      pricings = []
    } = await req.json()

    console.log('📝 Generating website for:', clubName)
    console.log('📊 Data:', { schedules, locations, pricings })

    // Récupérer l'email du club
    const { data: clubData, error: clubError } = await supabaseClient
      .from('clubs')
      .select('club_email')
      .eq('id', clubId)
      .single()

    if (clubError) throw clubError

    // Générer le HTML
    const generatedHTML = generateWebsiteHTML({
      clubName,
      description,
      clubEmail: clubData.club_email,
      themeColor,
      heroImageUrl,
      illustrationImageUrl,
      schedules,
      locations,
      pricings
    })

    console.log('✅ HTML generated, length:', generatedHTML.length)

    // Sauvegarder en BDD
    const { error: updateError } = await supabaseClient
      .from('clubs')
      .update({ 
        website_html: generatedHTML,
        website_url: `/club/${clubId}/website`
      })
      .eq('id', clubId)

    if (updateError) throw updateError

    console.log('💾 Saved to database')

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: `/club/${clubId}/website`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})