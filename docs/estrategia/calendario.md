# Calendario editorial: 100 temas de tecnología cotidiana

Línea: tecnología de todos los días con gran ingeniería detrás, explicada muy fácil. Reels de 30 s (65 a 75 palabras), gancho con pregunta o dato contraintuitivo, cierre con invitación a seguir y comentar. Referencia de formato y tono: el reel de Bluetooth, el que mejor funcionó.

Documento de estrategia aparte del reel diario automático (no toca scripts/reel_diario).

## Excluidos

- Ya hechos: GPS, pantalla táctil, Shazam, batería, WiFi, QR, Bluetooth, audio, cómo ve una foto la IA.
- scripts/reel_diario/temas.md es una lista de dolores de rubros (gimnasios, barberías, etc.), no de tecnología cotidiana: no hay duplicados con este banco.

## Cómo usar

- Orden: el día N sale el tema de la tabla de orden. Intercala las 10 series en rotación; ninguna serie sale dos días seguidos.
- Formatos: pizarrón, chat, terminal, cuaderno, collage, pixel art, motion azul. El formato sugerido evita repetir el de los dos días anteriores.
- Voces: alternan Elena (es-AR-ElenaNeural) y Tomás (es-AR-TomasNeural) día por medio; se puede variar con Jorge (es-MX).
- Verificación: son hechos técnicos estándar; donde varía según marca o equipo, el texto lo aclara ("algunos", "en general", "se puede"). Antes de escribir cada guion, confirmar cifras puntuales (frecuencias, tiempos) con una fuente.
- Cierre fijo: invitación a seguir y comentar, más la pregunta de cierre de la fila.

## Series

### Serie 1: Tu celu

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 1 | Tu celu adivina lo que vas a escribir | Autocorrector: un modelo de lenguaje le da probabilidad a cada palabra según las anteriores y según las teclas tocadas, y tolera que aprietes una tecla vecina. | chat | Elena | ¿Cuál es la palabra que tu celu siempre te corrige mal? | 1 |
| 2 | Tu dedo es tu contraseña | El sensor lee el patrón de crestas y valles de la huella y lo guarda como un mapa matemático (no como foto) dentro de un chip seguro del equipo. | pizarrón | Elena | ¿Usás huella, cara o código para desbloquear? | 11 |
| 3 | Tu cara abre el celu, ¿y una foto no? | El reconocimiento facial 3D proyecta miles de puntos de luz infrarroja y arma un mapa con relieve de la cara; una foto plana no tiene profundidad. | motion azul | Elena | ¿Te desbloqueó alguna vez recién levantado? | 21 |
| 4 | Esa foto salió de varias fotos | Fotografía computacional: el celu saca varias tomas rápidas con distinta exposición y las combina (HDR) para que se vean sombras y luces a la vez. | collage | Elena | ¿Cuál fue la mejor foto que sacaste con el celu? | 31 |
| 5 | El modo avión no apaga nada del avión | Desactiva los transmisores de radio del celular (red móvil); el WiFi y el Bluetooth se pueden volver a prender por separado. | chat | Elena | ¿Lo usás para cargar más rápido el celu? | 41 |
| 6 | Negro de verdad: píxeles apagados | En una pantalla OLED cada píxel emite su propia luz; el negro es un píxel apagado, por eso el modo oscuro ahorra batería. | pixel art | Elena | ¿Modo oscuro o modo claro? | 51 |
| 7 | Tu celu carga más lento al final | Carga rápida: se aplica mucha corriente hasta cerca del 80 % y después se reduce para cuidar la batería. | terminal | Elena | ¿A qué porcentaje lo desenchufás vos? | 61 |
| 8 | Tu celu sabe que lo diste vuelta | Acelerómetro y giroscopio MEMS: estructuras microscópicas que se mueven con la aceleración y el giro; así rota la pantalla y cuenta pasos. | pixel art | Elena | ¿Con qué juego probaste el giroscopio? | 71 |
| 9 | La pantalla se apaga cuando llamás | Sensor de proximidad: emite luz infrarroja y mide el rebote; si hay algo muy cerca (tu oreja) apaga la pantalla. | pizarrón | Elena | ¿Te pasó que cortaste una llamada con la mejilla? | 81 |
| 10 | Tu celu sabe si es de día | Sensor de luz ambiente: mide la luz que llega y el sistema ajusta el brillo solo. | cuaderno | Elena | ¿Dejás el brillo automático o lo manejás vos? | 91 |

