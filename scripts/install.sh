#!/usr/bin/env bash
# Instala las skills y los comandos de este repositorio en ~/.claude mediante enlaces
# simbólicos, de modo que editar el repositorio actualice la skill o el comando al
# instante.
#
#   ./scripts/install.sh                   # todas las skills y todos los comandos
#   ./scripts/install.sh prompt-architect  # solo una skill o un comando con ese nombre
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
only="${1:-}"
installed=0

install_dir_items() {
  local label="$1" source_dir="$2" target_dir="$3"
  [ -d "$source_dir" ] || return 0
  mkdir -p "$target_dir"

  for item_path in "$source_dir"/*/; do
    [ -d "$item_path" ] || continue
    local name="$(basename "$item_path")"
    [ -n "$only" ] && [ "$name" != "$only" ] && continue

    rm -rf "${target_dir:?}/$name"
    ln -s "${item_path%/}" "$target_dir/$name"
    echo "  enlazada  $label/$name"
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
    ln -s "$item_path" "$target_dir/$filename"
    echo "  enlazado  $label/$name"
    installed=$((installed + 1))
  done
}

install_dir_items  "skill"   "$repo_root/skills"   "$HOME/.claude/skills"
install_file_items "comando" "$repo_root/commands" "$HOME/.claude/commands"

if [ "$installed" -eq 0 ]; then
  echo "No se instaló nada${only:+ (no existe '$only')}." >&2
  exit 1
fi

echo
echo "$installed elemento(s) instalados en ~/.claude"
echo "Reinicia Claude Code para que detecte las skills y los comandos nuevos."
