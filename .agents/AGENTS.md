# AGENTS.md

# Project Agent Guide

Este documento define cómo debe trabajar cualquier agente dentro de este repositorio.

No contiene conocimiento del proyecto.
Ese conocimiento reside exclusivamente en `okf/`.

---

# Orden de lectura

Antes de comenzar cualquier tarea:

1. Leer `README.md`.
2. Leer `okf/index.md`.
3. Leer únicamente la documentación relacionada con la tarea.
4. Revisar el código afectado.

No supongas que toda la documentación será relevante para todas las tareas.

---

# Fuente de verdad

La prioridad es:

1. Código.
2. OKF.
3. README.

Si detectas inconsistencias:

* utiliza el código como referencia;
* actualiza OKF como parte de la tarea.

No dejes documentación obsoleta.

---

# Base de conocimiento

Toda la documentación técnica vive en `okf/`.

Ejemplo de organización:

okf/

* index.md
* architecture/
* concepts/
* modules/
* decisions/
* interfaces/
* workflows/
* conventions/
* roadmap/
* changelog/

Cada documento debe describir un único tema.

Evita documentos enormes.

Prefiere muchos documentos pequeños enlazados entre sí.

---

# Flujo de trabajo

Para cada tarea:

1. Comprender.
2. Localizar la documentación relevante.
3. Revisar el código.
4. Implementar.
5. Verificar.
6. Actualizar OKF si el conocimiento del proyecto ha cambiado.

---

# Qué actualizar

Actualiza OKF cuando cambie:

* arquitectura;
* módulos;
* interfaces;
* decisiones técnicas;
* convenciones;
* flujos funcionales;
* configuración relevante.

No actualices documentación por cambios puramente internos que no alteren el conocimiento del proyecto.

---

# Calidad

Los cambios deben ser:

* pequeños;
* coherentes;
* fácilmente revisables;
* compatibles con el estilo existente.

Evita refactorizaciones no relacionadas.

---

# Validación

Antes de finalizar:

* verifica que el código funciona;
* ejecuta las pruebas relevantes cuando existan;
* comprueba que la documentación sigue siendo correcta.

---

# Objetivo

Cada cambio debe mejorar al menos uno de estos aspectos:

* claridad;
* mantenibilidad;
* consistencia;
* documentación;
* calidad del código.

Nunca sacrifiques simplicidad por sofisticación innecesaria.
