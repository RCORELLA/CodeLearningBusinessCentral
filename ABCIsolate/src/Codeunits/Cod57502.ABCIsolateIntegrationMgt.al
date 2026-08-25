codeunit 57502 "ABC Isolate Integration Mgt."
{
    Access = Internal;

    procedure SetApiKey(NewApiKey: SecretText)
    var
        Setup: Record "ABC Isolate Setup";
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Company) then
            IsolatedStorage.Delete(GetStorageKey(), DataScope::Company);

        IsolatedStorage.Set(GetStorageKey(), NewApiKey, DataScope::Company);

        // La page ya garantiza que el record singleton existe en OnOpenPage.
        // Si esta codeunit se llamara desde un contexto sin UI (job queue, API),
        // aquí haría falta un Get-or-Insert defensivo.
        if not Setup.Get() then
            exit;
        Setup."API Key Set" := true;
        Setup.Modify();
    end;

    // SecretText: el valor no se muestra en el debugger (aparece como ***),
    // a diferencia del campo inseguro de la tabla, que sí es visible.
    // Ojo: no es cifrado, solo oculta el valor en tooling; en memoria es texto plano.
    local procedure GetApiKey(): SecretText
    var
        ApiKeyValue: SecretText;
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Company) then
            IsolatedStorage.Get(GetStorageKey(), DataScope::Company, ApiKeyValue);
        exit(ApiKeyValue);
    end;

    // Demuestra el peligro de guardar la clave en un campo de tabla:
    // con el debugger podemos ver el valor en claro al leerlo directamente.
    procedure GetInsecureApiKeyFromField(): Text
    var
        Setup: Record "ABC Isolate Setup";
    begin
        if not Setup.Get() then
            exit('');
        exit(Setup."Insecure API Key");
    end;

    procedure CallExternalService()
    var
        ApiKey: SecretText;
    begin
        ApiKey := GetApiKey();
        // La API Key solo sale de Isolated Storage en el momento de usarla,
        // nunca se expone en un campo de tabla ni en un procedimiento público.

        message('Llamando a servicio externo con API Key');

    end;

    local procedure GetStorageKey(): Text
    begin
        exit('ABC-ExternalService-ApiKey');
    end;
}
