# **ShareFile** – Transferencia segura P2P de archivos, sin servidores  

> **Aviso del creador**: El autor no se hace responsable del contenido compartido ni de los daños que pueda causar el uso de la aplicación. Úsala bajo tu propio riesgo.

---  

## 📦  ¿Qué es ShareFile?  

- **Aplicación web** que permite enviar archivos directamente de un navegador a otro, sin pasar por servidores de almacenamiento.  
- **No requiere instalación**: basta con abrir la URL [https://danielcdmconsultores.github.io/sharefile/](https://danielcdmconsultores.github.io/sharefile/).  
- **Cifrado de extremo a extremo**: los datos viajan encriptados por WebRTC (DTLS/SRTP), por lo que nadie en la red puede leerlos.  
- **Libre de anuncios, rastreadores y malware** – el código es abierto y no incluye terceros publicitarios.  

---  

## ⚙️  ¿Cómo funciona (sin entrar en tecnicismos)?  

1. **Identificador único**  
   Cada vez que abres la página, el navegador crea un **ID** que lo identifica en la red.
2. **Señalización ligera**  
   Para que dos navegadores se “encuentren”, primero intercambian sus IDs a través de un servidor de señalización (por defecto PeerJS o un servidor propio si lo configuras). Este servidor solo pasa los IDs, **no almacena ni ve** los archivos.
3. **Conexión directa**  
   Una vez que cada parte conoce el ID del otro, la librería PeerJS abre un túnel directo WebRTC entre los navegadores.
4. **Transferencia de datos**  
   El archivo se fragmenta en pequeños trozos binarios (chunks de 16KB) y se envía a través del túnel con control de flujo (backpressure).
5. **Fin de la sesión**  
   El receptor reconstruye el archivo en memoria y ofrece un botón de descarga. Al cerrar la pestaña, los datos desaparecen de la memoria RAM.

---  

## 🚀  Guía rápida de uso  

1. **Abre la URL** en tu navegador.  
2. **Comparte el enlace** generado (`?to=TU_ID`) con el destinatario.  
3. Selecciona el archivo a enviar (se puede encolar antes o después de que el receptor abra el enlace).  
4. Verás la barra de progreso en ambas pantallas.  
5. Cuando aparezca el botón **“Descargar”**, haz clic para guardar el archivo.  

---  

## 🔐  Seguridad y privacidad  

| Tema | Qué garantiza ShareFile |
|------|--------------------------|
| **Cifrado** | Los datos viajan cifrados de extremo a extremo (DTLS/SRTP); nadie puede interceptar el contenido. |
| **Sin almacenamiento** | Los archivos nunca se guardan en ningún servidor. Residen únicamente en la RAM durante la transferencia. |
| **HTTPS obligatorio** | La aplicación funciona bajo conexión segura HTTPS. |
| **Sin analíticas ni cookies** | Código estático 100% libre de rastreadores. |

---  

## 🔄  Últimas Mejoras y Herramientas Avanzadas

1. **Evolución a OKF v0.2 Knowledge Base**
   - Toda la documentación técnica del proyecto ha sido actualizada conforme a la especificación **OKF v0.2** con bloques YAML Frontmatter en todos los módulos bajo el directorio [okf/](file:///c:/Users/danie/apps/sharefile/sharefile/okf/index.md).

2. **Panel de Ajustes Avanzados de Red (`#settings-modal`)**
   - Permite configurar servidores TURN/TURNS privados o un servidor de señalización PeerServer propio (Host, Puerto, Ruta, TLS) para entornos corporativos o restrictivos. Persistencia local en `localStorage`.

3. **Consola de Diagnóstico de Red en Tiempo Real (`#diagnostics-container`)**
   - Monitoreo en vivo de los candidatos ICE descubiertos (`Host`, `Srflx`, `Relay`), estado del canal de señalización y tipo de conexión P2P activa.

4. **Resiliencia y Control de Flujo (Backpressure)**
   - Algoritmo de reconexión por backoff exponencial con jitter, watchdogs de tiempo de espera y control de contrapresión mediante `bufferedAmount` para evitar saturación de memoria.

---  

## 📚 Documentación Técnica (OKF v0.2)

Para desarrolladores y agentes de IA, la base de conocimiento técnica completa se encuentra en **[okf/index.md](file:///c:/Users/danie/apps/sharefile/sharefile/okf/index.md)**:

- [Arquitectura de Red](file:///c:/Users/danie/apps/sharefile/sharefile/okf/architecture/architecture.md)
- [Conceptos Clave (STUN/TURN/ICE/Chunking)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/concepts/concepts.md)
- [Módulos y Componentes](file:///c:/Users/danie/apps/sharefile/sharefile/okf/modules/modules.md)
- [Registro de Decisiones (ADR)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/decisions/decisions.md)
- [Interfaces y Protocolo](file:///c:/Users/danie/apps/sharefile/sharefile/okf/interfaces/interfaces.md)
- [Flujos de Trabajo](file:///c:/Users/danie/apps/sharefile/sharefile/okf/workflows/workflows.md)
- [Convenciones y Resiliencia](file:///c:/Users/danie/apps/sharefile/sharefile/okf/conventions/conventions.md)
- [Historial de Actualizaciones (Log)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/log.md)

---  

### 🎉  ¡Listo!  

Con tan solo abrir una página y compartir un enlace, puedes enviar archivos de forma segura y sin depender de servicios externos. ¡Disfruta de la transferencia directa y **libre de servidores**!  