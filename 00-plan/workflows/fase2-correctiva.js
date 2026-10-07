export const meta = {
  name: 'fase2-correctiva',
  description: 'Pasada correctiva previa a la Fase 3: desglose de fichas que agrupan varias obras, auditoria de pares de M15 y correccion del glosario segun el dictamen de cierre',
  phases: [
    { title: 'Fichas', detail: 'desglosador de fichas agrupadas' },
    { title: 'Auditoria', detail: 'auditor de los pares de cobertura de M15' },
    { title: 'Glosario', detail: 'corrector del glosario' },
  ],
}

const REPO = 'C:\\Users\\branl\\OneDrive\\Desktop\\Claude\\La Espanola'
const REPO_SH = '/c/Users/branl/OneDrive/Desktop/Claude/La Espanola'
const FECHA = (args && args.fecha) || '2026-10-07'
const MODELOS = (args && args.modelos) || {}
const opt = (rol, extra) => Object.assign({}, MODELOS[rol] ? { model: MODELOS[rol] } : {}, extra)
const CONS = `${REPO}\\02-fuentes\\consolidacion`

const REGLAS = `
REGLAS COMUNES: trabajas en ${REPO} (Bash: ${REPO_SH}); python siempre con -X utf8 y CSV con el modulo csv (encoding='utf-8', newline=''). Lee antes ${REPO}\\01-metodologia\\metodo.md (secciones 11 y 14) y escala-de-confianza.md. Nunca borres ni renumeres filas de registro.csv: los ids F-#### son correlativos y permanentes; las filas nuevas van al final con el siguiente id. Nada de memoria sin marca: lo que no confirmes en los archivos del repositorio o con un fetch va con [POR VERIFICAR]. No hagas commit ni push. Otros agentes trabajan a la vez: toca solo los archivos que tu tarea nombra. Escribe en espanol.
`

const DESGLOSE_SCHEMA = {
  type: 'object',
  properties: {
    filas_nuevas: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, desde: { type: 'string' }, titulo: { type: 'string' }, pares_movidos: { type: 'number' } }, required: ['id', 'desde', 'titulo', 'pares_movidos'] } },
    pares_reasignados_f0137: { type: 'number' },
    pares_ambiguos: { type: 'array', items: { type: 'string' } },
    archivos_modificados: { type: 'array', items: { type: 'string' } },
    problemas: { type: 'array', items: { type: 'string' } },
  },
  required: ['filas_nuevas', 'pares_reasignados_f0137', 'pares_ambiguos', 'archivos_modificados', 'problemas'],
}

const AUDITORIA_SCHEMA = {
  type: 'object',
  properties: {
    pares_revisados: { type: 'number' },
    acciones: { type: 'array', items: { type: 'object', properties: {
      afirmacion: { type: 'string' }, fuente: { type: 'string' }, accion: { type: 'string', enum: ['retirar', 'reasignar'] }, nueva_afirmacion: { type: 'string' }, motivo: { type: 'string' },
    }, required: ['afirmacion', 'fuente', 'accion', 'nueva_afirmacion', 'motivo'] } },
    patron_detectado: { type: 'string' },
    otros_modulos_sospechosos: { type: 'array', items: { type: 'string' } },
  },
  required: ['pares_revisados', 'acciones', 'patron_detectado', 'otros_modulos_sospechosos'],
}

const GLOSARIO_SCHEMA = {
  type: 'object',
  properties: {
    filas_antes: { type: 'number' }, filas_despues: { type: 'number' }, filas_corregidas: { type: 'number' }, filas_nuevas: { type: 'number' },
    justificaciones_reformuladas: { type: 'number' }, pendientes_por_verificar: { type: 'array', items: { type: 'string' } }, archivo_cambios: { type: 'string' },
  },
  required: ['filas_antes', 'filas_despues', 'filas_corregidas', 'filas_nuevas', 'justificaciones_reformuladas', 'pendientes_por_verificar', 'archivo_cambios'],
}

