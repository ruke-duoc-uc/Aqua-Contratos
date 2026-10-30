/**
 * Utilidades de lógica de negocio para Solicitudes e Indicadores (KPIs)
 * Centraliza el cálculo de métricas del Dashboard y el filtrado multicriterio
 * utilizado en las vistas de Analista, Evaluador y Jefatura.
 */

/**
 * Calcula los 4 indicadores principales (KPIs) del Dashboard Operativo
 * a partir del arreglo de candidatos/solicitudes.
 * @param {Array} candidatos
 * @returns {Array<{id: number, titulo: string, valor: number}>}
 */
export function calcularIndicadores(candidatos = []) {
    const lista = Array.isArray(candidatos) ? candidatos : [];
    const pendientes = lista.filter(
        (c) => c.estado === "Pendiente" || c.estado === "En revisión"
    ).length;
    const enProceso = lista.filter((c) => c.estado === "En proceso").length;
    const finalizadas = lista.filter(
        (c) => c.estado === "Finalizado" || c.estado === "Finalizada"
    ).length;

    return [
        { id: 1, titulo: "Candidatos Totales", valor: lista.length },
        { id: 2, titulo: "Solicitudes Pendientes", valor: pendientes },
        { id: 3, titulo: "En proceso", valor: enProceso },
        { id: 4, titulo: "Evaluaciones finalizadas", valor: finalizadas },
    ];
}

/**
 * Filtra reactivamente la lista de candidatos/solicitudes según término de búsqueda,
 * estado, planta acuícola y evaluador responsable.
 * @param {Array} candidatos
 * @param {Object} filtros
 * @returns {Array}
 */
export function aplicarFiltros(
    candidatos = [],
    {
        busqueda = "",
        filtroEstado = "todos",
        filtroPlanta = "todas",
        filtroEvaluador = "todos",
    } = {}
) {
    const lista = Array.isArray(candidatos) ? candidatos : [];
    const termino = busqueda.toLowerCase().trim();

    return lista.filter((c) => {
        const coincideTexto =
            !termino ||
            (c.nombre && c.nombre.toLowerCase().includes(termino)) ||
            (c.rut && c.rut.toLowerCase().includes(termino)) ||
            (c.cargo && c.cargo.toLowerCase().includes(termino)) ||
            (c.especialidad && c.especialidad.toLowerCase().includes(termino)) ||
            (c.evaluador && c.evaluador.toLowerCase().includes(termino));

        const coincideEstado =
            filtroEstado === "todos" ||
            (c.estado && c.estado.toLowerCase() === filtroEstado.toLowerCase());

        const coincidePlanta =
            filtroPlanta === "todas" ||
            (c.planta && c.planta.toLowerCase() === filtroPlanta.toLowerCase());

        const coincideEvaluador =
            filtroEvaluador === "todos" ||
            (c.evaluador && c.evaluador.toLowerCase() === filtroEvaluador.toLowerCase());

        return coincideTexto && coincideEstado && coincidePlanta && coincideEvaluador;
    });
}
