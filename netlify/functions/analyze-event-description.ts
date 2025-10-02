// netlify/functions/analyze-event-description.ts
import { Handler } from '@netlify/functions'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: jsonHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { eventName, description } = JSON.parse(event.body || '{}')

    if (!eventName) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Le nom de l\'événement est requis.' }),
      }
    }

    const prompt = `Titre de l'événement : ${eventName}
Description de l'événement : ${description || 'Aucune description fournie'}

En te basant sur le titre et la description ci-dessus, identifie l'activité principale et décris-la en une seule phrase simple et visuelle, comme si tu décrivais une scène pour un illustrateur.

La phrase doit être :
- Concise (maximum 20 mots)
- Centrée sur l'action ou le sujet principal
- Visuelle et concrète (pas abstraite)
- En français
- Sans mention du titre original

Exemples :
- Pour "Tournoi de tennis" → "Des joueurs en pleine action sur un court de tennis avec des raquettes et une balle"
- Pour "Atelier poterie" → "Une personne façonnant de l'argile sur un tour de potier avec ses mains"
- Pour "Marathon solidaire" → "Des coureurs en mouvement sur une route avec des dossards colorés"

Réponds UNIQUEMENT avec la phrase descriptive, sans introduction ni commentaire.`

    const response = await openai.responses.create({
      model: 'gpt-5-nano',
      input: prompt,
      reasoning: { effort: 'minimal' as const },
      text: { verbosity: 'low' as const },
    })

    const activityDescription = (
      (response as any).output_text ??
      (response as any)?.output?.[0]?.content?.[0]?.text ??
      ''
    )
      .toString()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200) // Max 200 caractères pour rester concis

    if (!activityDescription) {
      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "Le modèle n'a renvoyé aucune description." }),
      }
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        activityDescription,
        model: 'gpt-5-nano',
      }),
    }
  } catch (error: any) {
    console.error('analyze-event-description error:', error?.message || error)
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'Erreur serveur lors de l\'analyse.',
        details: error?.message || String(error),
      }),
    }
  }
}