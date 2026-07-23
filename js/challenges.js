// Lista de retos y premios de la despedida.
// Para editar retos o premios, simplemente cambia el texto aqui.
// "id" no se debe repetir ni reordenar una vez publicada la app,
// porque el progreso guardado en Firebase se referencia por id.
//
// "points": puntuacion del reto (a mas "hardcore"/dificil, mas puntos).
// Escala usada: 1 = trivial, 2 = facil, 3 = medio, 4 = duro, 5 = muy duro,
// y el reto estrella tiene un valor especial mas alto. Es solo un numero
// por reto, asi que para re-equilibrar la dificultad basta con cambiar
// este valor, no hace falta tocar nada mas (el desbloqueo de las
// imagenes premio en js/app.js se recalcula solo a partir de estos puntos).
//
// "category": a que dia del finde pertenece el reto. Determina cuando se
// desbloquea (ver CATEGORY_UNLOCK mas abajo) y en que bloque de la pestaña
// de retos aparece:
//   - "viernes" / "sabado" / "domingo": ocultos (sin texto ni pistas) hasta
//     que llega su fecha real, para no hacer spoiler (ej. el reto del barco
//     no debe verse el viernes).
//   - "genericos": sin restriccion de fecha, visibles y disponibles desde
//     el primer momento.
const CHALLENGES = [
  { id: 1, text: "Hacer de perro durante 2 minutos", prize: "1 Copa", points: 1, category: "genericos" },
  { id: 2, text: "Atarlo con cinta americana y no soltarlo hasta pagar un rescate", prize: "Comida/cena", points: 3, category: "genericos" },
  { id: 3, text: "Pintarse las uñas de una mano", prize: "Chupito", points: 1, category: "genericos" },
  { id: 4, text: "Pedir calos a extraños que estén fumando", prize: "Chupito", points: 1, category: "viernes" },
  { id: 5, text: "Conseguir buches de copas de mujeres (si te haces hidalgo tienes extra)", prize: "Copa", points: 2, category: "viernes" },
  { id: 6, text: "Tirarte desnudo del barco", prize: "3 Copas", points: 4, category: "sabado" },
  { id: 7, text: "Realizar un brindis random", prize: "Chupito", points: 1, category: "genericos" },
  { id: 8, text: "Conseguir 10 firmas de mujeres", prize: "1 Copa", points: 2, category: "viernes" },
  { id: 9, text: "Convencer a alguien para que le enseñe un paso de baile y repetirlo/bailar juntos", prize: "Chupito", points: 1, category: "viernes" },
  { id: 10, text: "Conseguir vídeos felicitándole la boda", prize: "1 Chupito", points: 1, category: "genericos" },
  { id: 11, text: "Pedir una copa exacta con gestos", prize: "1 Chupito", points: 1, category: "sabado" },
  { id: 12, text: "Selfie con un policía", prize: "2 Copas", points: 3, category: "genericos" },
  { id: 13, text: "Hacerte un tatuaje", prize: "3 Copas", points: 5, category: "genericos" },
  { id: 14, text: "Hacer una actuación durante 2 minutos en un lugar público", prize: "1 Copa", points: 2, category: "genericos" },
  { id: 15, text: "Hacer una conga de 10 personas sin contarnos", prize: "1 Copa", points: 2, category: "viernes" },
  { id: 16, text: "Robar una escobilla de váter (extra si está sucia)", prize: "Ronda de cervezas", points: 3, category: "sabado" },
  { id: 17, text: "1 minuto de plancha", prize: "Ronda de cervezas", points: 2, category: "genericos" },
  { id: 18, text: "Hacer una pirámide humana con desconocidos (extra por 5 personas)", prize: "1 Copa", points: 2, category: "genericos" },
  { id: 19, text: "Mear en la barra de una discoteca", prize: "1 Comida", points: 4, category: "viernes" },
  { id: 20, text: "Estar 1 hora sin fumar", prize: "1 Copa", points: 2, category: "genericos" },
  { id: 21, text: "Desayunar whiskey con cereales", prize: "1 Comida", points: 4, category: "sabado" },
  { id: 22, text: "Probar unas sandalias del paseo marítimo y hacer amago de salir a correr", prize: "Copa", points: 1, category: "genericos" },
  { id: 23, text: "Gritar en medio de una comida", prize: "Copa", points: 2, category: "genericos" },
  { id: 24, text: "Cantarle cumpleaños feliz a un desconocido", prize: "Ronda de cervezas", points: 2, category: "genericos" },
  { id: 25, text: "Conseguir un after", prize: "3 Copas", points: 4, category: "sabado" },
  { id: 26, text: "Conseguir un baile erótico (a más humillante mejor)", prize: "Dependiendo de lo visto", points: 3, category: "viernes" },
  { id: 27, text: "Dejarse duchar", prize: "5 Copas", points: 5, category: "sabado" },
  { id: 28, text: "Cambiarse la camiseta con alguien y no devolvérsela", prize: "2 Copas", points: 3, category: "sabado" },
  { id: 29, text: "Vender dos paquetes de pañuelos en un semáforo", prize: "Ronda de cervezas", points: 2, category: "genericos" },
  { id: 30, text: "Fumarse un cigarro entero por la nariz", prize: "Cáncer de pulmón", points: 4, category: "sabado" },
  { id: 31, text: "Arrestar a alguien", prize: "2 Copas", points: 4, category: "genericos" },
  { id: 32, text: "Tirarse una cerveza entera encima", prize: "Ronda de cervezas", points: 1, category: "viernes" },
  { id: 33, text: "Tirarse del catamarán en marcha", prize: "3 Copas", points: 5, category: "sabado" },
  { id: 34, text: "Tirarte en bomba en una piscina de beach club/discoteca", prize: "Ronda de cervezas", points: 2, category: "sabado" },
  { id: 35, text: "Sacar un dospa con tu cuñao", prize: "2 Copas", points: 2, category: "genericos" },
  { id: 36, text: "Coger 'prestadas' unas gafas", prize: "Ronda de cervezas", points: 2, category: "genericos" },
  { id: 37, text: "RETO ESTRELLA: montarlo el sábado en un bus a tomar por culo", prize: "🌟 La leyenda del bus — ¡premio al gusto del grupo!", points: 8, category: "sabado", star: true },

  // --- Retos "chorra" de relleno (faciles, 1-2 pts) -----------------------
  // Sirven para ir sumando puntos sin arriesgarse. Ver DAILY_MILESTONES: el
  // objetivo de cada dia esta calculado para que NO baste con hacer solo
  // estos + los genericos.
  { id: 38, text: "Llevar un bigote postizo (o pintado) durante 3 horas seguidas", prize: "Chupito", points: 1, category: "genericos" },
  { id: 39, text: "Hablar con acento extranjero durante media hora sin explicar por qué", prize: "Copa", points: 2, category: "genericos" },
  { id: 40, text: "Pedir la cuenta en un restaurante hablando en verso", prize: "Chupito", points: 1, category: "genericos" },
  { id: 41, text: "Hacerte pasar por guía turístico y explicar un monumento inventado a un grupo de turistas", prize: "Copa", points: 2, category: "genericos" },
  { id: 42, text: "Llevar puesta una prenda del novio (ropa interior no vale) durante todo un día", prize: "Chupito", points: 1, category: "genericos" },
  { id: 43, text: "Brindar con la primera persona random que veas al llegar", prize: "Chupito", points: 1, category: "viernes" },
  { id: 44, text: "Pedir el primer chupito de la noche imitando la voz de un personaje de dibujos", prize: "Chupito", points: 1, category: "viernes" },
  { id: 45, text: "Hacerte una foto de familia con un grupo de desconocidos en el primer bar de la noche", prize: "Copa", points: 1, category: "viernes" },
  { id: 46, text: "Presentarte a todo el mundo con un nombre falso random durante toda la noche", prize: "Copa", points: 2, category: "viernes" },
  { id: 47, text: "Ponerle crema solar a un desconocido en el barco", prize: "Chupito", points: 1, category: "sabado" },
  { id: 48, text: "Hacer de capitán del barco durante 5 minutos dando órdenes random a la tripulación", prize: "Copa", points: 2, category: "sabado" },
  { id: 49, text: "Aprenderte el nombre de 3 desconocidos del barco y presentarlos por la noche", prize: "Copa", points: 2, category: "sabado" },
  { id: 50, text: "Pedir que te canten el cumpleaños feliz aunque no sea tu cumpleaños", prize: "Chupito", points: 1, category: "sabado" },
  { id: 51, text: "Desayunar con gafas de sol puestas aunque estés en un interior", prize: "Chupito", points: 1, category: "domingo" },
  { id: 52, text: "Hacer una ronda de abrazos de despedida a todo el grupo con música dramática de fondo (tarareada por ti)", prize: "Copa", points: 1, category: "domingo" },
  { id: 53, text: "Contar la anécdota más vergonzosa del finde delante de todos antes de iros", prize: "Copa", points: 2, category: "domingo" },
  { id: 54, text: "Dejar una propina o nota de agradecimiento random a un camarero de camino a casa", prize: "Chupito", points: 1, category: "domingo" },
];

