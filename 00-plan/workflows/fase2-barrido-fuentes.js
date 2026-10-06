export const meta = {
  name: 'fase2-barrido-fuentes',
  description: 'Fase 2: barrido multimodal de fuentes por modulo con 5 buscadores ciegos, fusion, critico de completitud, segunda ronda dirigida y registro con commit y push por modulo',
  phases: [
    { title: 'Busqueda', detail: 'cinco buscadores ciegos por modulo: dominicana, haitiana, colonial-primaria, internacional, cientifica' },
    { title: 'Fusion', detail: 'un fusionador por modulo escribe 02-fuentes/por-modulo/M##.md' },
    { title: 'Completitud', detail: 'un critico por modulo; segunda ronda dirigida por lente si falta algo' },
    { title: 'Registro', detail: 'ids F-#### correlativos en registro.csv, cobertura.csv, commit y push por modulo (en serie)' },
  ],
}

// ---------------------------------------------------------------------------
// Parametros (todos opcionales, via args del Workflow)
//   args.modulos        : lista de modulos a correr, p. ej. ["M16","M13"]; por defecto, el orden de abajo
//   args.en_vuelo       : modulos procesados a la vez (por defecto 3: 15 buscadores + 1 hueco para fusion/critico)
//   args.max_busquedas  : tope de busquedas por buscador en la ronda 1 (por defecto 120; la ronda 2 usa 80)
//   args.fecha          : fecha de consulta que va en las fichas (YYYY-MM-DD); el script no puede leer el reloj
//   args.modelos        : modelo por rol, p. ej. {buscador:"sonnet", fusionador:"sonnet", critico:"opus", registrador:"sonnet"};
//                         si falta un rol, ese rol hereda el modelo de la sesion
//   args.registrar_solo : modulos cuya busqueda y fusion ya existen en disco (M##.md y M##.nuevas/existentes/cobertura.csv
//                         de una corrida anterior): se omiten busqueda y fusion y corren solo critico, segunda ronda si hace
//                         falta y registrador. Ejemplo: ["M05","M06"].
//
// AVISO SOBRE REANUDAR (aprendido el 2026-10-06): la cache de resumeFromRunId reproduce solo el prefijo de llamadas agent()
// que coincide en ORDEN con la corrida anterior. Con varios modulos en vuelo el orden no es determinista, asi que una
// reanudacion vuelve a lanzar todo (en la segunda corrida se repitieron M16, M13, M09 y M08 y el fusionador de M09 sustituyo
// el M09.md anterior). Para continuar una fase a medias NO uses resumeFromRunId: lanza una corrida nueva con args.modulos
// (solo los pendientes) y args.registrar_solo (los fusionados sin registrar).
// ---------------------------------------------------------------------------

const REPO = 'C:\\Users\\branl\\OneDrive\\Desktop\\Claude\\La Espanola'
const REPO_SH = '/c/Users/branl/OneDrive/Desktop/Claude/La Espanola'
const RAMA = 'claude/hispaniola-historical-research-plan-79fana'

const ORDEN_DEFECTO = ['M16', 'M13', 'M08', 'M09', 'M00', 'M06', 'M05', 'M02', 'M11', 'M10', 'M01', 'M03', 'M15', 'M07', 'M14', 'M12', 'M04']
const MODULOS_A_CORRER = (args && Array.isArray(args.modulos) && args.modulos.length) ? args.modulos : ORDEN_DEFECTO
const EN_VUELO = (args && args.en_vuelo) || 3
const MAX_B1 = (args && args.max_busquedas) || 120
const MAX_B2 = Math.min(80, MAX_B1)
const FECHA = (args && args.fecha) || '2026-10-06'
const MODELOS = (args && args.modelos) || {}
const REGISTRAR_SOLO = (args && Array.isArray(args.registrar_solo)) ? args.registrar_solo : []
const opt = (rol, extra) => Object.assign({}, MODELOS[rol] ? { model: MODELOS[rol] } : {}, extra)

