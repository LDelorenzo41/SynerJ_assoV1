// supabase/functions/generate-club-website/index.ts
// ✅ VERSION OPTIMISÉE : Stocke le HTML directement en BDD

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('club_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'Club Admin' || !profile.club_id) {
      throw new Error('Access denied: Club Admin only')
    }

    const requestBody = await req.json()
    const { clubName, description, heroImageUrl, illustrationImageUrl, colorScheme } = requestBody

    if (!clubName) {
      throw new Error('Club name is required')
    }

    // Récupérer les infos du club pour l'email
    const { data: clubData, error: clubError } = await supabaseClient
      .from('clubs')
      .select('club_email, name')
      .eq('id', profile.club_id)
      .single()

    if (clubError) {
      throw new Error('Failed to fetch club data')
    }

    // Construire le prompt pour GPT
    const prompt = `Tu es un développeur web expert. Génère un site web HTML moderne, responsive et professionnel pour un club sportif/associatif.

INFORMATIONS DU CLUB :
- Nom : ${clubName}
- Description : ${description || 'Club dynamique et accueillant'}
- Email de contact : ${clubData.club_email}
- Image hero : ${heroImageUrl || 'Une image d\'illustration sera ajoutée'}
- Illustration secondaire : ${illustrationImageUrl || 'Une illustration sera ajoutée'}
- Couleur principale : ${colorScheme || '#3B82F6'}

CONTRAINTES TECHNIQUES :
- HTML5 complet et autonome (single file)
- Tailwind CSS via CDN uniquement
- Design moderne, épuré, responsive (mobile-first)
- IMPORTANT : Utilise les URLs d'images fournies EXACTEMENT telles quelles (pas de placeholders)
- Sections : Hero, À propos, Contact avec formulaire fonctionnel, Footer
- Police Google Fonts : Inter
- Animations CSS subtiles au scroll
- Accessibilité WCAG 2.1 AA

STYLE VISUEL :
- Design moderne avec glassmorphism léger
- Gradient subtil sur le hero
- Cards avec ombres douces
- Boutons avec hover effects
- Espacement généreux et aéré

CODE :
Génère UNIQUEMENT le code HTML complet, sans commentaires, sans explications. Le code doit être prêt à être injecté directement dans une page web.`

    console.log('📤 Envoi requête OpenAI...')

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en développement web. Tu génères du code HTML/CSS de haute qualité, moderne et responsive.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('❌ OpenAI error:', errorData)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    let htmlContent = openaiData.choices[0].message.content

    // Nettoyer le HTML (enlever les balises markdown si présentes)
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim()

    console.log('✅ HTML généré, taille:', htmlContent.length, 'caractères')

    // ✅ STOCKER DIRECTEMENT EN BDD au lieu de Storage
    const { error: updateError } = await supabaseClient
      .from('clubs')
      .update({
        website_html: htmlContent,
        website_url: `/club/${profile.club_id}/website`, // URL relative de la route React
        website_generated_at: new Date().toISOString(),
        website_generation_status: 'completed',
        website_hero_image_url: heroImageUrl || null,
        website_illustration_image_url: illustrationImageUrl || null,
      })
      .eq('id', profile.club_id)

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      throw new Error(`Failed to save website: ${updateError.message}`)
    }

    // Enregistrer dans l'historique
    await supabaseClient
      .from('club_website_generations')
      .insert({
        club_id: profile.club_id,
        generated_by: user.id,
        hero_image_url: heroImageUrl,
        illustration_image_url: illustrationImageUrl,
        html_size_bytes: new Blob([htmlContent]).size,
      })

    console.log('✅ Site web sauvegardé en BDD')

    return new Response(
      JSON.stringify({
        success: true,
        websiteUrl: `${Deno.env.get('SUPABASE_URL').replace('https://', 'https://app.')}/club/${profile.club_id}/website`,
        message: 'Site web généré et enregistré avec succès',
        htmlSize: htmlContent.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})