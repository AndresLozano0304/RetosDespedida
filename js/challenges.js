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
const CHALLENGES = [
  { id: 1, text: "Hacer de perro durante 2 minutos", prize: "1 Copa", points: 1 },
  { id: 2, text: "Atarlo con cinta americana y no soltarlo hasta pagar un rescate", prize: "Comida/cena", points: 3 },
  { id: 3, text: "Pintarse las uñas de una mano", prize: "Chupito", points: 1 },
  { id: 4, text: "Pedir calos a extraños que estén fumando", prize: "Chupito", points: 1 },
  { id: 5, text: "Conseguir buches de copas de mujeres (si te haces hidalgo tienes extra)", prize: "Copa", points: 2 },
  { id: 6, text: "Tirarte desnudo del barco", prize: "3 Copas", points: 4 },
  { id: 7, text: "Realizar un brindis random", prize: "Chupito", points: 1 },
  { id: 8, text: "Conseguir 10 firmas de mujeres", prize: "1 Copa", points: 2 },
  { id: 9, text: "Convencer a alguien para que le enseñe un paso de baile y repetirlo/bailar juntos", prize: "Chupito", points: 1 },
  { id: 10, text: "Conseguir vídeos felicitándole la boda", prize: "1 Chupito", points: 1 },
  { id: 11, text: "Pedir una copa exacta con gestos", prize: "1 Chupito", points: 1 },
  { id: 12, text: "Selfie con un policía", prize: "2 Copas", points: 3 },
  { id: 13, text: "Hacerte un tatuaje", prize: "3 Copas", points: 5 },
  { id: 14, text: "Hacer una actuación durante 2 minutos en un lugar público", prize: "1 Copa", points: 2 },
  { id: 15, text: "Hacer una conga de 10 personas sin contarnos", prize: "1 Copa", points: 2 },
  { id: 16, text: "Robar una escobilla de váter (extra si está sucia)", prize: "Ronda de cervezas", points: 3 },
  { id: 17, text: "1 minuto de plancha", prize: "Ronda de cervezas", points: 2 },
  { id: 18, text: "Hacer una pirámide humana con desconocidos (extra por 5 personas)", prize: "1 Copa", points: 2 },
  { id: 19, text: "Mear en la barra de una discoteca", prize: "1 Comida", points: 4 },
  { id: 20, text: "Estar 1 hora sin fumar", prize: "1 Copa", points: 2 },
  { id: 21, text: "Desayunar whiskey con cereales", prize: "1 Comida", points: 4 },
  { id: 22, text: "Probar unas sandalias del paseo marítimo y hacer amago de salir a correr", prize: "Copa", points: 1 },
  { id: 23, text: "Gritar en medio de una comida", prize: "Copa", points: 2 },
  { id: 24, text: "Cantarle cumpleaños feliz a un desconocido", prize: "Ronda de cervezas", points: 2 },
  { id: 25, text: "Conseguir un after", prize: "3 Copas", points: 4 },
  { id: 26, text: "Conseguir un baile erótico (a más humillante mejor)", prize: "Dependiendo de lo visto", points: 3 },
  { id: 27, text: "Dejarse duchar", prize: "5 Copas", points: 5 },
  { id: 28, text: "Cambiarse la camiseta con alguien y no devolvérsela", prize: "2 Copas", points: 3 },
  { id: 29, text: "Vender dos paquetes de pañuelos en un semáforo", prize: "Ronda de cervezas", points: 2 },
  { id: 30, text: "Fumarse un cigarro entero por la nariz", prize: "Cáncer de pulmón", points: 4 },
  { id: 31, text: "Arrestar a alguien", prize: "2 Copas", points: 4 },
  { id: 32, text: "Tirarse una cerveza entera encima", prize: "Ronda de cervezas", points: 1 },
  { id: 33, text: "Tirarse del catamarán en marcha", prize: "3 Copas", points: 5 },
  { id: 34, text: "Tirarte en bomba en una piscina de beach club/discoteca", prize: "Ronda de cervezas", points: 2 },
  { id: 35, text: "Sacar un dospa con tu cuñao", prize: "2 Copas", points: 2 },
  { id: 36, text: "Coger 'prestadas' unas gafas", prize: "Ronda de cervezas", points: 2 },
  { id: 37, text: "RETO ESTRELLA: montarlo el sábado en un bus a tomar por culo", prize: "🌟 La leyenda del bus — ¡premio al gusto del grupo!", points: 8, star: true },
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