const MODULOS = {
  M00: { periodo: 'Marco', guia: 'Geografia; nombres de la isla y origen documental de cada uno ("Ayiti/Haiti" en Hernando Colon, Oviedo y Las Casas; "Quisqueya" solo en Pedro Martir; "Bohio"); usos politicos posteriores (Odette Roy Fombrun, "Haiti Espanol" de 1821); las dos tesis identitarias en su formulacion general; etnonimo "taino"; lengua y toponimia.' },
  M01: { periodo: 'c. 5000 a.C.-1492', guia: 'Oleadas de poblamiento (arcaicos, saladoides, ostionoides, chicoides), cacicazgos (Marien, Magua, Maguana, Jaragua, Higuey), tamano de poblacion, sociedad, religion (cemies), arqueologia y ADN antiguo (Nagele 2020, Fernandes 2021, Sirak 2026 en Samana). Debate sobre la etiqueta "taino" (Rafinesque 1836; Curet 2014; Keegan y Hofman).' },
  M02: { periodo: '1492-1520s', guia: 'Contacto, La Navidad, La Isabela, encomienda, Caonabo, Anacaona y Jaragua (1503), Leyes de Burgos, repartimientos de 1508 (60.000) y 1514 (~26.000), colapso demografico (choque de conquista vs viruela de 1518; Livi-Bacci), esclavitud indigena (Stone: >250.000 sacados del Caribe), primeros africanos (1502-1503 ladinos; asiento de 1518).' },
  M03: { periodo: '1519-1606', guia: 'Enriquillo (rebelion taina con participacion africana; pueblo de Boya), primera rebelion de esclavos (1521), cimarronaje (Lemba), azucar e ingenios, declive, Devastaciones de Osorio (1605-1606) y censo de 1606 (9.648 esclavos, 1.117 vecinos).' },
  M04: { periodo: '1606-1697', guia: 'Bucaneros, Tortuga, asentamiento frances, contrabando (Ponce Vazquez), lo que Ryswick (1697) dice y no dice: el texto no menciona la isla.' },
  M05: { periodo: '1697-1789', guia: 'Dos colonias divergentes: Saint-Domingue (~465.000-500.000 esclavizados, ~31.000 blancos, ~28.000 libres de color en 1789) vs Santo Domingo (~100.000-125.000 habitantes; ~65.000 libres de color, ~25.000 blancos, <=15.000 esclavos segun Moreau). Aranjuez (1777): primera frontera formal. Charlevoix, Sanchez Valverde, Moreau. Economia de frontera y hato ganadero.' },
  M06: { periodo: '1789-1809', guia: 'Revolucion haitiana, Basilea (1795), Toussaint toma Santo Domingo (1801) y su constitucion, Leclerc, independencia (1804), decreto de Ferrand (6 ene 1805), campana de Dessalines (sitio de Santo Domingo, retirada, Moca y Santiago: cifras y critica de fuentes de Utrera y Marte), Palo Hincado (1808), "Reconquista" (1809) y restauracion de la esclavitud en el este (Nessler).' },
  M07: { periodo: '1809-1822', guia: '"Espana Boba", decadencia, Nunez de Caceres y el "Estado Independiente de Haiti Espanol" (1 dic 1821), peticion a la Gran Colombia, pueblos que izaron la bandera haitiana desde el 15 nov 1821 (Dajabon, Montecristi y otros), entrada de Boyer (9 feb 1822) con ~10.000 soldados.' },
  M08: { periodo: '1822-1844', guia: 'Unificacion / ocupacion: abolicion (>10.000 liberados; Lora: libertos siguen con sus amos bajo contrato), Codigo Rural (1826), tierras y bienes de la Iglesia, universidad (1823, disputado), indemnizacion a Francia (1825) y su peso en el este, reclutamiento, lengua, inmigracion afroamericana (Samana 1824), dominicanos en la administracion haitiana (Baez diputado constituyente en 1843), La Trinitaria (1838), Reforma de 1843, 27 feb 1844. Obras: Moya Pons 1972, Batista Lemaire 2025 vs Eller, Yingling, Walker.' },
  M09: { periodo: '1844-1861', guia: 'Manifiesto del 16 de enero (habla de "separacion"), Santana vs Duarte, guerras (Azua, Santiago, Beler, Las Carreras, Sabana Larga 1856), Soulouque, protectorados, raza y ciudadania en la Constitucion de 1844, postura real de Duarte sobre los haitianos ("no es posible una fusion" vs "admiro al pueblo haitiano"; verso de los "blancos, morenos, cobrizos, cruzados"); doctrina haitiana de la isla "una e indivisible" (1805-1846).' },
  M10: { periodo: '1861-1865', guia: 'Anexion a Espana, ultimatum de Rubalcaba a Haiti (1861), Guerra de Restauracion, apoyo de Geffrard (armas, refugio), propuesta de tratado de unidad de 1864, mediacion de 1865, retirada espanola.' },
  M11: { periodo: '1865-1915', guia: 'Caudillos, Baez, Lilis; Haiti bajo Salnave y Salomon; Tratado de 1874 (primer reconocimiento haitiano; arts. 3 y 4); disputas de limites; la frontera como refugio (Baud); industria azucarera y migracion laboral; Firmin (1885) frente al racismo cientifico; Hostos, Bono, Lugo ("constitucionalmente blancos").' },
  M12: { periodo: '1915-1934', guia: 'Ocupaciones de EE.UU. (Haiti 1915-1934, RD 1916-1924), braceros en los ingenios, Tratado de 1929, cacos y gavilleros, inicio de la represion racializada en la frontera (Cadeau: 1919), indigenismo haitiano (Price-Mars 1928).' },
  M13: { periodo: '1930-1961', guia: 'Trujillo: discurso inicialmente prohaitiano (Turits), "dominicanizacion de la frontera", Protocolo de 1936, masacre de octubre de 1937 (cifras por autor; motivaciones; acuerdo de 1938: 750.000 USD pactados, 525.000 pagados), ideologia de Estado (Pena Batlle, Balaguer 1947), contratos de braceros (1952, 1959), relaciones con Vincent, Lescot, Estime, Magloire y Duvalier.' },
  M14: { periodo: '1961-1986', guia: 'Balaguer y Duvalier: bateyes y Consejo Estatal del Azucar, contratos de mano de obra, "La isla al reves" (1983), diaspora haitiana, caida de Jean-Claude Duvalier; vodu dominicano (21 Divisiones) y la variante afrodominicana.' },
  M15: { periodo: '1986-2010', guia: 'Aristide, golpe de 1991, deportaciones masivas (1991, 1999), campanas contra Pena Gomez (1994, 1996), Ley 285-04, informes sobre bateyes, Yean y Bosico (CIDH 2005), terremoto de 2010 y ayuda dominicana.' },
  M16: { periodo: '2010-2026', guia: 'Constitucion de 2010 (art. 18.3), TC/0168/13 (23 sep 2013; >200.000 afectados segun CIDH/CEJIL vs cifras de la JCE; votos disidentes), Ley 169-14 (grupos A y B), sentencia Corte IDH 2014 y retiro dominicano, ENI-2012 y ENI-2017 (458 mil y 498 mil nacidos en Haiti; 751 mil de origen haitiano), deportaciones 2015-2026, muro, canal del Masacre/Dajabon (2023), crisis haitiana 2024-2026, bicentenario de 1822 y relatos en medios y redes; genetica de poblaciones actual (ascendencia nativa, africana y europea en dominicanos y haitianos) y la categoria "indio".' },
}