### Serie 2: Pagos y plata

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 11 | Pagás con solo acercar | NFC: la antena del lector crea un campo magnético a 13,56 MHz; la tarjeta, sin batería, se alimenta de ese campo y responde. Alcance de unos 4 cm. | pizarrón | Tomás | ¿Ya pagás todo acercando el celu? | 2 |
| 12 | Tu celu no manda el número de tu tarjeta | Tokenización: se usa un número sustituto (token) ligado al dispositivo, que no sirve para pagar desde otro lado. | terminal | Tomás | ¿Te daba miedo pagar con el celu? | 12 |
| 13 | Por qué el chip no se copia como la banda | El chip genera un código (criptograma) distinto en cada compra con una clave que nunca sale del chip; la banda magnética tiene datos fijos que se pueden copiar. | pizarrón | Tomás | ¿Hace cuánto no pasás la banda? | 22 |
| 14 | Tu tarjeta de transporte no tiene batería | Las tarjetas de transporte sin contacto usan la misma inducción que el NFC: reciben energía del lector y le devuelven datos. | motion azul | Tomás | ¿Cuántas tarjetas tenés en la billetera? | 32 |
| 15 | Tu PIN viaja encriptado | El teclado del cajero cifra el PIN dentro del propio teclado antes de enviarlo, así no circula en claro. | terminal | Tomás | ¿Tapás el teclado cuando ponés la clave? | 42 |
| 16 | El número de atrás de la tarjeta | El CVV no está en la banda ni se puede guardar en los comercios; sirve para comprobar, en compras online, que tenés la tarjeta física. | cuaderno | Tomás | ¿Te lo acordás de memoria? | 52 |
| 17 | Tu tarjeta tiene un dígito espía | Algoritmo de Luhn: el último dígito del número es de control y detecta errores de tipeo al instante, sin consultar al banco. | pizarrón | Tomás | ¿Probamos un número a mano en el próximo reel? | 62 |
| 18 | Un QR para pagar en cualquier app | El QR de pago codifica los datos del comercio y el importe en un estándar común, y tu app lo lee y pide autorización. | collage | Tomás | ¿Pagás más con QR o con tarjeta? | 72 |
| 19 | Tu pago se aprueba en segundos | La terminal manda la compra al procesador, a la red de la tarjeta y al banco emisor, que revisa saldo y riesgo y responde. | motion azul | Tomás | ¿Se te cayó alguna vez el posnet justo al pagar? | 82 |
| 20 | Cómo sabe una máquina que un billete es real | Los detectores revisan luz ultravioleta, infrarrojo y tintas con propiedades magnéticas que son difíciles de imitar. | collage | Tomás | ¿Mirás los billetes a contraluz? | 92 |

### Serie 3: Seguridad

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 21 | Tu contraseña no está guardada en ningún lado | Los sitios guardan un hash (resultado de una cuenta matemática de una sola vía) más una sal; al entrar comparan hashes, no contraseñas. | terminal | Elena | ¿Qué tan larga es tu contraseña principal? | 3 |
| 22 | El captcha te mide la mano | Algunos captcha analizan cómo movés el mouse y cómo te comportás en la página, no solo la respuesta; el sistema devuelve un puntaje de riesgo. | cuaderno | Elena | ¿Cuántos semáforos tuviste que marcar hoy? | 13 |
| 23 | Ni la app puede leer tu chat | Cifrado de extremo a extremo (protocolo Signal): las claves viven en los dispositivos, y el servidor solo ve mensajes ilegibles. | chat | Elena | ¿Sabías que tus chats van cifrados? | 23 |
| 24 | El candadito del navegador | HTTPS/TLS: el sitio presenta un certificado verificable y ambos acuerdan una clave para cifrar todo lo que viaja. | pizarrón | Elena | ¿Mirás el candadito antes de poner tu tarjeta? | 33 |
| 25 | El código de 6 dígitos que cambia solo | TOTP: la app y el servidor comparten un secreto y calculan el código con la hora actual; no hace falta internet para generarlo. | pixel art | Elena | ¿Tenés activada la verificación en dos pasos? | 43 |
| 26 | Contraseñas sin contraseña | Passkeys: par de claves pública y privada; la privada queda en tu dispositivo y se desbloquea con huella o cara, así no hay nada que filtrar del servidor. | motion azul | Elena | ¿Ya probaste entrar con una passkey? | 53 |
| 27 | El WiFi del café y los curiosos | En una red abierta, el tráfico sin cifrar puede ser leído por otros; HTTPS y una VPN (túnel cifrado) lo protegen. | chat | Elena | ¿Te conectás a cualquier WiFi público? | 63 |
| 28 | El control del auto que cambia de código | Código rotativo (rolling code): cada pulsación emite un código distinto, así grabarlo y repetirlo no sirve. | terminal | Elena | ¿Se te trabó alguna vez la llave a distancia? | 73 |
| 29 | Tu banco sabe que no fuiste vos | Modelos que comparan cada compra con tu patrón habitual (lugar, monto, hora) y calculan un riesgo antes de aprobarla. | chat | Elena | ¿Te bloquearon alguna vez una compra legítima? | 83 |
| 30 | Por qué el spam casi no llega | Los filtros combinan reglas y modelos estadísticos entrenados con millones de mensajes marcados como spam. | terminal | Elena | ¿Cuál fue el spam más raro que recibiste? | 93 |

