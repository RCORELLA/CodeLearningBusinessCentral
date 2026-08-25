page 57504 "ABC Insecure Secrets Viewer"
{
    PageType = Card;
    ApplicationArea = All;
    UsageCategory = None;
    Caption = 'Visor de secretos en claro (inseguro)';
    SourceTable = "ABC Isolate Setup";
    Editable = false;

    layout
    {
        area(Content)
        {
            group(CamposTabla)
            {
                Caption = 'Campos de la tabla (persistidos en base de datos)';

                field("Primary Key"; Rec."Primary Key") { ApplicationArea = All; }
                field("API Key Set"; Rec."API Key Set") { ApplicationArea = All; }
                // Sin ExtendedDatatype = Masked a propósito:
                // cualquier página sobre la tabla muestra el valor en claro,
                // aunque la página de setup lo enmascare.
                field("API Key Input"; Rec."API Key Input") { ApplicationArea = All; }
                field("Insecure API Key"; Rec."Insecure API Key") { ApplicationArea = All; }
            }
            group(IsolatedStorage)
            {
                Caption = 'Isolated Storage';

                field(StorageKeyValue; StorageKey) { ApplicationArea = All; }
                // Aquí no hay nada que mostrar: la API Key en Isolated Storage
                // no es accesible desde una página. La codeunit solo la expone
                // como SecretText (*** en el debugger), y en cloud ni siquiera
                // el desarrollador puede extraer el texto plano.
                field(IsolatedKeyValue; '*** no accesible ***')
                {
                    ApplicationArea = All;
                    Caption = 'API Key en Isolated Storage';
                }
            }
        }
    }

    trigger OnOpenPage()
    begin
        if not Rec.Get() then
            Clear(Rec);
        StorageKey := 'ABC-ExternalService-ApiKey';
    end;

    var
        StorageKey: Text;
}
