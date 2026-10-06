# La Española: reconstrucción histórica imparcial

Proyecto de investigación documental sobre la isla de La Española (República Dominicana y Haití). Objetivo: reconstruir, con método explícito y fuentes trazables, lo que se puede afirmar con confianza, lo que está genuinamente disputado y lo que es inverificable, sin adoptar el marco de ninguno de los dos relatos nacionales. Se ponen a prueba dos tesis identitarias: la haitiana (isla una e indivisible; descendencia taína y africana de toda la isla) y la dominicana (pueblo criollo descendiente de taínos y españoles). Todo el corpus es Markdown y CSV en este repositorio; el idioma de trabajo es el español, con citas en idioma original y traducción.

## Orden de lectura obligatorio al empezar una sesión
1. `00-plan/plan.md` (plan completo; las secciones 5, 7, 10 y 15 son las operativas).
2. `00-plan/decisiones.md` (bitácora: estado real, decisiones tomadas y pendientes).
3. `01-metodologia/metodo.md`, `escala-de-confianza.md` y `glosario.md`.
4. Según la fase: `03-afirmaciones/registro.md` (afirmaciones a verificar) y `02-fuentes/registro.csv` (fuentes).

## Estado de las fases
- Fase 0 (infraestructura) y Fase 1 (narrativas y registro de 263 afirmaciones): completas.
- **Fase 2 en curso** (barrido de fuentes por módulo, plan sección 10, modo A desde la sesión local). Registrados: M13, M16, M08, M00, M09 (`02-fuentes/por-modulo/M##.md`; `registro.csv` con 1.575 filas; `03-afirmaciones/cobertura.csv` con 5.833 pares). Pendientes de arreglo: fusionar `M09.corrida-1.md` en `M09.md` e integrar `raw/corrida-2/M00-*` en `M00.md`. Fusionados sin registrar (ids provisionales): M05, M06. Sin empezar: M11, M10, M01, M03, M15, M07, M14, M12, M04, M02. Se continúa con una corrida NUEVA del Workflow `00-plan/workflows/fase2-barrido-fuentes.js` (nunca con `resumeFromRunId`; ver aviso en el script) con `args.modulos` y `args.registrar_solo` como indica la última entrada de `decisiones.md`.
- Fases 3 a 8: pendientes, en el orden del plan.

## Reglas no negociables
- Nada se cita de memoria. Lo confirmado lleva `[VERIFICADO: fuente]`; lo demás `[POR VERIFICAR]` y no entra en la síntesis.
- Toda afirmación lleva letra de confianza (A/B/C/D) con justificación; hecho, interpretación y significado se separan siempre.
- Toda cifra se da como rango con autor y base. Una cifra sin fuente primaria trazable es D.
- Los términos cargados (ocupación/unificación, El Corte/Kout kouto, indio, invasión, separación/independencia, genocidio...) se usan en su forma descriptiva y se declaran en `01-metodologia/glosario.md`; si aparece uno nuevo, se añade al glosario.
- Simetría: el mismo rigor para ambos relatos; cada disputa muestra todas las versiones serias antes del veredicto.
- Identificadores: fuentes `F-####` (`02-fuentes/registro.csv`), afirmaciones `A-###` (`03-afirmaciones/registro.csv`), módulos `M00`-`M16`, ejes `E1`-`E7`. No se renumera sin dejar columna `id_anterior`.
- Textos cotejables: `02-fuentes/textos/` (Las Casas, Pedro Mártir, Brevísima, Acta de 1804, FRUS 1861-1938, obras de época). Se citan por archivo y número de línea (`grep -n`); los textos largos se leen con `curl` y `grep`, no con lectura web, que trunca.
- Presupuesto de búsqueda: diseñar agentes con 120 búsquedas o menos y anotar las que quedaron sin hacer.
- Cada fase y cada módulo terminan con commit y push a la rama `claude/hispaniola-historical-research-plan-79fana`. Antes de empezar en cualquier máquina: `git pull origin claude/hispaniola-historical-research-plan-79fana`. Una sola sesión activa sobre la rama a la vez.
- Lo que no se pudo consultar se anota en `00-plan/decisiones.md` y, al final, en `07-sintesis/limites.md`.

## Cómo se ejecutan las fases
- Cada fase es un Workflow de agentes (orquestación determinista). Los scripts se guardan en `00-plan/workflows/` antes de lanzarlos; `fase1-narrativas-afirmaciones.js` es el modelo (reglas comunes inyectadas en cada prompt, salida estructurada con schema, agentes que escriben directamente los archivos del repo).
- Si la herramienta Workflow no está disponible, se ejecuta la misma estructura con agentes en paralelo (herramienta Agent) siguiendo los prompts del script.
- Entre fases se leen los resultados, se registra en `decisiones.md` y se hace push.

## Infraestructura
- `.claude/settings.json` fija el cupo de búsquedas web de la sesión en 20.000.
- En la nube (claude.ai/code) la red del entorno bloqueaba los archivos digitales en octubre de 2026; en una máquina local no hay ese bloqueo. Comprobar al arrancar con un fetch a archive.org.
- Herramientas opcionales: Firecrawl (necesita créditos) para páginas y PDFs difíciles.
