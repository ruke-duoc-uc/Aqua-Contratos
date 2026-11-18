import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Navegación e Integración: App con React Router', () => {
    // Aseguramos que no quede una sesión de empleado de otro test.
    beforeEach(() => {
        localStorage.clear();
    });

    // Restauramos la URL para no contaminar el siguiente test.
    afterEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('debe renderizar el Portal Principal de Inicio en la ruta inicial', () => {
        render(<App />);

        expect(screen.getByText('Portal de Acceso al Sistema')).toBeInTheDocument();
        expect(screen.getByText('Portal de Empleados')).toBeInTheDocument();
        expect(screen.getByText('Postulante a Trabajo')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /ingresar como empleado/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /postular a un cargo/i })).toBeInTheDocument();
    });

    it('debe mostrar el login de empleados al hacer clic en Ingresar como Empleado', () => {
        render(<App />);

        const btnEmpleado = screen.getByRole('button', { name: /ingresar como empleado/i });
        fireEvent.click(btnEmpleado);

        // El antiguo selector de cargo fue reemplazado por un formulario de login.
        expect(screen.getByText('Inicia Sesión como Empleado')).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico corporativo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('debe proteger las rutas de empleado y redirigir al login sin sesión', () => {
        // Entramos directo a una ruta de rol sin haber iniciado sesión.
        window.history.pushState({}, '', '/jefatura');
        render(<App />);

        expect(screen.getByText('Inicia Sesión como Empleado')).toBeInTheDocument();
    });
});
