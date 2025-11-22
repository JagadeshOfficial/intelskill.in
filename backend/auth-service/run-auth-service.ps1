<#
  Helper script to load environment variables from .env and run the auth-service jar.
  Usage: Open PowerShell in the repo root and run: .\backend\auth-service\run-auth-service.ps1
#>

if (-Not (Test-Path -Path ".\backend\auth-service\.env")) {
    Write-Error ".env file not found at backend/auth-service/. Please create it with MAIL_USERNAME and MAIL_PASSWORD."
    exit 1
}

Write-Host "Loading environment variables from .\.\backend\auth-service\.env"
Get-Content .\backend\auth-service\.env | ForEach-Object {
    if ($_ -and $_ -notmatch '^\s*#') {
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            Write-Host "Setting $name"
            [System.Environment]::SetEnvironmentVariable($name, $value)
        }
    }
}

Write-Host "Starting auth-service jar..."
Push-Location .\backend\auth-service\target
if (-Not (Test-Path -Path "auth-service-1.0.0.jar")) {
    Write-Host "Jar not found. Building the project first..."
    Pop-Location
    mvn -DskipTests=true -f .\backend\auth-service\ clean package
    Push-Location .\backend\auth-service\target
}

# Start the jar as a separate process so it continues running after this script exits
Write-Host "Launching auth-service in background..."
Start-Process -FilePath 'java' -ArgumentList '-jar', '.\auth-service-1.0.0.jar' -WorkingDirectory (Get-Location) -NoNewWindow -PassThru | Out-Null
Write-Host "Auth-service started (background). Check logs in the terminal that the process created." 
Pop-Location
