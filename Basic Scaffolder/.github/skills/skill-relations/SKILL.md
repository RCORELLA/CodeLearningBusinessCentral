# skill-relations

Conocimiento de dominio para relaciones entre tablas AL en RentalFlow.
Se carga solo cuando el prompt detecta que un campo nuevo referencia a
otra tabla (`TableRelation`) o que hace falta validar esa relación.

## TableRelation

- Todo campo que referencie a otra tabla lleva `TableRelation` explícito
  al campo real de esa tabla (no a un `Code` genérico sin relación).
- Si la relación debe filtrarse (por ejemplo, solo equipos con
  `Status = Available`), el filtro va en el propio `TableRelation`, no en
  un evento `OnLookup` aparte, salvo que la condición no sea expresable
  como filtro estático.

```al
field(2; "Equipment No."; Code[20])
{
    Caption = 'Equipment No.';
    TableRelation = "RFL Equipment"."No.";
    NotBlank = true;
}
```

## Validación de existencia

- No asumir que el valor introducido existe en la tabla relacionada solo
  porque pasó el `TableRelation` — en inserciones vía API o migraciones
  el `TableRelation` no se evalúa. Validar explícitamente en `OnValidate`
  o en el procedimiento de inserción cuando el dato no viene de la UI.
- Usar `ErrorInfo` con título, causa y acción sugerida al fallar la
  validación — nunca un `Error('...')` plano de una sola línea.

## Copiar campos descriptivos de la tabla relacionada

- Si la tabla origen necesita mostrar un campo descriptivo de la tabla
  relacionada (ej.: descripción del equipo en el log de mantenimiento),
  usar un `FlowField` con `CalcFormula = Lookup`, no duplicar el dato
  copiándolo en el insert.
- Excepción: si el dato debe quedar congelado en el momento de la
  transacción (por ejemplo, la tarifa diaria en el momento del alquiler),
  entonces sí se copia explícitamente — y se documenta en el propio
  campo por qué no es un FlowField.

## Relaciones circulares

- Si añadir la relación crea un ciclo entre extensiones (A depende de B,
  B necesita saber de A), no modificar la tabla base — resolver con un
  event subscriber en la extensión de nivel superior.

## Qué no hacer

- No crear un `TableRelation` sin filtro cuando el dominio exige uno
  (ej.: relacionar con "todos los equipos" cuando el campo solo tiene
  sentido para equipos activos).
- No usar `Error('...')` de texto plano para fallos de relación —
  usar siempre `ErrorInfo`.
