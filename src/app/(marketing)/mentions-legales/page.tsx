import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Navbar minimal */}
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
          Mentions légales
        </h1>
        <p className="text-sm text-slate-400 mb-12">Dernière mise à jour : {new Date().getFullYear()}</p>

        <div className="prose prose-slate max-w-none space-y-10 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">1. Éditeur du site</h2>
            <p>
              Le site QuickDevis Pro est édité par Gabriel Farias, Développeur indépendant,
              
            </p>
            <p className="mt-2">
              Siège social : Bordeaux, France<br />
              Email : joaofarias115@gmail.com<br />
              Téléphone : 
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">2. Hébergement</h2>
            <p>
              Le site est hébergé par [Nom de l&apos;hébergeur], [Adresse de l&apos;hébergeur],
              [Site web de l&apos;hébergeur].
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">3. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, graphiques, logo, icônes, sons, logiciels)
              est la propriété exclusive de Gabriel Farias ou de ses partenaires.
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication
              de ces différents éléments est strictement interdite sans l&apos;accord exprès par écrit de Gabriel Farias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">4. Responsabilité</h2>
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est
              périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions
              ou des lacunes. Gabriel Farias ne peut être tenu responsable pour tout dommage ou préjudice
              résultant de l&apos;utilisation de ces informations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">5. Données personnelles</h2>
            <p>
              Pour en savoir plus sur la gestion de vos données personnelles, consultez notre{" "}
              <Link href="/confidentialite" className="text-indigo-600 hover:underline">
                Politique de confidentialité
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white py-8 mt-16">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-3">
            <Link href="/mentions-legales" className="hover:text-slate-600 transition-colors font-medium text-slate-600">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-600 transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-600 transition-colors">Confidentialité</Link>
          </div>
          <p>© {new Date().getFullYear()} QuickDevis Pro</p>
        </div>
      </footer>
    </div>
  );
}
