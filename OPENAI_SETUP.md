# Configuration OpenAI pour les outils IA

## Installation

Le package OpenAI a été installé automatiquement. Aucune action supplémentaire n'est requise.

## Configuration

Pour activer les fonctionnalités IA, ajoutez votre clé API OpenAI dans votre fichier `.env` :

```env
OPENAI_API_KEY=sk-votre-cle-api-openai-ici
```

### Obtenir une clé API OpenAI

1. Visitez https://platform.openai.com/api-keys
2. Connectez-vous ou créez un compte
3. Cliquez sur "Create new secret key"
4. Copiez la clé et ajoutez-la dans votre fichier `.env`

## Fonctionnalités activées avec OpenAI

Les outils IA suivants utilisent maintenant OpenAI pour générer des recommandations intelligentes :

1. **Insights généraux** - Analyse intelligente des données avec recommandations actionnables
2. **Recommandations de promotions** - Suggestions stratégiques de promotions basées sur l'analyse des ventes
3. **Accord mets-vin** - Recommandations d'accords mets-vin personnalisées selon vos vins disponibles

## Fallback

Si la clé API OpenAI n'est pas configurée ou si l'API est indisponible, les outils fonctionneront toujours avec des algorithmes basiques. Un message d'avertissement sera affiché dans les logs du serveur.

## Modèle utilisé

Par défaut, le système utilise `gpt-4o-mini` pour un bon équilibre entre performance et coût. Vous pouvez modifier le modèle dans `server/services/openai.ts` si nécessaire.

## Coûts

Les appels OpenAI sont facturés selon l'utilisation. Consultez https://openai.com/pricing pour les tarifs actuels.