### Serie 4: Internet y apps

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 31 | Google te responde antes de que termines | Usa un índice invertido precalculado (palabra a páginas) repartido en miles de servidores que trabajan en paralelo; no recorre la web en vivo. | motion azul | Tomás | ¿Qué fue lo último que googleaste? | 4 |
| 32 | Netflix no se corta (casi nunca) | Streaming adaptativo: el video se parte en trozos de pocos segundos en varias calidades y el reproductor elige según tu conexión; además hay copias en servidores cerca tuyo (CDN). | motion azul | Tomás | ¿Ves series en HD o ya cambiaste a 4K? | 14 |
| 33 | Internet llega a tu casa con luz | Fibra óptica: pulsos de luz láser viajan por un hilo de vidrio rebotando por reflexión total interna. | collage | Tomás | ¿Tenés fibra o todavía cable? | 24 |
| 34 | Internet cruza el mar por un cable | Casi todo el tráfico entre continentes viaja por cables submarinos de fibra óptica, no por satélite. | collage | Tomás | ¿Adivinás cuántos cables llegan al país? | 34 |
| 35 | La agenda de contactos de internet | DNS traduce nombres como google.com en direcciones IP que las máquinas sí entienden. | cuaderno | Tomás | ¿Te acordás de alguna dirección IP? | 44 |
| 36 | Un mail viaja por varios servidores | Tu servidor busca por DNS el servidor de correo del destinatario (registro MX) y le entrega el mensaje por SMTP. | chat | Tomás | ¿Cuántos mails sin leer tenés ahora? | 54 |
| 37 | ¿Qué es 'la nube'? | Son computadoras de otra empresa, en centros de datos, que guardan y procesan tus archivos a través de internet. | collage | Tomás | ¿Qué guardás en la nube? | 64 |
| 38 | Tu video pesa mucho menos de lo que parece | Compresión: la foto (JPG) descarta detalles que el ojo casi no nota, y el video guarda solo lo que cambia entre cuadros. | pizarrón | Tomás | ¿Notás la diferencia entre foto original y comprimida? | 74 |
| 39 | Por qué la app de videos te conoce | Un sistema de recomendación mide qué mirás, cuánto tiempo y qué repetís, y busca videos que le gustaron a gente parecida. | motion azul | Tomás | ¿Qué te recomienda hoy tu feed? | 84 |
| 40 | Por qué reiniciar el router lo arregla | El reinicio libera memoria y errores acumulados, renegocia la conexión con el proveedor y vuelve a pedir una dirección IP. | cuaderno | Tomás | ¿Cada cuánto reiniciás el router? | 94 |

### Serie 5: Casa

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 41 | Tu aire no se prende y apaga | Aire inverter: el compresor tiene un motor de velocidad variable y ajusta su potencia en vez de funcionar a todo o nada, así gasta menos. | pizarrón | Elena | ¿Tenés aire inverter o común? | 5 |
| 42 | La heladera no crea frío: lo saca | Un refrigerante en circuito cerrado se evapora adentro absorbiendo calor y se comprime y enfría afuera (la parrilla de atrás), donde libera ese calor. | pizarrón | Elena | ¿Dónde ponés lo que más rápido querés enfriar? | 15 |
| 43 | El microondas hace vibrar el agua | Ondas de unos 2,45 GHz hacen girar las moléculas de agua de la comida; la fricción las calienta. La malla de la puerta bloquea las ondas. | motion azul | Elena | ¿Qué es lo peor que calentaste ahí? | 25 |
| 44 | Una olla que se calienta sin fuego | Inducción: una bobina genera un campo magnético alterno que crea corrientes en el fondo metálico de la olla y la calienta directamente. | pixel art | Elena | ¿Cocinás con gas o con inducción? | 35 |
| 45 | El termo que mantiene el calor | Doble pared con vacío en el medio: sin aire casi no hay conducción ni convección, y la superficie reflectante reduce la radiación. | collage | Elena | ¿Cuántas horas te dura el agua caliente? | 45 |
| 46 | La pava se apaga sola | Un termostato bimetálico (dos metales que se dilatan distinto) se curva con el vapor y corta el contacto eléctrico. | pixel art | Elena | ¿Alguna vez se te olvidó la pava prendida? | 55 |
| 47 | El robot que no choca con nada | La aspiradora robot mapea el lugar con sensores (algunas con láser lidar, otras con cámara) y planifica su recorrido. | motion azul | Elena | ¿Qué le pondrías a limpiar primero? | 65 |
| 48 | Tu control remoto manda luz invisible | Un LED infrarrojo parpadea con un código para cada botón; la cámara del celu puede verlo aunque vos no. | collage | Elena | ¿Ya probaste mirar tu control con la cámara? | 75 |
| 49 | La térmica salta para salvarte | La térmica corta por sobrecarga de corriente (bimetal) y el disyuntor diferencial corta si detecta una fuga de corriente hacia tierra. | pizarrón | Elena | ¿Sabés dónde está el tablero de tu casa? | 85 |
| 50 | Cargar el celu sin cable | Carga inalámbrica: el cargador crea un campo magnético variable y una bobina del celu lo convierte en corriente por inducción. | motion azul | Elena | ¿Usás carga inalámbrica o cable de siempre? | 95 |

