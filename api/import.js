import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { blobs: old } = await list({ prefix: 'ws-' });
  for (const b of old) await del(b.url);

  const data = req.body;
  for (const [ip, ws] of Object.entries(data)) {
    const key = `ws-${ip.replace(/[.:]/g, '-')}`;
    await put(key, JSON.stringify(ws), { contentType: 'application/json' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ ok: true });
}
