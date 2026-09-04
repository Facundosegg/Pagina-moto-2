import { supabase } from "./supabaseClient.js";

async function callFunction(path, body) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.error || "Ocurrió un error.");
  return result;
}

export function createAdminUser({ email, password, clienteId }) {
  return callFunction("/api/create-admin-user", { email, password, clienteId });
}

export function connectDomain({ domain }) {
  return callFunction("/api/add-domain", { domain });
}
