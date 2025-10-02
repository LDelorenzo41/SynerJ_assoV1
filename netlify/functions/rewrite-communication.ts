// netlify/functions/rewrite-communication.ts
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
    const { title, content } = JSON.parse(event.body || '{}')

    if (!title || !content) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Paramètres manquants: title et content sont requis.' }),
      }
    }

    const prompt = `Tu es un expert en communication institutionnelle pour clubs sportifs et associations.
Réécris cette communication de manière professionnelle et informative.

Titre: "${title}"
Contenu original: "${content}"

Consignes OBLIGATOIRES:
- Style informatif et professionnel adapté à une communication officielle
- Corriger toutes les fautes d'orthographe et de grammaire
- Structurer le texte de manière claire et logique
- Ton neutre et factuel, sans exagération
- Conserver TOUS les faits, dates, horaires et informations importantes
- Améliorer la clarté et la précision du message
- Maximum 800 caractères
- Formules de politesse appropriées si pertinent

Réponds UNIQUEMENT avec le texte réécrit, sans introduction ni commentaire.`

    const response = await openai.responses.create({
      model: 'gpt-5-nano',
      input: prompt,
      reasoning: { effort: 'minimal' as const },
      text: { verbosity: 'medium' as const },
    })

    const raw =
      (response as any).output_text ??
      (response as any)?.output?.[0]?.content?.[0]?.text ??
      ''

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
        error: 'Erreur serveur lors de la réécriture.',
        details: error?.message || String(error),
      }),
    }
  }
}