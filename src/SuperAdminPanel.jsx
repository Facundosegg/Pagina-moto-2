import React, { useEffect, useState } from "react";
import { LogOut, Plus, Pencil, Trash2, ArrowLeft, Save, ExternalLink, Link2, Loader2, Lock } from "lucide-react";
import { listClientes, insertCliente, updateClienteById, deleteClienteById, getGestion, listGestion, upsertGestion } from "./superadminApi.js";
import { connectDomain } from "./platformApi.js";
import ColorField from "./ColorField.jsx";
import SingleImageUpload from "./SingleImageUpload.jsx";
import TextInput from "./TextInput.jsx";
import NumberInput from "./NumberInput.jsx";
import FieldSelect from "./FieldSelect.jsx";
import AdminUsersManager from "./AdminUsersManager.jsx";
import { formatMoney } from "./format.js";

function blankForm() {
  return {
    slug: "",
    dominio: "",
    activo: true,
    nombre_negocio: "",
    tagline: "",
    hero_titulo: "",
    hero_subtitulo: "",
    layout: "clasico",
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

function blankGestion() {
  return {
    contacto_nombre: "",
    contacto_telefono: "",
    estado_pago: "al_dia",
    proximo_vencimiento: "",
    monto_mensual: "",
    moneda_plan: "ARS",
    notas: "",
  };
}

export default function SuperAdminPanel({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [gestionMap, setGestionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("lista"); // "lista" | "editar" | "nuevo"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [gestion, setGestionState] = useState(blankGestion());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [nuevoCreado, setNuevoCreado] = useState(null); // cliente recién creado, para el paso de crear su admin

  const [domainStatus, setDomainStatus] = useState(null); // null | "loading" | "ok" | "error"
  const [domainMessage, setDomainMessage] = useState("");
  const [domainVerification, setDomainVerification] = useState(null);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setGestion = (k) => (v) => setGestionState((g) => ({ ...g, [k]: v }));

  async function reload() {
    setLoading(true);
    try {
      const [clientesData, gestionRows] = await Promise.all([listClientes(), listGestion()]);
      setClientes(clientesData);
      const map = {};
      gestionRows.forEach((g) => {
        map[g.cliente_id] = g;
      });
      setGestionMap(map);
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
    setGestionState(blankGestion());
    setEditingId(null);
    setError("");
    setNuevoCreado(null);
    setDomainStatus(null);
    setDomainMessage("");
    setDomainVerification(null);
    setView("nuevo");
  }

  async function startEdit(cliente) {
    setForm({
      slug: cliente.slug || "",
      dominio: cliente.dominio || "",
      activo: cliente.activo !== false,
      nombre_negocio: cliente.nombre_negocio || "",
      tagline: cliente.tagline || "",
      hero_titulo: cliente.hero_titulo || "",
      hero_subtitulo: cliente.hero_subtitulo || "",
      layout: cliente.layout || "clasico",
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

    const yaConocida = gestionMap[cliente.id];
    setGestionState(
      yaConocida
        ? { ...blankGestion(), ...yaConocida, monto_mensual: yaConocida.monto_mensual != null ? String(yaConocida.monto_mensual) : "" }
        : blankGestion()
    );
    try {
      const g = await getGestion(cliente.id);
      if (g) setGestionState({ ...blankGestion(), ...g, monto_mensual: g.monto_mensual != null ? String(g.monto_mensual) : "" });
    } catch {
      // si falla, seguimos con lo que ya teníamos (o el formulario en blanco)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.slug.trim() || !form.nombre_negocio.trim()) {
      setError("Completá al menos el identificador (slug) y el nombre del negocio.");
      return;
    }
    setSaving(true);
    setError("");
    const gestionPayload = {
      contacto_nombre: gestion.contacto_nombre || null,
      contacto_telefono: gestion.contacto_telefono || null,
      estado_pago: gestion.estado_pago || "al_dia",
      proximo_vencimiento: gestion.proximo_vencimiento || null,
      monto_mensual: gestion.monto_mensual ? Number(gestion.monto_mensual) : null,
      moneda_plan: gestion.moneda_plan || "ARS",
      notas: gestion.notas || null,
    };
    try {
      if (view === "nuevo") {
        const created = await insertCliente(form);
        await upsertGestion(created.id, gestionPayload);
        await reload();
        setNuevoCreado(created);
      } else {
        await updateClienteById(editingId, form);
        await upsertGestion(editingId, gestionPayload);
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

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Estilo de diseño</span>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { value: "clasico", title: "Clásico", desc: "Título a la izquierda, catálogo en tarjetas grandes (4 por fila)." },
            { value: "centrado", title: "Centrado", desc: "Todo el texto de portada centrado, catálogo en tarjetas (3 por fila)." },
            { value: "lista", title: "Lista", desc: "Catálogo en filas horizontales, una moto debajo de la otra." },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("layout")(opt.value)}
              className={`text-left border p-3 transition-colors ${
                form.layout === opt.value ? "border-[#C1440E] bg-[#F4F0E6]" : "border-[#D8D2C0] bg-white hover:border-[#8B8D8F]"
              }`}
            >
              <p className="font-display text-sm uppercase tracking-wide text-[#17171C]">{opt.title}</p>
              <p className="text-xs text-[#8B8D8F] mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
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

      <div className="border border-[#D8D2C0] bg-black/5 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#8B8D8F]" />
          <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
            Gestión del cliente — privado, no lo ve nadie más
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" checked={form.activo} onChange={(e) => set("activo")(e.target.checked)} className="w-4 h-4" />
          <span className="text-sm text-[#17171C]">Sitio activo</span>
        </label>
        {!form.activo && (
          <p className="text-xs text-[#C1440E]">
            El sitio de este cliente va a dejar de mostrarse (los visitantes ven un aviso de "pausado") apenas
            guardes. El catálogo y todos sus datos quedan intactos para cuando lo reactives.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <TextInput label="Nombre de contacto" value={gestion.contacto_nombre} onChange={setGestion("contacto_nombre")} />
          <TextInput label="Teléfono de contacto" value={gestion.contacto_telefono} onChange={setGestion("contacto_telefono")} />
          <FieldSelect
            label="Estado de pago"
            value={gestion.estado_pago}
            onChange={setGestion("estado_pago")}
            options={[
              { value: "al_dia", label: "Al día" },
              { value: "atrasado", label: "Atrasado" },
              { value: "pausado", label: "Pausado por falta de pago" },
            ]}
          />
          <TextInput label="Próximo vencimiento" type="date" value={gestion.proximo_vencimiento} onChange={setGestion("proximo_vencimiento")} />
          <NumberInput label="Monto mensual" value={gestion.monto_mensual} onChange={setGestion("monto_mensual")} placeholder="15.000" />
          <FieldSelect
            label="Moneda"
            value={gestion.moneda_plan}
            onChange={setGestion("moneda_plan")}
            options={[
              { value: "ARS", label: "ARS" },
              { value: "USD", label: "USD" },
            ]}
          />
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Notas</span>
          <textarea
            value={gestion.notas}
            onChange={(e) => setGestion("notas")(e.target.value)}
            rows={3}
            className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E] resize-none"
          />
        </label>
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

          <AdminUsersManager clienteId={nuevoCreado.id} />

          <div className="flex items-center gap-3 pt-2 border-t border-[#D8D2C0] mt-1">
            <button
              onClick={() => {
                setNuevoCreado(null);
                setView("lista");
              }}
              className="bg-[#17171C] text-white px-4 py-2 text-sm hover:bg-[#C1440E] transition-colors mt-3"
            >
              Volver a la lista
            </button>
            {nuevoCreado.dominio && (
              <a
                href={`https://${nuevoCreado.dominio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#5B5852] hover:text-[#C1440E] mt-3"
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
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="bg-[#EDE8DC] p-6 flex flex-col gap-5">
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

          {view === "editar" && (
            <div className="bg-[#EDE8DC] p-6">
              <AdminUsersManager clienteId={editingId} />
            </div>
          )}
        </div>
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
            {clientes.map((c) => {
              const g = gestionMap[c.id];
              return (
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

                <div className="flex items-center gap-1.5 flex-wrap">
                  {c.activo === false && (
                    <span className="font-mono text-[9px] tracking-widest uppercase bg-[#C1440E] text-white px-2 py-0.5">Pausado</span>
                  )}
                  {c.activo !== false && g?.estado_pago === "atrasado" && (
                    <span className="font-mono text-[9px] tracking-widest uppercase bg-[#F5B700] text-[#15151A] px-2 py-0.5">
                      Pago atrasado
                    </span>
                  )}
                  {g?.monto_mensual != null && (
                    <span className="font-mono text-[10px] text-[#8B8D8F]">{formatMoney(g.monto_mensual, g.moneda_plan)}/mes</span>
                  )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
