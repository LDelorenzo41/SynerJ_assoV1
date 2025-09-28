// netlify/functions/rewrite-communication.ts
import { Handler } from '@netlify/functions'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const jsonHeaders = {
  'Content-Type': 'application/json',
  // CORS basique (ajuste le domaine en prod si besoin)
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const handler: Handler = async (event) => {
  // Pré-vol CORS
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
    const { title, content } = JSON.parse(event.body || '{}')

    if (!title || !content) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Paramètres manquants: title et content sont requis.' }),
      }
    }

    const prompt = `Tu es un correcteur professionnel pour communications officielles.
Corrige uniquement l'orthographe, la grammaire et la fluidité sans changer le contenu.

Consignes:
- Corriger les fautes d'orthographe et de grammaire
- Améliorer la fluidité de lecture
- Formules de politesse appropriées si nécessaire
- NE PAS changer le contenu ou le message
- NE PAS ajouter de créativité


Texte original: "${content}"`

    // API Responses avec GPT-5-nano
    const response = await openai.responses.create({
      model: 'gpt-5-nano',
      input: prompt,
      // Ces options sont facultatives ; tu peux les retirer si tu veux rester minimaliste
      reasoning: { effort: 'minimal' as const },
      text: { verbosity: 'medium' as const },
    })

    // Extraction défensive
    const raw =
      // champ pratique renvoyé par le SDK récent
      (response as any).output_text ??
      // structure de secours si output_text n'est pas présent
      (response as any)?.output?.[0]?.content?.[0]?.text ??
      ''

    // Sécurise, coupe à 1000 caractères, supprime espaces multiples
    const rewrittenDescription = (raw || '')
      .toString()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000)

    if (!rewrittenDescription) {
      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "Le modèle n'a renvoyé aucun texte." }),
      }
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: true,
        rewrittenDescription,
        model: 'gpt-5-nano',
      }),
    }
  } catch (error: any) {
    console.error('rewrite-communication error:', error?.message || error)
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: 'Erreur serveur lors de la correction.',
        details: error?.message || String(error),
      }),
    }
  }
}