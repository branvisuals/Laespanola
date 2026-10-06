import re, sys, os
import xml.etree.ElementTree as ET
NS = {'tei': 'http://www.tei-c.org/ns/1.0'}; TEI='{%s}' % NS['tei']; XMLID='{http://www.w3.org/XML/1998/namespace}id'
ET.register_namespace('', NS['tei'])
KW = re.compile(r'Dominican|Haiti|Hayti|Santo Domingo|San Domingo|Saint-Domingue|St\. Domingo|Trujillo|Port-au-Prince|Port au Prince|Dajab[oó]n|Massacre River', re.I)
src, outdir = sys.argv[1], sys.argv[2]; vol = os.path.basename(src).replace('.xml','')
root = ET.parse(src).getroot()
parent = {c: p for p in root.iter() for c in p}
def text(el): return re.sub(r'\s+', ' ', ' '.join(el.itertext())).strip()
def head(el):
    h = el.find('tei:head', NS); return text(h) if h is not None else ''
t = root.find('.//tei:titleStmt/tei:title', NS); title = text(t) if t is not None else vol
body = root.find('.//tei:body', NS)
included = []  # elements
def has_included_ancestor(el):
    p = parent.get(el)
    while p is not None:
        if p in included_set: return True
        p = parent.get(p)
    return False
included_set = set()
for el in body.iter(TEI+'div'):
    if el.get('type') in ('chapter','subchapter','section','compilation') and el.get('type')!='compilation' and KW.search(head(el)) and not has_included_ancestor(el):
        included.append(('heading', el)); included_set.add(el)
for el in body.iter(TEI+'div'):
    if el.get('type')=='document' and not has_included_ancestor(el) and len(KW.findall(text(el)))>=2:
        included.append(('document', el)); included_set.add(el)
# order by document position
pos = {el: i for i, el in enumerate(root.iter())}
included.sort(key=lambda x: pos[x[1]])
lines = [f'# {title}', f'Fuente: https://raw.githubusercontent.com/HistoryAtState/frus/master/volumes/{vol}.xml',
 'Extracción: capítulos, subcapítulos o secciones cuyo encabezado menciona Dominican/Haiti/Hayti/Santo Domingo/Trujillo/Port-au-Prince/Dajabón/Massacre River, más documentos sueltos con dos o más menciones.', '']
n = 0
def emit_doc(d):
    global n; n += 1
    lines.append(f'\n---\n## [{d.get(XMLID,"")}] {head(d)}')
    for p in d:
        if p.tag == TEI+'head': continue
        tx = text(p)
        if tx: lines.append(tx); lines.append('')
for kind, el in included:
    if kind == 'heading':
        lines.append(f'\n\n# {el.get("type").upper()} [{el.get(XMLID,"")}] {head(el)}')
        docs = [d for d in el.iter(TEI+'div') if d.get('type')=='document']
        if not docs: emit_doc(el)
        for d in docs: emit_doc(d)
    else: emit_doc(el)
open(os.path.join(outdir, vol+'-espanola.txt'),'w',encoding='utf-8').write('\n'.join(lines))
w = ET.Element(TEI+'TEI'); w.set('source', f'https://raw.githubusercontent.com/HistoryAtState/frus/master/volumes/{vol}.xml'); w.set('n', title)
for kind, el in included: w.append(el)
ET.ElementTree(w).write(os.path.join(outdir, vol+'-espanola.xml'), encoding='utf-8', xml_declaration=True)
print(f'{vol}: {sum(1 for k,_ in included if k=="heading")} encabezados, {sum(1 for k,_ in included if k=="document")} docs sueltos, {n} docs en total')
