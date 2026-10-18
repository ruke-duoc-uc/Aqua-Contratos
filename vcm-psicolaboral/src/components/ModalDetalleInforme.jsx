/**
 * Modal Detalle de Solicitud de Informe (Visualización y Respuestas en Split View)
 * Permite ver el perfil del candidato a la izquierda, y a la derecha:
 * - Preguntas del Jefe
 * - Respuestas de Analistas y Evaluadores
 * - Opción para el Jefe de formular repreguntas / nuevas preguntas
 * - Indicador visual de plazo (permite sobrepasarse)
 */
import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange";

export default function ModalDetalleInforme({
    isOpen,
    informe,
    candidatos = [],
    rolActual,
    onCerrar,
    onAgregarPregunta,
    onAgregarRespuesta,
    onCambiarEstado,
}) {
    const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState("");
    const [respuestasInputs, setRespuestasInputs] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState("");

    const candidato = useMemo(() => {
        if (!informe) return null;
        if (informe.candidatoPerfil) return informe.candidatoPerfil;
        return candidatos.find((c) => Number(c.id) === Number(informe.candidatoId)) || null;
    }, [informe, candidatos]);

    if (!isOpen || !informe) return null;

    const fechaLimiteObj = informe.fechaLimite ? new Date(`${informe.fechaLimite}T23:59:59`) : null;
    const fueraDePlazo = fechaLimiteObj ? new Date() > fechaLimiteObj : false;

    const esJefe = rolActual === "jefatura";
    const puedeRepreguntar = esJefe && informe.estado === "Abierta";
    const esDestinatario = Array.isArray(informe.destinatarios) && informe.destinatarios.includes(rolActual);
    const puedeResponder = !esJefe && informe.estado === "Abierta" && esDestinatario;

    const handleCambiarInputRespuesta = (preguntaId, valor) => {
        setRespuestasInputs({
            ...respuestasInputs,
            [preguntaId]: valor,
        });
    };

    const handleEnviarRespuesta = async (preguntaId) => {
        const texto = respuestasInputs[preguntaId]?.trim();
        if (!texto) return;

        setEnviando(true);
        try {
            const autor =
                rolActual === "evaluador"
                    ? "Carolina Díaz (Evaluador)"
                    : rolActual === "analista"
                    ? "Amaro Villalobos (Analista)"
                    : "Usuario Sistema";

            await onAgregarRespuesta(informe.id, preguntaId, {
                autor,
                rol: rolActual,
                texto,
            });

            setRespuestasInputs({
                ...respuestasInputs,
                [preguntaId]: "",
            });
            setMensajeExito("Respuesta registrada.");
            setTimeout(() => setMensajeExito(""), 2500);
        } finally {
            setEnviando(false);
        }
    };

    const handleEnviarNuevaPregunta = async (e) => {
        e.preventDefault();
        if (!nuevaPreguntaTexto.trim()) return;

        setEnviando(true);
        try {
            await onAgregarPregunta(informe.id, {
                texto: nuevaPreguntaTexto.trim(),
                creadaPor: "Jefe de Área",
            });
            setNuevaPreguntaTexto("");
            setMensajeExito("Pregunta enviada exitosamente.");
            setTimeout(() => setMensajeExito(""), 2500);
        } finally {
            setEnviando(false);
        }
    };

    const handleToggleEstado = async () => {
        const nuevoEstado = informe.estado === "Abierta" ? "Cerrada" : "Abierta";
        await onCambiarEstado(informe.id, nuevoEstado);
    };

    const obtenerBadgeUrgencia = (urg) => {
        switch (urg) {
            case "Urgente":
                return <span style={{ backgroundColor: "#f8d7da", color: "#842029", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>🔴 Urgente</span>;
            case "Alta":
                return <span style={{ backgroundColor: "#ffeeba", color: "#856404", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>🟠 Alta</span>;
            case "Baja":
                return <span style={{ backgroundColor: "#d1e7dd", color: "#0f5132", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>🟢 Baja</span>;
            default:
                return <span style={{ backgroundColor: "#cff4fc", color: "#055160", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>🟡 Media</span>;
        }
    };

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div
                className="modal-contenido"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                style={{ maxWidth: "960px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            >
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h3 style={{ margin: 0 }}>
                                Solicitud de Informe #{informe.id}
                            </h3>
                            {obtenerBadgeUrgencia(informe.urgencia)}
                            <span
                                style={{
                                    backgroundColor: informe.estado === "Abierta" ? "#d1e7dd" : "#e2e3e5",
                                    color: informe.estado === "Abierta" ? "#0f5132" : "#495057",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                }}
                            >
                                {informe.estado === "Abierta" ? "● Abierta" : "✓ Cerrada"}
                            </span>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--color-texto-atenuado, #666)" }}>
                            Candidato: {informe.candidatoNombre} · Solicitado por: {informe.solicitante}
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {rolActual === "jefatura" && (
                            <button
                                type="button"
                                onClick={handleToggleEstado}
                                style={{
                                    backgroundColor: informe.estado === "Abierta" ? "#6c757d" : "#198754",
                                    color: "#fff",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                {informe.estado === "Abierta" ? "Cerrar Solicitud" : "Reabrir Solicitud"}
                            </button>
                        )}
                        <button type="button" className="modal-cerrar-btn" onClick={onCerrar} aria-label="Cerrar modal">
                            ×
                        </button>
                    </div>
                </div>

                {/* Body en Split View */}
                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                    {mensajeExito && (
                        <div style={{ backgroundColor: "#d1e7dd", color: "#0f5132", padding: "8px 12px", borderRadius: "5px", marginBottom: "12px", fontSize: "13px" }}>
                            ✓ {mensajeExito}
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "20px" }}>
                        {/* PANEL IZQUIERDO: FICHA COMPLETA DEL CANDIDATO */}
                        <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "8px", padding: "16px", height: "fit-content" }}>
                            <h4 style={{ margin: "0 0 12px 0", color: "#004085", borderBottom: "2px solid #b8daff", paddingBottom: "6px" }}>
                                👤 Perfil del Candidato
                            </h4>

                            {candidato ? (
                                <div style={{ fontSize: "13px", lineHeight: "1.7" }}>
                                    <div style={{ fontSize: "15px", fontWeight: "bold", color: "#212529", marginBottom: "4px" }}>
                                        {candidato.nombre}
                                    </div>
                                    <div><strong>RUT:</strong> {candidato.rut}</div>
                                    <div><strong>Cargo:</strong> {candidato.cargo}</div>
                                    <div><strong>Familia de Cargo:</strong> {candidato.familiaCargo || "General"}</div>
                                    <div><strong>Planta:</strong> {candidato.planta}</div>
                                    <div><strong>Especialidad:</strong> {candidato.especialidad}</div>
                                    <div><strong>Evaluador:</strong> {candidato.evaluador}</div>
                                    <div>
                                        <strong>Estado Evaluación:</strong>{" "}
                                        <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "#e2e3e5", fontSize: "11px", fontWeight: "bold" }}>
                                            {candidato.estado}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Dictamen Psicolaboral:</strong>{" "}
                                        <span style={{ fontWeight: "bold", color: candidato.resultadoPsicologico?.includes("Recomendado") ? "#0f5132" : "#6c757d" }}>
                                            {candidato.resultadoPsicologico || "Pendiente"}
                                        </span>
                                    </div>

                                    {candidato.antecedentes && (
                                        <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e9ecef" }}>
                                            <strong style={{ fontSize: "12px", color: "#495057", display: "block" }}>Antecedentes:</strong>
                                            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                                                {candidato.antecedentes}
                                            </p>
                                        </div>
                                    )}

                                    {candidato.conclusiones && (
                                        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e9ecef" }}>
                                            <strong style={{ fontSize: "12px", color: "#495057", display: "block" }}>Conclusiones de la Evaluación:</strong>
                                            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                                                {candidato.conclusiones}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p style={{ fontSize: "13px", color: "#6c757d" }}>Cargando perfil del candidato...</p>
                            )}
                        </div>

                        {/* PANEL DERECHO: HILO DE PREGUNTAS Y COMENTARIOS */}
                        <div>
                            {/* Barra de Plazo / Límite */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 12px",
                                    backgroundColor: fueraDePlazo ? "#fff3cd" : "#e8f4fd",
                                    borderRadius: "6px",
                                    border: `1px solid ${fueraDePlazo ? "#ffeeba" : "#b6d4fe"}`,
                                    marginBottom: "16px",
                                    fontSize: "12px",
                                }}
                            >
                                <div>
                                    <strong>Fecha Límite Estimada:</strong>{" "}
                                    {informe.fechaLimite || "Sin fecha fija"}
                                </div>
                                {fueraDePlazo ? (
                                    <span style={{ color: "#856404", fontWeight: "bold" }}>
                                        ⚠️ Límite sobrepasado (Se permite seguir respondiendo)
                                    </span>
                                ) : (
                                    <span style={{ color: "#0d6efd", fontWeight: "bold" }}>
                                        ✓ En plazo
                                    </span>
                                )}
                            </div>

                            {/* Listado de Preguntas y Respuestas */}
                            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>
                                💬 Preguntas y Comentarios Consolidados ({informe.preguntas?.length || 0})
                            </h4>

                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                {(informe.preguntas || []).map((pregunta, index) => (
                                    <div
                                        key={pregunta.id || index}
                                        style={{
                                            border: "1px solid #ced4da",
                                            borderRadius: "8px",
                                            padding: "12px",
                                            backgroundColor: "#ffffff",
                                        }}
                                    >
                                        {/* Encabezado Pregunta */}
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#0d6efd" }}>
                                                Pregunta #{index + 1} de Jefatura
                                            </span>
                                            <span style={{ fontSize: "11px", color: "#888" }}>
                                                {new Date(pregunta.fecha).toLocaleDateString("es-CL")}
                                            </span>
                                        </div>

                                        <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#212529", fontWeight: "500" }}>
                                            {pregunta.texto}
                                        </p>

                                        {/* Respuestas registradas */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "12px", borderLeft: "2px solid #e9ecef", paddingLeft: "10px" }}>
                                            {(pregunta.respuestas || []).length > 0 ? (
                                                pregunta.respuestas.map((resp, rIdx) => (
                                                    <div
                                                        key={resp.id || rIdx}
                                                        style={{
                                                            backgroundColor: "#f8f9fa",
                                                            borderRadius: "6px",
                                                            padding: "8px 10px",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                                            <strong>
                                                                {resp.autor}{" "}
                                                                <span
                                                                    style={{
                                                                        fontSize: "10px",
                                                                        padding: "1px 5px",
                                                                        borderRadius: "3px",
                                                                        backgroundColor: resp.rol === "evaluador" ? "#cfe2ff" : "#d1e7dd",
                                                                        color: resp.rol === "evaluador" ? "#084298" : "#0f5132",
                                                                    }}
                                                                >
                                                                    {resp.rol}
                                                                </span>
                                                            </strong>
                                                            <span style={{ color: "#999", fontSize: "11px" }}>
                                                                {new Date(resp.fecha).toLocaleDateString("es-CL")}
                                                            </span>
                                                        </div>
                                                        <p style={{ margin: 0, color: "#495057" }}>{resp.texto}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: "12px", color: "#6c757d", fontStyle: "italic" }}>
                                                    Pendiente de respuesta por evaluadores o analistas.
                                                </span>
                                            )}

                                            {/* Formulario para responder la pregunta (Solo Analistas o Evaluadores asignados como destinatarios) */}
                                            {puedeResponder ? (
                                                <div style={{ marginTop: "6px", display: "flex", gap: "8px" }}>
                                                    <input
                                                        type="text"
                                                        value={respuestasInputs[pregunta.id] || ""}
                                                        onChange={(e) => handleCambiarInputRespuesta(pregunta.id, e.target.value)}
                                                        placeholder={`Escribir respuesta como ${rolActual === "analista" ? "Analista" : "Evaluador"}...`}
                                                        style={{
                                                            flex: 1,
                                                            padding: "6px 10px",
                                                            borderRadius: "4px",
                                                            border: "1px solid #ced4da",
                                                            fontSize: "12px",
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleEnviarRespuesta(pregunta.id);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEnviarRespuesta(pregunta.id)}
                                                        disabled={enviando || !respuestasInputs[pregunta.id]?.trim()}
                                                        style={{
                                                            backgroundColor: "#198754",
                                                            color: "#fff",
                                                            border: "none",
                                                            padding: "6px 12px",
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            cursor: "pointer",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        Responder
                                                    </button>
                                                </div>
                                            ) : !esJefe && !esDestinatario ? (
                                                <div style={{ marginTop: "6px", fontSize: "11px", color: "#6c757d", fontStyle: "italic" }}>
                                                    🔒 Solicitud dirigida exclusivamente a: {informe.destinatarios?.map((d) => (d === "analista" ? "Analista" : d === "evaluador" ? "Evaluador" : d)).join(" y ") || "otro rol"}.
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Formulario de Repregunta para Jefatura */}
                            {puedeRepreguntar && (
                                <form
                                    onSubmit={handleEnviarNuevaPregunta}
                                    style={{
                                        marginTop: "18px",
                                        padding: "12px",
                                        backgroundColor: "#f0f8ff",
                                        borderRadius: "8px",
                                        border: "1px dashed #0d6efd",
                                    }}
                                >
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#084298", marginBottom: "6px" }}>
                                        ➕ Formular Nueva Pregunta (Jefe de Área):
                                    </label>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <textarea
                                            rows={2}
                                            value={nuevaPreguntaTexto}
                                            onChange={(e) => setNuevaPreguntaTexto(e.target.value)}
                                            placeholder="Ingresa una nueva pregunta o repregunta para el equipo..."
                                            style={{
                                                flex: 1,
                                                padding: "8px",
                                                borderRadius: "5px",
                                                border: "1px solid #ced4da",
                                                fontSize: "13px",
                                                resize: "vertical",
                                            }}
                                        />
                                        <BotonOrange type="submit" disabled={enviando || !nuevaPreguntaTexto.trim()}>
                                            Enviar Pregunta
                                        </BotonOrange>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ borderTop: "1px solid #dee2e6", padding: "10px 20px", display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" className="boton-orange-secundario" onClick={onCerrar}>
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    );
}
