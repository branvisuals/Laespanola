export const meta = {
  name: 'fase2-consolidacion',
  description: 'Consolidacion de cierre de la Fase 2: jueces de duplicados, reintento de accesos, busqueda de simetria, glosario, limites y muestra de control',
  phases: [
    { title: 'Duplicados', detail: 'jueces por lotes de grupos candidatos' },
    { title: 'Acceso', detail: 'reintentadores de fuentes sin leer' },
    { title: 'Simetria', detail: 'dos buscadores dirigidos y un registrador' },
    { title: 'Glosario', detail: 'tres agrupadores por periodo y un editor' },
    { title: 'Limites', detail: 'tres extractores por periodo y un redactor' },
    { title: 'Muestra', detail: 'tres verificadores de citas' },
  ],
}

// Insumos: los genera 00-plan/workflows/herramientas/diagnostico_consolidacion.py en 02-fuentes/consolidacion/.
// Las decisiones de los jueces y de los reintentadores NO se aplican aqui: las aplica un script Python
// (aplicar_consolidacion.py) despues, con el resultado estructurado de este Workflow. Lo que si escribe el Workflow:
// los CSV de candidatos del glosario, el glosario definitivo, los extractos de lagunas, 07-sintesis/limites.md,
// la adenda de simetria y las filas nuevas del registro y la cobertura que aporte la simetria.
//
// args.fecha (YYYY-MM-DD), args.modelos {juez, reintentador, buscador, registrador, agrupador, editor, extractor, redactor, verificador},
// args.lotes_duplicados (por defecto 4), args.lotes_acceso (por defecto 7), args.max_busquedas_simetria (80), args.max_busquedas_reintento (40)
// args.solo: para repetir solo una parte (p. ej. agentes caidos por error de servidor), sin tocar el resto:
//   { jueces: false, acceso_lotes: [1, 3], simetria: ["haitiana"], glosario: false, limites: "redactor" | false, muestra_lotes: [3] }
//   Los numeros de lote conservan el reparto original (lote n de LOTES), asi que cubren exactamente las mismas filas.

const REPO = 'C:\\Users\\branl\\OneDrive\\Desktop\\Claude\\La Espanola'
const REPO_SH = '/c/Users/branl/OneDrive/Desktop/Claude/La Espanola'
const RAMA = 'claude/hispaniola-historical-research-plan-79fana'
const CONS = `${REPO}\\02-fuentes\\consolidacion`
const FECHA = (args && args.fecha) || '2026-10-07'
const MODELOS = (args && args.modelos) || {}
const opt = (rol, extra) => Object.assign({}, MODELOS[rol] ? { model: MODELOS[rol] } : {}, extra)
const LOTES_DUP = (args && args.lotes_duplicados) || 4
const LOTES_ACC = (args && args.lotes_acceso) || 7
const MAX_SIM = (args && args.max_busquedas_simetria) || 80
const MAX_REI = (args && args.max_busquedas_reintento) || 40
const SOLO = (args && args.solo) || null
const LOTES_ACC_LISTA = (SOLO && Array.isArray(SOLO.acceso_lotes)) ? SOLO.acceso_lotes : Array.from({ length: LOTES_ACC }, (_, i) => i + 1)
const LENTES_SIM = (SOLO && Array.isArray(SOLO.simetria)) ? SOLO.simetria : ['haitiana', 'dominicana']
const MUESTRA_LOTES = (SOLO && Array.isArray(SOLO.muestra_lotes)) ? SOLO.muestra_lotes : [1, 2, 3]