const P_DESGLOSE = `${REGLAS}
Eres el DESGLOSADOR DE FICHAS. Politica aprobada: una fila del registro por OBRA; una obra en varios tomos sigue siendo una fila (el tomo va en la ubicacion de la cita). Cuatro filas de ${REPO}\\02-fuentes\\registro.csv agrupan obras DISTINTAS bajo un solo id, segun el dictamen ${REPO}\\00-plan\\fase2-cierre.md (seccion 4) y las notas de los registradores: F-0065, F-0109, F-0069 y F-0075. Ademas, F-0119 contiene extractos de la obra "Terreurs de frontiere" que pertenecen a F-0137.
PROCEDIMIENTO, para cada una de las cuatro filas:
1. Lee la fila en registro.csv; con grep -n busca su id en los 17 ${REPO}\\02-fuentes\\por-modulo\\M##.md (fichas de la seccion 2 y tablas de extractos) y en ${REPO}\\03-afirmaciones\\cobertura.csv (columna fuente). Identifica que obras distintas se esconden ahi (titulos, anos, editoriales, URLs distintas en la celda url separadas por " | ", ubicaciones que nombran otra obra).
2. Decide la obra principal, que conserva el id, y crea UNA fila nueva por cada otra obra al final de registro.csv (siguiente F-#### correlativo; 12 columnas; tipo, autor, titulo, anio, idioma, tradicion, modulos, url (solo las URL que correspondan a esa obra), acceso, fiabilidad, notas = "Desglosada de F-xxxx el ${FECHA}: ..."). Quita de la fila original las URL y los datos que pasan a las nuevas y anota en sus notas "Desglose ${FECHA}: pasan a F-yyyy (titulo)...".
3. En cobertura.csv, cambia la columna fuente de cada par cuya ubicacion o extracto pertenezca claramente a una obra nueva; conserva los demas en la fila original. Si un par no se puede atribuir con seguridad, dejalo en la original y listalo en pares_ambiguos con el motivo. Si al mover un par se repite (misma afirmacion y misma fuente), fusiona conservando la mejor verificacion y uniendo ubicaciones. No toques la columna relacion.
4. En los M##.md NO reescribas fichas: anade al final de cada ficha afectada una linea "- Desglose ${FECHA}: la obra <titulo> tiene ahora el id F-yyyy" (una linea por obra nueva) para que el lector encuentre el id correcto.
5. F-0119 y F-0137: identifica los extractos y pares de F-0119 que son de "Terreurs de frontiere" (segun la ficha de F-0137 y las ubicaciones) y cambialos a F-0137 en cobertura.csv; anota en las notas de ambas filas lo hecho. No fusiones las filas.
6. Valida con python -X utf8: registro.csv 12 columnas, ids correlativos sin huecos, sin duplicar ids; cobertura.csv con sus 7 columnas y sin pares repetidos.
Devuelve la salida estructurada (filas_nuevas con id, desde, titulo y pares movidos; pares_reasignados_f0137; pares_ambiguos; archivos_modificados; problemas).`

const P_AUDITORIA = `${REGLAS}
Eres el AUDITOR DE M15. El dictamen de cierre encontro que al renumerar las afirmaciones en la Fase 1 algunos ids provisionales se reutilizaron, y que en M15 hay pares de cobertura enlazados a una afirmacion que no es la que trata el extracto (caso A-210/F-2619, ya retirado). Tu tarea es revisar TODOS los pares de M15 y devolver la lista de los que hay que retirar o reasignar. NO modifiques ningun archivo.
PROCEDIMIENTO:
1. Lee las afirmaciones de M15 en ${REPO}\\03-afirmaciones\\registro.csv (modulo == M15: id, enunciado, nivel, id_anterior) y tambien las de los modulos vecinos M14 y M16, porque un par mal enlazado suele pertenecer a una afirmacion contigua.
2. Lee los pares con modulo == M15 de ${REPO}\\03-afirmaciones\\cobertura.csv (unos 680) y, para cada fuente, su ficha en ${REPO}\\02-fuentes\\por-modulo\\M15.md (seccion 2: tabla de extractos con la columna Afirmaciones) y la matriz de la seccion 3.
3. Para cada par comprueba que el extracto o la ficha tratan de verdad el asunto del enunciado de esa afirmacion. Si el extracto trata otra afirmacion (por ejemplo, el enunciado habla de deportaciones de 1991 y el extracto de Yean y Bosico), propon "reasignar" a la afirmacion correcta (id A-###) o "retirar" si no hay ninguna que encaje. Se estricto pero no confundas "matiza" o "contexto" con "no relacionado": un extracto que aporta contexto del mismo asunto es un par valido.
4. Si detectas un patron (p. ej. todos los pares de un buscador concreto desplazados en una posicion, o un id provisional reutilizado), describelo en patron_detectado y, si el mismo patron podria afectar a otros modulos (mira ${REPO}\\03-afirmaciones\\registro.csv, columna id_anterior, y los raw/M15-*.json en ${REPO}\\02-fuentes\\por-modulo\\raw\\), nombralos en otros_modulos_sospechosos con el motivo.
Devuelve la salida estructurada (pares_revisados, acciones, patron_detectado, otros_modulos_sospechosos).`

