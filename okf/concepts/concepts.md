# Conceptos Clave de Red y Transferencia

En esta sección se detallan las tecnologías y mecanismos técnicos fundamentales que hacen posible que ShareFile transfiera archivos de forma masiva y confiable directamente en el navegador.

---

## 🌐 1. STUN y TURN (Superación de Cortafuegos y NAT)

La mayor dificultad al establecer una conexión directa P2P es que la mayoría de los usuarios de internet se encuentran detrás de enrutadores con **NAT** (Network Address Translation) y cortafuegos estrictos, lo que impide que conozcan su dirección IP pública real o que acepten conexiones entrantes directas.

Para solucionar esto, WebRTC y PeerJS se apoyan en dos protocolos:

### STUN (Session Traversal Utilities for NAT)
* **Función**: Permite a un navegador descubrir su dirección IP pública real y el tipo de NAT tras el que se encuentra.
* **Uso**: El navegador realiza una petición ligera a un servidor STUN público. El servidor le responde con su IP y puerto públicos. Este par (IP:Puerto) se denomina **ICE Candidate** (Candidato ICE).
* **Configuración**: ShareFile utiliza servidores STUN gratuitos y de alta disponibilidad proporcionados por Google, Cloudflare, Twilio y Mozilla:
  * `stun:stun.l.google.com:19302` (y subdominios 1 al 4)
  * `stun:global.stun.twilio.com:3478`
  * `stun:stun.services.mozilla.com`
  * `stun:stun.cloudflare.com:3478`

### TURN (Traversal Using Relays around NAT)
* **Función**: Actúa como un servidor repetidor de retransmisión de tráfico cuando los dos navegadores están detrás de cortafuegos corporativos o NATs simétricos estrictos que bloquean cualquier conexión directa P2P.
* **Uso**: Si la negociación directa falla, todo el tráfico binario cifrado se envía a través del servidor TURN, el cual simplemente retransmite los paquetes al receptor (el servidor TURN sigue sin poder leer el archivo debido al cifrado DTLS obligatorio de WebRTC).
* **Configuración**: ShareFile integra de manera nativa servidores TURN gratuitos de la plataforma pública `openrelay.metered.ca` para asegurar el éxito de la transferencia en cualquier entorno restrictivo.

---

## 📄 2. Fragmentación de Archivos (File Chunking)

Los navegadores no pueden enviar archivos grandes de golpe a través de un canal WebRTC, ya que se agotaría la memoria de la pestaña del navegador o se saturaría el socket de red.

Por lo tanto, ShareFile implementa una estrategia de **fragmentación secuencial**:

1. **Tamaño del fragmento (`CHUNK_SIZE`)**: Configurado en `16384 bytes` (16 KB). Este es el tamaño estándar ideal recomendado por la especificación WebRTC para equilibrar rendimiento y compatibilidad con canales de datos de alto rendimiento (`reliable: true`).
2. **Lectura con FileReader**: En el emisor, se utiliza la API nativa de JavaScript `FileReader` para leer de forma asíncrona un archivo en pequeñas porciones binarias de tipo `ArrayBuffer` usando el método `slice(offset, offset + CHUNK_SIZE)`.
3. **Reconstrucción con Blob**: En el receptor, cada fragmento recibido se almacena secuencialmente en un array plano (`fileBuffer`). Al recibir la señal de finalización (`end`), se crea un objeto `Blob` unificado con todos los fragmentos binarios acumulados, liberando la memoria a través de una URL de objeto temporal (`URL.createObjectURL(blob)`) que permite la descarga inmediata en disco.

---

## ⏳ 3. Control de Contrapresión (Backpressure)

Si el navegador emisor lee el archivo de disco más rápido de lo que la red puede transmitirlo, el canal de datos de WebRTC se colapsará, provocando pérdidas de paquetes, congelación de la pestaña o un fallo por falta de memoria.

Para prevenir esto de manera elegante, el código de ShareFile utiliza el control de **contrapresión de red**:

```javascript
const BUFFER_THRESHOLD = 64 * 1024; // Umbral de seguridad de 64 KB

// ...
if (offset < file.size) {
    const rawChannel = conn.dataChannel;
    if (rawChannel && rawChannel.bufferedAmount > BUFFER_THRESHOLD) {
        // La cola de la red está saturada. Esperamos a que baje el buffer de red.
        rawChannel.bufferedAmountLowThreshold = BUFFER_THRESHOLD;
        rawChannel.onbufferedamountlow = () => {
            rawChannel.onbufferedamountlow = null; // Limpiamos el callback
            readNextChunk(); // Reanudamos la lectura del siguiente trozo
        };
    } else {
        readNextChunk(); // El canal está despejado, enviamos de inmediato
    }
}
```

* **`bufferedAmount`**: Propiedad nativa del canal de datos WebRTC que indica el volumen (en bytes) de datos binarios en cola que aún no se han enviado por la red.
* **`bufferedAmountLowThreshold`**: Umbral de bytes. Cuando la cantidad de datos acumulados cae por debajo de este límite, el navegador dispara de forma automática el evento `onbufferedamountlow`.
* **Resultado**: Esto asegura una velocidad máxima de transferencia con un consumo mínimo de memoria, manteniendo un flujo de datos continuo y optimizado.