const LENTES = [
  { key: 'dominicana', nombre: 'TRADICION DOMINICANA', guia: `Buscas las obras, documentos y voces de la historiografia dominicana sobre el modulo: la oficial-escolar e hispanista (Garcia, Lugo, Pena Batlle, Balaguer, Rodriguez Demorizi, Utrera, Moya Pons, Balcacer, Nunez, Batista Lemaire, Cuello, Marte, Reyes Miguel, Incháustegui, Lugo Lovatón) y las variantes criticas internas (Franco, Tolentino Dipp, Bosch, Cassa, Vega, Deive, Silie, Andujar, Lora, San Miguel, R. Gonzalez, Torres-Saillant, Candelario, Garcia Pena, Sagas, Ricourt, Albert Batista, Jimenes Grullon, Cespedes), mas textos escolares del MINERD, discursos y conmemoraciones de Estado, y prensa dominicana (Acento, Diario Libre, Listin Diario, Hoy, El Caribe, El Dia, El Nuevo Diario) como divulgacion con autor. Portales prioritarios: Academia Dominicana de la Historia (www.academiadominicanahistoria.org.do/wp-content/uploads/ y catalogo.academiadominicanahistoria.org.do/opac-tmpl/files/{ppcodice,libros,opusculos}/; Clio sigue el patron CLIO-{ano}-{num}-{pag_ini}-{pag_fin}.pdf; hgpdvol6.academiadominicanahistoria.org.do), AGN (agn.gob.do y el Boletin del AGN), Estudios Sociales (estudiossociales.bono.edu.do), Ecos (revistas.uasd.edu.do), Memoria Historica del Senado (memoriahistorica.senadord.gob.do), Biblioteca del Congreso (bibliotecadelcongreso.gob.do), Banco Central (coleccion cultural), dLOC (dloc.com), Cervantes Virtual, tc.gob.do, mirex.gob.do, one.gob.do, Museo del Hombre Dominicano. Idioma principal: espanol; usa site: en dominios .do. Simetria: busca tambien las voces dominicanas que discrepan del relato oficial.` },
  { key: 'haitiana', nombre: 'TRADICION HAITIANA', guia: `Buscas las obras, documentos y voces de la historiografia haitiana sobre el modulo: clasicos (Madiou, Beaubrun Ardouin, Saint-Remy, Firmin, Janvier, Bellegarde, Price-Mars, Dorsainvil, Fouchard), siglos XX-XXI (M.-R. Trouillot, H. Trouillot, Manigat, Castor, Casimir, Hector, Hurbon, Beauvoir-Dominique, Watson Denis, Georges Michel, Guy Alexandre, Claude Moise, Theodat, Nau, Chauvet, Dalencour, Gaillard, Etienne, Pean, Dorestant), la Revue de la Societe Haitienne d'Histoire, de Geographie et de Geologie, textos escolares y programas del MENFP, discursos y conmemoraciones de Estado (1 de enero, 18 de noviembre, 17 de octubre), prensa haitiana (Le Nouvelliste, Le National, AlterPresse, Haiti Liberte, Loop Haiti, Haiti Libre) y voces en kreyol. Portales: dLOC (colecciones haitianas), Gallica (ediciones haitianas del siglo XIX: Madiou, Ardouin, Linstant Pradine, Le Moniteur), archive.org, manioc.org, haitidoi.com, mjp.univ-perp.fr (constituciones), Island Luminous (islandluminous.fiu.edu), archivo de Radio Haiti (repository.duke.edu), Potomitan, Bibliotheque haitienne des Peres du Saint-Esprit, UEH, Collectif Haiti de France, CRESFED, Memoire d'encrier. Idiomas: frances primero, kreyol, luego espanol e ingles; usa site: en .ht y .fr. Simetria: busca tambien las voces haitianas que discrepan del relato oficial (mulatristas vs noiristas, criticos de la doctrina de la isla indivisible).` },
  { key: 'colonial-primaria', nombre: 'FUENTES PRIMARIAS (coloniales espanolas y francesas, y documentos oficiales de cada epoca)', guia: `Buscas el TEXTO de los documentos primarios del modulo o la edicion documental que los transcribe. Modulos coloniales: cronicas (Colon: Diario y cartas; Las Casas; Oviedo; Pane; Pedro Martir en latin y castellano; Herrera; Hernando Colon), relaciones y visitas, repartimientos (1508, 1514), reales cedulas, CODOIN, Charlevoix, Moreau de Saint-Mery (parte francesa y parte espanola), Sanchez Valverde, Labat, Exquemelin, Du Tertre, tratados (Ryswick 1697, Aranjuez 1777, Basilea 1795), censos coloniales, correspondencia (AGI via PARES; ANOM). Siglos XIX-XXI: constituciones (1801, 1805, 1806, 1816, 1843, 1844, 1846, 1874, 1987, 2010), decretos y leyes (Linstant Pradine, Recueil general des lois et actes du gouvernement d'Haiti; Coleccion de leyes dominicana), Codigo Rural de 1826, Manifiesto del 16 de enero de 1844, Acta de Separacion, tratados (1874, 1929, 1936, 1938), FRUS, documentos del Departamento de Estado, informes de la Sociedad de Naciones, ONU, OEA, CIDH y Corte IDH, sentencias (TC/0168/13 y votos disidentes), leyes (169-14, 285-04), encuestas oficiales (ENI-2012, ENI-2017), memorias y prensa de epoca (Gaceta, Le Moniteur haitien). Portales: archive.org (texto en _djvu.txt), Gallica (texteBrut), HathiTrust (babel.hathitrust.org), Cervantes Virtual, BDH (bdh.bne.es), PARES (pares.mcu.es), ANOM, Wikisource es/fr/en, JCB (jcb.lunaimaging.com), manioc.org, history.state.gov, slavevoyages.org, dLOC, haitidoi.com, mjp.univ-perp.fr, pdba.georgetown.edu, corteidh.or.cr, tc.gob.do, bibliotecadelcongreso.gob.do, memoriahistorica.senadord.gob.do. Los textos ya descargados en 02-fuentes/textos/ se citan por archivo y linea (grep -n) y no se vuelven a buscar; si localizas un texto primario de dominio publico accesible en texto plano, da la URL exacta de descarga para la Fase 3.` },
  { key: 'internacional', nombre: 'ACADEMIA INTERNACIONAL (EE.UU., Europa, America Latina, Caribe)', guia: `Buscas monografias, articulos revisados por pares, tesis y resenas academicas de 1980-2026 sobre el modulo: James, Dubois, Geggus, Fick, Gaffield, Ferrer, Nessler, Yingling, Eller, Walker, Turits, Derby, Paulino, Cadeau, Matibag, Baud, S. Martinez, Mayes, Simmons, Roorda, Ponce Vazquez, Altman, Stone, Guitar, Pinto Tortosa, J. Gonzalez, Wigginton y Middleton, Blancpain, Candio, Gonzalez Canalda, Wucker, Reyes, Hayes de Kalaf, Howard, Wooding, Keegan y Hofman, Oliver, Wilson, Deagan, Anderson-Cordova, Livi-Bacci, Henige, Cook, Diamond y sus criticos, Scott, Garrigus, Ghachem, Popkin, Hoffnung-Garskof, Lundahl, Nicholls, Dayan, Sheller, Smith, Sepinwall, Sommer, Mintz. Portales: JSTOR (vistas previas y acceso abierto), Project MUSE, Duke UP, Cambridge, OUP, Springer, Taylor & Francis, Wiley, OAPEN y DOAB, Deep Blue, tesis abiertas (escholarship, digitalcommons, theses.fr, HAL, ProQuest open), Persee, Erudit, Redalyc, SciELO, Dialnet, CORE, Semantic Scholar (api.semanticscholar.org/graph/v1), Crossref (api.crossref.org/works?query=), Google Scholar, academia.edu, ResearchGate, H-Net Reviews, y revistas: HAHR, The Americas, Journal of Haitian Studies, NWIG, Caribbean Studies, Small Axe, Slavery & Abolition, JLAS, Revista de Indias, Anuario de Estudios Americanos, Caravelle, Outre-Mers, Memorias (Barranquilla). Prefiere acceso abierto y PDFs de autor; si una obra esta tras muro de pago, confirma la ficha editorial y registra una resena academica como acceso 'via-resena'. Nombra los sesgos de la academia internacional (anglofona, atlantica, revisionista) donde los veas.` },
  { key: 'cientifica', nombre: 'EVIDENCIA CIENTIFICA Y CUANTITATIVA', guia: `Buscas los estudios con datos: genetica de poblaciones y ADN antiguo (Fernandes 2021, Nagele 2020, Schroeder 2018, Nieves-Colon 2020, Sirak 2026, Moreno-Estrada 2013, Bryc 2010, Montinaro 2015, D'Atanasio 2020, Simms 2010 y 2012, Benn Torres, Martinez-Cruzado, Schurr 2026 / Proyecto Genoma Dominicano, Tajima 2004, Lalueza-Fox 2001), arqueologia (Keegan, Hofman, Curet, Oliver, Ulloa Hung, Herrera Malatesta, Samson, Deagan, Veloz Maggiolo, Ortega), demografia historica (Livi-Bacci, Cook y Borah, Rosenblat, Henige, Moya Pons, Verlinden, Zambardino, Denevan), epidemiologia (viruela de 1518), trata (slavevoyages.org: embarcados y desembarcados por region y periodo), censos y estadisticas (1606, 1785, 1789, 1920, 1935, 1950, 1960, ONE, IHSI, ENI-2012 y ENI-2017 en dominicanrepublic.unfpa.org), economia (Bulmer-Thomas, series de exportacion, deuda de 1825: Dubois, Henochsberg, NYT 2022), ecologia (deforestacion: Hedges 2018, FAO, Global Forest Watch; Diamond y sus criticos), linguistica (tainismos; Alba, Lipski), cifras de 1937 por autor, estadisticas de migracion y deportacion (OIM, ACNUR, DGM, CIDH), encuestas de actitudes (LAPOP, Latinobarometro). Portales: PMC, Nature, Science, PNAS, PLOS, Cell, bioRxiv, Reich Lab (reich.hms.harvard.edu), Leiden (scholarlypublications.universiteitleiden.nl), Europe PMC, Semantic Scholar, Crossref, ResearchGate, Dialnet, Boletin del Museo del Hombre Dominicano, Latin American Antiquity, Journal of Archaeological Science. Para cada cifra: autor, ano, metodo, muestra (n), rango e intervalo si lo hay; una cifra sin metodo ni muestra se degrada y se dice. Si tu lente tiene poco que aportar a este modulo, no rellenes: busca lo cuantitativo del periodo (censos, tamano de ejercitos, cifras economicas, estimaciones por autor) y declara la escasez en lagunas.` },
]

