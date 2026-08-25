# skill-permissions

Conocimiento de dominio para permission sets AL en RentalFlow.
Se carga cuando la tarea crea objetos nuevos (tabla, página, codeunit...)
que deben quedar accesibles a través de un permission set, o cuando se
modifica el acceso a un objeto existente.

## Dónde viven

- Un único permission set por app: `RFLPermissionSet.PermissionSet.al`,
  objeto `permissionset 54100 "RFL RentalFlow"`.
- No crear un permission set nuevo por cada tabla — se añade la entrada
  al permission set existente de la app.
- Si la app crece mucho (más de ~30 objetos), separar por área funcional
  (`RFL Equipment`, `RFL Maintenance`) solo cuando haya un motivo real de
  aislar el acceso, no por organización estética.

## Sintaxis

```al
permissionset 54100 "RFL RentalFlow"
{
    Assignable = true;
    Caption = 'RentalFlow';

    Permissions =
        tabledata "RFL Equipment" = RIMD,
        tabledata "RFL Maintenance Log" = RIMD,
        page "RFL Equipment" = X,
        page "RFL Equipment Card" = X,
        page "RFL Maintenance Log" = X;
}
```

## Reglas de nivel de acceso

- `tabledata` de tablas transaccionales (logs, movimientos): `RIMD`
  completo salvo que el dominio exija que no se pueda borrar — en ese
  caso `RIM` (sin `D`) y se documenta por qué.
- `tabledata` de tablas maestras editables desde UI: `RIMD`.
- `tabledata` de tablas de solo lectura / configuración de sistema: `R`.
- `page`: siempre `X` (Execute) — las páginas no llevan RIMD.
- `codeunit`: `X` si es invocable directamente por el usuario o por API;
  si es solo interno (llamado desde otro codeunit), no necesita entrada
  propia.

## Cuándo actualizar el permission set

- Cualquier tabla o página nueva **siempre** entra en el permission set
  en el mismo cambio que la crea — no se deja para después.
- Si un campo nuevo no cambia el objeto que lo contiene (ya estaba en el
  permission set), no hace falta tocar nada.
- Si se añade un objeto que hereda de un `IncludedPermissionSets`
  (permission set base de BC), verificar primero si ya viene cubierto
  antes de añadir una entrada redundante.

## Qué no hacer

- No dar `RIMD` a páginas — las páginas solo llevan `X`.
- No crear un permission set por objeto.
- No omitir la actualización del permission set "porque ya se hará
  luego" — un objeto nuevo sin entrada en el permission set es
  inaccesible para cualquier rol que no sea SUPER, y es fácil que se
  quede así en producción si no se ata al mismo cambio.
