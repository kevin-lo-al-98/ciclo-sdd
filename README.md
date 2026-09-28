# docs-skills

Repositorio personal de desarrollo fullstack: skills de Claude Code por especialidad,
más fuentes de referencia curadas.

La idea es generalista a propósito. En lugar de una guía única que intenta cubrirlo
todo, hay una skill por especialidad y Claude carga la que corresponde a la tarea que
tenga delante.

## Skills

| Skill | Cubre |
|---|---|
| [`prompt-architect`](skills/prompt-architect/) | Elegir el modelo adecuado y redactar el prompt antes de empezar |
| [`frontend-react-ts`](skills/frontend-react-ts/) | React + TypeScript: tipado, estado, rendimiento, accesibilidad |
| [`frontend-angular`](skills/frontend-angular/) | Angular moderno: standalone, signals, RxJS, formularios |
| [`frontend-astro`](skills/frontend-astro/) | Astro: islas, estático vs servidor, content collections |
| [`backend-node-ts`](skills/backend-node-ts/) | APIs en Node + TypeScript: capas, validación, errores, seguridad |
| [`database-sql`](skills/database-sql/) | Modelado, índices, consultas, migraciones sin downtime |

`prompt-architect` es la que más se usa fuera de una tarea concreta: responde "¿qué
modelo uso para esto?" y "¿cómo le pido esto bien?".

## Instalación

Las skills viven en `~/.claude/skills`. El script las enlaza desde aquí, así que
editar el repositorio actualiza la skill instalada sin reinstalar.

```powershell
# Windows
.\scripts\install.ps1
```

```bash
# macOS / Linux
./scripts/install.sh
```

Para instalar solo una: `.\scripts\install.ps1 -Skill prompt-architect`.

En Windows, los enlaces simbólicos requieren el Modo de desarrollador activado
(Configuración → Sistema → Para desarrolladores) o una consola de administrador. Sin
eso, el script copia los archivos y avisa de que los cambios no se propagarán solos.

Reinicia Claude Code después de instalar.

## Fuentes

[`sources/README.md`](sources/README.md) reúne la documentación oficial por tecnología.
Solo entra ahí fuente primaria o material que se mantiene al día.

## Añadir una skill

Una skill es una carpeta con un `SKILL.md` que empieza por frontmatter:

```markdown
---
name: mi-skill
description: Qué cubre y, sobre todo, cuándo debe activarse.
---
```

El `description` es lo que decide si la skill se carga o no, así que enumera los
disparadores concretos: tecnologías, palabras que usarías al pedirlo, tipos de archivo.
Una descripción vaga produce una skill que nunca se activa.

El contenido extenso va en `references/` y se enlaza desde el `SKILL.md`; así el cuerpo
principal se mantiene corto y solo se lee el detalle cuando hace falta.
