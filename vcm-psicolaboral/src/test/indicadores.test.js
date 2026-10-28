import { describe, it, expect } from 'vitest';

/**
 * Función que replica el cálculo de KPIs implementado en AnalistaPage, EvaluadorPage y JefaturaPage
 */
function calcularIndicadores(candidatos) {
    const pendientes = candidatos.filter(
        (c) => c.estado === "Pendiente" || c.estado === "En revisión"
    ).length;
    const enProceso = candidatos.filter((c) => c.estado === "En proceso").length;
    const finalizadas = candidatos.filter(
        (c) => c.estado === "Finalizado" || c.estado === "Finalizada"
    ).length;

    return [
        { id: 1, titulo: "Candidatos Totales", valor: candidatos.length },
        { id: 2, titulo: "Solicitudes Pendientes", valor: pendientes },
        { id: 3, titulo: "En proceso", valor: enProceso },
        { id: 4, titulo: "Evaluaciones finalizadas", valor: finalizadas },
    ];
}

describe('Lógica de Negocio: Cálculo de Indicadores Operativos (Dashboard KPIs)', () => {
    it('debe calcular métricas en 0 cuando la lista de candidatos está vacía', () => {
        const kpis = calcularIndicadores([]);
        expect(kpis[0].valor).toBe(0); // Totales
        expect(kpis[1].valor).toBe(0); // Pendientes
        expect(kpis[2].valor).toBe(0); // En proceso
        expect(kpis[3].valor).toBe(0); // Finalizadas
    });

    it('debe totalizar y clasificar correctamente según el estado de cada solicitud', () => {
        const datosPrueba = [
            { id: 1, nombre: 'Juan Pérez', estado: 'Pendiente' },
            { id: 2, nombre: 'María Soto', estado: 'En revisión' },
            { id: 3, nombre: 'Carlos Ruiz', estado: 'En proceso' },
            { id: 4, nombre: 'Ana Torres', estado: 'En proceso' },
            { id: 5, nombre: 'Pedro Gómez', estado: 'Finalizada' },
            { id: 6, nombre: 'Lucía Vega', estado: 'Finalizado' },
        ];

        const kpis = calcularIndicadores(datosPrueba);

        expect(kpis[0].valor).toBe(6); // Total
        expect(kpis[1].valor).toBe(2); // Pendientes (Pendiente + En revisión)
        expect(kpis[2].valor).toBe(2); // En proceso
        expect(kpis[3].valor).toBe(2); // Finalizadas (Finalizada + Finalizado)
    });
});
