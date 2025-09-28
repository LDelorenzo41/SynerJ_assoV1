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
    // Authentification
    const auth = new GoogleAuth({
      credentials: JSON.parse(GCP_SERVICE_ACCOUNT_KEY),
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;

    if (!accessToken) {
      throw new Error('Impossible d\'obtenir un jeton d\'accès.');
    }

    const { eventName, description, isForCommunication } = JSON.parse(event.body || '{}');
    if (!eventName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Le nom de l'événement/communication est requis." }),
      };
    }

    // Prompt adaptatif selon le contexte (événement vs communication)
    const promptLines = isForCommunication 
      ? [
          `Crée une icône vectorielle moderne et professionnelle pour une communication d'entreprise.`,
          `Le visuel doit être symbolique, épuré et immédiatement compréhensible.`,
          `Sujet de la communication : "${eventName}".`,
          `Contenu : "${description}".`,
          `---`,
          `Instructions de style OBLIGATOIRES :`,
          `- Style : Icône vectorielle ultra-simplifiée, design flat/minimal`,
          `- Couleurs : 2-3 couleurs maximum, palette moderne et harmonieuse`,
          `- Composition : Symbole central unique et reconnaissable`,
          `- Forme : Iconique, géométrique, sans détails superflus`,
          `- Lisibilité : Compréhensible même en petit format`,
          `- Texte : AUCUN texte, lettres ou chiffres`,
          `- Format : Carré ou cercle parfait`,
          `- Inspiration : Pictogrammes de signalétique, logos d'apps mobiles`
        ]
      : [
          `Crée une illustration vectorielle moderne et stylisée pour un événement sportif/associatif.`,
          `Le visuel doit être dynamique, symbolique et épuré.`,
          `Nom de l'événement : "${eventName}".`,
          `Description : "${description}".`,
          `---`,
          `Instructions de style OBLIGATOIRES :`,
          `- Style : Illustration vectorielle, flat design minimaliste`,
          `- Couleurs : Palette vive et harmonieuse (3-4 couleurs max)`,
          `- Composition : Éléments centrés, équilibrés, sans surcharge`,
          `- Forme : Géométrique, claire, moderne`,
          `- Dynamisme : Sensation de mouvement et d'énergie`,
          `- Texte : AUCUN texte, lettres ou chiffres`,
          `- Format : Carré`,
          `- Inspiration : Pictogrammes olympiques, logos de clubs sportifs`
        ];

    // Aide contextuelle pour mots-clés difficiles
    const lowerCaseEvent = (eventName + ' ' + description).toLowerCase();

    if (lowerCaseEvent.includes('bilboquet')) {
      promptLines.push(
        `---`,
        `Note importante : Le bilboquet est un jeu d'adresse avec une boule en bois percée d'un trou, reliée par une ficelle à un manche en bois avec une pointe et une coupelle. Représenter ces éléments de manière stylisée et géométrique.`
      );
    }
    
    if (lowerCaseEvent.includes('football')) {
      promptLines.push(
        `---`,
        `Note importante : "Football" = soccer (ballon rond). Illustration avec ballon de football classique, pas football américain.`
      );
    }

    const prompt = promptLines.join('\n');

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


