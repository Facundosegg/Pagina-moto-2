import React, { useEffect, useMemo, useState } from "react";
import { Bike, MapPin, Clock, Instagram, Facebook, MessageCircle, X, Search, PackagePlus, ShieldCheck } from "lucide-react";
import { DEFAULT_CONFIG, MARCAS } from "./data.js";
import { formatMoney, waLink } from "./format.js";
import { fetchMotos, subscribeToMotos } from "./motosApi.js";
import { fetchClienteActual, applyTheme } from "./clienteApi.js";
import { isSupabaseConfigured } from "./supabaseClient.js";
import { useAdminSession } from "./useAdminSession.js";
import FieldSelect from "./FieldSelect.jsx";
import TextInput from "./TextInput.jsx";
import AdminLogin from "./AdminLogin.jsx";
import CatalogAdminPanel from "./CatalogAdminPanel.jsx";
import SupabaseNotConfiguredNotice from "./SupabaseNotConfiguredNotice.jsx";
import ClienteNoEncontradoNotice from "./ClienteNoEncontradoNotice.jsx";

const PAGE_SIZE = 8;

/* ------------------------------------------------------------------------ */
function BrandLogo({ logoUrl, businessName, iconClassName = "w-6 h-6", imgClassName = "h-9 w-auto max-w-[150px]" }) {
  const [error, setError] = useState(false);
  if (logoUrl && !error) {
    return <img src={logoUrl} alt={businessName} className={`${imgClassName} object-contain`} onError={() => setError(true)} />;
  }
  return <Bike className={`${iconClassName} text-[var(--c-signal)]`} />;
}

function RoadDivider() {
  return (
    <div className="relative h-8 overflow-hidden" aria-hidden="true">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#2A2A30]" />
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--c-signal) 0, var(--c-signal) 28px, transparent 28px, transparent 52px)",
        }}
      />
    </div>
  );
}

function PlaceholderArt({ marca, estado }) {
  return (
    <div className="relative w-full h-44 bg-[#1B1B20] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 14px)" }}
      />
      <Bike className="w-16 h-16 text-[var(--c-signal)]" strokeWidth={1.25} />
      <span className="absolute bottom-2 right-3 font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
        {marca}
      </span>
      {estado === "0km" && (
        <span className="absolute top-2 left-2 font-mono text-[10px] tracking-widest bg-[var(--c-signal)] text-[var(--c-dark)] px-2 py-0.5">
          0KM
        </span>
      )}
    </div>
  );
}

