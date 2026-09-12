export function formatMoney(value, currency) {
  const formatted = new Intl.NumberFormat("es-AR").format(value);
  // Espacio "duro" (no separable) entre el signo y el número, para que
  // nunca queden en renglones distintos si el cuadro es angosto.
  return currency === "USD" ? `US$\u00A0${formatted}` : `$\u00A0${formatted}`;
}

export function waLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