const P_GLOSARIO = `${REGLAS}
Eres el CORRECTOR DEL GLOSARIO. El glosario ${REPO}\\01-metodologia\\glosario.md (136 filas en bloques) fija el lenguaje del corpus. El critico de cierre dejo en ${REPO}\\00-plan\\fase2-cierre.md (seccion 5) y en ${CONS}\\resultados\\cierre-critico.json (clave glosario_problemas, 17 entradas) una lista de correcciones con el texto exacto de cada fila y la correccion propuesta, y sus recomendaciones sobre las 13 dudas del editor (las dudas estan en ${CONS}\\resultados\\consolidacion-total.json, clave glosario.editor.dudas). Criterios aprobados por Bran: aplicar las 17 correcciones y las recomendaciones sobre las dudas; marcar [POR VERIFICAR] donde el critico lo pidio; simetria estricta.
TAREAS:
1. Aplica una por una las 17 correcciones (incluidas las generales: reformular las 29 justificaciones de columna vacia que dicen "las propuestas no traen" como "las fuentes leidas de la tradicion X no registran..."; anadir las dos filas que faltan por simetria: el antidominicanismo (Cassa 2022) y el lexico haitiano de color (grimaud, marabou...), buscando primero esos terminos en ${CONS}\\glosario-candidatos-*.csv y en ${CONS}\\terminos-propuestos.csv para atribuirlos; si no hay fuente en el corpus, la fila entra con [POR VERIFICAR]).
2. Aplica las recomendaciones del critico sobre las 13 dudas del editor (por ejemplo: duda 3, el termino de 1937 pasa a "haitianos y personas de ascendencia haitiana nacidas en RD"; duda 4, aprobar el cambio en "batey"; duda 5, rotular las traducciones como "(traduccion)"; duda 7, bloque "Etiquetas de la critica academica").
3. Para la fila 7 (doctrina 1805-1846) coteja tu mismo los articulos en mjp.univ-perp.fr (constituciones de 1805, 1816 y 1946) con WebFetch o curl antes de reescribirla; hasta 10 busquedas o fetch en total para todo el encargo.
4. Conserva el formato: introduccion, bloques con subtitulo y tabla de 4 columnas; cada fila con los modulos entre corchetes al final de la nota. Valida con python que todas las filas de tabla tienen 4 columnas.
5. Escribe ${CONS}\\glosario-cambios-correctiva.md con una tabla: fila (termino descriptivo), antes, despues, motivo (que correccion del critico o que duda del editor), para que Bran pueda revertir cualquiera.
Devuelve la salida estructurada (filas_antes, filas_despues, filas_corregidas, filas_nuevas, justificaciones_reformuladas, pendientes_por_verificar, archivo_cambios).`

log('Pasada correctiva: desglosador, auditor de M15 y corrector del glosario en paralelo')
const [desglose, auditoria, glosario] = await parallel([
  () => agent(P_DESGLOSE, opt('desglosador', { label: 'fichas:desglose', phase: 'Fichas', schema: DESGLOSE_SCHEMA, effort: 'high' })),
  () => agent(P_AUDITORIA, opt('auditor', { label: 'auditoria:M15', phase: 'Auditoria', schema: AUDITORIA_SCHEMA, effort: 'high' })),
  () => agent(P_GLOSARIO, opt('corrector', { label: 'glosario:corrector', phase: 'Glosario', schema: GLOSARIO_SCHEMA, effort: 'high' })),
])
if (desglose) log(`desglose: ${desglose.filas_nuevas.length} filas nuevas, ${desglose.pares_reasignados_f0137} pares a F-0137, ${desglose.pares_ambiguos.length} ambiguos`)
if (auditoria) log(`auditoria M15: ${auditoria.pares_revisados} pares revisados, ${auditoria.acciones.length} acciones; patron: ${auditoria.patron_detectado.slice(0, 120)}`)
if (glosario) log(`glosario: ${glosario.filas_antes} -> ${glosario.filas_despues} filas, ${glosario.filas_corregidas} corregidas, ${glosario.filas_nuevas} nuevas`)
return { fecha: FECHA, desglose, auditoria, glosario }