function MotoCard({ moto, whatsappNumber }) {
  const [index, setIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const fotos = moto.fotos && moto.fotos.length > 0 ? moto.fotos : moto.image_url ? [moto.image_url] : [];
  const msg = `Hola! Estoy interesado en la ${moto.marca} ${moto.modelo} ${moto.anio} (${formatMoney(moto.precio, moto.moneda)}) del catálogo.`;

  function go(delta) {
    setImgError(false);
    setIndex((i) => (i + delta + fotos.length) % fotos.length);
  }

  return (
    <div className="group bg-[var(--c-paper2)] border border-[#D8D2C0] flex flex-col">
      <div className="relative">
        {fotos.length > 0 && !imgError ? (
          <img
            src={fotos[index]}
            alt={`${moto.marca} ${moto.modelo}`}
            className="w-full h-44 object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <PlaceholderArt marca={moto.marca} estado={moto.estado} />
        )}
        {fotos.length > 1 && !imgError && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 flex items-center justify-center text-sm"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 flex items-center justify-center text-sm"
            >
              ›
            </button>
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
              {fotos.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-[var(--c-signal)]" : "bg-white/60"}`} />
              ))}
            </div>
          </>
        )}
        {moto.destacado && (
          <span
            className={`absolute top-2 left-2 font-mono text-[10px] tracking-widest px-2 py-0.5 ${
              moto.destacado === "RESERVADA" ? "bg-[var(--c-rust)] text-[var(--c-paper2)]" : "bg-[var(--c-signal)] text-[var(--c-dark)]"
            }`}
          >
            {moto.destacado}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-[#8B8D8F] uppercase">{moto.marca}</p>
          <h3 className="font-display text-xl uppercase tracking-wide text-[var(--c-ink)] leading-tight">{moto.modelo}</h3>
        </div>

        <div className="grid grid-cols-3 gap-px bg-[#D8D2C0] font-mono text-center">
          <div className="bg-[var(--c-paper)] py-1.5">
            <div className="text-[9px] text-[#8B8D8F] tracking-widest">AÑO</div>
            <div className="text-sm text-[var(--c-ink)] tabular-nums">{moto.anio || "S/D"}</div>
          </div>
          <div className="bg-[var(--c-paper)] py-1.5">
            <div className="text-[9px] text-[#8B8D8F] tracking-widest">CC</div>
            <div className="text-sm text-[var(--c-ink)] tabular-nums">{moto.cc}</div>
          </div>
          <div className="bg-[var(--c-paper)] py-1.5">
            <div className="text-[9px] text-[#8B8D8F] tracking-widest">KM</div>
            <div className="text-sm text-[var(--c-ink)] tabular-nums">
              {moto.estado === "0km" ? "0" : new Intl.NumberFormat("es-AR").format(moto.km)}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="bg-[var(--c-dark)] text-[var(--c-signal)] font-mono text-lg px-3 py-1.5 tabular-nums">
            {formatMoney(moto.precio, moto.moneda)}
          </div>
          <a
            href={waLink(whatsappNumber, msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[var(--c-ink)] text-[var(--c-paper2)] text-sm px-3 py-2 hover:bg-[var(--c-rust)] transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Consultar
          </a>
        </div>
      </div>
    </div>
  );
}

function PedirMotoForm({ whatsappNumber, motos }) {
  const [form, setForm] = useState({
    nombre: "",
    whatsapp: "",
    email: "",
    motoId: "otra",
    marca: "Cualquiera",
    modelo: "",
    presupuesto: "",
    comentario: "",
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = form.nombre.trim() && form.whatsapp.trim();
  const motoElegida = form.motoId !== "otra" ? motos.find((m) => String(m.id) === form.motoId) : null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const lines = [
      motoElegida ? `Hola! Estoy interesado en esta moto del catálogo:` : `Hola! Quiero que me avisen cuando entre una moto.`,
      motoElegida &&
        `Moto: ${motoElegida.marca} ${motoElegida.modelo} (${motoElegida.anio}) — ${formatMoney(motoElegida.precio, motoElegida.moneda)}`,
      `Nombre: ${form.nombre}`,
      `WhatsApp: ${form.whatsapp}`,
      form.email && `Email: ${form.email}`,
      !motoElegida && `Marca: ${form.marca}`,
      !motoElegida && form.modelo && `Modelo: ${form.modelo}`,
      !motoElegida && form.presupuesto && `Presupuesto aprox: ${form.presupuesto}`,
      form.comentario && `Comentario: ${form.comentario}`,
    ].filter(Boolean);
    window.open(waLink(whatsappNumber, lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  const motoOptions = [
    { value: "otra", label: "Otra que no está en el catálogo" },
    ...motos.map((m) => ({
      value: String(m.id),
      label: `${m.marca} ${m.modelo} (${m.anio}) — ${formatMoney(m.precio, m.moneda)}`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-[#1B1B20] border border-[#3A3A42] p-6 flex flex-col gap-4">
      <div>
        <h3 className="font-display text-2xl uppercase tracking-wide text-[var(--c-paper2)]">Pedí tu moto</h3>
        <p className="text-sm text-[#B9B6AC] mt-1">
          Elegí una moto del catálogo, o contanos qué buscás y te avisamos por WhatsApp apenas entre. Sin registrarte.
        </p>
      </div>

      {motos.length > 0 && (
        <FieldSelect label="¿Qué moto te interesa?" value={form.motoId} onChange={set("motoId")} options={motoOptions} />
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Tu nombre" required value={form.nombre} onChange={set("nombre")} />
        <TextInput label="WhatsApp" required value={form.whatsapp} onChange={set("whatsapp")} placeholder="362 400 0000" />
        <TextInput label="Email (opcional)" value={form.email} onChange={set("email")} type="email" />
        {!motoElegida && (
          <>
            <FieldSelect
              label="Marca"
              value={form.marca}
              onChange={set("marca")}
              options={[{ value: "Cualquiera", label: "Cualquiera" }, ...MARCAS.map((m) => ({ value: m, label: m }))]}
            />
            <TextInput label="Modelo" value={form.modelo} onChange={set("modelo")} />
            <TextInput label="Presupuesto aprox. (opcional)" value={form.presupuesto} onChange={set("presupuesto")} placeholder="US$ 5.000" />
          </>
        )}
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Algo más que debamos saber (opcional)</span>
        <textarea
          value={form.comentario}
          onChange={(e) => set("comentario")(e.target.value)}
          rows={2}
          className="bg-[var(--c-paper2)] border border-[#D8D2C0] text-[var(--c-ink)] text-sm px-3 py-2 focus:outline-none focus:border-[var(--c-rust)] resize-none"
        />
      </label>
      <p className="text-xs text-[#8B8D8F]">Usamos tus datos solo para responder esta búsqueda.</p>
      <button
        type="submit"
        disabled={!canSubmit}
        className="self-start inline-flex items-center gap-2 bg-[var(--c-signal)] text-[var(--c-dark)] font-medium px-5 py-2.5 hover:bg-[var(--c-paper2)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MessageCircle className="w-4 h-4" /> {motoElegida ? "Consultar por esta moto" : "Avisame cuando llegue"}
      </button>
    </form>
  );
}

function VenderMotoForm({ whatsappNumber }) {
  const [form, setForm] = useState({ nombre: "", whatsapp: "", email: "", marca: "APRILIA", modelo: "", anio: "", km: "", comentario: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = form.nombre.trim() && form.whatsapp.trim() && form.modelo.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const lines = [
      `Hola! Quiero vender o permutar mi moto.`,
      `Nombre: ${form.nombre}`,
      `WhatsApp: ${form.whatsapp}`,
      form.email && `Email: ${form.email}`,
      `Marca: ${form.marca}`,
      `Modelo: ${form.modelo}`,
      form.anio && `Año: ${form.anio}`,
      form.km && `Km: ${form.km}`,
      form.comentario && `Estado / comentarios: ${form.comentario}`,
    ].filter(Boolean);
    window.open(waLink(whatsappNumber, lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--c-paper2)] border border-[#D8D2C0] p-6 flex flex-col gap-4">
      <div>
        <h3 className="font-display text-2xl uppercase tracking-wide text-[var(--c-ink)]">Vendé o permutá tu moto</h3>
        <p className="text-sm text-[#5B5852] mt-1">
          Te la compramos, o la entregás en parte de pago por una del catálogo. Coordinamos por WhatsApp.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Tu nombre" required value={form.nombre} onChange={set("nombre")} />
        <TextInput label="WhatsApp" required value={form.whatsapp} onChange={set("whatsapp")} placeholder="362 400 0000" />
        <FieldSelect label="Marca de tu moto" value={form.marca} onChange={set("marca")} options={MARCAS.map((m) => ({ value: m, label: m }))} />
        <TextInput label="Modelo" required value={form.modelo} onChange={set("modelo")} />
        <TextInput label="Año" value={form.anio} onChange={set("anio")} />
        <TextInput label="Km" value={form.km} onChange={set("km")} />
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Estado / comentarios (opcional)</span>
        <textarea
          value={form.comentario}
          onChange={(e) => set("comentario")(e.target.value)}
          rows={2}
          className="bg-white border border-[#D8D2C0] text-[var(--c-ink)] text-sm px-3 py-2 focus:outline-none focus:border-[var(--c-rust)] resize-none"
        />
      </label>
      <p className="text-xs text-[#8B8D8F]">La evaluación se coordina por WhatsApp, sin compromiso.</p>
      <button
        type="submit"
        disabled={!canSubmit}
        className="self-start inline-flex items-center gap-2 bg-[var(--c-ink)] text-[var(--c-paper2)] font-medium px-5 py-2.5 hover:bg-[var(--c-rust)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MessageCircle className="w-4 h-4" /> Solicitar evaluación
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------------ */
export default function App() {
  const [filtros, setFiltros] = useState({ marca: "todas", estado: "todas", orden: "recientes", moneda: "todas" });
  const [visibles, setVisibles] = useState(PAGE_SIZE);
  const [menuOpen, setMenuOpen] = useState(false);

  const [cliente, setCliente] = useState(null);
  const [clienteLoading, setClienteLoading] = useState(true);

  const [motos, setMotos] = useState([]);
  const [motosLoading, setMotosLoading] = useState(true);

  const [loginOpen, setLoginOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const { isAdmin, session, logout } = useAdminSession(cliente?.id);

  // Al cargar la página: averigua a qué cliente corresponde este dominio
  // y aplica sus colores. En modo demo (Supabase sin configurar) esto
  // no hace ninguna consulta y sigue de largo con los datos de ejemplo.
  useEffect(() => {
    let active = true;
    fetchClienteActual()
      .then((data) => {
        if (!active) return;
        setCliente(data);
        if (data) applyTheme(data);
      })
      .catch(() => active && setCliente(null))
      .finally(() => active && setClienteLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const showClienteNoEncontrado = isSupabaseConfigured && !clienteLoading && !cliente;

  // Carga del catálogo, ya sabiendo a qué cliente pertenece este sitio.
  useEffect(() => {
    if (clienteLoading) return;
    let active = true;
    setMotosLoading(true);
    fetchMotos(cliente?.id)
      .then((data) => active && setMotos(data))
      .catch(() => active && setMotos([]))
      .finally(() => active && setMotosLoading(false));
    return () => {
      active = false;
    };
  }, [clienteLoading, cliente?.id]);

  // Si otro administrador carga/edita/borra una moto de ESTE cliente
  // desde otro dispositivo, esta pantalla se actualiza sola (requiere
  // Realtime habilitado, ver README).
  useEffect(() => {
    if (clienteLoading) return;
    const unsubscribe = subscribeToMotos(cliente?.id, () => {
      fetchMotos(cliente?.id).then(setMotos).catch(() => {});
    });
    return unsubscribe;
  }, [clienteLoading, cliente?.id]);

  function handleCargarMotosClick() {
    if (!isSupabaseConfigured || !cliente) {
      setNoticeOpen(true);
    } else if (!isAdmin) {
      setLoginOpen(true);
    } else {
      setCatalogOpen(true);
    }
  }

  const config = cliente
    ? {
        businessName: cliente.nombre_negocio,
        tagline: cliente.tagline,
        whatsappNumber: cliente.whatsapp_number,
        phoneDisplay: cliente.phone_display,
        address: cliente.address,
        hours: cliente.hours,
        instagram: cliente.instagram,
        facebook: cliente.facebook,
        mapsUrl: cliente.maps_url,
        logoUrl: cliente.logo_url,
        coverUrl: cliente.cover_url,
      }
    : DEFAULT_CONFIG;

  const filtradas = useMemo(() => {
    let list = [...motos];
    if (filtros.marca !== "todas") list = list.filter((m) => m.marca === filtros.marca);
    if (filtros.estado !== "todas") list = list.filter((m) => m.estado === filtros.estado);
    if (filtros.moneda !== "todas") list = list.filter((m) => m.moneda === filtros.moneda);

    switch (filtros.orden) {
      case "precio_asc":
        list.sort((a, b) => a.precio - b.precio);
        break;
      case "precio_desc":
        list.sort((a, b) => b.precio - a.precio);
        break;
      case "anio_nuevo":
        list.sort((a, b) => b.anio - a.anio);
        break;
      case "anio_viejo":
        list.sort((a, b) => a.anio - b.anio);
        break;
      default:
        list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [motos, filtros]);

  const mostrar = filtradas.slice(0, visibles);
  const navLinks = [
    { label: "Inicio", href: "#top" },
    { label: "Catálogo", href: "#catalogo" },
    { label: "Pedí tu moto", href: "#pedir" },
    { label: "Vendé la tuya", href: "#vender" },
    { label: "Contacto", href: "#contacto" },
  ];

  if (clienteLoading) {
    return <div className="min-h-screen bg-[var(--c-dark)]" />;
  }

  if (showClienteNoEncontrado) {
    return <ClienteNoEncontradoNotice />;
  }

  return (
    <div id="top" className="min-h-screen bg-[var(--c-paper)] text-[var(--c-ink)]">
      {noticeOpen && <SupabaseNotConfiguredNotice onClose={() => setNoticeOpen(false)} />}
      {loginOpen && (
        <AdminLogin
          clienteId={cliente?.id}
          onClose={() => setLoginOpen(false)}
          onSuccess={() => {
            setLoginOpen(false);
            setCatalogOpen(true);
          }}
        />
      )}
      {catalogOpen && isAdmin && (
        <CatalogAdminPanel
          motos={motos}
          setMotos={setMotos}
          clienteId={cliente?.id}
          adminEmail={session?.user?.email}
          onClose={() => setCatalogOpen(false)}
          onLogout={async () => {
            await logout();
            setCatalogOpen(false);
          }}
        />
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[var(--c-dark)] border-b border-[#2A2A30]">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <BrandLogo
              logoUrl={config.logoUrl}
              businessName={config.businessName}
              iconClassName="w-7 h-7"
              imgClassName="h-10 w-auto max-w-[170px]"
            />
            <span className="font-display text-lg tracking-wide text-[var(--c-paper2)] uppercase">{config.businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-[#B9B6AC] hover:text-[var(--c-signal)] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={waLink(config.whatsappNumber, "Hola! Quiero hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 bg-[var(--c-signal)] text-[var(--c-dark)] text-sm font-medium px-4 py-2 hover:bg-[var(--c-paper2)] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button
              onClick={handleCargarMotosClick}
              className="relative text-[#8B8D8F] hover:text-[var(--c-signal)] p-2"
              aria-label="Cargar motos"
              title={isAdmin ? "Cargar motos (sesión iniciada)" : "Cargar motos"}
            >
              <PackagePlus className="w-5 h-5" />
              {isAdmin && <ShieldCheck className="w-3 h-3 text-[var(--c-signal)] absolute -bottom-0.5 -right-0.5" />}
            </button>
            <button className="md:hidden text-[var(--c-paper2)]" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">
              {menuOpen ? <X className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[#2A2A30] px-5 py-3 flex flex-col gap-3">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm text-[#B9B6AC]">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="bg-[var(--c-dark)] relative overflow-hidden">
        {config.coverUrl ? (
          <>
            <img src={config.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 22px)" }}
          />
        )}
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-14 relative">
          <p className="font-mono text-xs tracking-[0.3em] text-[var(--c-signal)] uppercase mb-4">{config.tagline}</p>
          <h1 className="font-display text-5xl sm:text-6xl uppercase leading-[0.95] text-[var(--c-paper2)] max-w-2xl">
            La ruta
            <br />
            es tuya
          </h1>
          <p className="text-[#B9B6AC] mt-5 max-w-md">
            0km y usadas seleccionadas, con financiación y permutas. Coordinamos todo por WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a href="#catalogo" className="bg-[var(--c-signal)] text-[var(--c-dark)] font-medium px-5 py-2.5 hover:bg-[var(--c-paper2)] transition-colors">
              Ver catálogo
            </a>
            <a href="#vender" className="border border-[#3A3A42] text-[var(--c-paper2)] px-5 py-2.5 hover:border-[var(--c-signal)] transition-colors">
              Vendé tu moto
            </a>
          </div>
        </div>
      </section>
      <RoadDivider />

      {/* CATÁLOGO */}
      <section id="catalogo" className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <h2 className="font-display text-3xl uppercase tracking-wide">Catálogo</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-[#8B8D8F]">{filtradas.length} unidades</span>
            <button
              onClick={handleCargarMotosClick}
              className="inline-flex items-center gap-1.5 bg-[var(--c-ink)] text-[var(--c-paper2)] text-sm px-3 py-2 hover:bg-[var(--c-rust)] transition-colors"
            >
              <PackagePlus className="w-4 h-4" /> Cargar moto
            </button>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <p className="text-xs text-[#8B8D8F] mb-6 border border-dashed border-[#D8D2C0] px-3 py-2">
            Este es el catálogo de ejemplo. Conectá la base de datos (README) para cargar tus motos reales.
          </p>
        )}

        <div className="bg-[var(--c-dark)] p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <FieldSelect
            label="Marca"
            value={filtros.marca}
            onChange={(v) => setFiltros((f) => ({ ...f, marca: v }))}
            options={[{ value: "todas", label: "Todas" }, ...MARCAS.map((m) => ({ value: m, label: m }))]}
          />
          <FieldSelect
            label="Estado"
            value={filtros.estado}
            onChange={(v) => setFiltros((f) => ({ ...f, estado: v }))}
            options={[
              { value: "todas", label: "0km y usadas" },
              { value: "0km", label: "0km" },
              { value: "usado", label: "Usadas" },
            ]}
          />
          <FieldSelect
            label="Moneda"
            value={filtros.moneda}
            onChange={(v) => setFiltros((f) => ({ ...f, moneda: v }))}
            options={[
              { value: "todas", label: "Todas" },
              { value: "ARS", label: "ARS" },
              { value: "USD", label: "USD" },
            ]}
          />
          <FieldSelect
            label="Ordenar"
            value={filtros.orden}
            onChange={(v) => setFiltros((f) => ({ ...f, orden: v }))}
            options={[
              { value: "recientes", label: "Más recientes" },
              { value: "precio_asc", label: "Precio: menor a mayor" },
              { value: "precio_desc", label: "Precio: mayor a menor" },
              { value: "anio_nuevo", label: "Año: más nuevo" },
              { value: "anio_viejo", label: "Año: más antiguo" },
            ]}
          />
        </div>

        {motosLoading ? (
          <p className="text-sm text-[#8B8D8F] py-16 text-center">Cargando catálogo...</p>
        ) : mostrar.length === 0 ? (
          <div className="border border-dashed border-[#D8D2C0] py-16 text-center flex flex-col items-center gap-3">
            <Search className="w-8 h-8 text-[#8B8D8F]" />
            <p className="text-[#5B5852]">No hay unidades con esos filtros. Probá cambiar la marca o el estado.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mostrar.map((moto) => (
              <MotoCard key={moto.id} moto={moto} whatsappNumber={config.whatsappNumber} />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 mt-8">
          <p className="font-mono text-xs text-[#8B8D8F]">
            Mostrando {mostrar.length} de {filtradas.length} unidades
          </p>
          {visibles < filtradas.length && (
            <button
              onClick={() => setVisibles((v) => v + PAGE_SIZE)}
              className="bg-[var(--c-ink)] text-[var(--c-paper2)] px-5 py-2.5 hover:bg-[var(--c-rust)] transition-colors"
            >
              Ver más unidades
            </button>
          )}
        </div>
      </section>

      <RoadDivider />

      {/* FORMULARIOS */}
      <section id="pedir" className="max-w-6xl mx-auto px-5 py-12">
        <PedirMotoForm whatsappNumber={config.whatsappNumber} motos={motos} />
      </section>
      <section id="vender" className="max-w-6xl mx-auto px-5 pb-12">
        <VenderMotoForm whatsappNumber={config.whatsappNumber} />
      </section>

      <RoadDivider />

      {/* FOOTER */}
      <footer id="contacto" className="bg-[var(--c-dark)] text-[#B9B6AC]">
        <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BrandLogo
                logoUrl={config.logoUrl}
                businessName={config.businessName}
                iconClassName="w-6 h-6"
                imgClassName="h-8 w-auto max-w-[130px]"
              />
              <span className="font-display text-lg tracking-wide text-[var(--c-paper2)] uppercase">{config.businessName}</span>
            </div>
            <p className="text-sm">La comunidad de compra y venta de motos del NEA.</p>
            <div className="flex gap-3 mt-4">
              <a href={config.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--c-signal)]">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--c-signal)]">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={waLink(config.whatsappNumber, "Hola! Quiero hacer una consulta.")} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--c-signal)]">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B8D8F] mb-3">Navegación</p>
            <ul className="flex flex-col gap-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-[var(--c-signal)]">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B8D8F] mb-3">Visitanos</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <a href={config.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--c-signal)]">
                  {config.address}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{config.hours}</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-mono">{config.phoneDisplay}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2A2A30] py-4 text-center text-xs font-mono text-[#5B5852]">
          © {new Date().getFullYear()} {config.businessName} · Compraventa de motos en el Nordeste Argentino
        </div>
      </footer>
    </div>
  );
}
