/** Barra de Búsqueda y Filtros de Solicitudes (RF07)
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
        <div className="filtros-barra-contenedor">
            {/* Buscador por texto libre */}
            <div className="buscador-input-wrapper">
                <input
                    type="text"
                    className="buscador-input"
                    placeholder="Buscar por nombre, RUT o cargo..."
                    value={busqueda}
                    onChange={(e) => onBusquedaChange(e.target.value)}
                    aria-label="Buscar solicitudes"
                />
            </div>

            {/* Selector de filtro por Estado */}
            <select
                className="filtro-select"
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

            {/* Selector de filtro por Planta */}
            <select
                className="filtro-select"
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

            {/* Selector de filtro por Evaluador */}
            {evaluadoresDisponibles.length > 0 && (
                <select
                    className="filtro-select"
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
            )}

            {/* Botón para restablecer filtros si hay alguno aplicado */}
            {hayFiltrosActivos && (
                <button
                    type="button"
                    className="boton-limpiar-filtros"
                    onClick={onLimpiarFiltros}
                    title="Restablecer filtros"
                >
                    Limpiar filtros
                </button>
            )}

            {/* Contador de registros filtrados */}
            <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "auto" }}>
                Mostrando <strong>{totalResultados}</strong> de {totalOriginal} solicitudes
            </span>
        </div>
    );
}

export default BarraFiltros;
