---
agent: agent
model: Claude Sonnet 5 (copilot)
description: 'Crea tabla y página de log de mantenimiento para un activo de RentalFlow.'
tools: [read, edit/editFiles, search, 'al-symbols-mcp/*']
---

# Guardrails
- No escribir ningún fichero .al hasta pasar el Step 4 (STOP).
- No usar IDs fuera de los idRanges declarados en app.json. No asumir ni
  hardcodear un rango: se resuelve siempre en el Step 1 contra el
  app.json del proyecto activo. Si el objeto no cabe en ningún idRange
  declarado, STOP y pregunta antes de continuar.
- Prefijo obligatorio: RFL.

# Step 1 — Read context
Leer app.json (idRanges, versión), y los objetos RFL existentes
relacionados con equipos ("RFL Equipment").

# Step 2 — Decide skills
- Se crea una tabla nueva     -> cargar skill-tables
- La tabla referencia otra    -> cargar skill-relations
- Se crean objetos nuevos     -> cargar skill-permissions (tabla y/o
  página nuevas siempre necesitan entrada en el permission set)

# Step 3 — Generate
Generar:
1. Tabla "RFL Maintenance Log" con campos mínimos (ver skill-tables
   para DataClassification y patrón de PK)
2. Página de lista asociada
3. Entradas correspondientes en "RFL RentalFlow" permission set
   (ver skill-permissions para el nivel de acceso de cada tipo de objeto)
Mostrar el código completo en el chat, sin escribirlo a disco.

# Step 4 — 🛑 STOP
Mostrar resumen: objetos nuevos, IDs usados, campos añadidos, y las
entradas de permission set que se van a añadir (objeto + nivel de acceso).
Esperar aprobación explícita del humano antes de continuar.

# Step 5 — Apply
Solo tras aprobación: escribir los ficheros .al en /src/Equipment/, y
actualizar RFLPermissionSet.PermissionSet.al con las nuevas entradas.
