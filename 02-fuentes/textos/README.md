# Textos de dominio público descargados

Copias locales para que toda cita del corpus sea cotejable por número de línea (`grep -n`). Descargados el 2026-10-05 desde espejos públicos en GitHub (los únicos dominios que la red del entorno permite). Las fichas de proveniencia completas se redactan en la Fase 3 (`02-fuentes/primarias/`); esta tabla es la ficha inicial.

## gutenberg/ (espejo GITenberg de Project Gutenberg)

| Archivo | Obra | Autor | Edición transcrita | Idioma | Tamaño | Proveniencia y caveats |
|---|---|---|---|---|---|---|
| lascasas-historia-indias-t1..t5.txt | *Historia de las Indias*, 5 tomos | Bartolomé de las Casas (escrita c. 1527-1561) | Madrid, Imprenta de Miguel Ginesta, 1875-76 (ed. Fuensanta del Valle y Sancho Rayón), Gutenberg 49298, 50351, 53171, 56283, 53131 | es | ~1 MB c/u | Transcripción limpia (no OCR crudo). Las Casas escribe como defensor de los indios y crítico de la encomienda: testigo directo de parte de lo que narra, pero con tesis. El tomo 5 contiene el alzamiento de Enriquillo. |
| lascasas-brevisima-1689-en.txt | *A Brief Account of the Destruction of the Indies* | Las Casas (1552) | Traducción inglesa de 1689, Gutenberg 20321 | en | 208 KB | Traducción de época con intención antiespañola (leyenda negra). Útil para las cifras que Las Casas da; cotejar con el original español cuando la red lo permita. |
| martir-de-orbe-novo-v1-en.txt | *De Orbe Novo*, vol. 1 (Décadas I-IV) | Pedro Mártir de Anglería (1511-1530) | Trad. F. A. MacNutt, 1912, Gutenberg 12425 | en | 795 KB | Única fuente del nombre "Quizqueia" (Década III, lib. VII; líneas 11205-11284). Mártir nunca viajó a América: compila informes de otros. El vol. 2 no está en el espejo. |
| franklin-present-state-of-hayti-1828.txt | *The Present State of Hayti* | James Franklin | Londres, 1828, Gutenberg 48920 | en | 617 KB | Observador británico, crítico de Boyer. Discute el Código Rural de 1826 (aprox. líneas 7746-7980) sin transcribirlo íntegro. |
| stjohn-hayti-black-republic-1884.txt | *Hayti, or the Black Republic* | Spenser St. John | Londres, 1884, Gutenberg 68592 | en | 555 KB | Diplomático británico; obra abiertamente racista y hostil a Haití. Fuente para el discurso europeo sobre Haití, no para los hechos sin corroborar. |
| schoenrich-santo-domingo-1918.txt | *Santo Domingo: A Country with a Future* | Otto Schoenrich | Nueva York, 1918, Gutenberg 9813 | en | 753 KB | Escrito durante la ocupación de EE.UU.; resume Ryswick (l. ~1219), Aranjuez (l. ~1270) y Basilea (l. ~1329) desde la óptica estadounidense. |
| elliott-st-domingo-toussaint.txt | *St. Domingo, its Revolution and its Hero, Toussaint Louverture* | Charles Wyllys Elliott | 1855, Gutenberg 70281 | en | 133 KB | Panfleto abolicionista estadounidense. |
| memoir-transactions-st-domingo-1799.txt | *A Memoir of Transactions that Took Place in St. Domingo in the Spring of 1799* | Anónimo (agente británico) | Londres, 1800, Gutenberg 50076 | en | 52 KB | Testigo de la política británica hacia Toussaint. |
| hale-life-of-columbus-1891.txt | *The Life of Columbus from His Own Letters and Journals* | Edward Everett Hale | 1891, Gutenberg 1492 | en | 341 KB | Secundaria con extractos traducidos del Diario y las cartas de Colón. Sustituto provisional del Diario (es.wikisource bloqueado). |

## frus/ (repositorio HistoryAtState/frus, *Foreign Relations of the United States*)

Extraídos con `extract_frus.py` (copiado en `02-fuentes/textos/frus/extract_frus.py`): se copian los capítulos, subcapítulos o secciones cuyo encabezado menciona Dominican/Haiti/Hayti/Santo Domingo/Trujillo/Port-au-Prince/Dajabón/Massacre River, y los documentos sueltos con dos o más menciones. Cada volumen tiene versión `.xml` (TEI original) y `.txt` (texto plano con id de documento `[dNNN]`).

| Archivo | Volumen | Contenido relevante | Docs |
|---|---|---|---|
| frus1861-espanola.* | FRUS 1861 | Anexión de Santo Domingo a España; correspondencia con Madrid | 1 |
| frus1863p1-espanola.* | FRUS 1863, parte 1 | Guerra de Restauración vista desde Madrid y Washington | 4 |
| frus1864p1-espanola.* | FRUS 1864, parte 1 | Restauración | 1 |
| frus1928v01-espanola.* | FRUS 1928, vol. I | Subcap. "Dominican Republic and Haiti" (negociación fronteriza previa al Tratado de 1929) y documentos sueltos | 35 |
| frus1929v01-espanola.* | FRUS 1929, vol. I | Subcap. "Dominican Republic and Haiti" (Tratado fronterizo del 21 de enero de 1929) y documentos sueltos; el vol. II solo remite a este | 18 |
| frus1930v02-espanola.* | FRUS 1930, vol. II | Revolución dominicana de 1930 y ascenso de Trujillo; documentos sobre Haití | 66 |
| frus1936v05-espanola.* | FRUS 1936, vol. V | RD (deuda, convención de 1924, protesta por "The March of Time"); Haití (control financiero, préstamo francés) | 97 |
| frus1937v05-espanola.* | FRUS 1937, vol. V | Cap. 5: buenos oficios de EE.UU., Cuba y México tras la masacre de octubre de 1937 (expediente 738.39), incl. telegramas Roosevelt-Trujillo-Vincent de noviembre de 1937; convención con RD; Haití | 89 |
| frus1938v05-espanola.* | FRUS 1938, vol. V | Cap. 3: continuación de la mediación y acuerdo de 1938; comercio con RD; Haití (suspensión de deuda, Garde d'Haiti) | 113 |

Caveat general: FRUS es una selección oficial del Departamento de Estado publicada décadas después; el expediente completo 738.39 está en NARA RG 59. Representa la mirada estadounidense, no la dominicana ni la haitiana.

## Otros

| Archivo | Obra | Proveniencia y caveats |
|---|---|---|
| acta-independencia-haiti-1804-transcripcion.md | Acte de l'Indépendance d'Haïti, Gonaïves, 1 de enero de 1804 | Transcripción de un curso universitario (repositorio SteveWLU/fren283), no edición crítica. Cotejar con el impreso de The National Archives (Kew, CO 137/111) publicado por Julia Gaffield (2016). |
