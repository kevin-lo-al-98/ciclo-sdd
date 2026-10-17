---
description: 'Una decisión de arquitectura ya tomada. Es trabajo de documentar-decisiones: flujo-de-requerimientos no debe dispararse.'
expected_outcome: 'Un ADR de la decisión; flujo-de-requerimientos no se invoca.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Decidimos mandar las facturas por una cola SQS en lugar de llamar al servicio de facturación de forma síncrona, porque ese servicio se cae en los picos de fin de mes. Registra la decisión.
