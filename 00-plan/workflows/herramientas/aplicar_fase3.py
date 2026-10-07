# -*- coding: utf-8 -*-
"""Aplica el resultado de un bloque de la Fase 3 (lectores y críticos de proveniencia) al registro y a la cobertura.
Uso, desde la raíz del repo:
    python -X utf8 00-plan/workflows/herramientas/aplicar_fase3.py 02-fuentes/consolidacion/fase3/<bloque>.json
El JSON tiene la forma {"bloque": "...", "fecha": "...", "lectores": [...], "criticos": [...]} (ver fase3-lectura-primarias.js).
Efectos: (1) columna relacion de cobertura.csv para los pares leídos (la del crítico manda sobre la del lector);
(2) pares nuevos propuestos por los lectores; (3) registro.csv: acceso texto-descargado, ruta local en url y nota F3;
(4) verificación mecánica de las citas por archivo:línea, con informe en 02-fuentes/consolidacion/fase3/verificacion-citas.csv.
Nunca borra filas ni renumera.
"""
import csv, json, os, re, sys, unicodedata

if len(sys.argv) < 2:
    sys.exit('falta el JSON del bloque')
RES = json.load(open(sys.argv[1], encoding='utf-8'))
FECHA = RES.get('fecha', '2026-10-07')
BLOQUE = RES.get('bloque', '?')
REG = os.path.join('02-fuentes', 'registro.csv')
COB = os.path.join('03-afirmaciones', 'cobertura.csv')
VER = os.path.join('02-fuentes', 'consolidacion', 'fase3', 'verificacion-citas.csv')
RELS = {'apoya', 'matiza', 'contradice', 'contexto', 'no-trata'}
RANGO_VERIF = {'fallo-fetch': 0, 'solo-localizada': 1, 'descargada-parcial': 2, 'descargada-y-leida': 3}

def leer(p):
    with open(p, encoding='utf-8', newline='') as f:
        r = csv.DictReader(f)
        return list(r), list(r.fieldnames)

