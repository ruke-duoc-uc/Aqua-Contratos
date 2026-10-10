/** Modal de Consulta y Detalle de Solicitud de Evaluación (RF03, RF06, RF08, RF09)
 * @Autor Amaro Villalobos
 * Permite visualizar el desglose del postulante, actualizar su estado y
 * registrar la evaluación psicológica formal (Fecha, Dictamen y Observaciones).
 **/
import { useState } from "react";
import BotonOrange from "./BotonOrange";

const obtenerFechaHoy = () => new Date().toISOString().split("T")[0];

function ModalDetalleSolicitud({
    solicitud,
    isOpen,
    onCerrar,
    onCambiarEstado,
    onGuardarEvaluacion,
    rolActual,
}) {
    const [resultadoPsicologico, setResultadoPsicologico] = useState(
        solicitud?.resultadoPsicologico || "Pendiente"
    );
    const [fechaEvaluacion, setFechaEvaluacion] = useState(
        solicitud?.fechaEvaluacion || obtenerFechaHoy()
    );
    const [conclusiones, setConclusiones] = useState(
        solicitud?.conclusiones || ""
    );
    const [guardadoExitoso, setGuardadoExitoso] = useState(false);

    if (!isOpen || !solicitud) return null;

    const fechaFormateada =
        solicitud.fecha instanceof Date
            ? solicitud.fecha.toLocaleDateString("es-CL")
            : solicitud.fecha;

    const puedeEvaluar = rolActual === "evaluador";

    const handleGuardarEvaluacion = (e) => {
        e.preventDefault();
        const nuevoEstado =
            resultadoPsicologico !== "Pendiente" ? "Finalizado" : solicitud.estado;

        onGuardarEvaluacion(solicitud.id, {
            resultadoPsicologico,
            fechaEvaluacion,
            conclusiones,
            estado: nuevoEstado,
        });

        setGuardadoExitoso(true);
        setTimeout(() => setGuardadoExitoso(false), 3000);
    };

    const obtenerBadgeDictamen = (dictamen) => {
        switch (dictamen) {
            case "Recomendado":
                return <span className="badge-dictamen badge-dictamen-recomendado">✓ Recomendado</span>;
            case "Recomendado con observaciones":
                return <span className="badge-dictamen badge-dictamen-observaciones">⚠️ Con observaciones</span>;
            case "No recomendado":
                return <span className="badge-dictamen badge-dictamen-norecomendado">✕ No recomendado</span>;
            default:
                return <span className="badge-dictamen badge-dictamen-pendiente">Sin dictamen aún</span>;
        }
    };

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div
                className="modal-contenido"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header">
                    <div>
                        <h3 style={{ margin: 0 }}>Detalle de Evaluación Psicolaboral</h3>
                        <span style={{ fontSize: "12px", color: "var(--color-texto-atenuado, #666)" }}>
                            ID Solicitud: #{solicitud.id} · Postulante: {solicitud.nombre}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="modal-cerrar-btn"
                        onClick={onCerrar}
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {/* Alerta de confirmación al guardar evaluación */}
                    {guardadoExitoso && (
                        <div
                            style={{
                                backgroundColor: "#d1e7dd",
                                color: "#0f5132",
                                border: "1px solid #badbcc",
                                padding: "10px 14px",
                                borderRadius: "6px",
                                marginBottom: "16px",
                                fontSize: "13px",
                                fontWeight: "bold",
                            }}
                        >
                            ✓ Evaluación psicolaboral registrada exitosamente. Estado actualizado a Finalizado.
                        </div>
                    )}

                    {/* 1. Antecedentes del Candidato */}
                    <h4 className="form-seccion-titulo">1. Antecedentes del Candidato (RF03)</h4>
                    <div className="form-grid">
                        <div>
                            <strong>Nombre:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{solicitud.nombre}</p>
                        </div>
                        <div>
                            <strong>RUT:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{solicitud.rut}</p>
                        </div>
                        <div>
                            <strong>Especialidad:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{solicitud.especialidad}</p>
                        </div>
                        <div>
                            <strong>Planta / Ubicación:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{solicitud.planta}</p>
                        </div>
                        <div className="form-col-span-2">
                            <strong>Experiencia / Antecedentes:</strong>
                            <p
                                style={{
                                    margin: "4px 0 12px 0",
                                    color: "#444",
                                    fontStyle: solicitud.antecedentes ? "normal" : "italic",
                                }}
                            >
                                {solicitud.antecedentes || "Sin antecedentes adicionales registrados."}
                            </p>
                        </div>
                    </div>

                    {/* 2. Parámetros de la Solicitud y Estado */}
                    <h4 className="form-seccion-titulo">2. Parámetros de la Solicitud (RF06, RF08)</h4>
                    <div className="form-grid">
                        <div>
                            <strong>Cargo Asignado:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                {solicitud.cargo || solicitud.especialidad}
                            </p>
                        </div>
                        <div>
                            <strong>Familia de Cargo:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                {solicitud.familiaCargo || "Operaciones Productivas"}
                            </p>
                        </div>
                        <div>
                            <strong>Fecha de Registro:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{fechaFormateada}</p>
                        </div>
                        <div>
                            <strong>Evaluador Responsable:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{solicitud.evaluador}</p>
                        </div>
                        <div>
                            <strong>Estado Actual:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                <span
                                    className={`badge-estado badge-${
                                        solicitud.estado.toLowerCase().includes("proceso")
                                            ? "proceso"
                                            : solicitud.estado.toLowerCase().includes("fin")
                                            ? "finalizado"
                                            : "pendiente"
                                    }`}
                                >
                                    {solicitud.estado}
                                </span>
                            </p>
                        </div>
                        <div>
                            <strong>Dictamen Psicológico Actual:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                {obtenerBadgeDictamen(solicitud.resultadoPsicologico)}
                            </p>
                        </div>

                        {puedeEvaluar && (
                            <div className="form-col-span-2" style={{ marginTop: "4px" }}>
                                <label
                                    htmlFor="cambio-estado-select"
                                    style={{ fontSize: "13px", fontWeight: "bold" }}
                                >
                                    Cambio Rápido de Estado (RF08):
                                </label>
                                <select
                                    id="cambio-estado-select"
                                    className="form-select"
                                    value={solicitud.estado}
                                    onChange={(e) =>
                                        onCambiarEstado(solicitud.id, e.target.value)
                                    }
                                    style={{ marginTop: "4px", width: "100%", maxWidth: "300px" }}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En revisión">En revisión</option>
                                    <option value="En proceso">En proceso</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* 3. Sección de Evaluación Psicolaboral Formal (RF09) */}
                    <div className="caja-evaluacion-psicolaboral">
                        <h4 style={{ margin: "0 0 12px 0", color: "#0e97b3", fontSize: "15px" }}>
                            🧠 Formulario de Evaluación Psicolaboral (RF09)
                        </h4>

                        {puedeEvaluar ? (
                            <form onSubmit={handleGuardarEvaluacion}>
                                <div className="form-grid" style={{ marginBottom: "12px" }}>
                                    <div className="form-grupo">
                                        <label htmlFor="fecha-evaluacion">
                                            Fecha de Evaluación / Entrevista *
                                        </label>
                                        <input
                                            id="fecha-evaluacion"
                                            type="date"
                                            className="form-input"
                                            value={fechaEvaluacion}
                                            onChange={(e) => setFechaEvaluacion(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-grupo">
                                        <label htmlFor="resultado-psicologico">
                                            Dictamen Psicolaboral *
                                        </label>
                                        <select
                                            id="resultado-psicologico"
                                            className="form-select"
                                            value={resultadoPsicologico}
                                            onChange={(e) => setResultadoPsicologico(e.target.value)}
                                        >
                                            <option value="Pendiente">-- Pendiente de Dictamen --</option>
                                            <option value="Recomendado">Recomendado</option>
                                            <option value="Recomendado con observaciones">
                                                Recomendado con observaciones
                                            </option>
                                            <option value="No recomendado">No recomendado</option>
                                        </select>
                                    </div>

                                    <div className="form-grupo form-col-span-2">
                                        <label htmlFor="conclusiones-evaluacion">
                                            Conclusiones y Observaciones Psicolaborales *
                                        </label>
                                        <textarea
                                            id="conclusiones-evaluacion"
                                            rows="3"
                                            className="form-textarea"
                                            placeholder="Detalle aptitudes, competencias evaluadas, adaptabilidad al clima de trabajo de planta o recomendaciones..."
                                            value={conclusiones}
                                            onChange={(e) => setConclusiones(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <BotonOrange
                                        texto="Guardar Dictamen de Evaluación"
                                        type="submit"
                                    />
                                </div>
                            </form>
                        ) : (
                            <div>
                                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                                    <strong>Dictamen:</strong>{" "}
                                    {obtenerBadgeDictamen(solicitud.resultadoPsicologico)}
                                </p>
                                <p style={{ margin: "6px 0", fontSize: "14px" }}>
                                    <strong>Fecha de Evaluación:</strong>{" "}
                                    {solicitud.fechaEvaluacion || "Pendiente de agendamiento"}
                                </p>
                                <p style={{ margin: "6px 0", fontSize: "14px" }}>
                                    <strong>Conclusiones:</strong>{" "}
                                    {solicitud.conclusiones || "Sin informe cargado todavía."}
                                </p>
                                <span style={{ fontSize: "12px", color: "gray", fontStyle: "italic" }}>
                                    (Solo el Profesional Evaluador puede ingresar la fecha, observaciones y dictamen psicolaboral formal)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="boton-secundario"
                        onClick={onCerrar}
                    >
                        Cerrar
                    </button>
                    <BotonOrange texto="Aceptar" onClick={onCerrar} />
                </div>
            </div>
        </div>
    );
}

export default ModalDetalleSolicitud;
