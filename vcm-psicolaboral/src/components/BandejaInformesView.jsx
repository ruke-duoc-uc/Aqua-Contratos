/**
 * Componente de Bandeja de Solicitudes de Informes de Candidatos
 * Muestra el listado de informes emitidos por Jefatura, estado de respuestas,
 * nivel de urgencia, fecha límite e indicador de plazo sobrepasado.
 */
import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange";
import Icono from "./Icono";

export default function BandejaInformesView({
    informes = [],
    rolActual = "jefatura",
    onAbrirCrear,
    onVerDetalle,
}) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [filtroUrgencia, setFiltroUrgencia] = useState("todas");
    const [filaExpandida, setFilaExpandida] = useState(null);

    const toggleExpandir = (id) => {
        setFilaExpandida((prev) => (prev === id ? null : id));
    };

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
                return <span style={{ backgroundColor: "#f8d7da", color: "#842029", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>Urgente</span>;
            case "Alta":
                return <span style={{ backgroundColor: "#ffeeba", color: "#856404", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>Alta</span>;
            case "Baja":
                return <span style={{ backgroundColor: "#d1e7dd", color: "#0f5132", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>Baja</span>;
            default:
                return <span style={{ backgroundColor: "#cff4fc", color: "#055160", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px" }}>Media</span>;
        }
    };

    return (
        <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #dbe3eb", borderTop: "4px solid #223b4c", overflow: "hidden", boxShadow: "0 3px 10px rgba(34, 59, 76, 0.05)" }}>
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
                        Solicitudes de Informes y Consultas sobre Candidatos
                    </h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        {esJefe
                            ? "Crea requerimientos para postulantes existentes y formula preguntas a evaluadores y analistas."
                            : "Responde consultas e ingresa comentarios solicitados por la jefatura de área."}
                    </span>
                </div>

                {onAbrirCrear && (
                    <BotonOrange
                        texto="+ Solicitar Informe / Formular Preguntas"
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
                    gridTemplateColumns: "60px 1.8fr 100px 110px 140px 100px 140px",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 16px",
                    backgroundColor: "#223b4c",
                    fontWeight: "bold",
                    color: "white",
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
                    const listaPreguntas = inf.preguntasJefatura?.length ? inf.preguntasJefatura : (inf.preguntas || []);
                    const totalPreguntas = listaPreguntas.length;
                    const totalRespuestas = listaPreguntas.reduce(
                        (acc, p) => acc + (p.respuestas?.length || 0),
                        0
                    ) || 0;

                    const fechaLimiteObj = inf.fechaLimite ? new Date(`${inf.fechaLimite}T23:59:59`) : null;
                    const fueraDePlazo = fechaLimiteObj ? new Date() > fechaLimiteObj : false;
                    const estaExpandida = filaExpandida === inf.id;

                    return (
                        <div key={inf.id} style={{ borderBottom: "1px solid #eee" }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "60px 1.8fr 100px 110px 140px 100px 140px",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 16px",
                                    fontSize: "13px",
                                    backgroundColor: estaExpandida ? "#f0f7ff" : "transparent",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                <span style={{ fontWeight: "bold", color: "#6c757d" }}>#{inf.id}</span>

                                <div>
                                    <strong style={{ color: "#212529", display: "block" }}>
                                        {inf.candidatoNombre || `Candidato #${inf.candidatoId || inf.id}`}
                                    </strong>
                                    <span style={{ fontSize: "11px", color: "#6c757d", display: "block" }}>
                                        Solicitado por: {inf.solicitante || "Jefe de Área"}
                                    </span>
                                    {Array.isArray(inf.destinatarios) && inf.destinatarios.length > 0 && (
                                        <span style={{ fontSize: "10px", color: "#0d6efd", fontWeight: "600", display: "block", marginTop: "2px" }}>
                                            Dirigido a: {inf.destinatarios.map((d) => (d === "analista" ? "Analista" : d === "evaluador" ? "Evaluador" : d)).join(" y ")}
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
                                            [Fuera de plazo]
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleExpandir(inf.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            color: "#0d6efd",
                                            textAlign: "left",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                        title="Ver preguntas en esta fila"
                                    >
                                        <span>{estaExpandida ? "▼" : "▶"}</span>
                                        <span><strong>{totalPreguntas}</strong> preg. · <strong>{totalRespuestas}</strong> resp.</span>
                                    </button>
                                </div>

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

                                <div style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                    <button
                                        type="button"
                                        onClick={() => toggleExpandir(inf.id)}
                                        style={{
                                            backgroundColor: estaExpandida ? "#e7f1ff" : "#f8f9fa",
                                            border: "1px solid #ced4da",
                                            borderRadius: "5px",
                                            padding: "5px 8px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            color: "#333",
                                        }}
                                        title={estaExpandida ? "Ocultar preguntas" : "Desplegar preguntas"}
                                    >
                                        {estaExpandida ? "Ocultar" : "Preguntas"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onVerDetalle(inf)}
                                        style={{
                                            backgroundColor: "#0d6efd",
                                            border: "none",
                                            borderRadius: "5px",
                                            padding: "5px 10px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: "#fff",
                                        }}
                                    >
                                        Detalle
                                    </button>
                                </div>
                            </div>

                            {/* Desplegable de preguntas asociadas directamente en la bandeja */}
                            {estaExpandida && (
                                <div
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        padding: "12px 20px 16px 50px",
                                        borderTop: "1px dashed #d0d7de",
                                    }}
                                >
                                    <div style={{ fontWeight: "bold", fontSize: "13px", color: "#004085", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Icono nombre="message" size={15} />
                                        <span>Preguntas y Respuestas del Informe #{inf.id}:</span>
                                    </div>

                                    {listaPreguntas.length === 0 ? (
                                        <p style={{ margin: 0, fontSize: "12.5px", color: "#6c757d", fontStyle: "italic" }}>
                                            Este informe aún no tiene preguntas formuladas.
                                        </p>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {listaPreguntas.map((preg, pIdx) => (
                                                <div
                                                    key={preg.id || pIdx}
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        border: "1px solid #e1e4e8",
                                                        borderRadius: "6px",
                                                        padding: "10px 12px",
                                                        fontSize: "12.5px",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                        <strong style={{ color: "#0d6efd" }}>
                                                            Pregunta #{pIdx + 1}: {preg.texto}
                                                        </strong>
                                                        <span style={{ fontSize: "11px", color: "#888" }}>
                                                            {preg.fecha ? new Date(preg.fecha).toLocaleDateString("es-CL") : ""}
                                                        </span>
                                                    </div>

                                                    <div style={{ marginTop: "6px", marginLeft: "12px", borderLeft: "2px solid #0d6efd22", paddingLeft: "8px" }}>
                                                        {(preg.respuestas || []).length > 0 ? (
                                                            preg.respuestas.map((r, rIdx) => (
                                                                <div key={r.id || rIdx} style={{ marginTop: "4px", color: "#333" }}>
                                                                    <span style={{ fontWeight: "600", color: "#198754" }}>
                                                                        ↳ {r.autor || r.rol || "Respuesta"}:
                                                                    </span>{" "}
                                                                    <span>{r.texto}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span style={{ color: "#888", fontStyle: "italic", fontSize: "11.5px" }}>
                                                                Sin respuestas aún.
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
                    <p style={{ margin: "0 0 10px 0", fontSize: "15px" }}>
                        No se encontraron solicitudes de informes.
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
