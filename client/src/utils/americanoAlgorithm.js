/**
 * Genera el fixture completo de un torneo americano (round-robin).
 * Cada pareja juega contra todas las demás exactamente una vez.
 *
 * @param {string[]} parejas - Array de nombres de parejas
 * @param {number} canchas   - Cantidad de canchas disponibles (para agrupar partidos por ronda)
 * @returns {{ ronda: number, partidos: { local: string, visitante: string, cancha: number }[] }[]}
 */
export function generateAmericano(parejas, canchas = 1) {
  const n = parejas.length;
  if (n < 2) return [];

  // Si hay número impar de parejas, agregamos un "BYE"
  const list = n % 2 === 0 ? [...parejas] : [...parejas, 'BYE'];
  const N = list.length; // siempre par

  const allMatches = []; // todos los partidos sin agrupar en rondas

  // Algoritmo de rotación circular (round-robin estándar)
  // En cada ronda, el primer elemento es fijo y los demás rotan
  const rotatingList = list.slice(1); // todos excepto el primero
  const fixed = list[0];

  for (let r = 0; r < N - 1; r++) {
    const roundPairs = [];
    // Primer partido de la ronda: fixed vs rotatingList[0]
    const circle = [fixed, ...rotatingList];
    for (let i = 0; i < N / 2; i++) {
      const local = circle[i];
      const visitante = circle[N - 1 - i];
      // Omitir partidos con BYE
      if (local !== 'BYE' && visitante !== 'BYE') {
        roundPairs.push({ local, visitante });
      }
    }
    allMatches.push(roundPairs);
    // Rotar: mover el último al principio del array rotante
    rotatingList.unshift(rotatingList.pop());
  }

  // Agrupar en rondas según la cantidad de canchas disponibles
  // Cada ronda puede tener hasta `canchas` partidos simultáneos
  const rondas = [];
  let rondaNum = 1;
  let buffer = [];

  for (const roundPairs of allMatches) {
    // Cada "vuelta" del round-robin es ya una ronda de N/2 partidos
    // Los distribuimos entre canchas
    let canchaIdx = 1;
    const partidosConCancha = roundPairs.map((p) => ({
      ...p,
      cancha: canchaIdx++ > canchas ? (canchaIdx = 2, 1) : canchaIdx - 1,
    }));
    rondas.push({ ronda: rondaNum++, partidos: partidosConCancha });
  }

  return rondas;
}

/**
 * Calcula la tabla de posiciones a partir de los resultados ingresados.
 *
 * @param {string[]} parejas
 * @param {{ local: string, visitante: string, juegosLocal: number|'', juegosVisitante: number|'' }[]} resultados
 * @returns {{ pareja: string, jugados: number, ganados: number, perdidos: number, juegosF: number, juegosC: number, diferencia: number }[]}
 */
export function calcularPosiciones(parejas, resultados) {
  const stats = {};
  parejas.forEach((p) => {
    stats[p] = { pareja: p, jugados: 0, ganados: 0, perdidos: 0, juegosF: 0, juegosC: 0 };
  });

  resultados.forEach(({ local, visitante, juegosLocal, juegosVisitante }) => {
    if (juegosLocal === '' || juegosVisitante === '' || juegosLocal == null || juegosVisitante == null) return;
    const jL = Number(juegosLocal);
    const jV = Number(juegosVisitante);

    if (!stats[local] || !stats[visitante]) return;

    stats[local].jugados++;
    stats[visitante].jugados++;
    stats[local].juegosF += jL;
    stats[local].juegosC += jV;
    stats[visitante].juegosF += jV;
    stats[visitante].juegosC += jL;

    if (jL > jV) {
      stats[local].ganados++;
      stats[visitante].perdidos++;
    } else if (jV > jL) {
      stats[visitante].ganados++;
      stats[local].perdidos++;
    }
    // Empate: ninguno gana (raro en pádel pero posible)
  });

  return Object.values(stats)
    .map((s) => ({ ...s, diferencia: s.juegosF - s.juegosC }))
    .sort((a, b) => b.juegosF - a.juegosF || b.diferencia - a.diferencia || b.ganados - a.ganados);
}
