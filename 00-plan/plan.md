# Plan: Reconstrucción histórica imparcial de la isla de La Española

## 1. Contexto

La isla (Ayiti / Quisqueya / La Española / Hispaniola / Santo Domingo / Saint-Domingue / Haití) tiene hoy dos Estados y dos relatos nacionales que se contradicen en puntos centrales: quién desciende de quién, cómo se llamó la isla, qué pasó en 1697, 1805, 1822-1844, 1844, 1937 y 2013. Cada relato fue construido por Estados, élites e intelectuales con intereses concretos. El objetivo es reconstruir, con método explícito y fuentes trazables, lo que se puede afirmar con confianza, lo que está genuinamente disputado y lo que es inverificable, sin adoptar el marco de ninguno de los dos lados.

Dos afirmaciones identitarias se someten a prueba contra la evidencia:
- **Tesis haitiana**: la isla es una e indivisible; el pueblo haitiano desciende de los taínos y de los africanos esclavizados de toda la isla.
- **Tesis dominicana**: el pueblo dominicano es criollo, descendiente de taínos y españoles, con una cultura que combina ambas herencias.

Resultado esperado: un corpus en el repositorio (Markdown, versionado en la rama `claude/hispaniola-historical-research-plan-79fana`) con registro de fuentes, registro de afirmaciones con nivel de confianza, reconstrucción período por período, capítulos transversales, mapa de disputas con veredicto, síntesis final, cronología, glosario y bibliografía. El repositorio está vacío (sin commits ni ramas remotas): todo se crea desde cero.

## 2. Qué encontró el reconocimiento previo (3 agentes, ~450k tokens)

Ya se hizo un reconocimiento de solo lectura. Sus tres informes completos (fuentes, historiografía, evidencia científica) se guardarán en `00-plan/reconocimiento/` en la Fase 0 para no perder ese trabajo. Lo esencial:

**Restricción de infraestructura (condiciona todo el plan).** La política de red de este entorno bloquea prácticamente todo el tráfico saliente: archive.org, gallica.bnf.fr, wikisource, wikipedia, history.state.gov, slavevoyages.org, PMC, Nature, JSTOR, HathiTrust, Cervantes Virtual, dLOC, PARES, la Academia Dominicana de la Historia, el Senado y el MIREX dominicanos, la prensa dominicana y haitiana, Google Scholar, Semantic Scholar y Crossref devuelven denegación de política (403 al CONNECT; más de 70 dominios probados). Solo pasan GitHub (github.com y raw.githubusercontent.com) y los registros de paquetes. En consecuencia:
- **WebSearch funciona** (devuelve títulos, URLs y fragmentos), con un tope de unos 200 búsquedas **por agente** (verificado: un agente nuevo busca sin problema después de que otros agotaran el suyo).
- **WebFetch y curl no funcionan** fuera de GitHub: no se puede leer una página, un PDF ni un texto completo de los archivos digitales.
- **Firecrawl** (que correría fuera del proxy) responde "402: cuenta sin créditos".
- Hugging Face (fuera del proxy) tiene volcados de Wikisource y de la BDH, pero en parquet binario, inutilizable sin descarga local.
- **Lo que sí se puede leer hoy, verificado con descarga y grep**: el espejo GITenberg de Project Gutenberg (Las Casas, *Historia de las Indias*, 5 tomos en español, ~1 MB cada uno, incluido Enriquillo; Pedro Mártir, *De Orbe Novo* vol. 1 en inglés, con el pasaje de "Quizqueia... afterwards Haiti" en la Década III, lib. VII; *Brevísima* en traducción inglesa de 1689; Franklin 1828 sobre el Código Rural; Spenser St John 1884; Schoenrich 1918; Elliott sobre Toussaint; Sansay 1808), el repositorio HistoryAtState/frus con toda la correspondencia diplomática de EE.UU. en XML (volúmenes 1861-1864 sobre la anexión, 1929 sobre la disputa fronteriza, 1937 y 1938 vol. V con el expediente 738.39 de la masacre y la mediación de EE.UU., Cuba y México, incluido el telegrama de Trujillo a Roosevelt del 15 nov 1937), y una transcripción universitaria del Acta de Independencia de Haití de 1804.

**Mapa historiográfico.** Se identificaron y, en su mayoría, se verificaron por búsqueda unas 90 obras en tres tradiciones (dominicana, haitiana, internacional), 13 debates vivos con sus posiciones, los artículos territoriales de las constituciones haitianas de 1805, 1806, 1816, 1846 y 1987, el Tratado de 1874, estudios de manuales escolares de ambos países y los trabajos de 2015-2026. Hay bastante material en acceso abierto en portales dominicanos (Academia Dominicana de la Historia, revista Estudios Sociales del Centro Bonó, Ecos de la UASD, AGN) y en repositorios universitarios (Deep Blue, OAPEN, Leiden, Reich Lab, Georgetown PDBA, Columbia).

**Evidencia científica (cifras preliminares, aún por verificar en texto completo).** Genética dominicana: autosómico ~40-50% africano, ~39-52% europeo, ~4-8% nativo americano; mtDNA 12-23% nativo; cromosoma Y 1-3% nativo. Genética haitiana: ~85-96% africano, Y ~20% europeo, componente nativo indetectable o mínimo; no existe ningún estudio genómico grande hecho dentro de Haití. ADN antiguo (Fernandes et al. 2021, 174 individuos de RD, Haití, PR y otros): población precontacto de La Española y Puerto Rico juntas estimada en decenas de miles, no millones, y ascendencia cerámica detectada en dominicanos actuales. Población taína en 1492: rango de 60.000 (Verlinden) a 8 millones (Cook y Borah), con Livi-Bacci en 200-300 mil y Moya Pons en ~378 mil. Muertos en 1937: de 4.000-6.000 (Vega) a más de 20.000 (Cadeau, García Peña), con la mayoría académica en 12.000-20.000.

