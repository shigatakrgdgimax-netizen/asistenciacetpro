import { db, doc, getDoc, collection, writeBatch, serverTimestamp } from "./firebase.js";
import { soloDigitos, fechaLima, horaLima, fechaBonita, ocultarDni, mostrarMensaje, ocultarMensaje } from "./util.js";

const el = (id) => document.getElementById(id);
const form = el("form-buscar");
const msg = el("mensaje");
const tarjeta = el("estudiante");
const btnBuscar = el("btn-buscar");
const btnConfirmar = el("btn-confirmar");
let actual = null; // { dni, nombre, programa }
let relojId = null;

soloDigitos(el("dni"));

function pintarReloj() {
  const ahora = new Date();
  el("reloj").textContent = `${fechaBonita(fechaLima(ahora))} a las ${horaLima(ahora)}`;
}

function reiniciar() {
  actual = null;
  tarjeta.classList.remove("visible");
  clearInterval(relojId);
  btnConfirmar.disabled = false;
  btnConfirmar.textContent = "Confirmar asistencia";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  reiniciar();
  ocultarMensaje(msg);
  el("e-dni").textContent = "";
  el("dni").setAttribute("aria-invalid", "false");

  const dni = el("dni").value.trim();
  if (!/^\d{8}$/.test(dni)) {
    el("e-dni").textContent = "El DNI debe tener exactamente 8 dígitos.";
    el("dni").setAttribute("aria-invalid", "true");
    return;
  }

  btnBuscar.disabled = true;
  btnBuscar.textContent = "Buscando...";
  try {
    const snap = await getDoc(doc(db, "estudiantes", dni));
    if (!snap.exists()) {
      mostrarMensaje(msg, "error", "Ese DNI no está registrado. Primero regístrate en la página \"Registrar estudiante\".");
      return;
    }
    const d = snap.data();
    actual = { dni, nombre: `${d.nombres} ${d.apellidos}`, programa: d.programa };
    el("est-nombre").textContent = actual.nombre;
    el("est-programa").textContent = actual.programa;
    tarjeta.classList.add("visible");
    pintarReloj();
    relojId = setInterval(pintarReloj, 1000);

    // ¿Ya marcó hoy? (lectura puntual por DNI + fecha)
    const marca = await getDoc(doc(db, "marcas", `${dni}_${fechaLima()}`));
    if (marca.exists()) {
      btnConfirmar.disabled = true;
      btnConfirmar.textContent = "Asistencia ya marcada";
      mostrarMensaje(msg, "info", "Ya marcaste tu asistencia hoy. Vuelve mañana.");
    }
  } catch (err) {
    console.error(err);
    mostrarMensaje(msg, "error", "No se pudo consultar Firebase. Revisa tu conexión y las reglas de Firestore.");
  } finally {
    btnBuscar.disabled = false;
    btnBuscar.textContent = "Buscar estudiante";
  }
});

el("btn-cancelar").addEventListener("click", () => {
  reiniciar();
  ocultarMensaje(msg);
  el("dni").value = "";
  el("dni").focus();
});

btnConfirmar.addEventListener("click", async () => {
  if (!actual) return;
  const ahora = new Date();
  const fecha = fechaLima(ahora);
  const hora = horaLima(ahora);

  btnConfirmar.disabled = true;
  btnConfirmar.textContent = "Guardando...";
  try {
    // La "marca" usa DNI + fecha como id: si ya existe, Firestore rechaza el segundo intento.
    const lote = writeBatch(db);
    lote.set(doc(db, "marcas", `${actual.dni}_${fecha}`), { fecha, creado: serverTimestamp() });
    lote.set(doc(collection(db, "asistencias")), {
      nombre: actual.nombre,
      programa: actual.programa,
      fecha,
      hora,
      dniOculto: ocultarDni(actual.dni),
      timestamp: serverTimestamp()
    });
    await lote.commit();

    const nombre = actual.nombre;
    reiniciar();
    el("dni").value = "";
    mostrarMensaje(msg, "ok", `Asistencia registrada: ${nombre}, ${fechaBonita(fecha)} a las ${hora}.`);
  } catch (err) {
    console.error(err);
    if (err.code === "permission-denied") {
      btnConfirmar.textContent = "Asistencia ya marcada";
      mostrarMensaje(msg, "info", "Ya marcaste tu asistencia hoy (o las reglas de Firestore no están publicadas).");
    } else {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = "Confirmar asistencia";
      mostrarMensaje(msg, "error", "No se pudo guardar la asistencia. Inténtalo otra vez.");
    }
  }
});
