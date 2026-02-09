// Trouver les propositions approuvées récentes
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findRecentApprovedPropositions() {
  console.log('🔍 Recherche des propositions approuvées récentes...\n');

  const { data: propositions, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('statut', 'approuvee')
    .eq('action', 'update')
    .order('reviewed_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`✅ ${propositions.length} proposition(s) approuvée(s) de type UPDATE trouvée(s)\n`);

  for (const prop of propositions) {
    console.log(`${'='.repeat(80)}`);
    console.log(`📝 Proposition: ${prop.id}`);
    console.log(`   Établissement: ${prop.etablissement_id}`);
    console.log(`   Créée le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
    console.log(`   Revue le: ${prop.reviewed_at ? new Date(prop.reviewed_at).toLocaleString('fr-FR') : 'N/A'}`);
    
    // Récupérer l'établissement
    if (prop.etablissement_id) {
      const { data: etab } = await supabase
        .from('etablissements')
        .select('nom, commune, adresse_l1')
        .eq('id', prop.etablissement_id)
        .single();

      if (etab) {
        console.log(`\n   🏠 Établissement:`);
        console.log(`      Nom: ${etab.nom}`);
        console.log(`      Commune: ${etab.commune}`);
        console.log(`      Adresse: ${etab.adresse_l1 || 'N/A'}`);
      }
    }

    // Afficher les modifications
    const modifs = prop.payload?.modifications || {};
    if (Object.keys(modifs).length > 0) {
      console.log(`\n   📝 Modifications (${Object.keys(modifs).length} champs):`);
      
      // Afficher les champs principaux
      if (modifs.commune) console.log(`      - Commune: ${modifs.commune}`);
      if (modifs.adresse_l1) console.log(`      - Adresse: ${modifs.adresse_l1}`);
      if (modifs.nom) console.log(`      - Nom: ${modifs.nom}`);
      if (modifs.nouvelle_photo_filename) console.log(`      - Photo: ${modifs.nouvelle_photo_filename}`);
      if (modifs.sous_categories) console.log(`      - Sous-catégories: ${modifs.sous_categories.length} élément(s)`);
      if (modifs.services) console.log(`      - Services: ${modifs.services.length} élément(s)`);
      if (modifs.logements_types) console.log(`      - Types de logement: ${modifs.logements_types.length} élément(s)`);
    }
    
    console.log(`\n   💡 Pour appliquer cette proposition:`);
    console.log(`      node apply-approved-proposition.js ${prop.id}\n`);
  }

  console.log('='.repeat(80));
}

findRecentApprovedPropositions().catch(console.error);
