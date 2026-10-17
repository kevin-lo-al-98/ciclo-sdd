<#
.SYNOPSIS
    Instala las skills y los comandos de este repositorio en ~/.claude.

.DESCRIPTION
    Por defecto crea enlaces simbólicos, de modo que editar el repositorio actualiza
    la skill o el comando instalado al instante. Los enlaces simbólicos en Windows
    requieren el Modo de desarrollador activado o una consola como administrador; si no
    se puede crear el enlace, el script copia el archivo y avisa.

    Las skills (carpetas en skills/) se enlazan en ~/.claude/skills. Los comandos
    (archivos .md en commands/) se enlazan en ~/.claude/commands.

.PARAMETER Copy
    Fuerza la copia en lugar del enlace simbólico.

.PARAMETER Skill
    Instala solo la skill indicada. Si se omite (junto con -Command), instala todas las
    skills y todos los comandos.

.PARAMETER Command
    Instala solo el comando indicado (sin la extensión .md). Si se omite (junto con
    -Skill), instala todas las skills y todos los comandos.

.EXAMPLE
    .\scripts\install.ps1
    .\scripts\install.ps1 -Skill prompt-architect
    .\scripts\install.ps1 -Command sdd-new
    .\scripts\install.ps1 -Copy
#>
[CmdletBinding()]
param(
    [switch]$Copy,
    [string]$Skill,
    [string]$Command
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot

function Install-Symlinked {
    param(
        [string]$Label,
        [string]$SourceDir,
        [string]$TargetDir,
        [string]$OnlyName,
        [ValidateSet('Directory', 'File')]
        [string]$ItemKind,
        [switch]$ForceCopy
    )

    if (-not (Test-Path $SourceDir)) {
        return [pscustomobject]@{ Installed = 0; Copied = 0 }
    }

    if (-not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
        Write-Host "Creado $TargetDir"
    }

    if ($ItemKind -eq 'Directory') {
        $items = Get-ChildItem -Path $SourceDir -Directory
    }
    else {
        $items = Get-ChildItem -Path $SourceDir -Filter '*.md' -File
    }

    if ($OnlyName) {
        $items = $items | Where-Object { $_.BaseName -eq $OnlyName }
        if (-not $items) {
            throw "No existe '$OnlyName' en $SourceDir"
        }
    }

    $installed = 0
    $copied    = 0

    foreach ($item in $items) {
        $destinationName = if ($ItemKind -eq 'Directory') { $item.Name } else { $item.Name }
        $destination = Join-Path $TargetDir $destinationName

        if (Test-Path $destination) {
            Remove-Item -Path $destination -Recurse -Force -Confirm:$false
        }

        $useCopy = $ForceCopy.IsPresent

        if (-not $useCopy) {
            try {
                $linkType = if ($ItemKind -eq 'Directory') { 'SymbolicLink' } else { 'SymbolicLink' }
                New-Item -ItemType $linkType -Path $destination -Target $item.FullName -ErrorAction Stop | Out-Null
                Write-Host "  enlazad[ao]  $Label/$($item.BaseName)"
                $installed++
            }
            catch {
                $useCopy = $true
            }
        }

        if ($useCopy) {
            if ($ItemKind -eq 'Directory') {
                Microsoft.PowerShell.Management\Copy-Item -Path $item.FullName -Destination $destination -Recurse -Force
            }
            else {
                Microsoft.PowerShell.Management\Copy-Item -Path $item.FullName -Destination $destination -Force
            }
            Write-Host "  copiad[ao]   $Label/$($item.BaseName)"
            $installed++
            $copied++
        }
    }

    return [pscustomobject]@{ Installed = $installed; Copied = $copied }
}

# -Skill sola instala solo esa skill (no toca comandos); -Command sola, al revés. Sin
# ninguna de las dos, se instala todo. Pasar ambas instala esa skill y ese comando.
$runSkills   = $Skill -or (-not $Skill -and -not $Command)
$runCommands = $Command -or (-not $Skill -and -not $Command)

$skillsResult = if ($runSkills) {
    Install-Symlinked -Label 'skill' `
        -SourceDir (Join-Path $repoRoot 'skills') `
        -TargetDir (Join-Path $HOME '.claude\skills') `
        -OnlyName $Skill -ItemKind Directory -ForceCopy:$Copy
}
else {
    [pscustomobject]@{ Installed = 0; Copied = 0 }
}

$commandsResult = if ($runCommands) {
    Install-Symlinked -Label 'comando' `
        -SourceDir (Join-Path $repoRoot 'commands') `
        -TargetDir (Join-Path $HOME '.claude\commands') `
        -OnlyName $Command -ItemKind File -ForceCopy:$Copy
}
else {
    [pscustomobject]@{ Installed = 0; Copied = 0 }
}

$totalInstalled = $skillsResult.Installed + $commandsResult.Installed
$totalCopied    = $skillsResult.Copied + $commandsResult.Copied

Write-Host ""
Write-Host "$($skillsResult.Installed) skill(s) en ~/.claude/skills, $($commandsResult.Installed) comando(s) en ~/.claude/commands"

if ($totalCopied -gt 0) {
    Write-Host ""
    Write-Warning "$totalCopied elemento(s) se copiaron en lugar de enlazarse."
    Write-Host "Los cambios en el repositorio NO se reflejaran hasta volver a ejecutar este script."
    Write-Host "Para usar enlaces simbolicos, activa el Modo de desarrollador en Windows"
    Write-Host "(Configuracion > Sistema > Para desarrolladores) o ejecuta como administrador."
}

Write-Host ""
Write-Host "Reinicia Claude Code para que detecte las skills y los comandos nuevos."
