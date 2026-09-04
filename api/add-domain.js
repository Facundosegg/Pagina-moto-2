import { verifySuperAdmin } from "./_lib/verifySuperAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const caller = await verifySuperAdmin(req);
  if (!caller) {
    return res.status(403).json({ error: "No autorizado" });
  }

  const { domain } = req.body || {};
  if (!domain) {
    return res.status(400).json({ error: "Falta el dominio." });
  }

  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  const token = process.env.VERCEL_API_TOKEN;

  if (!projectId || !token) {
    return res.status(500).json({ error: "Falta configurar VERCEL_PROJECT_ID o VERCEL_API_TOKEN en el servidor." });
  }

  try {
    const url = new URL(`https://api.vercel.com/v10/projects/${projectId}/domains`);
    if (teamId) url.searchParams.set("teamId", teamId);

    const vercelRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    });

    const result = await vercelRes.json();

    if (!vercelRes.ok) {
      return res.status(vercelRes.status).json({ error: result.error?.message || "No se pudo conectar el dominio." });
    }

    return res.status(200).json({
      domain: result.name,
      verified: Boolean(result.verified),
      verification: result.verification || null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error inesperado conectando el dominio." });
  }
}