### Serie 6: Ciudad y transporte

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 51 | El semáforo sabe que llegaste | Espiras de alambre bajo el asfalto detectan el metal de un auto por el cambio en su campo; también se usan cámaras y radares. | pixel art | Tomás | ¿Te tocó un semáforo eterno hoy? | 6 |
| 52 | El ascensor decide por vos | Con varios pedidos, un algoritmo de despacho asigna cuál cabina va; el contrapeso reduce el esfuerzo del motor y hay frenos de seguridad. | pixel art | Tomás | ¿Subís por escalera o ascensor? | 16 |
| 53 | El radar sabe a cuánto ibas | Efecto Doppler: la onda que rebota en un auto en movimiento cambia de frecuencia según su velocidad. | pizarrón | Tomás | ¿Escuchaste el efecto Doppler en una ambulancia? | 26 |
| 54 | Google Maps sabe que hay tráfico | Usa datos anónimos de velocidad de celulares que circulan por cada tramo de la ruta. | motion azul | Tomás | ¿Seguís siempre lo que dice el mapa? | 36 |
| 55 | Cómo sabe la app cuándo llega el colectivo | El vehículo manda su posición GPS cada tanto y la app estima el tiempo según distancia y velocidad reciente. | chat | Tomás | ¿Qué línea esperás todos los días? | 46 |
| 56 | La puerta que se abre sola | Sensores de movimiento por microondas o infrarrojo detectan que alguien se acerca y activan el motor. | cuaderno | Tomás | ¿Te quedaste alguna vez parado frente a una que no abría? | 56 |
| 57 | El peaje que no te frena | Un tag en el auto responde a una antena del carril con un código de identificación; se descuenta del saldo asociado. | terminal | Tomás | ¿Tenés telepeaje? | 66 |
| 58 | La luz de la calle sabe que anocheció | Una fotocélula mide la luz natural y enciende la lámpara cuando baja de cierto nivel. | cuaderno | Tomás | ¿Cuándo se prenden las luces de tu cuadra? | 76 |
| 59 | La cámara que lee patentes | Detecta la placa, separa los caracteres y reconoce cada uno con OCR y modelos de visión. | terminal | Tomás | ¿Dónde viste una de estas cámaras? | 86 |
| 60 | Tu celu salta de antena sin que lo notes | Cada antena cubre una celda; al moverte, la red traspasa tu conexión a la siguiente (handover) sin cortar la llamada. | pizarrón | Tomás | ¿Dónde se te corta siempre la señal? | 96 |

### Serie 7: Pantallas, sonido y foto

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 61 | Auriculares que borran el ruido | Micrófonos captan el ruido y un parlante emite la onda opuesta: interferencia destructiva. | motion azul | Elena | ¿Usás cancelación de ruido? | 7 |
| 62 | Tu pantalla tiene solo tres colores | Cada píxel combina un subpíxel rojo, uno verde y uno azul con distinta intensidad para formar los demás colores. | collage | Elena | ¿Probaste una gota de agua sobre la pantalla? | 17 |
| 63 | El fondo falso de la videollamada | Un modelo separa a la persona del fondo cuadro por cuadro y reemplaza o desenfoca todo lo demás. | chat | Elena | ¿Con qué fondo te videollamás? | 27 |
| 64 | Retrato con fondo desenfocado | El celu estima la profundidad (con dos cámaras o con IA) y desenfoca por software lo que está lejos. | collage | Elena | ¿Cuál fue tu mejor foto retrato? | 37 |
| 65 | La foto que no sale movida | Estabilizador óptico: usa el giroscopio y un pequeño motor que mueve la lente o el sensor en contra del temblor. | pixel art | Elena | ¿Sacás fotos con pulso firme o con ayuda? | 47 |
| 66 | Pantalla de 120 hz | Refresca la imagen 120 veces por segundo en lugar de 60, por eso el movimiento y el scroll se ven más fluidos. | motion azul | Elena | ¿Notás la diferencia con 60 hz? | 57 |
| 67 | El mouse que ve la mesa | Sensor óptico: toma miles de fotos por segundo de la superficie y compara cuánto se movió la textura. | pixel art | Elena | ¿Mouse o touchpad? | 67 |
| 68 | Una impresora que dispara gotas | Los cartuchos lanzan microgotas de tinta (picolitros) con calor o con vibración piezoeléctrica. | pizarrón | Elena | ¿Cuándo fue la última vez que imprimiste algo? | 77 |
| 69 | El filtro que te pone orejas | Detecta puntos de referencia de la cara (ojos, nariz, boca) y los sigue cuadro por cuadro para pegarle el efecto. | chat | Elena | ¿Cuál es tu filtro favorito? | 87 |
| 70 | Sonido que parece venir de atrás | Audio espacial: ajusta pequeñas diferencias de tiempo y volumen entre cada oído para simular dirección. | cuaderno | Elena | ¿Probaste audio espacial con auriculares? | 97 |

