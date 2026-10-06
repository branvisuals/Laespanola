## Resultado del reconocimiento: fuentes primarias sobre La Española accesibles en línea

**Lo esencial:** desde este entorno solo se pueden leer textos alojados en GitHub. Encontré direcciones de texto completo para la mayoría de las fuentes de la lista, pero el proxy de red bloquea todos los dominios de archivo que probé (más de 50). Tampoco hubo otras vías:
- **Firecrawl** no tiene créditos y devuelve error 402.
- **WebSearch** agotó el límite de la sesión (200 de 200) tras unas 22 consultas mías.
- **curl** pasa por el mismo proxy y devuelve 000 para archive.org, gallica, wikisource, history.state.gov y gutenberg.

Sí funcionan `github.com` y `raw.githubusercontent.com` (con WebFetch y con curl), la búsqueda de código y repositorios de la herramienta de GitHub, y la de Hugging Face (solo para metadatos).

**Cómo desbloquearlo:** la política de red del entorno rechazó, entre otros, archive.org, gallica.bnf.fr, babel.hathitrust.org, es/fr/en.wikisource.org, www.cervantesvirtual.com, bdh.bne.es, pares.mcu.es, dloc.com, ufdc.ufl.edu, history.state.gov, www.gutenberg.org, agn.gob.do, academiadominicanahistoria.org.do (y su subdominio `catalogo.`), tc.gob.do, mirex.gob.do, memoriahistorica.senadord.gob.do, www.manioc.org, anom.archivesnationales.culture.gouv.fr, haitidoi.com y huggingface.co. Se cambia en la configuración del entorno: menú del entorno en la barra de título de la sesión → Edit → Network access. Se puede elegir un nivel más amplio, o "Custom" añadiendo esos dominios y conservando la lista de gestores de paquetes. Pasos: https://code.claude.com/docs/en/cloud-environments#network-access

---

### 1) Tabla de fuentes

**Leyenda:**
- **SÍ texto/XML (verificado):** leído o descargado (HTTP 200).
- **BLOQUEADO (URL probada):** intenté esa URL exacta y el proxy la rechazó (EGRESS_BLOCKED).
- **BLOQUEADO (dominio probado):** la URL salió en WebSearch y el bloqueo lo confirmé con otra URL del mismo dominio.
- **NO ENCONTRADA / NO BUSCADA:** no la localicé, o se agotó el límite de búsquedas antes de llegar a ella.