// Fechas reales del finde: viernes 2026-08-24 (desde el almuerzo) a domingo
// 2026-08-26 (hasta despues de comer). Los retos de categoria "viernes" /
// "sabado" / "domingo" quedan ocultos (sin texto ni pistas, para evitar
// spoilers como el del barco) hasta que la fecha/hora del propio dispositivo
// alcanza su desbloqueo. "genericos" no tiene fecha: siempre disponible.
// new Date(año, mesIndex0, dia, hora) usa Date LOCAL del dispositivo.
const CATEGORY_UNLOCK = {
  viernes: new Date(2026, 7, 24, 12, 0, 0), // 24 ago 2026, desde el almuerzo
  sabado: new Date(2026, 7, 25, 0, 0, 0), // 25 ago 2026, desde primera hora
  domingo: new Date(2026, 7, 26, 0, 0, 0), // 26 ago 2026, desde primera hora
  genericos: null, // sin restriccion, siempre disponible
};

// Hitos de puntos por dia: un objetivo que es matematicamente IMPOSIBLE de
// alcanzar sumando solo retos "chorra" (points <= FILLER_MAX_POINTS) de esa
// categoria + los "genericos" (disponibles desde el principio) -- obliga a
// intentar al menos uno o dos retos "arriesgados" (points > FILLER_MAX_POINTS)
// de la categoria de ese dia. Calculo (con los datos de arriba):
//
//   viernes: relleno disponible ese dia = genericos (points<=2) + viernes
//            (points<=2) = 30 + 14 = 44 puntos. El arriesgado mas barato de
//            viernes vale 3 (id 26); el objetivo se fija en 44 + 3 + 1 = 48
//            para que NI el relleno solo NI ese arriesgado barato por si
//            solo lleguen -- hace falta el de 4 (id 19) o los dos juntos.
//   sabado:  relleno disponible ese dia = genericos (points<=2) + sabado
//            (points<=2) = 30 + 9 = 39 puntos. El arriesgado mas barato de
//            sabado vale 3 (id 16 o 28); objetivo = 39 + 3 + 1 = 43 -- hace
//            falta un arriesgado de 4+ puntos, o combinar dos de 3.
//   domingo: sin hito. Solo es la manana de la vuelta (resaca + maletas),
//            todos sus retos son de relleno a proposito -- forzar un
//            objetivo ahi seria un rollo con poco tiempo antes de irse.
const FILLER_MAX_POINTS = 2;
const DAILY_MILESTONES = {
  viernes: 48,
  sabado: 43,
  domingo: null,
};

