# skill-tables

Conocimiento de dominio para crear o modificar **tablas AL** en RentalFlow.
Se carga solo cuando el prompt detecta que la tarea implica una tabla nueva
o un cambio de esquema en una existente.

## Naming y ficheros

- Prefijo obligatorio: `RFL`.
- Nombre de fichero: `<ObjectName>.Table.al` (PascalCase, sin espacios).
- Caption siempre en inglés, sin abreviar salvo que ya exista el patrón en
  el objeto que se está extendiendo.

## Rango de IDs

- No se hardcodea un rango en este skill ni en ningún prompt: se resuelve
  siempre contra los `idRanges` declarados en `app.json` del proyecto activo.
- Si el objeto que se va a crear no cabe en ningún idRange declarado,
  el prompt debe parar (STOP) y preguntar en vez de asumir un rango.

## Clave primaria

- Tablas de **transacciones/log** (crecen indefinidamente, no se editan
  después de creadas): PK de un solo campo `Integer` con `AutoIncrement = true`
  llamado `"Entry No."`.
- Tablas **maestras** (equipos, clientes, artículos...): PK de un campo
  `Code[20]` llamado `"No."`, con `NotBlank = true`.
- Nunca combinar AutoIncrement con más de un campo en la clave.

## Campos

- `DataClassification` es obligatorio en **todos** los campos, sin excepción.
- `Caption` obligatorio en todos los campos.
- Preferir `Enum` sobre `Option` para cualquier lista de valores nueva —
  los Option list solo se mantienen si ya existen en el objeto base que se
  está extendiendo.
- Campos monetarios/decimales: `DecimalPlaces = 2 : 2` y `MinValue = 0`
  salvo que el dominio permita valores negativos (ajustes, notas de crédito).
- Campos calculados desde otra tabla van como `FlowField`, nunca se
  duplica el dato con `TransferFields` o asignación manual en el insert.

## Claves secundarias

- Añadir una clave secundaria cuando se prevé filtrar/ordenar habitualmente
  por esa combinación de campos (ej.: `Status` + `"Equipment Type"`).
- No crear claves secundarias "por si acaso" — cada una tiene coste de
  mantenimiento en escritura.

## Qué no hacer

- No usar `TransferFields` para copiar datos entre tablas relacionadas —
  usar asignación de campo explícita o un evento `OnAfterInsert`.
- No crear campos `Option` nuevos.
- No omitir `DataClassification` "temporalmente" — el compilador lo deja
  pasar pero el checklist de review lo rechaza.
