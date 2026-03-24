import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
};

export default function CguPage() {
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
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm text-slate-400 mb-12">Dernière mise à jour : {new Date().getFullYear()}</p>

        <div className="prose prose-slate max-w-none space-y-10 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet de définir
              les modalités et conditions d&apos;utilisation des services proposés sur le site QuickDevis Pro,
              ainsi que de définir les droits et obligations des parties dans ce cadre.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">2. Accès au service</h2>
            <p>
              Le service QuickDevis Pro est accessible à toute personne physique ou morale disposant
              d&apos;un accès à Internet. Tous les coûts afférents à l&apos;accès au service, que ce soient
              les frais matériels, logiciels ou d&apos;accès à Internet sont exclusivement à la charge de l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">3. Inscription et compte</h2>
            <p>
              L&apos;utilisation du service nécessite l&apos;inscription préalable de l&apos;utilisateur.
              Lors de l&apos;inscription, l&apos;utilisateur s&apos;engage à fournir des informations exactes et
              à les maintenir à jour. Chaque utilisateur est responsable de la confidentialité de ses
              identifiants de connexion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">4. Utilisation du service</h2>
            <p>
              L&apos;utilisateur s&apos;engage à utiliser le service conformément aux lois en vigueur
              et aux présentes CGU. Il est notamment interdit de :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Utiliser le service à des fins illégales ou frauduleuses</li>
              <li>Porter atteinte aux droits d&apos;un tiers</li>
              <li>Tenter de perturber ou d&apos;accéder sans autorisation aux systèmes informatiques</li>
              <li>Collecter des données personnelles sans consentement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">5. Tarification</h2>
            <p>
              Le service est proposé selon différentes formules tarifaires décrites sur la page Tarifs
              du site. Les prix sont indiqués en euros TTC. [Nom de la société] se réserve le droit
              de modifier ses tarifs à tout moment, avec un préavis de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">6. Résiliation</h2>
            <p>
              L&apos;utilisateur peut résilier son compte à tout moment depuis les paramètres de son compte.
              [Nom de la société] se réserve le droit de suspendre ou de résilier un compte en cas
              de non-respect des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">7. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation
              et/ou à leur exécution relève des juridictions françaises compétentes.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white py-8 mt-16">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-3">
            <Link href="/mentions-legales" className="hover:text-slate-600 transition-colors">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-600 transition-colors font-medium text-slate-600">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-600 transition-colors">Confidentialité</Link>
          </div>
          <p>© {new Date().getFullYear()} QuickDevis Pro</p>
        </div>
      </footer>
    </div>
  );
}