const REGLAS = `
REGLAS COMUNES (lee antes de empezar):
- Trabajas en el repositorio local ${REPO} (en Bash: ${REPO_SH}), rama ${RAMA}. Usa Bash (Git Bash) para curl, grep, pdftotext, python y git, con rutas POSIX; rutas Windows en Read/Write/Grep/Glob. Python siempre con -X utf8; CSV con el modulo csv, encoding='utf-8', newline=''.
- Lee primero ${REPO}\\01-metodologia\\metodo.md, escala-de-confianza.md y glosario.md. Los insumos de esta consolidacion estan en ${CONS}\\ (ver su README.md).
- Modo de acceso A: toda URL que des por valida la has abierto en esta sesion (WebFetch para HTML; curl -sL -A "Mozilla/5.0" -o <scratchpad> para PDF y textos largos, luego pdftotext o python -m pypdf y grep -n). Nunca inventes URLs, DOIs, paginas ni citas. Lo no confirmado se marca [POR VERIFICAR]. No uses Firecrawl.
- Simetria: el mismo rigor para ambas tradiciones. Terminos cargados en forma descriptiva, con el nombre que les da cada lado.
- NO modifiques ${REPO}\\02-fuentes\\registro.csv, ${REPO}\\03-afirmaciones\\cobertura.csv ni ningun ${REPO}\\02-fuentes\\por-modulo\\M##.md salvo que tu tarea lo diga expresamente. No hagas commit ni push salvo que tu tarea lo diga. Otros agentes trabajan a la vez en el mismo repositorio.
- Escribe en espanol; citas en idioma original con traduccion.
`

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const JUEZ_SCHEMA = {
  type: 'object',
  properties: {
    lote: { type: 'number' },
    decisiones: { type: 'array', items: { type: 'object', properties: {
      grupo: { type: 'number' },
      veredicto: { type: 'string', enum: ['misma-obra', 'obras-distintas', 'mixto', 'dudoso'] },
      canonico: { type: 'string', description: 'F-#### que se conserva como ficha principal cuando hay misma obra (el id mas bajo salvo razon expresa); vacio si obras-distintas' },
      duplicados: { type: 'array', items: { type: 'string' }, description: 'F-#### que son la misma obra que el canonico' },
      subgrupos: { type: 'array', items: { type: 'object', properties: { canonico: { type: 'string' }, duplicados: { type: 'array', items: { type: 'string' } } }, required: ['canonico', 'duplicados'] }, description: 'solo para veredicto mixto: varios conjuntos de misma obra dentro del grupo' },
      url_canonica: { type: 'string', description: 'la mejor URL verificada para el canonico, o vacio' },
      motivo: { type: 'string' },
    }, required: ['grupo', 'veredicto', 'canonico', 'duplicados', 'subgrupos', 'url_canonica', 'motivo'] } },
    incidencias: { type: 'array', items: { type: 'string' } },
  },
  required: ['lote', 'decisiones', 'incidencias'],
}

const REINTENTO_SCHEMA = {
  type: 'object',
  properties: {
    lote: { type: 'number' },
    busquedas_usadas: { type: 'number' },
    resultados: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      resultado: { type: 'string', enum: ['leida', 'parcial', 'localizada-sin-texto', 'no-localizada', 'inexistente-o-erronea'] },
      url: { type: 'string', description: 'URL verificada (abierta en esta sesion) o vacio' },
      acceso: { type: 'string', enum: ['texto-completo-en-linea', 'pdf-en-linea', 'texto-descargado', 'fragmento-busqueda', 'via-resena', 'bajo-derechos', 'archivo-fisico', 'no-localizada', 'localizada-bloqueada'] },
      http_status: { type: 'string' },
      extractos: { type: 'array', items: { type: 'object', properties: { ubicacion: { type: 'string' }, cita_original: { type: 'string' }, traduccion: { type: 'string' }, afirmaciones: { type: 'array', items: { type: 'string' } } }, required: ['ubicacion', 'cita_original', 'traduccion', 'afirmaciones'] } },
      nota: { type: 'string' },
    }, required: ['id', 'resultado', 'url', 'acceso', 'http_status', 'extractos', 'nota'] } },
  },
  required: ['lote', 'busquedas_usadas', 'resultados'],
}

const BUSQUEDA_SCHEMA = {
  type: 'object',
  properties: {
    archivo: { type: 'string' }, lente: { type: 'string' }, n_fuentes: { type: 'number' }, n_confirmadas: { type: 'number' },
    afirmaciones_cubiertas: { type: 'array', items: { type: 'string' } }, afirmaciones_sin_fuente: { type: 'array', items: { type: 'string' } },
    busquedas_usadas: { type: 'number' }, busquedas_pendientes: { type: 'array', items: { type: 'string' } }, lagunas: { type: 'array', items: { type: 'string' } },
    incidencias: { type: 'array', items: { type: 'string' } },
  },
  required: ['archivo', 'lente', 'n_fuentes', 'n_confirmadas', 'afirmaciones_cubiertas', 'afirmaciones_sin_fuente', 'busquedas_usadas', 'busquedas_pendientes', 'lagunas', 'incidencias'],
}

const REGISTRO_SCHEMA = {
  type: 'object',
  properties: {
    ids_nuevos_desde: { type: 'string' }, ids_nuevos_hasta: { type: 'string' }, n_nuevas: { type: 'number' }, n_actualizadas: { type: 'number' },
    n_cobertura: { type: 'number' }, total_registro: { type: 'number' }, commit: { type: 'string' }, push_ok: { type: 'boolean' }, problemas: { type: 'array', items: { type: 'string' } },
  },
  required: ['ids_nuevos_desde', 'ids_nuevos_hasta', 'n_nuevas', 'n_actualizadas', 'n_cobertura', 'total_registro', 'commit', 'push_ok', 'problemas'],
}

const ARCHIVO_SCHEMA = {
  type: 'object',
  properties: { archivo: { type: 'string' }, n_filas: { type: 'number' }, n_descartadas: { type: 'number' }, notas: { type: 'array', items: { type: 'string' } } },
  required: ['archivo', 'n_filas', 'n_descartadas', 'notas'],
}

