import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nombre').trim().notEmpty(),
  body('apellido').optional().trim(),
  body('telefono').optional().trim(),
  body('categoria').optional().isInt({ min: 1, max: 7 }),
  body('rol').optional().isIn(['ADMIN', 'JUGADOR', 'PUBLICO']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, nombre, apellido, telefono, categoria = 4, rol = 'JUGADOR' } = req.body;
    const nombreCompleto = apellido ? `${nombre} ${apellido}` : nombre;

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario y su perfil de jugador en una sola transacción
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: { email, password: hashed, nombre: nombreCompleto, telefono: telefono || null, rol },
        select: { id: true, email: true, nombre: true, rol: true, telefono: true },
      });

      // Auto-crear perfil jugador para poder inscribirse de inmediato
      let jugador = null;
      if (rol === 'JUGADOR') {
        jugador = await tx.jugador.create({
          data: {
            usuarioId: usuario.id,
            categoria: parseInt(categoria, 10) || 4,
          },
          select: { id: true, categoria: true, nivel: true },
        });
      }

      return { usuario, jugador };
    });

    const token = jwt.sign(
      { userId: result.usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      usuario: { ...result.usuario, jugador: result.jugador, clubsAdmin: [] },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        jugador: true,
        clubsAdmin: { select: { clubId: true } },
      },
    });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, clubsAdmin: raw, ...rest } = usuario;
    const clubsAdmin = (raw || []).map((a) => a.clubId);
    res.json({ usuario: { ...rest, clubsAdmin }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/password', authenticate, [
  body('passwordActual').notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('passwordNueva').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { passwordActual, passwordNueva } = req.body;
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const valid = await bcrypt.compare(passwordActual, usuario.password);
    if (!valid) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }
    const hashed = await bcrypt.hash(passwordNueva, 10);
    await prisma.usuario.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Login / Registro con Google ──────────────────────────────────────────────
router.post('/google', [
  body('credential').notEmpty().withMessage('Token de Google requerido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { credential } = req.body;

    // 1. Verificar el token con Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) return res.status(400).json({ error: 'No se pudo obtener el email de Google' });

    // 2. Buscar usuario existente por googleId o email
    let usuario = await prisma.usuario.findFirst({
      where: { OR: [{ googleId }, { email }] },
      include: {
        jugador: { select: { id: true, categoria: true, nivel: true } },
        clubsAdmin: { select: { clubId: true } },
      },
    });

    if (usuario) {
      // Vincular googleId si aún no está vinculado (ej: tenía cuenta con email/pass)
      if (!usuario.googleId) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { googleId },
        });
      }
    } else {
      // 3. Crear nuevo usuario + jugador automáticamente
      const result = await prisma.$transaction(async (tx) => {
        const nuevoUsuario = await tx.usuario.create({
          data: {
            email,
            nombre: name || email.split('@')[0],
            googleId,
            rol: 'JUGADOR',
          },
        });
        const nuevoJugador = await tx.jugador.create({
          data: { usuarioId: nuevoUsuario.id, categoria: 4 },
          select: { id: true, categoria: true, nivel: true },
        });
        return { usuario: nuevoUsuario, jugador: nuevoJugador };
      });

      usuario = {
        ...result.usuario,
        jugador: result.jugador,
        clubsAdmin: [],
      };
    }

    // 4. Generar JWT propio
    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, clubsAdmin: raw, ...rest } = usuario;
    const clubsAdmin = Array.isArray(raw) ? raw.map((a) => a.clubId ?? a) : [];

    res.json({ usuario: { ...rest, clubsAdmin }, token });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Error al autenticar con Google' });
  }
});

// ── Obtener perfil del usuario actual ────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, nombre: true, rol: true, telefono: true, googleId: true,
        jugador: { select: { id: true, categoria: true, nivel: true } },
        clubsAdmin: { select: { clubId: true } },
      },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { clubsAdmin: raw, ...rest } = usuario;
    res.json({ ...rest, clubsAdmin: (raw || []).map((a) => a.clubId), tienePassword: !!usuario.password });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Actualizar perfil del usuario actual ──────────────────────────────────────
router.put('/me', authenticate, [
  body('nombre').optional().trim().notEmpty(),
  body('telefono').optional().trim(),
  body('categoria').optional().isInt({ min: 1, max: 7 }),
  body('nivel').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nombre, telefono, categoria, nivel } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar datos de Usuario
      const dataUsuario = {};
      if (nombre !== undefined) dataUsuario.nombre = nombre;
      if (telefono !== undefined) dataUsuario.telefono = telefono || null;

      let usuario = await tx.usuario.findUnique({ where: { id: req.user.id }, include: { jugador: true, clubsAdmin: true } });
      
      if (Object.keys(dataUsuario).length > 0) {
        usuario = await tx.usuario.update({
          where: { id: req.user.id },
          data: dataUsuario,
          include: { jugador: true, clubsAdmin: true }
        });
      }

      // 2. Actualizar o crear Jugador si viene categoría/nivel
      if (categoria !== undefined || nivel !== undefined) {
        if (usuario.jugador) {
          usuario.jugador = await tx.jugador.update({
            where: { usuarioId: req.user.id },
            data: {
              categoria: categoria !== undefined ? parseInt(categoria, 10) : undefined,
              nivel: nivel !== undefined ? nivel || null : undefined,
            }
          });
        } else if (categoria !== undefined) {
          // Si por alguna razón no tenía perfil, se lo creamos
          usuario.jugador = await tx.jugador.create({
            data: {
              usuarioId: req.user.id,
              categoria: parseInt(categoria, 10),
              nivel: nivel || null
            }
          });
        }
      }

      return usuario;
    });

    const { password: _, clubsAdmin: raw, ...rest } = result;
    res.json({ ...rest, clubsAdmin: (raw || []).map((a) => a.clubId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;