def escribir(p, filas, campos):
    with open(p, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows(filas)

def norm(t):
    t = unicodedata.normalize('NFKD', t.lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()

reg, campos_reg = leer(REG)
cob, campos_cob = leer(COB)
if 'relacion' not in campos_cob:
    campos_cob.append('relacion')
    for x in cob:
        x['relacion'] = ''
afs = {a['id']: a['modulo'] for a in leer(os.path.join('03-afirmaciones', 'registro.csv'))[0]}
por_id = {r['id']: r for r in reg}
informe = {'lectores': 0, 'criticos': 0, 'relaciones_lector': 0, 'relaciones_critico': 0, 'pares_nuevos': 0, 'pares_existentes_tocados': 0,
           'filas_registro_actualizadas': 0, 'citas_comprobadas': 0, 'citas_halladas': 0, 'citas_no_halladas': 0, 'citas_sin_archivo': 0, 'ids_desconocidos': []}

# 1. relaciones del lector, luego las del crítico (mandan)
rel = {}
nuevos = []
for L in RES.get('lectores', []) or []:
    if not L:
        continue
    informe['lectores'] += 1
    fid = L['id']
    if fid not in por_id:
        informe['ids_desconocidos'].append(fid)
        continue
    for p in L.get('pares', []):
        if p['relacion'] in RELS and p['afirmacion'] in afs:
            rel[(p['afirmacion'], fid)] = (p['relacion'], p.get('ubicacion', ''))
            informe['relaciones_lector'] += 1
    for p in L.get('pares_nuevos', []):
        if p['relacion'] in RELS and p['afirmacion'] in afs:
            nuevos.append({'afirmacion': p['afirmacion'], 'fuente': fid, 'modulo': afs[p['afirmacion']], 'verificacion': 'descargada-y-leida',
                           'ubicacion': p.get('ubicacion', ''), 'fecha': FECHA, 'relacion': p['relacion']})
    r = por_id[fid]
    copias = [c for c in (L.get('copia_local') or []) if c]
    if copias:
        for c in copias:
            if c not in r['url']:
                r['url'] = (c + ' | ' + r['url']).strip(' |')
        if r['acceso'] != 'texto-descargado':
            r['acceso'] = 'texto-descargado'
    r['notas'] = (r['notas'] + f" | F3 {FECHA}: ficha 02-fuentes/primarias/{fid}.md" + (f"; copia local {copias[0]}" if copias else '; sin copia local')).strip(' |')
    informe['filas_registro_actualizadas'] += 1
for C in RES.get('criticos', []) or []:
    if not C:
        continue
    informe['criticos'] += 1
    for c in C.get('correcciones', []):
        if c['relacion_despues'] in RELS and c['afirmacion'] in afs and C['id'] in por_id:
            rel[(c['afirmacion'], C['id'])] = (c['relacion_despues'], rel.get((c['afirmacion'], C['id']), ('', ''))[1])
            informe['relaciones_critico'] += 1

# 2. aplicar a la cobertura
idx = {(x['afirmacion'], x['fuente']): x for x in cob}
for k, (r_, ubic) in rel.items():
    if k in idx:
        x = idx[k]
        x['relacion'] = r_
        if ubic and ubic not in x['ubicacion']:
            x['ubicacion'] = (x['ubicacion'] + ' ; ' + ubic).strip(' ;')
        if RANGO_VERIF.get(x['verificacion'], 0) < 3:
            x['verificacion'] = 'descargada-y-leida'
        informe['pares_existentes_tocados'] += 1
    else:
        nuevos.append({'afirmacion': k[0], 'fuente': k[1], 'modulo': afs[k[0]], 'verificacion': 'descargada-y-leida', 'ubicacion': ubic, 'fecha': FECHA, 'relacion': r_})
for n in nuevos:
    k = (n['afirmacion'], n['fuente'])
    if k in idx:
        x = idx[k]
        if not x['relacion']:
            x['relacion'] = n['relacion']
        if n['ubicacion'] and n['ubicacion'] not in x['ubicacion']:
            x['ubicacion'] = (x['ubicacion'] + ' ; ' + n['ubicacion']).strip(' ;')
    else:
        idx[k] = n
        cob.append(n)
        informe['pares_nuevos'] += 1

# 3. verificación mecánica de citas (archivo:línea)
filas_ver = []
for L in RES.get('lectores', []) or []:
    if not L:
        continue
    for e in L.get('extractos', []) or []:
        arch, linea, cita = e.get('archivo', ''), e.get('linea', 0), e.get('cita', '')
        if not arch or not os.path.exists(arch) or not cita:
            informe['citas_sin_archivo'] += 1
            filas_ver.append({'bloque': BLOQUE, 'fuente': L['id'], 'archivo': arch, 'linea': linea, 'resultado': 'sin-archivo', 'cita': cita[:120]})
            continue
        try:
            lineas = open(arch, encoding='utf-8', errors='replace').read().split('\n')
        except Exception:
            informe['citas_sin_archivo'] += 1
            continue
        informe['citas_comprobadas'] += 1
        try:
            li = int(linea)
        except Exception:
            li = 0
        ventana = norm(' '.join(lineas[max(0, li - 4): li + 3]))
        frag = norm(cita)[:60]
        hallada = bool(frag) and (frag in ventana or frag[:35] in ventana)
        if not hallada and frag:
            todo = norm(' '.join(lineas))
            hallada = frag[:35] in todo
            res = 'hallada-otra-linea' if hallada else 'no-hallada'
        else:
            res = 'hallada' if hallada else 'no-hallada'
        informe['citas_halladas' if hallada else 'citas_no_halladas'] += 1
        filas_ver.append({'bloque': BLOQUE, 'fuente': L['id'], 'archivo': arch, 'linea': linea, 'resultado': res, 'cita': cita[:120]})
os.makedirs(os.path.dirname(VER), exist_ok=True)
existe = os.path.exists(VER)
with open(VER, 'a', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['bloque', 'fuente', 'archivo', 'linea', 'resultado', 'cita'])
    if not existe:
        w.writeheader()
    w.writerows(filas_ver)

# 4. validar y escribir
ids = [r['id'] for r in reg]
assert ids == [f'F-{i:04d}' for i in range(1, len(reg) + 1)], 'ids no correlativos'
assert all(len(r) == len(campos_reg) for r in reg)
assert len(set((x['afirmacion'], x['fuente']) for x in cob)) == len(cob), 'pares repetidos'
escribir(REG, reg, campos_reg)
escribir(COB, cob, campos_cob)
print(json.dumps(informe, ensure_ascii=False, indent=1))