| Fuente | Autor | Año | Idioma | URL encontrada | ¿Accesible por WebFetch? | Notas |
|---|---|---|---|---|---|---|
| Diario de a bordo (copia de Las Casas) | Colón / Las Casas | 1492-93 (ed. 1892) | ES | https://es.wikisource.org/wiki/Diario_de_a_bordo_del_primer_viaje_de_Crist%C3%B3bal_Col%C3%B3n:_texto_completo ; https://www.cervantesvirtual.com/obra/diario-de-a-bordo-del-primer-viaje-de-cristobal-colon--0/ | BLOQUEADO (las 2 URL probadas) | Wikisource transcribe una edición anónima de 1892. El manuscrito está en la BNE (Vitr/6/7). |
| ↳ alternativa en inglés: Hale, *Life of Columbus from His Own Letters and Journals* | E. E. Hale | 1891 | EN | https://raw.githubusercontent.com/GITenberg/The-Life-of-Columbus--13-From-His-Own-Letters-and-Journals-and-Other-Documents-of-His-Time_1492/master/1492.txt | SÍ texto (HTTP 200) | Fuente secundaria con extractos traducidos. |
| Relación acerca de las antigüedades de los indios | Ramón Pané | c.1498 (italiano 1571) | ES | https://asset.library.wisc.edu/1711.dl/NV4ZKECVHDTIC87/P/file-16965.epub (ed. Letras de México 1932) ; https://biblioteca.org.ar/libros/151816.pdf | BLOQUEADO (wisc probada) ; biblioteca.org.ar da error DNS (ENOTFOUND) | Sin copia en GitHub (buscar "pobre ermitaño" da 0 resultados). La ed. de Arrom (Siglo XXI, 1974) está bajo derechos. El original solo sobrevive en la *Historie* de Hernando Colón (1571). |
| Historia de las Indias, vols. 1-5 | Las Casas | ed. Madrid 1875-76 (Fuensanta del Valle y Sancho Rayón) | ES | https://raw.githubusercontent.com/GITenberg/Historia-de-las-Indias-vol-1-de-5_49298/master/49298-0.txt ; …/Historia-de-las-Indias-2-de-5_50351/master/50351-0.txt ; …/Historia-de-las-Indias-vol-3-de-5_53171/master/53171-0.txt ; …/Historia-de-las-Indias-vol-4-de-5_56283/master/56283-0.txt ; …/Historia-de-las-Indias-vol-5-de-5_53131/master/53131-0.txt | **SÍ texto** (vol. 1 leído con WebFetch; vols. 1-5 con HTTP 200, unos 1 MB cada uno) | UTF-8 limpio, transcripción de Project Gutenberg, no OCR crudo. El vol. 5 contiene el episodio de Enriquillo (8 menciones). Otras copias bloqueadas: es.wikisource "Índice:Historia_de_las_Indias_(Tomo_I).djvu" y aprende.cundinamarca.gov.co (pdf, URL probada). |
| Brevísima relación | Las Casas | 1552 | ES | https://es.wikisource.org/wiki/Brevísima_relación_de_la_destrucción_de_las_Indias | BLOQUEADO (URL probada) | No hay copia limpia en español en GitHub. |
| ↳ trad. inglesa *A Brief Account of the Destruction of the Indies* | Las Casas | trad. 1689 | EN | https://raw.githubusercontent.com/GITenberg/A-Brief-Account-of-the-Destruction-of-the-Indies--13-Or-a-faithful-NARRATIVE-OF-THE-Horrid-an__20321/master/20321.txt | **SÍ texto** (200, 208 KB) | Traducción de época. |
| Historia general y natural de las Indias | Fernández de Oviedo | 1535 / ed. RAH 1851-55, 4 t. | ES | https://es.wikisource.org/wiki/Archivo:Historia_general_y_natural_de_las_Indias_(IA_mobot31753000521671).pdf ; https://es.wikisource.org/wiki/%C3%8Dndice:Historia_general_y_natural_de_las_Indias_(IA_gri_33125000607479).pdf ; https://es.wikisource.org/wiki/Archivo:Historia_general_y_natural_de_las_Indias_-_IA_generalynatural03fernrich.pdf ; https://www.cervantesvirtual.com/nd/ark:/59851/bmc2f7m2 | BLOQUEADO (dominio probado) | Los identificadores de Internet Archive (mobot31753000521671, gri_33125000607479, generalynatural03fernrich) permitirían el patrón `archive.org/download/{id}/{id}_djvu.txt` (no verificado). Sin copia en GitHub. |
| Décadas / *De Orbe Novo*, vol. 1 | Pedro Mártir de Anglería | 1511-30; trad. MacNutt 1912 | EN | https://raw.githubusercontent.com/GITenberg/De-Orbe-Novo-Volume-1--of-2-The-Eight-Decades-of-Peter-Martyr-D-Anghera_12425/master/12425.txt | **SÍ texto** (curl 200, 795 KB; búsqueda con grep verificada) | Origen de "Quisqueya" confirmado (Década III, lib. VII). L.11205: "called by its early inhabitants Quizqueia, and afterwards Haiti". L.11207: "Quizqueia in their language means 'something large'". L.11284: "Quizqueia, Haiti, and Cipangu". El vol. 2 (n.º 12426) no está en GITenberg (404). La trad. española de Torres Asensio (1892) no la localicé. |
| Repartimiento de Alburquerque | — | 1514 | ES | NO ENCONTRADA (sin búsquedas disponibles) | — | Probablemente en la Colección de documentos inéditos de Indias (CODOIN), t. I (1864), y en Arranz Márquez (1991). Original en el Archivo General de Indias (AGI). |
| Documentos sobre Enriquillo | — | 1519-33 | ES | Solo la crónica: Las Casas, vol. 5 (GITenberg 53131, arriba) | parcial (crónica, no documentos de archivo) | Los documentos están en el AGI (Santo Domingo, Patronato). No los encontré en línea. |
| Devastaciones de Osorio | — | 1605-06 | ES | NO ENCONTRADA | — | Rodríguez Demorizi, *Relaciones históricas de Santo Domingo* II (1945); AGI Santo Domingo. |
| Idea del valor de la Isla Española | Sánchez Valverde | 1785 | ES | https://www.cervantesvirtual.com/nd/ark:/59851/bmc765t8 | BLOQUEADO (dominio probado) | También en Gale "Sabin Americana" (de suscripción). |
| Histoire de l'Isle Espagnole ou de S. Domingue | Charlevoix | 1730-31 | FR | https://www.archive.org/download/histoiredelislee11730char/histoiredelislee11730char_bw.pdf (t. 1, ejemplar Smithsonian) ; https://rp-digitalcollections.nypl.org/collections/histoire-de-lisle-espagnole-ou-de-s-domingue-ecrite-particulierement ; https://bibliotheques-numeriques.defense.gouv.fr/impression/document/8eea5176-ef0a-41a2-b3de-98ff32d1e8ab | BLOQUEADO (archive.org y defense.gouv.fr probados) | El t. 2 sería probablemente `histoiredelislee21730char` (deducido, no verificado). |
| Bucaniers of America | Exquemelin | 1678/1684 | EN | https://archive.org/details/buccaneersmaroon00exqu (ed. 1891) ; https://wellcomecollection.org/works/cn9hjuz5 | BLOQUEADO (las 2 URL probadas) | La ed. de 1684 está en la Univ. de Illinois (exhibits.library.illinois.edu/s/rbml/item/4171). En GitHub solo hay secundarias: Haring 1910 (GITenberg 19139) y Burney 1816 (37116). |
| Nouveau voyage aux isles de l'Amérique | Labat | 1722 | FR | https://www.bnf.fr/fr/mediatheque/nouveau-voyage-aux-iles-de-lamerique | no probada (www.bnf.fr no probado; gallica bloqueado) | No obtuve una dirección concreta en Gallica. |
| Description… partie française de l'isle Saint-Domingue | Moreau de Saint-Méry | 1797-98, 2 t. | FR | https://archive.org/details/descriptiontopog00more ; https://www.manioc.org/notice-download/13616 ; https://bibliotheques-numeriques.defense.gouv.fr/impression/document/a7ede487-cbc7-4f93-b8fc-a00558ba8491 | BLOQUEADO (manioc probada; los otros por dominio) | La ed. de 1958 (Maurel y Taillemite) está bajo derechos. |
| Description… partie espagnole | Moreau de Saint-Méry | 1796, 2 t. | FR | https://bibliotheques-numeriques.defense.gouv.fr/impression/document/323aba36-a24c-4cef-98e0-efeb004f317f | BLOQUEADO (URL probada) | Probablemente existe la trad. inglesa de Cobbett (1798) en archive.org (no verificado). |
| Tratado de Ryswick | — | 1697 | FR/LA | NO ENCONTRADA | — | Recogido en Dumont, *Corps universel diplomatique* t. VII. El texto no menciona expresamente la cesión del oeste de la isla. |
| Tratado de Aranjuez | — | 1777 | ES/FR | https://exist.ulb.tu-darmstadt.de/2/v/pa000299-0414 (posible edición IEG "Europäische Friedensverträge") | BLOQUEADO (URL probada) | Según snippet de prensa, el art. 1 fija los límites en "la boca del río Dajabón o Masacre… río Pedernales o Anse à Pitre", con 221 pirámides. Cantillo (1843) contiene el texto. |
| Tratado de Basilea | — | 1795 | EN (trad.) | https://historylab.es/definitive-peace-treaty-concluded-between-king-charles-iv-and-the-french-republic/ | BLOQUEADO (URL probada) | El art. IX es la cesión de la parte española. |
| Constitución de 1801 | Toussaint Louverture | 1801 | EN/FR | https://en.wikisource.org/wiki/Constitution_of_Saint-Domingue ; https://www.marxists.org/history/haiti/1801/constitution.htm ; https://resources.saylor.org/wwwresources/archived/site/wp-content/uploads/2011/08/HIST-303-4.4.2-Haitian-Constitution-of-1801.pdf | BLOQUEADO (marxists y saylor probadas) | Art. 1, según snippet: "Saint-Domingue in its entire expanse, and Samana, La Tortue, La Gonâve… La Saône". |
| Acta de Independencia de Haití | Dessalines / Boisrond-Tonnerre | 1804 | FR | https://raw.githubusercontent.com/SteveWLU/fren283/master/texts/independance-haitienne.md | **SÍ texto** (WebFetch) | Es la transcripción de un curso universitario, no una edición crítica. Empieza "LIBERTÉ, OU LA MORT. ARMÉE INDIGÈNE. Gonaïves, le premier janvier 1804" e incluye los firmantes. Conviene cotejarla con el impreso de los National Archives británicos (TNA CO 137/111). fr.wikisource: BLOQUEADO (URL probada). |
| Constitución Imperial | Dessalines | 1805 | EN | https://www.college.columbia.edu/sites/default/files/1805%20Haitian%20Constitution.pdf ; https://haitidoi.com/category/documents/page/8/ | BLOQUEADO (las 2 URL probadas) | El PDF de Columbia es la versión del *New-York Evening Post* (15-VII-1805). haitidoi.com (proyecto de J. Gaffield) reúne las constituciones de 1790 a 1860. |
| Constitución de 1816 | Pétion | 1816 | EN | https://en.wikisource.org/wiki/Translation:Revision_of_the_Haitian_Constitution_of_1806 | BLOQUEADO (URL probada) | Art. 40, según snippet: "The Isle of Haïti (also called Saint-Domingue) with the adjacent isles… forms the territory of the Republic". |
| Proclamas de Dessalines, campaña del Este | — | 1805 | FR | NO ENCONTRADA | — | Ver Rodríguez Demorizi, *Invasiones haitianas* (1955), y Madiou. |
| Declaratoria de independencia ("Haití Español") | Núñez de Cáceres | 1821 | ES | https://allanbrewercarias.com/wp-content/uploads/2021/12/1079.-Brewer.-LA-IDEA-DE-COLOMBIA-Y-LA-DECLARACION-DE-INDEPENDENCIA-DEL-PUEBLO-DOMINICANO-1921.pdf ; https://catalogo.academiadominicanahistoria.org.do/opac-tmpl/files/opusculos/Opusculo13.pdf | BLOQUEADO (Brewer probada; el catálogo por dominio) | El contenido de ambos PDF no está confirmado. |
| Decretos de Boyer 1822 y Código Rural 1826 | Boyer | 1822 / 1826 | FR/EN | https://jcb.lunaimaging.com/luna/servlet/detail/JCB~3~3~19835~115915772 (trad. inglesa) | BLOQUEADO (URL probada) | Alternativa verificada: Franklin, *Present State of Hayti* (1828), https://raw.githubusercontent.com/GITenberg/The-Present-State-of-Hayti-Saint-Domingo-with-Remarks-on-its-Agriculture-Commerce-Laws-Religi__48920/master/48920-0.txt — **SÍ texto**. Discute el Code Rural (líneas ~7746-7980) pero no trae el texto íntegro. |
| Manifiesto del 16 de enero de 1844 | Junta Central Gubernativa | 1844 | ES | https://www.academiadominicanahistoria.org.do/wp-content/uploads/2022/02/MANIFIESTODEL16DEENERODE1844.pdf ; https://es.wikisource.org/wiki/Manifiesto_del_16_de_enero_de_1844 ; https://catalogo.academiadominicanahistoria.org.do/opac-tmpl/files/ppcodice/CLIO-1960-116-054-107.pdf | BLOQUEADO (Academia probada) | — |
| Acta de Separación (27-II-1844) | — | 1844 | ES | NO ENCONTRADA | — | — |
| Constitución dominicana de 1844 | — | 1844 | ES | https://bibliotecadelcongreso.gob.do/Libros/0008586.pdf ; https://www.idg.org.do/clio/clio/clio165/Clio_2003_No_165-10.pdf ; https://catalogo.academiadominicanahistoria.org.do/opac-tmpl/files/ppcodice/CLIO-2003-165-185-204.pdf | BLOQUEADO (las 2 primeras probadas) | Contenido exacto no confirmado. |
| Tratado dominico-haitiano | — | 1874 | FR | https://catalogo.academiadominicanahistoria.org.do/opac-tmpl/files/libros/TraitedePaixdamitdecommerceentrelarepubliquedhaitietrepubliquedominicaine.pdf | BLOQUEADO (URL probada) | Según la prensa, en el art. 1 ambos Estados se declaran los únicos soberanos de la isla. |
| Histoire d'Haïti / Études sur l'histoire d'Haïti / Compendio | Madiou / Ardouin / J. G. García | 1847 / 1853-60 / 1867+ | FR/ES | NO BUSCADAS (sin búsquedas disponibles) | — | Son de dominio público; probablemente están en Gallica, archive.org, HathiTrust o dLOC. |
| Anexión a España / Restauración (correspondencia de EE. UU.) | Departamento de Estado | 1861-64 | EN | https://raw.githubusercontent.com/HistoryAtState/frus/master/volumes/frus1861.xml ; …/frus1863p1.xml ; …/frus1864p1.xml | **SÍ XML** (200) | Pocas menciones de Santo Domingo (6, 2 y 2). Los documentos españoles están en el Archivo Histórico Nacional (Madrid), sección Ultramar. |
| Tratado fronterizo 1929 y Protocolo 1936 | RD / Haití | 1929 / 1936 | ES/FR | https://memoriahistorica.senadord.gob.do/bitstreams/aeb4efa1-41e2-49aa-8847-6c23e4ad4635/download (también …/caa5f21a-3b51-46a4-8d93-1a8bd4b2e17f/download y …/75bbc2ed-3518-484c-a547-bd9c1840825f/download) ; https://mirex.gob.do/wp-content/uploads/2024/06/6.-Haiti_acuerdo-fronterizo.pdf ; https://lawcat.berkeley.edu/record/184784 | BLOQUEADO (senado y mirex probadas) | El Protocolo de 1936 (16 pp.) está en HathiTrust/LLMC. Verificado en GitHub: `frus1929v02.xml`, capítulo "Boundary dispute with Haiti" (línea 73430, p. 930) — **SÍ XML**. |
| FRUS 1937-1938: masacre y acuerdo de 1938 | Departamento de Estado | 1937-38 | EN | https://raw.githubusercontent.com/HistoryAtState/frus/master/volumes/frus1937v05.xml (4,4 MB) ; …/frus1938v05.xml (5,4 MB) | **SÍ XML TEI** (curl 200 y grep verificado) | 1937 vol. V, capítulo `ch5`: "Tender of good offices by the United States, Cuba, and Mexico to conciliate differences between the Dominican Republic and Haiti". Empieza en el doc. d149, expediente 738.39, e incluye el telegrama Trujillo→Roosevelt del 15-XI-1937 (d154). En 1938 vol. V el mismo tema continúa desde la línea ~17746 (22 referencias a 738.39). https://history.state.gov/historicaldocuments/frus1937v05: BLOQUEADO (URL probada). |
| La République d'Haïti et la République Dominicaine | Price-Mars | 1953 | FR | NO BUSCADA | — | Bajo derechos (el autor murió en 1969). |
| Ensayos de Peña Batlle; *La isla al revés* | Peña Batlle; Balaguer | 1940s-54; 1983 | ES | NO BUSCADAS | — | Balaguer está bajo derechos. Peña Batlle (m. 1954) quizá ya sea de dominio público en RD (vida + 70; no verificado). |
| Sentencia TC/0168/13 | Tribunal Constitucional | 2013 | ES | https://www.tc.gob.do/ (portada) | BLOQUEADO (URL probada) | En GitHub solo aparecen referencias secundarias. |
| Ley 169-14 | Congreso RD | 2014 | ES | NO BUSCADA | — | — |

