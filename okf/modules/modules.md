# Módulos y Componentes de la Aplicación

La base de código de ShareFile es ligera y compacta, diseñada para ejecutarse íntegramente en el navegador sin frameworks complejos, lo que garantiza tiempos de carga casi instantáneos y un rendimiento óptimo.

---

## 🏗️ 1. Estructura del DOM (`index.html`)

El archivo [index.html](file:///c:/Users/danie/apps/sharefile/sharefile/index.html) actúa como la plantilla principal de la aplicación. Utiliza una arquitectura de **Aplicación de una Sola Página (SPA)** basada en tres contenedores de vistas principales que se activan o desactivan dinámicamente:

| Identificador de Vista | Selector CSS | Rol Funcional |
|-------------------------|--------------|---------------|
| **Inicio / Emisor** | `#view-home` | Contiene la zona de arrastre (`drop-zone`) de archivos para el usuario emisor. |
| **Receptor Inicial** | `#view-receiver` | Pantalla de carga y espera que ve el receptor mientras se conecta al emisor. |
| **Panel de Transferencia** | `#view-transfer` | Vista compartida (por ambos roles) que muestra el progreso de subida/bajada, estadísticas de velocidad, porcentaje, y botones finales de descarga o reinicio. |

### Componentes Persistentes y Modales
* **Cabecera (`.app-header`)**: Aloja el logo del proyecto, el botón de ayuda (`#info-btn`), el selector de idioma (`#lang-selector`) y la insignia dinámica de estado de conexión (`#connection-status`).
* **Herramientas del Emisor (`#sender-persistent-tools`)**: Tarjeta persistente para el emisor que expone el enlace URL generado y el botón para copiar al portapapeles.
* **Modal Informativo (`#info-modal`)**: Modal en superposición (`.modal-overlay`) que carga de forma dinámica los archivos de documentación `README.md` o `README_en.md` de acuerdo con el idioma activo, procesándolos a HTML en tiempo de ejecución con **Marked.js**.

---

## 🧠 2. Controlador Lógico (`script.js`)

El archivo [script.js](file:///c:/Users/danie/apps/sharefile/sharefile/script.js) gestiona toda la máquina de estados de la aplicación, interactuando con la API de PeerJS y manipulando el DOM de forma reactiva.

### Estados de la Aplicación
```javascript
let peer = null;                    // Instancia raíz de PeerJS
let conn = null;                    // Canal de datos activo (DataConnection)
let fileBuffer = [];                // Buffer temporal de trozos binarios
let receivedSize = 0;               // Tamaño acumulado recibido en bytes
let fileSize = 0;                   // Tamaño total del archivo actual
let fileName = '';                  // Nombre del archivo actual
let isTransferring = false;         // Bandera de bloqueo de transferencia activa
let currentRole = null;             // 'sender' | 'receiver'
let currentTargetId = null;         // ID de peer al que el receptor intenta conectarse
```

### Motor de Traducción Ligero (i18n)
La aplicación cuenta con traducción completa al inglés (`en`) y español (`es`).
* El diccionario se almacena en el objeto plano `translations`.
* El idioma activo se determina leyendo las preferencias de `localStorage` o el idioma por defecto del sistema del usuario (`navigator.language`).
* La función `setLanguage(lang)` recorre de manera eficiente los elementos del DOM que posean el atributo `data-i18n` y actualiza dinámicamente su contenido HTML o marcador de posición (`placeholder`).

---

## 🎨 3. Sistema de Diseño Estético (`style.css`)

El archivo [style.css](file:///c:/Users/danie/apps/sharefile/sharefile/style.css) define una interfaz moderna de estética visual premium basada en el concepto de **Cristalmorfismo (Glassmorphism)** y un fondo interactivo y vivo.

### Variables del Sistema de Diseño (Tokens)
La hoja de estilos está centralizada en torno a variables CSS configuradas en la pseudoclase `:root`, facilitando cambios de colores armoniosos y consistentes:

```css
:root {
    --primary: #6366f1;         /* Indigo */
    --primary-hover: #4f46e5;
    --success: #10b981;         /* Esmeralda */
    --error: #ef4444;           /* Coral */
    --text-main: #f8fafc;       /* Slate 50 */
    --text-muted: #94a3b8;      /* Slate 400 */
    --bg-app: #030712;          /* Slate 950 (Fondo ultra oscuro premium) */
    --glass-bg: rgba(30, 41, 59, 0.45); /* Panel de vidrio translúcido */
    --glass-border: rgba(255, 255, 255, 0.08);
    --font-sans: 'Outfit', sans-serif;
}
```

### Animaciones de Fondo Dinámicas
Para aportar dinamismo visual sin consumir CPU excesiva, se implementan tres "Blobs" de color que flotan en segundo plano detrás del contenedor principal:
* **Efectos de desenfoque (`backdrop-filter: blur()`)**: Crean una profunda atmósfera de panel de cristal suspendido sobre luces de colores.
* **Fotogramas clave (`@keyframes float-blob`)**: Animan las coordenadas y transformaciones de escala de los blobs con un ritmo suave de respiración orgánica.
