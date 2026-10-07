export const meta = {
  name: 'fase3-lectura-primarias',
  description: 'Fase 3: lectura profunda de fuentes primarias por bloques; un lector por documento (descarga, ficha de proveniencia, citas por linea, relacion con las afirmaciones), critico de proveniencia en Opus para los documentos en disputa, aplicador con commit por bloque y critico de completitud final',
  phases: [
    { title: 'Lectura', detail: 'un lector por documento primario' },
    { title: 'Proveniencia', detail: 'critico de proveniencia para los documentos en disputa' },
    { title: 'Aplicacion', detail: 'aplicador mecanico y commit por bloque (en serie)' },
    { title: 'Completitud', detail: 'critico final: que primarias faltan por disputa' },
  ],
}

// args.fecha; args.modelos {lector, critico, aplicador, completitud}; args.bloques (opcional, misma forma que BLOQUES_DEFECTO);
// args.en_vuelo (bloques a la vez, por defecto 2); args.max_busquedas (por lector, por defecto 20); args.sin_completitud (true para omitir el critico final).
// Para continuar una corrida cortada: pasar args.bloques solo con los bloques e ids pendientes (nunca resumeFromRunId).

const REPO = 'C:\\Users\\branl\\OneDrive\\Desktop\\Claude\\La Espanola'
const REPO_SH = '/c/Users/branl/OneDrive/Desktop/Claude/La Espanola'
const RAMA = 'claude/hispaniola-historical-research-plan-79fana'
const FECHA = (args && args.fecha) || '2026-10-07'
const MODELOS = (args && args.modelos) || {}
const opt = (rol, extra) => Object.assign({}, MODELOS[rol] ? { model: MODELOS[rol] } : {}, extra)
const EN_VUELO = (args && args.en_vuelo) || 2
const MAX_B = (args && args.max_busquedas) || 20

const BLOQUES_DEFECTO = [
  { nombre: 'B1-nombres-contacto-conquista', ids: ['F-0006', 'F-0009', 'F-0010', 'F-1589', 'F-0001', 'F-0002', 'F-0011', 'F-2131', 'F-0012', 'F-0013'], disputa: ['F-0009', 'F-1589', 'F-0011', 'F-0012'] },
  { nombre: 'B2-colonias', ids: ['F-0014', 'F-0016', 'F-0024', 'F-0019', 'F-0020', 'F-0021', 'F-0022', 'F-1628', 'F-0023', 'F-0025'], disputa: ['F-0016', 'F-0024', 'F-0025', 'F-0020'] },
  { nombre: 'B3-revolucion-1805-1822', ids: ['F-0027', 'F-0028', 'F-0029', 'F-0032', 'F-0026', 'F-0030', 'F-1848', 'F-0066', 'F-0034', 'F-2218', 'F-2219', 'F-2222'], disputa: ['F-0029', 'F-0026', 'F-0030', 'F-1848', 'F-0066', 'F-2218', 'F-2219', 'F-2222'] },
  { nombre: 'B4-1822-1844', ids: ['F-0035', 'F-0746', 'F-1505', 'F-1060', 'F-0792', 'F-0037', 'F-0038', 'F-0039', 'F-0040'], disputa: ['F-0035', 'F-1060', 'F-0038', 'F-0039', 'F-0040'] },
  { nombre: 'B5-1844-1915', ids: ['F-0979', 'F-1055', 'F-1056', 'F-0051', 'F-1004', 'F-1054', 'F-0041'], disputa: ['F-1055', 'F-1056', 'F-0051'] },
  { nombre: 'B6-1915-1961', ids: ['F-0055', 'F-0049', 'F-0050', 'F-0057', 'F-0100', 'F-0331', 'F-0350', 'F-1299'], disputa: ['F-0057', 'F-0100', 'F-0331', 'F-0350', 'F-1299'] },
  { nombre: 'B7-1961-2026', ids: ['F-2247', 'F-2480', 'F-0063', 'F-0524', 'F-0061', 'F-0062', 'F-0523', 'F-0059', 'F-0060'], disputa: ['F-0061', 'F-0523', 'F-0059'] },
  { nombre: 'B8-cientifica', ids: ['F-0220'], disputa: ['F-0220'] },
]
const BLOQUES = (args && Array.isArray(args.bloques) && args.bloques.length) ? args.bloques : BLOQUES_DEFECTO

