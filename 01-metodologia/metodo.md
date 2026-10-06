# Método de trabajo

Este documento es la regla común para todo agente y toda persona que escriba en este repositorio. El objetivo del proyecto está en `00-plan/plan.md`: reconstruir la historia de la isla de La Española con método explícito y fuentes trazables, sin adoptar el marco de ninguno de los dos relatos nacionales.

## 1. Jerarquía de fuentes

1. **Primarias**: crónicas de la época, tratados, constituciones, decretos, censos, correspondencia diplomática, prensa de época, testimonios orales recogidos con método.
2. **Secundarias académicas** con aparato crítico (monografías, artículos revisados por pares, tesis).
3. **Divulgación** con autor identificable (prensa de opinión, ensayos sin aparato crítico).
4. **Terciarias** (enciclopedias, Wikipedia, blogs, redes sociales): sirven solo como índice para llegar a fuentes de los niveles 1 a 3. Nunca son evidencia.

## 2. Ficha de proveniencia

Toda fuente que entre en `02-fuentes/registro.csv` lleva una ficha (plantilla en `plantillas/ficha-fuente.md`) que responde: quién la escribió, cuándo, desde dónde, para quién, con qué interés, qué sabía de primera mano y qué tradición historiográfica la usa.

## 3. Triangulación

Ninguna afirmación disputada se califica como establecida (A) sin al menos dos fuentes independientes de tradiciones distintas, o una fuente primaria más una secundaria independiente. Dos fuentes que copian de la misma fuente anterior cuentan como una.

## 4. Simetría

Cada relato nacional se formula primero en su versión más fuerte y mejor documentada (`03-afirmaciones/narrativas/`). El mismo rigor se aplica a ambos. Ninguna afirmación se descarta por venir de un lado.

## 5. Escala de confianza

Ver `escala-de-confianza.md`. Toda afirmación lleva una letra (A, B, C, D) y una justificación de una o dos frases.

## 6. Hecho, interpretación y significado

Se separan siempre. Ejemplo: "Boyer abolió la esclavitud en la parte este en 1822" es un hecho; "fue una liberación" o "fue una dominación" es una interpretación; "por eso la nación dominicana nació antihaitiana" es una atribución de significado. Cada nivel se evalúa por separado.

## 7. Lenguaje neutro

Los términos cargados se registran en `glosario.md` con el nombre que les da cada lado. En el texto se usa el término descriptivo y, la primera vez, se anota cómo lo nombra cada tradición.

## 8. Silencios

Se buscan activamente las voces ausentes de los relatos estatales: taínos, esclavizados, cimarrones, mujeres, rayanos, campesinos, migrantes, Iglesia, comerciantes extranjeros, soldados rasos. Cada módulo tiene una sección "Silencios".

## 9. Cifras

Toda cifra se da como rango, con el autor y la base de cada estimación. Una cifra sin fuente primaria identificable se degrada a D hasta que se trace.

## 10. Verificación adversarial

Toda afirmación A o B pasa por cuatro escépticos independientes (lente dominicana, lente haitiana, crítica de fuentes, crítica cuantitativa) antes de entrar en la síntesis. Dos refutaciones sólidas la degradan y obligan a reescribir.

## 11. Trazabilidad

Cada frase de la síntesis enlaza a un id de fuente (`F-####`) y, cuando se pueda, a la cita textual con página, línea o URL. Nada se cita de memoria. Lo que no se pudo confirmar se marca `[POR VERIFICAR]` y no entra en la síntesis.

## 12. Límites

Lo que no se pudo consultar (archivos físicos, muros de pago, red bloqueada) se documenta en `07-sintesis/limites.md` con el motivo.

## 13. Presupuesto de búsqueda

Cada agente dispone de unas 200 búsquedas web. Las tareas se diseñan estrechas (120 búsquedas o menos) y se prefieren más agentes a agentes grandes. Cada agente informa cuántas búsquedas no pudo hacer.

## 14. Identificadores

- Fuentes: `F-0001`, `F-0002`... (columna `id` de `02-fuentes/registro.csv`).
- Afirmaciones: `A-001`, `A-002`... (`03-afirmaciones/registro.md`).
- Módulos: `M00` a `M16`. Ejes: `E1` a `E7`.
- Lentes de búsqueda: `dominicana`, `haitiana`, `colonial-primaria`, `internacional`, `cientifica`.

## 15. Formato de cita

En los textos: `[F-0012, t. 5, cap. 125]` o `[F-0031, línea 11205]` o `[F-0044, p. 17]`. En las fichas, la cita textual va en idioma original entre comillas, seguida de la traducción al español entre corchetes.

## 16. Textos descargados

Los textos de dominio público descargados se guardan en `02-fuentes/textos/` para que cualquier cita sea cotejable por número de línea. Los textos largos se procesan con descarga por `curl` y búsqueda por línea con `grep`, no con lectura web (que trunca archivos grandes).
