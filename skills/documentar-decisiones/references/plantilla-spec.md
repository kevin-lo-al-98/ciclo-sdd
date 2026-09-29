# Plantilla de spec

Ubicación: `docs/specs/<nombre>.md`. El nombre describe el trabajo, sin número: una spec
se ejecuta y se cierra; no forma una serie ordenada como los ADRs.

La plantilla existe para forzar las tres condiciones de una spec útil: que sea
autocontenida, que declare lo que queda fuera y que termine con una verificación. Si una
sección no aplica, bórrala; pero `Fuera de alcance` y `Criterio de terminado` no se
borran nunca.

```markdown
# Spec: {qué se va a construir}

Estado: **{propuesta | en curso | terminada | abandonada}**. Datos verificados el
{AAAA-MM-DD} contra {fuente}. {Si hay versiones o precios, di que caducan.}

## Objetivo

{Qué debe existir al terminar y para qué. Dos o tres frases.}

## Contexto

{Lo que hay hoy y las restricciones que obligan. Enlaza los ADRs que ya fijan
decisiones: aquí no se repite el debate, se cita el resultado.}

## Diseño

{Cómo encaja. Nombra los archivos y las interfaces afectados, con su ruta: quien
ejecute la spec en una sesión limpia no tiene que adivinar dónde tocar.}

## Decisiones abiertas

{Lo que aún no está decidido, con la opción recomendada. Si una decisión abierta
merece alternativas y análisis, se convierte en un ADR y aquí solo queda el enlace.}

## Fuera de alcance

{Lo que esta spec no cubre. Sin esta sección, quien implementa amplía el trabajo.}

## Pasos

1. {paso ordenado y verificable}
2. {paso}

## Riesgos

{Qué puede salir mal y cómo se nota.}

## Criterio de terminado

{Una comprobación de extremo a extremo que demuestre que funciona: el comando que se
ejecuta y el resultado que se espera. No «el código está escrito».}
```
