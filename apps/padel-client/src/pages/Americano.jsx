import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateAmericano,
  calcularPosiciones,
  generateAmericanoIndividual,
  calcularPosicionesIndividual
} from '../utils/americanoAlgorithm';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'americano_torneo_v2';
const MEDALS = ['🥇', '🥈', '🥉'];

function exportToExcel(nombre, posiciones, rondas, resultados, modo) {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Posiciones
  let posData = [];
  if (modo === 'individual') {
    posData = posiciones.map((p, i) => ({
      Pos: i + 1,
      Jugador: p.jugador,
      PJ: p.jugados,
      PG: p.ganados,
      PP: p.perdidos,
      'JF (Juegos a Favor)': p.juegosF,
      'JC (Juegos en Contra)': p.juegosC,
      'Dif.': p.diferencia,
    }));
  } else {
    posData = posiciones.map((p, i) => ({
      Pos: i + 1,
      Pareja: p.pareja,
      PJ: p.jugados,
      PG: p.ganados,
      PP: p.perdidos,
      'JF (Juegos a Favor)': p.juegosF,
      'JC (Juegos en Contra)': p.juegosC,
      'Dif.': p.diferencia,
    }));
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(posData), 'Posiciones');

  // Hoja 2: Resultados
  let resData = [];
  if (modo === 'individual') {
    resData = rondas.flatMap((r) =>
      r.partidos.map((p) => {
        const key = `${r.ronda}-${p.local1}-${p.local2}-${p.visitante1}-${p.visitante2}`;
        const res = resultados[key] || {};
        return {
          Ronda: r.ronda,
          Cancha: p.cancha,
          'Pareja Local': `${p.local1} / ${p.local2}`,
          'Pareja Visitante': `${p.visitante1} / ${p.visitante2}`,
          'Juegos Local': res.juegosLocal ?? '',
          'Juegos Visitante': res.juegosVisitante ?? '',
        };
      })
    );
  } else {
    resData = rondas.flatMap((r) =>
      r.partidos.map((p) => {
        const key = `${r.ronda}-${p.local}-${p.visitante}`;
        const res = resultados[key] || {};
        return {
          Ronda: r.ronda,
          Cancha: p.cancha,
          Local: p.local,
          Visitante: p.visitante,
          'Juegos Local': res.juegosLocal ?? '',
          'Juegos Visitante': res.juegosVisitante ?? '',
        };
      })
    );
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resData), 'Resultados');

  XLSX.writeFile(wb, `${nombre || 'Americano'}.xlsx`);
}

