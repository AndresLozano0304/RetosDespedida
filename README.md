# 🔥 Bromas Despedida Sayago

App web (PWA) con los 54 retos de la despedida. Cada reto completado desbloquea
un vale por un premio. El progreso se sincroniza en tiempo real entre todos los
móviles del grupo usando Firebase Firestore (plan gratuito, sin servidor
propio).

## Contenido de la carpeta

- `index.html` — pantalla principal (retos + mis vales)
- `css/style.css` — estilos
- `js/challenges.js` — **lista de retos, puntos y premios** (edítala aquí si cambia algo)
- `js/firebase-config.js` — credenciales de tu proyecto de Firebase (a rellenar)
- `js/app.js` — lógica de la app
- `manifest.json` / `sw.js` — hacen la app instalable (PWA)
- `icons/` — iconos de la app
- `img/retos/` — las 3 fotos premio que se van desbloqueando por puntos (ver
  sección "Puntos y fotos premio" más abajo)

## 1. Configurar Firebase (gratis, ~5 minutos)

1. Ve a https://console.firebase.google.com y crea un proyecto nuevo (nombre
   libre, ej. "retos-sayago"). No hace falta activar Analytics.
2. En el menú lateral entra en **Build → Firestore Database** → **Crear base
   de datos** → elige una región (ej. eur3 / europe-west) → empieza en **modo
   de prueba** (test mode).
3. Ve a la pestaña **Reglas** de Firestore y pon esto (abierto para lectura y
   escritura, suficiente para un evento privado puntual; nadie debería
   compartir la URL fuera del grupo):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

4. Ve a **Configuración del proyecto** (icono del engranaje) → pestaña
   **General** → sección "Tus apps" → añade una app **Web** (icono `</>`).
   Dale un nombre y copia el objeto `firebaseConfig` que te muestra.
5. Pega esos valores en [`js/firebase-config.js`](js/firebase-config.js),
   sustituyendo los `"TU_..."`. Este archivo se carga con un `<script>`
   normal, así que debe contener **solo** el objeto `firebaseConfig` — no
   añadas líneas `import` ni `initializeApp` (eso ya lo hace `js/app.js`).

Si no configuras Firebase, la app sigue funcionando pero cada móvil guardará
su propio progreso en local (no compartido) — útil para probar antes de
tenerlo listo.

## 2. Probar en local

Abre una terminal en esta carpeta y ejecuta un servidor estático simple
(no puede abrirse con doble clic por restricciones del navegador con
Service Workers y `fetch`):

```bash
npx serve .
```

o con Python:

```bash
python -m http.server 8080
```

Abre `http://localhost:8080` en el navegador del móvil (misma red WiFi que
el ordenador) o en el navegador del propio PC.

## 3. Desplegar en GitHub Pages (gratis)

