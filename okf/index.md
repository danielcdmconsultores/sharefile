# OKF (Our Knowledge Framework) - ShareFile

Bienvenido a la base de conocimiento técnica (**OKF**) de **ShareFile**. Este espacio está diseñado para centralizar toda la documentación técnica sobre el diseño, arquitectura, flujos, convenciones y decisiones del proyecto.

Conforme a las directrices de [AGENTS.md](file:///c:/Users/danie/apps/sharefile/sharefile/.agents/AGENTS.md), este marco sirve como la fuente de verdad técnica para los desarrolladores y agentes de IA que mantengan o extiendan esta aplicación.

---

## 🗺️ Mapa de la Documentación

Haz clic en cualquiera de las secciones para explorar los detalles técnicos correspondientes:

1. **[Arquitectura](file:///c:/Users/danie/apps/sharefile/sharefile/okf/architecture/architecture.md)**
   * El modelo de comunicación de red híbrido (Señalización + Canal de Datos Directo WebRTC).
   
2. **[Conceptos Clave](file:///c:/Users/danie/apps/sharefile/sharefile/okf/concepts/concepts.md)**
   * WebRTC, rol de servidores STUN/TURN, fragmentación de archivos (file chunking) y control de contrapresión (backpressure).

3. **[Módulos y Componentes](file:///c:/Users/danie/apps/sharefile/sharefile/okf/modules/modules.md)**
   * Estructura de la aplicación cliente (HTML, CSS y JS) y la gestión del diseño líquido con cristalmorfismo.

4. **[Decisiones de Diseño (ADR)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/decisions/decisions.md)**
   * El registro de decisiones de arquitectura clave (como el uso de PeerJS o la ausencia de almacenamiento central).

5. **[Interfaces y Protocolo](file:///c:/Users/danie/apps/sharefile/sharefile/okf/interfaces/interfaces.md)**
   * Protocolo de mensajería personalizado sobre el canal de datos de PeerJS y estructura del estado global.

6. **[Flujos de Trabajo (Workflows)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/workflows/workflows.md)**
   * Ciclos de vida detallados para los roles de Emisor (Sender) y Receptor (Receiver).

7. **[Convenciones](file:///c:/Users/danie/apps/sharefile/sharefile/okf/conventions/conventions.md)**
   * Estándares de estilo de código, resiliencia con backoff exponencial, y buenas prácticas de desarrollo.

8. **[Hoja de Ruta (Roadmap)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/roadmap/roadmap.md)**
   * Ideas y mejoras futuras planificadas para robustecer y ampliar la aplicación.

9. **[Historial de Cambios (Changelog)](file:///c:/Users/danie/apps/sharefile/sharefile/okf/changelog/changelog.md)**
   * Registro histórico de versiones y autoría del proyecto.

---

## 🛠️ Cómo leer e interactuar con este proyecto

Antes de comenzar cualquier desarrollo:
1. Lee el [README.md](file:///c:/Users/danie/apps/sharefile/sharefile/README.md) para tener un contexto comercial e instructivo rápido.
2. Consulta este `okf/index.md` como el punto de inicio técnico.
3. Si cambias la lógica del negocio o la arquitectura, **es obligatorio mantener este OKF actualizado**.
