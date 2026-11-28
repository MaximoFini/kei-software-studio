# Plan de crecimiento de @keisoftware en Instagram Reels

Fecha: 2026-11-28. Objetivo: ganar seguidores con volumen alto de reels hasta que alguno pegue, copiando lo que ya funciona.

## Resumen (lo que importa)

1. **Qué pesa en el algoritmo.** Mosseri nombró tres señales: tiempo de visualización, likes y envíos por DM. Los likes pesan un poco más para tu audiencia y los envíos un poco más para quienes no te siguen. Lo que mide es la tasa (envíos por alcance), no el conteo. Para crecer hay que optimizar **retención y compartidos**, no likes.
2. **Lo que ya funcionó en la cuenta** (datos reales, ver abajo): los reels de curiosidad tipo "cómo sabe el celu que lo acercás al oído" (34 likes) y "5 mitos del celu" (23 likes) rinden entre 10 y 30 veces más que los reels de dolor para pymes (0 a 2 likes). Conclusión: **copiar el formato explicativo de curiosidad cotidiana** para captar audiencia fría y usar el rubro/pyme como segunda capa, no como gancho principal.
3. **Gancho en 0-3 s, 20-30 s de duración, loop.** Es la práctica que repiten todas las fuentes. El formato pizarrón de 30 s ya va en esa línea: acortar a 20-25 s si el final no suma retención.
4. **Reels de prueba (trial) como laboratorio de ganchos.** Sólo los ven no seguidores, dan métricas a las 24 h y se pueden promover a la grilla. El plan de abajo define qué se testea, cuánto se espera y qué métrica decide.
5. **Cadencia: 1 por día** (ya está) mientras la calidad no baje; si hay que elegir, mejor 4-5 buenos por semana que 7 flojos. Hashtags: **máximo 5** (límite de la plataforma desde diciembre de 2025 según fuentes de terceros).
6. **Bloqueo técnico:** el token actual no tiene el permiso de insights, así que no se pueden leer alcance, compartidos ni tiempo visto por API. Sin eso el protocolo A/B se decide mirando la app a mano o hay que regenerar el token con `instagram_manage_insights` (ver sección Script).

## Datos reales de la cuenta (corrida de `scripts/insights_reels.py`, 2026-11-28)