**Otros textos de época verificados en GitHub** (todos con HTTP 200, base `https://raw.githubusercontent.com/GITenberg/`):
- `Hayti-or-The-black-republic_68592/master/68592-0.txt` — Spenser St John, 1884 (555 KB).
- `Santo-Domingo--A-Country-with-a-Future_9813/master/9813.txt` — Schoenrich, 1918 (753 KB). Resume Ryswick (l.1219), Aranjuez (l.1270) y Basilea (l.1329).
- `A-Memoir-of-Transactions-That-Took-Place-in-St-Domingo-in-the-Spring-of-1799-Affording-an-Ide__50076/master/50076-0.txt`
- `St-Domingo-its-revolution-and-its-hero-Toussaint-Louverture_70281/master/70281-0.txt` — C. W. Elliott.
- Existen también los repositorios de Sansay, *Secret History* (59533), y J. W. Johnson, *Self-Determining Haiti* (35025); sus archivos no los probé.

---

### 2) Tabla de portales

Los patrones marcados "(conocido)" no se pudieron comprobar aquí porque el dominio está bloqueado.

| Portal | URL | ¿Navegable por agente aquí? | Cómo buscar (patrón de URL) | Limitaciones |
|---|---|---|---|---|
| PARES (AGI) | pares.mcu.es | NO (EGRESS_BLOCKED) | (conocido) `/ParesBusquedas20/catalogo/search`; formularios con JavaScript | Manuscritos solo en imagen, sin OCR; mala opción para agentes incluso sin bloqueo. |
| Gallica | gallica.bnf.fr | NO | (conocido) SRU `https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=(gallica all "…")`; texto: `/ark:/12148/{ark}.texteBrut` | OCR de calidad variable. |
| Internet Archive | archive.org | NO (WebFetch y curl) | (conocido) `/advancedsearch.php?q=…&fl[]=identifier&output=json`; texto completo: `/download/{id}/{id}_djvu.txt` | Identificadores útiles ya localizados: descriptiontopog00more, histoiredelislee11730char, buccaneersmaroon00exqu, mobot31753000521671, gri_33125000607479, generalynatural03fernrich. |
| HathiTrust | babel.hathitrust.org | NO | (conocido) `/cgi/ls?q1=…;anyall1=all;lmt=ft`; API `catalog.hathitrust.org/api/volumes/brief/oclc/{n}.json` | Suele poner verificaciones anti-bot; el texto plano va página a página. |
| dLOC | dloc.com / ufdc.ufl.edu | NO (ambos) | (conocido) `dloc.com/search?q=…` | Fuerte en prensa y documentos haitianos. |
| Biblioteca Virtual Miguel de Cervantes | www.cervantesvirtual.com | NO | Identificadores ark: `/nd/ark:/59851/{id}` (bmc2f7m2 = Oviedo; bmc765t8 = Sánchez Valverde) | — |
| Biblioteca Digital Hispánica | bdh.bne.es | NO | (conocido) `/bnesearch/Search.do?text=…` | Su OCR está en el corpus PleIAs/Spanish-PD-Books de Hugging Face (302.640 textos de BDH e Internet Archive), pero son parquet de 280-590 MB y huggingface.co está bloqueado. |
| AGN República Dominicana | agn.gob.do (agn.gov.do no resuelve) | NO | — | — |
| ANOM / Archives Nationales d'Haïti | anom.archivesnationales.culture.gouv.fr | NO | — | Instrumentos de búsqueda e imágenes; sin texto. |
| slavevoyages.org | www.slavevoyages.org | NO | — | Aplicación JavaScript; los datos se descargan en CSV. |
| history.state.gov (FRUS) | history.state.gov | NO, pero **hay alternativa SÍ:** GitHub HistoryAtState/frus | `https://raw.githubusercontent.com/HistoryAtState/frus/master/volumes/frus{AÑO}v{NN}.xml` (algunos años usan `p1`; frus1862p1 da 404). Hacer grep de `738.39` (expediente de relaciones Haití-RD) | Probados: 1861, 1863p1, 1864p1, 1929v02, 1930v02, 1936v05, 1937v05 y 1938v05, todos con 200. |
| Wikisource es/fr/en | *.wikisource.org | NO (los 3 probados) | (conocido) `/w/index.php?title=…&action=raw` | El dataset wikimedia/wikisource de Hugging Face existe, pero no es descargable desde aquí. |
| Google Books | books.google.com | NO | (conocido) `googleapis.com/books/v1/volumes?q=…&filter=full` | No ofrece texto plano. |
| JSTOR, Project MUSE, DOAJ, SciELO, Dialnet, Redalyc, Persée, OpenEdition, HAL | — | NO (todos probados) | — | — |
| Revista Clío (Academia Dominicana de la Historia) | catalogo.academiadominicanahistoria.org.do ; idg.org.do | NO | Patrón descubierto: `catalogo.academiadominicanahistoria.org.do/opac-tmpl/files/ppcodice/CLIO-{año}-{núm}-{pág_ini}-{pág_fin}.pdf`; libros en `/files/libros/`, opúsculos en `/files/opusculos/` | — |
| Revue de la Société Haïtienne d'Histoire | — | NO BUSCADA | — | Probablemente en dLOC (no verificado). |
| Project Gutenberg | www.gutenberg.org | NO, pero **hay alternativa SÍ:** espejo GITenberg en GitHub | `https://raw.githubusercontent.com/GITenberg/{Slug}_{ID}/master/{ID}-0.txt` (o `{ID}.txt`). Para localizar el repositorio: búsqueda de repos de GitHub con `user:GITenberg <término>` | El espejo no está completo (falta, por ejemplo, el vol. 2 de *De Orbe Novo*). |
| GitHub | github.com, raw.githubusercontent.com | **SÍ** | Búsqueda de código y de repositorios | La lectura de archivos con la herramienta de GitHub (get_file_contents) solo funciona en branvisuals/laespanola; para el resto, usar raw por WebFetch o curl. |

