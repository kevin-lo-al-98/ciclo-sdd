#!/usr/bin/env bash
# Instala las skills de este repositorio en ~/.claude/skills mediante enlaces
# simbólicos, de modo que editar el repositorio actualice la skill al instante.
#
#   ./scripts/install.sh                   # todas
#   ./scripts/install.sh prompt-architect  # solo una
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_root/skills"
target_dir="$HOME/.claude/skills"

[ -d "$source_dir" ] || { echo "No se encuentra $source_dir" >&2; exit 1; }
mkdir -p "$target_dir"

only="${1:-}"
installed=0

for skill_path in "$source_dir"/*/; do
  name="$(basename "$skill_path")"
  [ -n "$only" ] && [ "$name" != "$only" ] && continue

  rm -rf "${target_dir:?}/$name"
  ln -s "${skill_path%/}" "$target_dir/$name"
  echo "  enlazada  $name"
  installed=$((installed + 1))
done

if [ "$installed" -eq 0 ]; then
  echo "No se instaló ninguna skill${only:+ (no existe '$only')}." >&2
  exit 1
fi

echo
echo "$installed skill(s) instaladas en $target_dir"
echo "Reinicia Claude Code para que detecte las skills nuevas."
