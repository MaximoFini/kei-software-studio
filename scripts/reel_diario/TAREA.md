# Tarea diaria: generar el reel de "dolor del cliente"

Instrucciones para la tarea programada de Claude que corre todos los días en la nube. Prompt de la tarea:

> Seguí las instrucciones de scripts/reel_diario/TAREA.md del repo kei-software-studio.

El reel que se genera queda en una rama `claude/reel-diario-…`. El GitHub Action "Publicar reel" lo publica como
reel de prueba a las 12:00 (hora de Argentina) y después borra la rama. Esta tarea **no publica nada en Instagram**.

## Reglas

- No modifiques código ni hagas commits en `main`: la única salida es la rama que crea `scripts/reel_diario.py`.
- Si algo del entorno falla (no hay red, falta ffmpeg, falla el render por algo que no es el guion), no lo
  arregles tocando el repo: terminá y explicá qué pasó. Ese día no se publica nada, y está bien.
- Sin pedir confirmación a nadie: nadie va a contestar.

## Pasos

1. **Preparar el entorno** (desde la raíz del repo):
   ```bash
   command -v ffmpeg || (sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg)
   (cd remotion && npm ci --no-audit --no-fund)
   pip install --quiet edge-tts
   ```
2. **¿Hace falta generar?** `python scripts/reel_diario.py pendientes`. Si hay **2 o más** pendientes, terminá
   sin generar (el publicador va atrasado y no tiene sentido acumular).
3. **Elegir el tema.** Leé [temas.md](temas.md) y la salida de `python scripts/reel_diario.py usados`.
   Elegí un tema de la lista que no se haya usado. Si ya se usaron todos, armá uno nuevo con el mismo criterio.
4. **Escribir el guion** en `work/reel_diario/hoy.json` siguiendo [FORMATO.md](FORMATO.md) y la guía de
   contenido de [temas.md](temas.md). Mirá [ejemplo.json](ejemplo.json) como referencia de forma, no de contenido.
5. **Validar:** `python scripts/reel_diario.py validar work/reel_diario/hoy.json`. Corregí hasta que diga
   "Guion OK".
6. **Generar y dejar listo:** `python scripts/reel_diario.py generar work/reel_diario/hoy.json` (tarda varios
   minutos: voz, música, render y compresión). Si falla por el guion (por ejemplo, el reel queda fuera de la
   duración permitida), ajustá el guion y reintentá, como máximo 2 veces.
7. **Informe final**, corto: tema elegido, rama creada y duración/peso del reel, o por qué no se generó.
