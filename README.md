# La Española: reconstrucción histórica imparcial

Investigación documental sobre la historia de la isla de La Española (Ayiti, Quisqueya, Hispaniola, Santo Domingo, Saint-Domingue, Haití), compartida hoy por la República Dominicana y Haití. El objetivo es reconstruir, con método explícito y fuentes trazables, lo que se puede afirmar con confianza, lo que está genuinamente disputado y lo que es inverificable, sin adoptar el marco de ninguno de los dos relatos nacionales. Dos afirmaciones identitarias se someten a prueba: la haitiana (isla una e indivisible; descendencia taína y africana de toda la isla) y la dominicana (pueblo criollo descendiente de taínos y españoles).

## Cómo leer este repositorio

| Carpeta | Qué contiene |
|---|---|
| `00-plan/` | El plan completo, la bitácora de decisiones y los tres informes del reconocimiento inicial (fuentes, historiografía, evidencia científica). |
| `01-metodologia/` | Reglas de trabajo, escala de confianza (A/B/C/D), glosario de términos cargados y plantillas de ficha. |
| `02-fuentes/` | Registro de fuentes (`registro.csv`), bibliografía anotada por módulo, extractos de fuentes primarias y textos de dominio público descargados (`textos/`). |
| `03-afirmaciones/` | Las tres narrativas en su versión más fuerte (dominicana, haitiana, internacional) y el registro de afirmaciones contrastables. |
| `04-periodos/` | Reconstrucción por módulo (M00 a M16), con hechos establecidos, probables, disputados e inverificables. |
| `05-ejes/` | Capítulos transversales (identidad y ascendencia, frontera, esclavitud, nombres, historiografía, economía y ecología, historia compartida). |
| `06-verificacion/` | Veredictos de la verificación adversarial, citas cotejadas, auditoría de sesgo, contradicciones. |
| `07-sintesis/` | Reconstrucción final, mapa de disputas, cronología, capítulo sobre identidad, bibliografía y límites. |

## Estado

- **Fase 0** (infraestructura): completa (2026-10-06).
- **Fase 1** (narrativas y registro de afirmaciones): completa (2026-10-06). Tres narrativas en `03-afirmaciones/narrativas/` y 263 afirmaciones contrastables en `03-afirmaciones/registro.md` y `registro.csv`, todas en estado pendiente de verificación.
- **Fase 2** (barrido de fuentes por módulo): en curso desde la sesión local (2026-10-06), en modo A. Doce módulos registrados (M00, M01, M03, M05, M06, M07, M08, M09, M10, M11, M13, M16), M15 fusionado pendiente de registro, M14 y M12 buscados a medias, M04 y M02 por hacer. Bibliografía anotada en `02-fuentes/por-modulo/`, registro de fuentes con 2.246 filas y cobertura afirmación-fuente en `03-afirmaciones/cobertura.csv` (9.175 pares; 224 de 263 afirmaciones con fuente). Detalle, incidencias y siguiente paso en `00-plan/decisiones.md`.
- Fases 3 a 8: pendientes. Ver `00-plan/plan.md`.

## Continuar en otra sesión

Cualquier sesión de Claude Code (local o en la nube) carga `CLAUDE.md` al arrancar y encuentra ahí el orden de lectura, el estado y las reglas. Pasos para una máquina local y mensaje inicial sugerido: `00-plan/plan.md`, sección 15.

## Método en una frase

Toda afirmación lleva fuente, letra de confianza y, si está disputada, todas las versiones serias con quién las sostiene; nada se cita de memoria y los términos cargados se declaran en el glosario.
