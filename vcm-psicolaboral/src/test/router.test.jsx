import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Navegación e Integración: App con React Router', () => {
    it('debe renderizar el Portal Principal de Inicio en la ruta inicial', () => {
        render(<App />);

        expect(screen.getByText('Portal de Acceso al Sistema')).toBeInTheDocument();
        expect(screen.getByText('Portal de Empleados')).toBeInTheDocument();
        expect(screen.getByText('Postulante a Trabajo')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /ingresar como empleado/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /postular a un cargo/i })).toBeInTheDocument();
    });

    it('debe navegar al portal de empleados al hacer clic en Ingresar como Empleado', () => {
        render(<App />);

        const btnEmpleado = screen.getByRole('button', { name: /ingresar como empleado/i });
        fireEvent.click(btnEmpleado);

        expect(screen.getByText('Selecciona tu Cargo Operativo')).toBeInTheDocument();
        expect(screen.getByText('Analista de Reclutamiento')).toBeInTheDocument();
        expect(screen.getByText('Profesional Evaluador')).toBeInTheDocument();
        expect(screen.getByText('Jefe de Área')).toBeInTheDocument();
    });
});
