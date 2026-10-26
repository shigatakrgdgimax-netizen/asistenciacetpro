import { db, collection, onSnapshot, query, orderBy, limit } from "./firebase.js";
import { fechaBonita, normalizar, mostrarMensaje, ocultarMensaje } from "./util.js";

const el = (id) => document.getElementById(id);
const tabla = el("tabla");
const msg = el("mensaje");
let registros = [];

function esc(t) {
  return String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function pintar() {
  const texto = normalizar(el("buscar").value);
  const fecha = el("filtro-fecha").value;
  const visibles = registros.filter((r) =>
    (!texto || normalizar(r.nombre).includes(texto)) && (!fecha || r.fecha === fecha)
  );

  el("total").textContent = registros.length;
  el("mostrando").textContent = visibles.length;

  if (!visibles.length) {
    tabla.innerHTML = `<tr><td class="vacio" colspan="5">${
      registros.length ? "No hay asistencias que coincidan con la búsqueda." : "Aún no hay asistencias registradas."
    }</td></tr>`;
    return;
  }
  tabla.innerHTML = visibles.map((r) => `
    <tr>
      <td class="nombre" data-label="Nombre">${esc(r.nombre)}</td>
      <td data-label="Programa">${esc(r.programa)}</td>
      <td data-label="Fecha">${esc(fechaBonita(r.fecha))}</td>
      <td data-label="Hora">${esc(r.hora)}</td>
      <td class="dni" data-label="DNI">${esc(r.dniOculto)}</td>
    </tr>`).join("");
}

el("buscar").addEventListener("input", pintar);
el("filtro-fecha").addEventListener("input", pintar);
el("btn-limpiar").addEventListener("click", () => {
  el("buscar").value = "";
  el("filtro-fecha").value = "";
  pintar();
});

// Tiempo real: la tabla se actualiza sola cuando alguien marca asistencia
const q = query(collection(db, "asistencias"), orderBy("timestamp", "desc"), limit(500));
onSnapshot(q, (snap) => {
  ocultarMensaje(msg);
  registros = snap.docs.map((d) => d.data());
  pintar();
}, (err) => {
  console.error(err);
  mostrarMensaje(msg, "error", "No se pudo leer Firestore. Revisa que las reglas estén publicadas y tu conexión.");
});
