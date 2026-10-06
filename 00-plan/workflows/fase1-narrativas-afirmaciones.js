export const meta = {
  name: 'fase1-narrativas-afirmaciones',
  description: 'Fase 1: tres narrativas nacionales en su version mas fuerte, registro de afirmaciones contrastables y criticos de completitud',
  phases: [
    { title: 'Narrativas', detail: 'tres narradores: dominicana, haitiana, internacional' },
    { title: 'Extraccion', detail: 'un extractor convierte las narrativas en afirmaciones' },
    { title: 'Completitud', detail: 'tres criticos por lente mas fusion final' },
  ],
}

const REGLAS = `
REGLAS COMUNES (lee antes de empezar):
- Trabajas en el repositorio /home/user/Laespanola. Lee primero /home/user/Laespanola/01-metodologia/metodo.md, escala-de-confianza.md y glosario.md, y /home/user/Laespanola/00-plan/plan.md (secciones 1, 5, 7, 8, 9).
- Lee completos los tres informes de reconocimiento en /home/user/Laespanola/00-plan/reconocimiento/ (fuentes.md, historiografia.md, evidencia-cientifica.md). Son tu punto de partida principal: contienen ~90 obras, 13 debates, cifras y URLs.
- Red: la red del entorno bloquea casi todo; WebFetch solo funciona con github.com y raw.githubusercontent.com. WebSearch funciona (devuelve fragmentos). Tienes un presupuesto maximo de 120 busquedas; usalas para llenar huecos concretos, no para redescubrir lo que ya esta en los informes. Anota cuantas usaste.
- Textos completos disponibles en /home/user/Laespanola/02-fuentes/textos/ (Las Casas 5 tomos, Pedro Martir vol. 1, Brevisima 1689, Franklin 1828, St John 1884, Schoenrich 1918, Acta de 1804, FRUS 1861-1938 extraidos). Puedes citarlos por archivo y numero de linea (usa grep -n).
- Nada de memoria sin marca: lo que confirmaste en un informe, una busqueda o un texto local se marca [VERIFICADO: fuente]; lo que sabes de memoria y no pudiste confirmar se marca [POR VERIFICAR]. Nunca inventes URLs ni citas textuales.
- Lenguaje: usa los terminos descriptivos del glosario y anota como nombra cada lado lo que describes.
- Escribe en espanol. Citas en idioma original con traduccion.
`

