/**
 * Componente de Bandeja de Solicitudes de Informes de Candidatos
 * Muestra el listado de informes emitidos por Jefatura, estado de respuestas,
 * nivel de urgencia, fecha límite e indicador de plazo sobrepasado.
 */
import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange";

export default function BandejaInformesView({
    informes = [],
    rolActual = "jefatura",
    onAbrirCrear,
    onVerDetalle,
}) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [filtroUrgencia, setFiltroUrgencia] = useState("todas");

    const esJefe = rolActual === "jefatura";

    const informesFiltrados = useMemo(() => {
        return informes.filter((inf) => {
            // Analistas y Evaluadores solo ven las solicitudes donde figuran como destinatarios
            const asignadoARol = esJefe || (Array.isArray(inf.destinatarios) && inf.destinatarios.includes(rolActual));
            if (!asignadoARol) return false;

            const termino = busqueda.toLowerCase().trim();
            const coincideTexto =
                !termino ||
                inf.candidatoNombre?.toLowerCase().includes(termino) ||
                inf.solicitante?.toLowerCase().includes(termino) ||
                inf.preguntas?.some((p) => p.texto?.toLowerCase().includes(termino));

            const coincideEstado =
                filtroEstado === "todos" ||
                inf.estado?.toLowerCase() === filtroEstado.toLowerCase();

            const coincideUrgencia =
                filtroUrgencia === "todas" ||
                inf.urgencia?.toLowerCase() === filtroUrgencia.toLowerCase();

            return coincideTexto && coincideEstado && coincideUrgencia;
        });
    }, [informes, busqueda, filtroEstado, filtroUrgencia, esJefe, rolActual]);

    const obtenerBadgeUrgencia = (urg) => {
        switch (urg) {
            case "Urgente":
                return <span style={{ backgroundColor: "#f8d7da", color: "#842029", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>🔴 Urgente</span>;
            case "Alta":
                return <span style={{ backgroundColor: "#ffeeba", color: "#856404", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>🟠 Alta</span>;
            case "Baja":
                return <span style={{ backgroundColor: "#d1e7dd", color: "#0f5132", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>🟢 Baja</span>;
            default:
                return <span style={{ backgroundColor: "#cff4fc", color: "#055160", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>🟡 Media</span>;
        }
    };

    return (
        <div style={{ backgroundColor: "white", borderRadius: "10px", border: "2px solid gray", overflow: "hidden" }}>
            {/* Cabecera */}
            <div
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#212529" }}>
                        📑 Solicitudes de Informes y Consultas sobre Candidatos
                    </h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        {esJefe
                            ? "Crea requerimientos para postulantes existentes y formula preguntas a evaluadores y analistas."
                            : "Responde consultas e ingresa comentarios solicitados por la jefatura de área."}
                    </span>
                </div>

                {esJefe && (
                    <BotonOrange
                        texto="+ Solicitar Informe de Candidato"
                        onClick={onAbrirCrear}
                    />
                )}
            </div>

            {/* Barra de Filtros */}
            <div
                style={{
                    padding: "12px 20px",
                    backgroundColor: "#f8f9fa",
                    borderBottom: "1px solid #dee2e6",
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <div style={{ flex: 1, minWidth: "220px" }}>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por candidato, pregunta o solicitante..."
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "5px",
                            border: "1px solid #ced4da",
                            fontSize: "13px",
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#495057" }}>
                        Urgencia:
                    </label>
                    <select
                        value={filtroUrgencia}
                        onChange={(e) => setFiltroUrgencia(e.target.value)}
                        style={{ padding: "7px 10px", borderRadius: "5px", border: "1px solid #ced4da", fontSize: "13px" }}
                    >
                        <option value="todas">Todas</option>
                        <option value="Urgente">Urgente</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#495057" }}>
                        Estado:
                    </label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        style={{ padding: "7px 10px", borderRadius: "5px", border: "1px solid #ced4da", fontSize: "13px" }}
                    >
                        <option value="todos">Todos</option>
                        <option value="Abierta">Abierta</option>
                        <option value="Cerrada">Cerrada</option>
                    </select>
                </div>

                {(busqueda || filtroEstado !== "todos" || filtroUrgencia !== "todas") && (
                    <button
                        type="button"
                        onClick={() => {
                            setBusqueda("");
                            setFiltroEstado("todos");
                            setFiltroUrgencia("todas");
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#0d6efd",
                            cursor: "pointer",
                            fontSize: "13px",
                            textDecoration: "underline",
                        }}
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Cabecera de Tabla */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1.8fr 100px 110px 130px 100px 120px",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 16px",
                    backgroundColor: "#CDCDCD",
                    fontWeight: "bold",
                    color: "#495057",
                    fontSize: "13px",
                }}
            >
                <span>ID</span>
                <span>Candidato</span>
                <span>Urgencia</span>
                <span>Fecha Límite</span>
                <span>Consultas / Resp.</span>
                <span>Estado</span>
                <span style={{ textAlign: "right" }}>Acción</span>
            </div>

            {/* Filas */}
            {informesFiltrados.length > 0 ? (
                informesFiltrados.map((inf) => {
                    const totalPreguntas = inf.preguntas?.length || 0;
                    const totalRespuestas = inf.preguntas?.reduce(
                        (acc, p) => acc + (p.respuestas?.length || 0),
                        0
                    ) || 0;

                    const fechaLimiteObj = inf.fechaLimite ? new Date(`${inf.fechaLimite}T23:59:59`) : null;
                    const fueraDePlazo = fechaLimiteObj ? new Date() > fechaLimiteObj : false;

                    return (
                        <div
                            key={inf.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "60px 1.8fr 100px 110px 130px 100px 120px",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 16px",
                                borderBottom: "1px solid #eee",
                                fontSize: "13px",
                            }}
                        >
                            <span style={{ fontWeight: "bold", color: "#6c757d" }}>#{inf.id}</span>

                            <div>
                                <strong style={{ color: "#212529", display: "block" }}>
                                    {inf.candidatoNombre}
                                </strong>
                                <span style={{ fontSize: "11px", color: "#6c757d", display: "block" }}>
                                    Solicitado por: {inf.solicitante}
                                </span>
                                {Array.isArray(inf.destinatarios) && inf.destinatarios.length > 0 && (
                                    <span style={{ fontSize: "10px", color: "#0d6efd", fontWeight: "600", display: "block", marginTop: "2px" }}>
                                        🎯 Dirigido a: {inf.destinatarios.map((d) => (d === "analista" ? "Analista" : d === "evaluador" ? "Evaluador" : d)).join(" y ")}
                                    </span>
                                )}
                            </div>

                            <div>{obtenerBadgeUrgencia(inf.urgencia)}</div>

                            <div>
                                <span>{inf.fechaLimite || "—"}</span>
                                {fueraDePlazo && (
                                    <span
                                        style={{
                                            display: "block",
                                            fontSize: "10px",
                                            color: "#dc3545",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        ⚠️ Fuera de plazo
                                    </span>
                                )}
                            </div>

                            <span style={{ fontSize: "12px", color: "#495057" }}>
                                <strong>{totalPreguntas}</strong> preg. · <strong>{totalRespuestas}</strong> resp.
                            </span>

                            <div>
                                <span
                                    style={{
                                        backgroundColor: inf.estado === "Abierta" ? "#d1e7dd" : "#e2e3e5",
                                        color: inf.estado === "Abierta" ? "#0f5132" : "#495057",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {inf.estado}
                                </span>
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <button
                                    type="button"
                                    onClick={() => onVerDetalle(inf)}
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        border: "1px solid #ced4da",
                                        borderRadius: "5px",
                                        padding: "5px 10px",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        color: "#0d6efd",
                                    }}
                                >
                                    {esJefe ? "Ver / Repreguntar" : "Ver / Responder"}
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
                    <p style={{ margin: "0 0 10px 0", fontSize: "15px" }}>
                        🔍 No se encontraron solicitudes de informes.
                    </p>
                    {esJefe && (
                        <BotonOrange
                            texto="+ Emitir la primera solicitud de informe"
                            onClick={onAbrirCrear}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
