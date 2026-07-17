# Hoja de Ruta (Roadmap) de ShareFile

Este documento detalla las nuevas funcionalidades, optimizaciones y mejoras planificadas para el futuro desarrollo de ShareFile, ordenadas por prioridad de impacto y dificultad de implementación.

---

## 🚀 1. Prioridad Alta (Próximos Pasos)

### Generación de Código QR Integrado en la UI
* **Propósito**: Facilitar que el emisor comparta la URL directamente con un dispositivo móvil cercano sin tener que copiar y enviar el enlace por un chat externo.
* **Solución**: Integrar una librería ligera como `qrcode.js` para renderizar de forma nativa un código QR dinámico justo al lado del input de enlace compartido.

### Soporte de Arrastre y Soltar Mejorado (Drag & Drop)
* **Propósito**: Permitir arrastrar archivos directamente a cualquier zona de la pantalla de inicio, cambiando de forma visual el estilo del contenedor con transiciones fluidas para indicar que está listo para recibir el archivo.

---

## 📊 2. Prioridad Media (Mejoras Funcionales)

### Gráfico de Velocidad en Tiempo Real
* **Propósito**: Reemplazar la métrica numérica simple de velocidad de descarga por un gráfico dinámico lineal (utilizando un elemento `<canvas>` HTML5 nativo de alto rendimiento) para ver picos y caídas en la transferencia.

### Soporte para Múltiples Archivos en una Sola Sesión
* **Propósito**: Permitir que el usuario seleccione y envíe varios archivos de forma simultánea o secuencial.
* **Soluciones Propuestas**:
  1. *Estrategia de cola*: Transmitir los metadatos de todos los archivos seleccionados y realizar transferencias secuenciales automáticas.
  2. *Empaquetado en cliente*: Comprimir de forma local en formato `.zip` usando una librería como `JSZip` antes de proceder al chunking, para enviar un único archivo unificado.

---

## 🛡️ 3. Prioridad Baja (Optimización y Extras)

### Historial de Transferencias en LocalStorage
* **Propósito**: Mantener una bitácora local persistente (nombre de archivo, tamaño, fecha y rol de emisor/receptor) de todas las transferencias realizadas, guardada de forma segura en `localStorage` del navegador para consulta posterior del usuario.

### Optimización del Tamaño de Fragmento (Dynamic Chunk Size)
* **Propósito**: Ajustar de forma automática el tamaño de fragmento (`CHUNK_SIZE`) durante la transferencia basándose en la latencia detectada. En conexiones locales rápidas (LAN), aumentar el tamaño a 64KB o 128KB para incrementar notablemente la velocidad de transferencia, y reducirlo en conexiones lentas con alta pérdida de paquetes.