## 3. Prerrequisito: decidir el modo de acceso a fuentes

| Opción | Qué implica | Qué permite |
|---|---|---|
| **A. Abrir la red del entorno (recomendada)** | Cambiar "Network access" del entorno a un nivel amplio, o a "Custom" añadiendo los dominios de la lista de abajo y manteniendo la lista por defecto de gestores de paquetes. Se hace desde el menú del entorno en la barra de título de la sesión, opción Edit. Pasos: https://code.claude.com/docs/en/cloud-environments#network-access | Lectura de textos completos (crónicas, tratados, constituciones, papers), verificación literal de cada cita, descarga de PDFs. El plan completo. |
| **B. Recargar créditos de Firecrawl** | Firecrawl corre en sus propios servidores y evita el proxy. Permite scrape de páginas y PDFs y búsqueda de papers. Coste por página. | Casi lo mismo que A, con coste por uso y sin descarga directa de PDFs grandes. |
| **C. Seguir con WebSearch + espejos de GitHub** | Sin cambios. | Fragmentos de buscador para todo, más texto completo solo de lo que esté en GitHub (Las Casas, Pedro Mártir, FRUS, Acta de 1804 y una docena de obras de época en inglés). No hay acceso a Oviedo, Pané, Moreau, Charlevoix, Sánchez Valverde, Madiou, Ardouin, los tratados, las constituciones haitianas, el Manifiesto de 1844, Clío, los papers de genética ni la prensa. La confianza máxima alcanzable fuera de GitHub es B. Resultado útil pero claramente más débil. |

Dominios mínimos a permitir si se elige Custom: archive.org, gallica.bnf.fr, es.wikisource.org, fr.wikisource.org, en.wikisource.org, es.wikipedia.org, en.wikipedia.org, fr.wikipedia.org, babel.hathitrust.org, www.cervantesvirtual.com, bdh.bne.es, pares.mcu.es, dloc.com, ufdc.ufl.edu, history.state.gov, www.slavevoyages.org, www.gutenberg.org, pmc.ncbi.nlm.nih.gov, www.nature.com, www.science.org, journals.plos.org, academic.oup.com, muse.jhu.edu, read.dukeupress.edu, www.cambridge.org, link.springer.com, www.redalyc.org, www.scielo.org, dialnet.unirioja.es, www.persee.fr, www.erudit.org, hal.science, core.ac.uk, api.crossref.org, api.semanticscholar.org, scholar.google.com, books.google.com, academiadominicanahistoria.org.do (y subdominios catalogo., clio., hgpdvol6.), estudiossociales.bono.edu.do, revistas.uasd.edu.do, agn.gob.do, memoriahistorica.senadord.gob.do, mirex.gob.do, bibliotecadelcongreso.gob.do, tc.gob.do, acento.com.do, diariolibre.com, eldia.com.do, elcaribe.com.do, lenouvelliste.com, haitilibre.com, mjp.univ-perp.fr, pdba.georgetown.edu, deepblue.lib.umich.edu, library.oapen.org, reich.hms.harvard.edu, scholarlypublications.universiteitleiden.nl, islandluminous.fiu.edu, haitidoi.com, axl.cefan.ulaval.ca, www.manioc.org, bibliotheques-numeriques.defense.gouv.fr, anom.archivesnationales.culture.gouv.fr, jcb.lunaimaging.com, corteidh.or.cr, one.gob.do, dominicanrepublic.unfpa.org, researchgate.net, academia.edu, huggingface.co.

El plan de abajo está escrito para el modo A o B. Donde el modo C cambia algo, se indica con **[Modo C]**.

## 4. Decisiones abiertas (supuestos; cámbialos al revisar)

| # | Decisión | Supuesto adoptado |
|---|---|---|
| 1 | Idioma del corpus | Español. Citas en idioma original (es/fr/en/kreyòl) con traducción al lado. |
| 2 | Alcance temporal | Del poblamiento precolombino (c. 5000 a.C.) a 2026; el período contemporáneo se limita a hechos documentados. |
| 3 | Formato de entrega | Markdown en el repo, commit y push al cierre de cada fase; al final, un Artifact HTML navegable con síntesis, cronología y mapa de disputas. |
| 4 | Ritmo | Pausa al terminar cada fase para que revises (cada fase termina con push). Si prefieres, se corre de un tirón. |
| 5 | Profundidad | Exhaustiva: cientos de agentes, varias rondas de búsqueda y verificación adversarial de cada afirmación clave. |
| 6 | Fuentes de pago | No se compra nada salvo lo que decidas en la sección 3. Lo que esté tras muro de pago se usa vía resúmenes, reseñas o repositorios abiertos y se marca "vía reseña". |

## 5. Principios metodológicos (reglas para todo agente)

1. **Jerarquía de fuentes**: primarias (crónicas, tratados, constituciones, decretos, censos, correspondencia diplomática, prensa de época, testimonios) > secundarias académicas con aparato crítico > divulgación > terciarias (Wikipedia, blogs, redes), que sirven solo como índice.
2. **Ficha de proveniencia** por fuente: quién, cuándo, desde dónde, para quién, con qué interés, qué sabía de primera mano, qué tradición la usa.
3. **Triangulación**: nada disputado se califica como establecido sin al menos dos fuentes independientes de tradiciones distintas, o una primaria más una secundaria independiente.
4. **Simetría**: cada relato nacional se formula primero en su versión más fuerte y mejor documentada. Mismo rigor para ambos.
5. **Escala de confianza**: **A** establecido (primarias independientes concuerdan), **B** probable, **C** disputado (fuentes serias en desacuerdo; se presentan todas), **D** inverificable o leyenda. Cada letra con justificación. **[Modo C]** tope en B.
6. **Hecho / interpretación / significado** se separan siempre. "Boyer abolió la esclavitud en el este en 1822" es hecho; "fue liberación" o "fue dominación" es interpretación.
7. **Lenguaje neutro y glosario**: "ocupación" vs "unificación", "masacre" vs "El Corte" vs "Kout kouto", "indio", "dominación", "invasión", "reconquista", "separación" vs "independencia", "degüello". Se usa el término descriptivo y se anota cómo lo nombra cada lado.
8. **Silencios**: se buscan las voces ausentes de los relatos estatales (taínos, esclavizados, cimarrones, mujeres, rayanos, campesinos, migrantes, Iglesia, comerciantes extranjeros).
9. **Cifras siempre como rangos** con autor y base de cada estimación.
10. **Verificación adversarial** de cada afirmación clave desde lentes distintas antes de aceptarla.
11. **Trazabilidad total**: cada frase de la síntesis enlaza a un id de fuente y, cuando se pueda, a la cita textual con página o URL. Nada de memoria: lo no confirmado se marca [POR VERIFICAR] y no entra en la síntesis.
12. **Transparencia de límites**: se documenta lo que no se pudo consultar y por qué.
13. **Presupuesto de búsqueda**: cada agente tiene ~200 búsquedas; se diseñan tareas estrechas (≤120 búsquedas) y se prefieren más agentes a agentes grandes.

