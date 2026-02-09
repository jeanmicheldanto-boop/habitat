#!/usr/bin/env node

// Diagnostic du système de réclamation de propriété
// Vérifie si un gestionnaire peut vraiment modifier une fiche après avoir revendiqué sa propriété

const analysis = {
  status: "⚠️ SYSTÈME INCOMPLET",
  
  flux_theorique: {
    "1": "Gestionnaire clique sur 'Revendiquer propriété' depuis une fiche établissement",
    "2": "Accès à /gestionnaire/claim et recherche l'établissement",
    "3": "Remplit formulaire + upload justificatifs",
    "4": "Création d'enregistrement dans table 'reclamations_propriete'",
    "5": "Admin reçoit notification et approuve/rejette la réclamation",
    "6": "Si approuvée: Trigger add_owner_after_reclamation_approval() ajoute user_id dans établissement_proprietaires",
    "7": "Gestionnaire devrait pouvoir modifier la fiche"
  },

  what_exists: {
    "✅ Page /gestionnaire/claim": "Fonctionnelle avec recherche et upload",
    "✅ Table reclamations_propriete": "Existe dans le schéma",
    "✅ Trigger add_owner_after_reclamation_approval()": "Existe et ajoute user_id à établissement_proprietaires",
    "✅ Table établissement_proprietaires": "Existe avec colonnes (etablissement_id, user_id, role, active)",
    "✅ Admin moderation": "/admin/moderation peut approuver/rejeter"
  },

  the_problem: {
    "issue_1": {
      titre: "Page d'édition (/gestionnaire/edit) ne vérifie PAS établissement_proprietaires",
      code: "src/app/gestionnaire/edit/[id]/page.tsx:129-133",
      actuel: "eq('gestionnaire', organisation)",
      probleme: "Cherche le champ 'gestionnaire' (texte='Watt\\'Home') au lieu de vérifier établissement_proprietaires",
      consequence: "Même approuvée, le gestionnaire reçoit 'Établissement non trouvé' quand il essaie d'éditer"
    },

    "issue_2": {
      titre: "Aucune RLS policy pour établissement_proprietaires",
      code: "supabase/add-all-gestionnaire-rls-policies.sql",
      actuel: "Policies vérifient uniquement: p.organisation = etablissements.gestionnaire",
      manquant: "Il faudrait ajouter une policy qui accepte aussi: EXISTS (SELECT FROM etablissement_proprietaires WHERE user_id = auth.uid())",
      consequence: "Même côté base de données, les modifications seront rejetées par RLS"
    }
  },

  ce_qui_faudrait_faire: {
    "solution_1": "Modifier la page /gestionnaire/edit pour consulter établissement_proprietaires",
    "solution_2": "Ajouter une RLS policy pour permettre l'édition via établissement_proprietaires",
    "solution_3": "Tester le flux complet: Réclamation → Approbation → Édition",
    "solution_4": "Option: Ajouter un lien 'Revendiquer' ou 'Modifier' depuis la fiche établissement"
  },

  statut_fonctionnel: {
    creation_etablissement: "✅ Fonctionne (créer + modifier)",
    reclamation_propriete: "⚠️ Incomplet (créer OK, approuver OK, MAIS modifier = ❌)",
    modification_via_proposition: "✅ Fonctionne (anonyme peut proposer, admin approuve, changements appliqués)"
  }
};

console.log("\n" + "=".repeat(80));
console.log("🔍 DIAGNOSTIC - RÉCLAMATION DE PROPRIÉTÉ");
console.log("=".repeat(80) + "\n");

console.log("📊 STATUS:", analysis.status);

console.log("\n📋 FLUX THÉORIQUE:");
Object.entries(analysis.flux_theorique).forEach(([step, desc]) => {
  console.log(`   ${step}. ${desc}`);
});

console.log("\n✅ CE QUI EXISTE:");
Object.entries(analysis.what_exists).forEach(([item, desc]) => {
  console.log(`   ${item}: ${desc}`);
});

console.log("\n❌ LES PROBLÈMES:");
console.log("\n   Problème #1: Page d'édition");
console.log(`   Fichier: ${analysis.the_problem.issue_1.code}`);
console.log(`   Actuel: .${analysis.the_problem.issue_1.actuel}`);
console.log(`   Problème: ${analysis.the_problem.issue_1.probleme}`);
console.log(`   Conséquence: ${analysis.the_problem.issue_1.consequence}`);

console.log("\n   Problème #2: RLS Policies");
console.log(`   Fichier: ${analysis.the_problem.issue_2.code}`);
console.log(`   Manquant: ${analysis.the_problem.issue_2.manquant.substring(0, 100)}...`);
console.log(`   Conséquence: ${analysis.the_problem.issue_2.consequence}`);

console.log("\n🛠️ SOLUTIONS REQUISES:");
Object.entries(analysis.ce_qui_faudrait_faire).forEach(([key, desc]) => {
  console.log(`   ${key.split('_')[1]}: ${desc}`);
});

console.log("\n📊 STATUS FONCTIONNEL:");
console.log(`   Création établissement: ${analysis.statut_fonctionnel.creation_etablissement}`);
console.log(`   Réclamation propriété: ${analysis.statut_fonctionnel.reclamation_propriete}`);
console.log(`   Modification via proposition: ${analysis.statut_fonctionnel.modification_via_proposition}`);

console.log("\n" + "=".repeat(80));
console.log("CONCLUSION:");
console.log("=".repeat(80));
console.log(`
Les réclamations de propriété EXISTENT mais LE FLUX N'EST PAS COMPLET.

L'architecture théorique est bonne:
1. Table reclamations_propriete ✅
2. Page claim ✅
3. Trigger d'approbation ✅
4. Table établissement_proprietaires ✅

MAIS la couche application (page edit) et la sécurité (RLS policies) n'utilisent pas
le système de propriétaires pour autoriser les modifications.

Il faudrait donc :
1. Mettre à jour la page /gestionnaire/edit pour aussi vérifier établissement_proprietaires
2. Ajouter une RLS policy qui accepte les modifications si user_id dans proprietaires 
3. Tester le flux complet

Actuellement, seul un gestionnaire dont le champ 'établissement.gestionnaire' = son organisation
peut modifier une fiche. Les propriétaires revendiqués ne peuvent PAS modifier.
`);
console.log("=".repeat(80) + "\n");
