# Cierre de la Fase 2: dictamen del crítico

Fecha: 2026-10-07. Material examinado con Python y grep: `registro.csv` (3.160 filas), `cobertura.csv` (11.616 pares), consolidación, muestra, adenda, `glosario.md` y `limites.md`. Búsquedas web usadas: 2.

## 1. Veredicto: cerrar con condiciones

El barrido cumple su objetivo: las 263 afirmaciones tienen al menos una fuente leída (descargada y leída, o parcial), 236 tienen una primaria leída y solo una (A-259) depende únicamente de divulgación. Pero la muestra de control muestra que un par de cobertura indica que la fuente trata el tema, no que respalde la afirmación. De 30 pares, 29 citas son literales, pero solo 3 respaldan el enunciado completo y 3 no tienen relación con la afirmación. Además quedan fichas que agrupan varias obras, los pares inválidos de la muestra siguen sin corregir y `limites.md` no recoge el reintento. Nada de esto obliga a repetir el barrido. Sí obliga a hacer una pasada corta antes de abrir la Fase 3 (condiciones C1 a C6 de la salida estructurada).

## 2. Cobertura por módulo y tradición

Afirmaciones con al menos una fuente leída de cada tradición (DO = dominicana u oficial-rd; HT = haitiana u oficial-haiti; INT = internacional; CI = tradición o tipo científico).

| Módulo | Afirm. | DO | HT | INT | CI | Primaria leída | Solo divulgación | Fuentes en el registro (% divulgación) |
|---|---|---|---|---|---|---|---|---|
| M00 | 20 | 20 | 20 | 20 | 10 | 20 | 0 | 297 (9) |
| M01 | 9 | 7 | 8 | 9 | 9 | 7 | 0 | 252 (19) |
| M02 | 11 | 11 | 11 | 11 | 8 | 9 | 0 | 268 (19) |
| M03 | 9 | 9 | 9 | 9 | 7 | 9 | 0 | 190 (13) |
| M04 | 4 | 4 | 4 | 4 | 0 | 4 | 0 | 160 (14) |
| M05 | 13 | 13 | 13 | 13 | 9 | 13 | 0 | 279 (12) |
| M06 | 19 | 19 | 19 | 19 | 4 | 19 | 0 | 290 (14) |
| M07 | 8 | 8 | 8 | 8 | 0 | 8 | 0 | 193 (10) |
| M08 | 22 | 22 | 22 | 22 | 3 | 22 | 0 | 430 (22) |
| M09 | 20 | 20 | 20 | 20 | 4 | 20 | 0 | 367 (17) |
| M10 | 10 | 10 | 10 | 10 | 0 | 10 | 0 | 153 (10) |
| M11 | 11 | 11 | 11 | 10 | 2 | 10 | 0 | 183 (10) |
| M12 | 7 | 7 | 7 | 7 | 0 | 7 | 0 | 269 (12) |
| M13 | 30 | 30 | 30 | 29 | 6 | 30 | 0 | 427 (14) |
| M14 | 8 | 8 | 8 | 8 | 7 | 8 | 0 | 272 (9) |
| M15 | 9 | 9 | 9 | 9 | 7 | 9 | 0 | 457 (17) |
| M16 | 53 | 49 | 44 | 39 | 25 | 31 | 1 | 701 (39) |
| **Total** | **263** | **257** | **253** | **247** | **101** | **236** | **1** | — |

Peor cubiertas (sin primaria leída y con dos tradiciones o menos): A-234 (solo científica), A-239, A-025, A-227, A-260, A-237, A-256, A-232 (una tradición más la científica); A-244, A-259, A-230, A-258, A-238, A-026, A-229, A-241, A-231, A-240, A-236, A-235, A-233 (dos); A-148 y A-184 (sin internacional). Son casi todas genéticas (M16), donde el artículo científico es la evidencia primaria y la columna «primaria» las castiga en exceso.

Calidad por tradición: el 29 % de los pares leídos de fuente dominicana son de divulgación, frente al 16 % de los haitianos y el 7 % de los internacionales. Hay 20 afirmaciones cuya voz dominicana es solo prensa, frente a 8 de la haitiana.

## 3. Calidad

