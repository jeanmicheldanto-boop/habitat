import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Espace d’administration</h1>
      <nav className="space-y-4">
        <Link href="/admin/etablissements" className="block bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700">Gérer les établissements</Link>
        <Link href="/admin/propositions" className="block bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700">Modération des propositions</Link>
      </nav>
      <div className="mt-8 text-gray-500 text-sm">
        Accédez à la gestion des établissements, logements, restauration, services et à la file de modération.
      </div>
    </main>
  );
}
