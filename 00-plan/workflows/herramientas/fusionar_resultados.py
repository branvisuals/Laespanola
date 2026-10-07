# -*- coding: utf-8 -*-
"""Fusiona varios resultados estructurados del Workflow fase2-consolidacion.js en uno solo para aplicar_consolidacion.py.
Uso: python -X utf8 00-plan/workflows/herramientas/fusionar_resultados.py salida.json entrada1.json entrada2.json ...
Reglas: las decisiones de duplicados se toman del primer archivo que las traiga para cada grupo; los resultados de acceso
y de la muestra se concatenan sin repetir ids ni numeros; la simetria y el glosario acumulan buscadores y registros.
"""
import json, sys

salida, entradas = sys.argv[1], sys.argv[2:]
total = {'fecha': None, 'duplicados': {'decisiones': [], 'incidencias': [], 'resumen': {}}, 'acceso': {'resultados': [], 'busquedas': 0, 'resumen': {}},
         'simetria': {'buscadores': [], 'registros': []}, 'glosario': None, 'limites': None, 'muestra': {'resultados': [], 'resumen': {}}}
grupos, ids_acc, ns_muestra = set(), set(), set()
for p in entradas:
    d = json.load(open(p, encoding='utf-8'))
    total['fecha'] = total['fecha'] or d.get('fecha')
    for x in d.get('duplicados', {}).get('decisiones', []):
        if x['grupo'] not in grupos:
            grupos.add(x['grupo'])
            total['duplicados']['decisiones'].append(x)
    total['duplicados']['incidencias'] += d.get('duplicados', {}).get('incidencias', [])
    for x in d.get('acceso', {}).get('resultados', []):
        if x['id'] not in ids_acc:
            ids_acc.add(x['id'])
            total['acceso']['resultados'].append(x)
    total['acceso']['busquedas'] += d.get('acceso', {}).get('busquedas', 0)
    sim = d.get('simetria') or {}
    total['simetria']['buscadores'] += sim.get('buscadores', []) or []
    if sim.get('registro'):
        total['simetria']['registros'].append(sim['registro'])
    if d.get('glosario') and (d['glosario'].get('editor') or d['glosario'].get('agrupadores')):
        total['glosario'] = d['glosario']
    if d.get('limites') and (d['limites'].get('redactor') or d['limites'].get('extractores')):
        total['limites'] = d['limites']
    for x in d.get('muestra', {}).get('resultados', []):
        if x['n'] not in ns_muestra:
            ns_muestra.add(x['n'])
            total['muestra']['resultados'].append(x)
def cuenta(arr, k):
    out = {}
    for x in arr:
        out[x[k]] = out.get(x[k], 0) + 1
    return out
total['duplicados']['resumen'] = cuenta(total['duplicados']['decisiones'], 'veredicto')
total['acceso']['resumen'] = cuenta(total['acceso']['resultados'], 'resultado')
total['muestra']['resumen'] = cuenta(total['muestra']['resultados'], 'veredicto')
json.dump(total, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({'decisiones': len(total['duplicados']['decisiones']), 'acceso': len(total['acceso']['resultados']), 'buscadores_simetria': [b['lente'] for b in total['simetria']['buscadores']],
                  'registros_simetria': len(total['simetria']['registros']), 'muestra': len(total['muestra']['resultados']), 'resumen_muestra': total['muestra']['resumen']}, ensure_ascii=False))
