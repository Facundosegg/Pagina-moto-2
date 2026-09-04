import React, { useEffect, useState } from "react";
import { LogOut, Plus, Pencil, Trash2, ArrowLeft, Save, Copy, Check, ExternalLink } from "lucide-react";
import { listClientes, insertCliente, updateClienteById, deleteClienteById } from "./superadminApi.js";
import ColorField from "./ColorField.jsx";
import SingleImageUpload from "./SingleImageUpload.jsx";
import TextInput from "./TextInput.jsx";

function blankForm() {
  return {
    slug: "",
    dominio: "",
    nombre_negocio: "",
    tagline: "",
    hero_titulo: "",
    hero_subtitulo: "",
    whatsapp_number: "",
    phone_display: "",
    address: "",
    hours: "",
    instagram: "",
    facebook: "",
    maps_url: "",
    color_signal: "#F5B700",
    color_dark: "#15151A",
    color_paper: "#EDE8DC",
    color_rust: "#C1440E",
    color_paper2: "#F4F0E6",
    color_ink: "#17171C",
    logo_url: "",
    cover_url: "",
  };
}

function CopyableBlock({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="bg-black text-[#F5B700] text-xs p-3 pr-10 overflow-x-auto font-mono whitespace-pre-wrap">{text}</pre>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-2 right-2 text-[#8B8D8F] hover:text-white"
        title="Copiar"
      >
        {copied ? <Check className="w-4 h-4 text-[#F5B700]" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function SuperAdminPanel({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("lista"); // "lista" | "editar" | "nuevo"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [nuevoCreado, setNuevoCreado] = useState(null); // cliente recién creado, para mostrar instrucciones

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function reload() {
    setLoading(true);
    try {
      setClientes(await listClientes());
    } catch (err) {
      setError(err.message || "No se pudo cargar la lista de clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  function startNew() {
    setForm(blankForm());
    setEditingId(null);
    setError("");
    setNuevoCreado(null);
    setView("nuevo");
  }

  function startEdit(cliente) {
    setForm({
      slug: cliente.slug || "",
      dominio: cliente.dominio || "",
      nombre_negocio: cliente.nombre_negocio || "",
      tagline: cliente.tagline || "",
      hero_titulo: cliente.hero_titulo || "",
      hero_subtitulo: cliente.hero_subtitulo || "",
      whatsapp_number: cliente.whatsapp_number || "",
      phone_display: cliente.phone_display || "",
      address: cliente.address || "",
      hours: cliente.hours || "",
      instagram: cliente.instagram || "",
      facebook: cliente.facebook || "",
      maps_url: cliente.maps_url || "",
      color_signal: cliente.color_signal || "#F5B700",
      color_dark: cliente.color_dark || "#15151A",
      color_paper: cliente.color_paper || "#EDE8DC",
      color_rust: cliente.color_rust || "#C1440E",
      color_paper2: cliente.color_paper2 || "#F4F0E6",
      color_ink: cliente.color_ink || "#17171C",
      logo_url: cliente.logo_url || "",
      cover_url: cliente.cover_url || "",
    });
    setEditingId(cliente.id);
    setError("");
    setView("editar");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.slug.trim() || !form.nombre_negocio.trim()) {
      setError("Completá al menos el identificador (slug) y el nombre del negocio.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (view === "nuevo") {
        const created = await insertCliente(form);
        await reload();
        setNuevoCreado(created);
      } else {
        await updateClienteById(editingId, form);
        await reload();
        setView("lista");
      }
    } catch (err) {
      setError(err.message || "No se pudo guardar. Revisá que el slug y el dominio no estén repetidos.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteClienteById(id);
      setConfirmDeleteId(null);
      await reload();
    } catch (err) {
      setError(err.message || "No se pudo borrar.");
    }
  }

  const FormFields = (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Identificador (slug)" required value={form.slug} onChange={set("slug")} placeholder="motos-juan" />
        <TextInput label="Dominio" value={form.dominio} onChange={set("dominio")} placeholder="motosjuan.vercel.app" />
        <TextInput label="Nombre del negocio" required value={form.nombre_negocio} onChange={set("nombre_negocio")} />
        <TextInput label="Frase corta (tagline)" value={form.tagline} onChange={set("tagline")} />
        <TextInput label="WhatsApp" value={form.whatsapp_number} onChange={set("whatsapp_number")} placeholder="5493794000000" />
        <TextInput label="Teléfono para mostrar" value={form.phone_display} onChange={set("phone_display")} />
        <TextInput label="Dirección" value={form.address} onChange={set("address")} />
        <TextInput label="Horario" value={form.hours} onChange={set("hours")} />
        <TextInput label="Instagram (link)" value={form.instagram} onChange={set("instagram")} />
        <TextInput label="Facebook (link)" value={form.facebook} onChange={set("facebook")} />
        <TextInput label="Google Maps (link)" value={form.maps_url} onChange={set("maps_url")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
            Título grande de portada
          </span>
          <textarea
            value={form.hero_titulo}
            onChange={(e) => set("hero_titulo")(e.target.value)}
            rows={2}
            placeholder={"La ruta\nes tuya"}
            className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E] resize-none"
          />
          <span className="text-xs text-[#8B8D8F]">Apretá Enter para el salto de línea (se ve grande, en dos renglones).</span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
            Frase debajo del título
          </span>
          <textarea
            value={form.hero_subtitulo}
            onChange={(e) => set("hero_subtitulo")(e.target.value)}
            rows={2}
            className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E] resize-none"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ColorField label="Color principal / botones" value={form.color_signal} onChange={set("color_signal")} />
        <ColorField label="Fondo oscuro" value={form.color_dark} onChange={set("color_dark")} />
        <ColorField label="Fondo claro" value={form.color_paper} onChange={set("color_paper")} />
        <ColorField label="Color secundario / hover" value={form.color_rust} onChange={set("color_rust")} />
        <ColorField label="Tarjetas" value={form.color_paper2} onChange={set("color_paper2")} />
        <ColorField label="Texto oscuro" value={form.color_ink} onChange={set("color_ink")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <SingleImageUpload label="Logo" value={form.logo_url} onChange={set("logo_url")} hint="Si no cargás uno, se ve el ícono de moto." />
        <SingleImageUpload
          label="Foto de portada"
          value={form.cover_url}
          onChange={set("cover_url")}
          hint="Foto ancha de fondo en la sección de arriba de todo."
        />
      </div>
    </>
  );

  if (view === "nuevo" && nuevoCreado) {
    const sql = `update auth.users\nset raw_user_meta_data = raw_user_meta_data || jsonb_build_object('cliente_id', '${nuevoCreado.id}')\nwhere email = 'EMAIL-DEL-ADMIN-DE-ESTE-CLIENTE';`;
    return (
      <div className="min-h-screen bg-[#0E0E12] p-4 sm:p-8">
        <div className="max-w-2xl mx-auto bg-[#EDE8DC] p-6 flex flex-col gap-4">
          <h2 className="font-display text-2xl uppercase tracking-wide text-[#17171C]">¡Cliente creado!</h2>
          <p className="text-sm text-[#5B5852]">
            <strong>{nuevoCreado.nombre_negocio}</strong> ya está en la base de datos. Falta un último paso, a mano,
            en Supabase, para que su usuario administrador pueda entrar a cargar motos — es por seguridad, no se
            puede hacer desde acá.
          </p>
          <ol className="text-sm text-[#5B5852] list-decimal list-inside flex flex-col gap-1">
            <li>
              En Supabase: <span className="font-mono">Authentication → Users → Add user → Create new user</span>{" "}
              (con "Auto Confirm User" marcado). Usá el email y contraseña que le vayas a dar a este cliente.
            </li>
            <li>
              Después, <span className="font-mono">SQL Editor → New query</span>, pegá esto (reemplazando el email)
              y tocá Run:
            </li>
          </ol>
          <CopyableBlock text={sql} />
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setNuevoCreado(null);
                setView("lista");
              }}
              className="bg-[#17171C] text-white px-4 py-2 text-sm hover:bg-[#C1440E] transition-colors"
            >
              Volver a la lista
            </button>
            {nuevoCreado.dominio && (
              <a
                href={`https://${nuevoCreado.dominio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#5B5852] hover:text-[#C1440E]"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Ver su sitio
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "nuevo" || view === "editar") {
    return (
      <div className="min-h-screen bg-[#0E0E12] p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-[#EDE8DC] p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setView("lista")} className="inline-flex items-center gap-1.5 text-sm text-[#5B5852] hover:text-[#17171C]">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h2 className="font-display text-xl uppercase tracking-wide text-[#17171C]">
              {view === "nuevo" ? "Nuevo cliente" : "Editar cliente"}
            </h2>
          </div>

          {FormFields}

          {error && <p className="text-sm text-[#C1440E]">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="self-start inline-flex items-center gap-2 bg-[#F5B700] text-[#15151A] font-medium px-5 py-2.5 hover:bg-[#17171C] hover:text-white transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E12] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl uppercase tracking-wide text-white">Clientes de la plataforma</h1>
          <div className="flex items-center gap-3">
            <button onClick={startNew} className="inline-flex items-center gap-1.5 bg-[#F5B700] text-[#15151A] text-sm font-medium px-4 py-2 hover:bg-white transition-colors">
              <Plus className="w-4 h-4" /> Nuevo cliente
            </button>
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 text-sm text-[#8B8D8F] hover:text-white">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[#C1440E]">{error}</p>}

        {loading ? (
          <p className="text-sm text-[#8B8D8F]">Cargando...</p>
        ) : clientes.length === 0 ? (
          <p className="text-sm text-[#8B8D8F]">Todavía no hay clientes cargados.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {clientes.map((c) => (
              <div key={c.id} className="bg-[#EDE8DC] p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-lg uppercase tracking-wide text-[#17171C] truncate">{c.nombre_negocio}</p>
                    <p className="text-xs text-[#8B8D8F] font-mono truncate">{c.dominio || "sin dominio todavía"}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0 pt-1">
                    {[c.color_signal, c.color_dark, c.color_rust].map((col, i) => (
                      <span key={i} className="w-4 h-4 border border-black/10" style={{ backgroundColor: col }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="inline-flex items-center gap-1.5 bg-[#17171C] text-white text-xs px-3 py-1.5 hover:bg-[#C1440E] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  {confirmDeleteId === c.id ? (
                    <>
                      <button onClick={() => handleDelete(c.id)} className="text-xs bg-[#C1440E] text-white px-2 py-1.5">
                        Confirmar
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-[#8B8D8F] px-2 py-1.5">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(c.id)}
                      className="inline-flex items-center gap-1 text-xs text-[#8B8D8F] hover:text-[#C1440E] px-2 py-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Borrar
                    </button>
                  )}
                  {c.dominio && (
                    <a
                      href={`https://${c.dominio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-[#8B8D8F] hover:text-[#17171C]"
                      title="Ver su sitio"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
