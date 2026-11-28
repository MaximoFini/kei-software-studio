# Voz más natural y más argentina

Estado: investigación y pruebas; **no integrado** al pipeline (`explainer.py` sin tocar). Muestras: `entregables/voces/argentino/`.

## Qué se midió y qué no
Se sintetizaron dos guiones rioplatenses nuevos (`scripts/guiones/pruebas/`) con 17 variantes y se midió inteligibilidad (Whisper small) y variación de tono (F0). **No se escuchó nada**: naturalidad y acento los decide el oído del usuario. Los números dicen que las es-AR se entienden igual de bien (95-99 %) y que la variación de tono es de 2,6-3,0 st (menos que Emma, 4,3); es decir, la mejora esperable viene sobre todo del **texto**, no del parámetro.

## Recomendación
1. **Corto plazo (sin instalar nada):** es-AR Elena (voz femenina) o es-AR Tomás (masculina) con guion rioplatense, síntesis frase por frase y la cadena POST_VOZ actual.
   - Elena: `rate` +4 %, pitch base 0 Hz (explainer ya aplica +6 Hz a preguntas, -2 Hz a cierres).
   - Tomás: `rate` +4 %, pitch 0 Hz. Bajar pitch (-6 Hz) o rate (-3 %) no mejoró nada medible (peor Whisper).
   - Evitar +10 % en Elena: Whisper cae a 91 %.
2. Escuchar `elena_base`, `tomas_gps_base`, `valentina_uy`, `mateo_uy` contra `jorge_mx`/`paloma_us` (las actuales). Uruguay es rioplatense real, pero su acento es más marcado y la variación de tono es la más baja.
3. Si ninguna convence: ElevenLabs (ver abajo) es la única opción realmente más natural, pero de pago para uso comercial.

## Lo que edge-tts NO permite
- **SSML**: edge-tts 7.x escapa el texto y arma su propio SSML (solo `rate`, `pitch`, `volume`); `<break>` y `<emphasis>` no funcionan (prueba `ssml_crudo_elena`, Whisper 60 %). Las pausas y énfasis se logran con **puntuación, frases cortas separadas** (ya lo hace explainer) y `apad` entre frases.
- No hay "estilos" (alegre, cercano) en es-AR.

## Alternativas TTS (investigación web) y viabilidad en esta máquina
Máquina: Windows, 4 núcleos, **AMD Radeon Vega 8 integrada, sin GPU NVIDIA/CUDA** (Whisper ya corre con `use_gpu=false` y tarda ~1 min por muestra).
| Opción | Argentino | Licencia | Viable aquí |
|---|---|---|---|
| Piper | solo voces comunitarias no oficiales, no verificado que haya rioplatense | MIT | CPU rápido, pero calidad menor que edge-tts; no instalado |
| Kokoro | tiene español, sin voz rioplatense identificada | Apache 2.0 | CPU posible, lento; no probado |
| XTTS-v2 fine-tune argentino (UNRN, HF) | sí, clona con clip corto | Coqui CPML: no comercial | Sin GPU: minutos por frase; no |
| F5-TTS Spanish (jpgallegoar) | datos con español argentino, clona | CC-BY-NC | Sin GPU inviable; no comercial |
| ElevenLabs | voces argentinas en su librería (p. ej. Agustín) | plan gratis = no comercial y con atribución; comercial desde Starter (~USD 6/mes) | Es API web, anda en cualquier máquina; clonar voz propia exige plan pago |
No se instaló nada: ninguna es liviana + rápida + comercialmente libre + rioplatense a la vez. Clonar la voz propia (o de alguien con permiso) sería la vía más "argentina", mejor hecha en ElevenLabs de pago o en una máquina con GPU (Colab para probar, no producción).

## Reglas de escritura de guion rioplatense (lo que más pesa)
- **Voseo**: "mirá", "fijate", "pasate", "seguinos", "querés", "usás", "te errás" (acento en la última sílaba: "mirá", no "mira").
- **Muletillas moderadas**: máximo 1 cada 2 frases ("mirá", "ojo", "o sea", "che", "fijate"); "che" solo al inicio del reel como mucho una vez. Nunca tres seguidas.
- **Frases de 6-12 palabras**, una idea por frase; el punto es la pausa. Preguntas cortas para el gancho.
- **Vocabulario**: "laburar", "charlar", "pisar", "listo" como cierre; evitar "adquirir", "utilizar", "descubrí la solución", tono de publicidad.
- **Números y siglas en letras** como en el pipeline ("dos coma cuatro gigahercios", "cinco gigas").
- **Sin "vos" explícito** salvo énfasis; "tu" para posesivos ("tu celular").
- Evitar "ll/y" sheísmo en el texto: el TTS es-AR ya lo hace; no escribir fonético.
- Verificar que Whisper lo transcriba igual (mide trabas de pronunciación) antes de renderizar.

## Cómo integrarlo (sin hacerlo aún)
1. Copiar el guion de `scripts/guiones/pruebas/<id>_rioplatense.json` a `scripts/guiones/<id>.json` (agregar `pausa`, `gap`, `fps`, `musica` del original).
2. Fijar `"voz": "es-AR-ElenaNeural"` (o Tomás) y `"rate": "+4%"`.
3. `py scripts/explainer.py voz <id>` regenera `remotion/public/<id>_voz.wav` y `remotion/src/<id>Voz.json` (tiempos por palabra); revisar que las escenas sigan alineadas con la duración nueva (el texto cambió: ajustar subtítulos/animaciones).
4. Medir con `scripts/probar_voz_argentina.py` y `scripts/prosodia.py`, escuchar, y recién entonces renderizar.