### Serie 8: Autos y movilidad

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 71 | El auto que pita cuando te acercás | Sensores de ultrasonido emiten un pulso y miden cuánto tarda el eco, como un murciélago. | pizarrón | Tomás | ¿Confiás en los sensores de estacionamiento? | 8 |
| 72 | El airbag se infla en milésimas | Un acelerómetro detecta una desaceleración brusca y activa una carga que genera gas; se infla en decenas de milisegundos. | pizarrón | Tomás | ¿Sabías que tarda menos que un parpadeo? | 18 |
| 73 | Frenar sin que las ruedas se bloqueen | ABS: sensores de velocidad en cada rueda; si una se frena de más, una válvula suelta y aprieta el freno muchas veces por segundo. | pixel art | Tomás | ¿Sentiste vibrar el pedal alguna vez? | 28 |
| 74 | El auto eléctrico recarga frenando | Frenado regenerativo: el motor funciona como generador al desacelerar y manda energía a la batería. | pixel art | Tomás | ¿Te comprarías uno eléctrico? | 38 |
| 75 | La llave del auto tiene un chip | Inmovilizador: el chip responde con un código a una antena del auto; si no coincide, el motor no arranca. | terminal | Tomás | ¿Perdiste alguna vez la llave? | 48 |
| 76 | El limpiaparabrisas sabe que llueve | Un sensor infrarrojo mide cuánta luz refleja el vidrio; las gotas cambian esa reflexión. | pixel art | Tomás | ¿Los tuyos son automáticos? | 58 |
| 77 | El cinturón se aprieta solo | Pretensor: en un choque, una pequeña carga o mecanismo tensa el cinturón en milésimas para sujetarte antes. | pizarrón | Tomás | ¿Te pusiste el cinturón hoy? | 68 |
| 78 | El control crucero que frena solo | Un radar mide distancia y velocidad relativa del auto de adelante y el sistema acelera o frena para mantener la separación. | motion azul | Tomás | ¿Lo usarías en ruta? | 78 |
| 79 | La cámara 360 del auto | Varias cámaras gran angular y un software que cose las imágenes para mostrar una vista aérea simulada. | collage | Tomás | ¿Estacionás mejor con cámara? | 88 |
| 80 | La bici que pedalea con vos | Un sensor detecta que pedaleás y el motor eléctrico suma ayuda mientras lo hacés. | pixel art | Tomás | ¿Probaste una bici eléctrica? | 98 |