**Muestra independiente (30 pares):** 29 citas literales y 1 con la ubicación errónea por pocas líneas (Charlevoix, F-0019). Respecto de la afirmación, 3 pares la respaldan entera, 24 la respaldan en parte, la matizan o sirven de contraste, y 3 son inválidos: A-045/F-2086, A-160/F-2835 y A-210/F-2619. El de A-210 viene de un id provisional de M15 que el registro reutilizó al renumerar. Los tres siguen en `cobertura.csv` como «descargada-y-leida».

**Mis tres comprobaciones** (descarga nueva, semilla 20261008):

| Par | Resultado |
|---|---|
| A-104 / F-1505 (Pièces officielles, 1824) | Literal en el djvu.txt, l. 3524-3526 (OCR con ruido). Respaldo indirecto: muestra que Francia excluyó el este, no que se le cobrara. |
| A-133 / F-1439 (Balcácer, HGPD III, p. 302) | Literal: «no impor-|ta el sacrificio» va en un tramo con la fuente cifrada, que descifré con un desplazamiento de 3 letras. Respalda la afirmación. Es una cita de segunda mano de *Le Progrès* (1844). |
| A-047 / F-2049 (elDinero, 2022) | Literal. Respaldo débil: habla de «genocidio» y decadencia, no de la partición. Es divulgación de fiabilidad baja. |

Conclusión: la transcripción es fiable y la asignación de pares no lo es. La Fase 3 no puede contar pares como apoyo.

## 4. Duplicados y accesos

- **Duplicados:** de 115 grupos candidatos, 110 se resolvieron como obras distintas, 3 como misma obra y 2 como mixtos. Hay 5 filas marcadas «DUPLICADO DE» y sus pares se movieron a la fila canónica. Revisé los 5 veredictos de misma obra y 5 de obras distintas (grupos 65, 84, 101, 7 y 32): todos son correctos. Queda pendiente:
  - F-0097 conserva un título que no es el de la obra leída.
  - F-0119 sigue cargando extractos de *Terreurs de frontière* (F-0137) y oculta la laguna de A-217.
  - Siguen sin desglosar las fichas que agrupan varias obras: F-0065 (55 afirmaciones; es la primaria más citada), F-0109 (Price-Mars 1928 y 1953, 145 pares), F-0069 y F-0075.
  - El editor solo abrió una URL en el lote 1: las decisiones por datos del registro no se verificaron.
- **Accesos:** se reintentaron 151 fuentes. Resultado: 27 leídas, 34 parciales, 80 localizadas sin texto, 9 no localizadas y 1 inexistente o errónea; los pares con fallo de fetch bajan de 148 a 14. Mejoraron 61 de 151 (40 %). `limites.md` es anterior al reintento: sigue listando como inaccesibles fuentes que ahora sí se leyeron.
- **limites.md frente a la sección 6** (muestra M04, M10, M14): M14 completo; faltan el poema de Oswald Durand (M10) y los vols. I y III de *Relaciones históricas* (M04).

## 5. Glosario

Revisé las 136 filas. Hay 42 columnas «—» (11 dominicanas y 31 haitianas). En 29 de ellas la justificación es «las propuestas no traen», que describe el proceso y no la tradición. Filas que corregir:

