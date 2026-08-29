export function formatMoney(value, currency) {
  const formatted = new Intl.NumberFormat("es-AR").format(value);
  return currency === "USD" ? `US$ ${formatted}` : `$ ${formatted}`;
}

export function waLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
