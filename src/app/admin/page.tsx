"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Vérifier le rôle
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, nom, prenom')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'gestionnaire')) {
        router.push('/admin/login');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ 
          fontSize: "2rem", 
          margin: "0",
          color: "#a85b2b",
          borderBottom: "2px solid #a85b2b",
          paddingBottom: "0.5rem"
        }}>
          Administration - Habitat Intermédiaire
        </h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#b91c1c"}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#dc2626"}
        >
          🚪 Se déconnecter
        </button>
      </div>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        {/* Gestion des établissements */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            marginBottom: "1rem", 
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            🏢 Établissements
          </h2>
          <p style={{ 
            color: "#6b7280", 
            marginBottom: "1rem",
            fontSize: "0.9rem",
            lineHeight: "1.4"
          }}>
            Gérer les établissements, ajouter de nouveaux habitats, modifier les informations existantes.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link 
              href="/admin/etablissements" 
              style={{
                display: "inline-block",
                background: "#a85b2b",
                color: "white",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                textAlign: "center",
                transition: "background-color 0.2s"
              }}
            >
              Liste des établissements
            </Link>
            <Link 
              href="/admin/etablissements/create" 
              style={{
                display: "inline-block",
                background: "#059669",
                color: "white",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                textAlign: "center",
                transition: "background-color 0.2s"
              }}
            >
              Ajouter un établissement
            </Link>
          </div>
        </div>

        {/* Modération */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            marginBottom: "1rem", 
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            ✅ Modération
          </h2>
          <p style={{ 
            color: "#6b7280", 
            marginBottom: "1rem",
            fontSize: "0.9rem",
            lineHeight: "1.4"
          }}>
            Modérer les contenus, valider les propositions, gérer les signalements.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link 
              href="/admin/moderation" 
              style={{
                display: "inline-block",
                background: "#7c3aed",
                color: "white",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                textAlign: "center",
                transition: "background-color 0.2s"
              }}
            >
              Interface de modération
            </Link>
          </div>
        </div>

        {/* Propositions */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            marginBottom: "1rem", 
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            💡 Propositions
          </h2>
          <p style={{ 
            color: "#6b7280", 
            marginBottom: "1rem",
            fontSize: "0.9rem",
            lineHeight: "1.4"
          }}>
            Gérer les propositions d&apos;amélioration et les suggestions des utilisateurs.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link 
              href="/admin/propositions" 
              style={{
                display: "inline-block",
                background: "#f59e0b",
                color: "white",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                textAlign: "center",
                transition: "background-color 0.2s"
              }}
            >
              Gérer les propositions
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1.5rem",
        marginTop: "2rem"
      }}>
        <h3 style={{ 
          fontSize: "1.1rem", 
          marginBottom: "1rem", 
          color: "#374151"
        }}>
          📊 Accès rapide
        </h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link 
            href="/admin/check-propositions" 
            style={{
              display: "inline-block",
              background: "#3b82f6",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: "500"
            }}
          >
            🔍 Vérifier la table propositions
          </Link>
          <Link 
            href="/admin/test-propositions" 
            style={{
              display: "inline-block",
              background: "#dc2626",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: "500"
            }}
          >
            🧪 Créer des propositions de test
          </Link>
          <Link 
            href="/plateforme" 
            target="_blank"
            style={{
              display: "inline-block",
              background: "#6b7280",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: "500"
            }}
          >
            🌐 Voir la plateforme publique
          </Link>
          <Link 
            href="/" 
            style={{
              display: "inline-block",
              background: "#6b7280",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: "500"
            }}
          >
            🏠 Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}