const NARRADORES = [
  {
    key: 'dominicana', file: 'dominicana.md', label: 'narrativa:dominicana',
    prompt: `Eres el NARRADOR de la tradicion DOMINICANA. Tu tarea es escribir la version MAS FUERTE, mejor documentada y mas coherente del relato historico nacional dominicano sobre la isla, tal como lo sostienen el Estado, la escuela (MINERD), la Academia Dominicana de la Historia y los historiadores hispanistas y nacionales (Garcia, Lugo, Pena Batlle, Balaguer, Rodriguez Demorizi, Moya Pons 1972, Balcacer, Nunez, Batista Lemaire 2025), incluyendo tambien las voces dominicanas criticas (Franco, Tolentino Dipp, Cassa, Torres-Saillant, Candelario, Garcia Pena, Sagas, Ricourt, Lora) como variantes internas del relato, claramente diferenciadas. Esto es un steelman: formula el relato como lo defenderia su mejor defensor, no lo evalues ni lo refutes.
Estructura obligatoria del archivo:
1. Resumen del relato en 300 palabras.
2. La tesis identitaria dominicana ("criollos descendientes de tainos y espanoles") en su mejor formulacion, con sus fuentes y con las variantes (hispanista, mulata/afrodominicana, diasporica).
3. Un apartado por modulo M00 a M16 (ver plan.md seccion 7): que dice el relato dominicano de ese periodo, con las afirmaciones clave numeradas (D-01, D-02...), quien las sostiene (autor, obra, ano) y fuente o URL cuando la tengas. Marca cada afirmacion con [VERIFICADO: ...] o [POR VERIFICAR].
4. Que ensena la escuela dominicana y que conmemora el Estado (27 de febrero, 16 de agosto, bicentenario de 1822, tratamiento de 1937 y de 2013).
5. Terminos propios del relato (ocupacion, dominacion, invasion, reconquista, independencia, El Corte, indio) y su funcion.
6. Lista de fuentes usadas con URL y marca de verificacion.
7. Busquedas usadas (numero) y lagunas que no pudiste cubrir.
Extension: 4000 a 7000 palabras. Escribe el archivo en /home/user/Laespanola/03-afirmaciones/narrativas/dominicana.md.`
  },
  {
    key: 'haitiana', file: 'haitiana.md', label: 'narrativa:haitiana',
    prompt: `Eres el NARRADOR de la tradicion HAITIANA. Tu tarea es escribir la version MAS FUERTE, mejor documentada y mas coherente del relato historico nacional haitiano sobre la isla, tal como lo sostienen el Estado, la escuela (MENFP), la Societe Haitienne d'Histoire y los historiadores haitianos (Madiou, Ardouin, Bellegarde, Price-Mars, Fouchard, Michel-Rolph Trouillot, Henock Trouillot, Manigat, Castor, Casimir, Hector, Hurbon, Beauvoir-Dominique, Watson Denis, Georges Michel, Theodat, Nau, Firmin), incluyendo las variantes internas (noirista vs mulatrista, indigenista, decolonial, diasporica) claramente diferenciadas. Esto es un steelman: formula el relato como lo defenderia su mejor defensor, no lo evalues ni lo refutes. Busca en frances y kreyol ademas de espanol e ingles.
Estructura obligatoria del archivo:
1. Resumen del relato en 300 palabras.
2. La tesis identitaria haitiana ("la isla es una e indivisible; descendemos de los tainos y de los africanos esclavizados de toda la isla") en su mejor formulacion: Ayiti como nombre, la Armee indigene, "J'ai venge l'Amerique", Anacaona, la doctrina constitucional 1805-1846, su lectura como seguridad anticolonial (Price-Mars, Theodat), el indigenismo literario, el vodou; con fuentes.
3. Un apartado por modulo M00 a M16 (ver plan.md seccion 7): que dice el relato haitiano de ese periodo, con las afirmaciones clave numeradas (H-01, H-02...), quien las sostiene (autor, obra, ano) y fuente o URL cuando la tengas. Presta especial atencion a 1801, 1805 (decreto de Ferrand, asedio), 1822-1844 (unificacion, abolicion), 1844 (separacion), 1863-65 (Geffrard), 1937 (kout kouto), 2013 (denationalisation). Marca cada afirmacion con [VERIFICADO: ...] o [POR VERIFICAR].
4. Que ensena la escuela haitiana sobre la Republica Dominicana (usa Gonzalez Canalda 2019 y Candio 2020 del informe de historiografia) y que conmemora el Estado (1 de enero, 18 de noviembre, 17 de octubre, 1937).
5. Terminos propios del relato (unification, reunification, scission, partie de l'Est, kout kouto, denationalisation, indigene, Ayiti) y su funcion.
6. Lista de fuentes usadas con URL y marca de verificacion.
7. Busquedas usadas (numero) y lagunas que no pudiste cubrir (especialmente fuentes en kreyol y textos escolares del MENFP).
Extension: 4000 a 7000 palabras. Escribe el archivo en /home/user/Laespanola/03-afirmaciones/narrativas/haitiana.md.`
  },
  {
    key: 'internacional', file: 'internacional.md', label: 'narrativa:internacional',
    prompt: `Eres el NARRADOR de la ACADEMIA INTERNACIONAL (EE.UU., Europa, America Latina, Caribe anglofono). Tu tarea es escribir la version MAS FUERTE y mejor documentada de como la historiografia academica internacional reciente (1990-2026) reconstruye la historia de la isla, con sus consensos y sus desacuerdos internos: James, Dubois, Geggus, Fick, Gaffield, Ferrer, Nessler, Yingling, Eller, Walker, Turits, Derby, Paulino, Cadeau, Matibag, Baud, S. Martinez, Mayes, Simmons, Roorda, Ponce Vazquez, Altman, Stone, Guitar, Pinto Tortosa, J. Gonzalez, Wigginton y Middleton, Blancpain, Diamond y sus criticos, Livi-Bacci, Henige, Cook, Keegan y Hofman, Oliver, Wilson, Deagan, mas la evidencia cientifica (Fernandes 2021, Nagele 2020, Schroeder 2018, Moreno-Estrada 2013, Bryc 2010, D'Atanasio 2020, Simms 2010/2012, Proyecto Genoma Dominicano 2026). No es un relato nacional: es el estado del arte academico, con sus propios sesgos (anglofono, revisionista, atlantico) que debes nombrar.
Estructura obligatoria del archivo:
1. Resumen en 300 palabras de los consensos academicos actuales y de los principales desacuerdos.
2. Que dice la evidencia academica y cientifica sobre las dos tesis identitarias (haitiana y dominicana): que confirma, que matiza, que refuta, con cifras como rangos y fuentes.
3. Un apartado por modulo M00 a M16 (ver plan.md seccion 7): consenso, desacuerdos, afirmaciones clave numeradas (I-01, I-02...), quien las sostiene (autor, obra, ano) y fuente o URL. Marca cada afirmacion con [VERIFICADO: ...] o [POR VERIFICAR].
4. Sesgos y limites de la academia internacional sobre este tema (idioma, acceso a archivos, agendas revisionistas, dependencia de fuentes coloniales).
5. Como trata la academia los terminos cargados de ambos relatos.
6. Lista de fuentes usadas con URL y marca de verificacion.
7. Busquedas usadas (numero) y lagunas.
Extension: 4000 a 7000 palabras. Escribe el archivo en /home/user/Laespanola/03-afirmaciones/narrativas/internacional.md.`
  },
]

