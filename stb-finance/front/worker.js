/**
 * stb-finance-front — Worker Cloudflare (front/worker.js)
 *
 * Stratégie de service des assets :
 *   1. GET /style.css  → sert depuis R2 (uploadé via wrangler deploy)
 *   2. GET /app.js     → sert depuis R2
 *   3. Tout le reste   → retourne index.html (SPA fallback)
 *
 * Upload initial des assets dans R2 :
 *   wrangler r2 object put YOUR_R2_BUCKET_NAME/style.css --file front/style.css --content-type text/css
 *   wrangler r2 object put YOUR_R2_BUCKET_NAME/app.js    --file front/app.js    --content-type text/javascript
 *   wrangler r2 object put YOUR_R2_BUCKET_NAME/index.html --file front/index.html --content-type text/html
 *
 * Alternative : utiliser Cloudflare Pages pour le front
 * (plus simple pour les assets statiques, mêmes bindings KV/R2).
 */

export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // Fichiers statiques servis depuis R2
    if (path === '/style.css') return servirR2(env, 'style.css', 'text/css');
    if (path === '/app.js')    return servirR2(env, 'app.js',    'application/javascript');
    if (path === '/favicon.ico') return new Response(null, { status: 204 });

    // SPA fallback — index.html pour toutes les autres routes
    return servirR2(env, 'index.html', 'text/html');
  }
};

/**
 * Lit un fichier depuis R2 et le retourne avec le bon Content-Type.
 * Cache-Control 1h pour les assets statiques, no-cache pour l'HTML.
 */
async function servirR2(env, cle, contentType) {
  const object = await env.R2_FINANCE.get(cle);

  if (!object) {
    return new Response(`Asset introuvable : ${cle}`, { status: 404 });
  }

  const isHtml = contentType === 'text/html';
  return new Response(object.body, {
    headers: {
      'Content-Type':  contentType + (isHtml ? '; charset=utf-8' : ''),
      'Cache-Control': isHtml ? 'no-cache, no-store' : 'public, max-age=3600'
    }
  });
}
