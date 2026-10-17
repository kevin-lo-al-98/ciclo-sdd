---
description: 'Un correo de otra área con un pedido sin estructurar. flujo-de-requerimientos debe dispararse y la respuesta debe ser un requerimiento, no una spec técnica.'
expected_outcome: 'Un requerimiento con quién lo pide, el problema, el alcance y criterios verificables, sin saltar al diseño técnico.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Me llegó este correo de Ventas. Conviértelo en un requerimiento para que producto lo valide antes de que nadie se ponga a construir:

> De: Marta (Ventas)
> Asunto: listado de clientes
>
> Hola, para el cierre de trimestre necesitamos sacar el listado de clientes a Excel, filtrado por región y con lo que facturó cada uno en el trimestre. Ahora lo armamos a mano y tardamos dos días. Si puede estar antes del 15, mejor.
