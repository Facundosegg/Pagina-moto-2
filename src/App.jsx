import React, { useEffect, useMemo, useState } from "react";
import { Bike, MapPin, Clock, Instagram, Facebook, MessageCircle, X, Search, PackagePlus, ShieldCheck } from "lucide-react";
import { CONFIG, MARCAS } from "./data.js";
import { formatMoney, waLink } from "./format.js";
import { fetchMotos, subscribeToMotos } from "./motosApi.js";
import { isSupabaseConfigured } from "./supabaseClient.js";
import { useAdminSession } from "./useAdminSession.js";
import FieldSelect from "./FieldSelect.jsx";
import TextInput from "./TextInput.jsx";
import AdminLogin from "./AdminLogin.jsx";
import CatalogAdminPanel from "./CatalogAdminPanel.jsx";
import SupabaseNotConfiguredNotice from "./SupabaseNotConfiguredNotice.jsx";

const PAGE_SIZE = 8;

/* ------------------------------------------------------------------------ */
function RoadDivider() {
  return (
    <div className="relative h-8 overflow-hidden" aria-hidden="true">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#2A2A30]" />
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #F5B700 0, #F5B700 28px, transparent 28px, transparent 52px)",
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
      <Bike className="w-16 h-16 text-[#F5B700]" strokeWidth={1.25} />
      <span className="absolute bottom-2 right-3 font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
        {marca}
      </span>
      {estado === "0km" && (
        <span className="absolute top-2 left-2 font-mono text-[10px] tracking-widest bg-[#F5B700] text-[#15151A] px-2 py-0.5">
          0KM
        </span>
      )}
    </div>
  );
}