const GLOSARIO_SCHEMA = {
  type: 'object',
  properties: { archivo: { type: 'string' }, filas_antes: { type: 'number' }, filas_despues: { type: 'number' }, filas_editadas: { type: 'number' }, descartados: { type: 'number' }, dudas: { type: 'array', items: { type: 'string' } } },
  required: ['archivo', 'filas_antes', 'filas_despues', 'filas_editadas', 'descartados', 'dudas'],
}

const VERIFICACION_SCHEMA = {
  type: 'object',
  properties: {
    lote: { type: 'number' },
    resultados: { type: 'array', items: { type: 'object', properties: {
      n: { type: 'number' }, afirmacion: { type: 'string' }, fuente: { type: 'string' },
      veredicto: { type: 'string', enum: ['literal', 'aproximada', 'no-encontrada', 'fuente-inaccesible', 'ubicacion-erronea'] },
      cita_en_ficha: { type: 'string' }, cita_hallada: { type: 'string' }, ubicacion_real: { type: 'string' }, nota: { type: 'string' },
    }, required: ['n', 'afirmacion', 'fuente', 'veredicto', 'cita_en_ficha', 'cita_hallada', 'ubicacion_real', 'nota'] } },
  },
  required: ['lote', 'resultados'],
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
const PERIODOS = [
  { key: 'colonial', nombre: 'colonial y marco (M00 a M05)', modulos: ['M00', 'M01', 'M02', 'M03', 'M04', 'M05'] },
  { key: 'siglo-xix', nombre: 'siglo XIX (M06 a M11)', modulos: ['M06', 'M07', 'M08', 'M09', 'M10', 'M11'] },
  { key: 'siglos-xx-xxi', nombre: 'siglos XX y XXI (M12 a M16)', modulos: ['M12', 'M13', 'M14', 'M15', 'M16'] },
]

function promptJuez(lote, total) {
  return `${REGLAS}
Eres el JUEZ DE DUPLICADOS, lote ${lote} de ${total}. Lee ${CONS}\\candidatos-duplicados.csv: son filas de registro.csv agrupadas por URL compartida, por autor e inicio de titulo o por una nota que habla de duplicado. Te tocan los grupos cuyo numero cumple grupo % ${total} == ${lote - 1} (grupo modulo ${total} igual a ${lote - 1}).
Para cada grupo decide con criterio literal:
- misma-obra: las filas describen el mismo documento u obra (misma edicion o ediciones de la misma obra; una traduccion de la misma obra tambien cuenta como misma obra si el registro ya las trataba juntas; una resena NO es la obra resenada). Indica canonico (el id mas bajo, salvo que otra fila tenga la URL verificada y mas datos: entonces explica por que) y duplicados.
- obras-distintas: comparten URL o titulo pero son documentos distintos (capitulos distintos del mismo PDF, numeros distintos de una revista, partes distintas de una coleccion, dos ediciones con contenido distinto que el corpus cita por separado). No se fusionan.
- mixto: dentro del grupo hay varios conjuntos de misma obra: da los subgrupos.
- dudoso: no se puede decidir sin abrir la fuente; di que haria falta.
Cuando dudes entre misma-obra y obras-distintas, abre la URL (fetch) y mira; si las fichas de los M##.md (seccion 2, buscando el id con grep) aclaran la diferencia, usalas. No modifiques ningun archivo del repositorio. Devuelve la salida estructurada con una decision por grupo de tu lote (todos los grupos del lote, sin omitir ninguno).`
}

function promptReintento(lote, total) {
  return `${REGLAS}
Eres el REINTENTADOR DE ACCESO, lote ${lote} de ${total}. Lee ${CONS}\\reintentar-acceso.csv: fuentes del registro sin URL, no localizadas, localizadas pero bloqueadas, o con pares de cobertura en fallo-fetch. Te tocan las filas cuyo numero de orden en el archivo (empezando en 0 por la primera fila de datos) cumple orden % ${total} == ${lote - 1}.
Para cada fuente, con hasta ${MAX_REI} busquedas en total para todo el lote: (1) intenta la URL registrada con WebFetch y, si falla, con curl; (2) prueba alternativas: Wayback Machine (web.archive.org/web/2024*/URL), archive.org (texto _djvu.txt), DOI y Crossref (api.crossref.org/works?query=), PDF de autor (Semantic Scholar, ResearchGate, academia.edu), HathiTrust, Gallica, dLOC, Cervantes Virtual, repositorios institucionales, Google Books (vista previa); (3) si consigues abrir el texto, extrae hasta 3 citas cortas (60 palabras o menos, idioma original, ubicacion precisa) que toquen las afirmaciones listadas en la columna afirmaciones; (4) si solo consigues la ficha editorial o un resumen, resultado = localizada-sin-texto con acceso bajo-derechos o via-resena; (5) si la fuente no existe tal como esta descrita (titulo o autor erroneo), resultado = inexistente-o-erronea y di que es lo correcto si lo sabes por fetch. No modifiques ningun archivo del repositorio. Devuelve la salida estructurada con un resultado por fuente de tu lote (todas, sin omitir ninguna).`
}

function promptBuscadorSimetria(lente) {
  const esH = lente === 'haitiana'
  const archivoIn = esH ? 'asimetria-haitiana.csv' : 'asimetria-dominicana.csv'
  const raw = `${REPO}\\02-fuentes\\por-modulo\\raw\\SIM-${lente}.json`
  const guia = esH
    ? `Tradicion HAITIANA: Madiou, Ardouin, Saint-Remy, Firmin, Janvier, Bellegarde, Price-Mars, Dorsainvil, Fouchard, M.-R. Trouillot, H. Trouillot, Manigat, Castor, Casimir, Hector, Hurbon, Beauvoir-Dominique, Denis, Michel, Alexandre, Moise, Theodat, Nau, Pean; Revue de la Societe Haitienne d'Histoire; textos y programas del MENFP; discursos y decretos de Estado; prensa haitiana (Le Nouvelliste, Le National, AlterPresse, Haiti Liberte, Loop, Haiti Libre); kreyol. Portales: dLOC, Gallica, archive.org, manioc.org, haitidoi.com, mjp.univ-perp.fr, Island Luminous, Radio Haiti (Duke), Potomitan, UEH. Frances primero, kreyol, luego espanol e ingles; site: .ht y .fr.`
    : `Tradicion DOMINICANA: Garcia, Lugo, Pena Batlle, Balaguer, Rodriguez Demorizi, Utrera, Moya Pons, Balcacer, Nunez, Cuello, Marte, Franco, Tolentino Dipp, Bosch, Cassa, Vega, Deive, Silie, Andujar, Lora, San Miguel, R. Gonzalez, Torres-Saillant, Candelario, Garcia Pena, Sagas, Ricourt; textos del MINERD; discursos y leyes; Clio y publicaciones de la ADH; AGN; Estudios Sociales; Ecos; prensa dominicana como divulgacion. Portales: academiadominicanahistoria.org.do (wp-content/uploads y catalogo opac-tmpl/files), agn.gob.do, estudiossociales.bono.edu.do, revistas.uasd.edu.do, memoriahistorica.senadord.gob.do, bibliotecadelcongreso.gob.do, dLOC, Cervantes Virtual. Espanol; site: .do.`
  return `${REGLAS}
Eres el BUSCADOR DE SIMETRIA con la lente ${lente.toUpperCase()}. Lee ${CONS}\\${archivoIn}: afirmaciones del registro que, tras el barrido de la Fase 2, no tienen NINGUNA fuente leida de la tradicion ${lente} (columnas: afirmacion, modulo, enunciado, quien la sostiene, que evidencia la resolveria y que fuentes leidas de otras tradiciones ya hay). Tu objetivo es corregir esa asimetria: para cada afirmacion, localizar al menos una fuente de la tradicion ${lente} (primaria o secundaria con autor identificable; prensa solo si es la unica portadora) que la trate, confirmarla con fetch y extraer una cita con ubicacion. Si una afirmacion no tiene tratamiento en esa tradicion, dilo expresamente en lagunas: la ausencia tambien es un dato.
${guia}
Presupuesto: hasta ${MAX_SIM} busquedas en total. Antes de proponer una fuente, comprueba en ${REPO}\\02-fuentes\\registro.csv si ya existe (por URL o autor+titulo): si existe, usala con su F-#### (id_existente) y aporta el extracto nuevo; si no, va como nueva.
Escribe tu resultado completo en ${raw} con este formato JSON: {"lente": "${lente}", "fecha": "${FECHA}", "busquedas_usadas": n, "busquedas_pendientes": [], "lagunas": ["A-###: ..."], "fuentes": [ { "titulo", "autor", "anio", "tipo": "primaria|secundaria|divulgacion|cientifica", "idioma", "tradicion": "${esH ? 'haitiana|oficial-haiti' : 'dominicana|oficial-rd'}", "url", "verificacion": "descargada-y-leida|descargada-parcial|solo-localizada", "http_status", "acceso": "texto-completo-en-linea|pdf-en-linea|fragmento-busqueda|via-resena|bajo-derechos", "fiabilidad": "alta|media|baja", "justificacion_fiabilidad", "proveniencia", "extractos": [ { "ubicacion", "cita_original", "traduccion", "afirmaciones": ["A-###"] } ], "afirmaciones": ["A-###"], "modulos": ["M##"], "id_existente": "F-#### o vacio", "notas" } ] }. Valida el JSON con python -X utf8. No escribas ningun otro archivo. Devuelve la salida estructurada.`
}

function promptRegistradorSimetria(archivos) {
  return `${REGLAS}
Eres el REGISTRADOR DE SIMETRIA. Dos buscadores han escrito ${archivos.join(' y ')}. Integra sus fuentes en el repositorio con las mismas reglas que los registradores de la Fase 2:
1. En Bash: cd "${REPO_SH}" && git status --short (pueden aparecer archivos de otros agentes de la consolidacion: no los toques) && git fetch origin ${RAMA} (si origin va por delante y el arbol esta limpio, git pull --rebase; si esta sucio, sigue sin pull y anotalo).
2. Lee ${REPO}\\02-fuentes\\registro.csv con python -X utf8: ultimo F-####, indice por URL normalizada y por autor+titulo. Para cada fuente de los JSON: si ya existe (id_existente o coincidencia), NO crees fila: anade el modulo si falta, mejora url y acceso solo si lo nuevo esta verificado y anota " | SIM ${FECHA}: <que aporta>"; si no existe, asignale el siguiente F-#### correlativo y anade la fila con las 12 columnas (id,tipo,autor,titulo,anio,idioma,tradicion,modulos,url,acceso,fiabilidad,notas; notas = proveniencia y fiabilidad en una frase, afirmaciones que toca, verificacion, "SIM ${FECHA}"). Nunca borres ni renumeres.
3. Anade a ${REPO}\\03-afirmaciones\\cobertura.csv (cabecera afirmacion,fuente,modulo,verificacion,ubicacion,fecha) un par por cada afirmacion que toque cada extracto, sin duplicar pares existentes (si el par existe, conserva la mejor verificacion y une ubicaciones).
4. Escribe ${REPO}\\02-fuentes\\por-modulo\\adenda-simetria.md (si ya existe de una corrida anterior, AMPLIALA con las fichas nuevas y actualiza su introduccion; no la sustituyas): introduccion de 100 palabras (que asimetria se corrigio, cuantas afirmaciones siguen sin fuente de cada tradicion y por que, segun las lagunas de los buscadores) y una ficha por fuente (id definitivo, autor, titulo, ano, proveniencia, acceso con URL y verificacion, fiabilidad, tabla de extractos con afirmaciones, notas), agrupadas por modulo.
5. Valida con python -X utf8: registro.csv 12 columnas, ids unicos y correlativos sin huecos; cobertura.csv 6 columnas; adenda sin ids provisionales.
6. git add -- 02-fuentes/registro.csv 03-afirmaciones/cobertura.csv 02-fuentes/por-modulo/adenda-simetria.md 02-fuentes/por-modulo/raw/SIM-haitiana.json 02-fuentes/por-modulo/raw/SIM-dominicana.json && git commit -m "Fase 2, consolidacion: fuentes de simetria (<n> nuevas, <k> actualizadas, <c> pares)" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && git push origin ${RAMA}. Si el push falla, git pull --rebase y reintenta una vez; si falla otra vez, deja el commit local y reportalo.
Devuelve la salida estructurada.`
}

function promptAgrupador(p) {
  const out = `${CONS}\\glosario-candidatos-${p.key}.csv`
  return `${REGLAS}
Eres el AGRUPADOR DE TERMINOS del periodo ${p.nombre}. Lee ${CONS}\\terminos-propuestos.csv y quedate con las filas cuyo modulo esta en ${p.modulos.join(', ')}. Son propuestas de terminos cargados hechas por los buscadores y fusionadores de la Fase 2 (columnas: modulo, periodo, termino, tradicion, nota), con muchas repeticiones, variantes y mezclas (una misma celda puede traer varios terminos separados por "/").
TAREA: deduplica y agrupa. Un grupo = un mismo concepto nombrado de forma distinta por cada tradicion (p. ej. "ocupacion haitiana" / "unification" / "periodo de gobierno haitiano de toda la isla"). Para cada grupo escribe una fila en ${out} con cabecera: concepto_descriptivo_propuesto,nombre_tradicion_dominicana,nombre_tradicion_haitiana,otros_nombres_y_quien_los_usa,nota,modulos,n_propuestas,ya_en_glosario,tipo. Reglas: el concepto descriptivo evita la palabra que ya es tesis (ni "ocupacion" ni "unificacion"); los nombres por tradicion van con el autor o la fuente que los usa cuando la nota lo da; "ya_en_glosario" = si/no/parcial comparando con ${REPO}\\01-metodologia\\glosario.md (21 filas); "tipo" = termino-cargado (nombra un hecho disputado de forma que ya juzga), categoria-racial-o-social (indio, affranchi, rayano...), nombre-propio-de-institucion-o-ley (no es cargado: p. ej. "Protocolo de 1936"), jerga-o-coloquial, o eufemismo-oficial. Las filas de tipo nombre-propio solo entran si el nombre varia entre tradiciones. Conserva en "nota" lo mas util de las notas originales (que lado lo usa, desde cuando, por que importa), sin inventar. Valida el CSV con python -X utf8. Devuelve la salida estructurada (archivo, n_filas, n_descartadas = propuestas que no formaron grupo porque no son terminos cargados, notas).`
}

function promptEditorGlosario(archivos) {
  const glos = `${REPO}\\01-metodologia\\glosario.md`
  return `${REGLAS}
Eres el EDITOR DEL GLOSARIO. El glosario actual (${glos}, 21 filas) fija el lenguaje de todo el corpus: termino descriptivo que usa el proyecto, nombre en la tradicion dominicana, nombre en la tradicion haitiana y nota. Tres agrupadores han preparado candidatos por periodo: ${archivos.join(' ; ')} (lee los tres). Tu tarea es producir el glosario definitivo de la Fase 2:
1. Conserva las 21 filas actuales; puedes mejorar su redaccion o su nota si un candidato aporta algo (quien usa el termino, desde cuando), sin cambiar su sentido. Anota cuantas editaste.
2. Anade una fila por cada concepto que de verdad sea un termino cargado o una categoria racial o social con nombres distintos por tradicion. Criterio: entra si nombrarlo de una manera u otra ya toma partido o si una tradicion no tiene nombre para lo que la otra si nombra (eso tambien se registra). No entran: nombres propios de leyes, tratados o instituciones que no varian; jerga interna de una obra; adjetivos sueltos. Los eufemismos oficiales entran como tales, atribuidos.
3. Cada fila: termino descriptivo que usara el corpus (neutro, sin la palabra que ya es tesis), nombre dominicano, nombre haitiano (o "—" si no hay, y la nota dice que no hay), nota de una a tres frases con quien lo usa y por que importa, y los modulos donde aparece entre corchetes al final de la nota. Simetria estricta: ni el termino descriptivo ni la nota pueden adoptar el marco de un lado.
4. Organiza el glosario con subtitulos por bloque (Marco y nombres; Poblamiento y conquista; Colonias; Revolucion e independencias; Siglo XIX; Siglo XX; Siglo XXI; Categorias raciales y sociales; Instituciones y economia) manteniendo el formato de tabla de 4 columnas en cada bloque y la introduccion actual.
5. Escribe ${CONS}\\glosario-descartados.csv (concepto, motivo) con lo que no entro, para que quede rastro.
No inventes atribuciones: si un candidato no dice quien usa un termino, la nota no lo atribuye. Valida que el Markdown resultante tenga todas las tablas bien formadas (mismo numero de columnas por fila). Devuelve la salida estructurada (archivo, filas_antes, filas_despues, filas_editadas, descartados, dudas = decisiones que convendria que revisara una persona).`
}

function promptExtractor(p) {
  const out = `${CONS}\\lagunas-${p.key}.md`
  return `${REGLAS}
Eres el EXTRACTOR DE LAGUNAS del periodo ${p.nombre}. Lee los archivos ${p.modulos.map(m => `${CONS}\\lagunas\\${m}.md`).join(', ')} (copias de la seccion 6 de cada M##.md: lagunas y busquedas pendientes). Escribe ${out} con esta estructura, para cada tipo de limite una tabla con columnas Modulo | Que falta (documento, obra, serie, dato) | Por que no se pudo (archivo fisico, muro de pago, portal bloqueado, no digitalizado, no existe en linea, presupuesto de busqueda) | Afirmaciones afectadas | Donde podria estar (archivo, biblioteca, portal, autor):
1. Fuentes primarias no obtenidas. 2. Obras secundarias bajo derechos o sin copia en linea. 3. Prensa y publicaciones periodicas no digitalizadas o no leidas. 4. Datos cuantitativos sin fuente primaria (cifras, censos, series). 5. Voces ausentes (silencios). 6. Portales y archivos que bloquearon el acceso. 7. Consultas planeadas y no ejecutadas (resumen numerico por modulo).
Deduplica entre modulos (una misma obra que falta en tres modulos es una fila con tres modulos). No anadas nada que no este en los archivos de entrada. Devuelve la salida estructurada (archivo, n_filas = filas de tablas, n_descartadas = entradas de entrada que no eran lagunas sino comentarios, notas).`
}

function promptRedactorLimites(archivos) {
  const out = `${REPO}\\07-sintesis\\limites.md`
  return `${REGLAS}
Eres el REDACTOR DE LIMITES. Tres extractores han consolidado las lagunas de la Fase 2 en ${archivos.join(' ; ')}. Escribe ${out} (crea la carpeta 07-sintesis si no existe) como primera version del capitulo de limites del proyecto, marcada en su cabecera como "Version de la Fase 2 (barrido de fuentes); se completa en las Fases 3 a 7". Estructura: (1) introduccion de 200 palabras: que es este documento, que modo de acceso hubo (A, red local; portales que bloquearon), que presupuesto de busqueda se uso; (2) una seccion por tipo de limite (los siete de los extractores), cada una con un parrafo que resume y la tabla unificada de los tres periodos ordenada por modulo; (3) una seccion "Lo que no existe en linea y requiere archivo o biblioteca" con una lista por archivo (AGI, AGN de RD, Archives Nationales d'Haiti, ANOM, NARA, Kew, BnF, HathiTrust con prestamo, archive.org con prestamo) y lo que habria que consultar en cada uno; (4) una seccion "Tareas manuales pendientes" (p. ej. prestamo de La isla al reves en archive.org con las paginas que indica M14.md); (5) una seccion "Asimetrias de cobertura" tomando los datos de ${CONS}\\asimetria-haitiana.csv y ${CONS}\\asimetria-dominicana.csv (cuantas afirmaciones y cuales siguen sin fuente de cada tradicion; si existe ${REPO}\\02-fuentes\\por-modulo\\adenda-simetria.md, leela y actualiza las cifras con lo que corrigio). No anadas nada que no este en las entradas. Devuelve la salida estructurada (archivo, n_filas = filas de tablas, n_descartadas = 0, notas).`
}

function promptVerificador(lote, total) {
  return `${REGLAS}
Eres el VERIFICADOR DE CITAS, lote ${lote} de ${total}. Lee ${CONS}\\muestra-control.csv: 30 pares afirmacion-fuente elegidos al azar entre los que el barrido marco como "fuente descargada y leida". Te tocan las filas con n % ${total} == ${lote - 1}.
Para cada par: (1) localiza la ficha de la fuente en ${REPO}\\02-fuentes\\por-modulo\\<modulo>.md, seccion 2 (grep -n "### F-####" y lee la tabla de extractos): copia la cita que la ficha atribuye a esa ubicacion para esa afirmacion (cita_en_ficha); (2) descarga la fuente desde su URL (WebFetch; o curl y pdftotext para PDF; para textos locales de 02-fuentes/textos usa grep -n por linea) y busca la cita: literal = aparece tal cual (tolerando acentos, mayusculas y puntuacion); aproximada = el pasaje existe pero la ficha lo parafrasea o recorta de forma que cambia matices (di cuales); no-encontrada = el pasaje no esta en la fuente; ubicacion-erronea = la cita existe pero en otra pagina o linea (da la real); fuente-inaccesible = no pudiste abrir la fuente hoy (di el error). (3) Anota la cita hallada (60 palabras o menos) y su ubicacion real. Se estricto: esta muestra mide la fiabilidad de todo el barrido. No modifiques ningun archivo. Devuelve la salida estructurada con un resultado por par de tu lote.`
}

// ---------------------------------------------------------------------------
// Orquestacion: seis cadenas independientes en paralelo
// ---------------------------------------------------------------------------
log(`Consolidacion de la Fase 2: ${LOTES_DUP} jueces, ${LOTES_ACC} reintentadores, 2 buscadores de simetria + registrador, 3 agrupadores + editor, 3 extractores + redactor, 3 verificadores; modelos ${JSON.stringify(MODELOS)}`)

const cadenas = await parallel([
  // Duplicados
  async () => (SOLO && SOLO.jueces === false) ? [] : parallel(Array.from({ length: LOTES_DUP }, (_, i) => () =>
    agent(promptJuez(i + 1, LOTES_DUP), opt('juez', { label: `duplicados:lote-${i + 1}`, phase: 'Duplicados', schema: JUEZ_SCHEMA })))),
  // Acceso
  async () => parallel(LOTES_ACC_LISTA.map(n => () =>
    agent(promptReintento(n, LOTES_ACC), opt('reintentador', { label: `acceso:lote-${n}`, phase: 'Acceso', schema: REINTENTO_SCHEMA })))),
  // Simetria: dos buscadores y un registrador
  async () => !LENTES_SIM.length ? { buscadores: [], registro: null } : parallel(LENTES_SIM.map(l => () =>
    agent(promptBuscadorSimetria(l), opt('buscador', { label: `simetria:${l}`, phase: 'Simetria', schema: BUSQUEDA_SCHEMA }))))
    .then(async (bs) => {
      const ok = bs.filter(Boolean)
      if (!ok.length) { log('simetria: ningun buscador termino'); return { buscadores: [], registro: null } }
      log(`simetria: ${ok.length} buscador(es), ${ok.reduce((s, r) => s + r.n_fuentes, 0)} fuentes, ${ok.reduce((s, r) => s + r.busquedas_usadas, 0)} busquedas`)
      const reg = await agent(promptRegistradorSimetria(ok.map(r => r.archivo)), opt('registrador', { label: 'simetria:registro', phase: 'Simetria', schema: REGISTRO_SCHEMA }))
      if (reg) log(`simetria registrada: ${reg.n_nuevas} nuevas, ${reg.n_actualizadas} actualizadas, ${reg.n_cobertura} pares; commit ${reg.commit}; push ${reg.push_ok ? 'ok' : 'FALLO'}`)
      return { buscadores: ok, registro: reg }
    }),
  // Glosario: tres agrupadores y un editor
  async () => (SOLO && SOLO.glosario === false) ? { agrupadores: [], editor: null } : parallel(PERIODOS.map(p => () =>
    agent(promptAgrupador(p), opt('agrupador', { label: `glosario:${p.key}`, phase: 'Glosario', schema: ARCHIVO_SCHEMA }))))
    .then(async (as) => {
      const ok = as.filter(Boolean)
      if (!ok.length) { log('glosario: ningun agrupador termino'); return { agrupadores: [], editor: null } }
      log(`glosario: ${ok.length} agrupadores, ${ok.reduce((s, r) => s + r.n_filas, 0)} candidatos`)
      const ed = await agent(promptEditorGlosario(ok.map(r => r.archivo)), opt('editor', { label: 'glosario:editor', phase: 'Glosario', schema: GLOSARIO_SCHEMA, effort: 'high' }))
      if (ed) log(`glosario: de ${ed.filas_antes} a ${ed.filas_despues} filas (${ed.filas_editadas} editadas, ${ed.descartados} descartados)`)
      return { agrupadores: ok, editor: ed }
    }),
  // Limites: tres extractores y un redactor
  async () => (SOLO && SOLO.limites === false) ? { extractores: [], redactor: null }
    : (SOLO && SOLO.limites === 'redactor') ? { extractores: [], redactor: await agent(promptRedactorLimites(PERIODOS.map(p => `${CONS}\\lagunas-${p.key}.md`)), opt('redactor', { label: 'limites:redactor', phase: 'Limites', schema: ARCHIVO_SCHEMA })) }
    : parallel(PERIODOS.map(p => () =>
    agent(promptExtractor(p), opt('extractor', { label: `limites:${p.key}`, phase: 'Limites', schema: ARCHIVO_SCHEMA }))))
    .then(async (es) => {
      const ok = es.filter(Boolean)
      if (!ok.length) { log('limites: ningun extractor termino'); return { extractores: [], redactor: null } }
      log(`limites: ${ok.length} extractores, ${ok.reduce((s, r) => s + r.n_filas, 0)} filas`)
      const red = await agent(promptRedactorLimites(ok.map(r => r.archivo)), opt('redactor', { label: 'limites:redactor', phase: 'Limites', schema: ARCHIVO_SCHEMA }))
      if (red) log(`limites.md escrito: ${red.n_filas} filas de tablas`)
      return { extractores: ok, redactor: red }
    }),
  // Muestra de control
  async () => parallel(MUESTRA_LOTES.map(n => () =>
    agent(promptVerificador(n, 3), opt('verificador', { label: `muestra:lote-${n}`, phase: 'Muestra', schema: VERIFICACION_SCHEMA, effort: 'high' })))),
])

const [jueces, reintentos, simetria, glosario, limites, verificadores] = cadenas
const decisiones = (jueces || []).filter(Boolean).flatMap(j => j.decisiones)
const resultadosAcceso = (reintentos || []).filter(Boolean).flatMap(r => r.resultados)
const verif = (verificadores || []).filter(Boolean).flatMap(v => v.resultados)
const cuenta = (arr, k) => arr.reduce((acc, x) => { acc[x[k]] = (acc[x[k]] || 0) + 1; return acc }, {})
log(`duplicados: ${decisiones.length} decisiones ${JSON.stringify(cuenta(decisiones, 'veredicto'))}`)
log(`acceso: ${resultadosAcceso.length} fuentes ${JSON.stringify(cuenta(resultadosAcceso, 'resultado'))}`)
log(`muestra: ${verif.length} pares ${JSON.stringify(cuenta(verif, 'veredicto'))}`)

return {
  fecha: FECHA,
  duplicados: { decisiones, incidencias: (jueces || []).filter(Boolean).flatMap(j => j.incidencias), resumen: cuenta(decisiones, 'veredicto') },
  acceso: { resultados: resultadosAcceso, busquedas: (reintentos || []).filter(Boolean).reduce((s, r) => s + r.busquedas_usadas, 0), resumen: cuenta(resultadosAcceso, 'resultado') },
  simetria,
  glosario,
  limites,
  muestra: { resultados: verif, resumen: cuenta(verif, 'veredicto') },
}
