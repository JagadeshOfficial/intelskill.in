# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running the dev server on Windows

If you see an error in PowerShell like "npm.ps1 cannot be loaded because running scripts is disabled", use the provided helper:

1. From PowerShell in the `frontend` folder run:

```
.\run-dev.bat
```

This calls `npm.cmd run dev` which avoids PowerShell script execution policy restrictions.

Alternative options:
- Open Command Prompt (cmd.exe) and run `npm run dev`.
- Temporarily bypass policy (one-off) from PowerShell:

```
powershell -ExecutionPolicy Bypass -NoProfile -Command "npm run dev"
```

If you'd like to permanently allow local scripts, run PowerShell as your user and:

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

