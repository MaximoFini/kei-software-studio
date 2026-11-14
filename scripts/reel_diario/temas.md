# Temas y guía de contenido del reel diario

Guía que sigue la tarea programada para escribir cada guion (formato técnico en [FORMATO.md](FORMATO.md)).

## Objetivo

Cada reel hace dos cosas a la vez:
1. **Validar problemas:** mostrar un dolor concreto de un rubro y ver si la gente del rubro reacciona
   (comentarios, guardados, DMs). Por eso cada guion lleva `rubro` y `linea`, y queda registrado.
2. **Conseguir clientes:** que el dueño se vea reflejado ("eso me pasa a mí"), entienda cuánto le cuesta con
   una cuenta simple y vea que tiene solución. La venta la abre el caption con la invitación al DM.

Apuntamos al **volumen**: muchos dolores distintos, bien específicos de cada rubro, mejor que pocos genéricos.

## Las dos líneas (alternar día por medio)

Mirá `python scripts/reel_diario.py usados`: si el último reel fue de una línea, hoy toca la otra.

- **`conocido`: rubros que ya trabajamos** (gimnasios, landings, concesionarias). Son dolores que conocemos de
  primera mano, así que pueden ser bien concretos. Prioridad: la **serie de gimnasios con IA** (abajo) entra
  al menos 1 de cada 3 reels de esta línea hasta agotar sus ángulos.
- **`nuevo`: rubros para validar** (e-commerce, barberías, profesionales, pymes en general). Sirven para
  descubrir qué rubros responden.

Dentro de cada línea, no repetir el mismo rubro dos veces seguidas.

**Nunca** decir que es un caso real, que fue un cliente ni que KEI "ya lo resolvió para un gimnasio". Los
personajes son inventados y se habla del rubro en general ("si tenés un gimnasio…").

## Ganchos (lo más importante)

La primera escena decide si el reel se mira. Máx. 14 palabras, se tiene que entender sin sonido (va
subtitulado) y nombrar al rubro o a una situación que solo el rubro reconoce. Rotar entre estos 4 tipos:

| tipo | cómo es | ejemplo |
|---|---|---|
| Pregunta al rubro | filtra al público: el que no es del rubro pasa de largo | "¿Tenés un gimnasio y todavía cobrás las cuotas a mano?" |
| Número que duele | un monto u horas que cortan el scroll; la cuenta viene después | "Tu gimnasio pierde 8 socios por mes y nadie se da cuenta." |
| Escena reconocible | un momento concreto del día del dueño | "Son las once de la noche y seguís contestando precios." |
| Resultado | arranca por el final feliz y después cuenta cómo | "Imaginá saber qué socio se va a ir antes de que se vaya." |

Reglas: nada de "Hola, hoy te voy a contar…", ni "¿Sabías que…?", ni preguntas que se contestan con "no".
El gancho tiene que prometer algo que el reel cumple. Visual del gancho: `gancho`, `frase`, `notificaciones`
o `contador`, variando día a día.

## Tono

Mezcla de **racional, empático y directo**. Voseo rioplatense, frases cortas, palabras de todos los días.
- Empático: la situación concreta como la vive el dueño, sin culparlo ni burlarse.
- Racional: **siempre un número**, y que salga de una cuenta que el reel muestra.
- Directo: sin relleno ("en el mundo actual…", "hoy más que nunca…") ni jerga técnica.

### Regla de los números

Los números son **cuentas del caso**, nunca estadísticas inventadas ni atribuidas a estudios:
- Bien: "Si se te van 8 socios por mes y cada uno pagaba 35 mil, son 280 mil pesos por mes."
- Bien: "20 consultas por día, 3 minutos cada una: una hora diaria."
- Mal: "El 68 % de los socios abandona en 3 meses" o "según un estudio…".
Las cuentas tienen que dar bien. Usar el visual `contador` para el resultado.

Valores de referencia (pesos redondos, revisar cada tanto; mejor horas y cantidades que montos):

| rubro | referencia |
|---|---|
| gimnasio | 300 socios, cuota 35 mil por mes |
| barbería | corte 12 mil, 25 turnos por día |
| e-commerce | ticket promedio 40 mil |
| concesionaria | 150 consultas por mes, 10 a 15 ventas |
| consultorio | 15 pacientes por día |

## Estructura del guion (30 a 40 s, 70 a 110 palabras, 6 a 8 escenas)

1. **Gancho** (escena 1).
2. **El dolor en concreto** (1 o 2 escenas): quién, qué hace a mano, cuándo le pasa. Personaje con nombre y
   rubro en la etiqueta ("Martín, gimnasio"). Visual: `persona` (estresado), `notificaciones`, `caos`, `frase`.
3. **La cuenta** (1 o 2 escenas): números del caso y resultado en horas o pesos. Visual: `contador` (con
   `palabra` en el número que dice la voz) y, si suma, `lista` con lo que se pierde.
4. **La salida** (1 o 2 escenas): qué cambia, sin jerga ni promesas imposibles. Visual: `antesDespues` o
   `solucion` (`app` genérica: "Tu gimnasio", "Turnos", "Ventas").
5. **Cierre**: `cta` con una variante de "Seguinos para que tu negocio trabaje para vos, y no al revés."

La `etiqueta` de cada escena suma información: nunca repite el `titulo` (que ya está arriba).
Variá el orden de las escenas 2 a 4 y los visuales entre días para que el feed no se vea repetido.

## Lo que no hay que hacer

- No nombrar marcas de terceros (ni WhatsApp, Excel, Mercado Libre, Instagram ni otras) en la voz, los textos
  ni el caption: decir "el chat", "la planilla", "las redes". Los íconos genéricos están bien.
