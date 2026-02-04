/**
 * Script pour exporter la liste des emails avec plusieurs établissements
 * Usage: node list-duplicate-emails.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listDuplicates() {
  console.log('\n🔍 Extraction des emails avec plusieurs établissements...\n');

  try {
    // Récupérer tous les établissements avec email
    const { data: etabs, error } = await supabase
      .from('etablissements')
      .select('id, nom, email, commune, departement')
      .not('email', 'is', null)
      .neq('email', '');

    if (error) throw error;

    // Grouper par email
    const emailMap = new Map();
    
    etabs.forEach(etab => {
      const email = etab.email.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email).push(etab);
    });

    // Filtrer les doublons
    const duplicates = Array.from(emailMap.entries())
      .filter(([email, etabs]) => etabs.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    console.log(`📊 ${duplicates.length} emails avec plusieurs établissements trouvés\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    let output = `LISTE DES EMAILS AVEC PLUSIEURS ÉTABLISSEMENTS\n`;
    output += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
    output += `Total: ${duplicates.length} emails\n`;
    output += `═════════════════════════════════════════════════════════════\n\n`;

    duplicates.forEach(([email, etabs], index) => {
      const line = `${index + 1}. ${email} (${etabs.length} établissements)`;
      console.log(line);
      output += line + '\n';
      
      etabs.forEach(etab => {
        const detail = `   - ${etab.nom}${etab.commune ? ` (${etab.commune})` : ''}${etab.departement ? ` - ${etab.departement}` : ''}`;
        console.log(detail);
        output += detail + '\n';
      });
      
      console.log('');
      output += '\n';
    });

    // Sauvegarder dans un fichier
    fs.writeFileSync('emails-dupliques.txt', output, 'utf8');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Liste sauvegardée dans: emails-dupliques.txt`);
    console.log(`📊 Total: ${duplicates.length} emails avec plusieurs établissements`);
    
    const totalEtabs = duplicates.reduce((sum, [_, etabs]) => sum + etabs.length, 0);
    const economie = totalEtabs - duplicates.length;
    console.log(`💾 Économie d'emails si déduplication: ${economie}`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

listDuplicates();
