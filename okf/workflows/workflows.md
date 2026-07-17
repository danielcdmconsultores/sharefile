# Flujos de Trabajo (Workflows)

Este documento detalla el ciclo de vida operativo paso a paso de los dos roles disponibles en la aplicación: **Emisor (Sender)** y **Receptor (Receiver)**.

---

## 📤 1. Ciclo de Vida del Emisor (Sender Workflow)

El emisor es la parte que inicia la sesión de transferencia de archivos generando un ID único.

### Paso 1: Inicialización
* **Disparador**: El usuario abre la página de ShareFile sin ningún parámetro en la URL.
* **Acciones en Código (`script.js -> initSender()`)**:
  1. Se muestra la vista `#view-home` y se activan los componentes en `#sender-persistent-tools`.
  2. Se destruye cualquier instancia previa de peer (`destroyPeer()`).
  3. Se genera un nuevo objeto `Peer` (`createPeer()`).
  4. Al dispararse el evento `peer.on('open', id)`, se guarda el ID de red, se oculta el estado inicializador y se genera una URL con el parámetro dinámico `?to=ID` en el input `#share-link-input`.

### Paso 2: Selección de Archivo (En cola)
* **Disparador**: El usuario selecciona un archivo en el drop zone `#file-input`.
* **Acciones en Código (`handleFileSelection()`)**:
  1. Se asigna el archivo a la variable temporal global `pendingFile`.
  2. Si la conexión con el receptor no se ha establecido todavía, la UI se actualiza con un icono de marca de verificación verde, indicando que el archivo está "encolado" y se enviará automáticamente en cuanto se conecte un par.

### Paso 3: Conexión entrante y Negociación WebRTC
* **Disparador**: Un receptor remoto se conecta utilizando el ID compartido.
* **Acciones en Código (`peer.on('connection')`)**:
  1. Se acepta la conexión entrante asignándola a `conn`.
  2. Se invoca `setupConnectionEvents()`.
  3. Al abrirse el canal (`c.on('open')`), se actualiza la insignia de red a verde (`.connected`).
  4. Si hay un archivo encolado en `pendingFile`, se dispara `senderHandleReceiverReady(c)`, el cual transiciona la pantalla a `#view-transfer`, lee los metadatos y comienza a enviar fragmentos de forma secuencial (`sendFile()`).
  5. Si no hay archivo en cola, se envía el comando `{ type: 'waiting-for-file' }`.

### Paso 4: Transmisión y Finalización
* **Disparador**: Finalización de la transmisión de todos los fragmentos binarios.
* **Acciones en Código**:
  1. Cuando `offset === file.size`, se detiene el calculador de velocidad (`stopSpeedTracker()`).
  2. Se envía la señal de control `{ type: 'end' }` al receptor.
  3. La UI del emisor muestra el texto "Completado" y habilita el botón de reinicio para permitir otra transferencia.

---

## 📥 2. Ciclo de Vida del Receptor (Receiver Workflow)

El receptor es el usuario que hace clic en el enlace compartido para unirse a la sesión del emisor.

### Paso 1: Inicialización
* **Disparador**: El usuario carga la página y la URL contiene el parámetro query `?to=ID_DEL_EMISOR`.
* **Acciones en Código (`script.js -> initReceiver(targetId)`)**:
  1. El controlador detecta el parámetro y asigna el rol `currentRole = 'receiver'`.
  2. Se oculta la vista de inicio y se muestra la pantalla de carga `#view-receiver`.
  3. Se genera un objeto `Peer` local.
  4. Una vez registrado (`peer.on('open')`), inicia automáticamente una llamada de conexión hacia el ID del emisor (`peer.connect(targetId)`).

### Paso 2: Handshake y Espera
* **Disparador**: El canal de datos se abre de forma bidireccional.
* **Acciones en Código**:
  1. Al activarse `c.on('open')`, el receptor envía de forma proactiva la señal `{ type: 'ready' }` al emisor.
  2. Si el emisor responde con `{ type: 'waiting-for-file' }`, la pantalla de carga actualiza su texto para mostrar que está conectado con éxito y esperando a que el emisor elija qué archivo enviar.

### Paso 3: Recepción de Datos
* **Disparador**: El emisor envía el mensaje `{ type: 'metadata' }`.
* **Acciones en Código**:
  1. Se inicializa el array temporal `fileBuffer = []` y se resetea la cuenta `receivedSize = 0`.
  2. Se transiciona la UI a la pantalla de progreso `#view-transfer`.
  3. Conforme entran los mensajes `{ type: 'chunk' }`, se añaden los fragmentos binarios de tipo `ArrayBuffer` a `fileBuffer` y se actualiza reactivamente la barra de progreso y las métricas de velocidad en tiempo real.

### Paso 4: Reconstrucción y Descarga
* **Disparador**: Se recibe el mensaje de control `{ type: 'end' }`.
* **Acciones en Código**:
  1. Se detiene el cronómetro de velocidad.
  2. Se crea un `Blob` unificado pasando todo el array de fragmentos acumulados (`new Blob(fileBuffer)`).
  3. Se genera un enlace local simulado `URL.createObjectURL(blob)`.
  4. Se muestra y activa el botón de descarga principal (`#download-btn`). Al pulsarse, se simula un clic programático que guarda el archivo de manera nativa en la carpeta de descargas del usuario.
