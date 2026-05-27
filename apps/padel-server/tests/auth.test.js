import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

// Mock de Prisma
vi.mock('../config/db.js', () => ({
  default: {
    usuario: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un usuario correctamente', async () => {
      // Configuramos el mock para que simule que el usuario NO existe
      prisma.usuario.findUnique.mockResolvedValue(null);
      // Configuramos el mock para la creación del usuario
      prisma.usuario.create.mockResolvedValue({
        id: '123',
        nombre: 'Test User',
        email: 'test@example.com',
        rol: 'JUGADOR',
      });

      const response = await request(app).post('/api/auth/register').send({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.usuario.nombre).toBe('Test User');
    });

    it('debe devolver error si el email ya existe', async () => {
      // Configuramos el mock para que simule que el usuario SÍ existe
      prisma.usuario.findUnique.mockResolvedValue({ id: '123', email: 'test@example.com' });

      const response = await request(app).post('/api/auth/register').send({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('El email ya está registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión con credenciales correctas', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: '123',
        nombre: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        rol: 'JUGADOR',
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('debe fallar con contraseña incorrecta', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        password: hashedPassword,
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });
});
