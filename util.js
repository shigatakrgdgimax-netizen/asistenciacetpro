// Funciones de apoyo compartidas

const ZONA = "America/Lima";

export function fechaLima(d = new Date()) {
  // Formato AAAA-MM-DD en hora de Perú
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(d);
}

export function horaLima(d = new Date()) {
  // Formato HH:MM:SS en hora de Perú
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).format(d);
}

export function fechaBonita(f) {
  // "2026-10-26" -> "26/10/2026"
  const [a, m, d] = f.split("-");
  return `${d}/${m}/${a}`;
}

export function ocultarDni(dni) {
  // 12345678 -> 12****78
  return `${dni.slice(0, 2)}****${dni.slice(-2)}`;
}

export function normalizar(t) {
  return (t || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function limpiarEspacios(t) {
  return t.replace(/\s+/g, " ").trim();
}

export function soloDigitos(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
  });
}

export function mostrarMensaje(el, tipo, texto) {
  el.className = `mensaje visible ${tipo}`;
  el.textContent = texto;
}

export function ocultarMensaje(el) {
  el.className = "mensaje";
  el.textContent = "";
}
