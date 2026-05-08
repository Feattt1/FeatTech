import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useClub } from '../context/ClubContext';
import { useTheme } from '../context/ThemeContext';

function isAdminOfClub(user, club) {
  if (!user || !club) return false;
  return user.rol === 'ADMIN' || (user.clubsAdmin || []).includes(club.id);
}

export default function Layout() {
  const { club, clubs, selectClub } = useClub();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const esAdminClub = isAdminOfClub(user, club);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [clubAbierto, setClubAbierto] = useState(false);
  const adminRef = useRef(null);
  const clubRef = useRef(null);

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => { setMenuAbierto(false); }, [location.pathname]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClick(e) {
      if (adminRef.current && !adminRef.current.contains(e.target)) setAdminAbierto(false);
      if (clubRef.current && !clubRef.current.contains(e.target)) setClubAbierto(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuAbierto(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ── Decoración lateral (Solo Desktop > 2xl) ───────────────────────── */}
      <div className="hidden 2xl:block fixed top-0 left-0 bottom-0 w-[500px] pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{ WebkitMaskImage: 'radial-gradient(circle at left 40%, black 20%, transparent 80%)' }}
        >
          <img src="/images/bg-left.png" className="w-full h-full object-cover" alt="" />
        </motion.div>
      </div>

      <div className="hidden 2xl:block fixed top-0 right-0 bottom-0 w-[500px] pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{ WebkitMaskImage: 'radial-gradient(circle at right 40%, black 20%, transparent 80%)' }}
        >
          <img src="/images/bg-right.png" className="w-full h-full object-cover" alt="" />
        </motion.div>
      </div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="text-white shadow-lg border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl sm:text-2xl tracking-wider shrink-0 group">
              <span className="bg-gradient-to-r from-padel to-padel-dark bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(204,255,0,0.5)] transition-all">Torneos Padel</span>
              <span className="text-white">UY</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-3 sm:gap-5">
              {/* Club selector — desktop */}
              {clubs.length > 1 && (
                <div className="relative" ref={clubRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setClubAbierto(!clubAbierto)}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium text-sm text-white border border-slate-600 transition"
                  >
                    {club?.nombre || 'Club'} ▾
                  </motion.button>
                  {clubAbierto && (
                    <div className="absolute top-full left-0 mt-2 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl text-slate-900 dark:text-slate-200 min-w-[200px] z-50 border border-slate-100 dark:border-slate-700 animate-fade-in origin-top-left">
                      {clubs.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { selectClub(c); setClubAbierto(false); }}
                          className={`block w-full text-left px-4 py-3 hover:bg-padel/10 text-sm border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors ${club?.id === c.id ? 'font-bold bg-padel/20 text-slate-900' : ''}`}
                        >
                          {c.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Link to="/" className="text-white hover:text-padel transition-colors font-medium text-sm relative group py-1">
                Inicio
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padel transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/campeonatos" className="text-white hover:text-padel transition-colors font-medium text-sm relative group py-1">
                Torneos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padel transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/ranking" className="text-white hover:text-padel transition-colors font-medium text-sm relative group py-1">
                Ranking
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padel transition-all duration-300 group-hover:w-full"></span>
              </Link>

              <button onClick={toggleTheme} className="text-lg p-1.5 rounded-full hover:bg-slate-800 transition-colors ml-2" title="Cambiar tema">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {user ? (
                <>
                  <Link to="/mi-perfil" className="text-white hover:text-padel transition-colors font-medium text-sm relative group py-1">
                    Perfil
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padel transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link to="/mis-inscripciones" className="text-white hover:text-padel transition-colors font-medium text-sm hidden md:inline relative group py-1">
                    Mis inscripciones
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-padel transition-all duration-300 group-hover:w-full"></span>
                  </Link>

                  {esAdminClub && (
                    <div className="relative" ref={adminRef}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAdminAbierto(!adminAbierto)}
                        className="px-3 py-2 rounded-lg bg-padel-dark hover:bg-padel text-slate-900 font-bold text-sm transition-colors"
                      >
                        Admin ▾
                      </motion.button>
                      {adminAbierto && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl py-2 border border-slate-100 dark:border-slate-700 z-50 animate-fade-in origin-top-right">
                          <Link to="/admin/campeonatos" onClick={() => setAdminAbierto(false)} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 font-medium transition-colors hover:pl-5">Campeonatos</Link>
                          <Link to="/admin/jugadores"   onClick={() => setAdminAbierto(false)} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 transition-colors hover:pl-5">Jugadores</Link>
                          <Link to="/admin/parejas"     onClick={() => setAdminAbierto(false)} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-900 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 transition-colors hover:pl-5">Parejas</Link>
                          <Link to="/admin/clubs"       onClick={() => setAdminAbierto(false)} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-900 dark:text-slate-200 transition-colors hover:pl-5">Clubes</Link>
                        </div>
                      )}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-bold text-sm bg-slate-800 hover:bg-red-500 text-white transition-colors"
                  >
                    Salir
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:text-padel transition-colors font-medium text-sm">
                    Entrar
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="px-5 py-2 block rounded-xl font-bold text-sm bg-padel hover:bg-padel-light text-slate-900 transition-colors hover:shadow-neon">
                      Registrarse
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile: botón hamburguesa */}
            <button
              className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-slate-800 transition"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menú"
            >
              <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuAbierto ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuAbierto ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuAbierto ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>

        {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
        {menuAbierto && (
          <div className="sm:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 px-4 py-4 space-y-1 animate-fade-in shadow-2xl">
            {/* Club selector mobile */}
            {clubs.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Club activo</p>
                <div className="flex flex-wrap gap-2">
                  {clubs.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { selectClub(c); setMenuAbierto(false); }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${club?.id === c.id ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Toggle Mobile */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-slate-700 mb-2">
              <span className="text-sm font-medium text-slate-300">Modo visual</span>
              <button onClick={toggleTheme} className="text-xl p-1 rounded-md hover:bg-slate-800 transition-colors">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>

            {/* Nav links */}
            <Link to="/" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 font-medium text-sm transition">
              🏠 Inicio
            </Link>
            <Link to="/campeonatos" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 font-medium text-sm transition">
              <span className="w-5 text-center mr-3 font-bold opacity-50">T</span>
              Torneos
            </Link>
            <Link to="/ranking" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 font-medium text-sm transition">
              <span className="w-5 text-center mr-3 font-bold opacity-50">R</span>
              Ranking
            </Link>

            {user ? (
              <>
                <Link to="/mi-perfil" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 font-medium text-sm transition">
                  👤 Mi perfil
                </Link>
                <Link to="/mis-inscripciones" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 font-medium text-sm transition">
                  📋 Mis inscripciones
                </Link>

                {esAdminClub && (
                  <>
                    <div className="border-t border-slate-700 my-2" />
                    <p className="text-xs text-yellow-400 uppercase tracking-wider px-3 py-1 font-bold">Admin</p>
                    <Link to="/admin/campeonatos" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 font-medium text-sm transition">
                      🗂 Campeonatos
                    </Link>
                    <Link to="/admin/jugadores" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 text-sm transition">
                      👥 Jugadores
                    </Link>
                    <Link to="/admin/parejas" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 text-sm transition">
                      🤝 Parejas
                    </Link>
                    <Link to="/admin/clubs" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-slate-800 text-sm transition">
                      🏠 Clubes
                    </Link>
                  </>
                )}

                <div className="border-t border-slate-700 my-2" />
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-slate-400 text-sm">{user.nombre}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-bold text-sm bg-yellow-400 hover:bg-yellow-500 text-slate-900 transition"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-t border-slate-700 my-2" />
                <div className="flex gap-3 px-3 py-2">
                  <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg border border-slate-600 text-white text-sm font-medium hover:bg-slate-800 transition">
                    Entrar
                  </Link>
                  <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg bg-yellow-400 text-slate-900 text-sm font-bold hover:bg-yellow-500 transition">
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── Contenido principal ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-white py-12 sm:py-16 mt-10 sm:mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-padel to-padel-dark bg-clip-text text-transparent inline-block">Torneos Padel UY</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                La plataforma premium para gestionar y vivir tus torneos de pádel.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-padel uppercase tracking-wider">Plataforma</h4>
              <ul className="text-slate-400 text-sm space-y-3">
                <li><Link to="/" className="hover:text-padel transition-colors">Inicio</Link></li>
                <li><Link to="/campeonatos" className="hover:text-padel transition-colors">Torneos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-padel uppercase tracking-wider">Contacto</h4>
              <p className="text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">info@padelchampionship.uy</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-xs">
            <p>© {new Date().getFullYear()} Torneos Padel UY</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
