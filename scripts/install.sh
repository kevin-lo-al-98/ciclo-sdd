#!/usr/bin/env bash
# Instala las skills, los comandos y los subagentes de este repositorio en ~/.claude
# mediante enlaces simbólicos, de modo que editar el repositorio actualice lo instalado
# al instante.
#
# Con --project <ruta>, copia todo a <ruta>/.claude/ para versionarlo en ese proyecto y
# que lo reciba todo su equipo. Ahí siempre copia: un enlace a este clon no le sirve a
# nadie más. Deja <ruta>/.claude/docs-skills.version con la versión y el commit de origen.
#
#   ./scripts/install.sh                                   # todo
#   ./scripts/install.sh prompt-architect                  # solo la skill, el comando o el agente con ese nombre
#   ./scripts/install.sh --project ../mi-proyecto          # todo, copiado al proyecto
#   ./scripts/install.sh --project ../mi-proyecto sdd-new  # solo esa pieza, copiada al proyecto
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
project=""
only=""

while [ $# -gt 0 ]; do
  case "$1" in
    --project)
      [ $# -ge 2 ] || { echo "Falta la ruta tras --project." >&2; exit 1; }
      project="$2"
      shift 2
      ;;
    *)
      only="$1"
      shift
      ;;
  esac
done

if [ -n "$project" ]; then
  [ -d "$project" ] || { echo "No existe el directorio del proyecto: $project" >&2; exit 1; }
  claude_root="$(cd "$project" && pwd)/.claude"
  claude_label="$project/.claude"
else
  claude_root="$HOME/.claude"
  claude_label="~/.claude"
fi

installed=0

# Enlaza en ~/.claude; en un proyecto copia, porque el enlace apuntaría a este clon.
place() {
  local source="$1" destination="$2"
  if [ -n "$project" ]; then
    cp -R "$source" "$destination"
  else
    ln -s "$source" "$destination"
  fi
}

verb() {
  if [ -n "$project" ]; then echo "copiad$1"; else echo "enlazad$1"; fi
}

install_dir_items() {
  local label="$1" source_dir="$2" target_dir="$3"
  [ -d "$source_dir" ] || return 0
  mkdir -p "$target_dir"

  for item_path in "$source_dir"/*/; do
    [ -d "$item_path" ] || continue
    local name="$(basename "$item_path")"
    [ -n "$only" ] && [ "$name" != "$only" ] && continue

    rm -rf "${target_dir:?}/$name"
    place "${item_path%/}" "$target_dir/$name"
    echo "  $(verb a)  $label/$name"
    installed=$((installed + 1))
  done
}

install_file_items() {
  local label="$1" source_dir="$2" target_dir="$3"
  [ -d "$source_dir" ] || return 0
  mkdir -p "$target_dir"

  for item_path in "$source_dir"/*.md; do
    [ -f "$item_path" ] || continue
    local filename="$(basename "$item_path")"
    local name="${filename%.md}"
    [ -n "$only" ] && [ "$name" != "$only" ] && continue

    rm -f "${target_dir:?}/$filename"
    place "$item_path" "$target_dir/$filename"
    echo "  $(verb o)  $label/$name"
    installed=$((installed + 1))
  done
}

install_dir_items  "skill"   "$repo_root/skills"   "$claude_root/skills"
install_file_items "comando" "$repo_root/commands" "$claude_root/commands"
install_file_items "agente"  "$repo_root/agents"   "$claude_root/agents"

if [ "$installed" -eq 0 ]; then
  echo "No se instaló nada${only:+ (no existe '$only')}." >&2
  exit 1
fi

echo
echo "$installed elemento(s) instalados en $claude_label"

if [ -n "$project" ]; then
  # La versión y el commit de origen dicen a cualquiera del equipo qué copia tiene el
  # proyecto, y si se quedó atrás respecto al plugin.
  version="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$repo_root/.claude-plugin/plugin.json")"
  commit="$(git -C "$repo_root" rev-parse HEAD 2>/dev/null || echo desconocido)"
  {
    echo "version: $version"
    echo "commit: $commit"
    echo "fecha: $(date +%Y-%m-%d)"
    echo "origen: https://github.com/kevin-lo-al-98/docs-skills"
  } > "$claude_root/docs-skills.version"
  echo "Versión $version ($commit) anotada en $claude_label/docs-skills.version"
  echo
  echo "Revisa los archivos y versiónalos en el proyecto; este script no hace commit."
fi

echo
echo "Si también tienes instalado el plugin docs-skills, cada skill aparecerá duplicada: usa una sola vía."
echo "Reinicia Claude Code para que detecte las skills, los comandos y los agentes nuevos."
