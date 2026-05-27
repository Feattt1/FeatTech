/**
 * Genera el fixture completo de un torneo americano por PAREJAS (round-robin).
 * Cada pareja juega contra todas las demás exactamente una vez.
 *
 * @param {string[]} parejas - Array de nombres de parejas
 * @param {number} canchas   - Cantidad de canchas disponibles
 * @returns {{ ronda: number, partidos: { local: string, visitante: string, cancha: number }[] }[]}
 */
export function generateAmericano(parejas, canchas = 1) {
  const n = parejas.length;
  if (n < 2) return [];

  // Si hay número impar de parejas, agregamos un "BYE"
  const list = n % 2 === 0 ? [...parejas] : [...parejas, 'BYE'];
  const N = list.length; // siempre par

  const allMatches = []; // todos los partidos sin agrupar en rondas

  // Algoritmo de rotación circular
  const rotatingList = list.slice(1);
  const fixed = list[0];

  for (let r = 0; r < N - 1; r++) {
    const roundPairs = [];
    const circle = [fixed, ...rotatingList];
    for (let i = 0; i < N / 2; i++) {
      const local = circle[i];
      const visitante = circle[N - 1 - i];
      if (local !== 'BYE' && visitante !== 'BYE') {
        roundPairs.push({ local, visitante });
      }
    }
    allMatches.push(roundPairs);
    rotatingList.unshift(rotatingList.pop());
  }

  // Agrupar en rondas según la cantidad de canchas disponibles
  const rondas = [];
  let rondaNum = 1;

  for (const roundPairs of allMatches) {
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
 * Calcula la tabla de posiciones por PAREJAS.
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
  });

  return Object.values(stats)
    .map((s) => ({ ...s, diferencia: s.juegosF - s.juegosC }))
    .sort((a, b) => b.juegosF - a.juegosF || b.diferencia - a.diferencia || b.ganados - a.ganados);
}

/**
 * Genera el fixture completo de un torneo americano INDIVIDUAL.
 * Rotación inteligente: todos juegan con compañeros diferentes y contra oponentes diferentes.
 *
 * @param {string[]} jugadores - Array de nombres de jugadores
 * @param {number} canchas     - Cantidad de canchas disponibles
 * @param {number} totalRondas  - Total de rondas a jugar (por defecto N o N-1)
 * @returns {{ ronda: number, partidos: { local1: string, local2: string, visitante1: string, visitante2: string, cancha: number }[] }[]}
 */
