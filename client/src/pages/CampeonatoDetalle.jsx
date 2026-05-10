import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { campeonatosApi, gruposApi, partidosApi, inscripcionesApi, parejasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useClub } from '../context/ClubContext';
import { motion, AnimatePresence } from 'framer-motion';

import ExportExcelButton from '../components/ExportExcelButton';

const MODALIDAD_LABEL = { MASCULINO: 'Masculino', FEMENINO: 'Femenino', MIXTO: 'Mixto' };
const FASE_LABEL = { 
  GRUPOS: 'Grupos', 
  TREINTAIDOSAVOS: '32avos de final', 
  DIECISEISAVOS: '16avos de final', 
  OCTAVOS: 'Octavos de final', 
  CUARTOS: 'Cuartos de final', 
  SEMIS: 'Semifinales', 
  FINAL: 'Final' 
};
const FASE_ORDER = { 
  GRUPOS: 0, 
  TREINTAIDOSAVOS: 1, 
  DIECISEISAVOS: 2, 
  OCTAVOS: 3, 
  CUARTOS: 4, 
  SEMIS: 5, 
  FINAL: 6 
};

const ESTADO_CONFIG = {
  INSCRIPCIONES: { label: 'Inscripciones abiertas', color: 'bg-blue-500/20 text-blue-200 border-blue-400/30' },
  EN_CURSO:      { label: 'En curso',                color: 'bg-green-500/20 text-green-200 border-green-400/30' },
  FINALIZADO:    { label: 'Finalizado',              color: 'bg-slate-500/20 text-slate-300 border-slate-400/30' },
};

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateShort(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function setsLabel(partido) {
  if (partido.sets && partido.sets.length > 0)
    return partido.sets.map((s) => `${s.gamesLocal}/${s.gamesVisitante}`).join(' — ');
  const sL = partido.setsLocal ?? partido.puntosLocal;
  const sV = partido.setsVisitante ?? partido.puntosVisitante;
  if (sL == null) return null;
  return `${sL} — ${sV}`;
}

function parejaLabel(p) {
  if (!p) return 'TBD';
  return `${p.jugador1?.usuario?.nombre || '-'} / ${p.jugador2?.usuario?.nombre || '-'}`;
}

function categoriaLabel(cat) {
  return cat.nombre || `${cat.categoria}ta ${MODALIDAD_LABEL[cat.modalidad] ?? cat.modalidad}`;
}

// ── Partido card (bracket / grupos) ────────────────────────────────────────────
function PartidoCard({ p }) {
  const res = p.estado === 'FINALIZADO' ? setsLabel(p) : null;
  const fecha = formatDate(p.fechaHora);
  let sL = 0, sV = 0;
  if (res && p.sets?.length > 0) {
    for (const s of p.sets) { if (s.gamesLocal > s.gamesVisitante) sL++; else if (s.gamesVisitante > s.gamesLocal) sV++; }
  } else { sL = p.setsLocal ?? 0; sV = p.setsVisitante ?? 0; }

  return (
    <div className={`card p-5 ${
      p.estado === 'FINALIZADO' ? 'border-slate-100 dark:border-slate-700 dark:bg-slate-800' : 'border-padel bg-padel/5 shadow-neon dark:bg-padel/10 dark:border-padel/60'
    }`}>
      {fecha && (
        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          {fecha}{p.pista ? ` · ${p.pista}` : ''}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-medium text-sm flex-1 min-w-[120px] ${res && sL > sV ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
          {parejaLabel(p.parejaLocal)}
        </span>
        {res ? (
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded shrink-0">{res}</span>
        ) : (
          <span className="text-slate-300 dark:text-slate-600 text-sm shrink-0 font-light">vs</span>
        )}
        <span className={`font-medium text-sm flex-1 min-w-[120px] text-right ${res && sV > sL ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
          {parejaLabel(p.parejaVisitante)}
        </span>
      </div>
    </div>
  );
}

// ── Vista de partidos de grupos + eliminatorias ────────────────────────────────
function BracketCategoria({ partidos, grupos }) {
  const fases = [...new Set(partidos.map((p) => p.fase))].sort((a, b) => FASE_ORDER[a] - FASE_ORDER[b]);
  if (fases.length === 0) return (
    <div className="py-16 text-center">
      <p className="text-slate-400">Los partidos aparecerán aquí una vez generados.</p>
    </div>
  );
  return (
    <div className="space-y-8">
      {fases.map((fase) => {
        const pp = partidos.filter((p) => p.fase === fase);
        return (
          <div key={fase}>
            <h3 className="text-base font-semibold mb-3 text-slate-600 dark:text-slate-400 uppercase tracking-wide text-xs">
              {FASE_LABEL[fase] ?? fase}
            </h3>
            {fase === 'GRUPOS' ? (
              <div className="space-y-6">
                {grupos.map((g) => {
                  const gp = pp.filter((p) => p.grupoId === g.id);
                  if (gp.length === 0) return null;
                  return (
                    <div key={g.id}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-1">{g.nombre}</p>
                      <div className="space-y-2">{gp.map((p) => <PartidoCard key={p.id} p={p} />)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">{pp.map((p) => <PartidoCard key={p.id} p={p} />)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Clasificación por grupo ────────────────────────────────────────────────────
function ClasificacionCategoria({ grupos }) {
  if (grupos.length === 0) return <p className="text-slate-400 py-8 text-center">No hay clasificación disponible aún.</p>;
  return (
    <div className="space-y-6">
      {grupos.map((g) => (
        <div key={g.id} className="card overflow-hidden">
          <div className="flex justify-between items-center bg-slate-900 border-b border-slate-800 px-5 py-3">
            <h3 className="font-bold text-white text-sm">{g.nombre}</h3>
            <ExportExcelButton 
              fileName={`Clasificacion_${g.nombre}.xlsx`}
              sheetName={g.nombre}
              data={(g.clasificaciones ?? [])
                  .sort((a, b) => b.puntos - a.puntos || b.setsGanados - a.setsGanados || b.gamesGanados - a.gamesGanados)
                  .map((cl, i) => ({
                    Posición: i + 1,
                    Pareja: `${cl.pareja?.jugador1?.usuario?.nombre} / ${cl.pareja?.jugador2?.usuario?.nombre}`,
                    Puntos: cl.puntos,
                    'Partidos Jugados': cl.partidosJugados,
                    'Partidos Ganados': cl.partidosGanados,
                    'Sets a favor': cl.setsGanados,
                    'Sets en contra': cl.setsPerdidos,
                    'Games a favor': cl.gamesGanados,
                    'Games en contra': cl.gamesPerdidos
                  }))}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pareja</th>
                  <th className="text-center">Pts</th>
                  <th className="text-center">PJ</th>
                  <th className="text-center">PG</th>
                  <th className="text-center">S+</th>
                  <th className="text-center">S-</th>
                  <th className="text-center hidden sm:table-cell">G+</th>
                  <th className="text-center hidden sm:table-cell">G-</th>
                </tr>
              </thead>
              <tbody>
                {(g.clasificaciones ?? [])
                  .sort((a, b) => b.puntos - a.puntos || b.setsGanados - a.setsGanados || b.gamesGanados - a.gamesGanados)
                  .map((cl, idx) => (
                    <tr key={cl.id} className={`${idx < 2 ? 'bg-padel/10' : ''}`}>
                      <td className="font-bold text-slate-400 text-xs">{idx + 1}</td>
                      <td className="font-bold text-slate-800 dark:text-slate-200">
                        {cl.pareja?.jugador1?.usuario?.nombre} / {cl.pareja?.jugador2?.usuario?.nombre}
                        {idx < 2 && <span className="ml-2 text-[10px] bg-padel text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Clasifica</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">{cl.puntos}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.partidosJugados}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.partidosGanados}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.setsGanados}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.setsPerdidos}</td>
                      <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{cl.gamesGanados}</td>
                      <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{cl.gamesPerdidos}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Ranking global de categoría (todas las parejas ordenadas) ──────────────────
function RankingCategoria({ grupos }) {
  const todas = grupos.flatMap((g) =>
    (g.clasificaciones ?? []).map((cl) => ({ ...cl, grupoNombre: g.nombre }))
  );
  if (todas.length === 0)
    return <p className="text-slate-400 py-8 text-center">No hay datos de ranking aún.</p>;

  const sorted = [...todas].sort(
    (a, b) => b.puntos - a.puntos || b.setsGanados - a.setsGanados || b.gamesGanados - a.gamesGanados
  );

  const medalas = [
    <span className="text-yellow-600 dark:text-yellow-400 font-black dark:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">1º</span>,
    <span className="text-slate-500 dark:text-slate-300 font-black dark:drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]">2º</span>,
    <span className="text-orange-600 dark:text-orange-400 font-black dark:drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]">3º</span>
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 dark:text-white">Ranking Global</h4>
        <ExportExcelButton 
          fileName="Ranking_Torneo.xlsx"
          sheetName="Ranking"
          data={sorted.map((cl, i) => ({
            Posición: i + 1,
            Pareja: `${cl.pareja?.jugador1?.usuario?.nombre} / ${cl.pareja?.jugador2?.usuario?.nombre}`,
            Grupo: cl.grupoNombre,
            Puntos: cl.puntos,
            'Partidos Jugados': cl.partidosJugados,
            'Partidos Ganados': cl.partidosGanados,
            'Sets a favor': cl.setsGanados,
            'Sets en contra': cl.setsPerdidos,
            'Games a favor': cl.gamesGanados,
            'Games en contra': cl.gamesPerdidos
          }))}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Pareja</th>
              <th className="px-4 py-3 hidden sm:table-cell">Grupo</th>
              <th className="px-4 py-3 text-center">Pts</th>
              <th className="px-4 py-3 text-center">PJ</th>
              <th className="px-4 py-3 text-center">PG</th>
              <th className="px-4 py-3 text-center">S+</th>
              <th className="px-4 py-3 text-center">S-</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">G+</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">G-</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((cl, idx) => (
              <tr key={cl.id || idx} className={`border-t border-slate-100 dark:border-slate-700 transition-colors ${
                idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : idx === 1 ? 'bg-slate-50 dark:bg-slate-900 dark:bg-slate-800/50' : idx === 2 ? 'bg-orange-50/40 dark:bg-orange-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}>
                <td className="px-4 py-3 text-center font-bold text-lg leading-none">
                  {idx < 3 ? medalas[idx] : <span className="text-slate-400 text-sm font-normal">{idx + 1}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cl.pareja?.jugador1?.usuario?.nombre} / {cl.pareja?.jugador2?.usuario?.nombre}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{cl.grupoNombre}</td>
                <td className="px-4 py-3 text-center font-bold text-blue-600 text-base">{cl.puntos}</td>
                <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.partidosJugados}</td>
                <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.partidosGanados}</td>
                <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.setsGanados}</td>
                <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{cl.setsPerdidos}</td>
                <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{cl.gamesGanados}</td>
                <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{cl.gamesPerdidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Bracket visual de eliminatorias ───────────────────────────────────────────
function getWinner(partido) {
  if (partido.estado !== 'FINALIZADO') return null;
  let sL = 0, sV = 0;
  if (partido.sets?.length > 0) {
    for (const s of partido.sets) { if (s.gamesLocal > s.gamesVisitante) sL++; else if (s.gamesVisitante > s.gamesLocal) sV++; }
  } else { sL = partido.setsLocal ?? 0; sV = partido.setsVisitante ?? 0; }
  if (sL > sV) return 'local';
  if (sV > sL) return 'visitante';
  return null;
}

function BracketMatchCard({ partido }) {
  const winner = getWinner(partido);
  const renderRow = (pareja, side) => {
    const isWin = winner === side;
    const scores = partido.sets?.length > 0
      ? partido.sets.map((s) => (side === 'local' ? s.gamesLocal : s.gamesVisitante))
      : [];
    // bg-lime-100 es seguro para html2canvas en lugar de bg-padel/15 que usa rgb(var)
    return (
      <div className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${isWin ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-white dark:bg-slate-800'}`}>
        <span className={`text-xs inline-block overflow-hidden ${isWin ? 'text-slate-900 dark:text-slate-100 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'}`} style={{ width: 138, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {parejaLabel(pareja)}
        </span>
        <div className="flex gap-1.5 shrink-0 ml-auto">
          {scores.map((s, i) => (
            <span key={i} className={`text-xs w-4 text-center ${isWin ? 'text-slate-900 dark:text-slate-100 dark:text-white font-black' : 'text-slate-400 dark:text-slate-500 font-semibold'}`}>{s}</span>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:border-padel hover:shadow-glass transition-all" style={{ width: 216 }}>
      {renderRow(partido.parejaLocal, 'local')}
      <div className="h-px bg-slate-100 dark:bg-slate-800 dark:bg-slate-700" />
      {renderRow(partido.parejaVisitante, 'visitante')}
    </div>
  );
}

function BracketVisual({ partidos }) {
  const fasesEliminatorias = ['TREINTAIDOSAVOS', 'DIECISEISAVOS', 'OCTAVOS', 'CUARTOS', 'SEMIS', 'FINAL'];
  const eliPartidos = partidos.filter((p) => fasesEliminatorias.includes(p.fase));
  if (eliPartidos.length === 0) return (
    <div className="py-12 text-center card bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-800/50 border-dashed border-2 border-slate-200 dark:border-slate-700">
      <p className="text-slate-500 dark:text-slate-400 font-medium">El bracket se generará cuando finalicen los grupos.</p>
    </div>
  );

  const byFase = (fase) => eliPartidos.filter((p) => p.fase === fase).sort((a, b) => (a.ordenRonda || 0) - (b.ordenRonda || 0));
  const rounds = [];
  fasesEliminatorias.forEach((faseKey) => {
    const matches = byFase(faseKey);
    if (matches.length > 0) {
      rounds.push({ label: FASE_LABEL[faseKey], matches });
    }
  });
  if (!rounds.length) return null;

  const CARD_W = 216, CARD_H = 65, SIB_GAP = 16, COL_GAP = 44, COL_W = CARD_W + COL_GAP, LABEL_H = 32, PAD = 24;
  const yPos = [];
  yPos[0] = rounds[0].matches.map((_, i) => i * (CARD_H + SIB_GAP));
  for (let r = 1; r < rounds.length; r++)
    yPos[r] = rounds[r].matches.map((_, i) => { const y1 = yPos[r-1][i*2]??0, y2 = yPos[r-1][i*2+1]??y1; return (y1+y2)/2; });

  const paths = [];
  for (let r = 0; r < rounds.length - 1; r++)
    for (let i = 0; i < rounds[r+1].matches.length; i++) {
      const y1 = yPos[r][i*2], y2 = yPos[r][i*2+1];
      if (y1==null||y2==null) continue;
      const xRight = r*COL_W+CARD_W, midX = xRight+COL_GAP/2, xNext = (r+1)*COL_W;
      const cy1 = y1+CARD_H/2, cy2 = y2+CARD_H/2, midY = (cy1+cy2)/2;
      paths.push(`M ${xRight} ${cy1} H ${midX} V ${cy2}`);
      paths.push(`M ${xRight} ${cy2} H ${midX}`);
      paths.push(`M ${midX} ${midY} H ${xNext}`);
    }

  const maxY = Math.max(...yPos.flat()) + CARD_H;
  const totalW = rounds.length * COL_W - COL_GAP;

  return (
    <div className="overflow-x-auto pb-4 scrollbar-none">
      <div className="inline-block relative card bg-slate-50 dark:bg-slate-900/30 p-6" style={{ width: totalW+2*PAD, height: maxY+LABEL_H+2*PAD, minWidth:'100%' }}>
        {rounds.map((round, r) => (
          <div key={r} className="absolute text-xs text-slate-400 font-bold uppercase tracking-widest text-center"
            style={{ left: r*COL_W+PAD, top: PAD, width: CARD_W }}>{round.label}</div>
        ))}
        <svg className="absolute pointer-events-none" style={{ left: PAD, top: PAD+LABEL_H, width: totalW, height: maxY }}>
          {paths.map((d, i) => <path key={i} d={d} stroke="#cbd5e1" strokeWidth="2" fill="none" strokeLinecap="round" />)}
        </svg>
        {rounds.map((round, r) =>
          round.matches.map((match, i) => (
            <div key={match.id} className="absolute" style={{ left: r*COL_W+PAD, top: yPos[r][i]+PAD+LABEL_H, width: CARD_W }}>
              <BracketMatchCard partido={match} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function CampeonatoDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const { club } = useClub();
  const [campeonato, setCampeonato] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bracket');
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Admin: selector de pareja existente
  const [parejaSeleccionada, setParejaSeleccionada] = useState('');
  const [categoriaInscripcion, setCategoriaInscripcion] = useState('');
  const [parejasDisponibles, setParejasDisponibles] = useState([]);

  // Jugador: formulario con datos del compañero
  const [formCompanero, setFormCompanero] = useState({
    nombreCompanero: '',
    apellidoCompanero: '',
    telefonoCompanero: '',
    emailCompanero: '',
  });
  const [categoriaInscripcionJugador, setCategoriaInscripcionJugador] = useState('');
  const [inscripcionExito, setInscripcionExito] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, g, p, i] = await Promise.all([
        campeonatosApi.get(id).catch(() => null),
        gruposApi.list(id).catch(() => []),
        partidosApi.list({ campeonatoId: id }).catch(() => []),
        inscripcionesApi.list({ campeonatoId: id }).catch(() => []),
      ]);
      setCampeonato(c);
      setGrupos(g);
      setPartidos(p);
      setInscripciones(i);
      if (c?.categorias?.length > 0 && !categoriaActiva) {
        setCategoriaActiva(c.categorias[0].id);
        setCategoriaInscripcion(c.categorias[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id, club?.id]);

  const esAdminClub = campeonato?.clubId && (user?.rol === 'ADMIN' || (user?.clubsAdmin || []).includes(campeonato.clubId));

  useEffect(() => {
    if (esAdminClub || user?.rol === 'JUGADOR') {
      parejasApi.list()
        .then((list) => {
          if (user?.rol === 'JUGADOR' && user?.jugador?.id)
            return list.filter((p) => p.jugador1Id === user.jugador.id || p.jugador2Id === user.jugador.id);
          return list;
        })
        .then(setParejasDisponibles)
        .catch(() => []);
    }
  }, [user, club?.id, esAdminClub]);

  const handleInscribirAdmin = async () => {
    if (!parejaSeleccionada) return;
    setInscribiendo(true);
    try {
      await inscripcionesApi.inscribir(id, parejaSeleccionada, categoriaInscripcion || undefined);
      await load();
      setParejaSeleccionada('');
    } catch (e) {
      alert(e.message || 'Error al inscribir');
    } finally {
      setInscribiendo(false);
    }
  };

  const handleInscribirConCompanero = async (e) => {
    e.preventDefault();
    setInscribiendo(true);
    setInscripcionExito(false);
    try {
      await inscripcionesApi.inscribirConCompanero({
        campeonatoId: id,
        categoriaId: categoriaInscripcionJugador || undefined,
        ...formCompanero,
      });
      await load();
      setFormCompanero({ nombreCompanero: '', apellidoCompanero: '', telefonoCompanero: '', emailCompanero: '' });
      setInscripcionExito(true);
      setTimeout(() => setInscripcionExito(false), 5000);
    } catch (e) {
      alert(e.message || 'Error al inscribir');
    } finally {
      setInscribiendo(false);
    }
  };

  const handleEliminarInscripcion = async (inscripcionId) => {
    if (!confirm('¿Quitar esta pareja?')) return;
    setEliminando(inscripcionId);
    try {
      await inscripcionesApi.eliminar(inscripcionId);
      await load();
    } catch (e) {
      alert(e.message || 'Error al eliminar');
    } finally {
      setEliminando(null);
    }
  };

  if (loading) return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-10">
      <div className="h-56 sm:h-72 bg-slate-200 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!campeonato) return (
    <div className="text-center py-16">
      <p className="text-slate-400">Torneo no encontrado.</p>
      <Link to="/campeonatos" className="text-blue-600 hover:underline text-sm mt-2 inline-block">← Volver a torneos</Link>
    </div>
  );

  const categorias = campeonato.categorias ?? [];
  const catActiva = categorias.find((c) => c.id === categoriaActiva) ?? categorias[0];
  const gruposFiltrados = catActiva
    ? grupos.filter((g) => g.categoriaId === catActiva.id || (!g.categoriaId && categorias.length === 0))
    : grupos;
  const partidosFiltrados = catActiva
    ? partidos.filter((p) => p.categoriaId === catActiva.id || (!p.categoriaId && categorias.length === 0))
    : partidos;

  // Filtrar inscripciones por categoría activa (igual que grupos y partidos)
  const inscripcionesFiltradas = catActiva
    ? inscripciones.filter((i) => i.categoriaId === catActiva.id || (!i.categoriaId && categorias.length === 0))
    : inscripciones;

  // Las parejas ya inscritas en ESTA categoría (para no duplicar en el selector del admin)
  const parejasInscritas = inscripcionesFiltradas.map((i) => i.parejaId);
  const puedeInscribirseAdmin = esAdminClub && parejasDisponibles.length > 0;
  const puedeInscribirseJugador = !esAdminClub && campeonato.estado === 'INSCRIPCIONES' && user && parejasDisponibles.length > 0;

  const estadoCfg = ESTADO_CONFIG[campeonato.estado] ?? ESTADO_CONFIG.FINALIZADO;

  const tabs = [
    { key: 'bracket',       label: 'Partidos' },
    { key: 'clasificacion', label: 'Posiciones' },
    { key: 'ranking',       label: 'Ranking' },
    { key: 'inscripciones', label: `Inscripciones (${inscripcionesFiltradas.length})` },
  ];

  return (
    // Negative margins para que el hero ocupe todo el ancho por encima del padding del layout
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-10">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden transition-opacity duration-700 ${heroLoaded || !campeonato.imagenPortada ? 'opacity-100' : 'opacity-0'}`}
        style={{ minHeight: 240 }}>

        {/* Fondo: imagen o gradiente */}
        {campeonato.imagenPortada ? (
          <img
            src={campeonato.imagenPortada}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={() => setHeroLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950" />
        )}

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Contenido del hero */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800/10 hover:bg-white/20 border border-white/10 text-white text-sm mb-6 transition-all backdrop-blur-md">
            <span>←</span> Volver atrás
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${estadoCfg.color}`}>
                {estadoCfg.label}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-sm">
                {campeonato.nombre}
              </h1>
              {campeonato.descripcion && (
                <p className="text-white/70 mt-2 text-sm sm:text-base max-w-2xl">{campeonato.descripcion}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-white/60 text-sm">
                <span>{formatDateShort(campeonato.fechaInicio)} — {formatDateShort(campeonato.fechaFin)}</span>
                {inscripciones.length > 0 && <span>{inscripciones.length} pareja{inscripciones.length !== 1 ? 's' : ''}</span>}
                {categorias.length > 0 && <span>{categorias.length} categoría{categorias.length !== 1 ? 's' : ''}</span>}
              </div>
            </div>

            {esAdminClub && (
              <div className="flex gap-2 flex-wrap sm:flex-col sm:items-end">
                <Link to={`/admin/campeonatos/${id}/partidos`}
                  className="px-4 py-2 rounded-lg bg-yellow-400 text-slate-900 dark:text-slate-100 text-sm font-bold hover:bg-yellow-300 transition shadow-lg">
                  Gestionar
                </Link>
                <Link to={`/admin/campeonatos/${id}`}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition">
                  Editar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CUERPO ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Tabs de categorías */}
        {categorias.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            {categorias.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setCategoriaActiva(cat.id); setCategoriaInscripcion(cat.id); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  categoriaActiva === cat.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {categoriaLabel(cat)}
              </motion.button>
            ))}
          </div>
        )}

        {/* Tabs de sección */}
        <div className="flex gap-0 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <motion.button
              key={t.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-slate-100 dark:text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${tab}-${categoriaActiva}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Partidos / Bracket */}
            {tab === 'bracket' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <BracketCategoria partidos={partidosFiltrados} grupos={gruposFiltrados} />
                </div>
                {partidosFiltrados.some((p) => ['TREINTAIDOSAVOS', 'DIECISEISAVOS', 'OCTAVOS', 'CUARTOS','SEMIS','FINAL'].includes(p.fase)) && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bracket eliminatorio</h3>
                      <ExportExcelButton 
                        fileName="Bracket_Torneo.xlsx"
                        sheetName="Eliminatorias"
                        data={partidosFiltrados
                          .filter((p) => ['TREINTAIDOSAVOS', 'DIECISEISAVOS', 'OCTAVOS', 'CUARTOS','SEMIS','FINAL'].includes(p.fase))
                          .sort((a, b) => FASE_ORDER[a.fase] - FASE_ORDER[b.fase] || (a.ordenRonda || 0) - (b.ordenRonda || 0))
                          .map((p, i) => ({
                            'Fase': FASE_LABEL[p.fase] || p.fase,
                            'Partido #': i + 1,
                            'Pareja Local': parejaLabel(p.parejaLocal),
                            'Pareja Visitante': parejaLabel(p.parejaVisitante),
                            'Resultado': p.estado === 'FINALIZADO' ? setsLabel(p) : p.estado,
                            'Ganador': getWinner(p) === 'local' ? parejaLabel(p.parejaLocal) : getWinner(p) === 'visitante' ? parejaLabel(p.parejaVisitante) : ''
                          }))}
                      />
                    </div>
                    <div>
                      <BracketVisual partidos={partidosFiltrados} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Posiciones por grupo */}
            {tab === 'clasificacion' && <ClasificacionCategoria grupos={gruposFiltrados} />}

            {/* Ranking global de categoría */}
            {tab === 'ranking' && <RankingCategoria grupos={gruposFiltrados} />}

            {/* Inscripciones */}
            {tab === 'inscripciones' && (
              <div className="space-y-4 max-w-2xl">

                {/* ── ADMIN: selector de pareja existente ─────────────────────── */}
                {puedeInscribirseAdmin && (
                  <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-sm">Agregar pareja (Admin)</p>
                    <div className="flex flex-wrap gap-2">
                      {categorias.length > 1 && (
                        <select value={categoriaInscripcion} onChange={(e) => setCategoriaInscripcion(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm bg-white">
                          {categorias.map((cat) => <option key={cat.id} value={cat.id}>{categoriaLabel(cat)}</option>)}
                        </select>
                      )}
                      <select value={parejaSeleccionada} onChange={(e) => setParejaSeleccionada(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm flex-1 bg-white">
                        <option value="">Seleccionar pareja...</option>
                        {parejasDisponibles
                          .filter((p) => !parejasInscritas.includes(p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.jugador1?.usuario?.nombre} / {p.jugador2?.usuario?.nombre}
                            </option>
                          ))}
                      </select>
                      <button onClick={handleInscribirAdmin} disabled={inscribiendo || !parejaSeleccionada}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 disabled:opacity-50">
                        {inscribiendo ? 'Agregando...' : 'Inscribir'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── JUGADOR: formulario con datos del compañero ──────────────── */}
                {!esAdminClub && campeonato.estado === 'INSCRIPCIONES' && user && (
                  <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Inscribirme con mi compañero</p>
                        <p className="text-xs text-slate-500">Tu compañero no necesita tener cuenta</p>
                      </div>
                    </div>

                    {inscripcionExito && (
                      <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium">
                        ¡Inscripción realizada con éxito!
                      </div>
                    )}

                    <form onSubmit={handleInscribirConCompanero} className="space-y-3">
                      {categorias.length > 1 && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
                          <select
                            value={categoriaInscripcionJugador}
                            onChange={(e) => setCategoriaInscripcionJugador(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm"
                          >
                            <option value="">Seleccionar categoría...</option>
                            {categorias.map((cat) => <option key={cat.id} value={cat.id}>{categoriaLabel(cat)}</option>)}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Nombre compañero <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text" required
                            placeholder="Juan"
                            value={formCompanero.nombreCompanero}
                            onChange={(e) => setFormCompanero(p => ({ ...p, nombreCompanero: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Apellido compañero <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text" required
                            placeholder="García"
                            value={formCompanero.apellidoCompanero}
                            onChange={(e) => setFormCompanero(p => ({ ...p, apellidoCompanero: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Celular compañero <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel" required
                          placeholder="+598 912 345 678"
                          value={formCompanero.telefonoCompanero}
                          onChange={(e) => setFormCompanero(p => ({ ...p, telefonoCompanero: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Email compañero <span className="text-slate-400 font-normal">(opcional — si ya tiene cuenta)</span>
                        </label>
                        <input
                          type="email"
                          placeholder="companero@email.com"
                          value={formCompanero.emailCompanero}
                          onChange={(e) => setFormCompanero(p => ({ ...p, emailCompanero: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:border-blue-400 focus:outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Si tu compañero ya tiene cuenta, escribí su email para vincularlo automáticamente</p>
                      </div>

                      <button
                        type="submit" disabled={inscribiendo}
                        className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition"
                      >
                        {inscribiendo ? 'Inscribiendo...' : 'Confirmar inscripción'}
                      </button>
                    </form>
                  </div>
                )}

                {!user && campeonato.estado === 'INSCRIPCIONES' && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Iniciá sesión para inscribirte en este torneo</p>
                    <a href="/login" className="inline-block px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition">Iniciar sesión</a>
                  </div>
                )}

                {inscripcionesFiltradas.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-slate-400">No hay inscripciones en esta categoría aún.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inscripcionesFiltradas.map((i) => (
                      <div key={i.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-sm transition">
                        <div>
                          <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                            {i.pareja?.jugador1?.usuario?.nombre} / {i.pareja?.jugador2?.usuario?.nombre}
                          </span>
                          {i.categoria && (
                            <span className="ml-2 text-xs text-slate-400">{categoriaLabel(i.categoria)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            i.estado === 'ACEPTADA'     ? 'bg-green-100 text-green-700' :
                            i.estado === 'LISTA_ESPERA' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {i.estado === 'ACEPTADA' ? 'Aceptada' : i.estado === 'LISTA_ESPERA' ? 'Lista espera' : i.estado}
                          </span>
                          {esAdminClub && (
                            <button onClick={() => handleEliminarInscripcion(i.id)} disabled={eliminando === i.id}
                              className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50 transition">
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
