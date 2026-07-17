# Convenciones de Desarrollo y Resiliencia

Para asegurar la consistencia y mantenibilidad a largo plazo del código de ShareFile, los desarrolladores y agentes de IA deben seguir estrictamente las siguientes directrices y convenciones técnicas.

---

## 🎨 1. Estilo de Código y Estructura

* **Acceso al DOM**: Todos los selectores e identificadores estáticos del DOM deben centralizarse al inicio del script en el objeto plano `dom`. No deben realizarse llamadas ad-hoc de `document.getElementById` dispersas por el código.
* **Nombres en CamelCase**: Todas las variables y nombres de funciones de JavaScript deben usar la convención camelCase (ej. `isTransferring`, `handleFileSelection`).
* **Variables CSS para Diseño**: Todo color, tamaño de fuente, radio de borde o animación debe usar tokens definidos en `:root` dentro de `style.css`. Está estrictamente prohibido usar valores crudos "hardcoded" en clases internas.

---

## 🛡️ 2. Estrategia de Resiliencia de Red

Las conexiones P2P en el navegador son inherentemente inestables debido a micro-cortes, cambios de IP en dispositivos móviles, o congestiones temporales del servidor de señalización de PeerJS. Para hacer frente a esto, ShareFile implementa un sistema avanzado de tolerancia a fallos:

### A. Backoff Exponencial con Jitter (Ruido Aleatorio)
Cuando falla una conexión, la aplicación no satura la red reintentando inmediatamente de forma continua. En su lugar, calcula un retardo progresivo mediante la función `getRetryDelay()`:

```javascript
function getRetryDelay() {
    const exp = Math.min(retryCount, 10);
    // Incremento exponencial basado en base 2: 2s, 4s, 8s, 16s... limitado a 30s
    const base = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, exp), MAX_RETRY_DELAY_MS);
    const jitter = Math.random() * 1000; // Añade ruido de ±1s para evitar colisiones
    return Math.round(base + jitter);
}
```

### B. Temporizadores de Guardia (Watchdogs)
Al conectar, si el canal de datos no emite el evento `open` tras un periodo crítico de **20 segundos** (`CONNECTION_TIMEOUT_MS`), el temporizador `connectionTimeoutTimer` asume que la conexión está estancada. Inmediatamente invoca `destroyPeer()`, libera recursos y agenda una nueva conexión usando la cola de retardo.

### C. Reconexión Ligera
Si el objeto Peer se desconecta del servidor de señalización de PeerJS (por ejemplo, por pérdida temporal de Wi-Fi), primero intenta una reconexión rápida y barata en memoria usando `peer.reconnect()` antes de optar por destruir y volver a inicializar todo el ecosistema de red.

---

## 🌐 3. Estructura de Traducción (i18n)

* **Etiquetado HTML**: Cualquier elemento del DOM que contenga texto estático visible para el usuario final debe tener el atributo `data-i18n="identificador_clave"`.
* **Registro**: La traducción de dicho identificador debe existir obligatoriamente tanto bajo el bloque `en` como en `es` dentro del objeto literal `translations` en `script.js`.
* **Inyección**: El motor de traducción se encarga de inyectar el valor correcto en el atributo `textContent` (o `placeholder` en caso de inputs de texto) llamando a `setLanguage()`.
