# **ShareFile** – Transferencia P2P de archivos **sin servidores**  
_(v 1.0 – 2025)_

> **Nota del desarrollador**: El creador del proyecto no se hace responsable del contenido compartido ni de los daños que pueda provocar su uso. Utilízalo bajo tu propio riesgo.

---

## 📖  Índice  

1. [¿Qué es ShareFile?](#qué-es-sharefile)  
2. [Principios de funcionamiento](#principios-de-funcionamiento)  
   - 2.1 [WebRTC DataChannel](#webrtc-datachannel)  
   - 2.2 [PeerJS: la capa de abstracción](#peerjs-la-capa-de-abstracción)  
3. [Flujo de conexión paso a paso (ejemplo práctico)](#flujo-de-conexión-paso-a-paso-ejemplo-práctico)  
4. [Código de ejemplo completo](#código-de-ejemplo-completo)  
   - 4.1 [Receptor (destino)](#receptor-destino)  
   - 4.2 [Emisor (origen)](#emisor-origen)  
5. [Guía de uso rápido](#guía-de-uso-rápido)  
6. [Seguridad y privacidad](#seguridad-y-privacidad)  
7. [Limitaciones y solución de problemas](#limitaciones-y‑solución-de-problemas)  
8. [Preguntas frecuentes (FAQ)](#preguntas-frecuentes-faq)  
9. [Contribuir y desplegar tu propio servidor de señalización](#contribuir-y-desplegar-tu-propio-servidor-de-senalización)  
10. [Licencia y descargo de responsabilidad](#licencia-y-descargo-de-responsabilidad)  

---  

## 📦  ¿Qué es ShareFile?

**ShareFile** es una pequeña aplicación web que permite **transferir archivos directamente entre navegadores** (peer‑to‑peer) sin necesidad de ningún servidor intermedio para almacenar los datos.  

| ✅ Ventaja | 🔍 Detalle |
|-----------|------------|
| **Sin servidores de almacenamiento** | El archivo nunca pasa por la nube; solo fluye entre los dos navegadores. |
| **Sin instalación** | Solo abre `https://danielcdmconsultores.github.io/sharefile/` en tu navegador. |
| **Cifrado de extremo a extremo** | La capa WebRTC usa DTLS, lo que garantiza que la transferencia está encriptada. |
| **Sin anuncios, ni tracking ni malware** | El código es de código abierto y no incluye terceros publicitarios. |
| **Código abierto** | Basado en **PeerJS** y **WebRTC**, ambos proyectos con comunidad activa. |
| **Compatibilidad** | Funciona en los navegadores modernos (Chrome, Edge, Firefox, Safari) que soporten WebRTC. |
| **Pruebas en distintas redes** | Se ha probado en 4G/5G, Wi‑Fi, redes con proxy y entornos con NAT. En algunos casos extremos de NAT simétrica la conexión puede fallar (ver sección de limitaciones). |

> **Importante:** aunque la aplicación no usa servidores para almacenar archivos, sí necesita **un servidor de señalización** (el “signaling server”) para intercambiar la información necesaria para crear la conexión P2P. Por defecto se usa el servidor gratuito de **PeerJS Cloud**; sin embargo, es posible auto‑hostear tu propio servidor (ver sección *Contribuir*).

---

## ⚙️  Principios de funcionamiento  

### 2.1 WebRTC DataChannel  

WebRTC (Web Real‑Time Communication) es la tecnología que permite la transmisión de audio, video y **datos arbitrarios** entre navegadores sin pasar por un servidor intermedio. El canal de datos (`RTCDataChannel`) ofrece:

* **Transferencia fiable (tipo *reliable*)** o no fiable (tipo *unreliable*).  
* **Cifrado DTLS** que protege la confidencialidad e integridad.  
* **Transporte UDP** (con fallback a TCP si el firewall lo obliga).  

Para que dos navegadores se encuentren, deben pasar por un proceso de **NAT traversal** usando los protocolos **ICE**, **STUN** y, opcionalmente, **TURN**.

### 2.2 PeerJS: la capa de abstracción  

**PeerJS** simplifica todo el proceso anterior con una API de alto nivel:

```js
const peer = new Peer();                // crea un Peer y registra su ID
peer.on('open', id => console.log(id)); // ID único asignado por el servidor de señalización
const conn = peer.connect(otherPeerId); // abre una conexión de datos (DataChannel)
```

PeerJS encapsula:

| Módulo | Descripción |
|--------|-------------|
| **Signaling** | Usa WebSocket para intercambiar SDP (Session Description) y ICE candidates. |
| **STUN** | Por defecto `stun.l.google.com:19302` para descubrir la dirección pública. |
| **Gestión de Peer IDs** | Genera IDs aleatorios o permite usarlos estáticamente. |
| **Reconexión automática** | Intenta re‑establecer la conexión si se rompe. |

> **Nota:** el servidor de señalización de PeerJS **no almacena ni ve** los archivos; solo transporta los mensajes de establecimiento de la conexión.  

---  

## 🔗  Flujo de conexión paso a paso (ejemplo práctico)

A continuación se muestra el proceso típico que ocurre cuando **el navegador origen (A)** se pone en contacto con **el navegador destino (B)** usando la librería **PeerJS**.

```mermaid
flowchart TD
    A[🖥️ Navegador A – Crea Peer] -->|Obtiene PeerID| A_ID[PeerID_A]
    B[🖥️ Navegador B – Crea Peer] -->|Obtiene PeerID| B_ID[PeerID_B]
    A_ID -->|Comparte PeerID_A| UI[Usuario A copia ID y lo envía a B]
    B_ID -->|Comparte PeerID_B| UI2[Usuario B copia ID y lo envía a A]
    UI -->|Ingresa PeerID_A en B| BConn[peer.connect(PeerID_A)]
    BConn -->|Se abre WebSocket a Signaling| Signaling
    Signaling -->|Intercambio SDP/ICE| AConn[peer.on('connection')]
    AConn -->|DataChannel establecida| Channel[RTCDataChannel]
    Channel -->|Envía metadatos + chunks| B[Receptor]
    B -->|Ensambla y descarga| End[✔️ Transferencia completada]
```

### Descripción detallada

| Paso | Acción del navegador | Qué ocurre internamente |
|------|---------------------|------------------------|
| **1️⃣** | Cada navegador crea un objeto `Peer` (instancia de PeerJS). | Se abre una conexión WebSocket con el **servidor de señalización** y se genera un **Peer ID** único. |
| **2️⃣** | Los usuarios intercambian sus Peer IDs (por chat, QR, email, etc.). | El ID sirve como “dirección” del otro Peer. |
| **3️⃣** | El origen (A) **inicia** la conexión usando `peer.connect(idDest)`. | PeerJS envía una petición *offer* (SDP) al servidor de señalización, que la reenvía al destino (B). |
| **4️⃣** | El destino (B) recibe la petición y crea la **respuesta** (*answer*). | Se intercambian también los **ICE candidates** (información de NAT/STUN) para intentar abrir la ruta directa. |
| **5️⃣** | Si ambos pares pueden resolver sus candidatos, el **ICE** elige la mejor ruta y **establce** el `RTCDataChannel`. | Todo el intercambio se hace de forma **cifrada** (DTLS). |
| **6️⃣** | Con la DataChannel lista, el origen envía primero **metadatos** del archivo (nombre, tamaño, tipo). | El destino crea un `Blob` vacío y reserva espacio. |
| **7️⃣** | El origen envía el archivo en **trozos (chunks)** (p.e. 64 KB) usando `conn.send(chunk)`. | Cada chunk llega como `ArrayBuffer` y se va concatenando. |
| **8️⃣** | Cuando se envía el último chunk o un mensaje `DONE`, el destino arma el **Blob final** y dispara la descarga al usuario. | La transferencia es completada sin pasar por ningún servidor intermedio. |

---  

## 💻  Código de ejemplo completo  

> **Requisitos**  
> * Navegador con soporte WebRTC (Chrome ≥ 70, Firefox ≥ 68, Edge ≥ 79, Safari ≥ 12).  
> * Conexión **HTTPS** (WebRTC no funciona en HTTP).  
> * Acceso a la URL de la app: `https://danielcdmconsultores.github.io/sharefile/`.

A continuación tienes los dos archivos HTML/JS que puedes abrir en dos pestañas o dispositivos diferentes y probar la transferencia.  

### 4.1 Receptor (destino) – `receiver.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ShareFile – Receptor</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:1rem;background:#f9f9f9}
    #my-id{font-weight:bold;color:#2c3e50}
    #log{margin-top:1rem;background:#fff;padding:0.5rem;border:1px solid #ddd;height:200px;overflow:auto}
  </style>
</head>
<body>
  <h2>🔽 Receptor (destino)</h2>
  <p>Tu <strong>ID de Peer</strong> es <span id="my-id">...</span></p>
  <p>Comparte este ID con quien envíe el archivo.</p>

  <div id="log"></div>

  <!-- PeerJS (versión mínima) -->
  <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
  <script>
    // ---------- Variables ----------
    const logEl = document.getElementById('log');
    const myIdEl = document.getElementById('my-id');
    let receivedBuffers = []; // almacena los ArrayBuffer recibidos
    let expectedSize = 0;      // tamaño total del archivo (en bytes)
    let fileName = '';
    let fileType = '';

    // ---------- Helper ----------
    function log(msg, type = 'info'){
      const time = new Date().toLocaleTimeString();
      const line = document.createElement('div');
      line.innerHTML = `<small>[${time}]</small> ${msg}`;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
    }

    // ---------- PeerJS ----------
    const peer = new Peer(); // generación automática de ID

    peer.on('open', id => {
      myIdEl.textContent = id;
      log(`✅ Peer creado. ID: <code>${id}</code>`);
    });

    // Cuando otro peer se conecta (emisor)
    peer.on('connection', conn => {
      log(`🔗 Conexión entrante de <b>${conn.peer}</b>`);
      conn.on('open', () => log('✅ Canal de datos abierto'));

      conn.on('data', data => {
        // Tenemos dos tipos de mensajes: metadatos y chunks
        if (data.meta) {
          // Primer mensaje: metadatos del archivo
          fileName = data.meta.name;
          expectedSize = data.meta.size;
          fileType = data.meta.type;
          log(`📦 Recibiendo <b>${fileName}</b> (${(expectedSize/1024/1024).toFixed(2)} MiB)`);
          receivedBuffers = []; // reset
        } else if (data.done) {
          // Fin de transmisión
          log('✅ Transferencia completada, ensamblando archivo...');
          const blob = new Blob(receivedBuffers, {type: fileType});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.textContent = `📥 Descargar "${fileName}"`;
          a.style.display = 'block';
          a.style.marginTop = '1rem';
          document.body.appendChild(a);
          // Liberar recursos
          setTimeout(() => URL.revokeObjectURL(url), 30_000);
        } else if (data.chunk) {
          // Chunk recibido
          receivedBuffers.push(data.chunk);
          const received = receivedBuffers.reduce((s, b) => s + b.byteLength, 0);
          const percent = ((received / expectedSize) * 100).toFixed(1);
          log(`📦 Chunk recibido – ${percent}%`);
        } else {
          log('⚠️ Mensaje desconocido', 'warn');
        }
      });

      conn.on('close', () => log('❎ Conexión cerrada'));
      conn.on('error', err => log(`❌ Error: ${err}`, 'error'));
    });
  </script>
</body>
</html>
```

### 4.2 Emisor (origen) – `sender.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ShareFile – Emisor</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:1rem;background:#f9f9f9}
    #my-id{font-weight:bold;color:#2c3e50}
    #log{margin-top:1rem;background:#fff;padding:0.5rem;border:1px solid #ddd;height:200px;overflow:auto}
  </style>
</head>
<body>
  <h2>🔺 Emisor (origen)</h2>

  <p>Tu <strong>ID de Peer</strong> es <span id="my-id">...</span></p>

  <label for="dest-id">ID del receptor:</label>
  <input type="text" id="dest-id" placeholder="Ej.: 28a3b7d9" size="30"><br><br>

  <input type="file" id="file-input"><br><br>
  <button id="send-btn" disabled>📤 Enviar archivo</button>

  <div id="log"></div>

  <!-- PeerJS -->
  <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
  <script>
    // ---------- UI ----------
    const myIdEl = document.getElementById('my-id');
    const destIdInput = document.getElementById('dest-id');
    const fileInput = document.getElementById('file-input');
    const sendBtn = document.getElementById('send-btn');
    const logEl = document.getElementById('log');

    // ---------- Helpers ----------
    function log(msg, type = 'info'){
      const time = new Date().toLocaleTimeString();
      const line = document.createElement('div');
      line.innerHTML = `<small>[${time}]</small> ${msg}`;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
    }

    // ---------- PeerJS ----------
    const peer = new Peer(); // Auto‑generates ID
    let conn = null; // DataConnection
    let selectedFile = null;

    peer.on('open', id => {
      myIdEl.textContent = id;
      log(`✅ Peer creado. ID: <code>${id}</code>`);
    });

    // Cuando el usuario elige un archivo, habilitamos el botón
    fileInput.addEventListener('change', () => {
      selectedFile = fileInput.files[0];
      if (selectedFile) {
        log(`📄 Archivo seleccionado: <b>${selectedFile.name}</b> (${(selectedFile.size/1024/1024).toFixed(2)} MiB)`);
        sendBtn.disabled = false;
      } else {
        sendBtn.disabled = true;
      }
    });

    // Conexión al receptor
    function connectToPeer() {
      const destId = destIdInput.value.trim();
      if (!destId) {
        alert('Introduce el ID del receptor');
        return;
      }
      log(`🔗 Intentando conectar a <b>${destId}</b>…`);
      conn = peer.connect(destId, {reliable: true}); // DataChannel fiable
      conn.on('open', () => {
        log('✅ Conexión establecida. Iniciando envío…');
        enviarArchivo();
      });
      conn.on('close', () => log('❎ Conexión cerrada'));
      conn.on('error', err => log(`❌ Error de conexión: ${err}`, 'error'));
    }

    // Envío del archivo en chunks
    function enviarArchivo() {
      if (!selectedFile) {
        log('⚠️ Ningún archivo seleccionado', 'warn');
        return;
      }
      const CHUNK_SIZE = 64 * 1024; // 64 KB
      const file = selectedFile;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let offset = 0;
      const reader = new FileReader();

      // 1️⃣ Enviamos los metadatos
      conn.send({meta: {name: file.name, size: file.size, type: file.type}});
      log('📦 Enviando metadatos…');

      // 2️⃣ Función recursiva que lee y envía cada chunk
      reader.onload = e => {
        // Enviamos el chunk como ArrayBuffer (no como dataURL para ahorrar ancho de banda)
        conn.send({chunk: e.target.result});
        offset += e.target.result.byteLength;
        const percent = ((offset / file.size) * 100).toFixed(1);
        log(`📤 Chunk enviado – ${percent}%`);
        if (offset < file.size) {
          leerSiguiente();
        } else {
          // Todo enviado, notificamos al receptor
          conn.send({done: true});
          log('✅ Envío completado');
          sendBtn.disabled = true;
        }
      };

      const leerSiguiente = () => {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
      };

      // Comenzamos la lectura del primer trozo
      leerSiguiente();
    }

    // Botón de envío
    sendBtn.addEventListener('click', () => {
      if (!conn || conn.open === false) {
        connectToPeer();
      } else {
        enviarArchivo();
      }
    });
  </script>
</body>
</html>
```

#### Instrucciones para probar el ejemplo  

1. **Copia** cada bloque de código en un archivo HTML distinto (`receiver.html` y `sender.html`).  
2. **Abre** ambos archivos en dos pestañas del mismo navegador o (mejor) en dos dispositivos diferentes (p. ej., laptop y móvil).  
3. En cada pestaña, la app mostrará su **Peer ID** propio.  
4. Copia el **ID del receptor** y pégalo en el campo “ID del receptor” del emisor.  
5. Selecciona un archivo en la pestaña del **emisor** y pulsa **“Enviar archivo”**.  
6. Observa cómo aparecen los logs de transferencia y, al finalizar, el receptor verá un enlace para **descargar** el archivo.  

> Si la conexión falla (por ejemplo, ambos peers están detrás de NAT simétrica), la app mostrará un error en la consola y en la zona de *log*. En ese caso, la solución más fiable es **configurar un servidor TURN** propio y pasar sus credenciales a PeerJS (ver sección *Contribuir*).

---  

## 🚀  Guía de uso rápido (para usuarios finales)

| Paso | Acción | Resultado |
|------|--------|-----------|
| **1** | Accede a `https://danielcdmconsultores.github.io/sharefile/` en **ambos** navegadores. | La página muestra tu **Peer ID** (código alfanumérico de 8‑12 caracteres). |
| **2** | **Receptor** copia su ID y lo envía al **emisor** por cualquier medio (WhatsApp, correo, QR, etc.). | El emisor ya conoce la dirección del receptor. |
| **3** | **Emisor** pega el ID del receptor en el campo “ID del receptor”. | El botón “Enviar archivo” se habilita. |
| **4** | Emisor **elige** el archivo a compartir y pulsa **Enviar**. | La aplicación muestra el progreso de la transferencia en ambas pantallas. |
| **5** | Receptor recibe un botón **“Descargar”** al terminar. | El archivo se guarda en el dispositivo del receptor. |
| **6** | (Opcional) Repite el proceso para enviar **más archivos**. | Cada transferencia es totalmente independiente. |

> **Consejo de seguridad**  
> * Utiliza la conexión desde **HTTPS** (la URL ya está en https).  
> * Verifica que el **Peer ID** recibido corresponde a la persona que deseas conectar (usa un canal de comunicación confiable para compartirlo).  
> * No compartas archivos que contengan datos confidenciales sin haber evaluado la confiabilidad de la red y del dispositivo receptor.  

---  

## 🔐  Seguridad y privacidad  

| Aspecto | Detalle |
|---------|---------|
| **Cifrado en tránsito** | WebRTC usa **DTLS** (TLS sobre datagramas) y **SRTP** (para audio/video). Los datos _(chunks de archivo)_ también están cifrados con DTLS, por lo que nadie puede interceptar el contenido sin romper la encriptación. |
| **No hay registro de archivos** | El servidor de señalización sólo gestiona los mensajes de handshake (SDP/ICE). **No almacena ni conoce** el contenido que se intercambia. |
| **Sin tracking ni cookies** | La aplicación está sirviendo un HTML estático sin scripts publicitarios ni analíticas externas. |
| **Conexión HTTPS obligatoria** | Los navegadores bloquean WebRTC en contextos no seguros. |
| **Limite de exposición del ID** | El Peer ID es un identificador público; si alguien lo conoce, podría intentar conectar. Usa canales seguros (QR, mensaje encriptado) para intercambiarlo. |
| **Protección contra malware** | La aplicación no escanea los archivos; el receptor es responsable de abrirlos. Se recomienda escanear con antivirus local antes de abrir. |
| **Política de retención** | Los datos se mantienen **solo en la memoria del navegador** mientras la página está abierta. Al cerrar la pestaña se pierden. |

---  

## ⚠️  Limitaciones y solución de problemas  

| Problema | Causa habitual | Solución recomendada |
|----------|----------------|----------------------|
| **Conexión fallida (NAT simétrica)** | Los dos peers están detrás de firewalls que no permiten conexión directa y no hay servidor TURN configurado. | 1. Configura un **TURN server** propio e indica sus credenciales al crear el `Peer` (`new Peer({config: {iceServers:[...]}})`). 2. Usa una red diferente (por ejemplo, conecta uno de los peers a una red **Wi‑Fi pública**). |
| **Transferencia muy lenta** | Conexión a través de **relay TURN** (el tráfico pasa por un servidor) o pérdida de paquetes en la red Wi‑Fi. | Verifica la calidad de la red; si es posible, usa una conexión **cableada** o móvil con buena señal. |
| **Archivo corrupto al descargar** | Los chunks no se concatenan en el orden correcto o se pierden. | PeerJS garantiza orden y confiabilidad con `reliable: true`. Verifica que la versión de PeerJS sea al menos **1.5.0** y que ambos navegadores soporten `RTCDataChannel` fiable. |
| **Errores `peer.unavailable`** | El ID del receptor no está registrado en el servidor de señalización (p.e., se cerró la página del receptor). | Asegúrate de que el **receptor** mantenga la página abierta y no haya recargado después de generar su ID. |
| **Problemas con proxies corporativos** | El tráfico WebSocket o UDP está bloqueado. | Usa una red sin proxy o solicita al administrador que permita el puerto **443** para WebSocket y **STUN** (UDP 3478). |
| **El navegador muestra “WebRTC no está disponible”** | Se está ejecutando la página en **HTTP** o el navegador está desactualizado. | Usa la URL HTTPS y actualiza a la última versión del navegador. |

---  

## ❓  Preguntas frecuentes (FAQ)  

**Q1. ¿Necesito crear una cuenta en PeerJS?**  
No. El servidor de señalización de PeerJS Cloud es gratuito y no requiere autenticación. Solo se crea una sesión temporal (`peer = new Peer()`).  

**Q2. ¿Cuántos archivos puedo enviar simultáneamente?**  
Puedes abrir varias conexiones `peer.connect()` a diferentes peers, o incluso al mismo peer con canales distintos. Cada canal mantiene su propia transferencia, aunque el ancho de banda total está limitado por tu conexión de red.  

**Q3. ¿Qué pasa si cierro la pestaña antes de que termine la transferencia?**  
La transferencia se interrumpe y el otro peer recibirá un evento `close`. No habrá pérdida de datos en el lado receptor (solo los chunks recibidos hasta ese momento).  

**Q4. ¿Existe alguna forma de proteger el enlace de descarga contra manipulación?**  
Actualmente el archivo se entrega mediante un `Blob` creado en memoria; el enlace generado es un `object URL` temporal. Solo el usuario que está viendo la página puede usarlo. Si requieres una capa extra, puedes **firmar** el archivo con una hash (SHA‑256) antes de enviarlo y validar la integridad en el receptor.  

**Q5. ¿Puedo usar ShareFile dentro de una aplicación móvil (WebView)?**  
Sí, siempre que el WebView tenga habilitado WebRTC y WebSocket (por ejemplo, Android WebView a partir de la versión 77 o iOS WKWebView). Pero ten en cuenta las restricciones de política de **mixed content** y de permisos de cámara/mic (no son necesarios aquí).  

**Q6. ¿Cómo puedo cambiar el servidor de señalización?**  
Al crear el `Peer` puedes pasar un objeto `options`:

```js
const peer = new Peer('custom-id', {
  host: 'mi-servidor.com',
  port: 9000,
  path: '/myapp',
  secure: true,               // si usas HTTPS/WSS
  config: {                   // STUN/TURN personalizados
    iceServers: [
      { url: 'stun:stun.l.google.com:19302' },
      {
        url: 'turn:turn.mi-servidor.com:3478',
        username: 'user',
        credential: 'pass'
      }
    ]
  }
});
```

---  

## 🤝  Contribuir y desplegar tu propio servidor de señalización  

### 1️⃣  Por qué usar tu propio servidor  

* **Privacidad total:** el intercambio de IDs se mantiene dentro de tu infraestructura.  
* **Disponibilidad:** evitas depender del servicio gratuito de PeerJS, que tiene límites de tiempo de vida de sesión.  
* **Control de TURN/STUN:** puedes añadir servidores TURN propios para mejorar la conectividad en entornos restrictivos.  

### 2️⃣  Despliegue rápido con Docker  

```bash
# Clona el repositorio oficial de PeerJS
git clone https://github.com/peers/peerjs-server.git
cd peerjs-server

# Construye la imagen (requiere Docker)
docker build -t mi-peerjs-server .

# Ejecuta el contenedor exponiendo el puerto 9000 (WebSocket)
docker run -d --name peerjs -p 9000:9000 mi-peerjs-server \
  npm start -- --port 9000 --key tu-clave-secreta
```

👉 **Parámetros útiles**  

| Opción | Descripción |
|--------|-------------|
| `--port` | Puerto donde escuchará el servidor (ej. 9000). |
| `--path` | Ruta de WebSocket (por defecto `/`). |
| `--key` | Clave secreta usada para firmar los tokens de autenticación. |
| `--sslCert` / `--sslKey` | Si deseas servir **wss** (WebSocket seguro) detrás de HTTPS. |

### 3️⃣  Configura la aplicación para usar tu server  

```js
const peer = new Peer(undefined, {
  host: 'mi-dominio.com',
  port: 9000,
  path: '/',
  secure: true,                // wss
  config: {                    // STUN/TURN (personalizados)
    iceServers: [
      { url: 'stun:stun.l.google.com:19302' },
      {
        url: 'turn:turn.mi-dominio.com:3478',
        username: 'turnuser',
        credential: 'turnpwd'
      }
    ]
  }
});
```

Con esto, tu versión de **ShareFile** usará tu propio servidor para la señalización y los servidores TURN/STUN que hayas especificado, lo que maximiza la confiabilidad y la privacidad.  

---  

## 📜  Licencia y descargo de responsabilidad  

- **Código:** bajo licencia **MIT** (libre para uso comercial y no comercial, con atribución).  
- **Responsabilidad:** el autor no se hace responsable del contenido transferido ni de cualquier daño ocasionado por el uso de la aplicación.  
- **Uso recomendado:** intercambio de archivos de carácter **no crítico** (documentos, fotos, videos personales). No se recomienda para la transmisión de datos confidenciales sin medidas de protección adicionales.  

---  

## 🙌  ¡Gracias por usar ShareFile!

Si tienes ideas, mejoras, hallazgos de bugs o simplemente quieres dar un “👍” al proyecto, abre un *issue* o un *pull request* en el repositorio oficial:

> **GitHub:** <https://github.com/danielcdmconsultores/sharefile>

¡Que la transferencia sea siempre **rápida**, **segura** y **sin servidores**!  