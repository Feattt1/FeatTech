# 📁 Guía de Áreas del Repositorio - Torneos Padel UY

Esta guía documenta la estructura de archivos real del monorepo, detallando el propósito y el contenido de cada componente en el Frontend y el Backend.

---

## 🗺️ Estructura General del Monorepo

```text
PadelTournamentApp/
│
├── 📄 package.json                  # Definición del Workspace raíz (Monorepo)
├── 📄 package-lock.json             # Árbol de dependencias bloqueado
├── 📄 README.md                     # Presentación oficial de la plataforma
├── 📄 DOCUMENTACION.md              # Flujos lógicos, API y guía de arquitectura
├── 📄 AREAS_DEL_REPOSITORIO.md      # Este archivo (mapeo del código)
│
├── 📁 client/                       # ========== FRONTEND (React + Vite + Tailwind) ==========
│   ├── 📄 package.json              # Dependencias del cliente
│   ├── 📄 vite.config.js            # Configuración del bundler Vite
│   ├── 📄 tailwind.config.js        # Estilos y tokens de diseño Tailwind
│   ├── 📄 postcss.config.js         # Procesamiento de CSS
│   ├── 📄 index.html                # Entrada de la Single Page Application (SPA)
│   ├── 📄 vercel.json               # [NUEVO] Reglas de enrutamiento SPA para Vercel
│   │
│   ├── 📁 public/                   # Activos públicos estáticos
│   │   ├── 📄 favicon.svg           # Icono de la pestaña del navegador
│   │   └── 📁 images/               # Imágenes estáticas
│   │
│   └── 📁 src/                      # Código fuente de React
│       ├── 📄 main.jsx              # Punto de inicio (ReactDOM.createRoot)
│       ├── 📄 App.jsx               # Enrutador principal (React Router DOM)
│       ├── 📄 index.css             # Directivas Tailwind + estilos globales
│       │
│       ├── 📁 components/           # Componentes UI reutilizables
│       │   ├── 📄 Layout.jsx        # Marco visual con Navbar responsivo y Footer
│       │   ├── 📄 ExportExcelButton.jsx # Utilidad para descargar tablas en Excel (.xlsx)
│       │   └── 📄 GoogleLoginButton.jsx # Botón de autenticación con Google One-Tap
│       │
│       ├── 📁 context/              # Estados globales de React
│       │   ├── 📄 AuthContext.jsx   # Sesión, Login, Registro, JWT y datos de Usuario
│       │   └── 📄 ClubContext.jsx   # Almacenamiento local del Club seleccionado activo
│       │
│       ├── 📁 services/             # Integración con el Backend
│       │   └── 📄 api.js            # Cliente HTTP (fetch wrapper) unificado
│       │
│       └── 📁 pages/                # Vistas y Páginas de la Aplicación
│           ├── 📄 Home.jsx          # Dashboard de bienvenida del club activo
│           ├── 📄 Login.jsx         # Formulario de inicio de sesión
│           ├── 📄 Register.jsx      # Registro de nuevos usuarios
│           ├── 📄 SelectorClub.jsx  # Selector inicial para cargar los datos de un club
│           ├── 📄 MiPerfil.jsx      # Perfil del jugador (categoría, nivel, teléfono)
│           ├── 📄 MisInscripciones.jsx # Historial de torneos del usuario
│           ├── 📄 Campeonatos.jsx   # Listado de torneos activos del club
│           ├── 📄 CampeonatoDetalle.jsx # Vista integral de grupos, cruces, partidos y tablas
│           ├── 📄 Ranking.jsx       # Clasificación anual del club por categoría
│           ├── 📄 Americano.jsx     # Gestor de torneos en formato "todos contra todos" rápido
│           │
│           └── 📁 admin/            # ========== VISTAS DE ADMINISTRACIÓN DE CLUB ==========
│               ├── 📄 AdminDashboard.jsx    # Panel general con estadísticas y accesos directos
│               ├── 📄 AdminCampeonatos.jsx  # Crear, listar y suspender torneos del club
│               ├── 📄 AdminCampeonatoEditar.jsx # Formulario de edición del torneo seleccionado
│               ├── 📄 AdminTorneoControlCenter.jsx # Dashboard central de control de un torneo
│               ├── 📄 AdminTorneoResumen.jsx # Estadísticas rápidas de un campeonato activo
│               ├── 📄 AdminPartidos.jsx     # Gestor unificado con pestañas para:
│               │                            # - Aceptar/Rechazar inscripciones de parejas
│               │                            # - Definición y generación de Grupos
│               │                            # - Generación automática de eliminatorias (Playoffs)
│               │   ├── 📄 AdminHorarios.jsx # Definición de canchas, fechas y franjas horarias
│               │   ├── 📄 AdminGestionarPartidos.jsx # Asignación de canchas y horas a partidos
│               │   ├── 📄 AdminJugadores.jsx # Control y creación de jugadores asociados al club
│               │   ├── 📄 AdminParejas.jsx   # Creación manual y control de duplas registradas
│               │   └── 📄 AdminClubs.jsx     # Reservado para Superadministradores (crear clubes)
│
└── 📁 server/                       # ========== BACKEND (Node.js + Express + Prisma) ==========
    ├── 📄 index.js                  # Inicializador del servidor Express y Middlewares
    ├── 📄 package.json              # Dependencias y scripts de construcción
    ├── 📄 nodemon.json              # Configuración de auto-reload de desarrollo
    ├── 📄 vercel.json               # Configuración Serverless para Vercel Functions
    │
    ├── 📁 api/                      # Punto de entrada para el motor Serverless de Vercel
    │   └── 📄 [...path].js          # Redireccionamiento universal a index.js
    │
    ├── 📁 config/                   # Ajustes globales
    │   └── 📄 db.js                 # Cliente único de Prisma (Singleton para Serverless)
    │
    ├── 📁 middleware/               # Capas de interceptación de peticiones
    │   └── 📄 auth.js               # Validación y decodificación de tokens JWT
    │
    ├── 📁 routes/                   # Controladores y enrutamiento API REST (/api)
    │   ├── 📄 auth.js               # Rutas de login, registro, perfil y Google Auth
    │   ├── 📄 clubs.js              # Gestión de clubes y asignación de administradores
    │   ├── 📄 campeonatos.js        # Configuración de torneos, categorías y fixtures
    │   ├── 📄 jugadores.js          # Control de perfiles de jugadores
    │   ├── 📄 parejas.js            # Registro, movimiento de grupos y eliminación de parejas
    │   ├── 📄 inscripciones.js      # Solicitudes de participación en campeonatos
    │   ├── 📄 partidos.js           # Carga de sets, canchas y resultados de partidos
    │   ├── 📄 grupos.js             # Generación y manipulación de fase de grupos
    │   └── 📄 notificaciones.js     # Bandeja de entrada de avisos de sistema para usuarios
    │
    └── 📁 prisma/                   # ========== PERSISTENCIA (Prisma ORM & Neon) ==========
        ├── 📄 schema.prisma         # Esquema relacional de base de datos PostgreSQL
        ├── 📄 seed.js               # Script para poblar catálogo básico inicial
        ├── 📄 seed-demo.js          # Datos falsos volumétricos para demostración
        └── 📄 seed-torneos-prueba.js # Generador de un torneo simulado completo
```

