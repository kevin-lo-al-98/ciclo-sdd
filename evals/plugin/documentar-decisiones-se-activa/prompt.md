---
description: 'Una decisión de arquitectura recién tomada, con su alternativa descartada. documentar-decisiones debe dispararse y la respuesta debe ser un ADR.'
expected_outcome: 'Un ADR en formato MADR con contexto, opciones consideradas (MongoDB y DynamoDB incluidas) y el motivo por el que se descartaron.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Acabamos de decidir en el equipo usar PostgreSQL en lugar de MongoDB para el servicio de pedidos: necesitamos transacciones entre pedidos y stock, y nadie del equipo conoce Mongo. La otra opción que se discutió fue DynamoDB, descartada por el lock-in con AWS. Déjalo registrado para que dentro de un año se sepa por qué.
