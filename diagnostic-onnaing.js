// Diagnostic de la proposition Onnaing
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnosticOnnaing() {
  console.log('🔍 Diagnostic de la proposition Onnaing\n');

  // 1. Chercher toutes les propositions pour Onnaing
  console.log('Étape 1: Recherche des propositions Onnaing...');
  const { data: propositions, error } = await supabase
    .from('propositions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur lors de la recherche:', error);
    return;
  }

  // Filtrer par commune dans le payload
  const onnaingPropositions = propositions.filter(p => {
    const commune = p.payload?.commune || p.payload?.ville || '';
    return commune.toLowerCase().includes('onnaing');
  });

  if (onnaingPropositions.length === 0) {
    console.log('❌ Aucune proposition trouvée pour Onnaing\n');
    
    // Afficher les dernières propositions pour référence
    console.log('📋 Dernières propositions dans la base:');
    propositions.slice(0, 5).forEach(p => {
      console.log(`   - ${p.payload?.nom || 'Sans nom'} à ${p.payload?.commune || p.payload?.ville || 'Ville inconnue'}`);
      console.log(`     Statut: ${p.statut}, Créée le: ${new Date(p.created_at).toLocaleString('fr-FR')}`);
    });
    return;
  }

  console.log(`✅ ${onnaingPropositions.length} proposition(s) trouvée(s) pour Onnaing\n`);

  // 2. Analyser chaque proposition
  for (const prop of onnaingPropositions) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 Proposition ID: ${prop.id}`);
    console.log(`   Nom: ${prop.payload?.nom || 'N/A'}`);
    console.log(`   Commune: ${prop.payload?.commune || prop.payload?.ville}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Action: ${prop.action}`);
    console.log(`   Créée le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
    console.log(`   Établissement lié: ${prop.etablissement_id || 'Aucun'}`);
    
    if (prop.reviewed_at) {
      console.log(`   Revue le: ${new Date(prop.reviewed_at).toLocaleString('fr-FR')}`);
    }
    if (prop.review_note) {
      console.log(`   Note: ${prop.review_note}`);
    }

    // 3. Si la proposition est approuvée, vérifier si l'établissement existe
    if (prop.statut === 'approuvee' || prop.statut === 'approvee') {
      console.log('\n   ✅ Proposition approuvée');
      
      if (prop.etablissement_id) {
        console.log(`   🔍 Vérification de l'établissement ${prop.etablissement_id}...`);
        
        const { data: etab, error: etabError } = await supabase
          .from('etablissements')
          .select('*')
          .eq('id', prop.etablissement_id)
          .single();

        if (etabError) {
          console.error('   ❌ Erreur lors de la récupération:', etabError.message);
        } else if (etab) {
          console.log('   ✅ Établissement trouvé:');
          console.log(`      - Nom: ${etab.nom}`);
          console.log(`      - Commune: ${etab.commune}`);
          console.log(`      - Statut éditorial: ${etab.statut_editorial}`);
          console.log(`      - Type: ${etab.habitat_type}`);
          console.log(`      - Publié: ${etab.statut_editorial === 'publie' ? 'OUI ✅' : 'NON ❌'}`);
          console.log(`      - Coordonnées: ${etab.geom ? 'OUI ✅' : 'NON ❌'}`);
          
          // Vérifier la visibilité publique
          console.log('\n   🔍 Test de visibilité publique...');
          const { data: publicEtab, error: publicError } = await supabase
            .from('etablissements')
            .select('id, nom, commune, statut_editorial')
            .eq('id', prop.etablissement_id)
            .eq('statut_editorial', 'publie')
            .single();

          if (publicError && publicError.code !== 'PGRST116') {
            console.error('   ❌ Erreur lors du test public:', publicError.message);
          } else if (!publicEtab) {
            console.log('   ❌ L\'établissement n\'est PAS visible publiquement');
            console.log('   Raison possible: statut_editorial !== "publie"');
          } else {
            console.log('   ✅ L\'établissement EST visible publiquement');
          }
        } else {
          console.log('   ❌ Établissement non trouvé dans la base');
        }
      } else {
        console.log('   ⚠️  Aucun établissement_id lié à cette proposition');
        console.log('   ❌ L\'établissement n\'a probablement pas été créé automatiquement');
        console.log('\n   💡 Actions possibles:');
        console.log('   1. Vérifier que le trigger de création automatique fonctionne');
        console.log('   2. Créer manuellement l\'établissement depuis le dashboard');
        console.log('   3. Relancer le processus d\'approbation');
      }
    } else if (prop.statut === 'en_attente') {
      console.log('\n   ⏳ Proposition en attente d\'approbation');
    } else if (prop.statut === 'rejetee') {
      console.log('\n   ❌ Proposition rejetée');
    }

    console.log(`\n   📦 Payload complet:`);
    console.log(JSON.stringify(prop.payload, null, 2));
  }

  console.log(`\n${'='.repeat(80)}\n`);

  // 4. Vérifier les établissements existants à Onnaing
  console.log('🏠 Vérification des établissements existants à Onnaing...');
  const { data: etabs, error: etabsError } = await supabase
    .from('etablissements')
    .select('id, nom, commune, statut_editorial, habitat_type, created_at')
    .ilike('commune', '%onnaing%');

  if (etabsError) {
    console.error('❌ Erreur:', etabsError.message);
  } else if (etabs && etabs.length > 0) {
    console.log(`✅ ${etabs.length} établissement(s) trouvé(s):\n`);
    etabs.forEach(e => {
      console.log(`   - ${e.nom}`);
      console.log(`     Commune: ${e.commune}`);
      console.log(`     Statut: ${e.statut_editorial}`);
      console.log(`     Type: ${e.habitat_type}`);
      console.log(`     Créé le: ${new Date(e.created_at).toLocaleString('fr-FR')}`);
      console.log(`     Visible: ${e.statut_editorial === 'publie' ? 'OUI ✅' : 'NON ❌'}\n`);
    });
  } else {
    console.log('❌ Aucun établissement trouvé à Onnaing\n');
  }

  // 5. Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  const approvedWithoutEtab = onnaingPropositions.filter(
    p => (p.statut === 'approuvee' || p.statut === 'approvee') && !p.etablissement_id
  );
  
  if (approvedWithoutEtab.length > 0) {
    console.log('\n⚠️  Propositions approuvées sans établissement:');
    approvedWithoutEtab.forEach(p => {
      console.log(`   - ${p.payload?.nom} (${p.id})`);
    });
    console.log('\n   → Créez manuellement ces établissements ou relancez le trigger');
  }

  const pendingProps = onnaingPropositions.filter(p => p.statut === 'en_attente');
  if (pendingProps.length > 0) {
    console.log('\n⏳ Propositions en attente:');
    pendingProps.forEach(p => {
      console.log(`   - ${p.payload?.nom} (${p.id})`);
    });
    console.log('\n   → Approuvez ces propositions depuis le dashboard admin');
  }

  const unpublished = etabs?.filter(e => e.statut_editorial !== 'publie') || [];
  if (unpublished.length > 0) {
    console.log('\n📝 Établissements non publiés:');
    unpublished.forEach(e => {
      console.log(`   - ${e.nom} (${e.id})`);
      console.log(`     Statut actuel: ${e.statut_editorial}`);
    });
    console.log('\n   → Publiez ces établissements pour les rendre visibles');
  }

  console.log('\n✅ Diagnostic terminé\n');
}

diagnosticOnnaing().catch(console.error);
