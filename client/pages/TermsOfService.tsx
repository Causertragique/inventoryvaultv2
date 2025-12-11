import Layout from "@/components/Layout";

export default function TermsOfService() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions d'utilisation</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant La Réserve ("le Service"), vous acceptez d'être lié par ces conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Description du service</h2>
            <p>
              La Réserve est une application web de gestion d'inventaire pour bars et restaurants qui permet de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gérer l'inventaire de produits (spiritueux, vins, bières, etc.) avec codes d'inventaire</li>
              <li>Créer et gérer des recettes de cocktails</li>
              <li>Suivre les ventes et transactions en temps réel</li>
              <li>Obtenir des analyses et recommandations intelligentes via OpenAI</li>
              <li>Gérer les paiements via Stripe Terminal</li>
              <li>Assurer la sécurité avec un système de contrôle d'accès basé sur les rôles</li>
              <li>Tracer toutes les modifications d'inventaire via des logs d'audit immutables</li>
              <li>Détecter automatiquement les activités suspectes et la fraude potentielle</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Compte utilisateur et rôles</h2>
            <p className="mb-2">
              Pour utiliser le Service, vous devez créer un compte via Firebase Authentication. Vous êtes responsable de :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Toutes les activités effectuées sous votre compte</li>
              <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
              <li>Respecter les permissions associées à votre rôle</li>
            </ul>
            <p className="mt-3 mb-2">
              <strong>Système de rôles et permissions :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Propriétaire :</strong> Accès complet, gestion des utilisateurs, suppression de compte</li>
              <li><strong>Administrateur :</strong> Accès complet à l'inventaire, ventes, analytics et paramètres</li>
              <li><strong>Gérant :</strong> Gestion de l'inventaire et ventes, consultation des analytics, accès aux logs d'audit</li>
              <li><strong>Employé :</strong> Consultation de l'inventaire et traitement des ventes uniquement (lecture seule sur l'inventaire)</li>
            </ul>
            <p className="mt-2">
              Les permissions sont appliquées au niveau de l'application et de la base de données (Firestore) pour garantir la sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Utilisation acceptable</h2>
            <p className="mb-2">Vous vous engagez à :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utiliser le Service de manière légale et conforme aux lois applicables</li>
              <li>Ne pas tenter d'accéder de manière non autorisée au Service ou aux données d'autres utilisateurs</li>
              <li>Ne pas utiliser le Service pour des activités frauduleuses ou de manipulation d'inventaire</li>
              <li>Ne pas perturber, interférer ou compromettre la sécurité du Service</li>
              <li>Respecter les permissions associées à votre rôle d'utilisateur</li>
              <li>Ne pas tenter de contourner les mesures de sécurité, les logs d'audit ou le système de permissions</li>
              <li>Ne pas modifier, supprimer ou falsifier les logs d'audit (techniquement impossible, mais toute tentative est interdite)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Données et contenu</h2>
            <p>
              Vous conservez tous les droits sur vos données. En utilisant le Service, vous nous accordez une licence
              pour stocker, traiter et afficher vos données dans le but de fournir le Service.
            </p>
            <p className="mt-2">
              Nous utilisons Firebase (Google Cloud) pour le stockage sécurisé de vos données. Vos données sont stockées
              avec chiffrement et protégées par des règles de sécurité strictes. Seuls vous et les utilisateurs autorisés
              (selon leur rôle) peuvent accéder à vos données.
            </p>
            <p className="mt-2">
              <strong>Logs d'audit et traçabilité :</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Toutes les modifications d'inventaire sont automatiquement enregistrées dans des logs d'audit</li>
              <li>Ces logs sont immutables et ne peuvent être modifiés ou supprimés après leur création</li>
              <li>Les logs incluent : l'action effectuée, l'utilisateur, l'horodatage, les valeurs avant/après</li>
              <li>Les logs sont utilisés pour la sécurité, la détection de fraude et la conformité réglementaire</li>
              <li>Les gérants et administrateurs peuvent consulter les logs d'audit à tout moment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Sécurité et prévention de la fraude</h2>
            <p className="mb-2">
              Le Service intègre des mesures de sécurité avancées pour protéger votre inventaire et prévenir la fraude :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Contrôle d'accès basé sur les rôles :</strong> Permissions granulaires selon le rôle de l'utilisateur</li>
              <li><strong>Logs d'audit immutables :</strong> Enregistrement permanent de toutes les actions sur l'inventaire</li>
              <li><strong>Détection automatique de fraude :</strong> Algorithmes de détection des activités suspectes</li>
              <li><strong>Règles de sécurité Firestore :</strong> Protection au niveau de la base de données</li>
              <li><strong>Alertes de sécurité :</strong> Notifications visuelles pour les administrateurs</li>
            </ul>
            <p className="mt-2">
              En cas de détection d'activité suspecte ou frauduleuse, nous nous réservons le droit de suspendre
              temporairement l'accès au compte concerné pendant l'investigation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. Paiements</h2>
            <p>
              Les fonctionnalités de paiement sont fournies via Stripe Terminal. En utilisant ces fonctionnalités,
              vous acceptez également les conditions d'utilisation de Stripe. Nous ne stockons pas vos informations
              de carte bancaire - toutes les transactions sont traitées directement et de manière sécurisée par Stripe.
            </p>
            <p className="mt-2">
              Vous devez configurer vos propres clés API Stripe pour utiliser le système de paiement. Ces clés sont
              stockées de manière sécurisée et chiffrée dans Firestore.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">8. Intelligence artificielle</h2>
            <p>
              Le Service utilise OpenAI (GPT) pour fournir des analyses intelligentes, recommandations et insights
              sur vos ventes et inventaire. Ces suggestions sont générées automatiquement par intelligence artificielle
              et doivent être considérées comme des outils d'aide à la décision, non comme des conseils professionnels
              définitifs ou des garanties de résultats.
            </p>
            <p className="mt-2">
              <strong>Fonctionnalités d'IA disponibles :</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Prédictions de ventes et tendances</li>
              <li>Recommandations de réapprovisionnement</li>
              <li>Analyses de rentabilité par produit</li>
              <li>Optimisation des prix</li>
              <li>Suggestions d'accords mets-vins</li>
              <li>Recommandations de promotions</li>
              <li>Optimisation de menu</li>
            </ul>
            <p className="mt-2">
              Les données envoyées à OpenAI sont anonymisées et ne contiennent pas d'informations personnelles identifiables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">9. Limitation de responsabilité</h2>
            <p>
              Le Service est fourni "tel quel" sans garantie d'aucune sorte, expresse ou implicite. Nous ne sommes pas responsables de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Pertes de données, bien que nous utilisions des systèmes de sauvegarde robustes</li>
              <li>Interruptions de service dues à des problèmes tiers (Firebase, Stripe, OpenAI)</li>
              <li>Décisions commerciales prises sur la base des analyses et recommandations fournies par l'IA</li>
              <li>Problèmes liés aux services tiers (Firebase, Stripe, OpenAI, Google)</li>
              <li>Dommages indirects, consécutifs, spéciaux ou punitifs</li>
              <li>Pertes de profits ou de revenus</li>
              <li>Tentatives de fraude ou d'activités non autorisées par vos employés ou tiers</li>
            </ul>
            <p className="mt-2">
              Bien que nous fournissions des outils de détection de fraude et de traçabilité, vous restez responsable
              de la supervision de vos employés et de la sécurité de votre inventaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">10. Résiliation</h2>
            <p>
              Vous pouvez cesser d'utiliser le Service à tout moment en supprimant votre compte depuis
              <strong> Paramètres &gt; Sécurité &gt; Supprimer mon compte</strong>. Cette action supprimera
              définitivement toutes vos données (profil, inventaire, ventes, recettes, logs d'audit) de nos systèmes.
            </p>
            <p className="mt-2">
              Nous nous réservons le droit de suspendre ou résilier votre accès en cas de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Violation de ces conditions d'utilisation</li>
              <li>Activités frauduleuses ou illégales détectées</li>
              <li>Tentatives répétées de contournement des mesures de sécurité</li>
              <li>Non-paiement de frais éventuels (si applicable)</li>
              <li>Utilisation abusive du Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">11. Portabilité et export des données</h2>
            <p>
              Conformément au RGPD, vous avez le droit d'exporter toutes vos données à tout moment.
              Cette fonctionnalité est disponible dans <strong>Paramètres &gt; Sécurité &gt; Télécharger mes données</strong>.
            </p>
            <p className="mt-2">
              L'export inclut toutes vos données au format JSON :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Profil utilisateur et paramètres</li>
              <li>Inventaire complet avec tous les produits</li>
              <li>Historique des ventes</li>
              <li>Recettes et cocktails</li>
              <li>Clés API Stripe (si configurées)</li>
            </ul>
            <p className="mt-2">
              Note : Les logs d'audit ne sont pas inclus dans l'export de données personnel pour des raisons de sécurité,
              mais peuvent être consultés dans l'interface (pour gérants et administrateurs).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">12. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes
              prendront effet 30 jours après leur publication. Les modifications mineures prendront effet immédiatement.
            </p>
            <p className="mt-2">
              Vous serez informé des modifications importantes par notification dans l'application. Votre utilisation
              continue du Service après l'entrée en vigueur des modifications constitue votre acceptation des nouvelles conditions.
            </p>
            <p className="mt-2">
              Si vous n'acceptez pas les nouvelles conditions, vous devez cesser d'utiliser le Service et supprimer votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">13. Droit applicable et juridiction</h2>
            <p>
              Ces conditions sont régies par les lois du Québec, Canada. Tout litige découlant de ou en relation avec
              ces conditions ou l'utilisation du Service sera soumis à la juridiction exclusive des tribunaux du Québec.
            </p>
            <p className="mt-2">
              Pour les utilisateurs de l'Union Européenne, vous conservez tous les droits de protection des consommateurs
              prévus par le droit européen, notamment le RGPD pour la protection des données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">14. Propriété intellectuelle</h2>
            <p>
              Le Service et tous ses éléments (code source, design, logos, documentation) sont la propriété exclusive
              de La Réserve et sont protégés par les lois sur le droit d'auteur et la propriété intellectuelle.
            </p>
            <p className="mt-2">
              Vous n'êtes pas autorisé à :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Copier, modifier ou distribuer le code source du Service</li>
              <li>Utiliser les marques, logos ou éléments de design du Service</li>
              <li>Créer des œuvres dérivées basées sur le Service</li>
              <li>Reverse-engineer ou décompiler le Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">15. Contact</h2>
            <p>
              Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter :
            </p>
            <div className="mt-3 p-4 bg-secondary/20 rounded-lg">
              <p><strong>Email :</strong> contact@guillaumehetu.com</p>
              <p className="mt-1"><strong>Application :</strong> La Réserve</p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t text-sm">
            <p><strong>Dernière mise à jour :</strong> 5 décembre 2025</p>
            <p className="mt-2 text-xs">
              Version 2.0 - Ajout du système de rôles, logs d'audit, détection de fraude et conformité RGPD renforcée
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
