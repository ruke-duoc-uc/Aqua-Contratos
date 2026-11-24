import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IndicadorCard from '../components/IndicadorCard';
import AlertaExitoCerrable from '../components/AlertaExitoCerrable';
import BarraFiltros from '../components/BarraFiltros';
import PortalAuthPostulante from '../components/PortalAuthPostulante';
import TarjetaOferta from '../components/tarjetaOferta';
import { obtenerCamposFaltantesPerfil } from '../services/candidatosStorage';
import {
    registrarPuestoGlobal,
    actualizarPuestoGlobal,
    cargarPuestosGlobales,
} from '../services/puestosStorage';
import {
    construirUrlGoogleCalendar,
    registrarFechaEspecialCalendario,
} from '../utils/googleCalendar';

describe('Componente: IndicadorCard', () => {
    it('debe renderizar el título y el valor numérico correctamente', () => {
        render(<IndicadorCard titulo="Candidatos Totales" valor={15} />);
        expect(screen.getByText('Candidatos Totales')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('debe aplicar las clases de tarjeta y Bootstrap 5', () => {
        const { container } = render(<IndicadorCard titulo="En proceso" valor={3} />);
        const cardElement = container.querySelector('.card');
        expect(cardElement).toBeInTheDocument();
        expect(cardElement).toHaveClass('shadow-sm');
    });
});

describe('Componente: AlertaExitoCerrable', () => {
    it('no debe renderizar nada si el mensaje es vacío', () => {
        const { container } = render(<AlertaExitoCerrable mensaje="" onCerrar={() => {}} />);
        expect(container.firstChild).toBeNull();
    });

    it('debe mostrar el mensaje y responder al clic de cierre', () => {
        const handleCerrar = vi.fn();
        render(<AlertaExitoCerrable mensaje="Solicitud guardada con éxito" onCerrar={handleCerrar} />);

        expect(screen.getByText('Solicitud guardada con éxito')).toBeInTheDocument();

        const botonCerrar = screen.getByRole('button', { name: /cerrar alerta/i });
        fireEvent.click(botonCerrar);

        expect(handleCerrar).toHaveBeenCalledTimes(1);
    });
});

describe('Componente: BarraFiltros', () => {
    it('debe disparar la función onBusquedaChange al escribir en el buscador', () => {
        const handleBusqueda = vi.fn();
        render(
            <BarraFiltros
                busqueda=""
                onBusquedaChange={handleBusqueda}
                filtroEstado="todos"
                onFiltroEstadoChange={() => {}}
                filtroPlanta="todas"
                onFiltroPlantaChange={() => {}}
                totalResultados={5}
                totalOriginal={10}
                onLimpiarFiltros={() => {}}
            />
        );

        const input = screen.getByLabelText('Buscar solicitudes');
        fireEvent.change(input, { target: { value: 'González' } });

        expect(handleBusqueda).toHaveBeenCalledWith('González');
    });

    it('debe mostrar el botón de limpiar filtros cuando hay filtros activos', () => {
        const handleLimpiar = vi.fn();
        render(
            <BarraFiltros
                busqueda="Pedro"
                onBusquedaChange={() => {}}
                filtroEstado="todos"
                onFiltroEstadoChange={() => {}}
                filtroPlanta="todas"
                onFiltroPlantaChange={() => {}}
                totalResultados={1}
                totalOriginal={10}
                onLimpiarFiltros={handleLimpiar}
            />
        );

        const botonLimpiar = screen.getByRole('button', { name: /limpiar filtros/i });
        expect(botonLimpiar).toBeInTheDocument();

        fireEvent.click(botonLimpiar);
        expect(handleLimpiar).toHaveBeenCalledTimes(1);
    });
});

describe('Componente: PortalAuthPostulante (Registro e Inicio de Sesión B1 / B2)', () => {
    it('debe bloquear el registro y mostrar alerta cuando el RUT tiene dígito verificador inválido', () => {
        const handleAutenticado = vi.fn();
        render(<PortalAuthPostulante onAutenticado={handleAutenticado} onVolver={() => {}} />);

        // Cambiar a la pestaña de Crear Usuario Postulante (B1)
        const tabRegistro = screen.getByRole('button', { name: /crear usuario postulante/i });
        fireEvent.click(tabRegistro);

        fireEvent.change(screen.getByLabelText(/RUT \*/i), { target: { value: '11111111' } });
        fireEvent.change(screen.getByLabelText(/dígito verificador/i), { target: { value: '9' } });
        fireEvent.change(screen.getByLabelText(/Nombres \*/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellidos \*/i), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'juan.perez@gmail.com' } });
        fireEvent.change(screen.getByLabelText(/Contraseña \* \(mín\. 6 caracteres\)/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña \*/i), { target: { value: 'password123' } });

        const btnSubmit = screen.getByRole('button', { name: /registrar cuenta de postulante/i });
        fireEvent.click(btnSubmit);

        expect(handleAutenticado).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent(/módulo 11/i);
    });
});

describe('Validación de Perfil Completo antes de Postular (B4 -> F3)', () => {
    it('debe identificar los campos faltantes del perfil cuando recién se crea la cuenta', () => {
        const faltantes = obtenerCamposFaltantesPerfil({
            rut: '21.756.200-7',
            nombres: 'Juan',
            apellidos: 'Pérez',
            email: 'juan@gmail.com',
            direccion: '',
            comuna: '',
            fecha_nacimiento: '',
            cv_pdf: '',
        });

        expect(faltantes).toContain('Dirección');
        expect(faltantes).toContain('Comuna');
        expect(faltantes).toContain('Fecha de nacimiento');
        expect(faltantes).toContain('Currículum Vitae (CV)');
    });

    it('debe mostrar el botón de completar perfil en TarjetaOferta cuando perfilIncompleto es true', () => {
        const handleIrAPerfil = vi.fn();
        render(
            <TarjetaOferta
                puesto={{ id: 1, titulo: 'Buzo Básico', planta: 'Puerto Montt', familiaCargo: 'Operaciones', vacantes: 2 }}
                perfilIncompleto={true}
                onPostular={() => {}}
                onIrAPerfil={handleIrAPerfil}
            />
        );

        const btnCompletar = screen.getByRole('button', { name: /completa tu perfil para postular/i });
        expect(btnCompletar).toBeInTheDocument();
        fireEvent.click(btnCompletar);
        expect(handleIrAPerfil).toHaveBeenCalledTimes(1);
    });
});

describe('Edición de Ofertas e Historial de Modificaciones (F2)', () => {
    it('debe incrementar conteoModificaciones y registrar historialModificaciones al editar un puesto', () => {
        localStorage.clear();
        const creados = registrarPuestoGlobal({
            id: 99,
            area_id: 1,
            titulo: 'Analista QA',
            planta: 'Puerto Montt',
            familiaCargo: 'Sistemas y TI',
            vacantes: 1,
        });
        const inicial = creados.find((p) => p.id === 99);
        expect(inicial.conteoModificaciones).toBe(0);

        const actualizados = actualizarPuestoGlobal(99, {
            vacantes: 3,
            planta: 'Osorno',
            modificadoPor: 'Carlos Mendoza (Jefe Sistemas y TI)',
            forzarCalculoLocal: true,
        });
        const editado = actualizados.find((p) => p.id === 99);

        expect(editado.conteoModificaciones).toBe(1);
        expect(editado.historialModificaciones).toHaveLength(1);
        expect(editado.historialModificaciones[0].detalle).toMatch(/Vacantes: 1 → 3/);
        expect(editado.historialModificaciones[0].detalle).toMatch(/Planta: Puerto Montt → Osorno/);
    });
});

describe('Citaciones Google Calendar y Fechas Operativas (E1 -> E2 -> E3)', () => {
    it('debe construir una URL válida de Google Calendar con tipo de citación e invitado', () => {
        const url = construirUrlGoogleCalendar({
            tipoCitacion: 'Inscripciones a la escuela de buceo',
            fechaHora: '2026-10-25T10:00',
            candidatoNombre: 'Rafael Muñoz',
            candidatoEmail: 'rafael@gmail.com',
            puestoTitulo: 'Buzo Básico',
            planta: 'Puerto Montt',
            evaluador: 'Carolina Díaz',
        });

        expect(url).toContain('https://calendar.google.com/calendar/render?');
        expect(url).toContain('action=TEMPLATE');
        expect(url).toContain('Inscripciones+a+la+escuela+de+buceo');
        expect(url).toContain('add=rafael%40gmail.com');
    });

    it('debe registrar fechas operativas (cierres, vacaciones, mantenimientos, feriados) en el calendario', () => {
        localStorage.clear();
        const lista = registrarFechaEspecialCalendario({
            titulo: 'Cierre de planta por mantención anual',
            tipoEvento: 'Cierres de local',
            fecha: '2026-11-02T08:00',
            planta: 'Castro',
        });

        expect(lista[0].titulo).toBe('Cierre de planta por mantención anual');
        expect(lista[0].tipoEvento).toBe('Cierres de local');
        expect(lista[0].esEventoEspecial).toBe(true);
    });
});
