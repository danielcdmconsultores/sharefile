# Registro de Decisiones de Arquitectura (ADR)

Este documento detalla las decisiones técnicas fundamentales tomadas durante el desarrollo de ShareFile, justificando el contexto, las alternativas evaluadas y las consecuencias de cada elección.

---

## ⚡ ADR-01: Elección de PeerJS como Capa de Abstracción WebRTC

### Contexto y Problema
Implementar WebRTC nativo requiere escribir cientos de líneas de código repetitivo para coordinar la creación de ofertas, respuestas (SDP) e intercambio de candidatos de red (ICE Candidates), además de configurar y mantener un WebSocket personalizado para la señalización.

### Decisión
Utilizar la librería **PeerJS** en su versión estática `v1.5.5`.

### Razonamiento
* **Simplificación**: Abstrae toda la complejidad técnica de la negociación WebRTC en simples eventos basados en callbacks (`peer.on('connection')`, `conn.on('data')`).
* **Señalización Gratuita**: Hace uso de la red pública y gratuita de servidores de señalización de PeerJS, evitando que el proyecto deba alojar o financiar un backend propio de señalización.
* **Compatibilidad**: Maneja internamente los cambios en las APIs de WebRTC en distintos navegadores.

### Consecuencias
* *Positivas*: Desarrollo rápido, código limpio y auto-contenido, cero costes de infraestructura.
* *Negativas*: Dependencia de los servidores de señalización públicos de PeerJS, que pueden experimentar latencias o caídas temporales. (Se mitiga mediante la lógica de resiliencia de la app).

---

## 🔒 ADR-02: Cero Almacenamiento en Servidor (100% Client-Side)

### Contexto y Problema
La mayoría de servicios de transferencia de archivos (como WeTransfer) guardan los archivos de forma temporal o permanente en sus propios servidores en la nube. Esto genera costes de almacenamiento elevados, preocupaciones de privacidad para el usuario y riesgos de brechas de seguridad de datos.

### Decisión
Adoptar una arquitectura estricta **Serverless P2P**. Los archivos residen únicamente en la memoria RAM de los dos navegadores involucrados durante el tiempo exacto que dura la transferencia.

### Razonamiento
* **Privacidad Absoluta**: Nadie en internet (incluidos los creadores de ShareFile) puede interceptar o ver los archivos, ya que no se almacenan en ninguna máquina intermedia.
* **Sin Límites de Tamaño**: Al no requerir almacenamiento intermedio en disco, la aplicación no tiene limitaciones artificiales de peso de archivo (el límite solo está sujeto a la memoria disponible en el navegador del receptor y al ancho de banda).
* **Coste de Mantenimiento Cero**: El sitio web puede ser alojado de forma totalmente gratuita en plataformas de contenido estático (como GitHub Pages), permitiendo que la herramienta sea infinitamente sostenible a lo largo del tiempo.

---

## 🎨 ADR-03: Dependencias Ligeras a través de CDN

### Contexto y Problema
El uso de gestores de dependencias pesados (`npm`) y fases de compilación (`webpack`, `vite`) para un proyecto estático tan pequeño añade complejidad innecesaria y ralentiza el flujo de despliegue directo.

### Decisión
Utilizar servicios CDN públicos y de alta velocidad (como unpkg y jsDelivr) para importar recursos de forma declarativa directamente en el HTML:
* **Phosphor Icons**: Librería de iconos vectoriales limpia y moderna.
* **Marked.js**: Conversor ligero de Markdown a HTML para renderizar el panel interactivo de ayuda de la aplicación.
* **PeerJS**: Librería de comunicaciones.

### Razonamiento
* **Optimización**: Los navegadores suelen tener en caché estas populares librerías CDN, acelerando drásticamente el tiempo de primer renderizado del sitio web.
* **Facilidad**: Permite modificar cualquier archivo y desplegarlo instantáneamente con solo subirlo a producción (Git).
* **Mantenibilidad**: Reduce el tamaño del repositorio físico al no guardar binarios ni librerías de terceros en el código base.

---

## 🚀 Próximas Propuestas de Diseño

* **[Propuestas de Evasión de Cortafuegos y NATs](file:///c:/Users/danie/apps/sharefile/sharefile/okf/decisions/firewall_nat_proposals.md)**: Análisis técnico y estrategias para maximizar la conectividad en redes restringidas, incluyendo la migración a TURNS y consolas de diagnóstico.