---

## 💻 Resumen de Capas Clave

### 1. El Cliente Frontend (`/client`)
Es una SPA construida sobre **React 18** y empaquetada con **Vite**. 
* **Control de Rutas (`client/src/App.jsx`)**: Divide las rutas en tres niveles:
  * *Rutas Públicas*: `/login`, `/register`, `/americano` (formato rápido accesible sin club).
  * *Rutas Privadas de Jugador*: `/mi-perfil`, `/mis-inscripciones` (requieren sesión activa).
  * *Rutas de Administración (`/admin/*`)*: Solo accesibles si el usuario es `ADMIN` global o tiene su ID en la lista `clubsAdmin` del club seleccionado en `ClubContext`.
* **API Service (`client/src/services/api.js`)**: Realiza llamadas HTTP asíncronas contra el backend usando `fetch`. Se adapta dinámicamente si hay una variable de entorno `VITE_API_URL` definida o cae de vuelta a `/api`.

### 2. El Servidor Backend (`/server`)
API REST robusta impulsada por **Express**.
* **Protección CORS (`server/index.js`)**: Habilitado dinámicamente para entornos locales de desarrollo (`localhost:5173`), subdominios de `featwebs.com` y previsualizaciones de Vercel (`*.vercel.app`).
* **Seguridad y Tasa de Límite (Rate Limiting)**: Habilita `express-rate-limit` con límites de 10 peticiones cada 15 minutos para autenticación (prevención de ataques de fuerza bruta) y 300 peticiones por minuto en la API general.
* **Sesión Serverless**: Diseñado modularmente en la carpeta `/api` para que Vercel lo ejecute como funciones Lambdas autogestionadas con excelente rendimiento.

### 3. Persistencia de Datos (`/server/prisma`)
* **Proveedor**: PostgreSQL (Neon Serverless).
* **Esquema (`schema.prisma`)**: Define enums para roles de usuario (`ADMIN`, `JUGADOR`, `PUBLICO`), estados de campeonatos y partidos, modelos relacionales complejos con borrado en cascada configurado para evitar registros huérfanos.
* **Singleton de Base de Datos (`server/config/db.js`)**: Habilita un patrón de instancia global para evitar saturar la cuota de conexiones simultáneas del pool de Neon durante múltiples arranques en frío de Vercel.

---

**Última actualización de la estructura**: Mayo 2026
