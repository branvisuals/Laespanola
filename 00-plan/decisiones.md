# Bitácora de decisiones

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-05 | Plan aprobado (`plan.md`). Se ejecutan Fase 0 y Fase 1 en la primera sesión. | Aprobación del plan en modo planificación. |
| 2026-10-05 | Modo de acceso a fuentes: **C (WebSearch + espejos de GitHub)** mientras no se decida otra cosa. La decisión A/B/C está pendiente y es necesaria antes de la Fase 2. | Prueba de red: más de 70 dominios de archivos, revistas y prensa devuelven denegación de política; solo pasan github.com y raw.githubusercontent.com. Firecrawl responde 402 (sin créditos). |
| 2026-10-05 | Tope de búsquedas: ~200 por agente (verificado con un agente nuevo tras agotarse otros). Tareas de 120 búsquedas o menos. | Dos agentes de reconocimiento agotaron su cupo. |
| 2026-10-05 | Los textos de dominio público descargados (Gutenberg, FRUS) se guardan en `02-fuentes/textos/` para que las citas sean cotejables por línea. | Trazabilidad. |
| 2026-10-05 | Los informes del reconocimiento se conservan íntegros en `00-plan/reconocimiento/`, con sus marcas [VERIFICADO] y [POR VERIFICAR], como punto de partida y no como evidencia. | Casi todo lo que contienen viene de fragmentos de buscador, no de lectura de texto completo. |
| 2026-10-06 | Fase 0 y Fase 1 completas y subidas. El registro de afirmaciones queda con 263 filas (181 hechos, 71 interpretaciones, 11 significados), todas pendientes de verificación; las narrativas tienen entre 15 y 31 marcas [POR VERIFICAR] cada una, listadas en su sección 7 como lagunas. | Cierre de la primera sesión de ejecución. |
| 2026-10-06 | **Corrección sobre el cupo de búsquedas**: el Workflow de la Fase 1 muestra que el cupo de 200 búsquedas es un fondo común de la sesión que comparten los agentes concurrentes (los tres narradores usaron 80 + 91 + 29 = 200 y el tercero quedó sin cupo), no 200 por agente como se anotó el 2026-10-05; el fondo parece reponerse con el tiempo. **Decisión pendiente**: antes de la Fase 2 hay que subir la variable `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` en la configuración del entorno (los buscadores de la Fase 2 necesitan del orden de 10.000 búsquedas). | Evidencia de los informes de los tres narradores. |
| 2026-10-06 | Los textos de dominio público ya se citan por línea: Mártir l. 11204-11207 (Quizqueia), Las Casas t.1 l. 9516 y t.3 l. 3197, Acta de 1804 l. 21-22/29/91, Franklin l. 7965-7969 (Código Rural). | Cotejo del extractor de afirmaciones. |

