import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace d'administration</h1>
            <p className="text-gray-600 mb-8">
              Gérez les établissements, modérez les propositions et administrez la plateforme.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gestion des établissements */}
              <Link href="/admin/etablissements" className="group block">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 hover:border-blue-300 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                        Gérer les établissements
                      </h3>
                      <p className="text-sm text-gray-600">
                        Créer, modifier et supprimer des établissements
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Modération */}
              <Link href="/admin/moderation" className="group block">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 hover:bg-orange-100 hover:border-orange-300 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-700">
                        Modération
                      </h3>
                      <p className="text-sm text-gray-600">
                        Valider les propositions et réclamations
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Anciennes propositions */}
              <Link href="/admin/propositions" className="group block">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 hover:border-green-300 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700">
                        Anciennes propositions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Historique et suivi des propositions
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Accès rapide</h4>
              <div className="flex flex-wrap gap-2">
                <Link href="/plateforme" className="text-sm text-blue-600 hover:text-blue-500">
                  → Voir la plateforme publique
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/gestionnaire" className="text-sm text-blue-600 hover:text-blue-500">
                  → Espace gestionnaire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}