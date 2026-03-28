export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const target = url.searchParams.get('target');

  if (!target || !target.startsWith('https://api.pushover.net/1/webhooks/')) {
    return new Response('Invalid target', { status: 400 });
  }

  const body = await request.text();

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  return new Response(null, { status: response.status });
};

export const config = { path: '/pushover-proxy' };
