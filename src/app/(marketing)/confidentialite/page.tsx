import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <header className="border-b border-slate-100 bg-white">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white shadow-md">
              QD
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              QuickDevis <span className="text-indigo-600">Pro</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-slate-400 mb-12">Dernière mise à jour : {new Date().getFullYear()}</p>

        <div className="prose prose-slate max-w-none space-y-10 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est Gabriel Farias,
              joignable à l&apos;adresse email joaofarias115@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Informations de compte : nom, adresse email, mot de passe (hashé)</li>
              <li>Informations professionnelles : nom de l&apos;entreprise, SIRET, numéro de TVA, adresse</li>
              <li>Données d&apos;utilisation : devis, factures, informations clients et produits</li>
              <li>Données techniques : adresse IP, navigateur, logs de connexion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Fournir et améliorer le service QuickDevis Pro</li>
              <li>Gérer votre compte et votre abonnement</li>
              <li>Vous envoyer des communications relatives au service</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">4. Base légale</h2>
            <p>
              Le traitement de vos données est fondé sur l&apos;exécution du contrat (fourniture du service),
              votre consentement (communications marketing), et nos obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">5. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant toute la durée de votre utilisation du service,
              puis pendant une période de 3 ans après la clôture de votre compte,
              sauf obligation légale de conservation plus longue (données comptables : 10 ans).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">6. Partage des données</h2>
            <p>
              Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Nos sous-traitants techniques (hébergement, emails transactionnels)</li>
              <li>Les autorités compétentes sur demande légale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">7. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, contactez-nous à joaofarias115@gmail.com.
              Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">8. Cookies</h2>
            <p>
              Le site utilise uniquement des cookies strictement nécessaires au fonctionnement du service
              (session d&apos;authentification). Aucun cookie de tracking ou publicitaire n&apos;est utilisé.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white py-8 mt-16">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-3">
            <Link href="/mentions-legales" className="hover:text-slate-600 transition-colors">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-600 transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-600 transition-colors font-medium text-slate-600">Confidentialité</Link>
          </div>
          <p>© {new Date().getFullYear()} QuickDevis Pro</p>
        </div>
      </footer>
    </div>
  );
}