| Fila | Problema | Corrección |
|---|---|---|
| 7, doctrina 1805-1846 | Pone «L'île une et indivisible» entre comillas como si fuera texto constitucional. Las constituciones dicen «L'Empire / La République d'Haïti est un(e) et indivisible» (1805, art. 15; 1816, art. 41; 1846, art. 4) y reclaman la isla en otro artículo (1805, art. 18; 1816, art. 40). Además, la de 1946 (art. 1) no «repite la fórmula» insular. | Citar los dos artículos por separado; borrar «repite la fórmula»; «abandonada» se sostiene para la reivindicación insular. |
| 100, TC/0168/13 | El término «Pérdida de la nacionalidad» adopta el marco de la CIDH y de la tradición haitiana. | «Efectos de la sentencia TC/0168/13 sobre la nacionalidad de nacidos en RD de padres extranjeros sin residencia legal». |
| 115, bozal/ladino | No tiene nota y equipara «ladino» (africano hispanizado) con «créole» (nacido en la colonia). | Separar las categorías y escribir la nota. |
| 29, primacía de Santo Domingo | «Atenas del Nuevo Mundo» es un epíteto dominicano y está en la columna haitiana. | Moverlo a la columna dominicana y citar a Price-Mars como quien lo comenta. |
| 67, epítetos hostiles | La columna haitiana dice «—», pero el propio glosario recoge «faction dite dominicaine», «scissionnistes» e «insurgés». | Llenar la columna con esos términos y anotar que son parciales. |
| 96, rótulos oficiales | La columna haitiana dice «—». Haití tiene el décret-loi de 1935 contra las «pratiques superstitieuses» y la campaña antisupersticiosa de 1941-42. | Añadirlos [POR VERIFICAR con el texto]. |
| 21, Anacaona | La columna dominicana dice «—», pero existe el poema «Anacaona» de Salomé Ureña (1880). | Añadirlo [POR VERIFICAR]. |
| 17, Jaragua 1503 | «Ejecución» adopta el marco de Oviedo («justicia»). | «Muerte de los caciques de Jaragua y de Anacaona por orden de Ovando». |
| 48, partidarios de la unión | «dominicanos» aplicado a 1821-1844 choca con la fila 6. | «Habitantes del este partidarios…». |
| 127 y 132 | Las notas afirman como hecho tesis que están en disputa (comunidad bicultural antes de 1937, A-178; «peso sobre el este», A-104). | Atribuir cada tesis a su autor. |
| 35, 39, 5 | Términos o afirmaciones sin fuente: «Unification de 1801», «secuestro de niños», «partie de l'Est» como uso actual. | Poner el autor o [POR VERIFICAR]. |
| 44, 53, 62, 74 | Términos que se inclinan hacia un lado: «Victoria de Sánchez Ramírez», «Levantamiento», «retuvo», «Robo». | Usar el descriptivo: guerra de 1808-1809, conspiración, bajo control haitiano, circulación ilícita de ganado. |
| — (filas nuevas) | Faltan dos filas por simetría: el antidominicanismo (Cassá 2022) y el léxico haitiano de color (grimaud, marabou…). | Añadirlas en la Fase 3. |

**Dudas del editor:**

| Duda | Recomendación |
|---|---|
| 1 | Aceptar; verificar con grep. |
| 2 | Resuelta por mi cotejo (ver fila 7). |
| 3 | Cambiar el término a «haitianos y personas de ascendencia haitiana nacidas en RD», que da el lugar de nacimiento sin presuponer la nacionalidad. |
| 4 | Aprobar el cambio en «batey»: la etimología queda en disputa (A-019). |
| 5 | Una traducción no es un nombre propio de la tradición. Rotular «(traducción)». |
| 6 | De acuerdo. Hacer una búsqueda dirigida con la lente haitiana en la Fase 3; las filas 67 y 96 ya muestran que hay huecos falsos. |
| 7 | Sí a un bloque «Etiquetas de la crítica académica»: los redactores las usarán. |
| 8 | Anotar las fusiones en `glosario-descartados.csv` con la columna «fusionado en». |
| 9 | «Devolución» presupone que la persona vuelve a su país de origen. Proponer «Salidas forzadas de personas hacia Haití ejecutadas por autoridades dominicanas». |
| 10 | Mantener las dos versiones y resolverlas con primarias (F-0035, F-0746). |
| 11 | Pasar los [POR VERIFICAR] a la lista de lectura. Cotejar las constituciones dominicanas de 1875, 1896 y 1927 en la Colección de Leyes. |
| 12 y 13 | Sin cambios. |

## 6. Asimetrías que siguen

Quedan 10 afirmaciones sin fuente haitiana leída (A-025 y 9 del grupo genético de M16) y 6 sin fuente dominicana (A-025, A-026, A-234, A-239, A-240, A-241). Los 16 casos sin fuente internacional son en su mayoría un efecto de clasificar los artículos genéticos como «científica». La adenda tapó huecos sobre todo con prensa: de 20 filas nuevas, 14 son de divulgación (Listín, Acento, Le Nouvelliste). Es simetría de etiqueta, no de calidad.

En la Fase 3: (a) leer las fuentes científicas como evidencia primaria y no exigirles tradición nacional; (b) para A-240 y A-241, buscar genética hecha en Haití o con autores haitianos (Simms 2010 y 2012) y documentar la ausencia como hallazgo; (c) sustituir la divulgación por fuentes académicas en las 20 afirmaciones cuya voz dominicana es solo prensa y en las 8 de la haitiana; (d) poner los dos memoriales del arbitraje de 1896 a la par (F-1055 haitiano, F-1056 dominicano, este último solo parcial).

## 7. Riesgos para la Fase 3 y priorización