### Serie 9: Cuerpo y salud

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 81 | Tu reloj mide el pulso con luz verde | Fotopletismografía: LEDs verdes iluminan la piel y la sangre absorbe más luz con cada latido; un sensor lo registra. | motion azul | Elena | ¿Cuál es tu pulso en reposo? | 9 |
| 82 | Luz roja para medir oxígeno | El oxímetro usa luz roja e infrarroja: la sangre con y sin oxígeno las absorbe distinto, y de ahí sale el porcentaje. | collage | Elena | ¿Lo usaste alguna vez? | 19 |
| 83 | Cuenta pasos sin contar | El acelerómetro detecta el patrón rítmico de golpes al caminar y suma un paso por cada uno. | terminal | Elena | ¿Cuántos pasos hacés por día? | 29 |
| 84 | El termómetro que no toca | Un sensor infrarrojo mide la radiación térmica que emite la piel y la convierte en temperatura. | cuaderno | Elena | ¿Termómetro de mercurio o digital? | 39 |
| 85 | El tensiómetro escucha tu pulso | Método oscilométrico: infla un manguito, lo desinfla de a poco y un sensor detecta las oscilaciones de presión que causa la arteria. | pizarrón | Elena | ¿Sabés cuál es tu presión? | 49 |
| 86 | El reloj que detecta una caída | Acelerómetro y giroscopio buscan un golpe brusco seguido de quietud y, si no respondés, pueden avisar a un contacto. | chat | Elena | ¿Tenés activada la detección de caídas? | 59 |
| 87 | La radiografía ve tus huesos | Los rayos X atraviesan los tejidos blandos pero los huesos absorben más, y esa diferencia forma la imagen. | collage | Elena | ¿Te rompiste algún hueso alguna vez? | 69 |
| 88 | Cómo sabe tu pulsera que dormiste | Combina movimiento y frecuencia cardíaca para estimar las fases del sueño; es una estimación, no un estudio médico. | cuaderno | Elena | ¿Cuántas horas dormiste anoche? | 79 |
| 89 | Un audífono que escucha por vos | Un micrófono capta el sonido y un procesador amplifica las frecuencias que la persona oye menos, sin subir todo igual. | motion azul | Elena | ¿Conocés a alguien que use uno? | 89 |
| 90 | La balanza digital sin resorte | Celda de carga: una pieza metálica se deforma apenas y unas galgas extensiométricas cambian su resistencia eléctrica. | pizarrón | Elena | ¿Te pesás seguido? | 99 |

### Serie 10: IA y datos

| N.º | Título-gancho | Idea técnica central | Formato | Voz | Pregunta de cierre | Día |
|---|---|---|---|---|---|---|
| 91 | El chat con IA predice, no piensa | Un modelo de lenguaje calcula la palabra (token) más probable que sigue, usando patrones aprendidos de enormes cantidades de texto. | chat | Tomás | ¿Qué le preguntaste hoy a una IA? | 10 |
| 92 | Cómo te entiende cuando le hablás al celu | El reconocimiento de voz convierte el audio en sonidos y luego en palabras con redes neuronales entrenadas con muchas voces. | terminal | Tomás | ¿Dictás mensajes o los escribís? | 20 |
| 93 | El traductor que lee la frase entera | Usa redes neuronales que miran toda la oración y su contexto, no palabra por palabra. | chat | Tomás | ¿Cuál fue la peor traducción que viste? | 30 |
| 94 | Netflix sabe lo que te gusta | Compara tu historial con el de gente parecida y con las características de cada título para estimar qué vas a mirar. | motion azul | Tomás | ¿Qué serie te recomendó y acertó? | 40 |
| 95 | Tu galería sabe quién es tu mamá | Convierte cada cara en una lista de números y agrupa las que se parecen. | collage | Tomás | ¿Cuántas fotos tenés en la galería? | 50 |
| 96 | Escanear un papel con el celu | Detecta los bordes, corrige la perspectiva y usa OCR para reconocer las letras. | cuaderno | Tomás | ¿Todavía imprimís documentos? | 60 |
| 97 | Una IA aprende a fuerza de errores | Entrenamiento: ajusta millones de números poco a poco para reducir el error en ejemplos conocidos. | cuaderno | Tomás | ¿Cuál fue tu mayor error de aprendizaje? | 70 |
| 98 | Un video falso que parece real | Deepfake: una red neuronal aprende los rasgos de una cara y los reproduce en otro video; buscar cortes, parpadeos y bordes ayuda a detectarlos. | pixel art | Tomás | ¿Te creíste alguna vez un video falso? | 80 |
| 99 | El asistente que escucha 'Hola...' | Un modelo pequeño dentro del dispositivo escucha solo la palabra de activación; en general, recién después se envía audio a procesar. | terminal | Tomás | ¿Le hablás al asistente? | 90 |
| 100 | El auto que se maneja solo | Cámaras, radares y otros sensores alimentan una IA que detecta objetos, predice movimientos y decide acelerar, frenar o girar. | motion azul | Tomás | ¿Te subirías a uno? | 100 |

## Orden de publicación (100 días)

