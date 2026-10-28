/** Barra de Búsqueda y Filtros de Solicitudes con Bootstrap 5
 * @Autor Amaro Villalobos
 * Permite filtrar en tiempo real por término de búsqueda (nombre, RUT, cargo),
 * estado de la solicitud, planta de AquaChile y evaluador asignado.
 **/

function BarraFiltros({
    busqueda,
    onBusquedaChange,
    filtroEstado,
    onFiltroEstadoChange,
    filtroPlanta,
    onFiltroPlantaChange,
    filtroEvaluador,
    onFiltroEvaluadorChange,
    plantasDisponibles = [],
    evaluadoresDisponibles = [],
    totalResultados,
    totalOriginal,
    onLimpiarFiltros,
}) {
    const hayFiltrosActivos =
        busqueda.trim() !== "" ||
        filtroEstado !== "todos" ||
        filtroPlanta !== "todas" ||
        (filtroEvaluador && filtroEvaluador !== "todos");

    return (
        <div className="filtros-barra-contenedor bg-light p-3 border-bottom d-flex flex-wrap gap-2 align-items-center">
            {/* Buscador por texto libre */}
            <div className="buscador-input-wrapper flex-grow-1" style={{ minWidth: "220px" }}>
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="🔍 Buscar por nombre, RUT o cargo..."
                    value={busqueda}
                    onChange={(e) => onBusquedaChange(e.target.value)}
                    aria-label="Buscar solicitudes"
                />
            </div>

            {/* Selector de filtro por Estado */}
            <div style={{ minWidth: "150px" }}>
                <select
                    className="form-select form-select-sm"
                    value={filtroEstado}
                    onChange={(e) => onFiltroEstadoChange(e.target.value)}
                    aria-label="Filtrar por estado"
                >
                    <option value="todos">Todos los Estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En revisión">En revisión</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Finalizado">Finalizado</option>
                </select>
            </div>

            {/* Selector de filtro por Planta */}
            <div style={{ minWidth: "150px" }}>
                <select
                    className="form-select form-select-sm"
                    value={filtroPlanta}
                    onChange={(e) => onFiltroPlantaChange(e.target.value)}
                    aria-label="Filtrar por planta"
                >
                    <option value="todas">Todas las Plantas</option>
                    {plantasDisponibles.map((planta) => (
                        <option key={planta} value={planta}>
                            {planta}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selector de filtro por Evaluador */}
            {evaluadoresDisponibles.length > 0 && (
                <div style={{ minWidth: "170px" }}>
                    <select
                        className="form-select form-select-sm"
                        value={filtroEvaluador || "todos"}
                        onChange={(e) => onFiltroEvaluadorChange(e.target.value)}
                        aria-label="Filtrar por evaluador"
                    >
                        <option value="todos">Todos los Evaluadores</option>
                        {evaluadoresDisponibles.map((ev) => (
                            <option key={ev} value={ev}>
                                {ev}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Botón para restablecer filtros si hay alguno aplicado */}
            {hayFiltrosActivos && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onLimpiarFiltros}
                    title="Restablecer filtros"
                >
                    ✕ Limpiar filtros
                </button>
            )}

            {/* Contador de registros filtrados */}
            <span className="text-muted small ms-auto">
                Mostrando <strong>{totalResultados}</strong> de {totalOriginal} solicitudes
            </span>
        </div>
    );
}

export default BarraFiltros;
