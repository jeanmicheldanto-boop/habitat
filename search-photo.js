#!/usr/bin/env node

/**
 * Recherche exhaustive de fichiers dans le bucket etablissements
 * Pour trouver la photo de 4,6 Mo uploadée
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function searchPhoto() {
  console.log('🔍 Recherche de la photo de 4,6 Mo dans le bucket etablissements\n');
  console.log('━'.repeat(80));
  
  // 1. Lister tous les dossiers/fichiers à la racine
  console.log('\n1️⃣ Listing de la racine du bucket');
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from('etablissements')
    .list('', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    });
  
  if (rootError) {
    console.error('❌ Erreur:', rootError);
    return;
  }
  
  console.log(`   Trouvé ${rootFiles.length} éléments à la racine`);
  
  // Fichiers récents (dernières 24h au 30/12/2025)
  const targetDate = new Date('2025-12-30');
  const recentFiles = [];
  
  for (const item of rootFiles) {
    const itemDate = new Date(item.created_at);
    const isSameDay = 
      itemDate.getFullYear() === targetDate.getFullYear() &&
      itemDate.getMonth() === targetDate.getMonth() &&
      itemDate.getDate() === targetDate.getDate();
    
    if (isSameDay || item.metadata?.size > 4000000) { // > 4 Mo
      recentFiles.push(item);
      
      // Si c'est un dossier, lister son contenu
      if (item.id === null) { // null = dossier
        console.log(`\n   📁 Dossier: ${item.name} (créé le ${itemDate.toLocaleString()})`);
        
        const { data: folderFiles } = await supabase.storage
          .from('etablissements')
          .list(item.name);
        
        if (folderFiles && folderFiles.length > 0) {
          console.log(`      Contenu (${folderFiles.length} fichier(s)):`);
          folderFiles.forEach(f => {
            const sizeInMB = f.metadata?.size ? (f.metadata.size / 1024 / 1024).toFixed(2) : '?';
            console.log(`      - ${f.name} (${sizeInMB} Mo)`);
            
            if (f.metadata?.size > 4000000 && f.metadata?.size < 5000000) {
              console.log(`        ⭐ POSSIBLE MATCH: ~4.6 Mo`);
            }
          });
        }
      } else {
        // Fichier direct
        const sizeInMB = item.metadata?.size ? (item.metadata.size / 1024 / 1024).toFixed(2) : '?';
        console.log(`   📄 ${item.name} (${sizeInMB} Mo) - ${itemDate.toLocaleString()}`);
      }
    }
  }
  
  // 2. Recherche spécifique dans les IDs connus
  console.log('\n2️⃣ Recherche dans les IDs spécifiques');
  
  const idsToCheck = [
    '8693e765-7aaa-4def-84f1-04d88c9c6eb6', // temp_id du payload
    '210b9b5e-6444-4381-9edc-b76d2b3fe932', // etab_id final
  ];
  
  for (const id of idsToCheck) {
    const { data: files } = await supabase.storage
      .from('etablissements')
      .list(id);
    
    if (files && files.length > 0) {
      console.log(`   ✅ Fichiers trouvés dans ${id}:`);
      files.forEach(f => {
        const sizeInMB = f.metadata?.size ? (f.metadata.size / 1024 / 1024).toFixed(2) : '?';
        console.log(`      - ${f.name} (${sizeInMB} Mo)`);
      });
    } else {
      console.log(`   ❌ Aucun fichier dans ${id}`);
    }
  }
  
  // 3. Résumé
  console.log('\n3️⃣ Résumé');
  console.log(`   Total d'éléments récents: ${recentFiles.length}`);
  
  const largeFiles = recentFiles.filter(f => 
    f.metadata?.size && f.metadata.size > 4000000 && f.metadata.size < 5000000
  );
  
  if (largeFiles.length > 0) {
    console.log(`\n   ⭐ Fichiers de ~4.6 Mo trouvés:`);
    largeFiles.forEach(f => {
      const sizeInMB = (f.metadata.size / 1024 / 1024).toFixed(2);
      console.log(`      - ${f.name}: ${sizeInMB} Mo`);
    });
  } else {
    console.log('\n   ℹ️ Aucun fichier de ~4.6 Mo trouvé');
    console.log('   Possibilités:');
    console.log('      1. L\'upload a échoué silencieusement');
    console.log('      2. Le fichier a été uploadé ailleurs');
    console.log('      3. Le fichier a été supprimé');
  }
  
  console.log('\n' + '━'.repeat(80) + '\n');
}

searchPhoto().catch(console.error);
