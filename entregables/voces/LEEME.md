# Variantes de voz (misma frase, sin posproducción)

Frase: "¿Sabías que tu celular sabe dónde estás sin mandar nada? Escucha señales de cuatro satélites, mide cuánto tardan en llegar, y con eso hace una cuenta. Parece magia, pero es pura matemática."

Son las voces neuronales de edge-tts (gratis). Se midió qué tan "viva" es cada una (variación del tono en semitonos: más alto = menos monótona)
y que Whisper entendiera la frase completa. Las voces anteriores de los reels (Elena y Tomás a +14 % / +20 %) rondaban 2,7-2,9 st.

| Archivo | Variación de tono | Comentario |
|---|---|---|
| es-ES-AlvaroNeural | 4,75 | la más expresiva, acento de España |
| fr-FR-RemyMultilingualNeural | 4,67 | multilingüe, grave y fluida; leve acento |
| it-IT-GiuseppeMultilingualNeural | 4,42 | multilingüe, masculina |
| en-US-EmmaMultilingualNeural | 4,11 | **usada en el reel de Shazam**; femenina, ritmo natural |
| es-MX-JorgeNeural | 3,86 | **usada en el reel de GPS**; masculina, neutra |
| es-US-AlonsoNeural | 3,81 | **usada en el reel de batería**; masculina, neutra |
| es-ES-XimenaNeural | 3,63 | femenina, acento de España |
| en-US-BrianMultilingualNeural | 3,27 | multilingüe, masculina |
| es-US-PalomaNeural | 3,23 | **usada en el reel de pantalla táctil**; femenina, neutra |
| es-MX-DaliaNeural | 3,21 | femenina, neutra |
| en-US-AvaMultilingualNeural | 3,21 | multilingüe, femenina |
| es-AR-ElenaNeural | 2,91 | **usada en el reel de wifi** (única con acento argentino); suena mejor con la nueva síntesis por frases |
| es-AR-TomasNeural | 2,85 | acento argentino, masculina |

Los reels usan además una síntesis frase por frase (ritmo y tono que varían) y una cadena de EQ/compresión/sala mínima: ver `scripts/explainer.py`.
Para cambiar la voz de un reel: editar `"voz"` y `"rate"` en `scripts/guiones/<id>.json` y volver a correr `explainer.py voz <id>`.
