/** Modal de Consulta y Detalle de Solicitud de Evaluación
 * @Autor Amaro Villalobos
 * Permite visualizar el desglose del postulante (RUT, nombres, apellidos, dirección,
 * comuna, fecha de nacimiento, edad y CV), actualizar su estado y
 * registrar la evaluación psicológica formal (Fecha, Dictamen y Observaciones).
 **/
import { useState } from "react";
import BotonOrange from "./BotonOrange";
import { calcularEdad } from "../utils/calcularRut";
import { abrirCvDocumento } from "../utils/visorCv";
import SelectorTagsPsicolaborales from "./SelectorTagsPsicolaborales";
import { TAGS_FORTALEZAS_SUGERIDOS, TAGS_DEBILIDADES_SUGERIDAS } from "../utils/constantes";

const obtenerFechaHoy = () => new Date().toISOString().split("T")[0];

function ModalDetalleSolicitud({
    solicitud,
    isOpen,
    onCerrar,
    onCambiarEstado,
    onGuardarEvaluacion,
    informes = [],
    rolActual,
}) {
    const informeAsociado = (informes || []).find((inf) => {
        const mismoCandidatoId = inf.candidatoId && (String(inf.candidatoId) === String(solicitud?.candidatoId || solicitud?.id));
        const mismoNombre = inf.candidatoNombre && solicitud?.nombre && inf.candidatoNombre.toLowerCase() === solicitud.nombre.toLowerCase();
        const mismaPostulacion = inf.postulacionId && (String(inf.postulacionId) === String(solicitud?.postulacionId || solicitud?.id));
        return mismoCandidatoId || mismoNombre || mismaPostulacion;
    });

    const [resultadoPsicologico, setResultadoPsicologico] = useState(
        solicitud?.resultadoPsicologico || informeAsociado?.dictamen || "Pendiente"
    );
    const [fechaEvaluacion, setFechaEvaluacion] = useState(
        solicitud?.fechaEvaluacion || informeAsociado?.fechaEvaluacion || obtenerFechaHoy()
    );
    const [conclusiones, setConclusiones] = useState(
        solicitud?.conclusiones || informeAsociado?.conclusiones || ""
    );
    const [fortalezas, setFortalezas] = useState(
        solicitud?.fortalezas || informeAsociado?.fortalezas || []
    );
    const [debilidades, setDebilidades] = useState(
        solicitud?.debilidades || informeAsociado?.debilidades || []
    );
    const [historial, setHistorial] = useState(
        solicitud?.historial || informeAsociado?.historial || []
    );
    const [guardadoExitoso, setGuardadoExitoso] = useState(false);
    const [errorEvaluacion, setErrorEvaluacion] = useState("");

    if (!isOpen || !solicitud) return null;

    const fechaFormateada =
        solicitud.fecha instanceof Date
            ? solicitud.fecha.toLocaleDateString("es-CL")
            : solicitud.fecha;

    const puedeEvaluar = rolActual === "evaluador";

    const nombresMostrar = solicitud.nombres || (solicitud.nombre ? solicitud.nombre.split(" ").slice(0, -2).join(" ") || solicitud.nombre.split(" ")[0] : "—");
    const apellidosMostrar = solicitud.apellidos || (solicitud.nombre ? solicitud.nombre.split(" ").slice(-2).join(" ") : "—");
    const edad = solicitud.fecha_nacimiento ? calcularEdad(solicitud.fecha_nacimiento) : null;
    const cvArchivo = solicitud.cv_pdf || solicitud.cvArchivo || (solicitud.nombre ? `cv_${solicitud.nombre.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf` : null);

    // Obtener preguntas vinculadas al candidato o su postulación
    const informesRelacionados = (informes || []).filter((inf) => {
        const mismoCandidatoId = inf.candidatoId && (String(inf.candidatoId) === String(solicitud.candidatoId || solicitud.id));
        const mismoNombre = inf.candidatoNombre && solicitud.nombre && inf.candidatoNombre.toLowerCase() === solicitud.nombre.toLowerCase();
        const mismaPostulacion = inf.postulacionId && (String(inf.postulacionId) === String(solicitud.postulacionId || solicitud.id));
        return mismoCandidatoId || mismoNombre || mismaPostulacion;
    });

    const todasLasPreguntas = informesRelacionados.flatMap((inf) =>
        (inf.preguntas || inf.preguntasJefatura || []).map((p) => ({
            ...p,
            informeId: inf.id,
            solicitante: inf.solicitante || "Jefe de Área",
        }))
    );

    const handleGuardarEvaluacion = (e) => {
        e.preventDefault();

        if (!fechaEvaluacion) {
            setErrorEvaluacion("Debe indicar la fecha de evaluación o entrevista.");
            return;
        }
        if (!resultadoPsicologico || resultadoPsicologico === "Pendiente") {
            setErrorEvaluacion("Debe seleccionar un Dictamen Psicolaboral formal (Recomendado, Con observaciones o No recomendado).");
            return;
        }
        if (!conclusiones.trim()) {
            setErrorEvaluacion("Las conclusiones y observaciones psicolaborales son obligatorias para emitir el dictamen.");
            return;
        }

        setErrorEvaluacion("");

        const nuevoEstado = "Finalizado";
        const nuevoHistorialItem = {
            fecha: new Date().toISOString(),
            accion: "Evaluación Psicolaboral Registrada",
            autor: rolActual === "evaluador" ? "Carolina Díaz" : "Profesional Evaluador",
            rol: rolActual,
            detalle: `Dictamen: ${resultadoPsicologico}. Fortalezas: ${fortalezas.length}, Debilidades: ${debilidades.length}.`,
        };
        const nuevoHistorial = [...historial, nuevoHistorialItem];
        setHistorial(nuevoHistorial);

        if (typeof onGuardarEvaluacion === "function") {
            onGuardarEvaluacion(solicitud.id, {
                resultadoPsicologico,
                fechaEvaluacion,
                conclusiones: conclusiones.trim(),
                fortalezas,
                debilidades,
                historial: nuevoHistorial,
                estado: nuevoEstado,
            });
        } else if (typeof onCambiarEstado === "function") {
            onCambiarEstado(solicitud.id, nuevoEstado);
        }

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
                style={{ maxWidth: "780px" }}
            >
                <div className="modal-header">
                    <div>
                        <h3 style={{ margin: 0 }}>Ficha de Postulación y Evaluación Psicolaboral</h3>
                        <span style={{ fontSize: "12px", color: "var(--color-texto-atenuado, #666)" }}>
                            ID: #{solicitud.id} · Postulante: {nombresMostrar} {apellidosMostrar} (RUT: {solicitud.rut})
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

                    {/* 1. Atributos del Postulante */}
                    <h4 className="form-seccion-titulo">1. Atributos del Postulante</h4>
                    <div className="form-grid">
                        <div>
                            <strong>RUT:</strong>
                            <p style={{ margin: "4px 0 12px 0", fontWeight: "bold" }}>{solicitud.rut}</p>
                        </div>
                        <div>
                            <strong>Nombres:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{nombresMostrar}</p>
                        </div>
                        <div>
                            <strong>Apellidos:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{apellidosMostrar}</p>
                        </div>
                        <div>
                            <strong>Fecha de Nacimiento / Edad:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                {solicitud.fecha_nacimiento ? (
                                    <span>
                                        {solicitud.fecha_nacimiento}{" "}
                                        {edad !== null && (
                                            <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "2px 6px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                                                ({edad} años)
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span style={{ color: "#888", fontStyle: "italic" }}>No registrada</span>
                                )}
                            </p>
                        </div>
                        <div>
                            <strong>Dirección:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{solicitud.direccion || "Dirección no informada"}</p>
                        </div>
                        <div>
                            <strong>Comuna:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                <span style={{ backgroundColor: "#f0f4f8", color: "#334e68", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>
                                    {solicitud.comuna || solicitud.planta || "No informada"}
                                </span>
                            </p>
                        </div>
                        <div className="form-col-span-2">
                            <strong>Currículum Vitae (CV PDF):</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                {cvArchivo ? (
                                    <span className="d-inline-flex align-items-center gap-2 flex-wrap">
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#e3f2fd", color: "#0d47a1", padding: "5px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                                            📄 {cvArchivo}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => abrirCvDocumento(solicitud)}
                                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                                            style={{ fontSize: "12px", padding: "4px 10px" }}
                                            title="Abrir currículum en nueva pestaña"
                                        >
                                            ↗ Abrir CV en nueva pestaña
                                        </button>
                                    </span>
                                ) : (
                                    <span style={{ color: "#888", fontStyle: "italic" }}>Sin archivo adjunto</span>
                                )}
                            </p>
                        </div>
                        <div className="form-col-span-2">
                            <strong>Experiencia / Antecedentes Laborales:</strong>
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
                    <h4 className="form-seccion-titulo">2. Parámetros de la Solicitud</h4>
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
                            <strong>Evaluador / Encargado Responsable:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>{solicitud.evaluador || solicitud.encargado || "Sin asignar"}</p>
                        </div>
                        <div>
                            <strong>Condición / Fase Actual:</strong>
                            <p style={{ margin: "4px 0 12px 0" }}>
                                <span
                                    className={`badge-estado badge-${
                                        (solicitud.estado || solicitud.fase || "").toLowerCase().includes("proceso") || (solicitud.fase || "").toLowerCase().includes("entrevista")
                                            ? "proceso"
                                            : (solicitud.estado || "").toLowerCase().includes("fin") || (solicitud.fase || "").toLowerCase().includes("aceptado")
                                            ? "finalizado"
                                            : "pendiente"
                                    }`}
                                >
                                    {solicitud.fase ? `Fase: ${solicitud.fase}` : (solicitud.estado || "Pendiente")}
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
                                    Cambio Rápido de Estado:
                                </label>
                                <select
                                    id="cambio-estado-select"
                                    className="form-select"
                                    value={solicitud.estado || "Pendiente"}
                                    onChange={(e) =>
                                        onCambiarEstado && onCambiarEstado(solicitud.id, e.target.value)
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

                    {/* 3. Preguntas de Jefatura sobre el Candidato */}
                    <div style={{ margin: "16px 0", padding: "14px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #ced4da" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#004085", fontSize: "15px" }}>
                            💬 Preguntas de Jefatura ({todasLasPreguntas.length})
                        </h4>
                        {todasLasPreguntas.length === 0 ? (
                            <p style={{ margin: 0, fontSize: "13px", color: "#6c757d", fontStyle: "italic" }}>
                                No hay preguntas formuladas para este postulante.
                            </p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {todasLasPreguntas.map((preg, pIdx) => (
                                    <div
                                        key={preg.id || pIdx}
                                        style={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #dee2e6",
                                            borderRadius: "6px",
                                            padding: "10px 12px",
                                            fontSize: "13px",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                            <strong style={{ color: "#0d6efd" }}>
                                                #{pIdx + 1}: {preg.texto}
                                            </strong>
                                            <span style={{ fontSize: "11px", color: "#888" }}>
                                                {preg.fecha ? new Date(preg.fecha).toLocaleDateString("es-CL") : ""}
                                            </span>
                                        </div>
                                        <div style={{ marginLeft: "10px", marginTop: "6px", borderLeft: "2px solid #0d6efd33", paddingLeft: "8px" }}>
                                            {(preg.respuestas || []).length > 0 ? (
                                                preg.respuestas.map((r, rIdx) => (
                                                    <div key={r.id || rIdx} style={{ fontSize: "12px", marginTop: "3px" }}>
                                                        <span style={{ fontWeight: "600", color: "#198754" }}>
                                                            ↳ {r.autor || r.rol}:
                                                        </span>{" "}
                                                        <span>{r.texto}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: "11.5px", color: "#888", fontStyle: "italic" }}>
                                                    Pendiente de respuesta.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Sección de Evaluación Psicolaboral Formal */}
                    <div className="caja-evaluacion-psicolaboral">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <h4 style={{ margin: 0, color: "#0e97b3", fontSize: "15px" }}>
                                🧠 Evaluación Psicolaboral
                            </h4>
                            <span style={{ fontSize: "12px", color: "#666" }}>
                                Evaluador responsable: {solicitud.evaluador || "Carolina Díaz"}
                            </span>
                        </div>

                        {guardadoExitoso && (
                            <div style={{ backgroundColor: "#d1e7dd", color: "#0f5132", padding: "8px 12px", borderRadius: "5px", marginBottom: "12px", fontSize: "13px" }}>
                                ✓ Evaluación psicológica registrada exitosamente.
                            </div>
                        )}

                        {puedeEvaluar ? (
                            <form onSubmit={handleGuardarEvaluacion}>
                                {errorEvaluacion && (
                                    <div className="form-error-mensaje" role="alert" style={{ marginBottom: "12px" }}>
                                        <strong>⚠️ Atención: </strong>{errorEvaluacion}
                                    </div>
                                )}

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
                                            onChange={(e) => {
                                                setFechaEvaluacion(e.target.value);
                                                setErrorEvaluacion("");
                                            }}
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
                                            onChange={(e) => {
                                                setResultadoPsicologico(e.target.value);
                                                setErrorEvaluacion("");
                                            }}
                                        >
                                            <option value="Pendiente">-- Pendiente de Dictamen --</option>
                                            <option value="Recomendado">Recomendado</option>
                                            <option value="Recomendado con observaciones">
                                                Recomendado con observaciones
                                            </option>
                                            <option value="No recomendado">No recomendado</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tags de Fortalezas y Debilidades */}
                                <div style={{ marginBottom: "12px", padding: "10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #ced4da" }}>
                                    <SelectorTagsPsicolaborales
                                        titulo="Fortalezas del Candidato"
                                        tipo="fortaleza"
                                        tagsActuales={fortalezas}
                                        sugerencias={TAGS_FORTALEZAS_SUGERIDOS}
                                        esEditable={true}
                                        onAgregarTag={(tag) => setFortalezas([...fortalezas, tag])}
                                        onRemoverTag={(tag) => setFortalezas(fortalezas.filter((t) => t !== tag))}
                                    />

                                    <SelectorTagsPsicolaborales
                                        titulo="Debilidades / Áreas de Mejora"
                                        tipo="debilidad"
                                        tagsActuales={debilidades}
                                        sugerencias={TAGS_DEBILIDADES_SUGERIDAS}
                                        esEditable={true}
                                        onAgregarTag={(tag) => setDebilidades([...debilidades, tag])}
                                        onRemoverTag={(tag) => setDebilidades(debilidades.filter((t) => t !== tag))}
                                    />
                                </div>

                                <div className="form-grupo" style={{ marginBottom: "12px" }}>
                                    <label htmlFor="conclusiones-evaluacion">
                                        Conclusiones y Observaciones Psicolaborales *
                                    </label>
                                    <textarea
                                        id="conclusiones-evaluacion"
                                        rows="3"
                                        className="form-textarea"
                                        placeholder="Detalle aptitudes, competencias evaluadas, adaptabilidad al clima de trabajo de planta o recomendaciones..."
                                        value={conclusiones}
                                        onChange={(e) => {
                                            setConclusiones(e.target.value);
                                            setErrorEvaluacion("");
                                        }}
                                    />
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
                                    {obtenerBadgeDictamen(solicitud.resultadoPsicologico || resultadoPsicologico)}
                                </p>
                                <p style={{ margin: "6px 0", fontSize: "14px" }}>
                                    <strong>Fecha de Evaluación:</strong>{" "}
                                    {solicitud.fechaEvaluacion || fechaEvaluacion || "Pendiente de agendamiento"}
                                </p>

                                <div style={{ margin: "10px 0", padding: "10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #ced4da" }}>
                                    <SelectorTagsPsicolaborales
                                        titulo="Fortalezas"
                                        tipo="fortaleza"
                                        tagsActuales={solicitud.fortalezas || fortalezas}
                                        esEditable={false}
                                    />

                                    <SelectorTagsPsicolaborales
                                        titulo="Debilidades"
                                        tipo="debilidad"
                                        tagsActuales={solicitud.debilidades || debilidades}
                                        esEditable={false}
                                    />
                                </div>

                                <p style={{ margin: "6px 0", fontSize: "14px" }}>
                                    <strong>Conclusiones:</strong>{" "}
                                    {solicitud.conclusiones || conclusiones || "Sin informe cargado todavía."}
                                </p>
                                <span style={{ fontSize: "12px", color: "gray", fontStyle: "italic" }}>
                                    (Solo el Profesional Evaluador puede modificar las fortalezas, debilidades y dictamen psicolaboral formal)
                                </span>
                            </div>
                        )}

                        {/* Historial de eventos del candidato */}
                        <div style={{ marginTop: "14px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #dee2e6" }}>
                            <strong style={{ fontSize: "12.5px", color: "#495057", display: "block", marginBottom: "6px" }}>
                                📜 Historial ({historial.length})
                            </strong>
                            {historial.length === 0 ? (
                                <span style={{ fontSize: "11.5px", color: "#888", fontStyle: "italic" }}>
                                    Sin eventos previos registrados.
                                </span>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
                                    {historial.map((h, hIdx) => (
                                        <div key={hIdx} style={{ fontSize: "11.5px", padding: "4px 8px", backgroundColor: "#fff", borderRadius: "4px", borderLeft: "2px solid #0d6efd" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                                                <strong>{h.accion || "Registro"}</strong>
                                                <span>{h.fecha ? new Date(h.fecha).toLocaleString("es-CL") : ""}</span>
                                            </div>
                                            <div style={{ color: "#333" }}>{h.detalle}</div>
                                            <div style={{ fontSize: "10px", color: "#888" }}>Por: {h.autor || h.rol}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