- No hablar de precios de KEI, plazos ni garantías.
- No usar miedo exagerado ("vas a fundirte") ni ridiculizar al dueño.
- No presentar nada como caso real ni nombrar clientes.
- Sin emojis ni signos raros en los textos de pantalla (la tipografía no los tiene).
- Con IA: explicarla por lo que hace ("detecta", "avisa", "ordena"), sin prometer que "adivina" ni que
  reemplaza al dueño o al equipo.

## Caption

```
<El gancho en una línea, con 1 emoji como máximo>

<2 o 3 líneas con la cuenta del reel y la salida, en voseo>

En KEI Software armamos <lo que resuelve este dolor> a medida para <rubro>.
¿Te pasa algo parecido? Escribinos por DM y lo vemos juntos 📩

👉 Seguinos para que tu negocio trabaje para vos.

#keisoftware #softwareamedida <2 o 3 del rubro> <2 o 3 del dolor>
```

## Serie destacada: gimnasios que pierden socios (detección de inactividad con IA)

Idea central: la mayoría de los socios no avisa que se va; **deja de venir de a poco** y un día no renueva. El
sistema mira la asistencia de cada socio, detecta cuándo cambia su patrón ("venía 3 veces por semana y hace 10
días que no viene"), lo marca en riesgo y dispara un mensaje personalizado, o le avisa al dueño a quién
llamar primero. Ángulos (uno por reel, en este orden):

IA1. **El socio que se va callado:** no avisa, deja de venir y no renueva. Cuenta: 8 bajas por mes × 35 mil =
   280 mil por mes, más de 3 millones por año.
IA2. **Cómo lo detecta la IA:** compara la asistencia de cada socio con su propia costumbre, no con un promedio.
   Ejemplo visual: venía lunes, miércoles y viernes; hace 10 días que no aparece → alerta.
IA3. **El mensaje a tiempo:** "Te extrañamos, ¿te reservo la clase del jueves?" sale solo el día que se detecta,
   no un mes después cuando ya se fue.
IA4. **A quién llamar primero:** el sistema ordena la lista de socios en riesgo, el dueño llama a 5 en lugar
   de revisar 300.
IA5. **Recuperar es más barato que conseguir:** cuánto cuesta conseguir un socio nuevo (publicidad, promos)
   contra mandar un mensaje a uno que ya tenés.
IA6. **Los primeros 30 días:** el socio nuevo que no arma la costumbre en el primer mes es el que más se va;
   el sistema lo acompaña con recordatorios.
IA7. **Lo que la planilla no te muestra:** en la planilla figura "activo" porque pagó, pero hace 3 semanas que
   no viene.

## Lista de temas

Formato: **tema** · línea · rubro. Cada tema tiene un id (el número, o IA1-IA7 en la serie): ponelo en el
`tema_id` del guion para que el registro lo marque como hecho. Los temas ya hechos están en
[publicar/registro-reels-diarios.md](../../publicar/registro-reels-diarios.md); si inventás uno, `tema_id` va vacío.
Cuando se agoten, inventar nuevos del mismo rubro con el mismo criterio (bien específicos).

### Gimnasios · conocido
1. Cuotas vencidas que nadie persigue: socios que entrenan sin pagar
2. Cobros a mano en efectivo o transferencia, controlados en una planilla
3. No saber cuántos socios activos hay de verdad
4. Socios que dejan de venir y nadie lo nota hasta la baja (ver serie IA)
5. Control de acceso en papel o con la memoria del recepcionista
6. Clases con cupo reservadas por chat, con sobreturnos
7. Rutinas en papel o mandadas por chat a cada socio
8. Recordatorios de vencimiento enviados uno por uno

### Landings con conversión · conocido
9. Mucho tráfico de anuncios y casi ninguna consulta
10. Una web que no explica en 5 segundos qué vendés
11. Una web que tarda en cargar desde el celular
12. Un formulario largo que nadie completa
13. Botón de contacto escondido o un solo llamado a la acción al final
14. No saber de dónde vienen las consultas ni qué anuncio funciona

### Concesionarias · conocido
15. Consultas de portales, redes y chat sin centralizar
16. Vendedores que no hacen seguimiento a los interesados
17. Stock desactualizado: se ofrece un auto que ya se vendió
18. Usados en consignación o toma controlados en planillas
19. Papeles y documentación de cada operación en carpetas
20. No saber qué vendedor convierte y cuál no

### E-commerce · nuevo
21. Contestar los mismos precios y preguntas por chat todo el día
22. Consultas de noche o el fin de semana que nadie responde
23. Vender algo que ya no había en stock
24. Pedidos anotados en el chat, el cuaderno y la planilla
25. Carritos abandonados que nadie recupera
26. Comprobantes de pago perdidos en el chat
27. Mandar el catálogo en fotos sueltas cada vez

### Barberías · nuevo
28. Turnos por chat todo el día, mientras cortás
29. Clientes que faltan sin avisar y el sillón queda vacío
30. Huecos en la agenda que nadie ocupa
31. Clientes que no vuelven y nadie los llama
32. No saber cuánto factura cada barbero

### Profesionales (consultorios, estudios, estética) · nuevo
33. Turnos por chat y llamadas, con superposiciones
34. Pacientes que faltan sin avisar
35. Recordatorios de turnos mandados a mano
36. Reprogramar y avisar a todos uno por uno
37. Abonos y cuotas mensuales cobrados a mano

### Pymes en general · nuevo
38. No saber cuánto stock hay sin ir a contar
39. Presupuestos armados a mano y sin seguimiento
40. Cobros pendientes que nadie persigue
41. Pasar datos de una planilla a otra
42. Todo depende del dueño: si no está, no se resuelve nada
43. Información del negocio repartida en 5 lugares
44. Programas genéricos que no se adaptan a tu forma de trabajar