const REGLAS = `
REGLAS COMUNES DE LA FASE 3 (lee antes de empezar):
- Trabajas en ${REPO} (en Bash: ${REPO_SH}), rama ${RAMA}. Bash (Git Bash) para curl, grep, pdftotext, python y git con rutas POSIX; rutas Windows en Read/Write/Grep/Glob. Python siempre con -X utf8; CSV con el modulo csv (encoding='utf-8', newline='').
- Lee primero ${REPO}\\01-metodologia\\metodo.md (todo), escala-de-confianza.md, glosario.md (la introduccion y los bloques que toquen tu documento) y la plantilla ${REPO}\\01-metodologia\\plantillas\\ficha-fuente.md.
- Modo A: toda cita sale de un texto que has abierto. Los textos largos se descargan con curl y se leen con grep -n y sed -n, nunca con WebFetch (trunca). Nunca inventes citas, paginas ni lineas. Lo que no confirmes va con [POR VERIFICAR]. No uses Firecrawl. Si un portal bloquea (403, Cloudflare, Anubis), no lo eludas: anotalo.
- Cifras como rangos con autor y base. Terminos cargados en su forma descriptiva (glosario). Simetria: el sesgo y el interes del autor se declaran igual para todas las tradiciones.
- No modifiques ${REPO}\\02-fuentes\\registro.csv ni ${REPO}\\03-afirmaciones\\cobertura.csv ni los M##.md: eso lo hace el aplicador. No hagas commit ni push salvo que tu tarea lo diga. Otros agentes trabajan a la vez en el repositorio.
- Escribe en espanol; citas en idioma original seguidas de traduccion al espanol entre corchetes.
`

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const LECTOR_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    archivo_ficha: { type: 'string' },
    copia_local: { type: 'array', items: { type: 'string' }, description: 'rutas relativas al repo de los textos descargados (vacio si no se pudo)' },
    lineas_totales: { type: 'number' },
    acceso: { type: 'string', enum: ['texto-descargado', 'texto-completo-en-linea', 'parcial', 'bloqueado'] },
    n_extractos: { type: 'number' },
    extractos: { type: 'array', items: { type: 'object', properties: { archivo: { type: 'string' }, linea: { type: 'number' }, cita: { type: 'string' } }, required: ['archivo', 'linea', 'cita'] }, description: 'para la verificacion mecanica: ruta relativa, numero de linea y primeras 15 palabras literales de cada cita' },
    pares: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, relacion: { type: 'string', enum: ['apoya', 'matiza', 'contradice', 'contexto', 'no-trata'] }, ubicacion: { type: 'string' } }, required: ['afirmacion', 'relacion', 'ubicacion'] } },
    pares_nuevos: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, relacion: { type: 'string', enum: ['apoya', 'matiza', 'contradice', 'contexto'] }, ubicacion: { type: 'string' } }, required: ['afirmacion', 'relacion', 'ubicacion'] } },
    busquedas_usadas: { type: 'number' },
    problemas: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'archivo_ficha', 'copia_local', 'lineas_totales', 'acceso', 'n_extractos', 'extractos', 'pares', 'pares_nuevos', 'busquedas_usadas', 'problemas'],
}

const CRITICO_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    veredicto_ficha: { type: 'string', enum: ['aceptada', 'corregida', 'rehacer'] },
    correcciones: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, relacion_antes: { type: 'string' }, relacion_despues: { type: 'string', enum: ['apoya', 'matiza', 'contradice', 'contexto', 'no-trata'] }, motivo: { type: 'string' } }, required: ['afirmacion', 'relacion_antes', 'relacion_despues', 'motivo'] } },
    citas_comprobadas: { type: 'number' },
    citas_erroneas: { type: 'number' },
    proveniencia_cambios: { type: 'array', items: { type: 'string' } },
    problemas: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'veredicto_ficha', 'correcciones', 'citas_comprobadas', 'citas_erroneas', 'proveniencia_cambios', 'problemas'],
}

const APLICADOR_SCHEMA = {
  type: 'object',
  properties: {
    bloque: { type: 'string' }, informe: { type: 'string' }, commit: { type: 'string' }, push_ok: { type: 'boolean' }, problemas: { type: 'array', items: { type: 'string' } },
  },
  required: ['bloque', 'informe', 'commit', 'push_ok', 'problemas'],
}

