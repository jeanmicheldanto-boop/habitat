const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

(async () => {
  try {
    const envPath = path.resolve('.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('.env.local not found in repo root');
      process.exit(1);
    }
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    const get = (k) => {
      const ln = lines.find((l) => l.startsWith(k + '='));
      return ln ? ln.split('=').slice(1).join('=').trim() : null;
    };

    const url = get('NEXT_PUBLIC_SUPABASE_URL');
    const key = get('SUPABASE_SECRET_KEY') || get('SUPABASE_SERVICE_ROLE_KEY') || get('SUPABASE_ANON_KEY');
    if (!url || !key) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local');
      process.exit(1);
    }

    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/etablissements?commune=ilike.*Ossun*`;
    console.log('Querying', endpoint);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Request failed', res.status, txt);
      process.exit(1);
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      console.log('Aucun établissement trouvé pour Ossun.');
      process.exit(0);
    }

    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erreur:', err.message || err);
    process.exit(1);
  }
})();
