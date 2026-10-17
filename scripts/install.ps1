<#
.SYNOPSIS
    Instala las skills, los comandos y los subagentes de este repositorio en ~/.claude.

.DESCRIPTION
    Por defecto crea enlaces simbólicos, de modo que editar el repositorio actualiza
    la skill o el comando instalado al instante. Los enlaces simbólicos en Windows
    requieren el Modo de desarrollador activado o una consola como administrador; si no
    se puede crear el enlace, el script copia el archivo y avisa.

    Las skills (carpetas en skills/) se enlazan en ~/.claude/skills. Los comandos
    (archivos .md en commands/) se enlazan en ~/.claude/commands. Los subagentes
    (archivos .md en agents/) se enlazan en ~/.claude/agents.

    Con -Project, copia todo a <ruta>/.claude/ en lugar de ~/.claude, para versionarlo en
    ese proyecto y que lo reciba todo su equipo. Ahí siempre copia: un enlace a este clon
    no le sirve a nadie más. Deja <ruta>/.claude/docs-skills.version con la versión del
    plugin y el commit de origen.

.PARAMETER Copy
    Fuerza la copia en lugar del enlace simbólico.

.PARAMETER Project
    Ruta del proyecto adoptante. Instala en <ruta>/.claude/ copiando, nunca enlazando.

.PARAMETER Skill
    Instala solo la skill indicada. Sin -Skill, -Command ni -Agent, instala todo.

.PARAMETER Command
    Instala solo el comando indicado (sin la extensión .md).

.PARAMETER Agent
    Instala solo el subagente indicado (sin la extensión .md).

.EXAMPLE
    .\scripts\install.ps1
    .\scripts\install.ps1 -Skill prompt-architect
    .\scripts\install.ps1 -Command sdd-new
    .\scripts\install.ps1 -Agent code-reviewer
    .\scripts\install.ps1 -Copy
    .\scripts\install.ps1 -Project ..\mi-proyecto
#>
[CmdletBinding()]
param(
    [switch]$Copy,
    [string]$Skill,
    [string]$Command,
    [string]$Agent,
    [string]$Project
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot

# En un proyecto se copia siempre: el enlace apuntaría a este clon, que los demás
# miembros del equipo no tienen.
if ($Project) {
    if (-not (Test-Path $Project -PathType Container)) {
        throw "No existe el directorio del proyecto: $Project"
    }
    $claudeRoot  = Join-Path (Resolve-Path $Project).Path '.claude'
    $claudeLabel = Join-Path $Project '.claude'
    $Copy        = [switch]::new($true)
}
else {
    $claudeRoot  = Join-Path $HOME '.claude'
    $claudeLabel = '~/.claude'
}

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

# Cada filtro instala solo lo suyo; sin ninguno se instala todo. Pasar varios instala
# cada elemento indicado.
$installAll  = -not $Skill -and -not $Command -and -not $Agent
$runSkills   = $Skill -or $installAll
$runCommands = $Command -or $installAll
$runAgents   = $Agent -or $installAll

$skillsResult = if ($runSkills) {
    Install-Symlinked -Label 'skill' `
        -SourceDir (Join-Path $repoRoot 'skills') `
        -TargetDir (Join-Path $claudeRoot 'skills') `
        -OnlyName $Skill -ItemKind Directory -ForceCopy:$Copy
}
else {
    [pscustomobject]@{ Installed = 0; Copied = 0 }
}

$commandsResult = if ($runCommands) {
    Install-Symlinked -Label 'comando' `
        -SourceDir (Join-Path $repoRoot 'commands') `
        -TargetDir (Join-Path $claudeRoot 'commands') `
        -OnlyName $Command -ItemKind File -ForceCopy:$Copy
}
else {
    [pscustomobject]@{ Installed = 0; Copied = 0 }
}

$agentsResult = if ($runAgents) {
    Install-Symlinked -Label 'agente' `
        -SourceDir (Join-Path $repoRoot 'agents') `
        -TargetDir (Join-Path $claudeRoot 'agents') `
        -OnlyName $Agent -ItemKind File -ForceCopy:$Copy
}
else {
    [pscustomobject]@{ Installed = 0; Copied = 0 }
}

$totalCopied = $skillsResult.Copied + $commandsResult.Copied + $agentsResult.Copied

Write-Host ""
Write-Host "$($skillsResult.Installed) skill(s) en $claudeLabel/skills, $($commandsResult.Installed) comando(s) en $claudeLabel/commands, $($agentsResult.Installed) agente(s) en $claudeLabel/agents"

if ($Project) {
    # La versión y el commit de origen dicen a cualquiera del equipo qué copia tiene el
    # proyecto, y si se quedó atrás respecto al plugin.
    $version = (Get-Content (Join-Path $repoRoot '.claude-plugin\plugin.json') -Raw | ConvertFrom-Json).version
    $commit  = (git -C $repoRoot rev-parse HEAD 2>$null)
    if (-not $commit) { $commit = 'desconocido' }
    $lines = @(
        "version: $version"
        "commit: $commit"
        "fecha: $(Get-Date -Format 'yyyy-MM-dd')"
        "origen: https://github.com/kevin-lo-al-98/docs-skills"
    )
    [System.IO.File]::WriteAllLines((Join-Path $claudeRoot 'docs-skills.version'), $lines)
    Write-Host "Version $version ($commit) anotada en $claudeLabel/docs-skills.version"
    Write-Host ""
    Write-Host "Revisa los archivos y versionalos en el proyecto; este script no hace commit."
}
elseif ($totalCopied -gt 0) {
    Write-Host ""
    Write-Warning "$totalCopied elemento(s) se copiaron en lugar de enlazarse."
    Write-Host "Los cambios en el repositorio NO se reflejaran hasta volver a ejecutar este script."
    Write-Host "Para usar enlaces simbolicos, activa el Modo de desarrollador en Windows"
    Write-Host "(Configuracion > Sistema > Para desarrolladores) o ejecuta como administrador."
}

Write-Host ""
Write-Host "Si tambien tienes instalado el plugin docs-skills, cada skill aparecera duplicada: usa una sola via."
Write-Host "Reinicia Claude Code para que detecte las skills, los comandos y los agentes nuevos."
