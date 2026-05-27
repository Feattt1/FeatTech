import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Home from '../pages/Home';
import { AuthProvider } from '../context/AuthContext';
import { ClubProvider } from '../context/ClubContext';

// Mock de la API
vi.mock('../services/api', () => ({
  campeonatosApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

describe('Home Page', () => {
  it('debe renderizar el Hero Section con el título correcto', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ClubProvider>
            <Home />
          </ClubProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Torneos Padel UY/i)).toBeInTheDocument();
    expect(screen.getByText(/La plataforma premium para gestionar/i)).toBeInTheDocument();
  });
});
