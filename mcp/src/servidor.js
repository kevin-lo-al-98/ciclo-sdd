// Define el servidor MCP a partir de una colección de skills ya cargadas.
//
// Recibe las skills en memoria en lugar de leerlas: así este archivo sirve tal
// cual para el servidor local (que las lee del disco) y para el Worker de
// Cloudflare (que las trae embebidas en el bundle, porque allí no hay disco).

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { buscar, resolverReferencia } from './skills.js';

const VERSION = '0.1.0';

/** Respuesta de texto en el formato que espera MCP. */
const texto = (contenido) => ({ content: [{ type: 'text', text: contenido }] });

/** Respuesta de error: `isError` hace que el modelo la vea como fallo, no como dato. */
const error = (contenido) => ({ content: [{ type: 'text', text: contenido }], isError: true });

/**
 * @param {import('./skills.js').Skill[]} skills
 * @returns {McpServer}
 */
export function crearServidor(skills) {
  const porNombre = new Map(skills.map((s) => [s.nombre, s]));

  const servidor = new McpServer({ name: 'ciclo-sdd', version: VERSION });

  servidor.registerTool(
    'listar_skills',
    {
      title: 'Listar skills',
      description:
        'Lista todas las skills disponibles con su descripción y sus archivos de referencia. ' +
        'Úsala primero para saber qué hay antes de leer nada.',
      inputSchema: {},
    },
    async () => {
      if (skills.length === 0) return error('No se encontró ninguna skill.');
      const lineas = skills.map((skill) => {
        const refs = Object.keys(skill.referencias);
        const extra = refs.length > 0 ? `\n  referencias: ${refs.join(', ')}` : '';
        const avisos = skill.avisos.length > 0 ? `\n  ⚠ ${skill.avisos.join('; ')}` : '';
        return `## ${skill.nombre}\n${skill.descripcion}${extra}${avisos}`;
      });
      return texto(`${skills.length} skills:\n\n${lineas.join('\n\n')}`);
    },
  );

  servidor.registerTool(
    'buscar_skills',
    {
      title: 'Buscar skills',
      description:
        'Busca texto en el nombre, la descripción y el cuerpo de las skills, y devuelve las ' +
        'más relevantes con un fragmento de contexto. Devuelve dónde mirar, no el contenido ' +
        'completo: para eso está leer_skill.',
      inputSchema: {
        consulta: z.string().min(1).describe('Términos a buscar. Ignora acentos y mayúsculas.'),
        limite: z.number().int().min(1).max(20).default(5).describe('Máximo de resultados.'),
      },
    },
    async ({ consulta, limite }) => {
      const resultados = buscar(skills, consulta, limite);
      if (resultados.length === 0) {
        return texto(
          `Sin coincidencias para "${consulta}". Usa listar_skills para ver qué hay disponible.`,
        );
      }
      const lineas = resultados.map(({ skill, fragmento }) => {
        const contexto = fragmento ? `\n  …${fragmento}…` : '';
        return `## ${skill.nombre}\n${skill.descripcion}${contexto}`;
      });
      return texto(lineas.join('\n\n'));
    },
  );

  servidor.registerTool(
    'leer_skill',
    {
      title: 'Leer una skill',
      description:
        'Devuelve el contenido de un SKILL.md, o de uno de sus archivos de references/ si se ' +
        'indica `archivo`. El SKILL.md enlaza sus referencias: léelas solo cuando el cuerpo ' +
        'te remita a ellas.',
      inputSchema: {
        nombre: z.string().min(1).describe('Nombre de la skill, tal como lo devuelve listar_skills.'),
        archivo: z
          .string()
          .optional()
          .describe('Archivo de referencia, p. ej. "casos-frecuentes.md". Omítelo para el SKILL.md.'),
      },
    },
    async ({ nombre, archivo }) => {
      const skill = porNombre.get(nombre);
      if (!skill) {
        const cercanas = skills
          .map((s) => s.nombre)
          .filter((n) => n.includes(nombre) || nombre.includes(n));
        const pista = cercanas.length > 0 ? ` ¿Querías ${cercanas.join(' o ')}?` : '';
        return error(`No existe la skill "${nombre}".${pista}`);
      }

      if (!archivo) return texto(skill.cuerpo);

      const referencia = resolverReferencia(skill, archivo);
      if (!referencia) {
        const disponibles = Object.keys(skill.referencias);
        return error(
          disponibles.length === 0
            ? `La skill "${nombre}" no tiene archivos de referencia.`
            : `"${archivo}" no está en "${nombre}". Disponibles: ${disponibles.join(', ')}.`,
        );
      }
      return texto(referencia.contenido);
    },
  );

  return servidor;
}
