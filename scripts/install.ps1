<#
.SYNOPSIS
    Instala las skills de este repositorio en ~/.claude/skills.

.DESCRIPTION
    Por defecto crea enlaces simbólicos, de modo que editar el repositorio actualiza
    la skill instalada al instante. Los enlaces simbólicos en Windows requieren el
    Modo de desarrollador activado o una consola como administrador; si no se puede
    crear el enlace, el script copia los archivos y avisa.

.PARAMETER Copy
    Fuerza la copia en lugar del enlace simbólico.

.PARAMETER Skill
    Instala solo la skill indicada. Si se omite, instala todas.

.EXAMPLE
    .\scripts\install.ps1
    .\scripts\install.ps1 -Skill prompt-architect
    .\scripts\install.ps1 -Copy
#>
[CmdletBinding()]
param(
    [switch]$Copy,
    [string]$Skill
)

$ErrorActionPreference = 'Stop'

$repoRoot  = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $repoRoot 'skills'
$targetDir = Join-Path $HOME '.claude\skills'

if (-not (Test-Path $sourceDir)) {
    throw "No se encuentra el directorio de skills: $sourceDir"
}

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "Creado $targetDir"
}

$skills = Get-ChildItem -Path $sourceDir -Directory
if ($Skill) {
    $skills = $skills | Where-Object { $_.Name -eq $Skill }
    if (-not $skills) {
        throw "No existe la skill '$Skill' en $sourceDir"
    }
}

$installed = 0
$copied    = 0

foreach ($item in $skills) {
    $destination = Join-Path $targetDir $item.Name

    if (Test-Path $destination) {
        Remove-Item -Path $destination -Recurse -Force -Confirm:$false
    }

    $useCopy = $Copy.IsPresent

    if (-not $useCopy) {
        try {
            New-Item -ItemType SymbolicLink -Path $destination -Target $item.FullName -ErrorAction Stop | Out-Null
            Write-Host "  enlazada  $($item.Name)"
            $installed++
        }
        catch {
            $useCopy = $true
        }
    }

    if ($useCopy) {
        Microsoft.PowerShell.Management\Copy-Item -Path $item.FullName -Destination $destination -Recurse -Force
        Write-Host "  copiada   $($item.Name)"
        $installed++
        $copied++
    }
}

Write-Host ""
Write-Host "$installed skill(s) instaladas en $targetDir"

if ($copied -gt 0) {
    Write-Host ""
    Write-Warning "$copied skill(s) se copiaron en lugar de enlazarse."
    Write-Host "Los cambios en el repositorio NO se reflejaran hasta volver a ejecutar este script."
    Write-Host "Para usar enlaces simbolicos, activa el Modo de desarrollador en Windows"
    Write-Host "(Configuracion > Sistema > Para desarrolladores) o ejecuta como administrador."
}

Write-Host ""
Write-Host "Reinicia Claude Code para que detecte las skills nuevas."