Riesgos:
- **Volumen:** M16 (701 fuentes), M15 (457), M08 (430) y M13 (427) no se pueden leer a fondo.
- **Divulgación:** 2.028 de 11.165 pares leídos.
- **Textos largos:** solo 23 están en `textos/`. Madiou (F-0106, 92 pares), García (F-0068, 69), Ardouin (F-0107, 64), Price-Mars (F-0109, 145), Oviedo, Charlevoix, Moreau y Sánchez Valverde se leyeron en línea, sin una copia local que permita citar por número de línea.
- **FRUS:** el de 1937 (F-0049) está descargado y solo se usa en 3 pares.
- **Cobertura y apoyo:** un par de cobertura no equivale a respaldo.

Propuesta: 58 documentos primarios, a leer en este orden de bloques.

| Bloque | Documentos (F-####) | Por qué |
|---|---|---|
| Nombres, contacto y conquista | F-0006 (Las Casas, local), F-0009 (Oviedo), F-0010 y F-1589 (Pedro Mártir, trad. y princeps), F-0001, F-0002 (Hernando Colón con Pané), F-0011 (Repartimiento de 1514), F-2131 (Zuazo), F-0012 (Enriquillo), F-0013 (Gorrevod) | A-001 a A-045; cifras de 1508 y 1514; Quisqueya y Haití |
| Colonias | F-0014 (Osorio y censo de 1606), F-0016 (Ryswick), F-0024 (Aranjuez), F-0019 (Charlevoix), F-0020 (Sánchez Valverde), F-0021 y F-0022 (Moreau), F-1628 (Catani), F-0023 (censo de 1789), F-0025 (Basilea) | Partición, demografía y frontera |
| Revolución, 1805 y 1821-1822 | F-0027, F-0028, F-0029, F-0032 (constituciones y Acta de 1804), F-0026 (Ferrand), F-0030 y F-1848 (Dessalines), F-0066 (Arredondo), F-0034 (Declaratoria de 1821), F-2218, F-2219 y F-2222 (Boyer y Núñez de Cáceres) | Moca y Santiago; los «llamamientos» |
| 1822-1844 | F-0035 y F-0746 (Código Rural), F-1505 (1824), F-1060 (Levasseur), F-0792 (1843), F-0037 (Const. 1843), F-0038 (Manifiesto), F-0039 (Acta de Separación), F-0040 (Const. 1844) | Disputa central de M08 y M09 |
| 1844-1915 | F-0979 (Colección de Leyes), F-1055 y F-1056 (memoriales de 1896), F-0051 (Tratado de 1874), F-1004 y F-1054 (Gándara), F-0041 (Const. 1846) | Reconocimiento y frontera |
| 1915-1961 | F-0055 (1929/1936), F-0049 y F-0050 (FRUS 1937 y 1938, locales), F-0057 (acuerdo de 1938), F-0100 (Cuello), F-0331 (Memoria de 1937), F-0350 (*Le Nouvelliste* 1937-38), F-1299 (Vincent) | Cifras de 1937 y pagos de 750.000 y 525.000 USD, con las dos voces oficiales |
| 1961-2026 | F-2247 (braceros), F-2480 (Decreto 233-91), F-0063 (Const. de Haití 1987), F-0524 (Yean y Bosico), F-0061 (TC/0168/13), F-0062 (Ley 169-14), F-0523 (Corte IDH 2014), F-0059 y F-0060 (ENI) | Nacionalidad y deportaciones |
| Evidencia científica | F-0220 (Fernandes 2021) | Base de las cifras de M01 y M16 |

Antes de leer, descargar cada texto a `02-fuentes/textos/`. En cada par leído, marcar si la fuente respalda, matiza, contradice o solo da contexto.

## 8. Decisiones que debe tomar Bran

1. Aprobar el cierre con condiciones y la pasada correctiva (unos 3 o 4 agentes en Sonnet), con brief según el protocolo.
2. Añadir a `cobertura.csv` la columna «relación» ahora o en la Fase 3.
3. Política de fichas: una por obra con el tomo como localizador, o una por tomo (grupos 37, 63 y 75), y desglose de las fichas que agrupan varias obras.
4. Visto bueno a los cambios de término cargado (filas 7, 17, 100 y 115; dudas 3 y 9).
5. Aprobar o reequilibrar la lista de 58 primarias y elegir modelos para la Fase 3.
6. Si la divulgación cuenta como cobertura de tradición o hace falta una fuente académica.
7. Tarea manual: préstamo en archive.org de *La isla al revés* (F-0070).