---

### 3) Fuentes no encontradas en línea y dónde estarían físicamente

**Del período colonial español:**
- **Repartimiento de 1514:** Archivo General de Indias (Sevilla); edición impresa en la CODOIN, t. I (1864) y en Arranz Márquez (1991).
- **Documentos de Enriquillo y Devastaciones de Osorio:** AGI, secciones Santo Domingo, Patronato y Justicia; ediciones de Rodríguez Demorizi (*Relaciones históricas* II).
- **Ryswick, Aranjuez y Basilea:** Archives diplomatiques (La Courneuve); Archivo Histórico Nacional, sección Estado; ediciones de Dumont y de Cantillo (1843).
- **Pané:** el texto completo en dominio público es la *Historie* de Hernando Colón (Venecia, 1571), en la BNF, la Biblioteca Colombina y archive.org.

**Del período francés y la revolución haitiana:**
- **Proclamas de Dessalines de 1805 y decretos de Boyer:** Archives Nationales d'Haïti (Port-au-Prince); ANOM en Aix (series C9A/C9B y colección Moreau de Saint-Méry, F3); recopilación de Linstant Pradine, *Recueil général des lois…*
- **Acta de Independencia impresa de 1804:** The National Archives (Kew), CO 137/111. Para Haití y RD, ver también las series FO 35 y FO 23.

