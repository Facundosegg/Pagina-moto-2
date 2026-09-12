import React, { useEffect, useState } from "react";
import { UserPlus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { createAdminUser, listAdminUsers, deleteAdminUser } from "./platformApi.js";

export default function AdminUsersManager({ clienteId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [justCreated, setJustCreated] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function reload() {
    setLoading(true);
    setListError("");
    try {
      const { usuarios } = await listAdminUsers({ clienteId });
      setUsuarios(usuarios);
    } catch (err) {
      setListError(err.message || "No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      setCreateError("Completá el email y una contraseña de al menos 6 caracteres.");
      return;
    }
    setCreating(true);
    setCreateError("");
    setJustCreated("");
    try {
      const created = await createAdminUser({ email: email.trim(), password, clienteId });
      setEmail("");
      setPassword("");
      setJustCreated(created.email);
      await reload();
    } catch (err) {
      setCreateError(err.message || "No se pudo crear el usuario.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(userId) {
    setDeletingId(userId);
    try {
      await deleteAdminUser({ userId });
      setConfirmDeleteId(null);
      await reload();
    } catch (err) {
      setListError(err.message || "No se pudo borrar el usuario.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Usuarios administradores</span>

      {loading ? (
        <p className="text-sm text-[#8B8D8F]">Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-sm text-[#8B8D8F]">Este cliente todavía no tiene ningún usuario administrador.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[#D8D2C0] border border-[#D8D2C0]">
          {usuarios.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="text-sm text-[#17171C] font-mono truncate">{u.email}</span>
              {confirmDeleteId === u.id ? (
                <span className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deletingId === u.id}
                    className="text-xs bg-[#C1440E] text-white px-2 py-1 disabled:opacity-50"
                  >
                    {deletingId === u.id ? "Borrando..." : "Confirmar"}
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-[#8B8D8F] px-2 py-1">
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(u.id)}
                  className="inline-flex items-center gap-1 text-xs text-[#8B8D8F] hover:text-[#C1440E] shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Quitar acceso
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {listError && <p className="text-xs text-[#C1440E]">{listError}</p>}

      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end pt-1">
        <label className="flex flex-col gap-1 flex-1 w-full">
          <span className="font-mono text-[9px] tracking-widest text-[#8B8D8F] uppercase">Email nuevo</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E]"
          />
        </label>
        <label className="flex flex-col gap-1 flex-1 w-full">
          <span className="font-mono text-[9px] tracking-widest text-[#8B8D8F] uppercase">Contraseña</span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 font-mono focus:outline-none focus:border-[#C1440E]"
          />
        </label>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-1.5 bg-[#17171C] text-white text-sm px-4 py-2 hover:bg-[#C1440E] transition-colors disabled:opacity-50 shrink-0"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Agregar usuario
        </button>
      </form>
      {createError && <p className="text-xs text-[#C1440E]">{createError}</p>}
      {justCreated && (
        <p className="text-xs text-[#17171C] inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" /> Usuario {justCreated} creado. Guardá la contraseña — no se
          puede volver a ver.
        </p>
      )}
    </div>
  );
}