const RESUMEN_SCHEMA = {
  type: 'object',
  properties: {
    archivo: { type: 'string' },
    palabras: { type: 'number' },
    n_afirmaciones: { type: 'number' },
    n_fuentes: { type: 'number' },
    busquedas_usadas: { type: 'number' },
    lagunas: { type: 'array', items: { type: 'string' } },
  },
  required: ['archivo', 'palabras', 'n_afirmaciones', 'n_fuentes', 'busquedas_usadas', 'lagunas'],
}

phase('Narrativas')
log('Lanzando tres narradores (dominicana, haitiana, internacional)')
const narrativas = await parallel(NARRADORES.map(n => () =>
  agent(REGLAS + '\n' + n.prompt + '\nAl terminar, devuelve el resumen estructurado (archivo, palabras, n_afirmaciones, n_fuentes, busquedas_usadas, lagunas).',
    { label: n.label, phase: 'Narrativas', schema: RESUMEN_SCHEMA })
))
const ok = narrativas.filter(Boolean)
log(`Narrativas terminadas: ${ok.length}/3; afirmaciones identificadas: ${ok.reduce((s, r) => s + (r.n_afirmaciones || 0), 0)}`)

phase('Extraccion')
const REGISTRO_SCHEMA = {
  type: 'object',
  properties: {
    n_afirmaciones: { type: 'number' },
    por_modulo: { type: 'object', additionalProperties: { type: 'number' } },
    por_nivel: { type: 'object', additionalProperties: { type: 'number' } },
    notas: { type: 'array', items: { type: 'string' } },
  },
  required: ['n_afirmaciones', 'por_modulo', 'por_nivel', 'notas'],
}
const EXTRACTOR = REGLAS + `
Eres el EXTRACTOR DE AFIRMACIONES. Lee completas las tres narrativas en /home/user/Laespanola/03-afirmaciones/narrativas/ (dominicana.md, haitiana.md, internacional.md) y la tabla de 13 disputas de /home/user/Laespanola/00-plan/plan.md (seccion 9). Convierte todo ello en un REGISTRO DE AFIRMACIONES CONTRASTABLES.
Reglas de extraccion:
- Una afirmacion = una frase contrastable sobre un hecho, una interpretacion o un significado (indica el nivel). Separa siempre el hecho de su interpretacion: "Boyer abolio la esclavitud en el este en 1822" (hecho) y "la abolicion de 1822 fue una liberacion" (interpretacion) son dos afirmaciones.
- Donde los relatos chocan, registra cada version como afirmacion propia y enlazalas en la columna "afirmaciones relacionadas".
- Incluye las afirmaciones identitarias centrales de ambos lados descompuestas en sus partes contrastables (p. ej. "los dominicanos actuales tienen ascendencia taina medible", "los haitianos actuales tienen ascendencia taina medible", "la isla fue reclamada entera por las constituciones haitianas de 1805 a 1846", "Haiti abandono esa reclamacion en 1874").
- Objetivo: entre 90 y 160 afirmaciones. Cubre los 17 modulos; ninguno con menos de 3.
- Para cada una: id (A-001...), enunciado, nivel (hecho/interpretacion/significado), modulo (M00..M16), eje (E1..E7 o -), quien la sostiene (tradicion: dominicana / haitiana / internacional / varias, y los ids D-xx, H-xx, I-xx de las narrativas), fuentes citadas por las narrativas, que evidencia la resolveria (que documento, cifra o estudio habria que leer), afirmaciones relacionadas, estado = pendiente, confianza provisional = sin evaluar.
Escribe DOS archivos:
1. /home/user/Laespanola/03-afirmaciones/registro.md : introduccion de 150 palabras (que es, como se usa, convenciones) y una tabla Markdown con todas las columnas anteriores, ordenada por modulo.
2. /home/user/Laespanola/03-afirmaciones/registro.csv : las mismas filas en CSV RFC 4180 con cabecera: id,enunciado,nivel,modulo,eje,quien_sostiene,ids_narrativas,fuentes,evidencia_resolutoria,relacionadas,estado,confianza
Valida el CSV con Python (mismo numero de columnas en todas las filas, ids correlativos). Devuelve el resumen estructurado.`
const registro = await agent(EXTRACTOR, { label: 'extractor', phase: 'Extraccion', schema: REGISTRO_SCHEMA })
log(`Registro inicial: ${registro ? registro.n_afirmaciones : 'FALLO'} afirmaciones`)