**Del siglo XIX dominicano:**
- **Acta de Separación, Constitución de 1844 y documentos de la anexión y la Restauración:** AGN de Santo Domingo; Archivo Histórico Nacional (Madrid), sección Ultramar; Archivo General Militar; compilaciones de Rodríguez Demorizi.

**Del siglo XX:**
- **Masacre de 1937:** National Archives de EE. UU., grupo de registros RG 59, expediente 738.39 (lo publicado en FRUS es una selección); AGN-RD, fondo de la Era de Trujillo.
- **Price-Mars, Balaguer, Peña Batlle:** obras bajo derechos o sin localizar; habría que consultarlas en biblioteca física.
- **TC/0168/13 y Ley 169-14:** están en tc.gob.do y en la Gaceta Oficial; solo están bloqueadas, no se han perdido.

---

### 4) Herramientas y errores

**WebFetch:**
- Solo lee github.com y raw.githubusercontent.com; todo lo demás devuelve `EGRESS_BLOCKED`.
- agn.gov.do y biblioteca.org.ar dan `ENOTFOUND` (error de DNS).
- **Trunca los archivos grandes:** con el texto de 795 KB de *De Orbe Novo* solo leyó el prólogo y no encontró "Quizqueia". Para textos largos hay que usar curl con grep.

