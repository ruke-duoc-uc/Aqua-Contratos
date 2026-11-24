import { useState } from "react";
import BotonOrange from "./BotonOrange.jsx";
import Icono from "./Icono.jsx";
import { EVALUADORES_DISPONIBLES, TIPOS_CITACION } from "../utils/constantes";
import { construirUrlGoogleCalendar, generarEnlaceGoogleMeet } from "../utils/googleCalendar";

function ModalAgendarEntrevista({ isOpen, postulante, onCerrar, onAgendar }) {
    // Obtener fecha por defecto (mañana a las 10:00) o existente
    const obtenerFechaDefecto = () => {
        if (postulante?.fechaEntrevista && !isNaN(new Date(postulante.fechaEntrevista).getTime())) {
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
    const [tipoCitacion, setTipoCitacion] = useState(
        postulante?.tipoCitacion || TIPOS_CITACION[0] || "Entrevistas físicas"
    );
    const [evaluador, setEvaluador] = useState(
        postulante?.evaluadorAsignado || postulante?.encargado || EVALUADORES_DISPONIBLES[0] || "Amaro Villalobos Caseres"
    );
    const [enlaceGoogleMeet, setEnlaceGoogleMeet] = useState(
        () =>
            postulante?.enlaceGoogleMeet ||
            generarEnlaceGoogleMeet(postulante?.candidatoNombre || postulante?.nombre || "aquachile")
    );
    const [observaciones, setObservaciones] = useState(postulante?.observaciones || "");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !postulante) return null;

    const esOnline = tipoCitacion === "Entrevistas online";
    const nombrePostulante = postulante.candidatoNombre || postulante.nombre || "Postulante";
    const cargoPostulante = postulante.puestoTitulo || postulante.cargo || "Postulante General";
    const plantaPostulante = postulante.puestoPlanta || postulante.planta || "Puerto Montt";

    const urlGooglePreview = construirUrlGoogleCalendar({
        tipoCitacion,
        fechaHora,
        candidatoNombre: nombrePostulante,
        candidatoEmail: postulante.candidatoEmail || postulante.email || "",
        puestoTitulo: cargoPostulante,
        planta: plantaPostulante,
        evaluador,
        enlaceMeet: esOnline ? enlaceGoogleMeet : "",
        observaciones,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fechaHora) {
            setError("Debe seleccionar una fecha y hora para la citación.");
            return;
        }

        setEnviando(true);
        setError("");
        try {
            await onAgendar({
                postulacionId: postulante.id,
                fechaEntrevista: fechaHora,
                tipoCitacion,
                evaluadorAsignado: evaluador,
                enlaceGoogleMeet: esOnline ? enlaceGoogleMeet.trim() : "",
                urlGoogleCalendar: urlGooglePreview,
                observaciones: observaciones.trim(),
            });
            onCerrar();
        } catch (err) {
            setError(err.message || "Error al agendar la citación.");
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
                    maxWidth: "540px",
                    maxHeight: "92vh",
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
                        <h2 style={{ margin: 0, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Icono nombre="calendar" size={18} color="#e8590c" />
                            Programar Citación con Postulante
                        </h2>
                        <span style={{ fontSize: "12px", color: "#666" }}>
                            Postulante: <strong>{nombrePostulante}</strong>
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#888",
                        }}
                        aria-label="Cerrar modal"
                    >
                        <Icono nombre="close" size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} noValidate style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Información resumida */}
                    <div style={{ backgroundColor: "#f8f9fa", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", color: "#495057" }}>
                        <div><strong>Puesto:</strong> {cargoPostulante}</div>
                        <div><strong>Planta:</strong> {plantaPostulante}</div>
                        <div><strong>RUT:</strong> {postulante.candidatoRut || postulante.rut || "Sin RUT"}</div>
                    </div>

                    {/* Tipo de Citación */}
                    <div>
                        <label style={estiloLabel}>Tipo de Citación *</label>
                        <select
                            value={tipoCitacion}
                            onChange={(e) => setTipoCitacion(e.target.value)}
                            style={estiloInput}
                        >
                            {TIPOS_CITACION.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha y Hora */}
                    <div>
                        <label style={estiloLabel}>Fecha y Hora de la Citación *</label>
                        <input
                            type="datetime-local"
                            value={fechaHora}
                            onChange={(e) => setFechaHora(e.target.value)}
                            style={estiloInput}
                        />
                    </div>

                    {/* Enlace Google Meet si es Entrevista Online */}
                    {esOnline && (
                        <div>
                            <label style={estiloLabel}>Enlace Google Meet (Videollamada) *</label>
                            <input
                                type="url"
                                value={enlaceGoogleMeet}
                                onChange={(e) => setEnlaceGoogleMeet(e.target.value)}
                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                style={estiloInput}
                            />
                        </div>
                    )}

                    {/* Evaluador / Encargado Asignado */}
                    <div>
                        <label style={estiloLabel}>Funcionario / Evaluador Responsable *</label>
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
                        <label style={estiloLabel}>Instrucciones / Observaciones para la Citación</label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Ej: Presentarse con cédula de identidad vigente o conectarse 5 minutos antes a Google Meet."
                            rows={3}
                            style={{ ...estiloInput, resize: "vertical" }}
                        />
                    </div>

                    {/* Integración directa con Google Calendar (E2) */}
                    <div
                        style={{
                            padding: "12px 14px",
                            backgroundColor: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}
                    >
                        <div style={{ fontSize: "12px", color: "#1e3a8a" }}>
                            <strong>Coordinación con Google Calendar</strong>
                            <div style={{ color: "#3b82f6" }}>
                                Sincroniza esta citación en Google Calendar e invita al postulante
                            </div>
                        </div>
                        <a
                            href={urlGooglePreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "7px 12px",
                                backgroundColor: "#1d4ed8",
                                color: "white",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "700",
                                textDecoration: "none",
                            }}
                        >
                            <Icono nombre="externalLink" size={13} />
                            Abrir en Google Calendar
                        </a>
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
                            texto={enviando ? "Guardando..." : "Confirmar Citación"}
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
