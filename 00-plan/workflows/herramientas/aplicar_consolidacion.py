# -*- coding: utf-8 -*-
"""Aplica al registro y a la cobertura el resultado estructurado del Workflow fase2-consolidacion.js.
Uso, desde la raíz del repo:
    python -X utf8 00-plan/workflows/herramientas/aplicar_consolidacion.py <resultado.json> [--simular]
El JSON es el objeto que devuelve el Workflow (claves duplicados, acceso, muestra...). Nunca borra ni renumera filas:
las filas duplicadas se conservan con la marca "DUPLICADO DE F-####" al inicio de sus notas y se registran en
02-fuentes/duplicados.csv; en cobertura.csv el id duplicado se sustituye por el canónico y se deduplican los pares.
"""
import csv, json, os, re, sys, collections

if len(sys.argv) < 2:
    sys.exit('falta la ruta del JSON de resultado')
RES = json.load(open(sys.argv[1], encoding='utf-8'))
SIMULAR = '--simular' in sys.argv
FECHA = RES.get('fecha', '2026-10-07')
REG = os.path.join('02-fuentes', 'registro.csv')
COB = os.path.join('03-afirmaciones', 'cobertura.csv')
CONS = os.path.join('02-fuentes', 'consolidacion')
RANGO_ACCESO = {'no-localizada': 0, 'archivo-fisico': 1, 'localizada-bloqueada': 1, 'bajo-derechos': 2, 'via-resena': 3, 'fragmento-busqueda': 3,
                'pdf-en-linea': 5, 'texto-completo-en-linea': 5, 'texto-descargado': 6}
RANGO_VERIF = {'fallo-fetch': 0, 'solo-localizada': 1, 'descargada-parcial': 2, 'descargada-y-leida': 3}

def leer(p):
    with open(p, encoding='utf-8', newline='') as f:
        r = csv.DictReader(f)
        return list(r), r.fieldnames

def escribir(p, filas, campos):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows(filas)

reg, campos_reg = leer(REG)
cob, campos_cob = leer(COB)
por_id = {r['id']: r for r in reg}
assert len(campos_reg) == 12, campos_reg
informe = collections.Counter()

def union_lista(a, b, sep=';'):
    vistos = []
    for x in (a or '').split(sep) + (b or '').split(sep):
        x = x.strip()
        if x and x not in vistos:
            vistos.append(x)
    return sep.join(vistos)

def union_url(a, b):
    vistos = []
    for x in (a or '').split('|') + (b or '').split('|'):
        x = x.strip()
        if x and x not in vistos:
            vistos.append(x)
    return ' | '.join(vistos)

# ------------------------------------------------------------- 1. duplicados
mapa = {}  # duplicado -> canonico
filas_dup = []
for d in RES.get('duplicados', {}).get('decisiones', []):
    conjuntos = []
    if d['veredicto'] == 'misma-obra' and d.get('canonico'):
        conjuntos.append((d['canonico'], d.get('duplicados', []), d.get('url_canonica', '')))
    elif d['veredicto'] == 'mixto':
        for sg in d.get('subgrupos', []):
            conjuntos.append((sg['canonico'], sg.get('duplicados', []), ''))
    for canon, dups, url_canon in conjuntos:
        if canon not in por_id:
            informe['canonico_desconocido'] += 1
            continue
        for dup in dups:
            if dup == canon or dup not in por_id:
                informe['duplicado_desconocido'] += 1
                continue
            if dup in mapa:
                informe['duplicado_repetido'] += 1
                continue
            mapa[dup] = canon
            filas_dup.append({'id_duplicado': dup, 'id_canonico': canon, 'grupo': d['grupo'], 'motivo': d.get('motivo', '')[:300], 'fecha': FECHA})
        if url_canon and url_canon not in por_id[canon]['url']:
            por_id[canon]['url'] = union_url(url_canon, por_id[canon]['url'])
# resolver cadenas (dup -> canon que a su vez es dup)
def resolver(x):
    visto = set()
    while x in mapa and x not in visto:
        visto.add(x)
        x = mapa[x]
    return x
for dup in list(mapa):
    mapa[dup] = resolver(dup)
for dup, canon in mapa.items():
    rd, rc = por_id[dup], por_id[canon]
    rc['modulos'] = union_lista(rc['modulos'], rd['modulos'])
    rc['url'] = union_url(rc['url'], rd['url'])
    if RANGO_ACCESO.get(rd['acceso'], 0) > RANGO_ACCESO.get(rc['acceso'], 0):
        rc['acceso'] = rd['acceso']
    rc['notas'] = (rc['notas'] + f" | Absorbe {dup} (consolidación {FECHA})").strip(' |')
    if not rd['notas'].startswith('DUPLICADO DE'):
        rd['notas'] = f"DUPLICADO DE {canon} (consolidación {FECHA}): " + rd['notas']
    informe['filas_marcadas_duplicadas'] += 1
if filas_dup:
    existentes = []
    p_dup = os.path.join('02-fuentes', 'duplicados.csv')
    if os.path.exists(p_dup):
        existentes, _ = leer(p_dup)
    if not SIMULAR:
        escribir(p_dup, existentes + filas_dup, ['id_duplicado', 'id_canonico', 'grupo', 'motivo', 'fecha'])

