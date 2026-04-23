$ErrorActionPreference = 'Stop'

$envFile = Join-Path $PSScriptRoot '.env'

if (Test-Path $envFile) {
    Write-Host "Found Spring config file at $envFile"
} else {
    Write-Host "No .env file found at $envFile. Starting with application.properties defaults."
}

Set-Location $PSScriptRoot
& .\mvnw.cmd spring-boot:run
