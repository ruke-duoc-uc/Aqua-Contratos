import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IndicadorCard from '../components/IndicadorCard';
import AlertaExitoCerrable from '../components/AlertaExitoCerrable';
import BarraFiltros from '../components/BarraFiltros';

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
