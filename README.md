# **ShareFile** – Transferencia P2P de archivos sin servidores  

> **Aviso del creador**: El autor no se hace responsable del contenido compartido ni de los daños que pueda causar el uso de la aplicación. Úsala bajo tu propio riesgo.

---  

## 📦  ¿Qué es ShareFile?  

- **Aplicación web** que permite enviar archivos directamente de un navegador a otro, sin pasar por servidores de almacenamiento.  
- **No requiere instalación**: basta con abrir la URL `https://danielcdmconsultores.github.io/sharefile/`.  
- **Cifrado de extremo a extremo**: los datos viajan encriptados, por lo que nadie en la red puede leerlos.  
- **Libre de anuncios, rastreadores y malware** – el código es abierto y no incluye terceros publicitarios.  

---  

## ⚙️  ¿Cómo funciona (sin entrar en tecnicismos)?  

1. **Identificador único**  
   Cada vez que abres la página, el navegador crea un **ID** que lo identifica en la red. Piensa en él como un número de teléfono virtual.  

2. **Señalización ligera**  
   Para que dos navegadores se “encuentren”, primero intercambian sus IDs a través de un **pequeño servidor de señalización**. Este servidor solo pasa los IDs, **no almacena ni ve** los archivos.  

3. **Conexión directa**  
   Una vez que cada parte conoce el ID del otro, la **librería PeerJS** gestiona todo lo necesario para abrir un túnel directo entre los navegadores.  
   - La librería se encarga de la “negociación” (quién envía primero, cómo se conectan, etc.).  
   - Después de la negociación, los navegadores se comunican **directamente**, como si estuvieran conectados por un cable virtual.  

4. **Transferencia de datos**  
   El archivo se parte en pequeños trozos y se envía a través del túnel. Cada trozo llega en orden y sin perderse, porque la propia librería cuida la fiabilidad.  

5. **Fin de la sesión**  
   Cuando el último trozo llega, el receptor vuelve a armar el archivo y lo ofrece para su descarga. Todo el proceso ocurre en la memoria del navegador; al cerrar la pestaña, desaparece.  

---  

## 🧑‍🤝‍🧑  Ejemplo paso a paso: Origen ↔︎ Destino  

Imaginemos a **Ana** (quien envía) y **Luis** (quien recibe).  

| Paso | Qué hace Ana (origen) | Qué hace Luis (destino) |
|------|----------------------|------------------------|
| **1** | Abre la página en su navegador → la app le muestra su **ID = `X7Y9`**. | Hace lo mismo y obtiene su **ID = `M4Q2`**. |
| **2** | Copia el ID de Luis (`M4Q2`) y se lo envía por WhatsApp, correo, QR, etc. | Copia el ID de Ana (`X7Y9`) y se lo envía a su vez. |
| **3** | Introduce el ID de Luis en el campo “ID del receptor”. | Espera a que el otro navegador se conecte (no necesita hacer nada más). |
| **4** | Selecciona el archivo que quiere compartir y pulsa **“Enviar”**. | La aplicación le muestra que está recibiendo datos y el progreso de la transferencia. |
| **5** | La librería PeerJS abre la conexión directa y empieza a mandar los trozos del archivo. | Cada trozo llega y la aplicación los va guardando en memoria. |
| **6** | Cuando termina, la app informa a Luis que la transferencia ha finalizado. | Luis recibe un botón **“Descargar”**; al pulsarlo el archivo se guarda en su dispositivo. |
| **7** | Ambas pestañas pueden cerrarse; los archivos no quedan guardados en ningún servidor. | — |

> **En resumen:** Ana y Luis solo intercambian sus IDs, la librería PeerJS hace el resto, y el archivo viaja directamente de un navegador a otro, totalmente cifrado.  

---  

## 🚀  Guía rápida de uso (para cualquier persona)  

1. **Abre la URL** en **dos navegadores** (pueden ser en el mismo ordenador, en otro ordenador o en un móvil).  
2. Cada pantalla mostrará un **código de 8‑12 caracteres** (el *ID*).  
3. **Comparte** tu ID con la otra persona por cualquier medio que consideres seguro (mensaje, correo, QR).  
4. En la pantalla del que envía, **pega** el ID recibido y **elige** el archivo que quieres transferir.  
5. Pulsa **“Enviar”**. Verás una barra de progreso en ambas pantallas.  
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
| **No se muestra el ID** | El navegador está bloqueando los WebSockets (muchos entornos corporativos). | Accede desde una red que permita conexiones WebSocket (puerto 443). |
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

**6. ¿Qué es el “ID” y por qué es público?**  
El ID es simplemente un identificador que permite a otro navegador localizarte. No contiene información personal y solo sirve para iniciar la conexión.  

---  


---  

### 🎉  ¡Listo!  

Con tan solo abrir una página y compartir un pequeño código, puedes enviar archivos de forma segura y sin depender de servicios externos. ¡Disfruta de la transferencia directa y **libre de servidores**!  