## 6. Preguntas rectoras

- **P1** ¿Quiénes vivían en la isla antes de 1492, cuántos eran y qué les pasó (extinción vs supervivencia biológica y cultural)?
- **P2** ¿Cómo y cuándo se dividió la isla, y cuál era la realidad jurídica y demográfica de cada lado en cada momento?
- **P3** ¿Cuál es la ascendencia real (genética, cultural, lingüística, religiosa) de dominicanos y haitianos hoy?
- **P4** ¿Qué pasó en los episodios en disputa: 1697, 1795-1809, 1801, 1805, 1822-1844, 1844, 1861-1865, 1937, 2013?
- **P5** ¿Cómo, cuándo, por quién y para qué se construyó cada relato nacional?
- **P6** ¿Qué historia compartida (solidaridades, mezclas, vida fronteriza) silencian ambos relatos?

## 7. Periodización: 17 módulos

| Módulo | Período | Preguntas guía y disputas centrales |
|---|---|---|
| M00 | Marco | Geografía; nombres de la isla y origen documental de cada uno ("Ayiti/Haití" en Hernando Colón, Oviedo y Las Casas; "Quisqueya" solo en Pedro Mártir; "Bohío"); usos políticos posteriores (Odette Roy Fombrun, "Haití Español" de 1821). |
| M01 | c. 5000 a.C.–1492 | Oleadas de poblamiento (arcaicos, saladoides, ostionoides, chicoides), cacicazgos (Marién, Maguá, Maguana, Jaragua, Higüey), tamaño de población, sociedad, religión (cemíes), arqueología y ADN antiguo (Nägele 2020, Fernandes 2021, Sirak 2026 en Samaná). Debate sobre la etiqueta "taíno" (Rafinesque 1836; Curet 2014; Keegan y Hofman). |
| M02 | 1492–1520s | Contacto, La Navidad, La Isabela, encomienda, Caonabo, Anacaona y Jaragua (1503), Leyes de Burgos, repartimientos de 1508 (60.000) y 1514 (~26.000), colapso demográfico (choque de conquista vs viruela de 1518; Livi-Bacci), esclavitud indígena (Stone: >250.000 sacados del Caribe), primeros africanos (1502-1503 ladinos; asiento de 1518). |
| M03 | 1519–1606 | Enriquillo (rebelión taína con participación africana; pueblo de Boyá), primera rebelión de esclavos (1521), cimarronaje (Lemba), azúcar e ingenios, declive, Devastaciones de Osorio (1605-1606) y censo de 1606 (9.648 esclavos, 1.117 vecinos). |
| M04 | 1606–1697 | Bucaneros, Tortuga, asentamiento francés, contrabando (Ponce Vázquez), lo que Ryswick (1697) dice y no dice: el texto no menciona la isla. |
| M05 | 1697–1789 | Dos colonias divergentes: Saint-Domingue (~465.000-500.000 esclavizados, ~31.000 blancos, ~28.000 libres de color en 1789) vs Santo Domingo (~100.000-125.000 habitantes; ~65.000 libres de color, ~25.000 blancos, ≤15.000 esclavos según Moreau). Aranjuez (1777): primera frontera formal. Charlevoix, Sánchez Valverde, Moreau. Economía de frontera y hato ganadero. |
| M06 | 1789–1809 | Revolución haitiana, Basilea (1795), Toussaint toma Santo Domingo (1801) y su constitución, Leclerc, independencia (1804), decreto de Ferrand (6 ene 1805), campaña de Dessalines (sitio de Santo Domingo, retirada, Moca y Santiago: cifras y crítica de fuentes de Utrera y Marte), Palo Hincado (1808), "Reconquista" (1809) y restauración de la esclavitud en el este (Nessler). |
| M07 | 1809–1822 | "España Boba", decadencia, Núñez de Cáceres y el "Estado Independiente de Haití Español" (1 dic 1821), petición a la Gran Colombia, pueblos que izaron la bandera haitiana desde el 15 nov 1821 (Dajabón, Montecristi y otros), entrada de Boyer (9 feb 1822) con ~10.000 soldados. |
| M08 | 1822–1844 | Unificación / ocupación: abolición (>10.000 liberados; Lora: libertos siguen con sus amos bajo contrato), Código Rural (1826), tierras y bienes de la Iglesia, universidad (1823, disputado), indemnización a Francia (1825) y su peso en el este, reclutamiento, lengua, inmigración afroamericana (Samaná 1824), dominicanos en la administración haitiana (Báez diputado constituyente en 1843), La Trinitaria (1838), Reforma de 1843, 27 feb 1844. Obras: Moya Pons 1972, Batista Lemaire 2025 vs Eller, Yingling, Walker. |
| M09 | 1844–1861 | Manifiesto del 16 de enero (habla de "separación"), Santana vs Duarte, guerras (Azua, Santiago, Beler, Las Carreras, Sabana Larga 1856), Soulouque, protectorados, raza y ciudadanía en la Constitución de 1844, postura real de Duarte sobre los haitianos ("no es posible una fusión" vs "admiro al pueblo haitiano"; verso de los "blancos, morenos, cobrizos, cruzados"). |
| M10 | 1861–1865 | Anexión a España, ultimátum de Rubalcaba a Haití (1861), Guerra de Restauración, apoyo de Geffrard (armas, refugio), propuesta de tratado de unidad de 1864, mediación de 1865, retirada española. |
| M11 | 1865–1915 | Caudillos, Báez, Lilís; Haití bajo Salnave y Salomon; Tratado de 1874 (primer reconocimiento haitiano; arts. 3 y 4); disputas de límites; la frontera como refugio (Baud); industria azucarera y migración laboral; Firmin (1885) frente al racismo científico; Hostos, Bonó, Lugo ("constitucionalmente blancos"). |
| M12 | 1915–1934 | Ocupaciones de EE.UU. (Haití 1915-1934, RD 1916-1924), braceros en los ingenios, Tratado de 1929, cacos y gavilleros, inicio de la represión racializada en la frontera (Cadeau: 1919), indigenismo haitiano (Price-Mars 1928). |
| M13 | 1930–1961 | Trujillo: discurso inicialmente prohaitiano (Turits), "dominicanización de la frontera", Protocolo de 1936, masacre de octubre de 1937 (cifras por autor; motivaciones; acuerdo de 1938: 750.000 USD pactados, 525.000 pagados), ideología de Estado (Peña Batlle, Balaguer 1947), contratos de braceros (1952, 1959), relaciones con Vincent, Lescot, Estimé, Magloire y Duvalier. |
| M14 | 1961–1986 | Balaguer y Duvalier: bateyes y Consejo Estatal del Azúcar, contratos de mano de obra, "La isla al revés" (1983), diáspora haitiana, caída de Jean-Claude Duvalier. |
| M15 | 1986–2010 | Aristide, golpe de 1991, deportaciones masivas (1991, 1999), campañas contra Peña Gómez (1994, 1996), Ley 285-04, informes sobre bateyes, Yean y Bosico (CIDH 2005), terremoto de 2010 y ayuda dominicana. |
| M16 | 2010–2026 | Constitución de 2010, TC/0168/13 (23 sep 2013; >200.000 afectados; votos disidentes), Ley 169-14 (grupos A y B), sentencia CIDH 2014 y retiro dominicano, ENI-2012 y ENI-2017 (458 mil y 498 mil nacidos en Haití; 751 mil de origen haitiano), deportaciones 2015-2026, muro, canal del Masacre/Dajabón (2023), crisis haitiana 2024-2026, bicentenario de 1822 y relatos en medios y redes. |

