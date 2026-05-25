import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const { blobs } = await list({ prefix: 'ws-' });
  const data = {};
  for (const blob of blobs) {
    try {
      const resp = await fetch(blob.url);
      const ip = blob.pathname.replace('ws-', '').replace(/-/g, '.');
      data[ip] = await resp.json();
    } catch {}
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Disposition', 'attachment; filename="backup.json"');
  return res.status(200).json(data);
}