const REGLAS = `
REGLAS COMUNES DE LA FASE 2 (lee antes de empezar):
- Trabajas en el repositorio local ${REPO} (en la herramienta Bash es ${REPO_SH}). Rama ${RAMA}. Usa la herramienta Bash (Git Bash) para curl, grep, pdftotext, python y git; usa rutas POSIX (/c/Users/...) en Bash y rutas Windows en Read/Write/Grep/Glob.
- Lee primero ${REPO}\\01-metodologia\\metodo.md, escala-de-confianza.md y glosario.md, y la seccion 7 y la seccion 12 de ${REPO}\\00-plan\\plan.md. Son la regla; no las parafrasees en tu salida.
- Modo de acceso A: la red esta abierta. Toda URL que devuelvas debe haberse abierto en esta sesion con un fetch real (WebFetch para HTML; para PDF o textos largos: curl -sL -A "Mozilla/5.0" -o <archivo-en-tu-scratchpad> <url> y luego pdftotext (instalado) o python -X utf8 -m pypdf, y grep -n para localizar pasajes). Nunca inventes URLs, DOIs, paginas ni citas textuales. No uses Firecrawl (sin creditos) ni WebFetch para textos largos (trunca).
- Portales con bloqueo de robots (cervantesvirtual.com y babel.hathitrust.org devuelven 403 a curl; redalyc.org estaba caido el 2026-10-06): prueba primero WebFetch y, si tambien falla, registra la fuente con verificacion fallo-fetch y el codigo, sin inventar su contenido. Los PDF de Clio pueden pesar mas de 50 MB: descargalos a tu scratchpad, nunca al repositorio.
- Nada de memoria sin marca: lo confirmado en un fetch, un texto local o una busqueda se marca [VERIFICADO: fuente]; lo que recuerdas y no confirmaste se marca [POR VERIFICAR] y no lleva extracto ni URL. Un dato [POR VERIFICAR] nunca sube la fiabilidad de nada.
- Cifras siempre como rango con autor y base de la estimacion. Una cifra sin fuente primaria trazable se dice que lo es.
- Terminos cargados: usa los terminos descriptivos del glosario (periodo de gobierno haitiano de toda la isla, matanza de 1937, campana de Dessalines en el este, proclamacion del 27 de febrero de 1844...) y anota como nombra cada tradicion lo que describes; si encuentras un termino cargado que no esta en el glosario, devuelvelo en terminos_nuevos.
- Simetria: el mismo rigor para las fuentes de ambos relatos; no descartes una fuente por su tradicion; registra su sesgo en la ficha de proveniencia.
- Textos ya descargados y cotejables por linea en ${REPO}\\02-fuentes\\textos\\ (Las Casas 5 tomos, Pedro Martir vol. 1, Brevisima 1689, Franklin 1828, St John 1884, Schoenrich 1918, Elliott, Memoir 1799, Hale, Acta de 1804, FRUS 1861-1938): se citan por archivo y numero de linea (grep -n) y no se vuelven a buscar en linea.
- Presupuesto: cada agente tiene su tope de busquedas (WebSearch) indicado en su tarea; lleva la cuenta, no la superes, y devuelve cuantas usaste y que consultas planeadas no hiciste.
- Python: ejecuta siempre python -X utf8 (la consola de Windows no es UTF-8); al leer y escribir CSV usa el modulo csv con encoding='utf-8' y newline=''.
- Escribe en espanol; citas en idioma original con traduccion.
`

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const BUSQUEDA_SCHEMA = {
  type: 'object',
  properties: {
    archivo: { type: 'string', description: 'ruta del JSON escrito en 02-fuentes/por-modulo/raw/' },
    lente: { type: 'string' },
    modulo: { type: 'string' },
    n_fuentes: { type: 'number' },
    n_confirmadas: { type: 'number', description: 'fuentes con verificacion descargada-y-leida o descargada-parcial' },
    n_existentes_resueltas: { type: 'number', description: 'fuentes ya registradas (F-####) cuya URL confirmaste' },
    busquedas_usadas: { type: 'number' },
    busquedas_pendientes: { type: 'array', items: { type: 'string' } },
    lagunas: { type: 'array', items: { type: 'string' } },
    terminos_nuevos: { type: 'array', items: { type: 'object', properties: { termino: { type: 'string' }, tradicion: { type: 'string' }, nota: { type: 'string' } }, required: ['termino', 'tradicion', 'nota'] } },
    incidencias: { type: 'array', items: { type: 'string' } },
  },
  required: ['archivo', 'lente', 'modulo', 'n_fuentes', 'n_confirmadas', 'n_existentes_resueltas', 'busquedas_usadas', 'busquedas_pendientes', 'lagunas', 'terminos_nuevos', 'incidencias'],
}

const FUSION_SCHEMA = {
  type: 'object',
  properties: {
    archivo: { type: 'string' },
    n_fuentes: { type: 'number' },
    n_nuevas: { type: 'number' },
    n_existentes: { type: 'number' },
    n_cobertura: { type: 'number', description: 'pares afirmacion-fuente en el CSV de cobertura' },
    afirmaciones_cubiertas: { type: 'array', items: { type: 'string' } },
    afirmaciones_sin_fuente: { type: 'array', items: { type: 'string' } },
    terminos_nuevos: { type: 'array', items: { type: 'object', properties: { termino: { type: 'string' }, tradicion: { type: 'string' }, nota: { type: 'string' } }, required: ['termino', 'tradicion', 'nota'] } },
    lagunas: { type: 'array', items: { type: 'string' } },
    problemas: { type: 'array', items: { type: 'string' } },
  },
  required: ['archivo', 'n_fuentes', 'n_nuevas', 'n_existentes', 'n_cobertura', 'afirmaciones_cubiertas', 'afirmaciones_sin_fuente', 'terminos_nuevos', 'lagunas', 'problemas'],
}

const CRITICO_SCHEMA = {
  type: 'object',
  properties: {
    suficiente: { type: 'boolean' },
    resumen: { type: 'string' },
    faltantes: { type: 'array', items: { type: 'object', properties: {
      que_falta: { type: 'string' },
      lente: { type: 'string', enum: ['dominicana', 'haitiana', 'colonial-primaria', 'internacional', 'cientifica'] },
      consultas_sugeridas: { type: 'array', items: { type: 'string' } },
      afirmaciones: { type: 'array', items: { type: 'string' } },
      motivo: { type: 'string' },
    }, required: ['que_falta', 'lente', 'consultas_sugeridas', 'afirmaciones', 'motivo'] } },
    fuentes_dudosas: { type: 'array', items: { type: 'string' } },
    desequilibrio: { type: 'string', description: 'si una tradicion esta infrarrepresentada, cual y por que; vacio si no' },
    busquedas_usadas: { type: 'number' },
  },
  required: ['suficiente', 'resumen', 'faltantes', 'fuentes_dudosas', 'desequilibrio', 'busquedas_usadas'],
}

