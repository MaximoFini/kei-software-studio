# Referentes: patrones de reels que funcionan (software y divulgación tech)

Objetivo de @keisoftware: ganar seguidores con reels de 30 s tipo "cómo funciona X que usás todos los días", con voz en off, en Remotion.

## Nota sobre la evidencia (leer primero)

- Instagram no se puede scrapear y las búsquedas web devolvieron sobre todo guías genéricas de marketing (Opus, Planoly, CapCut, Social Media Examiner, Brand24, Adweek). No hay métricas verificadas por cuenta.
- Lo respaldado por fuentes: el gancho de los primeros 1-3 s decide la retención; abrir un "bucle de curiosidad" y cerrarlo al final; en Shorts/Reels de 15-30 s la retención suele ser mayor; mostrar el resultado o el dato clave arriba; Duolingo apuesta por humor y personaje antes que por un estilo visual rígido y reutiliza el mismo video entre plataformas. Fuentes: opus.pro/blog/instagram-reels-hook-formulas, planoly.com/blog/educational-ig-reels-tips, socialmediaexaminer.com (hooks y curiosity loops en Shorts), opus.pro/blog/ideal-youtube-shorts-length-format-retention, brand24.com/blog/duolingo-social-media-strategy, adweek.com (Duolingo).
- Los nombres de cuentas y la descripción de su mecánica salen de conocimiento general del formato, NO de métricas confirmadas en esta investigación. Verificar mirando las cuentas antes de tomarlas como verdad. Solo se toma la mecánica, nunca el contenido.

## Tabla resumen

