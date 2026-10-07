export const meta = {
  name: 'fase2-cierre',
  description: 'Critico de cierre de la Fase 2: juzga si el barrido y su consolidacion permiten pasar a la Fase 3 y escribe 00-plan/fase2-cierre.md',
  phases: [{ title: 'Cierre', detail: 'un critico en Opus' }],
}

const REPO = 'C:\\Users\\branl\\OneDrive\\Desktop\\Claude\\La Espanola'
const REPO_SH = '/c/Users/branl/OneDrive/Desktop/Claude/La Espanola'
const FECHA = (args && args.fecha) || '2026-10-07'
const MODELO = (args && args.modelo) || undefined
const CONS = `${REPO}\\02-fuentes\\consolidacion`

const SCHEMA = {
  type: 'object',
  properties: {
    veredicto: { type: 'string', enum: ['cerrar', 'cerrar-con-condiciones', 'no-cerrar'] },
    condiciones: { type: 'array', items: { type: 'string' } },
    riesgos_fase3: { type: 'array', items: { type: 'string' } },
    glosario_problemas: { type: 'array', items: { type: 'string' } },
    decisiones_para_bran: { type: 'array', items: { type: 'string' } },
    archivo: { type: 'string' },
    busquedas_usadas: { type: 'number' },
  },
  required: ['veredicto', 'condiciones', 'riesgos_fase3', 'glosario_problemas', 'decisiones_para_bran', 'archivo', 'busquedas_usadas'],
}

const PROMPT = `
Eres el CRITICO DE CIERRE de la Fase 2 del proyecto "La Espanola: reconstruccion historica imparcial". Trabajas en ${REPO} (en Bash: ${REPO_SH}). Lee primero ${REPO}\\01-metodologia\\metodo.md y escala-de-confianza.md, la seccion 10 (Fase 2 y Fase 3) y la seccion 13 (criterios de calidad) de ${REPO}\\00-plan\\plan.md, y las ultimas seis entradas de ${REPO}\\00-plan\\decisiones.md. Python siempre con -X utf8; no uses Firecrawl; no modifiques ningun archivo salvo el que se te pide; no hagas commit.
MATERIAL QUE DEBES EXAMINAR (con python y grep, no de memoria):
- ${REPO}\\02-fuentes\\registro.csv y ${REPO}\\03-afirmaciones\\cobertura.csv: calcula por modulo y por tradicion cuantas afirmaciones tienen al menos una fuente leida (verificacion descargada-y-leida o descargada-parcial) de tradicion dominicana u oficial-rd, haitiana u oficial-haiti, internacional, y cientifica; cuantas tienen una primaria leida; y cuantas dependen solo de divulgacion. Lista las afirmaciones peor cubiertas.
- ${REPO}\\02-fuentes\\duplicados.csv (si existe) y ${CONS}\\resultados\\consolidacion-total.json (decisiones de duplicados: comprueba al azar 5 veredictos "obras-distintas" y los 5 "misma-obra" abriendo las filas del registro).
- ${CONS}\\muestra-resultados.csv: resultado del cotejo independiente de citas; comprueba tu mismo 3 pares al azar re-descargando la fuente.
- ${CONS}\\extractos-reintento.csv y la columna notas del registro con "REINT": que mejoro el reintento de acceso.
- ${REPO}\\02-fuentes\\por-modulo\\adenda-simetria.md y ${CONS}\\asimetria-haitiana.csv y asimetria-dominicana.csv: que asimetria queda.
- ${REPO}\\01-metodologia\\glosario.md (136 filas): revisa TODAS las filas con una pregunta por fila: el termino descriptivo adopta el marco de un lado? la nota atribuye sin fuente? la columna vacia ("—") esta justificada en la nota? Lista las filas problematicas con su texto exacto y la correccion que propones. Lee tambien las 13 dudas del editor en consolidacion-total.json (glosario.editor.dudas) y da tu recomendacion sobre cada una.
- ${REPO}\\07-sintesis\\limites.md: esta completo respecto a las lagunas de los modulos? (muestrea 3 modulos: compara su seccion 6 con lo que limites.md recoge).
Puedes usar hasta 25 busquedas web para comprobar algo concreto.
ESCRIBE ${REPO}\\00-plan\\fase2-cierre.md (900 a 1.500 palabras, en espanol, con tablas donde ayuden): 1. Veredicto (cerrar / cerrar con condiciones / no cerrar) y por que, con cifras. 2. Cobertura por modulo y tradicion (tabla). 3. Calidad: resultado de la muestra y de tus comprobaciones. 4. Duplicados y accesos: que se hizo y que queda. 5. Glosario: filas que corregir y recomendacion sobre las dudas del editor. 6. Asimetrias que siguen y como atacarlas en la Fase 3. 7. Riesgos para la Fase 3 (volumen de fuentes por modulo, fuentes de divulgacion, textos largos sin descargar) y propuesta de priorizacion: que 40 a 60 documentos primarios leer a fondo primero, con su F-#### y por que. 8. Decisiones que debe tomar Bran. Fecha ${FECHA}.
Devuelve la salida estructurada (veredicto, condiciones, riesgos_fase3, glosario_problemas, decisiones_para_bran, archivo, busquedas_usadas).`

log('Critico de cierre de la Fase 2')
const r = await agent(PROMPT, Object.assign({ label: 'cierre:critico', phase: 'Cierre', schema: SCHEMA, effort: 'high' }, MODELO ? { model: MODELO } : {}))
if (r) log(`veredicto: ${r.veredicto}; condiciones ${r.condiciones.length}; problemas de glosario ${r.glosario_problemas.length}; decisiones para Bran ${r.decisiones_para_bran.length}`)
return r
