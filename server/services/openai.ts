import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

/**
 * Initialise le client OpenAI avec la clé API depuis les variables d'environnement
 */
export function getOpenAIClient(): OpenAI | null {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[OpenAI] OPENAI_API_KEY non définie dans .env - Les fonctionnalités IA seront limitées");
    return null;
  }

  try {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
    console.log("[OpenAI] Client OpenAI initialisé avec succès");
    return openaiClient;
  } catch (error) {
    console.error("[OpenAI] Erreur lors de l'initialisation:", error);
    return null;
  }
}

/**
 * Appelle OpenAI avec un prompt et retourne la réponse
 */
export async function callOpenAI(
  prompt: string,
  systemPrompt?: string,
  model: string = "gpt-4o-mini"
): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  try {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    messages.push({ role: "user", content: prompt });

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error: any) {
    // Ne pas exposer de détails sensibles dans les logs
    const errorMessage = error.message || "Erreur inconnue";
    // Ne pas logger la clé API ou d'autres informations sensibles
    if (errorMessage.includes("api key") || errorMessage.includes("401") || errorMessage.includes("403")) {
      console.error("[OpenAI] Erreur d'authentification - Vérifiez votre clé API dans .env");
    } else {
      console.error("[OpenAI] Erreur lors de l'appel API:", errorMessage);
    }
    return null;
  }
}

/**
 * Appelle OpenAI avec un prompt JSON et retourne un objet parsé
 */
export async function callOpenAIJSON<T>(
  prompt: string,
  systemPrompt?: string,
  model: string = "gpt-4o-mini"
): Promise<T | null> {
  console.log("[OpenAI] Appel JSON avec modèle:", model);
  console.log("[OpenAI] Prompt système:", systemPrompt?.substring(0, 100) || "Aucun");
  console.log("[OpenAI] Prompt utilisateur (premiers 200 caractères):", prompt.substring(0, 200));
  
  const client = getOpenAIClient();
  if (!client) {
    console.warn("[OpenAI] Client OpenAI non initialisé");
    return null;
  }

  try {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    messages.push({ role: "user", content: prompt });

    // Use JSON mode for strict JSON output
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0]?.message?.content || null;
    
    if (!responseText) {
      console.warn("[OpenAI] Aucune réponse reçue de l'API");
      return null;
    }

    console.log("[OpenAI] Réponse reçue (premiers 300 caractères):", responseText.substring(0, 300));

    try {
      const parsed = JSON.parse(responseText) as T;
      console.log("[OpenAI] JSON parsé avec succès");
      return parsed;
    } catch (error: any) {
      console.error("[OpenAI] Erreur lors du parsing JSON:", error?.message || "Erreur inconnue");
      console.error("[OpenAI] Réponse complète qui a échoué:", responseText);
      return null;
    }
  } catch (error: any) {
    const errorMessage = error.message || "Erreur inconnue";
    if (errorMessage.includes("api key") || errorMessage.includes("401") || errorMessage.includes("403")) {
      console.error("[OpenAI] Erreur d'authentification - Vérifiez votre clé API dans .env");
    } else {
      console.error("[OpenAI] Erreur lors de l'appel API:", errorMessage);
    }
    return null;
  }
}

