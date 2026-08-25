permissionset 57501 "ABC Isolate Mgt."
{
    Assignable = true;
    Caption = 'Isolate Management';
    Permissions = tabledata "ABC Isolate Setup" = RIMD,
        table "ABC Isolate Setup" = X,
        page "ABC Isolate Setup Card" = X,
        page "ABC Insecure Secrets Viewer" = X,
        codeunit "ABC Isolate Integration Mgt." = X;
}
