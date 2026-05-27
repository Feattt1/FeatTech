import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import prisma from '../config/db.js';
import jwt from 'jsonwebtoken';

vi.mock('../config/db.js', () => ({
  default: {
    usuario: {
      findUnique: vi.fn(),
    },
    campeonato: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Campeonatos API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/campeonatos', () => {
    it('debe devolver la lista de campeonatos activos', async () => {
      const mockCampeonatos = [
        { id: '1', nombre: 'Torneo 1', estado: 'EN_CURSO' },
        { id: '2', nombre: 'Torneo 2', estado: 'INSCRIPCIONES' },
      ];
      prisma.campeonato.count.mockResolvedValue(2);
      prisma.campeonato.findMany.mockResolvedValue(mockCampeonatos);

      const response = await request(app).get('/api/campeonatos');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].nombre).toBe('Torneo 1');
    });
  });

  describe('POST /api/campeonatos', () => {
    it('debe crear un campeonato si el usuario es administrador', async () => {
      // 1. Crear un token válido
      process.env.JWT_SECRET = 'test-secret';
      const token = jwt.sign({ userId: 'admin-123' }, process.env.JWT_SECRET);

      // 2. Mockear el usuario como ADMIN
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'admin-123',
        rol: 'ADMIN',
        clubsAdmin: [],
      });

      // 3. Mockear la creación
      prisma.campeonato.create.mockResolvedValue({
        id: 'camp-1',
        nombre: 'Nuevo Torneo Premium',
        estado: 'INSCRIPCIONES',
      });

      const response = await request(app)
        .post('/api/campeonatos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Nuevo Torneo Premium',
          fechaInicio: '2026-06-01T00:00:00Z',
          fechaFin: '2026-06-05T00:00:00Z',
        });

      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe('Nuevo Torneo Premium');
    });

    it('debe denegar la creación si el usuario no es admin', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const token = jwt.sign({ userId: 'jugador-123' }, process.env.JWT_SECRET);

      prisma.usuario.findUnique.mockResolvedValue({
        id: 'jugador-123',
        rol: 'JUGADOR',
      });

      const response = await request(app)
        .post('/api/campeonatos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Torneo Falso',
          fechaInicio: '2026-06-01T00:00:00Z',
          fechaFin: '2026-06-05T00:00:00Z',
        });

      // Debe dar 403 Forbidden por no tener permisos de admin para la ruta
      expect(response.status).toBe(403);
    });
  });
});
