table 57500 "ABC Isolate Setup"
{
    Caption = 'Isolate Setup';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Primary Key"; Code[10])
        {
            Caption = 'Primary Key';
        }
        field(2; "API Key Set"; Boolean)
        {
            Caption = 'API Key Configured';
            Editable = false;
        }
        field(3; "API Key Input"; Text[250])
        {
            Caption = 'API Key';
        }
        field(4; "Insecure API Key"; Text[250])
        {
            Caption = 'Insecure API Key (visible)';
        }
    }

    keys
    {
        key(PK; "Primary Key")
        {
            Clustered = true;
        }
    }
}
