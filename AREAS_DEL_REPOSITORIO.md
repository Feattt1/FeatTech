# 📁 Guía de Áreas del Repositorio - Monorepo FeatTech

Esta guía documenta la estructura de archivos real del monorepo unificado **FeatTech**, detallando el propósito y la ubicación de cada aplicación y servicio del portafolio corporativo.

---

## 🗺️ Estructura General del Monorepo

```text
FeatTech/
│
├── 📄 package.json                  # Definición del Workspace raíz (Monorepo)
├── 📄 package-lock.json             # Árbol de dependencias bloqueado
├── 📄 README.md                     # Presentación oficial del portafolio corporativo
├── 📄 DOCUMENTACION.md              # Guía técnica general y arquitectura Neon DB
├── 📄 AREAS_DEL_REPOSITORIO.md      # Este archivo (mapeo del código del monorepo)
│
└── 📁 apps/                         # ========== APLICACIONES Y PROYECTOS ==========
    │
    ├── 📁 featwebs-landing/         # [NUEVO] ========== LANDING PAGE CORPORATIVA ==========
    │   ├── 📄 package.json          # Dependencias y scripts de Vite
    │   ├── 📄 index.html            # Punto de entrada HTML con SEO optimizado
    │   ├── 📄 vite.config.js        # Ajustes del bundler Vite
    │   └── 📁 src/                  # Componentes y estilos premium de la landing
    │       ├── 📄 main.jsx          # Renderizador raíz de React
    │       ├── 📄 App.jsx           # Contenido de la landing (Hero, Servicios, Showcase, Contacto)
    │       ├── 📄 index.css         # Diseño HSL, Google Fonts y Glassmorphism de ultra-lujo
    │       └── 📁 assets/           # Activos e imágenes del portafolio (capturas reales)
    │
    ├── 📁 padel-client/             # [REUBICADO] ========== FRONTEND DE TORNEOS PÁDEL UY ==========
    │   ├── 📄 package.json          # Dependencias del frontend de pádel
    │   ├── 📄 vite.config.js        # Configuración de Vite del cliente
    │   ├── 📄 index.html            # Entrada SPA de la app de torneos
    │   ├── 📄 vercel.json           # Reglas de enrutamiento SPA contra errores 404
    │   └── 📁 src/                  # Código fuente de React
    │       ├── 📄 main.jsx          # Punto de inicio (ReactDOM.createRoot)
    │       ├── 📄 App.jsx           # Enrutador principal (React Router DOM)
    │       ├── 📄 index.css         # Directivas Tailwind + estilos globales de la app
    │       ├── 📁 components/       # Componentes (Layout, ExportExcel, etc.)
    │       ├── 📁 context/          # Estados globales (Auth, Club)
    │       ├── 📁 services/         # Integración API (fetch wrapper api.js)
    │       └── 📁 pages/            # Vistas (Home, Americano, Ranking, Admin, etc.)
    │
    └── 📁 padel-server/             # [REUBICADO] ========== BACKEND DE TORNEOS PÁDEL UY ==========
        ├── 📄 index.js              # Inicializador del servidor Express y Middlewares
        ├── 📄 package.json          # Dependencias y scripts de Node
        ├── 📄 vercel.json           # Configuración de Functions Serverless para Vercel
        ├── 📁 api/                  # Entrada universal para ejecución Serverless
        ├── 📁 config/               # Cliente singleton Prisma para Neon DB
        ├── 📁 middleware/           # Validación de tokens JWT
        ├── 📁 routes/               # Enrutadores API REST (/api/auth, /api/partidos, etc.)
        └── 📁 prisma/               # Esquemas relacionales y scripts de semillado
```

---

## 💻 Resumen de Proyectos

### 1. FeatWebs Landing Page (`apps/featwebs-landing`)
Sitio de presentación corporativo de diseño premium y estética inmersiva de software studio.
* **Estilo Visual**: Implementa gradientes HSL de alta fidelidad, efectos Glassmorphism en tarjetas y micro-animaciones CSS.
* **Showcase**: Integra capturas reales de la aplicación estrella **Torneos Pádel UY** y contiene accesos directos dinámicos enlazados al subdominio `torneos.featwebs.com`.

### 2. Torneos Pádel UY Frontend (`apps/padel-client`)
Frontend SPA completo construido con **React 18** y empaquetado en **Vite**.
* **Americano Inteligente**: Permite administrar torneos "Todos contra Todos" en modalidades por **Parejas Fijas** y **Jugadores Individuales**, ejecutando de forma local algoritmos inteligentes de rotaciones óptimas (minimización de repetición de compañeros y oponentes).
* **Vercel SPA Routing**: Incluye su propio `vercel.json` con reescritura de URLs para evitar los errores 404 ante recargas del navegador.

### 3. Torneos Pádel UY Backend (`apps/padel-server`)
API REST construida sobre **Express** y **Prisma ORM**.
* **Neon Postgres Serverless**: Optimizado para soportar arranques rápidos y reutilización de conexiones en entornos de funciones lambdas de Vercel.
* **Seguridad Avanzada**: Control de peticiones masivas (Rate Limiter), protección CORS dinámica y cifrado JWT de sesiones de usuario.

---

**Última actualización de la estructura**: Mayo 2026
