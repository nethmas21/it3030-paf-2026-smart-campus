$ErrorActionPreference = 'Stop'

$envFile = Join-Path $PSScriptRoot '.env'

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            return
        }

        $parts = $line -split '=', 2
        if ($parts.Count -ne 2) {
            return
        }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }

    Write-Host "Loaded environment variables from $envFile"
} else {
    Write-Host "No .env file found at $envFile. Starting with current environment."
}

Set-Location $PSScriptRoot
& .\mvnw.cmd spring-boot:run