// Metadatos de cada categoria para la UI: icono, etiqueta y el orden en que
// se muestran las secciones en la pestaña de retos ("genericos" primero
// porque estan disponibles desde el minuto uno). "unlockLabel" es el texto
// que se muestra en la tarjeta de bloqueo mientras esa categoria no esta
// disponible (sin dar ninguna pista del contenido).
const CATEGORY_META = [
  { key: "genericos", label: "Genéricos", icon: "🎉", unlockLabel: null },
  { key: "viernes", label: "Viernes", icon: "🌅", unlockLabel: "el viernes a partir del mediodía" },
  { key: "sabado", label: "Sábado", icon: "🌞", unlockLabel: "el sábado" },
  { key: "domingo", label: "Domingo", icon: "🌙", unlockLabel: "el domingo" },
];

// Imagenes premio que se van desbloqueando por trozos a medida que se
// acumulan puntos (ver getEarnedPoints/renderPrizeImages en js/app.js).
// Cada imagen se corta en una cuadricula de GRID_ROWS x GRID_COLS (2x3 = 6
// piezas). Copia tus 3 fotos dentro de img/retos/ con estos nombres exactos
// (o cambia "file" aqui si prefieres otros nombres).
const PRIZE_GRID_ROWS = 2;
const PRIZE_GRID_COLS = 3;

const PRIZE_IMAGES = [
  { id: 1, file: "img/retos/premio1.jpg", label: "Premio sorpresa #1" },
  { id: 2, file: "img/retos/premio2.jpg", label: "Premio sorpresa #2" },
  { id: 3, file: "img/retos/premio3.jpg", label: "Premio sorpresa #3" },
];
