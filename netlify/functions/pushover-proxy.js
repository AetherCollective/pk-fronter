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
        const blob = new Blob([buffer]);
        const bitmap = await createImageBitmap(blob);

        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        const jpegBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
        const jpegBuffer = await jpegBlob.arrayBuffer();
        const bytes = new Uint8Array(jpegBuffer);
        payload.avatar_base64 = btoa(String.fromCharCode(...bytes));
        payload.avatar_base64_type = 'image/jpeg';
      } else {
        console.error('Avatar fetch failed:', imgResponse.status);
      }
    } catch (e) {
      console.error('Avatar conversion error:', e.message);
    }
  }

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return new Response(null, { status: response.status });
};

export const config = { path: '/pushover-proxy' };