const COMPLETITUD_SCHEMA = {
  type: 'object',
  properties: {
    archivo: { type: 'string' },
    disputas_cubiertas: { type: 'number' },
    bloque_siguiente: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, motivo: { type: 'string' } }, required: ['id', 'motivo'] } },
    riesgos: { type: 'array', items: { type: 'string' } },
    decisiones_para_bran: { type: 'array', items: { type: 'string' } },
  },
  required: ['archivo', 'disputas_cubiertas', 'bloque_siguiente', 'riesgos', 'decisiones_para_bran'],
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
function promptLector(id, bloque) {
  return `${REGLAS}
Eres el LECTOR del documento primario ${id} (bloque ${bloque}). Tu entregable es la ficha ${REPO}\\02-fuentes\\primarias\\${id}.md y la copia local del texto.
PROCEDIMIENTO:
1. Lee tu fila en ${REPO}\\02-fuentes\\registro.csv (python -X utf8, csv): autor, titulo, ano, idioma, url (varias separadas por " | "), acceso, modulos, notas. Lee los pares de ${REPO}\\03-afirmaciones\\cobertura.csv con fuente == ${id} y, para cada afirmacion de esos pares, su fila en ${REPO}\\03-afirmaciones\\registro.csv (enunciado, nivel, evidencia_resolutoria). Lee tambien las fichas que los M##.md ya tienen de ${id} (grep -n "${id}" en ${REPO}\\02-fuentes\\por-modulo\\M*.md): son el punto de partida, no la verdad. Lee la lista completa de afirmaciones de los modulos que toca tu documento: tu lectura puede aportar pasajes a afirmaciones aun no enlazadas.
2. CONSIGUE EL TEXTO COMPLETO y guardalo en ${REPO}\\02-fuentes\\textos\\primarias\\ como ${id}-<slug-corto>.txt (UTF-8, una linea por linea del original; si la obra tiene varios tomos, un archivo por tomo: ${id}-t1.txt, ${id}-t2.txt...; maximo 25 MB por archivo). Como: si la url ya es una ruta local de 02-fuentes/textos/, usala y no la dupliques (copia_local = esa ruta); archive.org: https://archive.org/download/<id>/<id>_djvu.txt; PDF: curl -sL -A "Mozilla/5.0" -o <scratchpad>/x.pdf y pdftotext -layout x.pdf salida.txt; Gallica: anade .texteBrut al ark; dLOC y ufdc: busca el enlace "Download" de texto u OCR del item o descarga el PDF; HTML: curl y python (html.parser) para dejar texto plano; wikisource: la accion raw o la exportacion. Si el documento es una pieza corta dentro de una compilacion grande (p. ej. un tratado dentro de Cantillo 1843, un decreto dentro del Recueil de Linstant Pradine), descarga la compilacion entera y anota en la ficha las lineas del documento. Si no se puede descargar (bloqueo, solo imagenes sin OCR), di acceso = bloqueado o parcial, explica y trabaja con lo que si se abre (WebFetch para paginas cortas), sin inventar.
3. LEE. Con grep -n por palabras clave de cada afirmacion y sed -n para el contexto, localiza los pasajes. Para cada pasaje: cita literal de hasta 80 palabras en idioma original, con ubicacion exacta "archivo:linea" (y pagina o capitulo del original si el texto lo muestra) y traduccion al espanol entre corchetes.
4. ESCRIBE LA FICHA ${REPO}\\02-fuentes\\primarias\\${id}.md con la plantilla ficha-fuente.md completa: cabecera (id, tipo, autores, titulo completo, anos de redaccion, publicacion y edicion usada, idioma, tradicion, modulos, afirmaciones); PROVENIENCIA en cuatro parrafos de verdad (quien era el autor y desde donde escribia; para quien y con que interes; que sabia de primera mano y que por terceros; quien la usa y como: que tradicion la cita y para que), con las fuentes de esos datos (introducciones de la edicion, el propio texto, obras del registro que lo discuten: cita el F-#### cuando lo uses); ACCESO (URL, edicion, copia local, lineas totales, fecha ${FECHA}, verificacion); FIABILIDAD (alta/media/baja con justificacion de dos frases: que se puede tomar de esta fuente y que no); EXTRACTOS: tabla con todas las citas (ubicacion | cita original | traduccion | afirmacion que toca | relacion); y una seccion nueva "Relacion con las afirmaciones": una fila por afirmacion enlazada con relacion = apoya (la fuente afirma lo que dice el enunciado), matiza (lo afirma con limites o cifras distintas), contradice, contexto (trata el asunto sin pronunciarse sobre el enunciado) o no-trata (la fuente no habla de eso: el par estaba mal), con la cita que lo sustenta; y "Pasajes para afirmaciones no enlazadas" (pares_nuevos). Termina con NOTAS: ediciones distintas, problemas de OCR, lo que no pudiste leer.
5. Presupuesto: hasta ${MAX_B} busquedas web (para la proveniencia y para localizar el texto). No modifiques otros archivos. Devuelve la salida estructurada: id, archivo_ficha, copia_local (rutas relativas al repo), lineas_totales, acceso, n_extractos, extractos (archivo relativo, linea, primeras 15 palabras literales de cada cita), pares (afirmacion, relacion, ubicacion "archivo:linea"), pares_nuevos, busquedas_usadas, problemas.`
}