const REGISTRO_SCHEMA = {
  type: 'object',
  properties: {
    modulo: { type: 'string' },
    ids_nuevos_desde: { type: 'string' },
    ids_nuevos_hasta: { type: 'string' },
    n_nuevas: { type: 'number' },
    n_actualizadas: { type: 'number' },
    n_cobertura: { type: 'number' },
    total_registro: { type: 'number', description: 'filas de registro.csv tras el modulo' },
    commit: { type: 'string' },
    push_ok: { type: 'boolean' },
    problemas: { type: 'array', items: { type: 'string' } },
  },
  required: ['modulo', 'ids_nuevos_desde', 'ids_nuevos_hasta', 'n_nuevas', 'n_actualizadas', 'n_cobertura', 'total_registro', 'commit', 'push_ok', 'problemas'],
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const FORMATO_JSON_BUSCADOR = `FORMATO DEL JSON QUE ESCRIBES (un objeto): {"lente": "...", "modulo": "M##", "ronda": 1|2, "fecha": "${FECHA}", "busquedas_usadas": n, "busquedas_pendientes": ["consulta no hecha", ...], "lagunas": ["..."], "terminos_nuevos": [{"termino": "...", "tradicion": "...", "nota": "..."}], "fuentes": [ { "titulo": "...", "autor": "Apellido, Nombre; ...", "anio": "1972", "tipo": "primaria|secundaria|divulgacion|terciaria|cientifica|base-de-datos|portal", "idioma": "es|fr|en|ht|la", "tradicion": "dominicana|haitiana|espanola|francesa|internacional|cientifica|oficial-rd|oficial-haiti|oficial-eeuu|ninguna", "url": "https://...", "urls_alternativas": ["..."], "verificacion": "descargada-y-leida|descargada-parcial|solo-localizada|fallo-fetch", "http_status": "200", "formato": "html|pdf|txt|epub|xml", "acceso": "texto-descargado|texto-completo-en-linea|pdf-en-linea|fragmento-busqueda|via-resena|bajo-derechos|archivo-fisico|no-localizada|localizada-bloqueada", "fiabilidad": "alta|media|baja", "justificacion_fiabilidad": "una frase", "proveniencia": "quien, cuando, desde donde, para quien, con que interes, que sabia de primera mano (2-4 frases)", "extractos": [ { "ubicacion": "p. 17 | l. 1204 del txt | cap. III | #ancla", "cita_original": "<=60 palabras en idioma original", "traduccion": "al espanol si hace falta, si no vacio", "afirmaciones": ["A-###"] } ], "afirmaciones": ["A-###"], "modulos": ["M##", ...], "id_existente": "F-#### si ya esta en registro.csv, si no cadena vacia", "notas": "incluye aqui lo [POR VERIFICAR] y el sesgo conocido de la obra" } ] }. Valida el archivo con python -X utf8 -c "import json;json.load(open(r'<ruta>',encoding='utf-8'))" antes de terminar.`

function promptBuscador(m, lente, ronda, faltantes) {
  const max = ronda === 1 ? MAX_B1 : MAX_B2
  const raw = `${REPO}\\02-fuentes\\por-modulo\\raw\\${m.id}-r${ronda}-${lente.key}.json`
  const cabecera = ronda === 1
    ? `Eres el BUSCADOR con la lente ${lente.nombre} para el modulo ${m.id} (${m.periodo}). Guia del modulo: ${m.guia}\nEres ciego a los otros cuatro buscadores del modulo: no sabes que encuentran ellos; cubre tu lente a fondo.`
    : `Eres el BUSCADOR DE SEGUNDA RONDA con la lente ${lente.nombre} para el modulo ${m.id} (${m.periodo}). Guia del modulo: ${m.guia}\nLa primera ronda ya esta integrada en ${REPO}\\02-fuentes\\por-modulo\\${m.id}.md: leelo entero primero y NO repitas fuentes que ya estan ahi. El critico de completitud pide exactamente esto (busca solo esto, con las consultas sugeridas como punto de partida):\n${JSON.stringify(faltantes, null, 1)}`
  return `${REGLAS}
${cabecera}
${lente.guia}

PROCEDIMIENTO:
1. Lee las reglas (arriba). Lee las afirmaciones de tu modulo con: python -X utf8 -c "import csv;[print(r['id'],'|',r['nivel'],'|',r['enunciado'],'||FUENTES:',r['fuentes'],'||RESOLVERIA:',r['evidencia_resolutoria']) for r in csv.DictReader(open(r'${REPO}\\03-afirmaciones\\registro.csv',encoding='utf-8')) if r['modulo']=='${m.id}']". Lee las fuentes ya registradas para el modulo con el mismo truco sobre ${REPO}\\02-fuentes\\registro.csv filtrando '${m.id}' in r['modulos'].split(';') (fijate en id, autor, titulo, url, acceso). Lee la parte de tu modulo y de tu lente en ${REPO}\\00-plan\\reconocimiento\\fuentes.md e historiografia.md (grep -n "${m.id}" y por autores).
2. Dos objetivos: (a) ENCONTRAR fuentes de tu lente que toquen las afirmaciones del modulo, priorizando lo que pide la columna RESOLVERIA de cada afirmacion; (b) RESOLVER las fuentes ya registradas de tu lente para este modulo que esten en acceso 'localizada-bloqueada', 'no-localizada' o 'fragmento-busqueda': localiza su URL real, confirmala con fetch, extrae, y devuelvelas con id_existente = su F-####.
3. Planifica hasta ${max} busquedas (WebSearch). Varia idiomas y operadores site:. Lleva la cuenta exacta.
4. CONFIRMA CADA URL con un fetch antes de incluirla (regla de modo A). verificacion = descargada-y-leida (leiste el texto o la parte relevante), descargada-parcial (bajaste pero solo leiste un fragmento o resumen), solo-localizada (la pagina existe pero el contenido esta tras muro de pago o es solo ficha), fallo-fetch (error, bloqueo o redireccion no seguida; incluye el codigo). Una URL que no abriste no se devuelve como confirmada.
5. Para cada fuente: proveniencia breve, fiabilidad con justificacion de una frase, tipo, tradicion, acceso y EXTRACTOS: citas textuales cortas (60 palabras o menos) en idioma original con ubicacion precisa, traduccion al espanol si hace falta, y las afirmaciones A-### que toca cada extracto. Las cifras, con autor y base. Separa en tus notas hecho, interpretacion y significado cuando la fuente los mezcla.
6. Objetivo de volumen en la ronda 1: entre 12 y 40 fuentes confirmadas; en la ronda 2, las que pide el critico. Calidad antes que cantidad: una primaria localizada con cita vale mas que diez fichas editoriales.
7. Escribe tu resultado completo en ${raw} (crea la carpeta raw si no existe). No escribas ningun otro archivo del repositorio. Puedes guardar descargas en tu scratchpad.
${FORMATO_JSON_BUSCADOR}
8. Devuelve la salida estructurada (archivo, lente, modulo, n_fuentes, n_confirmadas, n_existentes_resueltas, busquedas_usadas, busquedas_pendientes, lagunas, terminos_nuevos, incidencias).`
}

const ESTRUCTURA_MD = `ESTRUCTURA EXACTA DE M##.md:
# M## (periodo): bibliografia anotada de la Fase 2
Parrafo de 100-150 palabras: fecha, rondas, buscadores, fuentes totales (nuevas y ya registradas), afirmaciones cubiertas sobre el total del modulo, lagunas principales.
## 1. Tabla de fuentes
| Id | Tipo | Autor | Titulo | Ano | Idioma | Tradicion | Lente | Verificacion | Acceso | Fiabilidad | Afirmaciones |
(Id = F-#### si ya existe en registro.csv; si no, provisional M##-N01, M##-N02... en orden de aparicion; una fila por fuente; ordenadas por tipo: primaria, cientifica, secundaria, divulgacion, base-de-datos, portal, terciaria, y dentro por ano)
## 2. Fichas
### Id. Autor, Titulo (ano)
- Proveniencia: ...
- Acceso: URL | formato | verificacion | fecha de consulta ${FECHA} | URLs alternativas
- Fiabilidad: alta/media/baja. Justificacion.
- Sesgo conocido y quien la usa: ...
| Ubicacion | Cita original | Traduccion | Afirmaciones |
(tabla de extractos; si no hay extractos, una linea "Sin extracto: ..." con el motivo)
- Notas: ... (incluye lo [POR VERIFICAR])
## 3. Matriz afirmacion-fuentes
| Afirmacion | Enunciado corto | Fuentes | Mejor verificacion disponible | Observacion |
(todas las afirmaciones del modulo, cubiertas o no)
## 4. Afirmaciones sin fuente localizada
Lista con el id, que pedia la columna evidencia_resolutoria y que se intento.
## 5. Terminos cargados detectados
Tabla termino | tradicion | nota (los que no esten ya en el glosario).
## 6. Lagunas y busquedas pendientes
Por lente: lo buscado y no hallado, y las consultas planeadas y no ejecutadas.
## 7. Registro del barrido
Ronda 1: por lente, busquedas usadas, fuentes aportadas, incidencias. Critico: veredicto y faltantes. Ronda 2 (si hubo): por lente, busquedas y fuentes. Problemas de fusion (contradicciones entre buscadores, fuentes degradadas).`

function promptFusion(m, archivosRaw, ronda, faltantes) {
  const md = `${REPO}\\02-fuentes\\por-modulo\\${m.id}.md`
  const base = `${REPO}\\02-fuentes\\por-modulo\\${m.id}`
  const cabecera = ronda === 1
    ? `Eres el FUSIONADOR del modulo ${m.id} (${m.periodo}). Cinco buscadores ciegos entre si han escrito sus resultados en estos JSON: ${archivosRaw.join(' ; ')}. Leelos enteros (python -X utf8 con json). ANTES DE ESCRIBIR: comprueba si ya existe ${md} de una corrida anterior. Si existe, NO lo sustituyas ni lo borres: integra los JSON como una ronda adicional conservando todas sus fichas, sus ids F-#### definitivos y sus secciones (los ids provisionales nuevos continuan la numeracion M##-Nxx desde el ultimo usado), y anota la nueva ronda en la seccion 7. Lo mismo con los CSV auxiliares si existen: se amplian, no se reemplazan.`
    : `Eres el FUSIONADOR DE SEGUNDA RONDA del modulo ${m.id} (${m.periodo}). Ya existe ${md} con la ronda 1 y los archivos ${base}.nuevas.csv, ${base}.existentes.csv y ${base}.cobertura.csv. Los buscadores de la segunda ronda han escrito: ${archivosRaw.join(' ; ')}. Integra la ronda 2 en los cuatro archivos SIN perder nada de la ronda 1: continua la numeracion provisional (M##-Nxx) donde quedo, anade filas, actualiza las secciones 1 a 7 y escribe en la seccion 6 las peticiones del critico que siguen sin resolverse. Peticiones del critico (JSON): ${JSON.stringify(faltantes, null, 1)}`
  return `${REGLAS}
${cabecera}

TAREAS:
1. Lee ${REPO}\\02-fuentes\\registro.csv completo (id, autor, titulo, url) para saber que existe ya.
2. Deduplica: misma obra (autor + titulo + ano, misma URL normalizada o mismo DOI) = una ficha; fusiona extractos y afirmaciones; conserva la URL mejor verificada y anota las alternativas. Si una fuente ya tiene F-#### en el registro (por id_existente o porque la reconoces en registro.csv), usa ese id y cuentala como existente; si no, asignale id provisional ${m.id}-N01, N02... en orden de aparicion.
3. Control de calidad: una fuente marcada descargada-y-leida sin extractos se degrada a solo-localizada y se anota en problemas; si dos buscadores dan datos contradictorios de una misma obra (ano, autor, editorial), anotalo en problemas y deja el dato mejor verificado; una cita sin ubicacion se conserva pero se marca [POR VERIFICAR: sin ubicacion]. No anadas nada de tu memoria.
4. Escribe ${md} con la estructura exacta de abajo.
5. Escribe ${base}.nuevas.csv con cabecera id_provisional,tipo,autor,titulo,anio,idioma,tradicion,modulos,url,acceso,fiabilidad,notas (una fila por fuente nueva; modulos separados por ';' incluyendo ${m.id}; notas = proveniencia y fiabilidad en una frase, afirmaciones A-### que toca, verificacion y fecha ${FECHA}).
6. Escribe ${base}.existentes.csv con cabecera id,url,acceso,fiabilidad,modulos,notas (solo fuentes ya registradas con algo nuevo: URL confirmada, acceso mejor, extractos; modulos = los que ahora se sabe que toca, separados por ';').
7. Escribe ${base}.cobertura.csv con cabecera afirmacion,fuente,modulo,verificacion,ubicacion (una fila por par afirmacion-fuente; fuente = F-#### o id provisional; verificacion = la de la fuente; ubicacion = la del extracto que la toca, o vacio).
8. Valida los tres CSV con python -X utf8 (modulo csv, encoding='utf-8', newline='': mismo numero de columnas en todas las filas) y comprueba que cada id provisional del .md aparece en nuevas.csv y viceversa.
Valores permitidos: acceso = texto-descargado | texto-completo-en-linea | pdf-en-linea | fragmento-busqueda | via-resena | bajo-derechos | archivo-fisico | no-localizada | localizada-bloqueada; tipo = primaria | secundaria | divulgacion | terciaria | cientifica | base-de-datos | portal; tradicion = dominicana | haitiana | espanola | francesa | internacional | cientifica | oficial-rd | oficial-haiti | oficial-eeuu | ninguna; fiabilidad = alta | media | baja.
${ESTRUCTURA_MD}
Devuelve la salida estructurada (archivo, n_fuentes, n_nuevas, n_existentes, n_cobertura, afirmaciones_cubiertas, afirmaciones_sin_fuente, terminos_nuevos, lagunas, problemas).`
}

function promptCritico(m) {
  const md = `${REPO}\\02-fuentes\\por-modulo\\${m.id}.md`
  return `${REGLAS}
Eres el CRITICO DE COMPLETITUD del modulo ${m.id} (${m.periodo}). Guia del modulo: ${m.guia}
Lee entero ${md}; las afirmaciones del modulo (python -X utf8 sobre ${REPO}\\03-afirmaciones\\registro.csv filtrando modulo == '${m.id}', fijate en evidencia_resolutoria); las secciones 7, 9 y 12 de ${REPO}\\00-plan\\plan.md; lo que los tres informes de ${REPO}\\00-plan\\reconocimiento\\ dicen de este modulo (grep -n "${m.id}"); y los JSON de los buscadores en ${REPO}\\02-fuentes\\por-modulo\\raw\\${m.id}-r1-*.json (sus lagunas y busquedas pendientes).
Pregunta y responde con evidencia:
(1) Que afirmaciones del modulo siguen sin una fuente que pueda resolverlas, sobre todo las que piden una primaria concreta (documento, articulo de constitucion, decreto, censo, estudio con n).
(2) Simetria: esta alguna tradicion (dominicana, haitiana) infrarrepresentada respecto a la otra en numero, en primarias o en calidad de verificacion? Y la academia internacional y la evidencia cientifica?
(3) Que fuentes nombradas para este modulo en la seccion 12 del plan o en los informes de reconocimiento no aparecen en M##.md ni como localizadas ni como fallidas?
(4) Falta alguna version rival de una disputa de la seccion 9 que caiga en este modulo?
(5) Silencios: faltan voces (tainos, esclavizados, cimarrones, mujeres, rayanos, campesinos, migrantes, Iglesia, comerciantes extranjeros, soldados rasos) que existan en fuentes localizables?
(6) Fuentes dudosas: extracto que no cuadra con la obra, URL generica o de portada, cita sin ubicacion, fiabilidad alta sin justificacion, fecha o autor incoherente.
Usa hasta 40 busquedas (WebSearch) y los fetch que necesites para comprobar que lo que pides existe en linea y donde (no pidas lo que no existe). suficiente = true solo si las afirmaciones sin fuente son el 10% o menos del modulo y no hay desequilibrio grave entre tradiciones. En faltantes, cada entrada lleva la lente que debe buscarla (una de: dominicana, haitiana, colonial-primaria, internacional, cientifica), consultas concretas (con site:, idioma, autor, titulo) y las afirmaciones afectadas. Se concreto y breve: maximo 15 faltantes, las mas importantes primero. No escribas archivos.`
}

function promptRegistro(m, fusion) {
  const base = `${REPO}\\02-fuentes\\por-modulo\\${m.id}`
  const resumen = fusion ? `Resumen del fusionador: ${fusion.n_fuentes} fuentes, ${fusion.n_nuevas} nuevas, ${fusion.n_existentes} existentes, ${fusion.n_cobertura} pares de cobertura; problemas: ${JSON.stringify(fusion.problemas)}` : 'Sin resumen del fusionador.'
  return `${REGLAS}
Eres el REGISTRADOR del modulo ${m.id}. Trabajas EN SERIE: ningun otro registrador toca registro.csv, cobertura.csv ni git mientras tu trabajas, pero otros modulos pueden haber anadido filas desde que se escribio tu modulo, asi que relee todo. ${resumen}
PASOS:
1. En Bash: cd "${REPO_SH}" && git status --short (solo deben aparecer archivos de 02-fuentes/por-modulo/, 02-fuentes/registro.csv o 03-afirmaciones/cobertura.csv; si hay otra cosa, no la toques y reportala). Otros modulos en vuelo dejan archivos sin confirmar en 02-fuentes/por-modulo/: no los toques, no hagas stash, checkout, restore ni clean. Luego git fetch origin ${RAMA} y compara git rev-parse HEAD con git rev-parse origin/${RAMA}: si coinciden, sigue; si origin va por delante y el arbol esta limpio, git pull --rebase origin ${RAMA}; si origin va por delante y el arbol esta sucio, anotalo en problemas y sigue sin pull.
2. Lee ${REPO}\\02-fuentes\\registro.csv con python -X utf8 (csv, utf-8, newline=''): ultimo id (maximo numerico de F-####), indice por URL normalizada (sin esquema, sin barra final, minusculas) y por autor+titulo normalizados.
3. Lee ${base}.nuevas.csv. Para cada fila: si ya existe en el registro (misma URL normalizada, o mismo autor+titulo+ano) NO crees fila: usa el id existente, anade ${m.id} a su columna modulos si falta y mejora url/acceso si lo nuevo esta verificado; si no existe, asignale el siguiente F-#### correlativo (cuatro digitos, sin huecos, sin renumerar nada) y anade la fila con las 12 columnas id,tipo,autor,titulo,anio,idioma,tradicion,modulos,url,acceso,fiabilidad,notas.
4. Lee ${base}.existentes.csv y actualiza esas filas: rellena url vacia o sustituye una URL no verificada por la verificada; acceso solo mejora (p. ej. localizada-bloqueada -> pdf-en-linea; nunca al reves); anade modulos; anade al final de notas " | F2 ${FECHA}: <que se confirmo>". Nunca borres filas, nunca cambies un id, nunca reordenes.
5. Construye el mapa id provisional -> F-#### definitivo y sustituyelo en ${base}.md y en ${base}.cobertura.csv (busca con grep que no quede ningun '${m.id}-N'). Anade las filas de ${base}.cobertura.csv a ${REPO}\\03-afirmaciones\\cobertura.csv (crealo con cabecera afirmacion,fuente,modulo,verificacion,ubicacion,fecha si no existe; anade la columna fecha = ${FECHA}; no dupliques pares afirmacion-fuente ya presentes).
6. Valida con python -X utf8: registro.csv con 12 columnas en todas las filas, ids unicos y correlativos F-0001..F-NNNN sin huecos, utf-8; cobertura.csv con 6 columnas; ${base}.md sin ids provisionales. Si algo falla, corrigelo antes de seguir; si no puedes, no hagas commit y reportalo.
7. Borra ${base}.nuevas.csv, ${base}.existentes.csv y ${base}.cobertura.csv (ya integrados). Conserva la carpeta raw/.
8. En Bash, SOLO los archivos de este modulo (nunca la carpeta 02-fuentes/por-modulo entera, que puede contener trabajo a medias de otros modulos): git add -- 02-fuentes/por-modulo/${m.id}.md 02-fuentes/registro.csv 03-afirmaciones/cobertura.csv; git add -- 02-fuentes/por-modulo/raw/${m.id}-*.json; y si git ls-files muestra como rastreados los CSV auxiliares de este modulo (${m.id}.nuevas.csv, ${m.id}.existentes.csv, ${m.id}.cobertura.csv), stagea su borrado con git rm -q --cached -- <esos archivos>. Despues git commit -m "Fase 2: barrido de fuentes ${m.id} (<n> nuevas, <k> actualizadas, <c> pares de cobertura)" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && git push origin ${RAMA}. Si el push falla: git pull --rebase origin ${RAMA} y reintenta una vez; si vuelve a fallar, deja el commit local y reportalo en problemas.
Devuelve la salida estructurada (modulo, ids_nuevos_desde, ids_nuevos_hasta, n_nuevas, n_actualizadas, n_cobertura, total_registro, commit = hash corto, push_ok, problemas).`
}

// ---------------------------------------------------------------------------
// Orquestacion
// ---------------------------------------------------------------------------

// Mutex para la etapa de registro (ids correlativos, un solo commit a la vez)
let colaRegistro = null
function enSerie(fn) {
  const p = colaRegistro ? colaRegistro.then(() => fn(), () => fn()) : fn()
  colaRegistro = p.then(() => {}, () => {})
  return p
}

function agruparPorLente(faltantes) {
  const claves = LENTES.map(l => l.key)
  const grupos = {}
  for (const f of faltantes) {
    const k = claves.includes(f.lente) ? f.lente : 'internacional'
    if (!grupos[k]) grupos[k] = []
    grupos[k].push(f)
  }
  return grupos
}

async function procesarModulo(id) {
  const m = Object.assign({ id }, MODULOS[id])
  const out = { modulo: id, ronda1: [], critico: null, ronda2: [], fusion: null, registro: null, estado: 'ok' }

  let fusion = null
  if (REGISTRAR_SOLO.includes(id)) {
    log(`${id}: reanudacion: se omiten busqueda y fusion (ya existen ${id}.md y sus CSV auxiliares de una corrida anterior); corren critico, segunda ronda si hace falta y registrador`)
  } else {
    log(`${id}: ronda 1, cinco buscadores (tope ${MAX_B1} busquedas cada uno)`)
    const r1 = await parallel(LENTES.map(l => () =>
      agent(promptBuscador(m, l, 1, null), opt('buscador', { label: `${id}:r1:${l.key}`, phase: 'Busqueda', schema: BUSQUEDA_SCHEMA }))))
    out.ronda1 = r1.filter(Boolean)
    if (!out.ronda1.length) { out.estado = 'fallo-busqueda'; log(`${id}: ningun buscador termino; modulo omitido`); return out }
    const fuentes1 = out.ronda1.reduce((s, r) => s + (r.n_fuentes || 0), 0)
    const busq1 = out.ronda1.reduce((s, r) => s + (r.busquedas_usadas || 0), 0)
    log(`${id}: ronda 1 terminada: ${out.ronda1.length}/5 buscadores, ${fuentes1} fuentes, ${busq1} busquedas`)
    if (out.ronda1.length < 5) log(`${id}: AVISO: ${5 - out.ronda1.length} buscador(es) no devolvieron resultado; el critico lo vera como laguna`)

    fusion = await agent(promptFusion(m, out.ronda1.map(r => r.archivo), 1, null),
      opt('fusionador', { label: `${id}:fusion`, phase: 'Fusion', schema: FUSION_SCHEMA }))
    if (!fusion) { out.estado = 'fallo-fusion'; log(`${id}: el fusionador no termino; modulo sin registrar`); return out }
    log(`${id}: fusion: ${fusion.n_fuentes} fuentes (${fusion.n_nuevas} nuevas, ${fusion.n_existentes} existentes); ${fusion.afirmaciones_cubiertas.length} afirmaciones cubiertas, ${fusion.afirmaciones_sin_fuente.length} sin fuente`)
  }

  const critico = await agent(promptCritico(m),
    opt('critico', { label: `${id}:critico`, phase: 'Completitud', schema: CRITICO_SCHEMA, effort: 'high' }))
  out.critico = critico
  if (critico && !critico.suficiente && critico.faltantes.length) {
    const grupos = agruparPorLente(critico.faltantes)
    const lentes2 = Object.keys(grupos)
    log(`${id}: critico pide segunda ronda: ${critico.faltantes.length} faltantes en ${lentes2.length} lente(s): ${lentes2.join(', ')}`)
    const r2 = await parallel(lentes2.map(k => () =>
      agent(promptBuscador(m, LENTES.find(l => l.key === k), 2, grupos[k]), opt('buscador', { label: `${id}:r2:${k}`, phase: 'Completitud', schema: BUSQUEDA_SCHEMA }))))
    out.ronda2 = r2.filter(Boolean)
    if (out.ronda2.length) {
      const fusion2 = await agent(promptFusion(m, out.ronda2.map(r => r.archivo), 2, critico.faltantes),
        opt('fusionador', { label: `${id}:fusion-2`, phase: 'Completitud', schema: FUSION_SCHEMA }))
      if (fusion2) { fusion = fusion2; log(`${id}: fusion 2: ${fusion.n_fuentes} fuentes, ${fusion.afirmaciones_sin_fuente.length} sin fuente`) }
      else log(`${id}: AVISO: el fusionador de la ronda 2 no termino; se registra solo la ronda 1`)
    } else log(`${id}: AVISO: ningun buscador de la ronda 2 termino; se registra solo la ronda 1`)
  } else if (critico) {
    log(`${id}: critico: suficiente (${critico.resumen})`)
  } else {
    log(`${id}: AVISO: el critico no termino; se registra la ronda 1 sin segunda ronda`)
  }
  out.fusion = fusion

  const registro = await enSerie(() => agent(promptRegistro(m, fusion),
    opt('registrador', { label: `${id}:registro`, phase: 'Registro', schema: REGISTRO_SCHEMA })))
  out.registro = registro
  if (!registro) { out.estado = 'fallo-registro'; log(`${id}: el registrador no termino; revisar a mano`); return out }
  log(`${id}: registrado ${registro.ids_nuevos_desde}..${registro.ids_nuevos_hasta} (${registro.n_nuevas} nuevas, ${registro.n_actualizadas} actualizadas, registro con ${registro.total_registro} filas); commit ${registro.commit}; push ${registro.push_ok ? 'ok' : 'FALLO'}`)
  if (registro.problemas && registro.problemas.length) log(`${id}: problemas de registro: ${registro.problemas.join(' | ')}`)
  return out
}

// Pool de trabajadores: EN_VUELO modulos a la vez, en el orden de prioridad; cada modulo termina (y hace push) antes de que su trabajador tome el siguiente
const pendientes = MODULOS_A_CORRER.slice()
const resultados = []
async function trabajador(n) {
  while (pendientes.length) {
    const id = pendientes.shift()
    if (!MODULOS[id]) { log(`modulo desconocido: ${id}`); continue }
    try { resultados.push(await procesarModulo(id)) }
    catch (e) { log(`${id}: error de orquestacion: ${e && e.message}`); resultados.push({ modulo: id, estado: 'error', detalle: String(e && e.message) }) }
  }
}
log(`Fase 2: ${MODULOS_A_CORRER.length} modulos en este orden: ${MODULOS_A_CORRER.join(', ')}; ${EN_VUELO} en vuelo; fecha ${FECHA}; modelos por rol: ${JSON.stringify(MODELOS)}`)
await parallel(Array.from({ length: Math.min(EN_VUELO, MODULOS_A_CORRER.length) }, (_, i) => () => trabajador(i)))

const resumen = resultados.map(r => ({
  modulo: r.modulo,
  estado: r.estado,
  buscadores_r1: r.ronda1 ? r.ronda1.length : 0,
  busquedas: (r.ronda1 || []).concat(r.ronda2 || []).reduce((s, x) => s + (x.busquedas_usadas || 0), 0) + (r.critico ? (r.critico.busquedas_usadas || 0) : 0),
  segunda_ronda: r.ronda2 ? r.ronda2.length : 0,
  fuentes: r.fusion ? r.fusion.n_fuentes : 0,
  nuevas: r.registro ? r.registro.n_nuevas : 0,
  actualizadas: r.registro ? r.registro.n_actualizadas : 0,
  sin_fuente: r.fusion ? r.fusion.afirmaciones_sin_fuente : [],
  lagunas: r.fusion ? r.fusion.lagunas : [],
  terminos_nuevos: r.fusion ? r.fusion.terminos_nuevos : [],
  commit: r.registro ? r.registro.commit : '',
  push_ok: r.registro ? r.registro.push_ok : false,
  problemas: (r.registro ? r.registro.problemas : []).concat(r.fusion ? r.fusion.problemas : []),
}))
const totalAgentes = resultados.reduce((s, r) => s + (r.ronda1 ? r.ronda1.length : 0) + (r.fusion ? 1 : 0) + (r.critico ? 1 : 0) + (r.ronda2 ? r.ronda2.length + (r.ronda2.length ? 1 : 0) : 0) + (r.registro ? 1 : 0), 0)
log(`Fase 2 terminada: ${resultados.length} modulos, ~${totalAgentes} agentes que devolvieron resultado`)
return { modulos: resumen, orden: MODULOS_A_CORRER, en_vuelo: EN_VUELO, modelos: MODELOS, fecha: FECHA }