## 8. Ejes transversales: 7 capítulos

| Eje | Contenido | Veredicto que debe producir |
|---|---|---|
| E1 Identidad y ascendencia | Genética (ADN antiguo + poblaciones modernas: autosómico, mtDNA, Y; sesgo sexual de la mezcla; origen mesoamericano de parte del A2 dominicano y la hipótesis de indígenas esclavizados no locales), demografía histórica, lengua (taínismos en español dominicano y en kreyòl: kasav, boukan, Ayiti), toponimia, religión (vodou y supuestos elementos taínos en el Petwo; catolicismo popular; 21 divisiones), cultura material. | Evaluación explícita de ambas tesis identitarias con confianza y rangos. |
| E2 La frontera | Ryswick, Aranjuez, 1874, 1895, 1929, 1936; rayanos; río Masacre; muro (Blancpain: >150 años para fijarla). | Cronología jurídica verificada contra los textos. |
| E3 Esclavitud y libertad | Plantación vs hato; cimarronaje; trata (Saint-Domingue ~690 mil desembarcados; Santo Domingo español por cuantificar); aboliciones (1793, 1801, 1804, 1809 restauración, 1822, 1844). | Comparación cuantificada de ambos lados. |
| E4 Nombres | Origen documental de cada nombre de la isla y gentilicio; usos políticos. | Qué nombre tiene qué respaldo. |
| E5 Historiografía | Cómo se construyó cada relato: hispanismo dominicano (García 1867 → Lugo → Peña Batlle y Balaguer → Núñez); noirismo y mulatrismo haitianos (Madiou vs Ardouin), indigenismo (Nau, Price-Mars), doctrina de la "isla indivisible" como seguridad anticolonial (Price-Mars, Théodat) y su abandono (1874; art. 8 de 1987); manuales escolares (González Canalda 2019: los textos haitianos no enseñan odio; Wigginton y Middleton 2019; Candio 2020); conmemoraciones (27 feb, 1 ene, bicentenario 2022, Border of Lights). | Genealogía fechada de cada afirmación identitaria. |
| E6 Economía y ecología | Plantación vs hato, indemnización de 1825, deforestación, divergencia económica; Diamond y sus críticos. | Qué explica la divergencia y qué no. |
| E7 Historia compartida | 1821-22 (pueblos prohaitianos), 1863-65, resistencia conjunta a EE.UU., frontera integrada pre-1937 (Derby y Turits), familias binacionales, intercambios culturales, 2010. | Inventario documentado de solidaridades. |

## 9. Registro inicial de disputas (semilla de la Fase 1)

