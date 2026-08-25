page 57503 "ABC Isolate Setup Card"
{
    PageType = Card;
    ApplicationArea = All;
    UsageCategory = Administration;
    SourceTable = "ABC Isolate Setup";

    layout
    {
        area(Content)
        {
            group(General)
            {
                field("API Key Set"; Rec."API Key Set") { ApplicationArea = All; }
                field("API Key Input"; Rec."API Key Input")
                {
                    ApplicationArea = All;
                    ExtendedDatatype = Masked;
                }
                field("Insecure API Key"; Rec."Insecure API Key")
                {
                    ApplicationArea = All;
                    ExtendedDatatype = Masked;
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(SaveToIsolatedStorage)
            {
                ApplicationArea = All;
                Caption = 'Guardar en Isolated Storage';
                Image = EncryptionKeys;

                trigger OnAction()
                var
                    IsolateMgt: Codeunit "ABC Isolate Integration Mgt.";
                    ApiKeySecret: SecretText;
                begin
                    if Rec."API Key Input" = '' then
                        Error('Introduce una API Key primero.');

                    ApiKeySecret := Rec."API Key Input";
                    IsolateMgt.SetApiKey(ApiKeySecret);
                    Clear(Rec."API Key Input");
                    Rec."API Key Set" := true;
                    Rec.Modify();
                    CurrPage.Update(false);
                    Message('API Key guardada en Isolated Storage. El campo de entrada se ha vaciado.');
                end;
            }
            action(CallExternalService)
            {
                ApplicationArea = All;
                Caption = 'Llamar a servicio externo';
                Image = Web;

                trigger OnAction()
                var
                    IsolateMgt: Codeunit "ABC Isolate Integration Mgt.";
                begin
                    IsolateMgt.CallExternalService();
                end;
            }
            action(OpenInsecureSecretsViewer)
            {
                ApplicationArea = All;
                Caption = 'Ver secretos en claro';
                Image = View;

                trigger OnAction()
                begin
                    Page.Run(Page::"ABC Insecure Secrets Viewer");
                end;
            }
        }
    }

    trigger OnOpenPage()
    begin
        if not Rec.Get() then begin
            Rec.Init();
            Rec.Insert();
        end;
    end;
}