| # | Patrón | Referentes (mecánica, no contenido) | Gancho (0-2 s) | Replicable en 30 s con voz | Prioridad |
|---|---|---|---|---|---|
| 1 | Pregunta cotidiana + respuesta contraintuitiva | Vox, Veritasium, Mark Rober (Shorts), @sciencealert | "¿Por qué el celu se calienta al cargar?" | Alta | Alta |
| 2 | Dato imposible en el cuadro 0 | Kurzgesagt (Shorts), @nasa | Cifra grande en pantalla + voz | Alta | Alta |
| 3 | Bucle abierto, cierre al final | Veritasium, Vox | "Al final te muestro el truco" | Alta | Alta |
| 4 | Pizarrón/dibujo que se arma solo | Kurzgesagt, canales de whiteboard (RSA Animate como género) | Primer trazo a los 0,3 s | Ya lo tenemos | Alta |
| 5 | Zoom por capas: de lo cotidiano al interior | Branch Education, Real Engineering | Objeto conocido que se abre | Media (cuesta dibujo) | Media |
| 6 | Mito vs. realidad | @techwithtim style, divulgadores de Shorts | "Esto que creés del wifi es falso" | Alta | Alta |
| 7 | Lista numerada corta (3 cosas) | Planoly/Opus citan números como gancho; @mkbhd Shorts | "3 cosas que hace tu app al abrir" | Alta | Alta |
| 8 | Paso a paso del viaje de un dato | Fireship (formato "en 100 s"), ByteByteGo | "Tocás Enter... y pasa esto" | Alta | Alta |
| 9 | Analogía con algo físico | Kurzgesagt, Oversimplified (género) | "El wifi es como un mozo" | Alta | Alta |
| 10 | Personaje/mascota recurrente con humor | Duolingo, Notion (humor sobrio), Canva | Mascota reacciona en 0,5 s | Media | Media |
| 11 | Serie numerada (Parte N / Cómo funciona #N) | Cuentas de series de divulgación, Duolingo | Sello "Cómo funciona #28" | Alta | Alta |
| 12 | Subtítulo palabra activa resaltada | Estilo Hormozi/Submagic en Shorts | Texto desde la 1ª palabra | Ya lo tenemos | Alta |
| 13 | Corte/cambio visual cada 2-3 s | MrBeast-style pacing aplicado a divulgación | Cambio de escena rítmico | Alta | Alta |
| 14 | Error común de usuario + solución | Cuentas de tips de apps (Canva, Notion, Excel tips) | "Dejá de cerrar apps así" | Alta | Media |
| 15 | Comparación A vs B | Divulgación tech (SSD vs HDD, 4G vs 5G) | Dos dibujos enfrentados | Alta | Media |
| 16 | CTA conversacional: "¿qué aparato explico?" | Cuentas que piden temas en comentarios | Cierre con pregunta + dibujo | Alta | Alta |
| 17 | Bucle de reproducción (final enlaza con inicio) | Shorts de alto rewatch | Última frase completa la primera | Alta | Media |
| 18 | "Detrás de escena" de software a medida | Cuentas de agencias y estudios dev | "Así hicimos que X cargue 3x más rápido" | Media | Baja (después de ganar audiencia) |

## Fichas

Formato de cada ficha: qué hace, por qué funciona, cómo replicarlo en Remotion con nuestro kit (`pizarronKit.tsx`, `explainerKit.tsx`, `w("escena","palabra")`).

### 1. Pregunta cotidiana + respuesta contraintuitiva
- Qué hace: abre con una pregunta que el espectador se hizo alguna vez y promete una respuesta rara.
- Por qué funciona: activa curiosidad en un tema propio ("lo uso todos los días"); es el gancho educativo estándar según Planoly y Opus.
- Cómo: ya es nuestra regla. Frase 1 = pregunta, escena 1 = dibujo del aparato. Variar la pregunta entre "¿por qué?" y "¿cómo sabe?".

### 2. Dato imposible en el cuadro 0
- Qué hace: un número o hecho extremo ocupa la pantalla desde el primer cuadro.
- Por qué funciona: frena el scroll sin necesitar contexto.
- Cómo: componente `DatoGrande` (cifra en Caveat Brush, 200 px) que aparece con pop en el frame 0 y se achica a la esquina cuando entra el dibujo. Ej. de mecánica: "20.000 km: lo que viaja la señal del GPS".

### 3. Bucle abierto, cierre al final
- Qué hace: promete algo en la primera frase y lo paga recién en el último tramo.
- Por qué funciona: retiene hasta el final; recomendado por Social Media Examiner (curiosity loops).
- Cómo: en el guion marcar `abre` y `cierra`; en Remotion, un signo "?" tizado en la escena 1 que se tacha/borra con el borrador en la última escena antes del cierre KEI.

### 4. Pizarrón que se arma solo
- Qué hace: trazos que se dibujan al ritmo de la voz.
- Por qué funciona: el ojo sigue el trazo; sensación de "me lo explican a mí".
- Cómo: ya implementado (`Trazo`, `Dib`). Mejora: el primer trazo debe empezar antes de los 0,3 s, nunca pantalla vacía.

### 5. Zoom por capas (de afuera hacia adentro)
- Qué hace: cámara que entra al objeto y muestra sus partes.
- Por qué funciona: da sensación de "ver lo que no se ve".
- Cómo: contenedor con `scale` y `translate` interpolados con `spring` entre dos dibujos (celu exterior → chip interior). Un solo zoom por reel para no saturar.

### 6. Mito vs. realidad
- Qué hace: afirma algo popular y lo desmiente.
- Por qué funciona: la gente reacciona y comenta ("yo creía eso").
- Cómo: tilde/tacha de tiza roja sobre el mito (0-3 s) y tilde verde sobre la realidad. Dispara comentarios, útil para el CTA.

### 7. Lista numerada corta
- Qué hace: "3 cosas..." con números gigantes.
- Por qué funciona: el número fija expectativa y duración (Planoly/Opus).
- Cómo: tres escenas de ~7 s con numeral grande dibujado a tiza; la barra de progreso ya existente refuerza el avance. Máximo 3 en 30 s.

### 8. El viaje de un dato
- Qué hace: sigue una acción (tocar Enter, pedir un Uber) a través de los sistemas.
- Por qué funciona: narrativa lineal, fácil de seguir; formato de "en 100 s" probado en tech.
- Cómo: camino de tiza con un punto que viaja (`Trazo` + marcador animado) por 4 estaciones dibujadas (celu, antena, servidor, celu). Encaja perfecto con la voz.

### 9. Analogía con algo físico
- Qué hace: traduce lo abstracto a un objeto conocido (cola de supermercado, mozo, correo).
- Por qué funciona: baja la barrera técnica; es la técnica central de la divulgación.
- Cómo: cada reel con UNA analogía dibujada; en la escena 3, el dibujo físico se transforma (morph por opacidad cruzada) en el esquema técnico.

### 10. Personaje recurrente con humor
- Qué hace: una mascota reacciona, se equivoca, comenta.
- Por qué funciona: identidad de marca y afinidad (caso Duolingo según Brand24/Adweek).
- Cómo: ya hay Einstein en `pizarronIconos.tsx`; crear 1 personaje fijo de tiza que aparece en gancho y cierre con 2-3 poses. Sin diálogo escrito (regla del usuario: sin oraciones en reels filmados; en pizarrón sí hay subtítulos).

### 11. Serie numerada
- Qué hace: sello "Cómo funciona #N".
- Por qué funciona: el perfil se vuelve un catálogo y da razón para seguir.
- Cómo: componente `Sello` fijo arriba a la izquierda (y≈200, fuera de la UI de IG) con el número tomado de la cola. Cuesta nada y ayuda a la conversión a seguidor.

### 12. Subtítulo con palabra activa
- Qué hace: 3-4 palabras por vez, la activa resaltada.
- Por qué funciona: la mayoría mira sin sonido; sostiene retención.
- Cómo: ya implementado. Mantener y = 1470 y tiza amarilla para la palabra activa.

### 13. Cambio visual cada 2-3 s
- Qué hace: nunca más de 3 s con la misma imagen.
- Por qué funciona: renueva atención; en 30 s se necesitan ~10-12 "beats".
- Cómo: regla de guion: ≥ 10 `w()` disparadores visuales por reel; auditar con hoja de contacto (`hoja_contacto.sh`) que no haya dos cuadros consecutivos idénticos.

### 14. Error común + solución
- Qué hace: "dejá de hacer X", luego explica el porqué técnico.
- Por qué funciona: dolor inmediato + utilidad; cuentas de tips de software lo explotan.
- Cómo: gancho negativo ("cerrar apps no ahorra batería"), escena de tilde/cruz; combina con patrón 6.

### 15. Comparación A vs B
- Qué hace: dos dibujos enfrentados con una diferencia clave.
- Por qué funciona: estructura binaria simple, genera debate.
- Cómo: pantalla partida con una línea de tiza vertical; cada lado dibuja su trazo en paralelo. Una sola diferencia por lado.

### 16. CTA conversacional
- Qué hace: termina pidiendo un tema en comentarios.
- Por qué funciona: los comentarios alimentan el algoritmo y dan temas gratis.
- Cómo: ya existe `CierreSeguir`. Variar la pregunta ("¿qué aparato querés que explique?" / "¿lo sabías?") para testear cuál comenta más. Anotar los temas pedidos en la cola.

### 17. Bucle de reproducción
- Qué hace: la última frase empalma con la primera.
- Por qué funciona: sube las reproducciones repetidas.
- Cómo: guion en que la última palabra completa la pregunta inicial; sin corte duro en el audio al inicio. Compatible con el cierre KEI si el CTA va antes.

### 18. Detrás de escena de software a medida
- Qué hace: muestra un caso de la empresa.
- Por qué funciona: genera confianza, pero solo con audiencia previa.
- Cómo: dejar para después; además la regla actual es no usar casos reales en el reel diario.

## Recomendaciones de ritmo y estructura (30 s)

| Tramo | Contenido | Patrón |
|---|---|---|
| 0-2 s | Pregunta o dato + dibujo ya en pantalla | 1, 2, 6 |
| 2-8 s | Por qué importa / el mito | 6, 14 |
| 8-22 s | Explicación en 3 beats con analogía | 8, 9, 7 |
| 22-26 s | Cierre del bucle | 3, 17 |
| 26-30 s | CTA a comentar + cierre KEI | 16, 11 |

## Qué testear primero (hipótesis para las 5 piezas de prueba)

1. Gancho "mito" vs. gancho "dato imposible" con el mismo tema.
2. Sello de serie "#N" presente vs. ausente.
3. CTA "¿qué explico?" vs. CTA "¿lo sabías?".
4. Analogía física vs. esquema técnico directo.

Medir con los insights de IG: retención a 3 s, vistas completas, guardados y compartidos (más valiosos que likes para crecer).
