const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

function getEnv(key, lines) {
  const ln = lines.find((l) => l.startsWith(key + '='));
  return ln ? ln.split('=').slice(1).join('=').trim() : null;
}

(async () => {
  try {
    const envPath = path.resolve('.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('.env.local not found');
      process.exit(1);
    }
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    const url = getEnv('NEXT_PUBLIC_SUPABASE_URL', lines);
    const key = getEnv('SUPABASE_SECRET_KEY', lines) || getEnv('SUPABASE_SERVICE_ROLE_KEY', lines);
    if (!url || !key) {
      console.error('Missing URL or service key in .env.local');
      process.exit(1);
    }

    // IDs already observed; we'll re-query to be safe
    const idsRes = await fetch(`${url.replace(/\/$/, '')}/rest/v1/etablissements?commune=ilike.*Ossun*&select=id`, {
      method: 'GET',
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }
    });
    if (!idsRes.ok) {
      const t = await idsRes.text();
      throw new Error(`Failed to fetch ids: ${idsRes.status} ${t}`);
    }
    const idsJson = await idsRes.json();
    const ids = idsJson.map(r => r.id);
    if (ids.length === 0) {
      console.log('Aucun id trouvé pour Ossun — rien à supprimer.');
      process.exit(0);
    }

    console.log('IDs à supprimer:', ids.join(', '));

    const tables = [
      'etablissement_proprietaires',
      'propositions',
      'reclamations',
      'medias',
      'logements'
    ];

    for (const table of tables) {
      const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${table}?etablissement_id=in.(${ids.join(',')})`;
      try {
        const r = await fetch(endpoint, {
          method: 'DELETE',
          headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }
        });
        const body = await r.text();
        if (r.ok) console.log(`Deleted from ${table}:`, body || 'OK');
        else console.warn(`Failed delete ${table}: ${r.status} ${body}`);
      } catch (err) {
        console.warn(`Error deleting from ${table}:`, err.message || err);
      }
    }

    // Finally delete etablissements by id
    const idsParam = ids.join(',');
    const delEtab = `${url.replace(/\/$/, '')}/rest/v1/etablissements?id=in.(${idsParam})`;
    const rE = await fetch(delEtab, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }
    });
    const be = await rE.text();
    if (rE.ok) console.log('Deleted etablissements:', be || 'OK');
    else console.warn('Failed delete etablissements:', rE.status, be);

    console.log('Opération terminée. Vérifier les suppressions via la console Supabase ou SELECTs.');
  } catch (err) {
    console.error('Erreur:', err.message || err);
    process.exit(1);
  }
})();
