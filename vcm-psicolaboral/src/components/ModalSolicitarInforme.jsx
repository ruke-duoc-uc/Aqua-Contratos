/**
 * Modal para que Jefatura cree una nueva Solicitud de Informe sobre un candidato existente.
 * Permite visualizar el perfil del candidato seleccionado en un panel lateral,
 * configurar urgencia, fecha límite estimada y agregar múltiples preguntas dinámicas.
 */
import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange";

export default function ModalSolicitarInforme({
    isOpen,
    candidatos = [],
    onCerrar,
    onCrear,
}) {
    const [candidatoId, setCandidatoId] = useState(candidatos[0]?.id || "");
    const [urgencia, setUrgencia] = useState("Media");

    // Fecha límite sugerida (7 días en el futuro)
    const [fechaLimite, setFechaLimite] = useState(() => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 7);
        return fecha.toISOString().split("T")[0];
    });

    const [destinatarios, setDestinatarios] = useState(["analista", "evaluador"]);
    const [preguntas, setPreguntas] = useState([""]);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const candidatoSeleccionado = useMemo(() => {
        return candidatos.find((c) => Number(c.id) === Number(candidatoId)) || candidatos[0] || null;
    }, [candidatos, candidatoId]);

    if (!isOpen) return null;

    const handleAgregarPregunta = () => {
        setPreguntas([...preguntas, ""]);
    };

    const handleCambiarPregunta = (index, valor) => {
        const nuevas = [...preguntas];
        nuevas[index] = valor;
        setPreguntas(nuevas);
    };

    const handleEliminarPregunta = (index) => {
        if (preguntas.length <= 1) return;
        setPreguntas(preguntas.filter((_, i) => i !== index));
    };

    const handleToggleDestinatario = (rol) => {
        if (destinatarios.includes(rol)) {
            if (destinatarios.length === 1) return; // Mínimo un destinatario
            setDestinatarios(destinatarios.filter((r) => r !== rol));
        } else {
            setDestinatarios([...destinatarios, rol]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!candidatoSeleccionado) {
            setError("Debes seleccionar un candidato existente.");
            return;
        }

        const preguntasValidas = preguntas.map((p) => p.trim()).filter(Boolean);
        if (preguntasValidas.length === 0) {
            setError("Debes ingresar al menos una pregunta para el informe.");
            return;
        }

        setGuardando(true);
        try {
            await onCrear({
                candidatoId: candidatoSeleccionado.id,
                candidatoNombre: candidatoSeleccionado.nombre,
                urgencia,
                fechaLimite,
                destinatarios,
                preguntas: preguntasValidas,
                solicitante: "Jefe de Área",
            });
            onCerrar();
        } catch (err) {
            setError(err.message || "Error al crear la solicitud de informe.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div
                className="modal-contenido"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                style={{ maxWidth: "900px", width: "95%" }}
            >
                <div className="modal-header">
                    <div>
                        <h3 style={{ margin: 0 }}>Nueva Solicitud de Informe</h3>
                        <span style={{ fontSize: "12px", color: "var(--color-texto-atenuado, #666)" }}>
                            Jefatura de Área · Solicitar aclaraciones o información adicional a analistas y evaluadores
                        </span>
                    </div>
                    <button type="button" className="modal-cerrar-btn" onClick={onCerrar} aria-label="Cerrar modal">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div style={{ backgroundColor: "#f8d7da", color: "#842029", padding: "10px", borderRadius: "6px", marginBottom: "15px", fontSize: "13px" }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "20px" }}>
                            {/* PANEL IZQUIERDO: PERFIL DEL CANDIDATO SELECCIONADO */}
                            <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "8px", padding: "16px" }}>
                                <label style={{ display: "block", fontWeight: "bold", fontSize: "13px", marginBottom: "6px" }}>
                                    Seleccionar Candidato Existente:
                                </label>
                                <select
                                    value={candidatoId || candidatoSeleccionado?.id || ""}
                                    onChange={(e) => setCandidatoId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        borderRadius: "5px",
                                        border: "1px solid #ced4da",
                                        marginBottom: "16px",
                                        fontWeight: "600",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    {candidatos.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} · {c.cargo} ({c.planta})
                                        </option>
                                    ))}
                                </select>

                                {candidatoSeleccionado && (
                                    <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                                        <h4 style={{ margin: "0 0 10px 0", color: "#004085", borderBottom: "1px solid #b8daff", paddingBottom: "4px" }}>
                                            👤 Ficha del Candidato
                                        </h4>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>RUT:</strong> {candidatoSeleccionado.rut}
                                        </div>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>Cargo:</strong> {candidatoSeleccionado.cargo}
                                        </div>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>Familia:</strong> {candidatoSeleccionado.familiaCargo || "General"}
                                        </div>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>Planta:</strong> {candidatoSeleccionado.planta}
                                        </div>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>Especialidad:</strong> {candidatoSeleccionado.especialidad}
                                        </div>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>Evaluador Asignado:</strong> {candidatoSeleccionado.evaluador}
                                        </div>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>Estado Solicitud:</strong>{" "}
                                            <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "#e2e3e5", fontSize: "11px", fontWeight: "bold" }}>
                                                {candidatoSeleccionado.estado}
                                            </span>
                                        </div>
                                        <div style={{ marginBottom: "6px" }}>
                                            <strong>Dictamen Psicológico:</strong>{" "}
                                            <span style={{ color: candidatoSeleccionado.resultadoPsicologico?.includes("Recomendado") ? "#0f5132" : "#495057", fontWeight: "bold" }}>
                                                {candidatoSeleccionado.resultadoPsicologico || "Pendiente"}
                                            </span>
                                        </div>
                                        {candidatoSeleccionado.antecedentes && (
                                            <div style={{ marginTop: "10px", padding: "8px", backgroundColor: "#fff", borderRadius: "5px", border: "1px solid #e9ecef" }}>
                                                <strong style={{ display: "block", fontSize: "12px", color: "#495057" }}>Antecedentes:</strong>
                                                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                                                    {candidatoSeleccionado.antecedentes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* PANEL DERECHO: PARÁMETROS Y PREGUNTAS DEL JEFE */}
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
                                            Nivel de Urgencia:
                                        </label>
                                        <select
                                            value={urgencia}
                                            onChange={(e) => setUrgencia(e.target.value)}
                                            style={{ width: "100%", padding: "7px", borderRadius: "5px", border: "1px solid #ced4da" }}
                                        >
                                            <option value="Baja">🟢 Baja</option>
                                            <option value="Media">🟡 Media</option>
                                            <option value="Alta">🟠 Alta</option>
                                            <option value="Urgente">🔴 Urgente</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
                                            Fecha Límite Estimada:
                                        </label>
                                        <input
                                            type="date"
                                            value={fechaLimite}
                                            onChange={(e) => setFechaLimite(e.target.value)}
                                            style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #ced4da" }}
                                        />
                                        <span style={{ fontSize: "11px", color: "#6c757d" }}>
                                            Referencial (permite sobrepasarse)
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px" }}>
                                        Dirigido a:
                                    </label>
                                    <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={destinatarios.includes("evaluador")}
                                                onChange={() => handleToggleDestinatario("evaluador")}
                                            />
                                            Profesional Evaluador
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={destinatarios.includes("analista")}
                                                onChange={() => handleToggleDestinatario("analista")}
                                            />
                                            Analista de Reclutamiento
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                                            Preguntas / Requerimientos de Información:
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAgregarPregunta}
                                            style={{
                                                fontSize: "12px",
                                                padding: "4px 10px",
                                                backgroundColor: "#e7f1ff",
                                                color: "#0c63e4",
                                                border: "1px solid #b6d4fe",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            + Agregar otra pregunta
                                        </button>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
                                        {preguntas.map((pregunta, idx) => (
                                            <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#6c757d", marginTop: "6px" }}>
                                                    #{idx + 1}
                                                </span>
                                                <textarea
                                                    rows={2}
                                                    value={pregunta}
                                                    onChange={(e) => handleCambiarPregunta(idx, e.target.value)}
                                                    placeholder="Ej: ¿Tiene disponibilidad para viajes o turnos rotativos? Indicar antecedentes..."
                                                    style={{
                                                        flex: 1,
                                                        padding: "8px",
                                                        borderRadius: "5px",
                                                        border: "1px solid #ced4da",
                                                        fontSize: "13px",
                                                        resize: "vertical",
                                                    }}
                                                />
                                                {preguntas.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarPregunta(idx)}
                                                        title="Eliminar pregunta"
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            color: "#dc3545",
                                                            cursor: "pointer",
                                                            fontSize: "16px",
                                                            padding: "4px",
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #dee2e6", padding: "12px 20px" }}>
                        <button
                            type="button"
                            className="boton-orange-secundario"
                            onClick={onCerrar}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>
                        <BotonOrange type="submit" disabled={guardando}>
                            {guardando ? "Emitiendo solicitud..." : "Emitir Solicitud de Informe"}
                        </BotonOrange>
                    </div>
                </form>
            </div>
        </div>
    );
}
