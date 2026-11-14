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
- No borres ramas ni hagas push de nada más: desde la nube borrar ramas falla, y las del reel las borra el
  Action después de publicar.

## Pasos

1. **Preparar el entorno** (desde la raíz del repo):
   ```bash
   command -v ffmpeg || (sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg)
   (cd remotion && npm ci --no-audit --no-fund)
   pip install --quiet edge-tts
   ```
2. **¿Hace falta generar?** `python scripts/reel_diario.py pendientes`. Si hay **2 o más** pendientes, terminá
   sin generar (el publicador va atrasado y no tiene sentido acumular).
3. **Elegir el tema.** Leé [temas.md](temas.md) entero, el registro
   [publicar/registro-reels-diarios.md](../../publicar/registro-reels-diarios.md) (qué temas ya se hicieron) y
   la salida de `python scripts/reel_diario.py usados` (fecha · línea · rubro · id · tema, del más viejo al más
   nuevo, incluidos los pendientes de publicar). Elegí la línea que toca (la contraria a la del
   último reel), un rubro distinto del último de esa línea y un tema que no se haya usado, respetando la
   prioridad de la serie de gimnasios con IA. Si se agotaron los temas de un rubro, inventá uno nuevo con el
   mismo criterio.
4. **Escribir el guion** en `work/reel_diario/hoy.json` siguiendo [FORMATO.md](FORMATO.md) y la guía de
   contenido de [temas.md](temas.md), con `rubro`, `linea` y `tema_id`. Dedicale la mayor parte del esfuerzo al gancho:
   escribí 3 opciones con tipos distintos y quedate con la que corte el scroll más fuerte para ese rubro. Mirá [ejemplo.json](ejemplo.json) como referencia de forma, no de contenido.
5. **Validar:** `python scripts/reel_diario.py validar work/reel_diario/hoy.json`. Corregí hasta que diga
   "Guion OK".
6. **Generar y dejar listo:** `python scripts/reel_diario.py generar work/reel_diario/hoy.json` (tarda varios
   minutos: voz, música, render y compresión). Si falla por el guion (por ejemplo, el reel queda fuera de la
   duración permitida), ajustá el guion y reintentá, como máximo 2 veces.
7. **Informe final**, corto: tema elegido, rama creada y duración/peso del reel, o por qué no se generó.