La cuenta tiene 290 seguidores y 20 publicaciones. El script leyó los 30 reels de `publicados.json`. La API rechazó los insights con el error (#10) "Application does not have permission": el token sólo tiene `instagram_basic`, `instagram_content_publish`, `pages_read_engagement` y `pages_show_list`. Se usó el modo reducido (likes y comentarios públicos del media). Un reel (el primero, 04-tu-web-vende, publicado por error como normal) ya no existe o no es legible.

Ranking por likes (modo reducido):

| likes | coment | reel |
|---|---|---|
| 34 | 0 | 18 · cómo sabe el celu que lo acercás (curiosidad tech) |
| 23 | 1 | 22 · 5 mitos del celu (lista de mitos) |
| 8 | 0 | 19 · cómo funciona un zip |
| 7 | 0 | 14 · cómo sabe que no soy un robot |
| 6 | 0 | 15 · cómo funciona el token |
| 0 a 2 | 0 | cookies, contraseña, pymes, serie gimnasio IA, reel 27 microondas |

Lectura: el material de curiosidad ("cómo sabe/funciona X" con objeto cotidiano) concentra casi todo el rendimiento; hay un solo comentario en toda la cuenta, así que los CTA actuales no generan conversación. Ojo: estos números mezclan antigüedad (los de curiosidad llevan 3 semanas visibles) y que los de prueba sólo se muestran a no seguidores, así que son orientativos. Faltan compartidos y retención para confirmar.

## Mejores prácticas investigadas

**Retención y gancho.** El algoritmo de Reels prioriza tiempo visto y tasa de finalización; los primeros 1-3 s deben contestar "por qué sigo mirando" (pattern interrupt, texto grande, pregunta abierta). Un reel corto con buena retención gana a uno largo con retención floja; las guías de terceros mencionan 7-90 s como rango y recomiendan quedarse en lo corto. Loop: que el último cuadro empalme con el primero o que la última frase reabra la pregunta, para subir el tiempo medio por encima de 100 % de la duración.

**Señales.** Watch time, likes y sends son las tres principales (Mosseri). Los guardados sirven para contenido educativo y dan longevidad. Las cifras tipo "un compartido vale 3-5 likes" salen de blogs sin fuente: tomarlas como dirección, no como hecho.

**Reels de prueba.** Se activan con el interruptor "Prueba" al compartir; los ven primero no seguidores, no aparecen en la grilla ni en la pestaña de reels, a las 24 h se ven vistas, likes, comentarios y compartidos, y se puede promover a la grilla o archivar. Con el modo automático Instagram lo pasa a seguidores si rinde en las primeras 72 h. Mosseri indicó que están disponibles para cuentas públicas con 1.000 seguidores o más; en nuestra cuenta (290) la publicación por API con `trial_params` está funcionando, pero conviene verificar en la app que la opción de promover aparece. No hay guía oficial específica para testear ganchos: la práctica de usarlos para A/B es recomendación de terceros.

**Hashtags.** Fuentes de terceros indican que desde diciembre de 2025 el máximo es 5 por publicación (caption y primer comentario comparten el tope) y que sirven para clasificar el tema, no para dar alcance; el peso lo tienen watch time y shares. Combinar 1-2 de formato (#aprende, #curiosidades, #tecnologia) con 2-3 de nicho. No hay fuente oficial sobre cantidad ni sobre hashtags de tech en español/Argentina: los bancos de abajo son criterio propio a validar con las métricas.

**Horarios.** No se encontró fuente fiable para Argentina. Se propone una hipótesis (franjas de abajo) y se mide con los reels de prueba.

**Comentario-trigger.** Herramientas como ManyChat permiten responder por DM a quien comenta una palabra clave (se puede limitar a un reel, activa sólo el primer comentario de cada usuario y la ventana de respuesta privada de Meta es de 7 días). Sirve para subir comentarios y generar conversación; no es una señal oficial de ranking, y con 290 seguidores el volumen es bajo: usarlo cuando haya un recurso concreto para mandar.

**Colaboraciones, series, reutilización.** Las búsquedas no devolvieron fuentes fiables sobre TikTok/Shorts ni watermarks. Criterio propio: publicar el mismo mp4 **sin marca de agua de otra plataforma** en TikTok y YouTube Shorts (exportar el original, no descargar de Instagram); las series con numeración ("Parte 2 de ...") empujan a seguir la cuenta; las colaboraciones (Collab post con cuentas de tech o emprendedores) exponen el reel a su audiencia.

## Plan para @keisoftware

### Cadencia y mezcla

- 1 reel por día (rutina actual), mezcla **70 % curiosidad cotidiana tech** (el formato ganador: "cómo sabe/funciona X"), **20 % pymes/rubros** (dolor concreto + solución con IA), **10 % serie** (gimnasio IA u otra con parte numerada).
- Franjas a testear (hora Argentina): 12-13 h, 19-21 h, 22 h. El Action hoy corre a las 12:00 (11:30 en la rutina); probar una semana a las 20:00 y comparar alcance de las primeras 24 h.
- Reutilizar el mismo mp4 en TikTok y YouTube Shorts el mismo día, sin watermark.

### Estructura de caption (corta, 3 líneas + hashtags)

1. Línea 1: repite o completa el gancho (pregunta o afirmación que genera curiosidad). Es lo único que se ve sin tocar "más".
2. Línea 2: una frase de valor concreto (el dato central), sin explicar todo el video.
3. Línea 3: CTA único (una sola acción).
4. Hashtags: 3-5, al final.

### Plantillas de CTA (3 variantes)

- **Compartir:** "Mandáselo a ese amigo que siempre pregunta cómo funciona todo. 📲" (apunta a envíos por DM, la señal que más mueve a no seguidores).
- **Guardar/seguir:** "Guardalo para cuando alguien te pregunte. Y seguinos: subimos uno por día." (guardados + seguir).
- **Comentar/DM:** "Comentá TIPS y te mandamos la guía de ... por DM." (sólo cuando haya un recurso real; con ManyChat o a mano). Para clientes: "¿Tu negocio pierde X? Escribinos por DM."

### Banco de hashtags (usar 3-5 por reel; rotar)

- Curiosidad tech: #curiosidades #tecnologia #comofunciona #sabiasque #celulares
- IA: #inteligenciaartificial #ia #chatgpt #automatizacion #tecnologiaargentina
- Pymes/rubros: #pymes #emprendedores #negociosargentina #gestiondenegocios #softwareamedida
- Gimnasios: #gimnasio #gymtips #gestiondegimnasio #fitnessargentina
- Marca fija (máximo 1): #KEISoftware
- Regla: 2 de tema + 1 de formato + 1 de marca como máximo; no repetir exactamente el mismo set en reels consecutivos.

### Protocolo A/B de ganchos con reels de prueba

1. **Qué se testea:** una sola variable por par de reels, el gancho (los primeros 3 s: frase en pantalla y primera frase de voz). Mismo tema, mismo cuerpo, mismo cierre, misma hora; sólo cambia el gancho. Variantes: pregunta ("¿Cómo sabe tu celu...?"), afirmación contraintuitiva ("Tu celu no sabe nada de...") y cifra/lista ("3 cosas que...").
2. **Cuántas horas:** esperar 24 h de cada reel de prueba (tiempo mínimo en que Instagram muestra métricas); si ninguno llega a 500 views de no seguidores, esperar hasta 72 h antes de decidir.
3. **Qué métrica decide**, en este orden: (a) tiempo medio visto / duración (retención) en la app (Estadísticas del reel), (b) compartidos por alcance, (c) guardados por alcance, (d) vistas. Si empatan, gana el de más compartidos. Con `instagram_manage_insights` activo, `python scripts/insights_reels.py` calcula el score y el ranking solo.
4. **Cuándo promover a la grilla:** pasar a seguidores el reel que cumpla al menos dos de: retención mayor a 60 %, compartidos mayor a 1 % del alcance, guardados mayor a 1 % del alcance, o que supere la mediana de los últimos 10 reels. Si ninguno cumple, archivarlo y reutilizar sólo el gancho ganador en el próximo tema.
5. **Registro:** anotar en `publicar/metricas.md` (lo regenera el script) y en el nombre de la rama/tema qué gancho era A o B, para saber qué patrón repetir.
6. Frecuencia del test: 2 pares por semana (4 reels) y el resto de la semana se publica con el gancho ganador del patrón.

### Checklist previo a publicar

- [ ] El gancho (0-3 s) tiene texto en pantalla y una frase que genera pregunta; el primer cuadro no es negro ni logo.
- [ ] Duración 20-30 s; el final empalma con el inicio o deja una pregunta abierta (loop).
- [ ] Un solo mensaje por reel; sin oraciones largas en pantalla (regla del repo para reels).
- [ ] Voz y subtítulos legibles en silencio; audio sin artefactos robóticos.
- [ ] Caption: gancho en la línea 1, un solo CTA, 3-5 hashtags (no más de 5).
- [ ] Portada/primer cuadro legible en la grilla de 3 columnas.
- [ ] Es un reel de prueba con variante A o B registrada, o ya tiene gancho ganador.
- [ ] Peso menor a 20 MB (requisito de jsDelivr) y commit pusheado.
- [ ] Sin casos reales de clientes ni datos personales (regla del repo).
- [ ] Mismo mp4 listo para TikTok y Shorts sin marca de agua.

## Script de métricas

`scripts/insights_reels.py` (sólo GET) lee `publicados.json`, pide a la API views, reach, likes, comments, shares, saved, total_interactions, ig_reels_avg_watch_time e ig_reels_video_view_total_time, calcula retención (tiempo medio / duración) y tasas por alcance, y escribe `publicar/metricas.md` y `publicar/metricas.json`. Si un métrico es rechazado lo saca y reintenta. No imprime ni guarda el token.

**Permiso que falta:** `instagram_manage_insights` (o `instagram_business_manage_insights` con login de Instagram). Hay que agregarlo a la app de Meta (en modo desarrollo alcanza si la cuenta es tester/admin) y regenerar el token del usuario del sistema "KEI Reels" con ese permiso, más `pages_read_engagement`. Hasta entonces el script corre en modo reducido (likes y comentarios).

## Fuentes

- Meta, Trial Reels (anuncio oficial): https://about.fb.com/news/2024/12/trial-reels-try-content-non-followers-first-see-what-perfo/
- Instagram Creators, Trial reels: https://creators.instagram.com/blog/instagram-trial-reels
- TechCrunch, Trial Reels: https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers
- Social Media Today, ampliación de acceso a Trial Reels (1.000 seguidores): https://socialmediatoday.com/news/instagram-expands-access-trial-reels/752895/
- Social Media Today, Mosseri sobre señales de ranking 2025: https://www.socialmediatoday.com/news/instagram-shares-algorithm-2025/738034/
- Uppbeat, Mosseri sobre carruseles y envíos: https://uppbeat.io/blog/creator-news/whats-working-on-instagram-right-now-carousels-and-sends-says-adam-mosseri
- Buffer, algoritmo de Instagram 2026: https://buffer.com/resources//instagram-algorithms/
- Metricool, guía de Reels 2026: https://metricool.com/blog/instagram-reels-guide/
- Buffer, Reels 2026: https://buffer.com/resources/instagram-reels-instructions-and-ideas-for-small-businesses/
- SocialPilot, método Hook-Hold-Share: https://www.socialpilot.co/es/strategy/how-to-go-viral-on-instagram
- DEV, estrategia de Reels 2026 (datos de terceros, sin verificar): https://dev.to/fermainpariz/instagram-reels-strategy-2026-what-actually-works-data-backed-guide-11hn
- DEV, hashtags 2026 (tope de 5, de terceros): https://dev.to/fermainpariz/instagram-hashtag-strategy-2026-the-3-tier-system-that-still-drives-reach-2ihc
- Sked Social, hashtags 2026: https://skedsocial.com/blog/how-to-use-hashtags-on-instagram-in-2026-hashtag-tips-to-up-your-insta-game
- ManyChat, automatizar comentarios a DM: https://manychat.com/blog/how-to-automate-your-comments-with-manychat/
- ManyChat, ayuda sobre el trigger de comentarios: https://help.manychat.com/hc/en-us/articles/14281316989724

Salvedades: casi todo viene de blogs de vendors, no de documentación de Instagram; no hay fuente fiable para horarios en Argentina, hashtags de tech en español ni reutilización a TikTok/Shorts. Esos puntos son hipótesis a validar con los datos de la propia cuenta.
