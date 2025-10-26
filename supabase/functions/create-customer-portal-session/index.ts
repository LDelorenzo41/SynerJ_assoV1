// supabase/functions/create-customer-portal-session/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Gestion CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialisation Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialisation Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Vérification de l'authentification
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Non authentifié')
    }

    // Récupération du profil utilisateur
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('association_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profil utilisateur introuvable')
    }

    // Vérification que l'utilisateur est Super Admin
    if (profile.role !== 'Super Admin') {
      throw new Error('Accès réservé aux Super Admins')
    }

    if (!profile.association_id) {
      throw new Error('Aucune association associée à ce profil')
    }

    // Récupération des informations de l'association
    const { data: association, error: assocError } = await supabaseClient
      .from('associations')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', profile.association_id)
      .single()

    if (assocError || !association) {
      throw new Error('Association introuvable')
    }

    if (!association.stripe_customer_id) {
      throw new Error('Aucun customer ID Stripe trouvé pour cette association')
    }

    // URL de retour après gestion du portail
    const returnUrl = `${Deno.env.get('VITE_APP_URL')}/dashboard`

    // Création de la session Customer Portal
    const session = await stripe.billingPortal.sessions.create({
      customer: association.stripe_customer_id,
      return_url: returnUrl,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la session Customer Portal:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})