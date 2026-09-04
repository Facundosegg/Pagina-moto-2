import React, { useEffect, useState } from "react";
import { LogOut, Plus, Pencil, Trash2, ArrowLeft, Save, ExternalLink, Link2, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { listClientes, insertCliente, updateClienteById, deleteClienteById } from "./superadminApi.js";
import { createAdminUser, connectDomain } from "./platformApi.js";
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

export default function SuperAdminPanel({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("lista"); // "lista" | "editar" | "nuevo"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [nuevoCreado, setNuevoCreado] = useState(null); // cliente recién creado, para el paso de crear su admin

  const [domainStatus, setDomainStatus] = useState(null); // null | "loading" | "ok" | "error"
  const [domainMessage, setDomainMessage] = useState("");
  const [domainVerification, setDomainVerification] = useState(null);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userError, setUserError] = useState("");
  const [userCreated, setUserCreated] = useState(null);

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
    setDomainStatus(null);
    setDomainMessage("");
    setDomainVerification(null);
    setAdminEmail("");
    setAdminPassword("");
    setUserCreated(null);
    setUserError("");
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
    setDomainStatus(null);
    setDomainMessage("");
    setDomainVerification(null);
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

  async function handleConnectDomain() {
    if (!form.dominio.trim()) return;
    setDomainStatus("loading");
    setDomainMessage("");
    setDomainVerification(null);
    try {
      const result = await connectDomain({ domain: form.dominio.trim() });
      setDomainStatus("ok");
      setDomainVerification(result.verification);
      setDomainMessage(
        result.verified
          ? "Dominio conectado y verificado. Ya debería funcionar."
          : "Dominio agregado al proyecto. Como es un dominio propio, todavía falta cargar estos registros DNS donde lo compraste:"
      );
    } catch (err) {
      setDomainStatus("error");
      setDomainMessage(err.message || "No se pudo conectar el dominio.");
    }
  }

  async function handleCreateAdminUser(e) {
    e.preventDefault();
    if (!adminEmail.trim() || adminPassword.length < 6) {
      setUserError("Completá el email y una contraseña de al menos 6 caracteres.");
      return;
    }
    setCreatingUser(true);
    setUserError("");
    try {
      const created = await createAdminUser({ email: adminEmail.trim(), password: adminPassword, clienteId: nuevoCreado.id });
      setUserCreated(created);
    } catch (err) {
      setUserError(err.message || "No se pudo crear el usuario.");
    } finally {
      setCreatingUser(false);
    }
  }

  const FormFields = (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Identificador (slug)" required value={form.slug} onChange={set("slug")} placeholder="motos-juan" />
        <div className="flex flex-col gap-1">
          <TextInput label="Dominio" value={form.dominio} onChange={set("dominio")} placeholder="motosjuan.vercel.app" />
          <button
            type="button"
            onClick={handleConnectDomain}
            disabled={!form.dominio.trim() || domainStatus === "loading"}
            className="self-start inline-flex items-center gap-1.5 text-xs bg-[#17171C] text-white px-3 py-1.5 hover:bg-[#C1440E] transition-colors disabled:opacity-50"
          >
            {domainStatus === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            Conectar este dominio en Vercel
          </button>
          {domainMessage && (
            <p className={`text-xs ${domainStatus === "error" ? "text-[#C1440E]" : "text-[#5B5852]"}`}>{domainMessage}</p>
          )}
          {domainVerification && (
            <pre className="bg-black text-[#F5B700] text-[10px] p-2 overflow-x-auto font-mono whitespace-pre-wrap">
              {JSON.stringify(domainVerification, null, 2)}
            </pre>
          )}
        </div>
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
    return (
      <div className="min-h-screen bg-[#0E0E12] p-4 sm:p-8">
        <div className="max-w-md mx-auto bg-[#EDE8DC] p-6 flex flex-col gap-4">
          <h2 className="font-display text-2xl uppercase tracking-wide text-[#17171C]">¡Cliente creado!</h2>
          <p className="text-sm text-[#5B5852]">
            <strong>{nuevoCreado.nombre_negocio}</strong> ya está en la base de datos. Ahora creale su usuario
            administrador, para que pueda entrar a cargar motos.
          </p>

          {userCreated ? (
            <div className="flex flex-col gap-3">
              <p className="inline-flex items-center gap-2 text-sm text-[#17171C]">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" /> Usuario creado: <span className="font-mono">{userCreated.email}</span>
              </p>
              <p className="text-xs text-[#8B8D8F]">
                Guardá la contraseña que pusiste — no se puede volver a ver desde acá. Pasásela a tu cliente por un
                medio seguro.
              </p>
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
          ) : (
            <form onSubmit={handleCreateAdminUser} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Email del administrador</span>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Contraseña</span>
                <input
                  type="text"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 font-mono focus:outline-none focus:border-[#C1440E]"
                />
              </label>
              {userError && <p className="text-sm text-[#C1440E]">{userError}</p>}
              <button
                type="submit"
                disabled={creatingUser}
                className="self-start inline-flex items-center gap-2 bg-[#F5B700] text-[#15151A] font-medium px-5 py-2.5 hover:bg-[#17171C] hover:text-white transition-colors disabled:opacity-50"
              >
                {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {creatingUser ? "Creando..." : "Crear usuario administrador"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNuevoCreado(null);
                  setView("lista");
                }}
                className="self-start text-xs text-[#8B8D8F] hover:text-[#17171C]"
              >
                Saltear por ahora, lo hago después
              </button>
            </form>
          )}
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