function promptCritico(id, bloque) {
  return `${REGLAS}
Eres el CRITICO DE PROVENIENCIA del documento ${id} (bloque ${bloque}), uno de los documentos que sostienen una disputa central del proyecto (plan, seccion 9). Un lector ha escrito ${REPO}\\02-fuentes\\primarias\\${id}.md y ha guardado el texto en ${REPO}\\02-fuentes\\textos\\primarias\\ (ruta en la seccion Acceso de la ficha). Tu trabajo es dejar la ficha a prueba de los escepticos de la Fase 5:
1. PROVENIENCIA: comprueba que responde de verdad a las cuatro preguntas del metodo y que no adopta el marco de una tradicion: autor, fecha de redaccion frente a fecha de publicacion, cadena de transmision (original, copia, edicion, transcripcion; p. ej. una memoria escrita decadas despues, una transcripcion universitaria frente al impreso, una traduccion), interes del autor, y como la usan las tradiciones dominicana, haitiana e internacional (con F-#### del registro cuando los conozcas). Corrige o completa en la propia ficha, marcando tus cambios con "[revision ${FECHA}]". No inventes: lo que no puedas documentar va con [POR VERIFICAR].
2. CITAS: toma al menos 5 citas de la tabla de extractos (todas si son menos de 8) y comprueba con sed -n en la copia local que estan en la linea indicada y son literales. Corrige las erroneas en la ficha y cuenta cuantas eran erroneas.
3. RELACIONES: relee cada fila de "Relacion con las afirmaciones" junto a su cita y al enunciado de la afirmacion (${REPO}\\03-afirmaciones\\registro.csv). Si la etiqueta (apoya, matiza, contradice, contexto, no-trata) no es la correcta, cambiala en la ficha y devuelvela en correcciones con el motivo. Se exigente con "apoya": solo si la fuente afirma lo que dice el enunciado, no si trata del tema.
4. SILENCIOS: anade a NOTAS que voces o datos esperables faltan en este documento y que otras primarias habria que leer para contrastarlo.
Hasta 10 busquedas o fetch. No toques registro.csv, cobertura.csv ni los M##.md. Devuelve la salida estructurada (id, veredicto_ficha, correcciones, citas_comprobadas, citas_erroneas, proveniencia_cambios, problemas).`
}

