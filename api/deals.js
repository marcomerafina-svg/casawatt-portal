// Generic HubSpot proxy — accepts { path, body } and forwards to api.hubapi.com
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { path, body } = req.body || {};

  // Back-compat: old frontend sent the search body directly
  const targetPath = path || '/crm/v3/objects/deals/search';
  const targetBody = path ? (body || {}) : req.body;

  if (!targetPath.startsWith('/crm/')) {
    return res.status(400).json({ error: 'invalid path' });
  }

  const TOKEN = process.env.HUBSPOT_TOKEN;

  const response = await fetch(`https://api.hubapi.com${targetPath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(targetBody)
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
