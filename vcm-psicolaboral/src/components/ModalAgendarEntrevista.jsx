import { useState } from "react";
import BotonOrange from "./BotonOrange.jsx";
import { EVALUADORES_DISPONIBLES } from "../utils/constantes";

function ModalAgendarEntrevista({ isOpen, postulante, onCerrar, onAgendar }) {
    if (!isOpen || !postulante) return null;

    // Obtener fecha por defecto (mañana a las 10:00) o existente
    const obtenerFechaDefecto = () => {
        if (postulante.fechaEntrevista && !isNaN(new Date(postulante.fechaEntrevista).getTime())) {
            const d = new Date(postulante.fechaEntrevista);
            return d.toISOString().slice(0, 16);
        }
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);
        manana.setHours(10, 0, 0, 0);
        const anio = manana.getFullYear();
        const mes = String(manana.getMonth() + 1).padStart(2, "0");
        const dia = String(manana.getDate()).padStart(2, "0");
        const horas = String(manana.getHours()).padStart(2, "0");
        const min = String(manana.getMinutes()).padStart(2, "0");
        return `${anio}-${mes}-${dia}T${horas}:${min}`;
    };

    const [fechaHora, setFechaHora] = useState(obtenerFechaDefecto);
    const [evaluador, setEvaluador] = useState(
        postulante.evaluadorAsignado || postulante.encargado || EVALUADORES_DISPONIBLES[0] || "Amaro Villalobos Caseres"
    );
    const [observaciones, setObservaciones] = useState(postulante.observaciones || "");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fechaHora) {
            setError("Debe seleccionar una fecha y hora para la entrevista.");
            return;
        }

        setEnviando(true);
        setError("");
        try {
            await onAgendar({
                postulacionId: postulante.id,
                fechaEntrevista: fechaHora,
                evaluadorAsignado: evaluador,
                observaciones: observaciones.trim(),
            });
            onCerrar();
        } catch (err) {
            setError(err.message || "Error al agendar la entrevista.");
        } finally {
            setEnviando(false);
        }
    };

    const estiloLabel = {
        display: "block",
        fontSize: "13px",
        fontWeight: "700",
        color: "#495057",
        marginBottom: "4px",
    };

    const estiloInput = {
        width: "100%",
        padding: "8px 10px",
        fontSize: "14px",
        border: "1px solid #ced4da",
        borderRadius: "5px",
        boxSizing: "border-box",
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
            }}
            onClick={onCerrar}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    width: "95%",
                    maxWidth: "500px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "18px 24px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Citar a Entrevista Laboral</h2>
                        <span style={{ fontSize: "12px", color: "#666" }}>
                            Postulante: <strong>{postulante.candidatoNombre || postulante.nombre}</strong>
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "22px",
                            cursor: "pointer",
                            color: "#888",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Información resumida */}
                    <div style={{ backgroundColor: "#f8f9fa", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", color: "#495057" }}>
                        <div><strong>Puesto:</strong> {postulante.puestoTitulo || postulante.cargo || "Postulante General"}</div>
                        <div><strong>Planta:</strong> {postulante.puestoPlanta || postulante.planta || "Sin asignar"}</div>
                        <div><strong>RUT:</strong> {postulante.candidatoRut || postulante.rut || "Sin RUT"}</div>
                    </div>

                    {/* Fecha y Hora */}
                    <div>
                        <label style={estiloLabel}>Fecha y Hora de la Entrevista *</label>
                        <input
                            type="datetime-local"
                            value={fechaHora}
                            onChange={(e) => setFechaHora(e.target.value)}
                            required
                            style={estiloInput}
                        />
                    </div>

                    {/* Evaluador Asignado */}
                    <div>
                        <label style={estiloLabel}>Profesional Evaluador Asignado *</label>
                        <select
                            value={evaluador}
                            onChange={(e) => setEvaluador(e.target.value)}
                            style={estiloInput}
                        >
                            {EVALUADORES_DISPONIBLES.map((ev) => (
                                <option key={ev} value={ev}>{ev}</option>
                            ))}
                        </select>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label style={estiloLabel}>Instrucciones / Observaciones para la Entrevista</label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Ej: Entrevista técnica presencial en faena. Presentarse con documento de identidad."
                            rows={3}
                            style={{ ...estiloInput, resize: "vertical" }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: "#721c24", backgroundColor: "#f8d7da", padding: "8px 12px", borderRadius: "4px", fontSize: "13px" }}>
                            {error}
                        </div>
                    )}

                    {/* Botones */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "10px", borderTop: "1px solid #eee" }}>
                        <button
                            type="button"
                            onClick={onCerrar}
                            style={{
                                padding: "9px 18px",
                                fontSize: "14px",
                                border: "1px solid #ced4da",
                                borderRadius: "5px",
                                background: "#fff",
                                cursor: "pointer",
                                fontWeight: "600",
                                color: "#495057",
                            }}
                        >
                            Cancelar
                        </button>
                        <BotonOrange
                            texto={enviando ? "Guardando..." : "Confirmar Cita"}
                            type="submit"
                            disabled={enviando}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalAgendarEntrevista;