function promptAplicador(bloque, lectores, criticos) {
  const json = JSON.stringify({ bloque: bloque.nombre, fecha: FECHA, lectores, criticos })
  const ruta = `02-fuentes/consolidacion/fase3/${bloque.nombre}.json`
  return `${REGLAS}
Eres el APLICADOR del bloque ${bloque.nombre}. Trabajas EN SERIE: ningun otro aplicador toca registro.csv, cobertura.csv ni git ahora. Pasos, todos en Bash desde "${REPO_SH}":
1. mkdir -p 02-fuentes/consolidacion/fase3 && escribe EXACTAMENTE el JSON de abajo en ${ruta} (usa Write con la ruta Windows ${REPO}\\02-fuentes\\consolidacion\\fase3\\${bloque.nombre}.json; comprueba despues con python -X utf8 -c "import json;json.load(open('${ruta}',encoding='utf-8'))").
2. python -X utf8 00-plan/workflows/herramientas/aplicar_fase3.py ${ruta} y copia su salida JSON en "informe". Si falla, no hagas commit: reportalo en problemas con el error.
3. Comprueba que existen las fichas 02-fuentes/primarias/<id>.md de los lectores del bloque y que ningun archivo de 02-fuentes/textos/primarias/ supera 25 MB (si alguno lo supera, no lo anadas y anotalo).
4. git fetch origin ${RAMA}; si origin va por delante y el arbol esta limpio, git pull --rebase; si esta sucio, sigue sin pull. Luego git add -- 02-fuentes/primarias/ 02-fuentes/textos/primarias/ 02-fuentes/registro.csv 03-afirmaciones/cobertura.csv 02-fuentes/consolidacion/fase3/ && git commit -m "Fase 3: bloque ${bloque.nombre} (<n> fichas, <k> pares con relacion, <c> citas comprobadas)" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && git push origin ${RAMA}. Si el push falla, git pull --rebase y reintenta una vez; si vuelve a fallar, deja el commit local y reportalo.
JSON DEL BLOQUE:
${json}
Devuelve la salida estructurada (bloque, informe, commit = hash corto, push_ok, problemas).`
}

function promptCompletitud(resumen) {
  return `${REGLAS}
Eres el CRITICO DE COMPLETITUD de la Fase 3. Se han leido a fondo los documentos primarios de estos bloques: ${JSON.stringify(resumen)}. Lee ${REPO}\\00-plan\\plan.md (seccion 9: las 13 disputas; seccion 10: Fase 3 y Fase 4; seccion 12.1: primarias objetivo), ${REPO}\\00-plan\\fase2-cierre.md (seccion 7), las fichas de ${REPO}\\02-fuentes\\primarias\\ (al menos la cabecera y la seccion "Relacion con las afirmaciones" de cada una), ${REPO}\\02-fuentes\\consolidacion\\fase3\\verificacion-citas.csv y la cobertura (${REPO}\\03-afirmaciones\\cobertura.csv, columna relacion).
Responde con datos: (1) para cada una de las 13 disputas, que primarias se leyeron, que relacion tienen con las afirmaciones de la disputa (cuantos apoya, matiza, contradice, contexto, no-trata por version rival) y que primaria decisiva sigue sin leer; (2) que afirmaciones A o B candidatas (plan, seccion 10, Fase 4) tienen ya una primaria leida con relacion apoya o contradice y cuales no; (3) calidad: resultado de la verificacion mecanica de citas y de los criticos de proveniencia (fichas rehacer); (4) propuesta de un bloque siguiente de 10 a 20 documentos con id y motivo, priorizando las primarias de la seccion 12.1 del plan que faltan y las que piden las afirmaciones peor cubiertas; (5) riesgos para la Fase 4 y decisiones para Bran. Hasta 15 busquedas. Escribe ${REPO}\\00-plan\\fase3-cierre.md (800 a 1.400 palabras, con tablas) y devuelve la salida estructurada.`
}

// ---------------------------------------------------------------------------
// Orquestacion
// ---------------------------------------------------------------------------
let colaAplicacion = null
function enSerie(fn) {
  const p = colaAplicacion ? colaAplicacion.then(() => fn(), () => fn()) : fn()
  colaAplicacion = p.then(() => {}, () => {})
  return p
}

