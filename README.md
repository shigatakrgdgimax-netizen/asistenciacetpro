# CETPRO San Pedro de Aplao - Control de asistencia

Sistema web (HTML, CSS, JavaScript y Firebase Firestore) para registrar estudiantes, marcar asistencia y consultar el listado.

## Archivos
- `index.html`, `registro.html`, `asistencia.html`, `listado.html`
- `estilos.css`
- `js/firebase.js` (conexión), `js/registro.js`, `js/asistencia.js`, `js/listado.js`, `js/util.js`
- `img/fachada.jpg`, `img/logo.png`
- `firestore.rules` (reglas de seguridad)

## 1. Preparar Firestore
1. Firebase Console > proyecto **patak-bf0fd** > **Firestore Database** > *Crear base de datos* (región cercana, modo producción).
2. Pestaña **Reglas**: pega el contenido de `firestore.rules` y pulsa **Publicar**.
3. Las colecciones (`estudiantes`, `estudiantes_privado`, `marcas`, `asistencias`) se crean solas con el primer registro.

## 2. Probar en tu computadora
Los módulos JavaScript no funcionan abriendo el HTML con doble clic. Usa un servidor local:
`python -m http.server 8000` y abre `http://localhost:8000`.

## 3. GitHub
```
git init
git add .
git commit -m "Sistema de asistencia CETPRO"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cetpro-asistencia.git
git push -u origin main
```

## 4. Vercel
1. vercel.com > *Add New Project* > importa el repositorio.
2. Framework Preset: **Other**. Sin comando de build. Directorio de salida: dejar vacío (raíz).
3. *Deploy* y comparte el enlace por WhatsApp.

## Seguridad: qué protegen las reglas
- Los celulares se guardan en `estudiantes_privado`, que nadie puede leer desde la web.
- No se puede listar la colección `estudiantes`: solo se consulta un estudiante si se conoce su DNI.
- El listado público usa `asistencias`, que solo guarda nombre, programa, fecha, hora y DNI oculto (`12****78`).
- Nadie puede editar ni borrar registros desde la web.
- La marca diaria (`marcas`, id = DNI + fecha) impide marcar dos veces el mismo día.

Limitación: sin inicio de sesión, cualquier persona con el enlace puede registrar o marcar. Para uso real conviene agregar Firebase Authentication o App Check. Para el examen usa datos ficticios o con autorización.
