---
type: llm
---

PASS si la revisión dice que el criterio 3 (no generar el archivo y avisar si pasa de 10 000 filas) no está implementado en el diff, y lo trata como algo que bloquea la aprobación o que hay que resolver antes de aprobar.

FAIL si no menciona el límite de 10 000 filas, o si da el MR por completo respecto a la spec.