export function generateAmericanoIndividual(jugadores, canchas = 1, totalRondas = 0) {
  const N = jugadores.length;
  if (N < 4) return [];

  // Cantidad de canchas máxima que podemos usar simultáneamente en cada ronda
  const canchasMaximas = Math.min(canchas, Math.floor(N / 4));
  const jugadoresPorRonda = canchasMaximas * 4;

  // Si no se especifica, por defecto hacemos N rondas para que todos roten bastante
  const rondasAClasificar = totalRondas > 0 ? totalRondas : N;

  const rondas = [];
  const partidosJugados = {};
  const historialCompaneros = {};
  const historialRivales = {};

  // Inicializar contadores
  jugadores.forEach((j) => {
    partidosJugados[j] = 0;
    historialCompaneros[j] = {};
    historialRivales[j] = {};
    jugadores.forEach((j2) => {
      if (j !== j2) {
        historialCompaneros[j][j2] = 0;
        historialRivales[j][j2] = 0;
      }
    });
  });

  // Auxiliar para obtener métricas históricas
  const companerosCount = (j1, j2) => historialCompaneros[j1]?.[j2] || 0;
  const rivalesCount = (j1, j2) => historialRivales[j1]?.[j2] || 0;

  for (let r = 1; r <= rondasAClasificar; r++) {
    // 1. Seleccionar los jugadores de esta ronda
    // Priorizamos a quienes han jugado MENOS partidos históricos
    const jugadoresOrdenados = [...jugadores].sort((a, b) => partidosJugados[a] - partidosJugados[b]);
    const activosDeRonda = jugadoresOrdenados.slice(0, jugadoresPorRonda);

    // 2. Mezclar aleatoriamente para evitar que siempre queden agrupados los mismos en canchas diferentes
    for (let i = activosDeRonda.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [activosDeRonda[i], activosDeRonda[j]] = [activosDeRonda[j], activosDeRonda[i]];
    }

    const partidosDeRonda = [];

    // 3. Agrupar de a 4 jugadores por cancha y buscar el mejor emparejamiento por costo
    for (let c = 0; c < canchasMaximas; c++) {
      const g = activosDeRonda.slice(c * 4, (c + 1) * 4); // 4 jugadores para esta cancha
      if (g.length < 4) break;

      const [p1, p2, p3, p4] = g;

      // Las 3 opciones posibles de emparejamiento
      const opciones = [
        {
          local1: p1, local2: p2, visitante1: p3, visitante2: p4,
          cost: companerosCount(p1, p2) + companerosCount(p3, p4) +
                rivalesCount(p1, p3) + rivalesCount(p1, p4) + rivalesCount(p2, p3) + rivalesCount(p2, p4)
        },
        {
          local1: p1, local2: p3, visitante1: p2, visitante2: p4,
          cost: companerosCount(p1, p3) + companerosCount(p2, p4) +
                rivalesCount(p1, p2) + rivalesCount(p1, p4) + rivalesCount(p3, p2) + rivalesCount(p3, p4)
        },
        {
          local1: p1, local2: p4, visitante1: p2, visitante2: p3,
          cost: companerosCount(p1, p4) + companerosCount(p2, p3) +
                rivalesCount(p1, p2) + rivalesCount(p1, p3) + rivalesCount(p4, p2) + rivalesCount(p4, p3)
        }
      ];

      // Elegir el emparejamiento de menor costo (menor repetición)
      opciones.sort((a, b) => a.cost - b.cost);
      const mejor = opciones[0];

      partidosDeRonda.push({
        cancha: c + 1,
        local1: mejor.local1,
        local2: mejor.local2,
        visitante1: mejor.visitante1,
        visitante2: mejor.visitante2
      });

      // 4. Actualizar historiales
      const { local1, local2, visitante1, visitante2 } = mejor;

      // Incrementar partidos jugados
      partidosJugados[local1]++;
      partidosJugados[local2]++;
      partidosJugados[visitante1]++;
      partidosJugados[visitante2]++;

      // Incrementar compañeros
      historialCompaneros[local1][local2]++;
      historialCompaneros[local2][local1]++;
      historialCompaneros[visitante1][visitante2]++;
      historialCompaneros[visitante2][visitante1]++;

      // Incrementar rivales
      const locales = [local1, local2];
      const visitantes = [visitante1, visitante2];
      locales.forEach((l) => {
        visitantes.forEach((v) => {
          historialRivales[l][v]++;
          historialRivales[v][l]++;
        });
      });
    }

    rondas.push({
      ronda: r,
      partidos: partidosDeRonda
    });
  }

  return rondas;
}

/**
 * Calcula la tabla de posiciones INDIVIDUAL.
 * Suma los games y partidos ganados por cada jugador en sus respectivos emparejamientos.
 *
 * @param {string[]} jugadores
 * @param {{ ronda: number, local1: string, local2: string, visitante1: string, visitante2: string, juegosLocal: number|'', juegosVisitante: number|'' }[]} resultados
 * @returns {{ jugador: string, jugados: number, ganados: number, perdidos: number, juegosF: number, juegosC: number, diferencia: number }[]}
 */
export function calcularPosicionesIndividual(jugadores, resultados) {
  const stats = {};
  jugadores.forEach((j) => {
    stats[j] = { jugador: j, jugados: 0, ganados: 0, perdidos: 0, juegosF: 0, juegosC: 0 };
  });

  resultados.forEach(({ local1, local2, visitante1, visitante2, juegosLocal, juegosVisitante }) => {
    if (juegosLocal === '' || juegosVisitante === '' || juegosLocal == null || juegosVisitante == null) return;
    const jL = Number(juegosLocal);
    const jV = Number(juegosVisitante);

    const integrantes = [local1, local2, visitante1, visitante2];
    integrantes.forEach((j) => {
      if (stats[j]) stats[j].jugados++;
    });

    // Sumar games a favor y en contra
    const locales = [local1, local2];
    const visitantes = [visitante1, visitante2];

    locales.forEach((l) => {
      if (stats[l]) {
        stats[l].juegosF += jL;
        stats[l].juegosC += jV;
        if (jL > jV) stats[l].ganados++;
        else if (jV > jL) stats[l].perdidos++;
      }
    });

    visitantes.forEach((v) => {
      if (stats[v]) {
        stats[v].juegosF += jV;
        stats[v].juegosC += jL;
        if (jV > jL) stats[v].ganados++;
        else if (jL > jV) stats[v].perdidos++;
      }
    });
  });

  return Object.values(stats)
    .map((s) => ({ ...s, diferencia: s.juegosF - s.juegosC }))
    .sort((a, b) => b.juegosF - a.juegosF || b.diferencia - a.diferencia || b.ganados - a.ganados);
}
