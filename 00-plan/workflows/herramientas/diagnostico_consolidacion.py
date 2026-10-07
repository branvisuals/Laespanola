# -*- coding: utf-8 -*-
"""Diagnóstico mecánico previo a la consolidación de cierre de la Fase 2.
Genera en 02-fuentes/consolidacion/ las listas que consumen los agentes del Workflow
fase2-consolidacion.js. No modifica el registro ni la cobertura. Ejecutar desde la raíz del repo:
    python -X utf8 00-plan/workflows/herramientas/diagnostico_consolidacion.py
"""
import csv, re, os, glob, random, unicodedata, collections, json

RAIZ = os.getcwd()
OUT = os.path.join('02-fuentes', 'consolidacion')
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.join(OUT, 'lagunas'), exist_ok=True)

def leer(p):
    with open(p, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))

def escribir(p, filas, campos):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction='ignore')
        w.writeheader()
        for r in filas:
            w.writerow(r)

reg = leer(os.path.join('02-fuentes', 'registro.csv'))
cob = leer(os.path.join('03-afirmaciones', 'cobertura.csv'))
afs = leer(os.path.join('03-afirmaciones', 'registro.csv'))
por_id = {r['id']: r for r in reg}
af_por_id = {a['id']: a for a in afs}
PERIODO = {}
for m in range(0, 17):
    mid = f'M{m:02d}'
    PERIODO[mid] = 'colonial' if m <= 5 else ('siglo-xix' if m <= 11 else 'siglos-xx-xxi')

def nurl(u):
    u = u.split('|')[0].strip().lower()
    u = re.sub(r'^https?://(www\.)?', '', u)
    u = re.sub(r'[?#].*$', '', u)
    return u.rstrip('/')