| # | Disputa | Posiciones identificadas |
|---|---|---|
| 1 | Población taína 1492 y extinción | Altas (Las Casas 3M, Cook y Borah 8M) / medias-bajas (Moya Pons 378k, Livi-Bacci 200-300k, Rosenblat 100k, Verlinden 60k) / ADN antiguo (decenas de miles) / supervivencia (Guitar, Stone) / Henige: inútil dar cifras. |
| 2 | Quisqueya / Ayiti / Bohío | Ayiti atestiguado en varios cronistas; Quisqueya solo en Pedro Mártir (¿invención, ciguayo?). |
| 3 | Ryswick 1697 | "Cedió el oeste" (popular) / el texto no menciona la isla; reconocimiento tácito; cesión formal en Aranjuez 1777 y Basilea 1795. |
| 4 | Dessalines 1805, Moca y Santiago | Genocidio (Arredondo y Pichardo, Rodríguez Demorizi; ~500 y ~400 muertos) / escepticismo de fuentes (Utrera 1923, Marte) / contexto del decreto de Ferrand y la retirada (Nessler, Gonzalez). |
| 5 | 1822-1844 | "Dominación" (Moya Pons, Batista Lemaire) / "unificación" con apoyo local (Eller, Yingling, Walker) / matices (Lora). |
| 6 | 1844: separación o independencia; Duarte | Canon (García, Balcácer) / el Manifiesto dice "separación" / Duarte ambivalente. |
| 7 | Restauración y Haití | Ayuda decisiva de Geffrard / límites por el ultimátum de 1861 / propuesta de unidad de 1864. |
| 8 | Origen del antihaitianismo | Colonial o de 1844 (Sagás) / Trujillo y sus intelectuales (Torres-Saillant, Paulino) / 1919 con la ocupación de EE.UU. (Cadeau) / multicausal (Mayes, Baud, Vega). |
| 9 | 1937: cifras y motivos | 4-6k (Vega) / 12k+ (Castor, Price-Mars, Lescot 12.168) / 15-18k (Turits, Paulino, Moya Pons, Balaguer 17k) / 20k+ (Cadeau, García Peña). Motivos: frontera, blanqueamiento, exiliados, demostración de fuerza, genocidio fundador. |
| 10 | "Indio" y negritud | Negación de lo negro (Torres-Saillant, Ricourt) / estrategia de soberanía (Candelario) / cambio en curso (Simmons). |
| 11 | TC/0168/13 | "Regularización" (Estado) / desnacionalización retroactiva y apatridia (CIDH, Corte IDH, CEJIL, Denis). |
| 12 | "Isla indivisible" hoy | Tesis viva detrás de "todas las invasiones" (nacionalismo dominicano) / abandonada en 1874 y 1987 / doctrina de seguridad anticolonial (Price-Mars, Théodat). |
| 13 | Conexión taína en Haití | Indigenismo fundacional (nombre Hayti, Armée indigène, "J'ai vengé l'Amérique") / literario (Nau, Chauvet, Revue Indigène, Anacaona) / vodou Petwo (afirmado, debatido) / genética: componente nativo mínimo. |

La Fase 1 ampliará este registro a 80-150 afirmaciones contrastables.

## 10. Arquitectura de ejecución con agentes

Cada fase es uno o más Workflows (orquestación determinista de subagentes). Entre fases se leen los resultados, se ajusta, se hace commit y push. Todo agente recibe las reglas de la sección 5, la plantilla de salida y la instrucción de devolver datos estructurados (schema JSON) con URLs y citas textuales.

### Fase 0: Infraestructura (sin agentes de investigación)
- Estructura del repo (sección 11), plantillas de ficha de fuente y de afirmación, `01-metodologia/metodo.md`, `escala-de-confianza.md`, `glosario.md` inicial, `02-fuentes/registro.csv` con columnas fijas.
- Volcar los tres informes del reconocimiento en `00-plan/reconocimiento/` y sembrar `02-fuentes/registro.csv` con las ~90 obras y ~60 URLs ya identificadas. Los informes completos están en los transcritos de los agentes dentro del scratchpad de la sesión (`tasks/ab5b88a2b1f74ba25.output` fuentes, `tasks/adf9b3216c03e5bb3.output` historiografía, `tasks/a8bf3701965a21b34.output` evidencia científica); se extrae solo el mensaje final de cada uno con `jq`, nunca el transcrito entero.
- Comprobar el modo de acceso (A, B o C) con una prueba de fetch y registrarlo en `00-plan/decisiones.md`.
- Descargar a `02-fuentes/textos/` los textos de GitHub ya verificados (Las Casas 5 tomos, Pedro Mártir vol. 1, *Brevísima* 1689, Acta de 1804, capítulos relevantes de FRUS 1861-1938, obras de época en inglés) con su ficha de proveniencia inicial.
- Commit y push.

### Fase 1: Narrativas y registro de afirmaciones (Workflow 1, ~8 agentes)
- 3 narradores construyen la versión más fuerte de cada relato: dominicano oficial-escolar, haitiano oficial-escolar, académico internacional. Salida: `03-afirmaciones/narrativas/*.md`.
- 1 extractor convierte las narrativas en afirmaciones contrastables (id, enunciado, quién lo sostiene, módulo, qué evidencia lo resolvería), partiendo de la tabla de la sección 9.
- 3 críticos de completitud por lente comprueban que nada relevante quedó fuera.
- Salida: `03-afirmaciones/registro.md`.

### Fase 2: Barrido multimodal de fuentes por módulo (Workflow 2, ~120-200 agentes)
- Pipeline sobre los 17 módulos. Por módulo, 5 buscadores ciegos entre sí: (1) tradición dominicana, (2) tradición haitiana, (3) primarias coloniales españolas y francesas, (4) academia internacional, (5) evidencia científica y cuantitativa. Búsquedas en es/fr/en/kreyòl con `site:` en dominios .do, .ht, .fr, .es y en repositorios abiertos.
- Cada buscador devuelve bibliografía anotada: fuente, tipo, URL, extracto, afirmaciones que toca, fiabilidad. En modo A/B, confirma cada URL con un fetch. **[Modo C]** la URL se registra sin confirmar.
- Por módulo, 1 fusionador deduplica y 1 crítico pregunta qué falta; segunda ronda dirigida si hace falta; se detiene tras 2 rondas sin novedades.
- Salida: `02-fuentes/por-modulo/M##.md` y filas en `registro.csv`.