export default function Americano() {
  const [step, setStep] = useState('setup'); // 'setup' | 'torneo'
  const [modo, setModo] = useState('parejas'); // 'parejas' | 'individual'
  const [nombre, setNombre] = useState('');
  const [cantParejas, setCantParejas] = useState(4); // representa parejas o jugadores según modo
  const [canchas, setCanchas] = useState(2);
  const [parejas, setParejas] = useState(['', '', '', '']); // nombres (parejas o jugadores individuales)
  const [rondas, setRondas] = useState([]);
  const [resultados, setResultados] = useState({});
  const [posiciones, setPosiciones] = useState([]);
  const [rondaVista, setRondaVista] = useState(1);

  // Persistencia en localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.step === 'torneo') {
        setStep(saved.step);
        setModo(saved.modo || 'parejas');
        setNombre(saved.nombre || '');
        setCantParejas(saved.cantParejas || 4);
        setCanchas(saved.canchas || 2);
        setParejas(saved.parejas || []);
        setRondas(saved.rondas || []);
        setResultados(saved.resultados || {});
        setPosiciones(saved.posiciones || []);
        setRondaVista(saved.rondaVista || 1);
      }
    } catch {}
  }, []);

  const persist = useCallback((state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, []);

  // Recalcular posiciones cuando cambian resultados
  useEffect(() => {
    if (step !== 'torneo' || parejas.length === 0) return;

    if (modo === 'individual') {
      const allPartidos = rondas.flatMap((r) =>
        r.partidos.map((p) => {
          const key = `${r.ronda}-${p.local1}-${p.local2}-${p.visitante1}-${p.visitante2}`;
          const res = resultados[key] || {};
          return {
            local1: p.local1,
            local2: p.local2,
            visitante1: p.visitante1,
            visitante2: p.visitante2,
            juegosLocal: res.juegosLocal ?? '',
            juegosVisitante: res.juegosVisitante ?? ''
          };
        })
      );
      const pos = calcularPosicionesIndividual(parejas.filter(Boolean), allPartidos);
      setPosiciones(pos);
    } else {
      const allPartidos = rondas.flatMap((r) =>
        r.partidos.map((p) => {
          const key = `${r.ronda}-${p.local}-${p.visitante}`;
          const res = resultados[key] || {};
          return {
            local: p.local,
            visitante: p.visitante,
            juegosLocal: res.juegosLocal ?? '',
            juegosVisitante: res.juegosVisitante ?? ''
          };
        })
      );
      const pos = calcularPosiciones(parejas.filter(Boolean), allPartidos);
      setPosiciones(pos);
    }
  }, [resultados, rondas, parejas, step, modo]);

  const handleModoChange = (nuevoModo) => {
    setModo(nuevoModo);
    const minVal = nuevoModo === 'individual' ? 4 : 3;
    const n = Math.max(minVal, cantParejas);
    setCantParejas(n);
    setParejas((prev) => {
      const next = [...prev];
      while (next.length < n) next.push('');
      return next.slice(0, n);
    });
  };

  const handleCantChange = (val) => {
    const minVal = modo === 'individual' ? 4 : 3;
    const n = Math.max(minVal, Math.min(24, Number(val)));
    setCantParejas(n);
    setParejas((prev) => {
      const next = [...prev];
      while (next.length < n) next.push('');
      return next.slice(0, n);
    });
  };

  const handleGenerar = () => {
    const validas = parejas.map((p, i) => p.trim() || (modo === 'individual' ? `Jugador ${i + 1}` : `Pareja ${i + 1}`));
    
    let fixture = [];
    if (modo === 'individual') {
      fixture = generateAmericanoIndividual(validas, canchas);
    } else {
      fixture = generateAmericano(validas, canchas);
    }

    const newState = {
      step: 'torneo',
      modo,
      nombre,
      cantParejas,
      canchas,
      parejas: validas,
      rondas: fixture,
      resultados: {},
      posiciones: [],
      rondaVista: 1,
    };
    
    setStep('torneo');
    setParejas(validas);
    setRondas(fixture);
    setResultados({});
    setRondaVista(1);
    persist(newState);
  };

  const handleResultado = (key, field, value) => {
    setResultados((prev) => {
      const next = {
        ...prev,
        [key]: { ...(prev[key] || {}), [field]: value === '' ? '' : Number(value) }
      };
      persist({
        step,
        modo,
        nombre,
        cantParejas,
        canchas,
        parejas,
        rondas,
        resultados: next,
        posiciones,
        rondaVista
      });
      return next;
    });
  };

  const handleReset = () => {
    if (!confirm('¿Reiniciar el torneo? Se perderán todos los resultados y emparejamientos.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setStep('setup');
    setNombre('');
    setCantParejas(modo === 'individual' ? 4 : 3);
    setParejas(modo === 'individual' ? ['', '', '', ''] : ['', '', '']);
    setRondas([]);
    setResultados({});
    setPosiciones([]);
  };

  const partidosCompletos = rondas.flatMap((r) => r.partidos).length;
  const resultadosIngresados = Object.keys(resultados).filter(
    (key) => {
      const r = resultados[key] || {};
      return r.juegosLocal !== '' && r.juegosLocal != null && r.juegosVisitante !== '' && r.juegosVisitante != null;
    }
  ).length;

  // ── SETUP ────────────────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="max-w-xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🎾</div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
              Torneo Americano
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
              Organiza partidos rápidos en minutos. Sin registros, sin cuentas — gratis y al instante.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
            
            {/* Modo de Torneo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Modalidad del torneo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleModoChange('parejas')}
                  className={`py-3 rounded-xl border text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${
                    modo === 'parejas'
                      ? 'border-padel bg-padel/10 text-padel-dark dark:text-padel'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">👥</span>
                  <span>Parejas Fijas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModoChange('individual')}
                  className={`py-3 rounded-xl border text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${
                    modo === 'individual'
                      ? 'border-padel bg-padel/10 text-padel-dark dark:text-padel'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">👤</span>
                  <span>Individuales</span>
                </button>
              </div>
            </div>

            {/* Nombre del torneo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre del torneo <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={modo === 'individual' ? "Ej: Americano Individual Single" : "Ej: Americano Parejas Sábado"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-padel/50 text-sm"
              />
            </div>

            {/* Cantidad + canchas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {modo === 'individual' ? 'Nº de jugadores' : 'Nº de parejas'}
                </label>
                <input
                  type="number"
                  min={modo === 'individual' ? 4 : 3}
                  max={24}
                  value={cantParejas}
                  onChange={(e) => handleCantChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-bold focus:outline-none focus:ring-2 focus:ring-padel/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nº de canchas
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={canchas}
                  onChange={(e) => setCanchas(Math.max(1, Math.min(8, Number(e.target.value))))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center font-bold focus:outline-none focus:ring-2 focus:ring-padel/50 text-sm"
                />
              </div>
            </div>

            {/* Lista de nombres */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {modo === 'individual' ? 'Nombres de los jugadores' : 'Nombres de las parejas'}
              </label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {parejas.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-6 text-right shrink-0">{i + 1}</span>
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => setParejas((prev) => {
                        const n = [...prev];
                        n[i] = e.target.value;
                        return n;
                      })}
                      placeholder={modo === 'individual' ? `Jugador ${i + 1}` : `Pareja ${i + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-padel/40"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Info panel */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 flex gap-2 items-start">
              <span className="text-base">ℹ️</span>
              {modo === 'individual' ? (
                <span>
                  Con <strong className="text-slate-700 dark:text-slate-300">{cantParejas} jugadores</strong> se generará un fixture individual inteligente en <strong className="text-slate-700 dark:text-slate-300">{cantParejas} rondas</strong>. Los jugadores rotarán dinámicamente compañeros y rivales en cada partido.
                </span>
              ) : (
                <span>
                  Con <strong className="text-slate-700 dark:text-slate-300">{cantParejas} parejas</strong> se generarán{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {cantParejas % 2 === 0 ? cantParejas - 1 : cantParejas} rondas
                  </strong>{' '}
                  con{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {Math.floor(cantParejas / 2)} partido{Math.floor(cantParejas / 2) !== 1 ? 's' : ''}
                  </strong>{' '}
                  por ronda. Cada pareja juega contra todas las demás.
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerar}
              className="w-full py-3.5 rounded-xl bg-padel hover:bg-padel-light text-slate-900 font-black text-base shadow-neon hover:-translate-y-0.5 transition-all"
            >
              ⚡ Generar Torneo Americano
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── TORNEO ───────────────────────────────────────────────────────────────────
  const rondaActual = rondas.find((r) => r.ronda === rondaVista) || rondas[0];

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header del torneo */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            🎾 {nombre || 'Torneo Americano'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Modalidad: <span className="font-semibold text-padel-dark dark:text-padel">{modo === 'individual' ? 'Individual' : 'Parejas Fijas'}</span> · {parejas.length} {modo === 'individual' ? 'jugadores' : 'parejas'} · {rondas.length} rondas
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportToExcel(nombre, posiciones, rondas, resultados, modo)}
            className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition flex items-center gap-1.5"
          >
            📥 Exportar Excel
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 font-medium text-sm transition"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Rondas + Partidos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selector de ronda */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {rondas.map((r) => {
              const completados = r.partidos.filter((p) => {
                const key = modo === 'individual'
                  ? `${r.ronda}-${p.local1}-${p.local2}-${p.visitante1}-${p.visitante2}`
                  : `${r.ronda}-${p.local}-${p.visitante}`;
                const res = resultados[key] || {};
                return res.juegosLocal !== '' && res.juegosLocal != null;
              }).length;
              const total = r.partidos.length;
              return (
                <button
                  key={r.ronda}
                  onClick={() => setRondaVista(r.ronda)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                    rondaVista === r.ronda
                      ? 'bg-padel text-slate-900 shadow-neon'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-padel/50'
                  }`}
                >
                  Ronda {r.ronda}
                  {completados === total && total > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Partidos de la ronda seleccionada */}
          <AnimatePresence mode="wait">
            <motion.div
              key={rondaVista}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {rondaActual?.partidos.map((partido, idx) => {
                const key = modo === 'individual'
                  ? `${rondaActual.ronda}-${partido.local1}-${partido.local2}-${partido.visitante1}-${partido.visitante2}`
                  : `${rondaActual.ronda}-${partido.local}-${partido.visitante}`;
                const res = resultados[key] || {};
                const jL = Number(res.juegosLocal);
                const jV = Number(res.juegosVisitante);
                const hayResultado = res.juegosLocal !== '' && res.juegosLocal != null && res.juegosVisitante !== '' && res.juegosVisitante != null;
                const ganadorLocal = hayResultado && jL > jV;
                const ganadorVisitante = hayResultado && jV > jL;

                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Cancha {partido.cancha}
                      </span>
                      {hayResultado && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          ✓ Resultado ingresado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      
                      {/* Pareja / Jugadores locales */}
                      <div className={`flex-1 text-sm font-semibold truncate ${ganadorLocal ? 'text-padel-dark dark:text-padel' : 'text-slate-700 dark:text-slate-200'}`}>
                        {modo === 'individual' ? (
                          <div className="flex flex-col">
                            <span>{partido.local1}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">Con: {partido.local2}</span>
                          </div>
                        ) : (
                          <span>{partido.local}</span>
                        )}
                      </div>

                      {/* Inputs de resultado */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number" min={0} max={99}
                          value={res.juegosLocal ?? ''}
                          onChange={(e) => handleResultado(key, 'juegosLocal', e.target.value)}
                          className="w-12 text-center px-1 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-black text-base focus:outline-none focus:ring-2 focus:ring-padel/50"
                          placeholder="0"
                        />
                        <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">—</span>
                        <input
                          type="number" min={0} max={99}
                          value={res.juegosVisitante ?? ''}
                          onChange={(e) => handleResultado(key, 'juegosVisitante', e.target.value)}
                          className="w-12 text-center px-1 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-black text-base focus:outline-none focus:ring-2 focus:ring-padel/50"
                          placeholder="0"
                        />
                      </div>

                      {/* Pareja / Jugadores visitantes */}
                      <div className={`flex-1 text-sm font-semibold truncate text-right ${ganadorVisitante ? 'text-padel-dark dark:text-padel' : 'text-slate-700 dark:text-slate-200'}`}>
                        {modo === 'individual' ? (
                          <div className="flex flex-col text-right">
                            <span>{partido.visitante1}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">Con: {partido.visitante2}</span>
                          </div>
                        ) : (
                          <span>{partido.visitante}</span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
              {rondaActual?.partidos.length === 0 && (
                <div className="px-4 py-8 bg-slate-50 dark:bg-slate-900/20 text-center rounded-2xl text-sm text-slate-400 dark:text-slate-500">
                  No hay partidos programados para esta ronda.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Columna derecha: Ranking en vivo */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Posiciones en vivo
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            {/* Encabezado tabla */}
            <div className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem] gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>#</span>
              <span>{modo === 'individual' ? 'Jugador' : 'Pareja'}</span>
              <span className="text-center">JF</span>
              <span className="text-center">JC</span>
              <span className="text-center">+/-</span>
            </div>

            {posiciones.map((pos, idx) => (
              <div
                key={modo === 'individual' ? pos.jugador : pos.pareja}
                className={`grid grid-cols-[2rem_1fr_2rem_2rem_2rem] gap-1 px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 items-center ${
                  idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' :
                  idx === 1 ? 'bg-slate-50/50 dark:bg-slate-900/20' :
                  idx === 2 ? 'bg-orange-50/40 dark:bg-orange-900/10' : ''
                }`}
              >
                <span className="text-sm font-black">
                  {idx < 3 ? MEDALS[idx] : <span className="text-slate-400 text-xs font-normal">{idx + 1}</span>}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {modo === 'individual' ? pos.jugador : pos.pareja}
                </span>
                <span className="text-center text-xs font-bold text-blue-600 dark:text-blue-400">{pos.juegosF}</span>
                <span className="text-center text-xs text-slate-500 dark:text-slate-400">{pos.juegosC}</span>
                <span className={`text-center text-xs font-semibold ${pos.diferencia >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {pos.diferencia > 0 ? '+' : ''}{pos.diferencia}
                </span>
              </div>
            ))}

            {posiciones.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Las posiciones se actualizan al ingresar resultados
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 space-y-0.5 px-1">
            <p><strong className="text-slate-600 dark:text-slate-400 font-bold">JF</strong> = Juegos a favor</p>
            <p><strong className="text-slate-600 dark:text-slate-400 font-bold">JC</strong> = Juegos en contra</p>
            <p><strong className="text-slate-600 dark:text-slate-400 font-bold">+/-</strong> = Diferencia</p>
          </div>

          <button
            onClick={() => exportToExcel(nombre, posiciones, rondas, resultados, modo)}
            className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            📥 Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