```bash
git init
git add .
git commit -m "Primera version de la app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: Deploy from a branch → main /
(root)** → Guardar. En 1-2 minutos tu app estará en:

```
https://TU_USUARIO.github.io/TU_REPO/
```

Esa es la URL que compartirás con el grupo.

## 4. Generar el APK (gratis, sin Android Studio)

1. Ve a https://www.pwabuilder.com
2. Pega la URL de GitHub Pages del paso anterior y pulsa **Start**.
3. PWABuilder analizará la PWA (manifest, service worker, iconos ya están
   listos). Ve a la pestaña **Android** → **Generate Package**.
4. Descarga el `.apk` (o `.aab`) generado.
5. Pásalo al móvil (por ejemplo por WhatsApp/Drive) e instálalo. Android
   pedirá permitir "instalar apps de fuentes desconocidas" la primera vez.

Alternativa sin instalar nada: desde el propio navegador del móvil (Chrome
Android), al entrar en la URL debería aparecer un banner o menú **"Instalar
app" / "Añadir a pantalla de inicio"** — se instala igual como icono, sin
pasar por PWABuilder.

## 5. Editar retos o premios

Abre [`js/challenges.js`](js/challenges.js) y cambia el texto de `text` o
`prize` de cualquier reto. No cambies el `id` de retos ya publicados o se
perderá su relación con el progreso guardado.

## 6. Puntos y fotos premio

Cada reto tiene un campo `points` en `js/challenges.js` (1 = trivial, 5 = muy
duro, el reto estrella vale más). A más "hardcore" el reto, más puntos —
ajusta esos números libremente, todo lo demás se recalcula solo.

Además de los vales, hay 3 fotos sorpresa que se cortan en una cuadrícula de
2x3 (6 piezas) y se van revelando trozo a trozo según el grupo suma puntos:
al completar retos que sumen 1/18 del total de puntos posibles se revela la
primera pieza, y así hasta completar las 18 piezas (primero se completa la
foto 1, luego la 2, luego la 3).

Para activarlo, copia tus 3 fotos dentro de `img/retos/` con estos nombres
exactos (o cambia los nombres en `PRIZE_IMAGES`, en `js/challenges.js`):

- `img/retos/premio1.jpg`
- `img/retos/premio2.jpg`
- `img/retos/premio3.jpg`

Mientras esas fotos no existan, la pestaña "🖼️ Premios" muestra un aviso de
"Imagen pendiente" sin romper el resto de la app.

### Prueba gráfica por reto

En la pestaña de retos, cada tarjeta tiene un botón "📎 Añadir foto/vídeo de
prueba" para adjuntar una prueba gráfica del reto cumplido (máx. 4 MB). Esa
prueba se guarda **solo en el móvil que la sube** (no se sincroniza por
Firebase, a diferencia del progreso de retos/vales): un vídeo en base64
supera fácilmente el límite de 1 MB por documento de Firestore, así que
mezclarlo con el progreso compartido rompería la sincronización del grupo.

## 7. Categorías por día y objetivo de puntos

Cada reto tiene un campo `category` en `js/challenges.js`: `"genericos"`
(sin restricción, visible desde el minuto uno) o `"viernes"` / `"sabado"` /
`"domingo"`. Los retos de un día concreto quedan **ocultos por completo**
(sin texto ni pistas, solo un contador tipo "🔒 12 retos guardados para el
viernes") hasta que el reloj del propio dispositivo alcanza la fecha de
`CATEGORY_UNLOCK` de esa categoría — así nadie hace spoiler del reto del
barco el viernes, por ejemplo. La ruleta tampoco puede sortear un reto
todavía bloqueado.

Las fechas de desbloqueo (`CATEGORY_UNLOCK`, en `js/challenges.js`) están
puestas para la despedida del 24-26 de julio de 2026; cambialas ahí si las
fechas reales varían.

Además, viernes y sábado tienen un **objetivo de puntos** (`DAILY_MILESTONES`)
pensado para que no baste con hacer solo retos fáciles ("chorra", 1-2 puntos):
el número está calculado para que sea matemáticamente imposible llegar sin
completar al menos uno o dos retos más arriesgados de ese día. El cálculo
exacto está documentado en el comentario junto a `DAILY_MILESTONES` en
`js/challenges.js` — si añades o quitas retos, conviene revisar ese cálculo
(hay un script de verificación rápido: `node -e` cargando el archivo con
`vm.runInContext`, ver el historial de commits para un ejemplo). El domingo
no tiene objetivo a propósito: es solo la mañana de la vuelta.

## Notas

- El reto estrella ("RETO ESTRELLA: montarlo el sábado en un bus...") se
  dejó con un premio de ejemplo/genérico porque no se especificó uno
  concreto — cámbialo en `challenges.js` si queréis algo distinto.
- El botón **"Reiniciar progreso (admin)"** al final de la app borra el
  progreso de TODO el grupo (pide doble confirmación). Útil para dejarlo a
  cero antes de empezar la despedida.
- Las reglas de Firebase de arriba son abiertas (cualquiera con la URL de la
  base de datos podría leer/escribir). Es aceptable para un evento privado y
  temporal; no seria apropiado para una app publica o de larga duracion.