phase('Completitud')
const FALTANTES_SCHEMA = {
  type: 'object',
  properties: {
    faltantes: { type: 'array', items: { type: 'object', properties: {
      enunciado: { type: 'string' }, nivel: { type: 'string' }, modulo: { type: 'string' }, eje: { type: 'string' },
      quien_sostiene: { type: 'string' }, fuentes: { type: 'string' }, evidencia_resolutoria: { type: 'string' }, motivo: { type: 'string' },
    }, required: ['enunciado', 'nivel', 'modulo', 'quien_sostiene', 'evidencia_resolutoria', 'motivo'] } },
    problemas_registro: { type: 'array', items: { type: 'string' } },
  },
  required: ['faltantes', 'problemas_registro'],
}
const LENTES = [
  { key: 'dominicana', desc: 'la tradicion dominicana (oficial, escolar, hispanista y sus variantes criticas internas)' },
  { key: 'haitiana', desc: 'la tradicion haitiana (oficial, escolar, noirista, mulatrista, indigenista, decolonial)' },
  { key: 'internacional', desc: 'la academia internacional y la evidencia cientifica (genetica, ADN antiguo, demografia, arqueologia)' },
]
const criticas = await parallel(LENTES.map(l => () =>
  agent(REGLAS + `
Eres el CRITICO DE COMPLETITUD con la lente de ${l.desc}. Lee /home/user/Laespanola/03-afirmaciones/registro.md, la narrativa correspondiente a tu lente en /home/user/Laespanola/03-afirmaciones/narrativas/${l.key}.md, los tres informes de reconocimiento y la seccion 9 del plan. Pregunta: que afirmaciones relevantes de tu lente NO estan en el registro, o estan mal formuladas (mezclan hecho e interpretacion, usan un termino cargado sin declararlo, faltan versiones rivales, falta un modulo)? Usa hasta 40 busquedas si necesitas confirmar algo. Devuelve la lista de faltantes (cada una con enunciado contrastable, nivel, modulo, eje, quien la sostiene, fuentes, que evidencia la resolveria y por que falta) y los problemas de formulacion detectados en el registro actual (cita el id). No escribas archivos.`,
    { label: `critico:${l.key}`, phase: 'Completitud', schema: FALTANTES_SCHEMA })
))
const faltantes = criticas.filter(Boolean).flatMap((c, i) => c.faltantes.map(f => ({ ...f, lente: LENTES[i].key })))
const problemas = criticas.filter(Boolean).flatMap((c, i) => c.problemas_registro.map(p => `[${LENTES[i].key}] ${p}`))
log(`Criticos: ${faltantes.length} afirmaciones faltantes propuestas, ${problemas.length} problemas de formulacion`)

const FUSION = REGLAS + `
Eres el FUSIONADOR FINAL del registro de afirmaciones. Lee /home/user/Laespanola/03-afirmaciones/registro.md y registro.csv. Tres criticos de completitud han propuesto afirmaciones faltantes y problemas de formulacion. Integra: (a) anade las faltantes que no esten ya (deduplica contra el registro; si una ya existe con otra redaccion, mejora la existente en lugar de duplicar), con ids correlativos nuevos al final de cada modulo o al final del registro; (b) corrige los problemas de formulacion citados (separar hecho/interpretacion, declarar termino cargado, anadir version rival); (c) reordena por modulo y renumera los ids de forma correlativa A-001... manteniendo una columna "id_anterior" solo si cambiaste ids; (d) reescribe registro.md y registro.csv completos y coherentes entre si; (e) anade al final de registro.md una seccion "Cambios de la ronda de completitud" con lo anadido y corregido, y una seccion "Problemas no resueltos". Valida el CSV con Python.
AFIRMACIONES FALTANTES PROPUESTAS (JSON):
${JSON.stringify(faltantes, null, 1)}
PROBLEMAS DE FORMULACION (lista):
${problemas.map(p => '- ' + p).join('\n')}
Devuelve el resumen estructurado.`
const final = await agent(FUSION, { label: 'fusion-final', phase: 'Completitud', schema: REGISTRO_SCHEMA })
log(`Registro final: ${final ? final.n_afirmaciones : 'FALLO'} afirmaciones`)

return { narrativas: ok, registro_inicial: registro, faltantes_propuestas: faltantes.length, problemas, registro_final: final }