def norm(t):
    t = unicodedata.normalize('NFKD', t.lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()

# ---------------------------------------------------------------- 1. duplicados
padre = {r['id']: r['id'] for r in reg}
def find(x):
    while padre[x] != x:
        padre[x] = padre[padre[x]]
        x = padre[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        padre[max(ra, rb)] = min(ra, rb)
criterios = collections.defaultdict(set)
byurl = collections.defaultdict(list)
for r in reg:
    if r['url'].strip():
        byurl[nurl(r['url'])].append(r['id'])
for ids in byurl.values():
    if len(ids) > 1:
        for i in ids[1:]:
            union(ids[0], i)
        for i in ids:
            criterios[i].add('url')
byat = collections.defaultdict(list)
for r in reg:
    autor = r['autor'].strip()
    ap = norm(autor).split(' ')[0] if autor and autor != '—' else ''
    ti = ' '.join(norm(r['titulo']).split(' ')[:6])
    if ti:
        byat[(ap, ti)].append(r['id'])
for ids in byat.values():
    if len(ids) > 1:
        for i in ids[1:]:
            union(ids[0], i)
        for i in ids:
            criterios[i].add('autor-titulo')
for r in reg:
    if re.search(r'duplic|misma obra|mismo (pdf|documento|volumen|opusculo|opúsculo)', r['notas'], re.I):
        for otro in set(re.findall(r'F-\d{4}', r['notas'])):
            if otro in padre and otro != r['id']:
                union(r['id'], otro)
                criterios[r['id']].add('nota')
                criterios[otro].add('nota')
grupos = collections.defaultdict(list)
for r in reg:
    grupos[find(r['id'])].append(r['id'])
grupos = {k: v for k, v in grupos.items() if len(v) > 1}
filas_dup = []
for n, (k, ids) in enumerate(sorted(grupos.items()), 1):
    for i in sorted(ids):
        r = por_id[i]
        filas_dup.append({
            'grupo': n, 'criterio': '+'.join(sorted(criterios[i])) or 'transitivo', 'id': i, 'tipo': r['tipo'],
            'autor': r['autor'], 'titulo': r['titulo'], 'anio': r['anio'], 'idioma': r['idioma'], 'tradicion': r['tradicion'],
            'modulos': r['modulos'], 'url': r['url'][:400], 'acceso': r['acceso'], 'fiabilidad': r['fiabilidad'], 'notas': r['notas'][:400],
        })
escribir(os.path.join(OUT, 'candidatos-duplicados.csv'), filas_dup,
         ['grupo', 'criterio', 'id', 'tipo', 'autor', 'titulo', 'anio', 'idioma', 'tradicion', 'modulos', 'url', 'acceso', 'fiabilidad', 'notas'])
n_grupos = len(grupos)

# ---------------------------------------------------------------- 2. reintentar acceso
af_de = collections.defaultdict(set)
verif_de = collections.defaultdict(set)
for x in cob:
    af_de[x['fuente']].add(x['afirmacion'])
    verif_de[x['fuente']].add(x['verificacion'])
reintentar = []
for r in reg:
    motivos = []
    if not r['url'].strip():
        motivos.append('sin-url')
    if r['acceso'] == 'no-localizada':
        motivos.append('no-localizada')
    if r['acceso'] == 'localizada-bloqueada':
        motivos.append('localizada-bloqueada')
    if 'fallo-fetch' in verif_de[r['id']]:
        motivos.append('fallo-fetch')
    if motivos:
        reintentar.append({
            'id': r['id'], 'motivo': '+'.join(motivos), 'tipo': r['tipo'], 'autor': r['autor'], 'titulo': r['titulo'], 'anio': r['anio'],
            'idioma': r['idioma'], 'tradicion': r['tradicion'], 'modulos': r['modulos'], 'url': r['url'][:400], 'acceso': r['acceso'],
            'afirmaciones': ';'.join(sorted(af_de[r['id']])), 'notas': r['notas'][:400],
        })
escribir(os.path.join(OUT, 'reintentar-acceso.csv'), reintentar,
         ['id', 'motivo', 'tipo', 'autor', 'titulo', 'anio', 'idioma', 'tradicion', 'modulos', 'url', 'acceso', 'afirmaciones', 'notas'])

# ---------------------------------------------------------------- 3. asimetria
trad = {r['id']: r['tradicion'] for r in reg}
leidas = collections.defaultdict(list)
for x in cob:
    if x['verificacion'] in ('descargada-y-leida', 'descargada-parcial'):
        leidas[x['afirmacion']].append((x['fuente'], trad.get(x['fuente'], '?')))
HAIT = {'haitiana', 'oficial-haiti'}
DOM = {'dominicana', 'oficial-rd'}
def fila_asim(a, falta):
    return {
        'afirmacion': a['id'], 'modulo': a['modulo'], 'nivel': a['nivel'], 'falta': falta, 'enunciado': a['enunciado'],
        'quien_sostiene': a['quien_sostiene'], 'evidencia_resolutoria': a['evidencia_resolutoria'],
        'fuentes_leidas': ';'.join(f'{f}:{t}' for f, t in sorted(set(leidas[a['id']]))),
    }
sin_h = [fila_asim(a, 'haitiana') for a in afs if not ({t for _, t in leidas[a['id']]} & HAIT)]
sin_d = [fila_asim(a, 'dominicana') for a in afs if not ({t for _, t in leidas[a['id']]} & DOM)]
campos_asim = ['afirmacion', 'modulo', 'nivel', 'falta', 'enunciado', 'quien_sostiene', 'evidencia_resolutoria', 'fuentes_leidas']
escribir(os.path.join(OUT, 'asimetria-haitiana.csv'), sin_h, campos_asim)
escribir(os.path.join(OUT, 'asimetria-dominicana.csv'), sin_d, campos_asim)

# ---------------------------------------------------------------- 4. terminos propuestos (seccion 5 de cada M##.md)
terminos = []
lag_tam = {}
for f in sorted(glob.glob(os.path.join('02-fuentes', 'por-modulo', 'M*.md'))):
    mid = os.path.basename(f)[:3]
    if not re.fullmatch(r'M\d\d', mid):
        continue
    t = open(f, encoding='utf-8').read()
    s5 = re.search(r'^## 5\..*?(?=^## 6\.)', t, re.S | re.M)
    s6 = re.search(r'^## 6\..*?(?=^## 7\.)', t, re.S | re.M)
    if s5:
        for l in s5.group(0).split('\n'):
            if not l.startswith('|') or re.match(r'^\|\s*:?-', l):
                continue
            celdas = [c.strip() for c in l.strip().strip('|').split('|')]
            if len(celdas) < 2:
                continue
            if re.search(r't[eé]rmino', celdas[0], re.I) and re.search(r'tradici', ' '.join(celdas[1:]), re.I):
                continue  # cabecera
            terminos.append({'modulo': mid, 'periodo': PERIODO[mid], 'termino': celdas[0], 'tradicion': celdas[1] if len(celdas) > 1 else '',
                             'nota': ' | '.join(celdas[2:]) if len(celdas) > 2 else ''})
    if s6:
        with open(os.path.join(OUT, 'lagunas', f'{mid}.md'), 'w', encoding='utf-8', newline='\n') as g:
            g.write(f'# Lagunas y búsquedas pendientes de {mid} (sección 6 de {mid}.md, copia para la consolidación)\n\n')
            g.write(s6.group(0))
        lag_tam[mid] = len(s6.group(0))
escribir(os.path.join(OUT, 'terminos-propuestos.csv'), terminos, ['modulo', 'periodo', 'termino', 'tradicion', 'nota'])

# ---------------------------------------------------------------- 5. muestra de control (30 pares)
random.seed(20261007)
cand = [x for x in cob if x['verificacion'] == 'descargada-y-leida' and x['ubicacion'].strip() and por_id.get(x['fuente'], {}).get('url', '').strip()]
por_mod = collections.defaultdict(list)
for x in cand:
    por_mod[x['modulo']].append(x)
muestra = []
mods = sorted(por_mod)
for mid in mods:
    muestra.append(random.choice(por_mod[mid]))
resto = [x for x in cand if x not in muestra]
random.shuffle(resto)
muestra += resto[:30 - len(muestra)]
filas_m = []
for i, x in enumerate(muestra, 1):
    r = por_id[x['fuente']]
    filas_m.append({'n': i, 'afirmacion': x['afirmacion'], 'enunciado': af_por_id.get(x['afirmacion'], {}).get('enunciado', '')[:300],
                    'fuente': x['fuente'], 'modulo': x['modulo'], 'ubicacion': x['ubicacion'], 'autor': r['autor'], 'titulo': r['titulo'],
                    'anio': r['anio'], 'url': r['url'][:400], 'acceso': r['acceso']})
escribir(os.path.join(OUT, 'muestra-control.csv'), filas_m,
         ['n', 'afirmacion', 'enunciado', 'fuente', 'modulo', 'ubicacion', 'autor', 'titulo', 'anio', 'url', 'acceso'])

# ---------------------------------------------------------------- resumen
resumen = {
    'grupos_duplicados': n_grupos, 'filas_en_grupos': len(filas_dup), 'fuentes_a_reintentar': len(reintentar),
    'afirmaciones_sin_haitiana_leida': len(sin_h), 'afirmaciones_sin_dominicana_leida': len(sin_d),
    'terminos_propuestos': len(terminos), 'modulos_con_lagunas': len(lag_tam), 'muestra': len(filas_m),
}
with open(os.path.join(OUT, 'README.md'), 'w', encoding='utf-8', newline='\n') as g:
    g.write('# Consolidación de cierre de la Fase 2\n\nArchivos generados por `00-plan/workflows/herramientas/diagnostico_consolidacion.py` '
            'como insumo del Workflow `fase2-consolidacion.js`. Son listas de trabajo, no evidencia.\n\n')
    g.write('| Archivo | Contenido | Tamaño |\n|---|---|---|\n')
    g.write(f"| `candidatos-duplicados.csv` | filas del registro agrupadas por URL compartida, autor+título o nota de duplicado | {n_grupos} grupos, {len(filas_dup)} filas |\n")
    g.write(f"| `reintentar-acceso.csv` | fuentes sin URL, no localizadas, bloqueadas o con fallo de fetch | {len(reintentar)} fuentes |\n")
    g.write(f"| `asimetria-haitiana.csv` / `asimetria-dominicana.csv` | afirmaciones sin ninguna fuente leída de esa tradición | {len(sin_h)} / {len(sin_d)} |\n")
    g.write(f"| `terminos-propuestos.csv` | términos cargados propuestos en la sección 5 de los M##.md | {len(terminos)} |\n")
    g.write(f"| `lagunas/M##.md` | copia de la sección 6 de cada módulo | {len(lag_tam)} archivos |\n")
    g.write(f"| `muestra-control.csv` | 30 pares afirmación-fuente al azar (semilla 20261007) con la fuente leída, para cotejo independiente | {len(filas_m)} |\n")
print(json.dumps(resumen, ensure_ascii=False, indent=1))