async function procesarBloque(b) {
  log(`${b.nombre}: ${b.ids.length} lectores`)
  const lectores = (await parallel(b.ids.map(id => () =>
    agent(promptLector(id, b.nombre), opt('lector', { label: `${b.nombre}:lector:${id}`, phase: 'Lectura', schema: LECTOR_SCHEMA }))))).filter(Boolean)
  log(`${b.nombre}: ${lectores.length}/${b.ids.length} lectores terminaron; ${lectores.reduce((s, l) => s + l.n_extractos, 0)} extractos; acceso: ${JSON.stringify(lectores.reduce((a, l) => { a[l.acceso] = (a[l.acceso] || 0) + 1; return a }, {}))}`)
  const leidos = new Set(lectores.map(l => l.id))
  const enDisputa = (b.disputa || []).filter(id => leidos.has(id))
  let criticos = []
  if (enDisputa.length) {
    log(`${b.nombre}: ${enDisputa.length} criticos de proveniencia`)
    criticos = (await parallel(enDisputa.map(id => () =>
      agent(promptCritico(id, b.nombre), opt('critico', { label: `${b.nombre}:critico:${id}`, phase: 'Proveniencia', schema: CRITICO_SCHEMA, effort: 'high' }))))).filter(Boolean)
    log(`${b.nombre}: criticos: ${JSON.stringify(criticos.reduce((a, c) => { a[c.veredicto_ficha] = (a[c.veredicto_ficha] || 0) + 1; return a }, {}))}; correcciones de relacion ${criticos.reduce((s, c) => s + c.correcciones.length, 0)}; citas erroneas ${criticos.reduce((s, c) => s + c.citas_erroneas, 0)}`)
  }
  if (!lectores.length) { log(`${b.nombre}: sin lectores, no se aplica`); return { bloque: b.nombre, lectores, criticos, aplicacion: null } }
  const aplicacion = await enSerie(() => agent(promptAplicador(b, lectores, criticos), opt('aplicador', { label: `${b.nombre}:aplicador`, phase: 'Aplicacion', schema: APLICADOR_SCHEMA })))
  if (aplicacion) log(`${b.nombre}: aplicado; commit ${aplicacion.commit}; push ${aplicacion.push_ok ? 'ok' : 'FALLO'}${aplicacion.problemas.length ? '; problemas: ' + aplicacion.problemas.join(' | ') : ''}`)
  else log(`${b.nombre}: el aplicador no termino; el bloque queda sin commit (fichas y textos en disco)`)
  return { bloque: b.nombre, lectores, criticos, aplicacion }
}

const pendientes = BLOQUES.slice()
const resultados = []
async function trabajador() {
  while (pendientes.length) {
    const b = pendientes.shift()
    try { resultados.push(await procesarBloque(b)) }
    catch (e) { log(`${b.nombre}: error de orquestacion: ${e && e.message}`); resultados.push({ bloque: b.nombre, error: String(e && e.message) }) }
  }
}
log(`Fase 3: ${BLOQUES.length} bloques, ${BLOQUES.reduce((s, b) => s + b.ids.length, 0)} documentos, ${BLOQUES.reduce((s, b) => s + (b.disputa || []).length, 0)} con critico de proveniencia; ${EN_VUELO} bloques en vuelo; modelos ${JSON.stringify(MODELOS)}`)
await parallel(Array.from({ length: Math.min(EN_VUELO, BLOQUES.length) }, () => () => trabajador()))

const resumen = resultados.map(r => ({
  bloque: r.bloque,
  lectores: r.lectores ? r.lectores.length : 0,
  acceso: r.lectores ? r.lectores.reduce((a, l) => { a[l.acceso] = (a[l.acceso] || 0) + 1; return a }, {}) : {},
  extractos: r.lectores ? r.lectores.reduce((s, l) => s + l.n_extractos, 0) : 0,
  pares_con_relacion: r.lectores ? r.lectores.reduce((s, l) => s + l.pares.length, 0) : 0,
  pares_nuevos: r.lectores ? r.lectores.reduce((s, l) => s + l.pares_nuevos.length, 0) : 0,
  criticos: r.criticos ? r.criticos.length : 0,
  fichas_rehacer: r.criticos ? r.criticos.filter(c => c.veredicto_ficha === 'rehacer').map(c => c.id) : [],
  commit: r.aplicacion ? r.aplicacion.commit : '',
  push_ok: r.aplicacion ? r.aplicacion.push_ok : false,
  problemas: (r.lectores || []).flatMap(l => l.problemas.map(p => `${l.id}: ${p}`)).concat(r.aplicacion ? r.aplicacion.problemas : []),
  error: r.error || '',
}))

let completitud = null
if (!(args && args.sin_completitud)) {
  completitud = await agent(promptCompletitud(resumen.map(r => ({ bloque: r.bloque, lectores: r.lectores, extractos: r.extractos, pares: r.pares_con_relacion, fichas_rehacer: r.fichas_rehacer }))),
    opt('completitud', { label: 'completitud:fase3', phase: 'Completitud', schema: COMPLETITUD_SCHEMA, effort: 'high' }))
  if (completitud) log(`completitud: ${completitud.disputas_cubiertas}/13 disputas con primaria leida; bloque siguiente propuesto: ${completitud.bloque_siguiente.length} documentos`)
}
return { fecha: FECHA, bloques: resumen, completitud }
