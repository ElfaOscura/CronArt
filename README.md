<div align="center">

# 🎨 CronArt

**El planificador visual para ilustradores.**
Calendario con post-its, tablero de producción y efemérides, todo en tu navegador y sin cuentas.

[![PWA](https://img.shields.io/badge/PWA-instalable-3341c4?logo=pwa&logoColor=white)](#-instalar-como-app)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-vanilla-f7df1e?logo=javascript&logoColor=black)](#-tecnologías)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss&logoColor=white)](#-tecnologías)
[![ES | EN](https://img.shields.io/badge/idioma-ES%20%7C%20EN-5b2fc9)](#-características)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Inv%C3%ADtame%20un%20caf%C3%A9-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/naidi_art)

</div>

---

## ✨ Características

| | |
|---|---|
| 📅 **Calendario mensual** | Cada dibujo es un *post-it* en su día, con el color y el icono de su tipo. Las efemérides se muestran solas. |
| 🗂️ **Tablero Kanban** | Columnas por estado, orden por fecha, anillos con el porcentaje de avance y cambio de estado desde la tarjeta. |
| 📌 **Pendientes** | Columna lateral con las comisiones y collabs que aún no se entregan. |
| ⭐ **Destacados** | Barra superior con tus notas favoritas. Límite global de **5**. |
| 🔎 **Filtros y buscador** | Filtra por tipo y estado, o busca por título y notas. |
| 🌗 **Tema claro y oscuro** | Paleta fría con contraste alto y animaciones suaves (respeta *reducir movimiento*). |
| 🌐 **Español / English** | Cambio de idioma al instante. |
| 👤 **Perfil de artista** | Nombre y redes (X, Instagram, Facebook, TikTok, Pinterest) con accesos directos siempre visibles. |
| 💾 **Respaldo JSON** | Exporta e importa todos tus datos. |
| 📲 **PWA** | Instalable y con funcionamiento sin conexión. |

### Tipos de dibujo y estados

| Tipo | Icono | Estados |
|---|:--:|---|
| Efeméride / Dibujo libre | 📎 / ✏️ | Sin empezar → Boceto → En proceso → Realizado → Publicado |
| Comisión | 💼 | Sin empezar → Boceto → En proceso → Realizado → Entregado → Publicado |
| Collab | 🤝 | Sin empezar → Boceto → En proceso → Realizado → Entregado |
| Collab (si eres el dueño) | 🤝 | Los anteriores + **En espera de otros** |

Cada dibujo guarda: título, fecha, tipo, estado, estrella, casilla de OC, hasta 3 enlaces de referencia o una imagen local, y un caption o notas.

---

## 🚀 Cómo usarlo


Abre la dirección que te indique (por ejemplo `http://localhost:8000`).


### Primeros pasos

1. Al abrir por primera vez, escribe tu **nombre de artista** y tus usuarios de redes.
2. Pulsa **＋** o haz clic en cualquier día del calendario para añadir un dibujo.
3. Si el día es una efeméride, la casilla viene marcada y el título se rellena solo.
4. Cambia entre **Calendario** y **Tablero** con los botones del centro.
5. Abre el menú **☰** para perfil, tema, idioma, respaldo e instalación.

### 📲 Instalar como app

En Chrome o Edge aparece **Instalar app** en el menú ☰ (o el icono de instalación en la barra de direcciones). En iOS usa **Compartir → Añadir a pantalla de inicio**.

---

## 💾 ¿Dónde se guardan mis datos?

**Solo en tu dispositivo.** CronArt no tiene servidor ni cuentas: todo vive en el `localStorage` de tu navegador bajo la clave `cronart:v1`.

```jsonc
{
  "profile": { "name": "…", "social": { "x": "usuario", "ig": "usuario" } },
  "items":   [ { "id": "…", "date": "2026-11-05", "title": "…", "type": "free",
                 "status": "todo", "star": false, "owner": false, "oc": false,
                 "refs": [], "caption": "", "img": "" } ],
  "lang": "es",
  "theme": "light"
}
```

**Ten en cuenta:**

- Los datos son **por navegador y por dispositivo**: no se sincronizan solos.
- Borrar los datos del sitio o usar modo incógnito los elimina.
- Las imágenes locales se reducen a 800 px y se guardan dentro del JSON, y `localStorage` suele tener un límite de unos 5 MB. Para muchas imágenes, prefiere enlaces de referencia.
- **Haz respaldos con frecuencia:** menú ☰ → *Respaldo JSON (exportar)*. Para pasar tus datos a otro dispositivo, usa *Restaurar respaldo* allí.

---

## 🗃️ Estructura del proyecto

```
cronart/
├── index.html              # Estructura base y carga de librerías
├── manifest.webmanifest    # Configuración de la PWA
├── sw.js                   # Service worker (caché y modo sin conexión)
├── README.md
├── icons/
│   └── icon.svg            # Icono de la app
├── css/
│   └── styles.css          # Temas, post-its, calendario, tablero y animaciones
└── js/
    ├── app.js              # Eventos, modales, menú, perfil, filtros y respaldo
    ├── views.js            # Vistas: calendario, kanban, pendientes y destacados
    ├── store.js            # Estado, persistencia, tipos, estados y utilidades
    ├── i18n.js             # Textos en español e inglés
    └── data/
        └── eph.js          # Base de datos de efemérides (EPH)
```

### Efemérides

`js/data/eph.js` exporta `EPH`, una matriz con el formato `[mes, día, 'Nombre ES', 'Name EN']`. Para agregar una, añade una fila:

```js
[3, 27, 'Teatro', 'Theatre Day'],
```

---

## 🧰 Tecnologías

- **HTML + JavaScript vanilla** con módulos ES, sin *build step*.
- **[Tailwind CSS](https://tailwindcss.com/)** (CDN) más CSS propio con variables para los temas.
- **[Lucide](https://lucide.dev/)** como única librería de iconos.
- **Google Fonts**: Geom y Plus Jakarta Sans.
- **PWA**: manifest y service worker con estrategia *stale-while-revalidate*.

Las librerías externas se cargan por CDN y se guardan en caché tras la primera visita. Para usar CronArt sin conexión desde la primera vez, abre la app una vez con internet.

## 🔧 Personalización

| Qué | Dónde |
|---|---|
| Colores y tema | Variables `:root` y `[data-theme=dark]` en `css/styles.css` |
| Colores de cada tipo de nota | Clases `.pi-*` y `.k-*` en `css/styles.css` |
| Textos e idiomas | `js/i18n.js` |
| Enlace de GitHub del menú | Constante `GITHUB` en `js/app.js` |
| Redes sociales soportadas | Objeto `NET` en `js/app.js` |

---

## ☕ Apoya el proyecto

Si CronArt te ayuda a organizar tu arte, puedes invitarme un café:

<div align="center">

[![Ko-fi](https://img.shields.io/badge/☕%20Inv%C3%ADtame%20un%20caf%C3%A9%20en%20Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/naidi_art)

**https://ko-fi.com/naidi_art**

</div>

---

## 🇬🇧 English summary

**CronArt** is a free, offline-capable planner for illustrators: a monthly calendar with sticky-note style drawings, a Kanban production board, built-in observances, up to 5 featured notes, filters and search, light/dark themes and an ES/EN interface. It is installable as a PWA.

- **Run it:** serve the folder over HTTP (`npx serve .`); `file://` won't work.
- **Data:** stored only in your browser's `localStorage` (key `cronart:v1`). Export a JSON backup regularly from the ☰ menu.
- **Support:** buy me a coffee at [ko-fi.com/naidi_art](https://ko-fi.com/naidi_art) ☕

<div align="center"><sub>Hecho con 💜 para quienes dibujan.</sub></div>