### Fase 3: Lectura profunda de fuentes primarias (Workflow 3, ~60-120 agentes)
- Pipeline sobre 40-60 documentos primarios accesibles (sección 12). Obras largas (Las Casas, Oviedo, Moreau, Madiou, Ardouin) se parten por tomo o capítulo.
- Cada agente descarga el texto, localiza los pasajes relevantes para el registro de afirmaciones y devuelve citas textuales con página, en idioma original y traducidas. Un agente por documento redacta la ficha de proveniencia.
- Salida: `02-fuentes/primarias/<id>.md`. Los textos de dominio público descargados (Gutenberg, FRUS) se guardan en `02-fuentes/textos/` para que cualquier cita sea cotejable por número de línea.
- Textos largos se procesan con descarga por curl y grep por línea, no con WebFetch (que trunca archivos grandes).
- **[Modo C]** solo se leen los textos alojados en GitHub (lista en 12.1). Para el resto se usa "triangulación de fragmentos": por cada afirmación, 3 agentes buscan citas del documento primario en fuentes secundarias distintas; un pasaje se acepta si aparece idéntico en ≥2 fuentes independientes y se marca "cita indirecta".

### Fase 4: Reconstrucción por módulo y por eje (Workflow 4, ~24 redactores + jueces)
- Un redactor por módulo (17) escribe `04-periodos/M##.md`: resumen, cronología, hechos A, probables B, disputados C (tabla con cada versión, quién la sostiene y su evidencia), inverificables D, silencios, bibliografía.
- Tras los módulos (barrera necesaria), un redactor por eje (7) escribe `05-ejes/E#.md`. Para E1, panel de 3 redactores (genético, cultural-lingüístico, demográfico-histórico) y 2 jueces que sintetizan.

### Fase 5: Verificación adversarial (Workflow 5, ~300-600 agentes)
- Por cada afirmación A o B y cada resolución de disputa, 4 escépticos independientes: (i) refutar desde la historiografía dominicana, (ii) refutar desde la haitiana, (iii) crítica de fuentes: volver a descargar y comprobar que la fuente dice literalmente lo citado, (iv) crítica cuantitativa y metodológica. Dos o más refutaciones sólidas degradan la afirmación y obligan a reescribir.
- Pipeline de verificación de citas: cada URL y cita textual del corpus se vuelve a descargar y se coteja; las que fallan se corrigen o se eliminan.
- **[Modo C]** la lente (iii) se limita a buscar la cita en ≥2 fuentes secundarias independientes.
- Salida: `06-verificacion/veredictos.md`, `citas-verificadas.csv`, archivos M## y E# corregidos.

### Fase 6: Crítico de completitud y bucle (Workflow 6, ~20-40 agentes)
- Críticos por módulo y globales: qué voces, fuentes, modalidades o períodos faltan. Lo encontrado alimenta rondas adicionales de las Fases 2, 3 y 5. Se detiene tras 2 rondas secas.

### Fase 7: Síntesis final y auditoría de sesgo (Workflow 7, ~15 agentes)
- Panel de 3 redactores de síntesis (cronológico, temático, por disputas); 3 jueces puntúan imparcialidad, trazabilidad y claridad; se sintetiza desde el ganador injertando lo mejor de los otros.
- Auditoría de sesgo: 3 lectores (lente nacionalista dominicana, lente nacionalista haitiana, historiador neutral) marcan cada frase sesgada o cargada; se corrige y se documenta.
- Agente de contradicciones: lee todo el corpus y marca fechas, cifras o afirmaciones internamente inconsistentes.
- Salida: `07-sintesis/reconstruccion.md`, `mapa-de-disputas.md`, `cronologia.md`, `identidad-y-ascendencia.md`, `glosario.md`, `bibliografia.md`, `limites.md`.

### Fase 8: Entrega
- README con guía de lectura y método; commit y push final; Artifact HTML navegable. Opcional: resúmenes en inglés y francés.

Estimación: 550-1000 agentes en 6-7 sesiones, una fase por sesión aproximadamente (Fase 0+1; 2; 3; 4; 5+6; 7+8).

## 11. Estructura del repositorio

```
README.md
00-plan/plan.md · decisiones.md · reconocimiento/{fuentes,historiografia,evidencia-cientifica}.md
01-metodologia/metodo.md · escala-de-confianza.md · glosario.md · plantillas/ficha-fuente.md · ficha-afirmacion.md
02-fuentes/registro.csv (id, tipo, autor, título, año, idioma, tradición, url, acceso, fiabilidad, notas)
02-fuentes/por-modulo/M00..M16.md · primarias/<id>.md
03-afirmaciones/registro.md · narrativas/{dominicana,haitiana,internacional}.md
04-periodos/M00..M16.md
05-ejes/E1..E7.md
06-verificacion/veredictos.md · citas-verificadas.csv · auditoria-sesgo.md · contradicciones.md
07-sintesis/reconstruccion.md · mapa-de-disputas.md · cronologia.md · identidad-y-ascendencia.md · bibliografia.md · limites.md
```

## 12. Catálogo inicial de fuentes

### 12.1 Primarias objetivo (texto completo buscado en la Fase 3)

