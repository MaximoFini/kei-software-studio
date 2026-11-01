# Guarda el token de Instagram que está en el portapapeles (copiado con "Copiar" en Meta Business):
#   - en .env (para correr scripts/publish_reel.py en la PC; .env no se commitea)
#   - en el secret IG_ACCESS_TOKEN de GitHub (para el workflow "Publicar reel")
# No imprime el token. Al final vacía el portapapeles.
#
# Uso (PowerShell, en la raíz del repo): .\scripts\guardar_token.ps1
$ErrorActionPreference = 'Stop'
$token = (Get-Clipboard -Raw).Trim()
if (-not $token.StartsWith('EAA') -or $token -match '\s') {
    Write-Error 'El portapapeles no tiene un token de Meta (tiene que empezar con EAA). Copialo de nuevo con el botón "Copiar".'
}

$root = Split-Path $PSScriptRoot -Parent
$lines = @("IG_ACCESS_TOKEN=$token", 'IG_USER_ID=17841434983139872')
[IO.File]::WriteAllLines((Join-Path $root '.env'), $lines)  # UTF-8 sin BOM

$token | gh secret set IG_ACCESS_TOKEN --repo MaximoFini/kei-software-studio
if ($LASTEXITCODE -ne 0) { Write-Error 'No se pudo guardar el secret en GitHub (¿gh auth login?)' }

Set-Clipboard -Value ' '
Write-Host "Listo: token guardado en .env y en el secret IG_ACCESS_TOKEN de GitHub ($($token.Length) caracteres)."
