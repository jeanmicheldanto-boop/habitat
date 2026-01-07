const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkPropositions() {
  console.log('🔍 Vérification des propositions récentes...\n');

  // Toutes les propositions des dernières 24h
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  const { data: propositions, error } = await supabase
    .from('propositions')
    .select('*')
    .gte('updated_at', yesterday.toISOString())
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Total propositions modifiées dans les 24h: ${propositions?.length || 0}\n`);

  if (propositions && propositions.length > 0) {
    for (const prop of propositions) {
      console.log(`\n📝 Proposition ID: ${prop.id}`);
      console.log(`   Type: ${prop.type_proposition || 'N/A'}`);
      console.log(`   Statut: ${prop.statut}`);
      console.log(`   Établissement ID: ${prop.etablissement_id || 'NOUVEL ÉTABLISSEMENT'}`);
      console.log(`   Créée le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
      console.log(`   Mise à jour: ${new Date(prop.updated_at).toLocaleString('fr-FR')}`);
      
      if (prop.donnees_proposition) {
        const donnees = prop.donnees_proposition;
        console.log(`   📋 Données:`);
        if (donnees.nom) console.log(`      Nom: ${donnees.nom}`);
        if (donnees.commune) console.log(`      Commune: ${donnees.commune}`);
        if (donnees.habitat_type) console.log(`      Type: ${donnees.habitat_type}`);
        if (donnees.sous_categories) console.log(`      Sous-cat: ${JSON.stringify(donnees.sous_categories)}`);
      }

      // Si approuvée, vérifier si l'établissement existe
      if (prop.statut === 'approuvee' && prop.etablissement_id) {
        const { data: etab } = await supabase
          .from('etablissements')
          .select('id, nom, statut_editorial, commune, geom')
          .eq('id', prop.etablissement_id)
          .single();

        if (etab) {
          console.log(`   ✅ Établissement trouvé: ${etab.nom}`);
          console.log(`      Statut: ${etab.statut_editorial}`);
          console.log(`      Géolocalisation: ${etab.geom ? 'OUI' : 'NON'}`);
        } else {
          console.log(`   ❌ Établissement NON TROUVÉ avec l'ID ${prop.etablissement_id}`);
        }
      }
    }
  }

  // Propositions pour création d'établissement à Ossun
  console.log('\n\n🔍 Propositions spécifiques pour Ossun...\n');
  
  const { data: ossunProps } = await supabase
    .from('propositions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (ossunProps) {
    const ossunFiltered = ossunProps.filter(p => {
      if (p.donnees_proposition?.commune) {
        return p.donnees_proposition.commune.toLowerCase().includes('ossun');
      }
      return false;
    });

    if (ossunFiltered.length > 0) {
      console.log(`📊 ${ossunFiltered.length} proposition(s) pour Ossun:\n`);
      
      for (const prop of ossunFiltered) {
        console.log(`\n${prop.statut === 'approuvee' ? '✅' : '⏳'} ${prop.donnees_proposition?.nom || 'Sans nom'}`);
        console.log(`   ID: ${prop.id}`);
        console.log(`   Statut: ${prop.statut}`);
        console.log(`   Créée: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
        console.log(`   Mise à jour: ${new Date(prop.updated_at).toLocaleString('fr-FR')}`);
      }
    } else {
      console.log('❌ Aucune proposition pour Ossun trouvée');
    }
  }
}

checkPropositions().catch(console.error);