**Accesibles hoy (GitHub, verificadas con descarga):**
- Las Casas, *Historia de las Indias*, 5 tomos (ed. 1875-76), español: `raw.githubusercontent.com/GITenberg/Historia-de-las-Indias-vol-1-de-5_49298/master/49298-0.txt` y los repos 50351, 53171, 56283, 53131 (el tomo 5 trae Enriquillo).
- Pedro Mártir, *De Orbe Novo* vol. 1 (trad. MacNutt 1912): repo GITenberg 12425; "Quizqueia" en las líneas 11205-11284. El vol. 2 no está en el espejo.
- Las Casas, *Brevísima*, trad. inglesa de 1689: repo GITenberg 20321.
- Acta de Independencia de Haití (1804), transcripción: `raw.githubusercontent.com/SteveWLU/fren283/master/texts/independance-haitienne.md` (cotejar con el impreso de Kew, CO 137/111, ed. Gaffield).
- FRUS en XML TEI: `raw.githubusercontent.com/HistoryAtState/frus/master/volumes/frus{AÑO}v{NN}.xml`. Verificados 1861, 1863p1, 1864p1 (anexión), 1929v02 (capítulo "Boundary dispute with Haiti"), 1930v02, 1936v05, 1937v05 (capítulo ch5, docs. d149 en adelante, expediente 738.39) y 1938v05 (acuerdo de 1938).
- Obras de época en inglés: Franklin, *Present State of Hayti* (1828; Código Rural), repo 48920; Spenser St John, *Hayti or the Black Republic* (1884), repo 68592; Schoenrich, *Santo Domingo* (1918), repo 9813; Elliott, *St. Domingo, its Revolution and its Hero*, repo 70281; *Memoir of Transactions in St. Domingo 1799*, repo 50076; Sansay, *Secret History* (1808), repo 59533; Hale, *Life of Columbus* (1891), repo 1492; Haring 1910 y Burney 1816 sobre bucaneros, repos 19139 y 37116.

**Localizadas pero bloqueadas (se leen en modo A o B):**
- **Taíno y conquista**: Diario de Colón (es.wikisource; Cervantes Virtual); Pané (ed. 1932 en wisc.edu); *Brevísima* en español (es.wikisource; PDF de la RAE); Oviedo, *Historia general y natural* (identificadores de archive.org: mobot31753000521671, gri_33125000607479, generalynatural03fernrich; Cervantes Virtual ark bmc2f7m2); repartimientos de 1508 y 1514 (CODOIN t. I; Arranz Márquez 1991); documentos de Enriquillo (AGI); Devastaciones de Osorio y censo de 1606 (Rodríguez Demorizi, *Relaciones históricas* II).
- **Colonias**: Charlevoix (archive.org histoiredelislee11730char); Sánchez Valverde (Cervantes Virtual ark bmc765t8); Moreau de Saint-Méry, parte francesa (archive.org descriptiontopog00more; manioc.org) y parte española (bibliotheques-numeriques.defense.gouv.fr); Exquemelin (archive.org buccaneersmaroon00exqu); Labat (Gallica); Ryswick (axl.cefan.ulaval.ca; el texto no menciona la isla); Aranjuez (1777; art. 1: Dajabón/Masacre a Pedernales/Anse-à-Pitre, 221 pirámides; Cantillo 1843); Basilea (1795; art. IX; historylab.es).
- **Revolución y siglo XIX**: Constitución de 1801 (art. 1; marxists.org, saylor); Constitución de 1805 (PDF de Columbia; art. 18) y de 1806, 1816 (arts. 40-41), 1843, 1846, 1867, 1874, 1879 (mjp.univ-perp.fr; haitidoi.com); decreto de Ferrand (1805) y proclamas de Dessalines (Rodríguez Demorizi 1955; Madiou); declaración de Núñez de Cáceres (1821; Brewer-Carías; opúsculo 13 de la ADH); decretos de Boyer (1822) y Código Rural (1826; JCB lunaimaging); Manifiesto del 16 de enero de 1844 (ADH; es.wikisource; Clío 1960); Acta de Separación; Constitución de 1844 (bibliotecadelcongreso.gob.do; Clío 2003 n.º 165); Tratado de 1874 (catálogo de la ADH); Madiou; Ardouin; José Gabriel García (Gallica, archive.org, HathiTrust, dLOC); documentos de la Anexión y la Restauración (AHN Ultramar; Rodríguez Demorizi).
- **Siglos XX y XXI**: Tratado de 1929 y Protocolo de 1936 (memoriahistorica.senadord.gob.do; mirex.gob.do; HathiTrust); Cuello, *Documentos del conflicto de 1937*; Price-Mars (1953; bajo derechos); Peña Batlle (1946; discurso de Elías Piña); Balaguer (1947, 1983; bajo derechos); contratos de braceros (1952, 1959); Constitución de Haití de 1987 (art. 8; PDBA Georgetown); TC/0168/13 y votos disidentes (tc.gob.do); Ley 169-14; Corte IDH 2014; ENI-2012 y ENI-2017 (PDF del UNFPA).
- Patrón útil para Clío (ADH): `catalogo.academiadominicanahistoria.org.do/opac-tmpl/files/ppcodice/CLIO-{año}-{núm}-{pág_ini}-{pág_fin}.pdf`; libros en `/files/libros/`, opúsculos en `/files/opusculos/`.