**curl (Bash):** respeta la misma lista de dominios permitidos. Funciona con raw.githubusercontent.com y permite grep sobre textos de 1 a 6 MB, pero devuelve 000 para los portales bloqueados.

**WebSearch:** funciona bien para localizar direcciones, pero el límite de 200 consultas es por sesión y se agotó (lo consumieron agentes en paralelo). Para más búsquedas hay que subir `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`.

**Firecrawl:** tanto la extracción de páginas como la búsqueda fallan por falta de créditos ("Insufficient credits" / error 402). La cuenta de Firecrawl necesita más créditos.

**Herramienta de GitHub:**
- La búsqueda de repositorios y de código funciona en todo GitHub.
- La búsqueda de código no indexa archivos grandes: dio 0 resultados para "Quizqueia" dentro del texto de 795 KB.
- La lectura de archivos está restringida a branvisuals/laespanola.

**Hugging Face:** la herramienta lee metadatos y README (PleIAs/Spanish-PD-Books, wikimedia/wikisource), pero los datos están en parquet de cientos de MB y huggingface.co está bloqueado. No es usable sin ampliar la red.

**Mejor vía actual:** GITenberg para las crónicas en dominio público, HistoryAtState/frus para la diplomacia de EE. UU. de 1861 a 1938, y raw.githubusercontent.com con curl y grep para citar líneas exactas. Para todo lo demás (Gallica, archive.org, Wikisource, Cervantes Virtual, Academia Dominicana, Senado y MIREX) hay que ampliar la lista de dominios permitidos del entorno, como se indica al principio.
