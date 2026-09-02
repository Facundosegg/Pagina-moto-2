import React, { useState } from "react";
import { PackagePlus, X, Plus, Save, Pencil, Trash2, LogOut } from "lucide-react";
import FieldSelect from "./FieldSelect.jsx";
import TextInput from "./TextInput.jsx";
import PhotoUpload from "./PhotoUpload.jsx";
import { MARCAS } from "./data.js";
import { formatMoney } from "./format.js";
import { insertMoto, updateMotoById, deleteMotoById } from "./motosApi.js";

function blankMotoForm() {
  return {
    marca: MARCAS[0],
    modelo: "",
    anio: String(new Date().getFullYear()),
    estado: "usado",
    cc: "",
    km: "",
    precio: "",
    moneda: "ARS",
    destacado: "NINGUNO",
    fotos: [],
  };
}

export default function CatalogAdminPanel({ motos, setMotos, clienteId, onClose, onLogout, adminEmail }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankMotoForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  function startEdit(moto) {
    setEditingId(moto.id);
    setForm({
      marca: moto.marca,
      modelo: moto.modelo,
      anio: String(moto.anio ?? ""),
      estado: moto.estado,
      cc: String(moto.cc ?? ""),
      km: String(moto.km ?? ""),
      precio: String(moto.precio ?? ""),
      moneda: moto.moneda,
      destacado: moto.destacado ?? "NINGUNO",
      fotos: moto.fotos && moto.fotos.length > 0 ? moto.fotos : moto.image_url ? [moto.image_url] : [],
    });
    setError("");
  }

  function startNew() {
    setEditingId(null);
    setForm(blankMotoForm());
    setError("");
  }

  function buildPayload() {
    if (!form.modelo.trim()) {
      setError("Ponele un modelo a la moto.");
      return null;
    }
    if (!form.precio || Number.isNaN(Number(form.precio))) {
      setError("El precio tiene que ser un número.");
      return null;
    }
    return {
      marca: form.marca,
      modelo: form.modelo.trim(),
      anio: form.anio ? Number(form.anio) : null,
      estado: form.estado,
      cc: form.cc ? Number(form.cc) : 0,
      km: form.estado === "0km" ? 0 : form.km ? Number(form.km) : 0,
      precio: Number(form.precio),
      moneda: form.moneda,
      destacado: form.destacado === "NINGUNO" ? null : form.destacado,
      fotos: form.fotos,
      image_url: form.fotos[0] || "",
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = buildPayload();
    if (!payload) return;
    setSaving(true);
    setError("");
    try {
      if (editingId != null) {
        await updateMotoById(editingId, payload);
        setMotos((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m)));
      } else {
        const created = await insertMoto(payload, clienteId);
        setMotos((prev) => [created, ...prev]);
      }
      startNew();
    } catch (err) {
      setError(err.message || "No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMotoById(id);
      setMotos((prev) => prev.filter((m) => m.id !== id));
      setConfirmDeleteId(null);
      if (editingId === id) startNew();
    } catch (err) {
      setError(err.message || "No se pudo borrar. Probá de nuevo.");
    }
  }

  const sorted = [...motos].sort((a, b) => b.id - a.id);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-[var(--c-paper)] w-full max-w-3xl my-8">
        <div className="bg-[var(--c-dark)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-[var(--c-signal)]" />
            <div>
              <h3 className="font-display text-xl uppercase tracking-wide text-[var(--c-paper2)] leading-tight">Cargar motos</h3>
              {adminEmail && <p className="font-mono text-[10px] text-[#8B8D8F]">{adminEmail}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogout} className="text-[#B9B6AC] hover:text-[var(--c-signal)] flex items-center gap-1 text-xs" title="Cerrar sesión">
              <LogOut className="w-4 h-4" /> Salir
            </button>
            <button onClick={onClose} className="text-[#B9B6AC] hover:text-[var(--c-paper2)]" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 border-b border-[#D8D2C0]">
            <p className="text-sm text-[#5B5852]">
              {editingId != null ? "Editando una unidad del catálogo." : "Cargá una unidad nueva. Se suma arriba de todo del catálogo y ya se ve en el sitio para cualquiera que entre."}
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <FieldSelect label="Marca" value={form.marca} onChange={set("marca")} options={MARCAS.map((m) => ({ value: m, label: m }))} />
              <TextInput label="Modelo" required value={form.modelo} onChange={set("modelo")} placeholder="WAVE 110" />
              <TextInput label="Año" value={form.anio} onChange={set("anio")} placeholder="2024" />
              <FieldSelect
                label="Estado"
                value={form.estado}
                onChange={(v) => setForm((f) => ({ ...f, estado: v, km: v === "0km" ? "0" : f.km }))}
                options={[{ value: "0km", label: "0km" }, { value: "usado", label: "Usada" }]}
              />
              <TextInput label="Cilindrada (cc)" value={form.cc} onChange={set("cc")} placeholder="150" />
              <TextInput label="Kilómetros" value={form.km} onChange={set("km")} placeholder="0" />
              <TextInput label="Precio" required value={form.precio} onChange={set("precio")} placeholder="2600000" />
              <FieldSelect label="Moneda" value={form.moneda} onChange={set("moneda")} options={[{ value: "ARS", label: "ARS" }, { value: "USD", label: "USD" }]} />
              <FieldSelect
                label="Etiqueta"
                value={form.destacado}
                onChange={set("destacado")}
                options={[{ value: "NINGUNO", label: "Ninguna" }, { value: "0KM", label: "0KM" }, { value: "RESERVADA", label: "Reservada" }]}
              />
            </div>
            <PhotoUpload value={form.fotos} onChange={(fotos) => setForm((f) => ({ ...f, fotos }))} />
            {error && <p className="text-sm text-[var(--c-rust)]">{error}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[var(--c-signal)] text-[var(--c-dark)] font-medium px-5 py-2.5 hover:bg-[var(--c-ink)] hover:text-[var(--c-paper2)] transition-colors disabled:opacity-50"
              >
                {editingId != null ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {saving ? "Guardando..." : editingId != null ? "Guardar cambios" : "Agregar moto"}
              </button>
              {editingId != null && (
                <button type="button" onClick={startNew} className="text-sm text-[#8B8D8F] hover:text-[var(--c-ink)]">
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <div className="p-5">
            <p className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase mb-3">
              Catálogo actual · {motos.length} unidades
            </p>
            {sorted.length === 0 ? (
              <p className="text-sm text-[#8B8D8F]">Todavía no cargaste ninguna moto.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[#D8D2C0]">
                {sorted.map((m) => (
                  <li key={m.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--c-ink)] truncate">
                        <span className="font-mono text-[#8B8D8F]">{m.marca}</span> {m.modelo}{" "}
                        <span className="text-[#8B8D8F]">· {m.anio || "S/D"}</span>
                      </p>
                      <p className="font-mono text-xs text-[#5B5852]">{formatMoney(m.precio, m.moneda)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(m)} className="p-2 text-[#8B8D8F] hover:text-[var(--c-ink)]" aria-label={`Editar ${m.modelo}`} title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === m.id ? (
                        <>
                          <button onClick={() => handleDelete(m.id)} className="text-xs bg-[var(--c-rust)] text-[var(--c-paper2)] px-2 py-1">
                            Confirmar
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-[#8B8D8F] px-2 py-1">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(m.id)} className="p-2 text-[#8B8D8F] hover:text-[var(--c-rust)]" aria-label={`Eliminar ${m.modelo}`} title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
