// Esta función reemplaza el index.html normal SOLO para la página de
// inicio ("/"). Hace dos cosas:
// 1. Busca los datos del cliente que corresponde al dominio (o a
//    ?cliente=slug, para poder probar antes de tener el dominio real).
// 2. Le pone su nombre, descripción y foto a las etiquetas que leen
//    WhatsApp, Facebook, etc. para armar la vista previa del link.
//
// El resto del sitio (React) sigue funcionando exactamente igual — acá
// no se toca nada del contenido visible, solo lo que va dentro de <head>.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function buscarCliente(host, slugOverride) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const filtro = slugOverride ? `slug=eq.${encodeURIComponent(slugOverride)}` : `dominio=eq.${encodeURIComponent(host)}`;
  const url = `${supabaseUrl}/rest/v1/clientes?${filtro}&select=nombre_negocio,tagline,hero_subtitulo,cover_url,logo_url`;

  try {
    const r = await fetch(url, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const host = req.headers.host || "";
  const slugOverride = typeof req.query?.cliente === "string" ? req.query.cliente : null;

  // Traemos el HTML real que generó el build (con los nombres de
  // archivo correctos, que cambian en cada publicación) y le metemos
  // las etiquetas encima — así nunca hay que mantener esto a mano.
  let html;
  try {
    const htmlRes = await fetch(`https://${host}/index.html`);
    html = await htmlRes.text();
  } catch {
    html = null;
  }

  if (!html) {
    // Si por lo que sea no se pudo traer el HTML real, mandamos al
    // visitante directo al archivo estático de siempre, para que el
    // sitio nunca se rompa por esto.
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send('<meta http-equiv="refresh" content="0;url=/index.html" />');
  }

  const cliente = await buscarCliente(host, slugOverride);

  const titulo = cliente ? `${cliente.nombre_negocio} — Motos 0km y usadas` : "Motos 0km y usadas";
  const descripcion = cliente?.tagline || cliente?.hero_subtitulo || "Catálogo de motos 0km y usadas. Consultá por WhatsApp.";
  const imagen = cliente?.cover_url || cliente?.logo_url || "";
  const urlActual = `https://${host}/`;

  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(titulo)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(descripcion)}" />`);

  const ogTags = [
    `<meta property="og:title" content="${escapeHtml(titulo)}" />`,
    `<meta property="og:description" content="${escapeHtml(descripcion)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escapeHtml(urlActual)}" />`,
    imagen ? `<meta property="og:image" content="${escapeHtml(imagen)}" />` : "",
    `<meta name="twitter:card" content="${imagen ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(titulo)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(descripcion)}" />`,
    imagen ? `<meta name="twitter:image" content="${escapeHtml(imagen)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  html = html.replace("</head>", `    ${ogTags}\n  </head>`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Se cachea 5 minutos por URL — así no se recalcula en cada visita,
  // pero tampoco queda pegado por días si cambiás algo.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  return res.status(200).send(html);
}
