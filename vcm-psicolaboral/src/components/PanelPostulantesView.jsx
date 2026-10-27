import { useState, useMemo } from "react";


const COLORES_FASE = {
    "en entrevista": {
        fondo: "#e3f2fd",
        texto: "#0d47a1",
        borde: "#90caf9",
        icono: "🗓️",
    },
    "aceptado": {
        fondo: "#e8f5e9",
        texto: "#1b5e20",
        borde: "#a5d6a7",
        icono: "✓",
    },
    "rechazado": {
        fondo: "#ffebee",
        texto: "#b71c1c",
        borde: "#ef9a9a",
        icono: "✕",
    },
    "esperando respuesta": {
        fondo: "#fff8e1",
        texto: "#f57f17",
        borde: "#ffe082",
        icono: "⏳",
    },
};

function PanelPostulantesView({
    puestos = [],
    postulaciones = [],
    onVerDetalle,
    onCambiarFase,
}) {
    // Por defecto muestra todas las postulaciones activas para visibilidad inmediata
    const [puestoSeleccionadoId, setPuestoSeleccionadoId] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [filtroFase, setFiltroFase] = useState("todas");

    // Filtrar postulaciones por el cargo seleccionado
    const postulacionesDelCargo = useMemo(() => {
        if (puestoSeleccionadoId === "todos") return postulaciones;
        const idNum = Number(puestoSeleccionadoId);
        return postulaciones.filter((p) => {
            return (
                p.puestoId === idNum ||
                p.puestoTrabajoId === idNum ||
                p.puestoTitulo?.toLowerCase() === (puestos.find((x) => x.id === idNum)?.titulo || "").toLowerCase()
            );
        });
    }, [postulaciones, puestoSeleccionadoId, puestos]);

    // Filtrar por texto y fase
    const postulacionesFiltradas = useMemo(() => {
        const termino = busqueda.toLowerCase().trim();
        return postulacionesDelCargo.filter((item) => {
            const coincideTexto =
                !termino ||
                item.nombre?.toLowerCase().includes(termino) ||
                item.rut?.toLowerCase().includes(termino) ||
                item.encargado?.toLowerCase().includes(termino);

            const coincideFase =
                filtroFase === "todas" ||
                item.fase?.toLowerCase() === filtroFase.toLowerCase();

            return coincideTexto && coincideFase;
        });
    }, [postulacionesDelCargo, busqueda, filtroFase]);

    // Conteos por fase
    const conteos = useMemo(() => {
        const total = postulacionesDelCargo.length;
        const enEntrevista = postulacionesDelCargo.filter((p) => p.fase === "en entrevista").length;
        const aceptados = postulacionesDelCargo.filter((p) => p.fase === "aceptado").length;
        const rechazados = postulacionesDelCargo.filter((p) => p.fase === "rechazado").length;
        const esperando = postulacionesDelCargo.filter((p) => p.fase === "esperando respuesta").length;
        return { total, enEntrevista, aceptados, rechazados, esperando };
    }, [postulacionesDelCargo]);



    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Barra Superior de Selección de Postulación Activa */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "2px solid #e0e0e0",
                    borderTop: "6px solid #0e97b3",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <h2 style={{ margin: "0 0 6px 0", fontSize: "1.3rem", color: "#1a1a1a" }}>
                            📋 Postulaciones y Entrevistas por Cargo Activo
                        </h2>
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            Selecciona una postulación activa para ver los candidatos en proceso y sus entrevistas agendadas.
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <label htmlFor="selector-puesto-activo" style={{ fontSize: "13px", fontWeight: "bold", color: "#333" }}>
                            Cargo Activo:
                        </label>
                        <select
                            id="selector-puesto-activo"
                            value={puestoSeleccionadoId}
                            onChange={(e) => setPuestoSeleccionadoId(e.target.value)}
                            style={{
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1.5px solid #0e97b3",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                                backgroundColor: "#e0f7fa",
                                cursor: "pointer",
                                minWidth: "260px",
                            }}
                        >
                            <option value="todos">🌐 Todas las Postulaciones Activas</option>
                            {puestos.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.titulo} ({p.planta})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Resumen del cargo y métricas rápidas */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid #eee",
                    }}
                >
                    <div style={{ backgroundColor: "#f8f9fa", padding: "10px 14px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Total Postulantes</span>
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#222" }}>{conteos.total}</div>
                    </div>
                    <div style={{ backgroundColor: "#e3f2fd", padding: "10px 14px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#0d47a1", fontWeight: "600" }}>🗓️ En Entrevista</span>
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#0d47a1" }}>{conteos.enEntrevista}</div>
                    </div>
                    <div style={{ backgroundColor: "#fff8e1", padding: "10px 14px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#f57f17", fontWeight: "600" }}>⏳ Esperando Respuesta</span>
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#f57f17" }}>{conteos.esperando}</div>
                    </div>
                    <div style={{ backgroundColor: "#e8f5e9", padding: "10px 14px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#1b5e20", fontWeight: "600" }}>✓ Aceptados</span>
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#1b5e20" }}>{conteos.aceptados}</div>
                    </div>
                    <div style={{ backgroundColor: "#ffebee", padding: "10px 14px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#b71c1c", fontWeight: "600" }}>✕ Rechazados</span>
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#b71c1c" }}>{conteos.rechazados}</div>
                    </div>
                </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    padding: "16px",
                    border: "1px solid #ddd",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "14px",
                }}
            >
                <div style={{ flex: "1 1 240px" }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, RUT o encargado..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "14px",
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Filtrar por Fase:</span>
                    <select
                        value={filtroFase}
                        onChange={(e) => setFiltroFase(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "13px",
                            backgroundColor: "white",
                        }}
                    >
                        <option value="todas">Todas las Fases</option>
                        <option value="en entrevista">En entrevista</option>
                        <option value="esperando respuesta">Esperando respuesta</option>
                        <option value="aceptado">Aceptado</option>
                        <option value="rechazado">Rechazado</option>
                    </select>
                </div>

                {(busqueda || filtroFase !== "todas") && (
                    <button
                        type="button"
                        onClick={() => {
                            setBusqueda("");
                            setFiltroFase("todas");
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#dc3545",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                        }}
                    >
                        ✕ Limpiar filtros
                    </button>
                )}

                <span style={{ fontSize: "13px", color: "#666", marginLeft: "auto" }}>
                    Mostrando <strong>{postulacionesFiltradas.length}</strong> de {postulacionesDelCargo.length} postulantes
                </span>
            </div>

            {/* TABLA PRINCIPAL DE POSTULANTES: Nombre, Fase, Entrevista, Encargado, Detalle */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    border: "1px solid #e0e0e0",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
            >
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                <th style={{ padding: "14px 16px", fontWeight: "bold", color: "#495057" }}>Nombre</th>
                                <th style={{ padding: "14px 16px", fontWeight: "bold", color: "#495057" }}>Fase</th>
                                <th style={{ padding: "14px 16px", fontWeight: "bold", color: "#495057" }}>Entrevista</th>
                                <th style={{ padding: "14px 16px", fontWeight: "bold", color: "#495057" }}>Encargado</th>
                                <th style={{ padding: "14px 16px", fontWeight: "bold", color: "#495057", textAlign: "center" }}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {postulacionesFiltradas.length > 0 ? (
                                postulacionesFiltradas.map((item) => {
                                    const estiloFase = COLORES_FASE[item.fase?.toLowerCase()] || COLORES_FASE["esperando respuesta"];
                                    return (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: "1px solid #eee",
                                                transition: "background-color 0.15s ease",
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            {/* 1. NOMBRE */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ fontWeight: "600", color: "#212529" }}>{item.nombre}</div>
                                                <div style={{ fontSize: "12px", color: "#6c757d" }}>
                                                    RUT: {item.rut || "Sin RUT"} · {item.puestoTitulo || "Postulación"}
                                                </div>
                                            </td>

                                            {/* 2. FASE */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <span
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "5px",
                                                            padding: "5px 12px",
                                                            borderRadius: "16px",
                                                            fontSize: "12.5px",
                                                            fontWeight: "bold",
                                                            backgroundColor: estiloFase.fondo,
                                                            color: estiloFase.texto,
                                                            border: `1px solid ${estiloFase.borde}`,
                                                            textTransform: "capitalize",
                                                        }}
                                                    >
                                                        <span>{estiloFase.icono}</span>
                                                        <span>{item.fase}</span>
                                                    </span>

                                                    {onCambiarFase && (
                                                        <select
                                                            aria-label={`Cambiar fase de ${item.nombre}`}
                                                            value={item.fase}
                                                            onChange={(e) => onCambiarFase(item.id, e.target.value)}
                                                            style={{
                                                                fontSize: "11px",
                                                                padding: "3px 6px",
                                                                borderRadius: "4px",
                                                                border: "1px solid #ccc",
                                                                color: "#555",
                                                                cursor: "pointer",
                                                                backgroundColor: "#fff",
                                                            }}
                                                            title="Cambiar fase rápidamente"
                                                        >
                                                            <option value="esperando respuesta">esperando respuesta</option>
                                                            <option value="en entrevista">en entrevista</option>
                                                            <option value="aceptado">aceptado</option>
                                                            <option value="rechazado">rechazado</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 3. ENTREVISTA */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#333", fontWeight: "500" }}>
                                                    <span>📅</span>
                                                    <span>{item.entrevista || "Por coordinar"}</span>
                                                </div>
                                            </td>

                                            {/* 4. ENCARGADO */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#495057" }}>
                                                    <span>👤</span>
                                                    <span>{item.encargado || "Sin asignar"}</span>
                                                </div>
                                            </td>

                                            {/* 5. DETALLE */}
                                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => onVerDetalle(item)}
                                                    style={{
                                                        backgroundColor: "#0e97b3",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        padding: "7px 16px",
                                                        fontSize: "12.5px",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                        boxShadow: "0 2px 4px rgba(14, 151, 179, 0.2)",
                                                        transition: "opacity 0.2s ease",
                                                    }}
                                                    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                                                    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                                                >
                                                    Ver Detalle 👁️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
                                        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</div>
                                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>
                                            No se encontraron postulantes para la selección actual.
                                        </p>
                                        <span style={{ fontSize: "13px" }}>
                                            Intenta seleccionar otra postulación activa o restablecer los filtros de búsqueda.
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default PanelPostulantesView;
