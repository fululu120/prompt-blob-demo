import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown';
  const key = `ws-${ip.replace(/[.:]/g, '-')}`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: key });
      if (blobs.length > 0) {
        const resp = await fetch(blobs[0].url);
        if (!resp.ok) throw new Error('fetch failed');
        return res.status(200).json(await resp.json());
      }
    } catch (e) {
      return res.status(200).json({ error: 'read', detail: e.message });
    }
    return res.status(200).json({ prompts: [], totalCopyCount: 0 });
  }

  if (req.method === 'POST') {
    try {
      const { blobs: old } = await list({ prefix: key });
      for (const b of old) await del(b.url);

      const { url } = await put(key, JSON.stringify({
        prompts: req.body.prompts || [],
        totalCopyCount: req.body.totalCopyCount || 0
      }), { access: 'public', contentType: 'application/json' });

      return res.status(200).json({ ok: true, url });
    } catch (e) {
      return res.status(500).json({ error: 'write', detail: e.message });
    }
  }

  return res.status(405).end();
}