function MotoCard({ moto }) {
  const [imgError, setImgError] = useState(false);
  const msg = `Hola! Estoy interesado en la ${moto.marca} ${moto.modelo} ${moto.anio} (${formatMoney(moto.precio, moto.moneda)}) del catálogo.`;

  return (
    <div className="group bg-[#F4F0E6] border border-[#D8D2C0] flex flex-col">
      <div className="relative">
        {moto.image_url && !imgError ? (
          <img
            src={moto.image_url}
            alt={`${moto.marca} ${moto.modelo}`}
            className="w-full h-44 object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <PlaceholderArt marca={moto.marca} estado={moto.estado} />
        )}
        {moto.destacado && (
          <span
            className={`absolute top-2 left-2 font-mono text-[10px] tracking-widest px-2 py-0.5 ${
              moto.destacado === "RESERVADA" ? "bg-[#C1440E] text-[#F4F0E6]" : "bg-[#F5B700] text-[#15151A]"
            }`}
          >
            {moto.destacado}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-[#8B8D8F] uppercase">{moto.marca}</p>
          <h3 className="font-display text-xl uppercase tracking-wide text-[#17171C] leading-tight">{moto.modelo}</h3>
        </div>

        <div className="grid grid-cols-3 gap-px bg-[#D8D2C0] font-mono text-center">
          <div className="bg-[#EDE8DC] py-1.5">
            <div className="text-[9px] text-[#8B8D8F] tracking-widest">AÑO</div>
            <div className="text-sm text-[#17171C] tabular-nums">{moto.anio || "S/D"}</div>
          </div>
          <div className="bg-[#EDE8DC] py-1.5">
            <div className="text-[9px] text-[#8B8D8F] tracking-widest">CC</div>
            <div className="text-sm text-[#17171C] tabular-nums">{moto.cc}</div>
          </div>
          <div className="bg-[#EDE8DC] py-1.5">
            <div className="text-[9px] text-[#8B8D8F] tracking-widest">KM</div>
            <div className="text-sm text-[#17171C] tabular-nums">
              {moto.estado === "0km" ? "0" : new Intl.NumberFormat("es-AR").format(moto.km)}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="bg-[#15151A] text-[#F5B700] font-mono text-lg px-3 py-1.5 tabular-nums">
            {formatMoney(moto.precio, moto.moneda)}
          </div>
          <a
            href={waLink(CONFIG.whatsappNumber, msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#17171C] text-[#F4F0E6] text-sm px-3 py-2 hover:bg-[#C1440E] transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Consultar
          </a>
        </div>
      </div>
    </div>
  );
}

function PedirMotoForm() {
  const [form, setForm] = useState({ nombre: "", whatsapp: "", email: "", marca: "Cualquiera", modelo: "", presupuesto: "", comentario: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = form.nombre.trim() && form.whatsapp.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const lines = [
      `Hola! Quiero que me avisen cuando entre una moto.`,
      `Nombre: ${form.nombre}`,
      `WhatsApp: ${form.whatsapp}`,
      form.email && `Email: ${form.email}`,
      `Marca: ${form.marca}`,
      form.modelo && `Modelo: ${form.modelo}`,
      form.presupuesto && `Presupuesto aprox: ${form.presupuesto}`,
      form.comentario && `Comentario: ${form.comentario}`,
    ].filter(Boolean);
    window.open(waLink(CONFIG.whatsappNumber, lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1B1B20] border border-[#3A3A42] p-6 flex flex-col gap-4">
      <div>
        <h3 className="font-display text-2xl uppercase tracking-wide text-[#F4F0E6]">Pedí tu moto</h3>
        <p className="text-sm text-[#B9B6AC] mt-1">
          Contanos qué moto querés y te avisamos por WhatsApp apenas entre. Sin registrarte.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput label="Tu nombre" required value={form.nombre} onChange={set("nombre")} />
        <TextInput label="WhatsApp" required value={form.whatsapp} onChange={set("whatsapp")} placeholder="362 400 0000" />
        <TextInput label="Email (opcional)" value={form.email} onChange={set("email")} type="email" />
        <FieldSelect
          label="Marca"
          value={form.marca}
          onChange={set("marca")}
          options={[{ value: "Cualquiera", label: "Cualquiera" }, ...MARCAS.map((m) => ({ value: m, label: m }))]}
        />
        <TextInput label="Modelo" value={form.modelo} onChange={set("modelo")} />
        <TextInput label="Presupuesto aprox. (opcional)" value={form.presupuesto} onChange={set("presupuesto")} placeholder="US$ 5.000" />
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">Algo más que debamos saber (opcional)</span>
        <textarea
          value={form.comentario}
          onChange={(e) => set("comentario")(e.target.value)}
          rows={2}
          className="bg-[#F4F0E6] border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E] resize-none"
        />
      </label>
      <p className="text-xs text-[#8B8D8F]">Usamos tus datos solo para responder esta búsqueda.</p>
      <button
        type="submit"
        disabled={!canSubmit}
        className="self-start inline-flex items-center gap-2 bg-[#F5B700] text-[#15151A] font-medium px-5 py-2.5 hover:bg-[#F4F0E6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MessageCircle className="w-4 h-4" /> Avisame cuando llegue
      </button>
    </form>
  );
}

function VenderMotoForm() {
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
    window.open(waLink(CONFIG.whatsappNumber, lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#F4F0E6] border border-[#D8D2C0] p-6 flex flex-col gap-4">
      <div>
        <h3 className="font-display text-2xl uppercase tracking-wide text-[#17171C]">Vendé o permutá tu moto</h3>
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
          className="bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E] resize-none"
        />
      </label>
      <p className="text-xs text-[#8B8D8F]">La evaluación se coordina por WhatsApp, sin compromiso.</p>
      <button
        type="submit"
        disabled={!canSubmit}
        className="self-start inline-flex items-center gap-2 bg-[#17171C] text-[#F4F0E6] font-medium px-5 py-2.5 hover:bg-[#C1440E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

  const [motos, setMotos] = useState([]);
  const [motosLoading, setMotosLoading] = useState(true);

  const [loginOpen, setLoginOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const { isAdmin, session, logout } = useAdminSession();

  // Carga inicial del catálogo (Supabase si está configurado, si no el de ejemplo).
  useEffect(() => {
    let active = true;
    fetchMotos()
      .then((data) => active && setMotos(data))
      .catch(() => active && setMotos([]))
      .finally(() => active && setMotosLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Si otro administrador carga/edita/borra una moto desde otro dispositivo,
  // esta pantalla se actualiza sola (requiere Realtime habilitado, ver README).
  useEffect(() => {
    const unsubscribe = subscribeToMotos(() => {
      fetchMotos().then(setMotos).catch(() => {});
    });
    return unsubscribe;
  }, []);

  function handleCargarMotosClick() {
    if (!isSupabaseConfigured) {
      setNoticeOpen(true);
    } else if (!isAdmin) {
      setLoginOpen(true);
    } else {
      setCatalogOpen(true);
    }
  }

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

  return (
    <div id="top" className="min-h-screen bg-[#EDE8DC] text-[#17171C]">
      {noticeOpen && <SupabaseNotConfiguredNotice onClose={() => setNoticeOpen(false)} />}
      {loginOpen && (
        <AdminLogin
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
          adminEmail={session?.user?.email}
          onClose={() => setCatalogOpen(false)}
          onLogout={async () => {
            await logout();
            setCatalogOpen(false);
          }}
        />
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#15151A] border-b border-[#2A2A30]">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <Bike className="w-6 h-6 text-[#F5B700]" />
            <span className="font-display text-lg tracking-wide text-[#F4F0E6] uppercase">{CONFIG.businessName}</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-[#B9B6AC] hover:text-[#F5B700] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={waLink(CONFIG.whatsappNumber, "Hola! Quiero hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 bg-[#F5B700] text-[#15151A] text-sm font-medium px-4 py-2 hover:bg-[#F4F0E6] transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button
              onClick={handleCargarMotosClick}
              className="relative text-[#8B8D8F] hover:text-[#F5B700] p-2"
              aria-label="Cargar motos"
              title={isAdmin ? "Cargar motos (sesión iniciada)" : "Cargar motos"}
            >
              <PackagePlus className="w-5 h-5" />
              {isAdmin && <ShieldCheck className="w-3 h-3 text-[#F5B700] absolute -bottom-0.5 -right-0.5" />}
            </button>
            <button className="md:hidden text-[#F4F0E6]" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">
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
      <section className="bg-[#15151A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 22px)" }}
        />
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-14 relative">
          <p className="font-mono text-xs tracking-[0.3em] text-[#F5B700] uppercase mb-4">{CONFIG.tagline}</p>
          <h1 className="font-display text-5xl sm:text-6xl uppercase leading-[0.95] text-[#F4F0E6] max-w-2xl">
            La ruta
            <br />
            es tuya
          </h1>
          <p className="text-[#B9B6AC] mt-5 max-w-md">
            0km y usadas seleccionadas, con financiación y permutas. Coordinamos todo por WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a href="#catalogo" className="bg-[#F5B700] text-[#15151A] font-medium px-5 py-2.5 hover:bg-[#F4F0E6] transition-colors">
              Ver catálogo
            </a>
            <a href="#vender" className="border border-[#3A3A42] text-[#F4F0E6] px-5 py-2.5 hover:border-[#F5B700] transition-colors">
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
              className="inline-flex items-center gap-1.5 bg-[#17171C] text-[#F4F0E6] text-sm px-3 py-2 hover:bg-[#C1440E] transition-colors"
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

        <div className="bg-[#15151A] p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <MotoCard key={moto.id} moto={moto} />
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
              className="bg-[#17171C] text-[#F4F0E6] px-5 py-2.5 hover:bg-[#C1440E] transition-colors"
            >
              Ver más unidades
            </button>
          )}
        </div>
      </section>

      <RoadDivider />

      {/* FORMULARIOS */}
      <section id="pedir" className="max-w-6xl mx-auto px-5 py-12">
        <PedirMotoForm />
      </section>
      <section id="vender" className="max-w-6xl mx-auto px-5 pb-12">
        <VenderMotoForm />
      </section>

      <RoadDivider />

      {/* FOOTER */}
      <footer id="contacto" className="bg-[#15151A] text-[#B9B6AC]">
        <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bike className="w-5 h-5 text-[#F5B700]" />
              <span className="font-display text-lg tracking-wide text-[#F4F0E6] uppercase">{CONFIG.businessName}</span>
            </div>
            <p className="text-sm">La comunidad de compra y venta de motos del NEA.</p>
            <div className="flex gap-3 mt-4">
              <a href={CONFIG.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#F5B700]">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={CONFIG.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#F5B700]">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={waLink(CONFIG.whatsappNumber, "Hola! Quiero hacer una consulta.")} target="_blank" rel="noopener noreferrer" className="hover:text-[#F5B700]">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B8D8F] mb-3">Navegación</p>
            <ul className="flex flex-col gap-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-[#F5B700]">
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
                <a href={CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#F5B700]">
                  {CONFIG.address}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{CONFIG.hours}</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-mono">{CONFIG.phoneDisplay}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2A2A30] py-4 text-center text-xs font-mono text-[#5B5852]">
          © {new Date().getFullYear()} {CONFIG.businessName} · Compraventa de motos en el Nordeste Argentino
        </div>
      </footer>
    </div>
  );
}
