# Muestras de voz rioplatense (pruebas)

Texto: `scripts/guiones/pruebas/gps_rioplatense.json` (las `tomas_base`, `tomas_entero` y `tomas_grave_lento` usan `wifi_rioplatense.json`; `tomas_gps_base` usa el de GPS).
Todas pasaron por la misma cadena del pipeline (POST_VOZ + loudnorm -14 LUFS). Se generan con `scripts/probar_voz_argentina.py`.

Qué se midió (solo esto; no se pudo escuchar): **Whisper** = qué tan bien lo transcribe (inteligibilidad, ~100 % = se entiende todo) y **variación de tono** en semitonos (más alto = menos monótona). Que suene natural y argentina lo decide tu oído.

| Archivo | Qué es | Whisper | Variación |
|---|---|---|---|
| elena_base | es-AR Elena, +4 %, frase por frase | 99,2 | 3,01 |
| elena_entero | Elena, todo el texto de una sola vez | 99,2 | 3,05 |
| elena_lenta_grave | Elena -4 % rate, -4 Hz | 96,7 | 3,00 |
| elena_rapida_viva | Elena +10 %, +3 Hz | 91,2 | 3,02 |
| tomas_gps_base | es-AR Tomás, +4 %, frase por frase | 99,2 | 2,74 |
| tomas_base | Tomás, texto wifi | 95,0 | 2,63 |
| tomas_entero | Tomás, wifi, de una vez | 95,0 | 2,60 |
| tomas_grave_lento | Tomás -3 %, -6 Hz, wifi | 93,3 | 2,56 |
| valentina_uy / mateo_uy | es-UY (rioplatense, Uruguay) | 96,1 / 96,8 | 2,99 / 2,74 |
| catalina_cl / lorenzo_cl | es-CL (acento chileno) | 100 / 98,4 | 2,93 / 3,50 |
| paloma_us / alonso_us | es-US neutras (las usadas hoy) | 97,6 / 92,7 | 3,17 / 3,36 |
| jorge_mx | es-MX Jorge (usada hoy en GPS) | 94,3 | 3,35 |
| emma_multi | en-US Emma Multilingüe (usada hoy en Shazam) | 99,2 | 4,32 |
| ssml_crudo_elena | prueba de SSML (`<break>`, `<emphasis>`) | 60 | 2,53 |

Notas: diferencias de 1-3 puntos de Whisper no son significativas (una palabra). `ssml_crudo_elena` demuestra que edge-tts NO interpreta SSML (lee/ignora las etiquetas).
Ojo: las voces es-AR tienen menos variación de tono que las multilingües; la "argentinidad" no se mide con estos números.
