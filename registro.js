import { db, doc, getDoc, writeBatch, serverTimestamp } from "./firebase.js";
import { soloDigitos, limpiarEspacios, mostrarMensaje, ocultarMensaje } from "./util.js";

const PROGRAMAS = ["Informática", "Peluquería y Barbería", "Corte y Ensamblaje"];
const form = document.getElementById("form-registro");
const msg = document.getElementById("mensaje");
const btn = document.getElementById("btn-guardar");
const campos = ["dni", "celular", "nombres", "apellidos", "programa", "autorizo"];
const el = (id) => document.getElementById(id);

soloDigitos(el("dni"));
soloDigitos(el("celular"));

function error(id, texto) {
  const campo = el(id);
  el("e-" + id).textContent = texto;
  if (campo.type !== "checkbox") campo.setAttribute("aria-invalid", texto ? "true" : "false");
}

function validar() {
  let ok = true;
  campos.forEach((c) => error(c, ""));

  const dni = el("dni").value.trim();
  const celular = el("celular").value.trim();
  const nombres = limpiarEspacios(el("nombres").value);
  const apellidos = limpiarEspacios(el("apellidos").value);
  const programa = el("programa").value;
  const letras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{2,60}$/;

  if (!/^\d{8}$/.test(dni)) { error("dni", "El DNI debe tener exactamente 8 dígitos."); ok = false; }
  if (!/^9\d{8}$/.test(celular)) { error("celular", "Escribe 9 dígitos y que empiece con 9."); ok = false; }
  if (!letras.test(nombres)) { error("nombres", "Escribe tus nombres (solo letras)."); ok = false; }
  if (!letras.test(apellidos)) { error("apellidos", "Escribe tus apellidos (solo letras)."); ok = false; }
  if (!PROGRAMAS.includes(programa)) { error("programa", "Elige un programa de estudios."); ok = false; }
  if (!el("autorizo").checked) { error("autorizo", "Debes confirmar que los datos son ficticios o autorizados."); ok = false; }

  return ok ? { dni, celular, nombres: nombres.toUpperCase(), apellidos: apellidos.toUpperCase(), programa } : null;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  ocultarMensaje(msg);
  const datos = validar();
  if (!datos) {
    mostrarMensaje(msg, "error", "Revisa los campos marcados.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Guardando...";
  try {
    // Evitar duplicados: el DNI es el identificador del documento
    const refEst = doc(db, "estudiantes", datos.dni);
    const existe = await getDoc(refEst);
    if (existe.exists()) {
      error("dni", "Este DNI ya está registrado.");
      mostrarMensaje(msg, "error", "Ese DNI ya fue registrado. Puedes ir a marcar tu asistencia.");
      return;
    }

    // Datos de clase (lectura puntual por DNI) y datos privados (nadie los puede leer desde la web)
    const lote = writeBatch(db);
    lote.set(refEst, {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      programa: datos.programa,
      creado: serverTimestamp()
    });
    lote.set(doc(db, "estudiantes_privado", datos.dni), {
      celular: datos.celular,
      creado: serverTimestamp()
    });
    await lote.commit();

    form.reset();
    campos.forEach((c) => error(c, ""));
    mostrarMensaje(msg, "ok", `Listo. ${datos.nombres} ${datos.apellidos} quedó registrado en ${datos.programa}.`);
  } catch (err) {
    console.error(err);
    if (err.code === "permission-denied") {
      mostrarMensaje(msg, "error", "Firebase rechazó el registro. Revisa que las reglas de Firestore estén publicadas y que el DNI no exista ya.");
    } else {
      mostrarMensaje(msg, "error", "No se pudo guardar. Revisa tu conexión e inténtalo otra vez.");
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar estudiante";
  }
});
