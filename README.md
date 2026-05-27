# **ShareFile** – Transferencia segura P2P de archivos, sin servidores  

> **Aviso del creador**: El autor no se hace responsable del contenido compartido ni de los daños que pueda causar el uso de la aplicación. Úsala bajo tu propio riesgo.

---  

## 📦  ¿Qué es ShareFile?  

- **Aplicación web** que permite enviar archivos directamente de un navegador a otro, sin pasar por servidores de almacenamiento.  
- **No requiere instalación**: basta con abrir la URL `https://danielcdmconsultores.github.io/sharefile/`.  [https://danielcdmconsultores.github.io/sharefile/](https://danielcdmconsultores.github.io/sharefile/)
- **Cifrado de extremo a extremo**: los datos viajan encriptados, por lo que nadie en la red puede leerlos.  
- **Libre de anuncios, rastreadores y malware** – el código es abierto y no incluye terceros publicitarios.  

---  

## ⚙️  ¿Cómo funciona (sin entrar en tecnicismos)?  

1. **Identificador único**  
   Cada vez que abres la página, y le das a copiar la url, el navegador crea un **ID** que lo identifica en la red. Piensa en él como un número de teléfono virtual.  (está en la propia url)

2. **Señalización ligera**  
   Para que dos navegadores se “encuentren”, primero intercambian sus IDs a través de un **pequeño servidor de señalización**. Este servidor solo pasa los IDs, **no almacena ni ve** los archivos, típico en p2p. están en el script.js y sueles ser los típicos de google como stun:stun.l.google.com

3. **Conexión directa**  
   Una vez que cada parte conoce el ID del otro, gracias a la **librería PeerJS** gestiona todo lo necesario para abrir un túnel directo entre los navegadores.  
   - La librería se encarga de la “negociación” (quién envía primero, cómo se conectan, etc.).  
   - Después de la negociación, los navegadores se comunican **directamente**, como si estuvieran conectados por un cable virtual seguro.  

4. **Transferencia de datos**  
   El archivo se parte en pequeños trozos y se envía a través del túnel. Cada trozo llega en orden y sin perderse, porque la propia librería cuida la fiabilidad.  

5. **Fin de la sesión**  
   Cuando el último trozo llega, el receptor vuelve a armar el archivo y lo ofrece para su descarga. Todo el proceso ocurre en la memoria de los dos navegadores; al cerrar la pestaña de esta web, desaparece.  

---  

## 🧑‍🤝‍🧑  Ejemplo paso a paso: Origen ↔︎ Destino  

Imaginemos a **Ana** (quien envía) y **Luis** (quien recibe).  

| Paso | Qué hace Ana (origen) | Qué hace Luis (destino) |
|------|----------------------|------------------------|
| **1** | Abre la página en su navegador → la app le muestra una url con un **ID incrustado**. | pega la url en otro navegador destino ().|
| **2** | Muestra el estado de conectado. selecciona el fichero a enviar | Muestra el estado de esperando fichero |
| **3** | La librería PeerJS abre la conexión directa y empieza a mandar los trozos del archivo. | Cada trozo llega y la aplicación los va guardando en la memoria |
| **5** | Cuando termina, la app informa a Luis que la transferencia ha finalizado. | Luis recibe un botón **“Descargar”**; al pulsarlo el archivo se guarda en su dispositivo. |
| **6** | Ambas pestañas pueden cerrarse; los archivos no quedan guardados en ningún servidor. | — |

> **En resumen:** Ana y Luis solo intercambian sus IDs, la librería PeerJS hace el resto, y el archivo viaja directamente de un navegador a otro, totalmente cifrado.  

---  

## 🚀  Guía rápida de uso (para cualquier persona)  

1. **Abre la URL** en **dos navegadores** (pueden ser en el mismo ordenador, en otro ordenador o en un móvil).  
2. **Comparte con el destino** la url con la otra persona por cualquier medio que consideres seguro (whatsapp, correo, QR).  
4. Selecciona el fichero a enviar.  
5. Verás una barra de progreso en ambas pantallas.  
6. Cuando aparezca el botón **“Descargar”**, simplemente haz clic para guardar el archivo.  

---  

## 🔐  Seguridad y privacidad  

| Tema | Qué garantiza ShareFile |
|------|--------------------------|
| **Cifrado** | Los datos viajan encriptados; nadie puede interceptar el contenido sin romper la capa de cifrado. |
| **Sin almacenamiento** | El servidor de señalización solo pasa los IDs. Los archivos nunca se guardan ni se copian en ningún servidor. |
| **HTTPS obligatorio** | La aplicación solo funciona bajo una conexión segura (HTTPS), lo que impide ataques de tipo “man‑in‑the‑middle”. |
| **No hay tracking** | No se usan cookies ni scripts de analítica; el código es completamente estático. |
| **Memoria temporal** | Los datos se mantienen solo en la memoria del navegador. Al cerrar la pestaña, desaparecen. |

---  

## ⚠️  Limitaciones y cómo sortearlas  

| Posible problema | Por qué ocurre | Qué puedes hacer |
|------------------|----------------|-----------------|
| **Conexión fallida** (por ejemplo, ambos detrás de firewalls estrictos) | El túnel directo no puede abrirse porque los routers bloquean la comunicación. | Cambia a una red menos restrictiva (p. ej., Wi‑Fi doméstico) o usa una red móvil. |
| **Transferencia lenta** | El tráfico está pasando por un servidor intermedio (relay). | Usa una red con mejor calidad de enlace o, si tienes conocimientos, despliega tu propio servidor TURN y configúralo en la app (ver sección *Contribuir*). |
| **Archivo corrupto** | Pérdida de paquetes o error de la librería. | En la práctica esto es raro; si ocurre, recarga la página y vuelve a intentar. |
| **La app no funciona** | Se abre con HTTP en vez de HTTPS o el navegador está muy desactualizado. | Asegúrate de que la URL empiece por `https://` y actualiza el navegador a la última versión. |

---  

## ❓  Preguntas frecuentes  

**1. ¿Necesito crear una cuenta?**  
No. Solo abres la página y el sistema genera automáticamente tu ID.  

**2. ¿Cuántos archivos puedo enviar al mismo tiempo?**  
Puedes abrir varias sesiones simultáneas, pero la velocidad total dependerá del ancho de banda de tu conexión.  

**3. ¿Qué pasa si cierro la pestaña antes de que termine la transferencia?**  
La transmisión se corta. El otro usuario conservará los trozos recibidos hasta ese momento, pero el archivo quedará incompleto.  

**4. ¿Puedo usar la app desde un móvil?**  
Sí. Funciona en navegadores móviles modernos siempre que tengan soporte WebRTC (Chrome, Edge, Firefox, Safari).  

**5. ¿Los archivos pueden estar infectados con virus?**  
ShareFile no escanea los archivos. El receptor debe comprobarlos con su antivirus antes de abrirlos, como haría con cualquier archivo recibido por cualquier medio.  


---  

## 🔄  Últimas Mejoras (Actualizaciones)

Para garantizar la mejor experiencia y fiabilidad, ShareFile ha recibido recientemente las siguientes actualizaciones:

1. **Alta Fiabilidad de Conexión (NAT Traversal)**
   - Se ha reemplazado el uso de servidores TURN limitados por una batería robusta de servidores **STUN públicos de alta disponibilidad** (Google, Cloudflare, Mozilla).
   - Se ha reescrito por completo la máquina de estados de conexión para garantizar que la transferencia de archivos comience de forma impecable sin importar si el archivo se selecciona antes, durante o después de que el destinatario abra el enlace.
   - **Control de Flujo (Backpressure):** Se ha implementado un control de flujo inteligente mediante `bufferedAmount` y el evento `onbufferedamountlow` del canal de datos WebRTC. Esto evita la saturación de memoria y las desconexiones abruptas cuando se transmiten archivos a través de conexiones lentas o TURN relays.

2. **Mejoras de Usabilidad (UX)**
   - **Enlace Persistente:** Ahora el remitente siempre tiene a la vista el enlace para compartir, incluso después de haber seleccionado el archivo a enviar.
   - **Feedback Visual:** La zona de carga indica claramente cuándo un archivo está en cola esperando a que el destinatario se conecte.

3. **Accesibilidad (A11y)**
   - Se han añadido etiquetas funcionales (`aria-label` y `title`) a todos los botones de iconos para garantizar que la aplicación sea plenamente utilizable mediante lectores de pantalla y ofrezca *tooltips* al pasar el ratón.

---  

### 🎉  ¡Listo!  

Con tan solo abrir una página y compartir un pequeño enlace, puedes enviar archivos de forma segura y sin depender de servicios externos. ¡Disfruta de la transferencia directa y **libre de servidores**!  