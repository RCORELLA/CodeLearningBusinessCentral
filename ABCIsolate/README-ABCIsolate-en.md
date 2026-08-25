# ABCIsolate — Isolated Storage in Business Central

A hands-on exercise showing how to store confidential information (API keys, passwords, client secrets) securely in Business Central using **Isolated Storage** and **SecretText**, instead of storing it in a regular table field.

📺 Video walkthrough: [Isolated Storage in Business Central](https://www.youtube.com/watch?v=zKk-W6QoS7E)
📝 Blog post: [Isolated Storage in Business Central: The Right Way to Keep Your Secrets Safe](https://rcorella.github.io/LearningBusinessCentral/posts/isolated-storage-business-central.html)

## What this exercise covers

- A comparison between a masked text field (`ExtendedDatatype = Masked`) and using Isolated Storage.
- How the value of a masked field can still be read from another page or extension, exposing the data.
- How to save and read a value using Isolated Storage with the `Set`, `Get`, `Contains` and `Delete` methods.
- Using the `SecretText` type so the value can't be inspected even while debugging the extension.
- Declaring the access codeunit as `Internal`, so no external extension can read the value directly.

## Code structure

```
ABCIsolate/
├── app.json
└── src/
    ├── Codeunit...IsolatedStorageManagement.al   # Set / Get / Contains / Delete + SecretText
    ├── Page...SecureField.al                     # Field stored in Isolated Storage
    └── Page...InsecureField.al                   # Unmasked field (example of what NOT to do)
```

*(Update the file names above to match the actual ones in your project.)*

## How to try it

1. Open the `ABCIsolate` folder in VS Code with the AL Language extension installed.
2. Build the extension (`Ctrl+Shift+B` or, from the command palette: `AL: Package`).
3. Publish it to your Business Central sandbox.
4. Open the sample page and save a value in the secure field: notice it disappears from the table and is now managed by Isolated Storage instead.
5. Open the page inspector (`Ctrl+Alt+F1`) to confirm the field still shows as masked, and compare it with the insecure field's behavior.

## Requirements

- Business Central (sandbox or an on-premises test environment).
- VS Code + AL Language extension.

---

Part of the [CodeLearningBusinessCentral](../) exercise repository.
