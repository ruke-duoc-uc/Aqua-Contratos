import { describe, it, expect } from 'vitest';
import { aplicarFiltros } from '../utils/solicitudesUtils';

const datosMock = [
    { id: 1, nombre: 'Valentina Silva', rut: '18.234.567-8', cargo: 'Operario de Planta', especialidad: 'Producción', planta: 'Puerto Montt', evaluador: 'Amaro Villalobos Caseres', estado: 'Pendiente' },
    { id: 2, nombre: 'Diego Morales', rut: '19.876.543-2', cargo: 'Técnico Electromecánico', especialidad: 'Mantenimiento', planta: 'Calbuco', evaluador: 'Carolina Díaz Núñez', estado: 'En proceso' },
    { id: 3, nombre: 'Camila Rojas', rut: '17.456.789-0', cargo: 'Analista de Calidad', especialidad: 'Laboratorio', planta: 'Puerto Montt', evaluador: 'Felipe Muñoz Parra', estado: 'Finalizada' },
    { id: 4, nombre: 'Esteban Paredes', rut: '16.789.012-3', cargo: 'Supervisor Faena', especialidad: 'Operaciones', planta: 'Castro', evaluador: 'Amaro Villalobos Caseres', estado: 'Pendiente' },
];

describe('Lógica de Negocio: Búsqueda y Filtros de Solicitudes', () => {
    it('debe devolver todas las solicitudes si no hay filtros activos', () => {
        const resultado = aplicarFiltros(datosMock, {});
        expect(resultado).toHaveLength(4);
    });

    it('debe filtrar correctamente por búsqueda de texto (nombre)', () => {
        const resultado = aplicarFiltros(datosMock, { busqueda: 'diego' });
        expect(resultado).toHaveLength(1);
        expect(resultado[0].nombre).toBe('Diego Morales');
    });

    it('debe filtrar correctamente por búsqueda de texto (RUT)', () => {
        const resultado = aplicarFiltros(datosMock, { busqueda: '18.234' });
        expect(resultado).toHaveLength(1);
        expect(resultado[0].nombre).toBe('Valentina Silva');
    });

    it('debe filtrar correctamente por estado', () => {
        const resultado = aplicarFiltros(datosMock, { filtroEstado: 'Pendiente' });
        expect(resultado).toHaveLength(2);
        expect(resultado.every(c => c.estado === 'Pendiente')).toBe(true);
    });

    it('debe filtrar correctamente por planta', () => {
        const resultado = aplicarFiltros(datosMock, { filtroPlanta: 'Puerto Montt' });
        expect(resultado).toHaveLength(2);
        expect(resultado.every(c => c.planta === 'Puerto Montt')).toBe(true);
    });

    it('debe combinar múltiples filtros simultáneamente', () => {
        const resultado = aplicarFiltros(datosMock, {
            filtroPlanta: 'Puerto Montt',
            filtroEstado: 'Pendiente',
        });
        expect(resultado).toHaveLength(1);
        expect(resultado[0].nombre).toBe('Valentina Silva');
    });
});
