#!/usr/bin/env node
// Punto de entrada del servidor MCP local, por transporte stdio.
//
// REGLA DURA: nada puede escribir en stdout salvo el propio transporte. stdout
// es el canal del protocolo; un `console.log` de depuración corrompe el JSON-RPC
// y el cliente cierra la conexión con un error que no menciona el log. Todo lo
// que quieras mostrar va a stderr con `console.error`.

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { cargarDesdeDisco } from './cargar-disco.js';
import { crearServidor } from './servidor.js';

const aqui = dirname(fileURLToPath(import.meta.url));

// Por defecto, `skills/` del repositorio que contiene este archivo (mcp/src → ../..).
// Se puede apuntar a otro sitio con SKILLS_DIR, útil si el servidor se instala
// aparte del repositorio de skills.
const raiz = process.env.SKILLS_DIR
  ? resolve(process.env.SKILLS_DIR)
  : resolve(aqui, '..', '..', 'skills');

const skills = await cargarDesdeDisco(raiz);
console.error(`ciclo-sdd: ${skills.length} skills cargadas desde ${raiz}`);

const servidor = crearServidor(skills);
await servidor.connect(new StdioServerTransport());
