# 🎾 Torneos Padel UY — Gestor de Campeonatos Premium

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?logo=vercel&logoColor=white)](https://www.featwebs.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-blue?logo=postgresql&logoColor=white)](https://neon.tech)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2b2b2b?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Express-00d8ff?logo=react&logoColor=white)](#-tecnologías)

Una plataforma web avanzada y optimizada de alto rendimiento diseñada específicamente para que clubes de pádel en Uruguay y Latinoamérica gestionen sus campeonatos de punta a punta. Desde las inscripciones iniciales hasta la fase de grupos, playoffs automáticos, rankings anuales y reportes interactivos.

---

## ✨ Características Principales

*   👥 **Gestión Completa de Jugadores y Parejas**: Registro de perfiles, niveles de habilidad (1ra a 7ma categoría) e historial de duplas deportivas.
*   🏆 **Múltiples Formatos de Juego**:
    *   **Torneo Oficial**: Fase de grupos (round-robin) con clasificación automatizada y generación automática de llaves de eliminación directa (Playoffs).
    *   **Torneo Americano**: Formato rotativo rápido "todos contra todos" con cálculo individual en tiempo real.
*   📅 **Motor de Asignación de Horarios**: Calendario inteligente que calcula y asigna canchas (pistas), fechas y horas respetando la disponibilidad de los clubes.
*   📊 **Rankings de Clubes**: Clasificaciones anuales acumulativas dinámicas filtrables por año, categoría y sexo, con exportación nativa a **Excel**.
*   🔒 **Seguridad y Control de Acceso**:
    *   Autenticación segura mediante **JSON Web Tokens (JWT)** y encriptación robusta con `bcrypt`.
    *   Botón integrado de inicio de sesión rápido con **Google One-Tap**.
    *   Control granular de roles (`ADMIN` global de plataforma, `ADMIN` de club y `JUGADOR`).

---

## 🛠️ Tecnologías

### Frontend (Cliente)
*   **React 18** + **Vite** — Interfaz de usuario rápida y reactiva con HMR (Hot Module Replacement).
*   **Tailwind CSS** — Diseño estético premium, minimalista, responsivo y adaptativo.
*   **React Router DOM v6** — Enrutamiento del lado del cliente rápido e interactivo.
*   **Framer Motion** — Micro-animaciones fluidas para transiciones y estados interactivos de UI.

### Backend (Servidor)
*   **Node.js** + **Express** — API REST modular diseñada para la arquitectura Serverless.
*   **Prisma ORM** — Mapeador de base de datos relacional robusto y tipado.
*   **Express Rate Limit** — Protección integrada contra ataques de fuerza bruta en inicio de sesión y endpoints críticos.
*   **Express Validator** — Validación estricta de esquemas de datos entrantes.

### Infraestructura y Producción
*   **Base de datos**: **PostgreSQL** serverless alojada de forma nativa en **Neon** con soporte para pools de conexiones optimizados.
*   **Despliegue de Aplicaciones**: **Vercel** monorepo multioyente con proyectos independientes de Frontend y Backend.

---

## 📁 Estructura del Proyecto (Monorepo)

*   `client/` — Aplicación web interactiva (React).
*   `server/` — Servidor de base de datos y API Express.
*   `AREAS_DEL_REPOSITORIO.md` — Mapeo completo de todos los archivos del código.
*   `DOCUMENTACION.md` — Guía profunda de flujos, base de datos y endpoints de API.

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos previos
*   Node.js (versión 18 o superior)
*   Una base de datos PostgreSQL (local o en la nube como Neon)

### 1. Clonar el repositorio e instalar dependencias
Instala todas las dependencias del monorepo en un solo paso usando npm workspaces:
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` dentro de la carpeta `server/` tomando como referencia el archivo `server/.env.example`:
```ini
DATABASE_URL="postgres://..."
DATABASE_URL_UNPOOLED="postgres://..."
JWT_SECRET="una_clave_secreta_muy_larga"
GOOGLE_CLIENT_ID="tu_google_client_id"
```

### 3. Iniciar el servidor y cliente de desarrollo
Ejecuta el entorno local con concurrencia habilitada en el puerto `5173` (front) y `3001` (back):
```bash
npm run dev
```

### 4. Sembrar datos de demostración
Carga un set completo de datos volumétricos para pruebas rápidas (3 clubes, jugadores, torneos y partidos ya jugados):
```bash
npm run db:seed:demo
```

---

## 🌐 Estrategia de Despliegue en Vercel

El monorepo está diseñado para compilarse y desplegarse en **Vercel** dividiendo el proyecto en dos servicios independientes conectados al mismo repositorio:

1.  **Frontend (`client`)**: Configurado con el directorio raíz en `client` y la regla de reescritura para SPAs en `client/vercel.json` para evitar errores 404 en refrescos de página.
2.  **Backend (`server`)**: Configurado con el directorio raíz en `server` para compilar las lambdas serverless basadas en el enrutador de `server/api/[...path].js`.

---

Desarrollado y mantenido con orgullo por [FeatWebs](https://www.featwebs.com) © 2026.
