export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const target = url.searchParams.get('target');

  if (!target || !target.startsWith('https://api.pushover.net/1/webhooks/')) {
    return new Response('Invalid target', { status: 400 });
  }

  const payload = await request.json();

  if (payload.avatar_url) {
    try {
      const imgResponse = await fetch(payload.avatar_url);
      if (imgResponse.ok) {
        const buffer = await imgResponse.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        payload.avatar_base64 = btoa(binary);
      }
    } catch (_) {}
  }

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return new Response(null, { status: response.status });
};

export const config = { path: '/pushover-proxy' };
