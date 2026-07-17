# Historial de Cambios (Changelog) - ShareFile

Este documento registra cronológicamente los cambios significativos, mejoras y versiones estables de la aplicación **ShareFile**.

---

## [v1.2.0] - 2026-07-17

### Añadido
* **Estructura OKF (Our Knowledge Framework)**: Creación de la base de conocimiento técnica bajo el directorio `okf/` (según directrices en `AGENTS.md`) incluyendo documentación de Arquitectura, Conceptos Clave, Componentes de Código, Decisiones Técnicas, Protocolos de Mensajería, Ciclos de Vida y Convenciones.

---

## [v1.1.0] - 2026-04-12

### Añadido
* **Traducción nativa (i18n)**: Soporte completo e instantáneo para cambio de idioma entre inglés (`en`) y español (`es`) mediante el selector de la cabecera.
* **Resiliencia Extrema**: Implementación de algoritmos de reconexión basados en backoff exponencial con jitter y guardias de tiempo de espera (watchdogs de 20 segundos) para mitigar desconexiones de red repentinas.
* **Control de Contrapresión (Backpressure)**: Integración de la lógica de control basada en la propiedad `bufferedAmount` de WebRTC para garantizar la transferencia fluida de archivos de gran tamaño.

---

## [v1.0.0] - 2025-11-20

### Añadido
* **Lanzamiento Inicial**: Creación de la aplicación de transferencia de archivos directa de navegador a navegador (P2P Serverless) basada en la librería PeerJS.
* **Diseño Moderno**: Interfaz de usuario responsiva con estética premium basada en cristalmorfismo (glassmorphism) y blobs interactivos animados de fondo.
* **Panel Informativo**: Integración dinámica de Marked.js para renderizar el archivo `README.md` directamente en un modal superpuesto al hacer clic en el botón de ayuda.
* **Métricas**: Indicadores numéricos de porcentaje y velocidad de transferencia en tiempo real.
