import Layout from "@/components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
        <p className="text-muted-foreground italic mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-CA')}
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-foreground leading-relaxed">
              La Réserve ("nous", "notre", "l'application") s'engage à protéger votre vie privée. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons 
              vos informations personnelles lorsque vous utilisez notre application de gestion de bar.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Informations que nous collectons</h2>
            
            <h3 className="text-xl font-medium mt-4 mb-2">2.1 Informations que vous nous fournissez</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Informations de compte :</strong> Nom d'utilisateur, mot de passe (haché de manière sécurisée)</li>
              <li><strong>Données d'inventaire :</strong> Produits, quantités, prix, catégories</li>
              <li><strong>Données de vente :</strong> Transactions, montants, articles vendus</li>
              <li><strong>Recettes :</strong> Cocktails et recettes créés</li>
              <li><strong>Paramètres :</strong> Préférences de l'application, paramètres de notification</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.2 Informations collectées automatiquement</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Données d'utilisation :</strong> Statistiques d'utilisation, fonctionnalités utilisées</li>
              <li><strong>Données de performance :</strong> Informations techniques pour améliorer l'application</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">2.3 Informations de paiement</h3>
            <p className="text-foreground leading-relaxed">
              Pour les paiements via Stripe Terminal, nous ne stockons <strong>aucune</strong> information de carte de crédit. 
              Toutes les transactions sont traitées directement par Stripe, conformément à leur politique de confidentialité.
              Nous stockons uniquement les clés API Stripe que vous configurez pour votre propre compte Stripe.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Comment nous utilisons vos informations</h2>
            <p className="mb-3">Nous utilisons vos informations pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir et améliorer nos services de gestion de bar</li>
              <li>Gérer votre compte et authentification</li>
              <li>Traiter les transactions et paiements</li>
              <li>Générer des rapports et analyses</li>
              <li>Vous envoyer des notifications importantes (si activées)</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Stockage des données</h2>
            <p className="text-foreground leading-relaxed">
              Toutes vos données sont stockées <strong>localement</strong> sur votre appareil dans une base de données SQLite. 
              Aucune donnée n'est transmise à nos serveurs sans votre consentement explicite.
            </p>
            <p className="text-foreground leading-relaxed mt-3">
              Les données sont stockées de manière sécurisée et ne sont accessibles qu'à vous via votre compte authentifié.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">5. Partage de vos informations</h2>
            
            <h3 className="text-xl font-medium mt-4 mb-2">5.1 Services tiers</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Stripe :</strong> Pour le traitement des paiements. Stripe collecte et traite les informations de paiement 
                conformément à leur <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">politique de confidentialité</a>.
              </li>
              <li>
                <strong>Google Custom Search API :</strong> Pour la recherche d'images de produits (si activée). 
                Les requêtes sont traitées par Google conformément à leur politique de confidentialité.
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">5.2 Nous ne vendons pas vos données</h3>
            <p className="text-foreground leading-relaxed">
              Nous ne vendons, ne louons ni ne partageons vos informations personnelles avec des tiers à des fins commerciales.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">5.3 Obligations légales</h3>
            <p className="text-foreground leading-relaxed">
              Nous pouvons divulguer vos informations si la loi l'exige ou en réponse à des demandes légales valides.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">6. Sécurité des données</h2>
            <p className="mb-3">Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Mots de passe hachés avec des algorithmes sécurisés</li>
              <li>Double authentification (2FA) disponible</li>
              <li>Stockage local sécurisé avec SQLite</li>
              <li>Communication sécurisée (HTTPS) pour les services tiers</li>
              <li>Clés API Stripe stockées de manière sécurisée</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-3">
              Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est 100% sécurisée. 
              Bien que nous nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos informations, 
              nous ne pouvons garantir leur sécurité absolue.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">7. Vos droits</h2>
            <p className="mb-3">Conformément au RGPD et aux lois sur la protection des données, vous avez le droit de :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Accéder</strong> à vos données personnelles</li>
              <li><strong>Rectifier</strong> vos données inexactes</li>
              <li><strong>Supprimer</strong> vos données personnelles</li>
              <li><strong>Limiter</strong> le traitement de vos données</li>
              <li><strong>Vous opposer</strong> au traitement de vos données</li>
              <li><strong>Portabilité</strong> de vos données (export CSV/Excel disponible)</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-3">
              Pour exercer ces droits, vous pouvez supprimer vos données directement dans l'application ou nous contacter 
              aux coordonnées fournies ci-dessous.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">8. Conservation des données</h2>
            <p className="text-foreground leading-relaxed">
              Nous conservons vos données aussi longtemps que votre compte est actif ou aussi longtemps que nécessaire 
              pour vous fournir nos services. Vous pouvez supprimer votre compte et toutes vos données à tout moment 
              depuis les paramètres de l'application.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">9. Cookies et technologies similaires</h2>
            <p className="text-foreground leading-relaxed">
              Notre application utilise le stockage local (localStorage) pour sauvegarder vos préférences et données. 
              Nous n'utilisons pas de cookies de suivi tiers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">10. Enfants</h2>
            <p className="text-foreground leading-relaxed">
              Notre application n'est pas destinée aux personnes de moins de 18 ans. Nous ne collectons pas sciemment 
              d'informations personnelles d'enfants.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">11. Modifications de cette politique</h2>
            <p className="text-foreground leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout 
              changement en publiant la nouvelle politique sur cette page et en mettant à jour la date de "Dernière mise à jour".
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">12. Conformité internationale</h2>
            <p className="text-foreground leading-relaxed">
              Cette politique de confidentialité est conforme au Règlement Général sur la Protection des Données (RGPD) 
              de l'Union Européenne et au California Consumer Privacy Act (CCPA) des États-Unis.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">13. Contact</h2>
            <div className="bg-secondary p-4 rounded-lg mt-4">
              <p className="mb-2">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                veuillez nous contacter :
              </p>
              <p>
                <strong>Email :</strong> <a href="mailto:contact@guillaumehetu.com" className="text-primary hover:underline">contact@guillaumehetu.com</a><br />
                <strong>Application :</strong> La Réserve
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