| Día | Tema | Serie | Formato | Voz |
|---|---|---|---|---|
| 1 | 1. Tu celu adivina lo que vas a escribir | Tu celu | chat | Elena |
| 2 | 11. Pagás con solo acercar | Pagos y plata | pizarrón | Tomás |
| 3 | 21. Tu contraseña no está guardada en ningún lado | Seguridad | terminal | Elena |
| 4 | 31. Google te responde antes de que termines | Internet y apps | motion azul | Tomás |
| 5 | 41. Tu aire no se prende y apaga | Casa | pizarrón | Elena |
| 6 | 51. El semáforo sabe que llegaste | Ciudad y transporte | pixel art | Tomás |
| 7 | 61. Auriculares que borran el ruido | Pantallas, sonido y foto | motion azul | Elena |
| 8 | 71. El auto que pita cuando te acercás | Autos y movilidad | pizarrón | Tomás |
| 9 | 81. Tu reloj mide el pulso con luz verde | Cuerpo y salud | motion azul | Elena |
| 10 | 91. El chat con IA predice, no piensa | IA y datos | chat | Tomás |
| 11 | 2. Tu dedo es tu contraseña | Tu celu | pizarrón | Elena |
| 12 | 12. Tu celu no manda el número de tu tarjeta | Pagos y plata | terminal | Tomás |
| 13 | 22. El captcha te mide la mano | Seguridad | cuaderno | Elena |
| 14 | 32. Netflix no se corta (casi nunca) | Internet y apps | motion azul | Tomás |
| 15 | 42. La heladera no crea frío: lo saca | Casa | pizarrón | Elena |
| 16 | 52. El ascensor decide por vos | Ciudad y transporte | pixel art | Tomás |
| 17 | 62. Tu pantalla tiene solo tres colores | Pantallas, sonido y foto | collage | Elena |
| 18 | 72. El airbag se infla en milésimas | Autos y movilidad | pizarrón | Tomás |
| 19 | 82. Luz roja para medir oxígeno | Cuerpo y salud | collage | Elena |
| 20 | 92. Cómo te entiende cuando le hablás al celu | IA y datos | terminal | Tomás |
| 21 | 3. Tu cara abre el celu, ¿y una foto no? | Tu celu | motion azul | Elena |
| 22 | 13. Por qué el chip no se copia como la banda | Pagos y plata | pizarrón | Tomás |
| 23 | 23. Ni la app puede leer tu chat | Seguridad | chat | Elena |
| 24 | 33. Internet llega a tu casa con luz | Internet y apps | collage | Tomás |
| 25 | 43. El microondas hace vibrar el agua | Casa | motion azul | Elena |
| 26 | 53. El radar sabe a cuánto ibas | Ciudad y transporte | pizarrón | Tomás |
| 27 | 63. El fondo falso de la videollamada | Pantallas, sonido y foto | chat | Elena |
| 28 | 73. Frenar sin que las ruedas se bloqueen | Autos y movilidad | pixel art | Tomás |
| 29 | 83. Cuenta pasos sin contar | Cuerpo y salud | terminal | Elena |
| 30 | 93. El traductor que lee la frase entera | IA y datos | chat | Tomás |
| 31 | 4. Esa foto salió de varias fotos | Tu celu | collage | Elena |
| 32 | 14. Tu tarjeta de transporte no tiene batería | Pagos y plata | motion azul | Tomás |
| 33 | 24. El candadito del navegador | Seguridad | pizarrón | Elena |
| 34 | 34. Internet cruza el mar por un cable | Internet y apps | collage | Tomás |
| 35 | 44. Una olla que se calienta sin fuego | Casa | pixel art | Elena |
| 36 | 54. Google Maps sabe que hay tráfico | Ciudad y transporte | motion azul | Tomás |
| 37 | 64. Retrato con fondo desenfocado | Pantallas, sonido y foto | collage | Elena |
| 38 | 74. El auto eléctrico recarga frenando | Autos y movilidad | pixel art | Tomás |
| 39 | 84. El termómetro que no toca | Cuerpo y salud | cuaderno | Elena |
| 40 | 94. Netflix sabe lo que te gusta | IA y datos | motion azul | Tomás |
| 41 | 5. El modo avión no apaga nada del avión | Tu celu | chat | Elena |
| 42 | 15. Tu PIN viaja encriptado | Pagos y plata | terminal | Tomás |
| 43 | 25. El código de 6 dígitos que cambia solo | Seguridad | pixel art | Elena |
| 44 | 35. La agenda de contactos de internet | Internet y apps | cuaderno | Tomás |
| 45 | 45. El termo que mantiene el calor | Casa | collage | Elena |
| 46 | 55. Cómo sabe la app cuándo llega el colectivo | Ciudad y transporte | chat | Tomás |
| 47 | 65. La foto que no sale movida | Pantallas, sonido y foto | pixel art | Elena |
| 48 | 75. La llave del auto tiene un chip | Autos y movilidad | terminal | Tomás |
| 49 | 85. El tensiómetro escucha tu pulso | Cuerpo y salud | pizarrón | Elena |
| 50 | 95. Tu galería sabe quién es tu mamá | IA y datos | collage | Tomás |
| 51 | 6. Negro de verdad: píxeles apagados | Tu celu | pixel art | Elena |
| 52 | 16. El número de atrás de la tarjeta | Pagos y plata | cuaderno | Tomás |
| 53 | 26. Contraseñas sin contraseña | Seguridad | motion azul | Elena |
| 54 | 36. Un mail viaja por varios servidores | Internet y apps | chat | Tomás |
| 55 | 46. La pava se apaga sola | Casa | pixel art | Elena |
| 56 | 56. La puerta que se abre sola | Ciudad y transporte | cuaderno | Tomás |
| 57 | 66. Pantalla de 120 hz | Pantallas, sonido y foto | motion azul | Elena |
| 58 | 76. El limpiaparabrisas sabe que llueve | Autos y movilidad | pixel art | Tomás |
| 59 | 86. El reloj que detecta una caída | Cuerpo y salud | chat | Elena |
| 60 | 96. Escanear un papel con el celu | IA y datos | cuaderno | Tomás |
| 61 | 7. Tu celu carga más lento al final | Tu celu | terminal | Elena |
| 62 | 17. Tu tarjeta tiene un dígito espía | Pagos y plata | pizarrón | Tomás |
| 63 | 27. El WiFi del café y los curiosos | Seguridad | chat | Elena |
| 64 | 37. ¿Qué es 'la nube'? | Internet y apps | collage | Tomás |
| 65 | 47. El robot que no choca con nada | Casa | motion azul | Elena |
| 66 | 57. El peaje que no te frena | Ciudad y transporte | terminal | Tomás |
| 67 | 67. El mouse que ve la mesa | Pantallas, sonido y foto | pixel art | Elena |
| 68 | 77. El cinturón se aprieta solo | Autos y movilidad | pizarrón | Tomás |
| 69 | 87. La radiografía ve tus huesos | Cuerpo y salud | collage | Elena |
| 70 | 97. Una IA aprende a fuerza de errores | IA y datos | cuaderno | Tomás |
| 71 | 8. Tu celu sabe que lo diste vuelta | Tu celu | pixel art | Elena |
| 72 | 18. Un QR para pagar en cualquier app | Pagos y plata | collage | Tomás |
| 73 | 28. El control del auto que cambia de código | Seguridad | terminal | Elena |
| 74 | 38. Tu video pesa mucho menos de lo que parece | Internet y apps | pizarrón | Tomás |
| 75 | 48. Tu control remoto manda luz invisible | Casa | collage | Elena |
| 76 | 58. La luz de la calle sabe que anocheció | Ciudad y transporte | cuaderno | Tomás |
| 77 | 68. Una impresora que dispara gotas | Pantallas, sonido y foto | pizarrón | Elena |
| 78 | 78. El control crucero que frena solo | Autos y movilidad | motion azul | Tomás |
| 79 | 88. Cómo sabe tu pulsera que dormiste | Cuerpo y salud | cuaderno | Elena |
| 80 | 98. Un video falso que parece real | IA y datos | pixel art | Tomás |
| 81 | 9. La pantalla se apaga cuando llamás | Tu celu | pizarrón | Elena |
| 82 | 19. Tu pago se aprueba en segundos | Pagos y plata | motion azul | Tomás |
| 83 | 29. Tu banco sabe que no fuiste vos | Seguridad | chat | Elena |
| 84 | 39. Por qué la app de videos te conoce | Internet y apps | motion azul | Tomás |
| 85 | 49. La térmica salta para salvarte | Casa | pizarrón | Elena |
| 86 | 59. La cámara que lee patentes | Ciudad y transporte | terminal | Tomás |
| 87 | 69. El filtro que te pone orejas | Pantallas, sonido y foto | chat | Elena |
| 88 | 79. La cámara 360 del auto | Autos y movilidad | collage | Tomás |
| 89 | 89. Un audífono que escucha por vos | Cuerpo y salud | motion azul | Elena |
| 90 | 99. El asistente que escucha 'Hola...' | IA y datos | terminal | Tomás |
| 91 | 10. Tu celu sabe si es de día | Tu celu | cuaderno | Elena |
| 92 | 20. Cómo sabe una máquina que un billete es real | Pagos y plata | collage | Tomás |
| 93 | 30. Por qué el spam casi no llega | Seguridad | terminal | Elena |
| 94 | 40. Por qué reiniciar el router lo arregla | Internet y apps | cuaderno | Tomás |
| 95 | 50. Cargar el celu sin cable | Casa | motion azul | Elena |
| 96 | 60. Tu celu salta de antena sin que lo notes | Ciudad y transporte | pizarrón | Tomás |
| 97 | 70. Sonido que parece venir de atrás | Pantallas, sonido y foto | cuaderno | Elena |
| 98 | 80. La bici que pedalea con vos | Autos y movilidad | pixel art | Tomás |
| 99 | 90. La balanza digital sin resorte | Cuerpo y salud | pizarrón | Elena |
| 100 | 100. El auto que se maneja solo | IA y datos | motion azul | Tomás |
