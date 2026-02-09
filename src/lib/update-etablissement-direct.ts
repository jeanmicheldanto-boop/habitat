/**
 * � AUDIT DOCUMENT: Système de Modifications d'Établissements
 * 
 * RÈGLES DE MODIFICATION (Février 2026):
 * ✅ Gestionnaire propriétaire (établissement_proprietaires.active=true) → Modifications DIRECTES
 * ✅ Gestionnaire organisation → Modifications DIRECTES  
 * ❌ Aucune modération supplémentaire après approbation propriété
 * 
 * ==============================================================================
 * IMPLÉMENTATION ACTUELLE
 * ==============================================================================
 * 
 * ✅ CODE FONCTIONNEL: src/app/gestionnaire/edit/[id]/page.tsx
 * - Logique: Charge l'établissement, vérifie accès (organisation OU proprietaire)
 * - Action: UPDATE DIRECT via supabase.from('etablissements').update()
 * - Résultat: Modifications appliquées immédiatement, pas d'approbation
 * 
 * ✅ SÉCURITÉ: RLS POLICY
 * - Fichier: supabase/fix-reclamation-propriete-rls.sql
 * - Policy: "gestionnaire update own or claimed etablissements"
 * - Protection: Même si un user essaye une requête SQL, RLS bloque
 * 
 * ==============================================================================
 * VÉRIFICATION D'ACCÈS
 * ==============================================================================
 * 
 * DEUX CONDITIONS (OR):
 * 
 * 1. Propriétaire par organisation:
 *    - user.organisation === etablissement.gestionnaire
 * 
 * 2. Propriétaire revendiqué:
 *    - etablissement_proprietaires: { etablissement_id, user_id, active: true }
 * 
 * ==============================================================================
 * TABLES AFFECTÉES
 * ==============================================================================
 * 
 * PRIMARY: etablissements (champs simples)
 * CHILDREN: logements_types, tarifications, restaurations, etablissement_service, avp_infos
 * 
 * ==============================================================================
 * AUDIT CHECKLIST
 * ==============================================================================
 * 
 * ✅ Gestionnaire propriétaire peut modifier directement?
 *    → OUI: Vérification d'accès + RLS + Update direct
 * 
 * ✅ Aucune modération supplémentaire?
 *    → OUI: Pas de création de proposition, pas d'approbation admin
 * 
 * ✅ Organisation peut modifier ses établissements?
 *    → OUI: Vérification organisation + RLS + Update direct
 * 
 * ✅ RLS est protégé correctement?
 *    → OUI: Policy "gestionnaire update own or claimed etablissements"
 * 
 * ==============================================================================
 * VOIR AUSSI
 * ==============================================================================
 * 
 * - [src/app/gestionnaire/edit/[id]/page.tsx](src/app/gestionnaire/edit/[id]/page.tsx) - Implémentation
 * - [supabase/fix-reclamation-propriete-rls.sql](supabase/fix-reclamation-propriete-rls.sql) - RLS
 * - [src/app/gestionnaire/dashboard/page.tsx](src/app/gestionnaire/dashboard/page.tsx) - Dashboard
 * - [src/app/gestionnaire/claim/page.tsx](src/app/gestionnaire/claim/page.tsx) - Réclamation
 */

export interface EtablissementUpdatePayload {
  nom?: string;
  presentation?: string;
  adresse_l1?: string;
  adresse_l2?: string;
  code_postal?: string;
  commune?: string;
  departement?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  habitat_type?: string;
  public_cible?: string[] | string;
  gestionnaire?: string;
  eligibilite_statut?: string;
  statut_editorial?: string;
  latitude?: number;
  longitude?: number;
  logements_types?: Record<string, unknown>[];
  tarifications?: Record<string, unknown>[];
  restaurations?: Record<string, unknown>[];
  services?: string[];
  avp_infos?: Record<string, unknown>;
}
