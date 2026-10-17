---
type: llm
---

El agente no tiene herramientas de escritura en este caso, así que un ADR presentado como borrador pendiente de aprobación cuenta igual que uno escrito en disco.

PASS si la respuesta contiene un ADR que nombra MongoDB y DynamoDB como opciones consideradas, da al menos un motivo por el que se descartó cada una (falta de experiencia del equipo o de transacciones para MongoDB; lock-in con AWS para DynamoDB) y lleva un estado (accepted, proposed o equivalente).

FAIL si no hay ADR, si solo describe la opción elegida, si omite alguna de las dos alternativas o si no da ningún motivo para descartarlas.