# ------------------------------------------------------------- 2. acceso
extractos_nuevos = []
pares_nuevos = []
RESULTADO_A_VERIF = {'leida': 'descargada-y-leida', 'parcial': 'descargada-parcial', 'localizada-sin-texto': 'solo-localizada'}
for x in RES.get('acceso', {}).get('resultados', []):
    r = por_id.get(x['id'])
    if not r:
        informe['acceso_id_desconocido'] += 1
        continue
    res = x['resultado']
    if res in RESULTADO_A_VERIF:
        if x.get('url'):
            r['url'] = union_url(x['url'], r['url']) if x['url'] not in r['url'] else r['url']
        if RANGO_ACCESO.get(x.get('acceso'), -1) > RANGO_ACCESO.get(r['acceso'], 0):
            r['acceso'] = x['acceso']
        r['notas'] = (r['notas'] + f" | REINT {FECHA}: {res}; {x.get('nota', '')[:200]}").strip(' |')
        informe[f'acceso_{res}'] += 1
        verif = RESULTADO_A_VERIF[res]
        for e in x.get('extractos', []):
            extractos_nuevos.append({'fuente': x['id'], 'ubicacion': e['ubicacion'], 'cita_original': e['cita_original'], 'traduccion': e['traduccion'],
                                     'afirmaciones': ';'.join(e['afirmaciones']), 'fecha': FECHA})
            for a in e['afirmaciones']:
                pares_nuevos.append({'afirmacion': a, 'fuente': x['id'], 'modulo': '', 'verificacion': verif, 'ubicacion': e['ubicacion'], 'fecha': FECHA})
        for par in cob:
            if par['fuente'] == x['id'] and RANGO_VERIF.get(verif, 0) > RANGO_VERIF.get(par['verificacion'], 0):
                par['verificacion'] = verif
                informe['pares_mejorados'] += 1
    elif res == 'inexistente-o-erronea':
        r['notas'] = (r['notas'] + f" | REINT {FECHA}: inexistente o errónea; {x.get('nota', '')[:200]}").strip(' |')
        informe['acceso_inexistente'] += 1
    else:
        r['notas'] = (r['notas'] + f" | REINT {FECHA}: sigue sin localizarse; {x.get('nota', '')[:160]}").strip(' |')
        informe['acceso_no_localizada'] += 1
if extractos_nuevos and not SIMULAR:
    escribir(os.path.join(CONS, 'extractos-reintento.csv'), extractos_nuevos, ['fuente', 'ubicacion', 'cita_original', 'traduccion', 'afirmaciones', 'fecha'])

# ------------------------------------------------------------- 3. cobertura: sustituir duplicados, añadir pares, deduplicar
afs_mod = {}
try:
    afs, _ = leer(os.path.join('03-afirmaciones', 'registro.csv'))
    afs_mod = {a['id']: a['modulo'] for a in afs}
except FileNotFoundError:
    pass
for p in pares_nuevos:
    p['modulo'] = afs_mod.get(p['afirmacion'], '')
cob_total = cob + pares_nuevos
mejor = {}
for p in cob_total:
    p['fuente'] = mapa.get(p['fuente'], p['fuente'])
    k = (p['afirmacion'], p['fuente'])
    if k not in mejor:
        mejor[k] = dict(p)
    else:
        q = mejor[k]
        if RANGO_VERIF.get(p['verificacion'], 0) > RANGO_VERIF.get(q['verificacion'], 0):
            q['verificacion'] = p['verificacion']
        if p['ubicacion'] and p['ubicacion'] not in q['ubicacion']:
            q['ubicacion'] = (q['ubicacion'] + ' ; ' + p['ubicacion']).strip(' ;')
        informe['pares_fusionados'] += 1
cob_final = list(mejor.values())
informe['pares_antes'] = len(cob)
informe['pares_despues'] = len(cob_final)

# ------------------------------------------------------------- 4. muestra
mres = RES.get('muestra', {}).get('resultados', [])
if mres and not SIMULAR:
    escribir(os.path.join(CONS, 'muestra-resultados.csv'), sorted(mres, key=lambda x: x['n']),
             ['n', 'afirmacion', 'fuente', 'veredicto', 'cita_en_ficha', 'cita_hallada', 'ubicacion_real', 'nota'])
informe.update({f'muestra_{k}': v for k, v in collections.Counter(x['veredicto'] for x in mres).items()})

# ------------------------------------------------------------- 5. validar y escribir
ids = [r['id'] for r in reg]
assert ids == [f'F-{i:04d}' for i in range(1, len(reg) + 1)], 'ids no correlativos'
assert all(len(r) == 12 for r in reg)
if not SIMULAR:
    escribir(REG, reg, campos_reg)
    escribir(COB, cob_final, campos_cob)
print(json.dumps(dict(informe), ensure_ascii=False, indent=1))
print('duplicados mapeados:', len(mapa), '| extractos nuevos:', len(extractos_nuevos), '| pares nuevos:', len(pares_nuevos), '| simulación' if SIMULAR else '| aplicado')
