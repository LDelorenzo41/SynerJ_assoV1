// netlify/functions/generate-event-image.ts
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleAuth } from 'google-auth-library';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const { GCP_PROJECT_ID, GCP_SERVICE_ACCOUNT_KEY } = process.env;
  if (!GCP_PROJECT_ID || !GCP_SERVICE_ACCOUNT_KEY) {
    console.error('Variables d\'environnement GCP manquantes.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Configuration serveur incomplète.' }),
    };
  }

  try {
    // Authentification (ne change pas)
    const auth = new GoogleAuth({
      credentials: JSON.parse(GCP_SERVICE_ACCOUNT_KEY),
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;

    if (!accessToken) {
      throw new Error('Impossible d\'obtenir un jeton d\'accès.');
    }

    const { eventName, description } = JSON.parse(event.body || '{}');
    if (!eventName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Le nom de l'événement est requis." }),
      };
    }

    // === PROMPT DYNAMIQUE AVEC AIDE CONTEXTUELLE ===
    const promptLines = [
      `Crée une illustration graphique et stylisée pour un événement. Le visuel doit être moderne, symbolique et épuré.`,
      `Le thème principal de l'image doit être directement et fidèlement inspiré par le nom et la description suivants.`,
      `Nom de l'événement : "${eventName}".`,
      `Description : "${description}".`,
      `---`,
      `Instructions de style obligatoires :`,
      `- Style : illustration vectorielle, style graphique plat (flat design), minimaliste, couleurs vives et harmonieuses.`,
      `- Composition : se concentrer sur une représentation claire et iconique du thème de l'événement.`,
      `- Texte : Ne pas inclure de texte, de lettres ou de chiffres.`,
      `- Format : Carré.`
    ];

    // On cherche les mots-clés difficiles et on donne une "antisèche" à l'IA
    const lowerCaseEvent = (eventName + ' ' + description).toLowerCase();

    if (lowerCaseEvent.includes('bilboquet')) {
      promptLines.push(
        `---`,
        `Note importante pour l'IA : Le bilboquet est un jeu d'adresse composé d'une boule en bois percée d'un trou, reliée par une ficelle à un manche en bois qui a une pointe et une coupelle. Le but est de lancer la boule pour la rattraper avec la pointe ou la coupelle. L'illustration doit représenter ces éléments de manière stylisée.`
      );
    }
    
    if (lowerCaseEvent.includes('football')) {
      promptLines.push(
        `---`,
        `Note importante pour l'IA : Le terme "football" doit être interprété comme du soccer (ballon rond). L'illustration doit montrer un ballon de football classique, et non un ballon de football américain.`
      );
    }

    const prompt = promptLines.join('\n');
    // === FIN DE L'AMÉLIORATION ===

    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/us-central1/publishers/google/models/imagegeneration:predict`;
    
    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 },
      }),
    });
    
    // ... reste de la fonction (ne change pas) ...
    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Erreur API Google:', responseData);
      throw new Error(responseData.error?.message || 'La génération d\'image a échoué.');
    }

    const imageBase64 = responseData.predictions?.[0]?.bytesBase64Encoded;
    if (!imageBase64) {
      throw new Error('Aucune image n\'a été retournée par l\'API.');
    }
    
    const dataUrl = `data:image/png;base64,${imageBase64}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, imageUrl: dataUrl, imageBase64: dataUrl }),
    };

  } catch (error: any) {
    console.error("Erreur dans la fonction generate-event-image:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message || "Une erreur inattendue est survenue." }),
    };
  }
};


