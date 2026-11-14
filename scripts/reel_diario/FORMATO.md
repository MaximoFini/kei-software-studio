# Formato del guion del reel diario

Un guion es un JSON que `scripts/reel_diario.py` convierte en reel. Ejemplos reales que siguen la guía de temas.md: [ejemplo.json](ejemplo.json) y [ejemplo-gimnasio-ia.json](ejemplo-gimnasio-ia.json).
Validarlo con `python scripts/reel_diario.py validar <guion.json>`.

```jsonc
{
  "slug": "consultas-por-whatsapp",        // minúsculas y guiones; va en el nombre de la rama
  "tema": "Responder consultas a mano",     // una línea; sirve para no repetir temas
  "rubro": "gimnasio",                      // gimnasio, landing, concesionaria, ecommerce, barberia, profesional, pyme…
  "linea": "conocido",                      // "conocido" (rubros que ya trabajamos) o "nuevo" (rubros a validar)
  "titulo": "¿Te pasa esto?",               // chip de arriba, máx. 32 caracteres
  "caption": "texto del post con #hashtags",
  "voz": "es-AR-ElenaNeural",               // opcional: si falta, alterna Elena y Tomás día por medio
  "rate": "+18%",                           // opcional, velocidad de la voz
  "musica": 2,                              // opcional: índice de musica.json (si falta, rota por día)
  "escenas": [
    { "id": "gancho", "texto": "lo que dice la voz en off", "visual": { "tipo": "gancho", ... } }
  ]
}
```

Reglas que controla el validador: 6 a 9 escenas, 70 a 110 palabras en total (reel de ≈ 30-40 s), cada escena de 3 a
40 palabras, `id` únicos en camelCase y la última escena de tipo `cta`. Los subtítulos salen solos de la voz.

## Visuales

En cualquier tipo, `palabra` (en el visual o en un item) hace que ese elemento aparezca justo cuando la voz dice
esa palabra (sin importar tildes ni mayúsculas). Si no se indica, los items se reparten mientras habla la voz.

| tipo | campos | qué se ve |
|---|---|---|
| `gancho` | `icono`, `efecto` (`alerta` \| `sacudir` \| `pulso`), `etiqueta`?, `palabra`? | ícono grande con ondas; en rojo con `alerta`/`sacudir` |
| `persona` | `animo` (`estresado` \| `feliz` \| `neutro`), `etiqueta`?, `items`? (máx. 7: `icono`, `valor`?, `texto`?), `persona`? (`remera`, `pelo`, `peinado`) | personaje plano rodeado de íconos (con contador rojo en `valor`) |
| `caos` | `items` (máx. 6: `icono`, `texto`), `final`? (`cruz` o un ícono) | tarjetas que caen desordenadas y tiemblan |
| `contador` | `hasta`, `prefijo`?, `sufijo`?, `icono`?, `etiqueta`?, `color`? (`rojo` \| `azul`) | número que cuenta dentro de un anillo |
| `lista` | `items` (máx. 5: `texto`, `icono`?), `marca` (`cruz` \| `check`), `etiqueta`? | filas que entran con cruz roja o check azul |
| `frase` | `texto` (máx. 70), `destacar`? (palabras), `etiqueta`?, `color`? | cita grande, como lo que dice el cliente |
| `antesDespues` | `antes` y `despues`: `{titulo, items (máx. 3), palabra?}` | dos paneles: rojo arriba, azul abajo |
| `notificaciones` | `items` (máx. 6: `de`, `texto` máx. 34, `icono`?), `etiqueta`? (hora) | celular que vibra con mensajes que se apilan |
| `solucion` | `app`, `items` (máx. 5: `icono`, `texto`, `valor`?) | celular con la app ordenada y check final |
| `asistencia` | `patron` (índices de días que viene, ej. `[0, 2, 4]`), `semanas`? (2-5, def. 4), `corte`? (semana en que deja de venir, def. la última), `dias`? (def. L M X J V S), `etiqueta`?, `alerta`? (máx. 22, ej. "Socio en riesgo"), `palabra`? (cuándo termina de llenarse) | grilla de asistencia que se llena, días vacíos en rojo y alerta |
| `cta` | — | tarjeta @keisoftware con "Seguir" → "Siguiendo" |

Textos de items: máx. 24 caracteres (34 en notificaciones). Etiquetas: máx. 30.

## Íconos

reloj, dinero, chat, planilla, papel, alerta, calendario, mail, carrito, grafico, caida, usuario, clientes,
telefono, check, cruz, caja, candado, estrella, fuego, lupa, engranaje, rayo, web, camion, campana, pregunta.
La lista real está en `ICONOS` de `remotion/src/DolorReel.tsx` (el validador la lee de ahí).