**Solo en archivo físico (se declaran en `limites.md`)**: originales del Repartimiento de 1514, Enriquillo y Osorio (AGI Sevilla); proclamas de Dessalines y decretos de Boyer (Archives Nationales d'Haïti; ANOM, series C9A/C9B y F3); Acta impresa de 1804 (Kew); Acta de Separación y expedientes de la Anexión (AGN RD; AHN Madrid, Ultramar); expediente completo 738.39 de 1937 (NARA RG 59; FRUS publica una selección).

### 12.2 Secundarias por tradición (ya identificadas; detalle en `00-plan/reconocimiento/historiografia.md`)
- **Dominicana**: García, Lugo, Peña Batlle, Balaguer, Rodríguez Demorizi, Utrera, Bosch, Franco, Tolentino Dipp, Moya Pons, Cassá, Vega, R. González, San Miguel, Torres-Saillant, Candelario, García Peña, Sagás, Ricourt, Silié, Deive, Albert Batista, Jimenes Grullón, Balcácer, Andújar, Lora, Céspedes, Núñez, Cuello, Batista Lemaire (2025), Marte.
- **Haitiana**: Madiou, Ardouin, Bellegarde, Price-Mars, Fouchard, M.-R. Trouillot, H. Trouillot, Manigat, Castor, Casimir, Hector, Hurbon, Beauvoir-Dominique, Denis, Michel, Alexandre, Moïse, Théodat, Nau, Firmin.
- **Internacional**: James, Dubois, Geggus, Fick, Gaffield, Ferrer, Nessler, Yingling, Eller, Walker, Turits, Derby, Paulino, Cadeau, Matibag, Baud, Martínez, Mayes, Simmons, Roorda, Ponce Vázquez, Altman, Stone, Guitar, Pinto Tortosa, J. Gonzalez, Wigginton y Middleton, Blancpain, Candio, González Canalda, Diamond y sus críticos, Wucker, Reyes.
- **En acceso abierto confirmado por búsqueda**: Turits, *Cimientos del despotismo* (ADH) y su artículo de 2002 traducido (Estudios Sociales 133); Derby, *The Dictator's Seduction* y *Bêtes Noires* (OAPEN); Walker, tesis (Deep Blue); Baud 1993 (ADH); Franco en Estudios Sociales; Guitar (PDXScholar); Candio (theses.fr); González Canalda (Ecos); Fernandes 2021 (Reich Lab PDF); Nägele 2020 (Leiden); Eller (posible DOAB); Reyes Miguel, *La expedición haitiana de Dessalines* (ADH).

### 12.3 Evidencia científica (detalle en `00-plan/reconocimiento/evidencia-cientifica.md`)
- Genética moderna: Proyecto Genoma Dominicano (Schurr et al. 2026, n=1.015), Bryc 2010, Moreno-Estrada 2013, Montinaro 2015, D'Atanasio 2020, Martínez-Cruzado, Bukhari 2017, Simms 2010 y 2012 (Haití), Wilson 2012 (Haití), Salzano y Sans 2014. Lagunas: no hay genómica hecha dentro de Haití; tabla real del estudio DPYD; haplogrupos de La Caleta (Lalueza-Fox 2001).
- ADN antiguo: Schroeder 2018, Nägele 2020, Fernandes 2021, Nieves-Colón 2020, Sirak 2026.
- Demografía: tabla de estimaciones 1492 y serie 1508-1542; trata (Saint-Domingue ~800 mil embarcados, ~691 mil desembarcados; Santo Domingo español pendiente de slavevoyages); censos 1606, 1785, 1789 (ambos lados), 1920, 1935, 1950, 1960; ENI-2012 y 2017.
- 1937: tabla de estimaciones por autor; indemnización.

### 12.4 Portales por modo de acceso
- **Modo A/B**: archive.org (texto `_djvu.txt`), Gallica, HathiTrust, Cervantes Virtual, BDH, PARES, dLOC, Wikisource es/fr/en, history.state.gov, slavevoyages.org, mjp.univ-perp.fr, haitidoi.com, PDBA, catálogo de la ADH, Estudios Sociales, Ecos, AGN, OAPEN, Deep Blue, Redalyc, SciELO, Dialnet, Persée, HAL, Crossref, Semantic Scholar, PMC, bioRxiv.
- **Modo C**: solo WebSearch con operadores `site:` sobre esos mismos dominios y lectura de fragmentos.

## 13. Criterios de calidad (definición de terminado)

- Cada afirmación de la síntesis tiene id de fuente y letra de confianza.
- Toda URL citada fue descargada y toda cita textual cotejada en la Fase 5. **[Modo C]** toda cita marcada "indirecta" aparece en ≥2 fuentes independientes.
- Toda disputa muestra todas las versiones serias antes del veredicto.
- La auditoría de sesgo desde ambas lentes no deja marcas sin atender.
- El crítico de completitud cerró con 2 rondas secas.
- `limites.md` lista lo que no se pudo consultar y por qué.

## 14. Verificación de extremo a extremo

1. Muestra aleatoria de 30 citas de la síntesis re-descargadas y cotejadas a mano por mí (**[Modo C]** re-buscadas).
2. Escaneo de contradicciones internas (fechas, cifras, nombres) en todo el corpus.
3. Lectura cruzada final con lente dominicana y lente haitiana.
4. Toda cifra aparece como rango con fuente.
5. Cada módulo y cada eje tiene su tabla de disputas completa y cada disputa de la sección 9 tiene veredicto.

## 15. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Red cerrada (estado actual) | Decidir modo A, B o C antes de la Fase 2; en modo C, bajar el tope de confianza y declararlo en `limites.md`. |
| Tope de ~200 búsquedas por agente | Tareas estrechas; más agentes; registrar en cada salida cuántas búsquedas quedaron sin hacer. Si hiciera falta, la variable `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` se puede subir en la configuración del entorno. |
| WebFetch trunca textos largos | Descargar con curl y buscar por línea con grep; citar número de línea. |
| Espejo GITenberg incompleto (falta, p. ej., *De Orbe Novo* vol. 2) y transcripciones no críticas (Acta de 1804) | Marcar la edición usada en la ficha de proveniencia; cotejar con la edición crítica cuando se abra la red. |
| Archivos no digitalizados (AGI parcial, AGN RD, Archives Nationales d'Haïti) | Colecciones documentales impresas (Rodríguez Demorizi, Cuello, Gaffield); marcar vacíos. |
| Muros de pago | Resúmenes, reseñas, repositorios abiertos, PDFs de autor; marcar "vía reseña". |
| Fuentes en kreyòl escasas en línea | Búsquedas específicas, prensa haitiana, UEH, diáspora; marcar carencia. |
| Alucinación o sesgo del modelo | Nada de memoria sin [POR VERIFICAR]; verificación adversarial; re-descarga de citas; auditoría de sesgo. |
| Búsqueda sesgada al inglés | Búsquedas en es/fr con `site:` en .do, .ht, .fr, .es. |
| Cifras que circulan sin fuente primaria (p. ej. "12.168" de 1937, "8.492" del censo de 1936, 42,6% nativo del estudio DPYD) | Trazar a la fuente original o degradar a D. |
| Deriva de alcance | Módulos fijos; cambios registrados en `decisiones.md`. |
