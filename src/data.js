/* ==============================================================================
   DATOS DEL SITIO
   ==============================================================================
   Este es el ÚNICO archivo que necesitás tocar para actualizar el sitio:
   tus datos de contacto y el catálogo de motos. No hace falta saber
   programar, solo respetar las comas y las comillas.

   Cómo se actualiza en el sitio ya publicado:
   1. Editás este archivo.
   2. Guardás.
   3. Si publicaste con Netlify Drop: corré "npm run build" de nuevo y
      arrastrá la carpeta "dist" a Netlify otra vez.
      Si publicaste con GitHub + Vercel: hacé "git push" y se actualiza solo.
   Los pasos completos están en el README.md
   ============================================================================== */

// ------------------------------------------------------------------------------
// CONFIG — Datos de contacto y del negocio.
// ------------------------------------------------------------------------------
export const CONFIG = {
  businessName: "RUTA NEA MOTOS",
  tagline: "Motos 0km y usadas en el Nordeste",
  whatsappNumber: "5493625000000", // Código de país (54) + 9 + código de área + número, SIN + ni espacios
  phoneDisplay: "362 500 0000",
  address: "Av. 9 de Julio 1234, Resistencia, Chaco",
  hours: "Lun a Vie de 8:30 a 12:30 y de 16:30 a 20:30 · Sáb de 9 a 13",
  instagram: "https://instagram.com/tumarca",
  facebook: "https://facebook.com/tumarca",
  mapsUrl: "https://www.google.com/maps",
};

// ------------------------------------------------------------------------------
// MARCAS — las que aparecen en los filtros y en el formulario de "vendé la tuya".
// ------------------------------------------------------------------------------
export const MARCAS = ["APRILIA", "BAJAJ", "BENELLI", "CORVEN", "HONDA", "KAWASAKI", "KTM", "MOTOMEL", "VOGE", "YAMAHA"];

// ------------------------------------------------------------------------------
// DEFAULT_MOTOS — catálogo de EJEMPLO. Se muestra solo mientras todavía no
// conectaste la base de datos (ver README: "Cargar motos con perfil de
// administrador"). Una vez conectada, el catálogo real vive ahí, no acá,
// y se carga/edita desde el botón "Cargar motos" del sitio con tu usuario
// de administrador.
// ------------------------------------------------------------------------------
export const DEFAULT_MOTOS = [
  { id: 1, marca: "HONDA", modelo: "WAVE 110", anio: 2024, estado: "usado", cc: 110, km: 23680, precio: 2600000, moneda: "ARS", destacado: null, image_url: "" },
  { id: 2, marca: "KAWASAKI", modelo: "Z400", anio: 2023, estado: "usado", cc: 399, km: 7577, precio: 7200, moneda: "USD", destacado: null, image_url: "" },
  { id: 3, marca: "YAMAHA", modelo: "MT-03", anio: 2022, estado: "usado", cc: 321, km: 15200, precio: 6100, moneda: "USD", destacado: null, image_url: "" },
  { id: 4, marca: "KTM", modelo: "DUKE 390", anio: 2024, estado: "0km", cc: 373, km: 0, precio: 9800, moneda: "USD", destacado: "0KM", image_url: "" },
  { id: 5, marca: "BAJAJ", modelo: "DOMINAR 400", anio: 2025, estado: "0km", cc: 373, km: 0, precio: 6700000, moneda: "ARS", destacado: "0KM", image_url: "" },
  { id: 6, marca: "BENELLI", modelo: "TRK 702", anio: 2025, estado: "usado", cc: 700, km: 1822, precio: 12000000, moneda: "ARS", destacado: "RESERVADA", image_url: "" },
  { id: 7, marca: "MOTOMEL", modelo: "SIRIUS 190", anio: 2025, estado: "0km", cc: 190, km: 0, precio: 3900000, moneda: "ARS", destacado: "0KM", image_url: "" },
  { id: 8, marca: "VOGE", modelo: "900DSX", anio: 2025, estado: "usado", cc: 900, km: 7334, precio: 21000000, moneda: "ARS", destacado: null, image_url: "" },
  { id: 9, marca: "CORVEN", modelo: "TRIAX 150", anio: 2023, estado: "usado", cc: 150, km: 9800, precio: 2100000, moneda: "ARS", destacado: null, image_url: "" },
  { id: 10, marca: "APRILIA", modelo: "RS 660", anio: 2023, estado: "usado", cc: 659, km: 4200, precio: 13500, moneda: "USD", destacado: null, image_url: "" },
  { id: 11, marca: "YAMAHA", modelo: "RAY ZR 125", anio: 2025, estado: "usado", cc: 125, km: 6300, precio: 4000000, moneda: "ARS", destacado: null, image_url: "" },
  { id: 12, marca: "KAWASAKI", modelo: "Z900", anio: 2021, estado: "usado", cc: 900, km: 21970, precio: 16000, moneda: "USD", destacado: null, image_url: "" },
];
