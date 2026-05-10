import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '../config/db.js';
import { authenticate, requireClubAdmin, setClubIdFromInscripcion, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Listar inscripciones (opcional auth; mis=true requiere auth para filtrar por usuario)
router.get('/', optionalAuth, [
  query('campeonatoId').optional().notEmpty(),
  query('categoriaId').optional().isUUID(),
  query('estado').optional().isIn(['PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'LISTA_ESPERA']),
  query('mis').optional().isBoolean(),
], async (req, res) => {
  try {
    const { campeonatoId, categoriaId, estado, mis } = req.query;
    const where = {};
    if (campeonatoId) where.campeonatoId = campeonatoId;
    if (categoriaId) where.categoriaId = categoriaId;
    if (estado) where.estado = estado;

    // Filtrar solo inscripciones del usuario (parejas donde participa)
    if (mis === 'true' && req.user?.jugador?.id) {
      where.pareja = {
        OR: [
          { jugador1Id: req.user.jugador.id },
          { jugador2Id: req.user.jugador.id },
        ],
      };
    }

    const inscripciones = await prisma.inscripcion.findMany({
      where,
      include: {
        campeonato: { select: { nombre: true, fechaInicio: true } },
        pareja: {
          include: {
            jugador1: { include: { usuario: { select: { nombre: true } } } },
            jugador2: { include: { usuario: { select: { nombre: true } } } },
          },
        },
      },
      orderBy: [{ posicionLista: 'asc' }, { fechaInscripcion: 'asc' }],
    });
    res.json(inscripciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inscribir pareja (jugador o admin; admin omite fechas/estado)
router.post('/', authenticate, [
  body('campeonatoId').notEmpty(),
  body('parejaId').isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { campeonatoId, parejaId, categoriaId } = req.body;
    const campeonato = await prisma.campeonato.findUnique({
      where: { id: campeonatoId },
    });
    if (!campeonato) return res.status(404).json({ error: 'Campeonato no encontrado' });

    const pareja = await prisma.pareja.findUnique({
      where: { id: parejaId },
    });
    if (!pareja) return res.status(404).json({ error: 'Pareja no encontrada' });

    const esAdminClub = req.user?.rol === 'ADMIN' || (campeonato.clubId && (req.user?.clubsAdmin || []).includes(campeonato.clubId));

    // Validar que el usuario sea parte de la pareja si no es admin
    if (!esAdminClub) {
      if (req.user?.jugador?.id !== pareja.jugador1Id && req.user?.jugador?.id !== pareja.jugador2Id) {
        return res.status(403).json({ error: 'No tienes permiso para inscribir esta pareja' });
      }

      if (campeonato.estado !== 'INSCRIPCIONES') {
        return res.status(400).json({ error: 'El campeonato no está en período de inscripciones' });
      }
      const now = new Date();
      if (campeonato.fechaInscripcionInicio && now < campeonato.fechaInscripcionInicio) {
        return res.status(400).json({ error: 'El período de inscripciones aún no ha comenzado' });
      }
      if (campeonato.fechaInscripcionFin && now > campeonato.fechaInscripcionFin) {
        return res.status(400).json({ error: 'El período de inscripciones ha terminado' });
      }
    }

    const inscripcion = await prisma.$transaction(async (tx) => {
      const existe = await tx.inscripcion.findUnique({
        where: { campeonatoId_parejaId_categoriaId: { campeonatoId, parejaId, categoriaId: categoriaId ?? null } },
      });
      if (existe) throw Object.assign(new Error('Esta pareja ya está inscrita'), { statusCode: 400 });

      let categoriaTorneo = null;
      if (categoriaId) {
        // CategoriaTorneo se busca por su PK (id = categoriaId del body)
        categoriaTorneo = await tx.categoriaTorneo.findUnique({
          where: { id: categoriaId },
          select: { maxParejas: true },
        });
      }

      const countAceptadas = await tx.inscripcion.count({
        where: { campeonatoId, categoriaId: categoriaId ?? null, estado: 'ACEPTADA' },
      });

      let estado = 'ACEPTADA';
      let posicionLista = null;
      const limite = categoriaTorneo?.maxParejas;
      
      if (limite && countAceptadas >= limite) {
        estado = 'LISTA_ESPERA';
        const countEspera = await tx.inscripcion.count({
          where: { campeonatoId, categoriaId: categoriaId ?? null, estado: 'LISTA_ESPERA' },
        });
        posicionLista = countEspera + 1;
      }

      return tx.inscripcion.create({
        data: { campeonatoId, parejaId, categoriaId: categoriaId ?? null, estado, posicionLista },
        include: {
          campeonato: { select: { nombre: true } },
          pareja: {
            include: {
              jugador1: { include: { usuario: { select: { nombre: true } } } },
              jugador2: { include: { usuario: { select: { nombre: true } } } },
            },
          },
        },
      });
    }, { isolationLevel: 'Serializable' });

    res.status(201).json(inscripcion);
  } catch (err) {
    if (err.statusCode === 400 || err.code === 'P2002') {
      return res.status(400).json({ error: err.message || 'Esta pareja ya está inscrita' });
    }
    res.status(500).json({ error: err.message });
  }
});


// Eliminar inscripción (admin del club)
router.delete('/:id', authenticate, setClubIdFromInscripcion, requireClubAdmin, param('id').isUUID(), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inscripcion.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Inscripción no encontrada' });
    res.status(500).json({ error: err.message });
  }
});

// Aceptar/rechazar inscripción (admin del club)
router.put('/:id', authenticate, setClubIdFromInscripcion, requireClubAdmin, param('id').isUUID(), async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!['ACEPTADA', 'RECHAZADA'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const inscripcion = await prisma.inscripcion.update({
      where: { id },
      data: {
        estado,
        posicionLista: estado === 'ACEPTADA' ? null : undefined,
      },
      include: {
        pareja: true,
        campeonato: true,
      },
    });
    res.json(inscripcion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Inscribir CON datos del compañero (jugador logueado, sin pareja previa) ────
router.post('/con-companero', authenticate, [
  body('campeonatoId').notEmpty(),
  body('nombreCompanero').trim().notEmpty().withMessage('El nombre del compañero es requerido'),
  body('apellidoCompanero').trim().notEmpty().withMessage('El apellido del compañero es requerido'),
  body('telefonoCompanero').trim().notEmpty().withMessage('El teléfono del compañero es requerido'),
  body('emailCompanero').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('categoriaId').optional().isUUID(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // El jugador debe tener perfil de jugador
    if (!req.user?.jugador?.id) {
      return res.status(400).json({ error: 'Tu cuenta no tiene perfil de jugador. Contactá al administrador.' });
    }

    const { campeonatoId, categoriaId, nombreCompanero, apellidoCompanero, telefonoCompanero, emailCompanero } = req.body;

    // Validar campeonato y fechas
    const campeonato = await prisma.campeonato.findUnique({ where: { id: campeonatoId } });
    if (!campeonato) return res.status(404).json({ error: 'Campeonato no encontrado' });
    if (campeonato.estado !== 'INSCRIPCIONES') {
      return res.status(400).json({ error: 'El campeonato no está en período de inscripciones' });
    }
    const now = new Date();
    if (campeonato.fechaInscripcionInicio && now < campeonato.fechaInscripcionInicio) {
      return res.status(400).json({ error: 'El período de inscripciones aún no ha comenzado' });
    }
    if (campeonato.fechaInscripcionFin && now > campeonato.fechaInscripcionFin) {
      return res.status(400).json({ error: 'El período de inscripciones ha terminado' });
    }

    // Obtener límite de la categoría
    let maxParejasEfectivo = null;
    if (categoriaId) {
      const cat = await prisma.categoriaTorneo.findUnique({ where: { id: categoriaId }, select: { maxParejas: true } });
      if (cat?.maxParejas) maxParejasEfectivo = cat.maxParejas;
    }

    const jugadorPropio = req.user.jugador.id;
    const nombreCompaneroCompleto = `${nombreCompanero} ${apellidoCompanero}`;

    const inscripcion = await prisma.$transaction(async (tx) => {
      // 1. Buscar o crear el usuario del compañero
      let usuarioCompanero = null;
      if (emailCompanero) {
        usuarioCompanero = await tx.usuario.findUnique({ where: { email: emailCompanero } });
      }

      if (!usuarioCompanero) {
        // Crear usuario guest (sin contraseña real, no puede iniciar sesión por ahora)
        const emailGuest = emailCompanero || `guest_${Date.now()}_${Math.random().toString(36).slice(2)}@padel.local`;
        usuarioCompanero = await tx.usuario.create({
          data: {
            email: emailGuest,
            password: '', // no puede iniciar sesión hasta registrarse
            nombre: nombreCompaneroCompleto,
            telefono: telefonoCompanero,
            rol: 'JUGADOR',
            esGuest: true,
          },
        });
      }

      // 2. Buscar o crear perfil de jugador del compañero
      let jugadorCompanero = await tx.jugador.findUnique({ where: { usuarioId: usuarioCompanero.id } });
      if (!jugadorCompanero) {
        jugadorCompanero = await tx.jugador.create({
          data: { usuarioId: usuarioCompanero.id, categoria: 4 },
        });
      }

      // 3. Crear la pareja (orden canónico: id menor primero)
      const [j1, j2] = [jugadorPropio, jugadorCompanero.id].sort();
      let pareja = await tx.pareja.findUnique({ where: { jugador1Id_jugador2Id: { jugador1Id: j1, jugador2Id: j2 } } });
      if (!pareja) {
        pareja = await tx.pareja.create({
          data: { jugador1Id: j1, jugador2Id: j2, tipoPareja: 'ABIERTO' },
        });
      }

      // 4. Verificar que no esté ya inscrita
      const existe = await tx.inscripcion.findUnique({
        where: { campeonatoId_parejaId_categoriaId: { campeonatoId, parejaId: pareja.id, categoriaId: categoriaId ?? null } },
      });
      if (existe) throw Object.assign(new Error('Esta pareja ya está inscrita en este torneo'), { statusCode: 400 });

      // 5. Verificar límite de cupos
      let estado = 'ACEPTADA';
      let posicionLista = null;
      if (maxParejasEfectivo) {
        const countAceptadas = await tx.inscripcion.count({
          where: { campeonatoId, categoriaId: categoriaId ?? null, estado: 'ACEPTADA' },
        });
        if (countAceptadas >= maxParejasEfectivo) {
          estado = 'LISTA_ESPERA';
          const countEspera = await tx.inscripcion.count({
            where: { campeonatoId, categoriaId: categoriaId ?? null, estado: 'LISTA_ESPERA' },
          });
          posicionLista = countEspera + 1;
        }
      }

      // 6. Crear la inscripción
      return tx.inscripcion.create({
        data: { campeonatoId, parejaId: pareja.id, categoriaId: categoriaId ?? null, estado, posicionLista },
        include: {
          campeonato: { select: { nombre: true } },
          pareja: {
            include: {
              jugador1: { include: { usuario: { select: { nombre: true, telefono: true } } } },
              jugador2: { include: { usuario: { select: { nombre: true, telefono: true } } } },
            },
          },
        },
      });
    }, { isolationLevel: 'Serializable' });

    res.status(201).json(inscripcion);
  } catch (err) {
    if (err.statusCode === 400 || err.code === 'P2002') {
      return res.status(400).json({ error: err.message || 'Error al inscribir' });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

