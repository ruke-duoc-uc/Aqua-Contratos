/**
 * Modal Unificado: Ficha del Postulante + Evaluación Psicolaboral + Informes de Jefatura
 * Fusión integral de ModalDetalleSolicitud y ModalDetalleInforme
 * Permite visualizar el perfil completo del candidato y alternar fluidamente entre
 * la Evaluación Técnica Psicolaboral y las Consultas/Respuestas de Jefatura en una sola ventana.
 */
import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange";
import Icono from "./Icono";
import { calcularEdad } from "../utils/calcularRut";
import { abrirCvDocumento } from "../utils/visorCv";
import SelectorTagsPsicolaborales from "./SelectorTagsPsicolaborales";
import { api } from "../services/api";
import {
    TAGS_FORTALEZAS_SUGERIDOS,
    TAGS_DEBILIDADES_SUGERIDAS,
    DICTAMENES_PSICOLABORALES,
    normalizarDictamen,
    obtenerConfigDictamen,
} from "../utils/constantes";

const obtenerFechaHoy = () => new Date().toISOString().split("T")[0];

export default function ModalDetallePsicolaboral({
    isOpen,
    solicitud,
    informe,
    informes = [],
    candidatos = [],
    rolActual,
    onCerrar,
    onCambiarEstado,
    onGuardarEvaluacion,
    onActualizarInforme,
    onAgregarPregunta,
    onAgregarRespuesta,
    onCambiarEstadoInforme,
    tabInicial,
}) {
    // 1. Resolver el candidato / postulante activo
    const candidatoActivo = useMemo(() => {
        if (solicitud) return solicitud;
        if (informe?.candidatoPerfil) return informe.candidatoPerfil;
        if (informe?.candidatoId && Array.isArray(candidatos)) {
            const enc = candidatos.find((c) => Number(c.id) === Number(informe.candidatoId));
            if (enc) return enc;
        }
        if (informe?.candidatoNombre && Array.isArray(candidatos)) {
            const enc = candidatos.find(
                (c) => (c.nombre || "").toLowerCase().trim() === (informe.candidatoNombre || "").toLowerCase().trim()
            );
            if (enc) return enc;
        }
        return {
            id: informe?.candidatoId || Date.now(),
            nombre: informe?.candidatoNombre || "Postulante",
            rut: "No informado",
            cargo: "Postulante General",
            planta: "Puerto Montt",
            estado: "Pendiente",
            resultadoPsicologico: informe?.dictamen || "Pendiente",
        };
    }, [solicitud, informe, candidatos]);

    // 2. Resolver el informe activo asociado al candidato
    const informeActivo = useMemo(() => {
        if (informe) return informe;
        if (!candidatoActivo || !Array.isArray(informes) || informes.length === 0) return null;
        return (
            informes.find((inf) => {
                const mismoCandId =
                    inf.candidatoId &&
                    String(inf.candidatoId) === String(candidatoActivo.candidatoId || candidatoActivo.id);
                const mismoNombre =
                    inf.candidatoNombre &&
                    candidatoActivo.nombre &&
                    inf.candidatoNombre.toLowerCase().trim() === candidatoActivo.nombre.toLowerCase().trim();
                const mismaPostulacion =
                    inf.postulacionId &&
                    String(inf.postulacionId) === String(candidatoActivo.postulacionId || candidatoActivo.id);
                return mismoCandId || mismoNombre || mismaPostulacion;
            }) || null
        );
    }, [informe, candidatoActivo, informes]);

    // Pestaña inicial inteligente: si se abrió desde un informe específico, abre en "preguntas"
    const [tabActiva, setTabActiva] = useState(() => {
        if (tabInicial) return tabInicial;
        if (informe && !solicitud) return "preguntas";
        return "evaluacion";
    });

    // Estados de evaluación técnica
    const dictamenInicial = normalizarDictamen(
        candidatoActivo?.resultadoPsicologico || informeActivo?.dictamen || "Pendiente"
    );
    const [resultadoPsicologico, setResultadoPsicologico] = useState(dictamenInicial);
    const [fechaEvaluacion, setFechaEvaluacion] = useState(
        candidatoActivo?.fechaEvaluacion || informeActivo?.fechaEvaluacion || obtenerFechaHoy()
    );
    const [conclusiones, setConclusiones] = useState(
        candidatoActivo?.conclusiones || informeActivo?.conclusiones || ""
    );
    const [fortalezas, setFortalezas] = useState(
        candidatoActivo?.fortalezas || informeActivo?.fortalezas || []
    );
    const [debilidades, setDebilidades] = useState(
        candidatoActivo?.debilidades || informeActivo?.debilidades || []
    );
    const [historialLocal, setHistorialLocal] = useState(
        candidatoActivo?.historial || informeActivo?.historial || []
    );

    // Estados de informe / preguntas de jefatura
    const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState("");
    const [respuestasInputs, setRespuestasInputs] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState("");
    const [errorEvaluacion, setErrorEvaluacion] = useState("");

    // Estados para Módulo de Inteligencia Artificial (Apoyo al Analista)
    const [analisisIa, setAnalisisIa] = useState(null);
    const [cargandoIa, setCargandoIa] = useState(false);
    const [errorIa, setErrorIa] = useState("");
    const [copiadoPreguntas, setCopiadoPreguntas] = useState(false);

    const handleGenerarAnalisisIa = async () => {
        setCargandoIa(true);
        setErrorIa("");
        try {
            const resultado = await api.analizarCandidatoConIa({
                candidatoId: candidatoActivo.id,
                nombre: candidatoActivo.nombre,
                especialidad: candidatoActivo.especialidad || candidatoActivo.cargo,
                experienciaLaboral: candidatoActivo.experienciaLaboral,
                infoMedica: candidatoActivo.infoMedica,
                cargoPostulado: candidatoActivo.cargo || candidatoActivo.puestoTitulo || "Operador de Planta",
                planta: candidatoActivo.planta || "Puerto Montt",
            });
            setAnalisisIa(resultado);
        } catch (err) {
            setErrorIa(err.message || "No se pudo generar el análisis de IA.");
        } finally {
            setCargandoIa(false);
        }
    };

    if (!isOpen || !candidatoActivo) return null;

    const puedeEvaluar = rolActual === "evaluador";
    const esJefe = rolActual === "jefatura";
    const esInformeAbierto = informeActivo?.estado === "Abierta";
    const esDestinatario =
        Array.isArray(informeActivo?.destinatarios) && informeActivo.destinatarios.includes(rolActual);
    const puedeResponder = !esJefe && esInformeAbierto && (esDestinatario || rolActual === "analista" || rolActual === "evaluador");
    const puedeRepreguntar = esJefe && esInformeAbierto;

    const listaPreguntas = informeActivo?.preguntas || informeActivo?.preguntasJefatura || [];

    // Historial cronológico consolidado
    const historialCompleto = [
        ...(Array.isArray(candidatoActivo?.historial) ? candidatoActivo.historial : []),
        ...(Array.isArray(informeActivo?.historial) ? informeActivo.historial : []),
        ...historialLocal,
    ].filter((item, index, self) => {
        // Desduplicar eventos idénticos
        return (
            index ===
            self.findIndex(
                (t) => t.fecha === item.fecha && t.accion === item.accion && t.detalle === item.detalle
            )
        );
    });

    const nombresMostrar =
        candidatoActivo.nombres ||
        (candidatoActivo.nombre ? candidatoActivo.nombre.split(" ").slice(0, -2).join(" ") || candidatoActivo.nombre.split(" ")[0] : "—");
    const apellidosMostrar =
        candidatoActivo.apellidos ||
        (candidatoActivo.nombre ? candidatoActivo.nombre.split(" ").slice(-2).join(" ") : "—");
    const edad = candidatoActivo.fecha_nacimiento ? calcularEdad(candidatoActivo.fecha_nacimiento) : null;
    const cvArchivo =
        candidatoActivo.cv_pdf ||
        candidatoActivo.cvArchivo ||
        (candidatoActivo.nombre ? `cv_${candidatoActivo.nombre.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf` : null);

    // Guardar evaluación técnica (sincroniza modelo solicitud y modelo informe)
    const handleGuardarEvaluacionCompleta = async (e) => {
        e?.preventDefault?.();

        if (!fechaEvaluacion) {
            setErrorEvaluacion("Debe indicar la fecha de evaluación.");
            return;
        }
        if (!resultadoPsicologico || resultadoPsicologico === "Pendiente") {
            setErrorEvaluacion(
                "Debe seleccionar un Dictamen Psicolaboral formal (Recomendable, Con reservas o No recomendable)."
            );
            return;
        }
        if (!conclusiones.trim()) {
            setErrorEvaluacion("Las conclusiones y observaciones psicolaborales son obligatorias para emitir el dictamen.");
            return;
        }

        setErrorEvaluacion("");
        setEnviando(true);

        const dictamenOficial = normalizarDictamen(resultadoPsicologico);
        const nuevoItemHistorial = {
            fecha: new Date().toISOString(),
            accion: "Evaluación Psicolaboral Registrada",
            autor: rolActual === "evaluador" ? "Carolina Díaz (Evaluador)" : "Profesional Evaluador",
            rol: rolActual,
            detalle: `Dictamen: ${dictamenOficial}. Fortalezas: ${fortalezas.length}, Debilidades: ${debilidades.length}.`,
        };
        const nuevoHistorial = [...historialLocal, nuevoItemHistorial];
        setHistorialLocal(nuevoHistorial);

        try {
            // 1. Guardar en ficha de candidato / postulación
            if (typeof onGuardarEvaluacion === "function" && candidatoActivo.id) {
                await onGuardarEvaluacion(candidatoActivo.id, {
                    resultadoPsicologico: dictamenOficial,
                    fechaEvaluacion,
                    conclusiones: conclusiones.trim(),
                    fortalezas,
                    debilidades,
                    historial: nuevoHistorial,
                    estado: "Finalizado",
                });
            } else if (typeof onCambiarEstado === "function" && candidatoActivo.id) {
                onCambiarEstado(candidatoActivo.id, "Finalizado");
            }

            // 2. Guardar y sincronizar en informe psicolaboral
            if (typeof onActualizarInforme === "function" && informeActivo?.id) {
                await onActualizarInforme(informeActivo.id, {
                    evaluador: "Carolina Díaz (Evaluador)",
                    fechaEvaluacion,
                    dictamen: dictamenOficial,
                    conclusiones: conclusiones.trim(),
                    fortalezas,
                    debilidades,
                    historialItem: nuevoItemHistorial,
                });
            }

            setMensajeExito(`✓ Dictamen '${dictamenOficial}' guardado y sincronizado exitosamente.`);
            setTimeout(() => setMensajeExito(""), 3500);
        } catch (err) {
            setErrorEvaluacion(err.message || "Error al registrar la evaluación psicolaboral.");
        } finally {
            setEnviando(false);
        }
    };

    // Responder pregunta de jefatura
    const handleEnviarRespuesta = async (preguntaId) => {
        const texto = respuestasInputs[preguntaId]?.trim();
        if (!texto || !informeActivo?.id) return;

        setEnviando(true);
        try {
            const autor =
                rolActual === "evaluador"
                    ? "Carolina Díaz (Evaluador)"
                    : rolActual === "analista"
                    ? "Amaro Villalobos (Analista)"
                    : "Usuario del Sistema";

            if (typeof onAgregarRespuesta === "function") {
                await onAgregarRespuesta(informeActivo.id, preguntaId, {
                    autor,
                    rol: rolActual,
                    texto,
                });
            }

            setRespuestasInputs((prev) => ({ ...prev, [preguntaId]: "" }));
            setMensajeExito("✓ Respuesta registrada en el informe de jefatura.");
            setTimeout(() => setMensajeExito(""), 3000);
        } catch (err) {
            setErrorEvaluacion(err.message || "Error al enviar la respuesta.");
        } finally {
            setEnviando(false);
        }
    };

    // Formular nueva pregunta de jefatura
    const handleEnviarNuevaPregunta = async (e) => {
        e.preventDefault();
        if (!nuevaPreguntaTexto.trim() || !informeActivo?.id) return;

        setEnviando(true);
        try {
            if (typeof onAgregarPregunta === "function") {
                await onAgregarPregunta(informeActivo.id, {
                    texto: nuevaPreguntaTexto.trim(),
                    creadaPor: "Jefe de Área",
                });
            }
            setNuevaPreguntaTexto("");
            setMensajeExito("✓ Pregunta agregada al informe exitosamente.");
            setTimeout(() => setMensajeExito(""), 3000);
        } catch (err) {
            setErrorEvaluacion(err.message || "Error al agregar pregunta.");
        } finally {
            setEnviando(false);
        }
    };

    // Cambiar estado del informe (Cerrar / Reabrir)
    const handleToggleEstadoInforme = async () => {
        if (!informeActivo?.id) return;
        const nuevoEstado = informeActivo.estado === "Abierta" ? "Cerrada" : "Abierta";
        if (typeof onCambiarEstadoInforme === "function") {
            await onCambiarEstadoInforme(informeActivo.id, nuevoEstado);
        } else if (typeof onCambiarEstado === "function") {
            await onCambiarEstado(informeActivo.id, nuevoEstado);
        }
    };

    // Insignias visuales
    const configDictamen = obtenerConfigDictamen(resultadoPsicologico);
    const fechaLimiteObj = informeActivo?.fechaLimite ? new Date(`${informeActivo.fechaLimite}T23:59:59`) : null;
    const fueraDePlazo = fechaLimiteObj ? new Date() > fechaLimiteObj : false;

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div
                className="modal-contenido"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                style={{
                    maxWidth: "1020px",
                    width: "96%",
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    padding: 0,
                    overflow: "hidden",
                }}
            >
                {/* ==================== HEADER UNIFICADO ==================== */}
                <div
                    style={{
                        padding: "16px 22px",
                        backgroundColor: "#162936",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "3px solid #f37021",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>
                                    {candidatoActivo.nombre || `${nombresMostrar} ${apellidosMostrar}`}
                                </h3>
                                <span
                                    style={{
                                        backgroundColor: configDictamen.bg,
                                        color: configDictamen.color,
                                        border: `1px solid ${configDictamen.borde}`,
                                        padding: "3px 9px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    {configDictamen.valor !== "Pendiente" && "● "}
                                    {configDictamen.label}
                                </span>
                            </div>
                            <span style={{ fontSize: "12px", color: "#a8c0d2" }}>
                                RUT: {candidatoActivo.rut} · Cargo: {candidatoActivo.cargo || candidatoActivo.especialidad} · Planta: {candidatoActivo.planta || "Puerto Montt"}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                            type="button"
                            className="modal-cerrar-btn"
                            onClick={onCerrar}
                            aria-label="Cerrar modal"
                            style={{ color: "white", fontSize: "24px" }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* ==================== CUERPO EN SPLIT VIEW ==================== */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "340px 1fr",
                        flex: 1,
                        overflowY: "auto",
                        minHeight: "480px",
                    }}
                >
                    {/* PANEL IZQUIERDO: FICHA COMPLETA DEL POSTULANTE */}
                    <div
                        style={{
                            backgroundColor: "#f8f9fa",
                            borderRight: "1px solid #dee2e6",
                            padding: "18px 20px",
                            overflowY: "auto",
                            fontSize: "13px",
                        }}
                    >
                        <h4
                            style={{
                                margin: "0 0 14px 0",
                                fontSize: "13.5px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                color: "#004085",
                                borderBottom: "2px solid #cfe2ff",
                                paddingBottom: "6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <Icono nombre="user" size={15} />
                            Ficha del Postulante
                        </h4>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div>
                                <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>RUT Oficial</span>
                                <strong style={{ fontSize: "13.5px" }}>{candidatoActivo.rut}</strong>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>Nombres</span>
                                    <span>{nombresMostrar}</span>
                                </div>
                                <div>
                                    <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>Apellidos</span>
                                    <span>{apellidosMostrar}</span>
                                </div>
                            </div>

                            <div>
                                <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>Fecha de Nacimiento / Edad</span>
                                <span>
                                    {candidatoActivo.fecha_nacimiento ? (
                                        <>
                                            {candidatoActivo.fecha_nacimiento}{" "}
                                            {edad !== null && (
                                                <span
                                                    style={{
                                                        backgroundColor: "#e8f5e9",
                                                        color: "#2e7d32",
                                                        padding: "2px 6px",
                                                        borderRadius: "10px",
                                                        fontSize: "11px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    ({edad} años)
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <em style={{ color: "#999" }}>No registrada</em>
                                    )}
                                </span>
                            </div>

                            <div>
                                <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>Ubicación</span>
                                <span>
                                    {candidatoActivo.direccion && candidatoActivo.direccion !== "Dirección no informada"
                                        ? `${candidatoActivo.direccion}, `
                                        : ""}
                                    <strong>{candidatoActivo.comuna || candidatoActivo.planta || "Zona Sur"}</strong>
                                </span>
                            </div>

                            <div>
                                <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>Contacto</span>
                                <div>{candidatoActivo.email || "Sin correo"}</div>
                                {candidatoActivo.telefono && (
                                    <div style={{ color: "#495057", fontSize: "12px" }}>Tel: {candidatoActivo.telefono}</div>
                                )}
                            </div>

                            {/* Botón Ver Curriculum Vitae */}
                            <div style={{ marginTop: "6px", paddingTop: "10px", borderTop: "1px dashed #dee2e6" }}>
                                <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block", marginBottom: "4px" }}>
                                    Currículum Vitae (CV)
                                </span>
                                {cvArchivo ? (
                                    <button
                                        type="button"
                                        onClick={() => abrirCvDocumento(candidatoActivo)}
                                        className="btn btn-sm d-inline-flex align-items-center gap-2"
                                        style={{
                                            width: "100%",
                                            justifyContent: "center",
                                            backgroundColor: "#e7f1ff",
                                            color: "#0c63e4",
                                            border: "1px solid #b6d4fe",
                                            fontWeight: "600",
                                            fontSize: "12.5px",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                        }}
                                        title="Abrir currículum en nueva pestaña"
                                    >
                                        <Icono nombre="fileText" size={14} />
                                        Ver Documento CV (PDF)
                                        <Icono nombre="externalLink" size={12} />
                                    </button>
                                ) : (
                                    <span style={{ color: "#888", fontStyle: "italic" }}>Sin archivo CV adjunto</span>
                                )}

                                {/* Descarga física de currículum vitae */}
                                <a
                                    href={api.obtenerUrlDescargaCv(candidatoActivo.id)}
                                    download={`CV_${candidatoActivo.nombre || "postulante"}.pdf`}
                                    className="btn btn-sm d-inline-flex align-items-center gap-2"
                                    style={{
                                        width: "100%",
                                        justifyContent: "center",
                                        backgroundColor: "#f0fdf4",
                                        color: "#166534",
                                        border: "1px solid #bbf7d0",
                                        fontWeight: "600",
                                        fontSize: "12px",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        marginTop: "6px",
                                        boxSizing: "border-box",
                                        display: "inline-flex",
                                    }}
                                    title="Descargar copia del currículum en PDF"
                                >
                                    <Icono nombre="download" size={13} />
                                    Descargar CV (PDF)
                                </a>
                            </div>

                            {/* Parámetros de la postulación */}
                            <div style={{ marginTop: "6px", paddingTop: "10px", borderTop: "1px solid #dee2e6" }}>
                                <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>Estado en el Flujo</span>
                                {typeof onCambiarEstado === "function" ? (
                                    <select
                                        className="form-select form-select-sm"
                                        value={candidatoActivo.estado}
                                        onChange={(e) => onCambiarEstado(candidatoActivo.id, e.target.value)}
                                        style={{ marginTop: "4px", fontSize: "12.5px", fontWeight: "600" }}
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En revisión">En revisión</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                ) : (
                                    <span
                                        style={{
                                            display: "inline-block",
                                            marginTop: "3px",
                                            padding: "3px 8px",
                                            borderRadius: "4px",
                                            backgroundColor: "#e2e3e5",
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {candidatoActivo.estado}
                                    </span>
                                )}
                            </div>

                            {candidatoActivo.antecedentes && (
                                <div style={{ marginTop: "6px" }}>
                                    <span style={{ color: "#6c757d", fontSize: "11.5px", display: "block" }}>Antecedentes</span>
                                    <p style={{ margin: "2px 0 0 0", color: "#495057", fontSize: "12px", fontStyle: "italic" }}>
                                        {candidatoActivo.antecedentes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PANEL DERECHO: PESTAÑAS UNIFICADAS */}
                    <div style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
                        {/* Selector de Pestañas Unificadas */}
                        <div
                            style={{
                                display: "flex",
                                borderBottom: "1px solid #dee2e6",
                                backgroundColor: "#fdfefe",
                                padding: "0 18px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setTabActiva("evaluacion")}
                                style={{
                                    padding: "13px 18px",
                                    border: "none",
                                    borderBottom: tabActiva === "evaluacion" ? "3px solid #f37021" : "3px solid transparent",
                                    backgroundColor: "transparent",
                                    fontWeight: tabActiva === "evaluacion" ? "700" : "600",
                                    color: tabActiva === "evaluacion" ? "#f37021" : "#555",
                                    cursor: "pointer",
                                    fontSize: "13.5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <Icono nombre="clipboard" size={15} />
                                Evaluación Psicolaboral
                                <span
                                    style={{
                                        fontSize: "11px",
                                        padding: "1px 6px",
                                        borderRadius: "10px",
                                        backgroundColor: configDictamen.bg,
                                        color: configDictamen.color,
                                        fontWeight: "700",
                                    }}
                                >
                                    {configDictamen.label}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTabActiva("preguntas")}
                                style={{
                                    padding: "13px 18px",
                                    border: "none",
                                    borderBottom: tabActiva === "preguntas" ? "3px solid #f37021" : "3px solid transparent",
                                    backgroundColor: "transparent",
                                    fontWeight: tabActiva === "preguntas" ? "700" : "600",
                                    color: tabActiva === "preguntas" ? "#f37021" : "#555",
                                    cursor: "pointer",
                                    fontSize: "13.5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <Icono nombre="message" size={15} />
                                Consultas e Informe de Jefatura
                                {listaPreguntas.length > 0 && (
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            padding: "1px 6px",
                                            borderRadius: "10px",
                                            backgroundColor: "#e2e3e5",
                                            color: "#333",
                                            fontWeight: "700",
                                        }}
                                    >
                                        {listaPreguntas.length}
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setTabActiva("historial")}
                                style={{
                                    padding: "13px 18px",
                                    border: "none",
                                    borderBottom: tabActiva === "historial" ? "3px solid #f37021" : "3px solid transparent",
                                    backgroundColor: "transparent",
                                    fontWeight: tabActiva === "historial" ? "700" : "600",
                                    color: tabActiva === "historial" ? "#f37021" : "#555",
                                    cursor: "pointer",
                                    fontSize: "13.5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <Icono nombre="clock" size={15} />
                                Trazabilidad
                                {historialCompleto.length > 0 && (
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            padding: "1px 6px",
                                            borderRadius: "10px",
                                            backgroundColor: "#e9ecef",
                                            color: "#6c757d",
                                            fontWeight: "700",
                                        }}
                                    >
                                        {historialCompleto.length}
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setTabActiva("asistente_ia")}
                                style={{
                                    padding: "13px 18px",
                                    border: "none",
                                    borderBottom: tabActiva === "asistente_ia" ? "3px solid #6f42c1" : "3px solid transparent",
                                    backgroundColor: "transparent",
                                    fontWeight: tabActiva === "asistente_ia" ? "700" : "600",
                                    color: tabActiva === "asistente_ia" ? "#6f42c1" : "#555",
                                    cursor: "pointer",
                                    fontSize: "13.5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <Icono nombre="clipboard" size={14} />
                                Asistente de Evaluación
                                {analisisIa && (
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            padding: "1px 6px",
                                            borderRadius: "10px",
                                            backgroundColor: "#f3e8ff",
                                            color: "#6b21a8",
                                            fontWeight: "700",
                                        }}
                                    >
                                        {analisisIa.afinidadPorcentaje}%
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Mensajes de Alerta / Éxito */}
                        <div style={{ padding: "0 22px" }}>
                            {mensajeExito && (
                                <div
                                    style={{
                                        marginTop: "14px",
                                        padding: "10px 14px",
                                        backgroundColor: "#d1e7dd",
                                        color: "#0f5132",
                                        border: "1px solid #badbcc",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                    }}
                                >
                                    {mensajeExito}
                                </div>
                            )}

                            {errorEvaluacion && (
                                <div
                                    role="alert"
                                    style={{
                                        marginTop: "14px",
                                        padding: "10px 14px",
                                        backgroundColor: "#f8d7da",
                                        color: "#842029",
                                        border: "1px solid #f5c2c7",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                    }}
                                >
                                    {errorEvaluacion}
                                </div>
                            )}
                        </div>

                        {/* ==================== PESTAÑA 1: EVALUACIÓN PSICOLABORAL TÉCNICA ==================== */}
                        {tabActiva === "evaluacion" && (
                            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                    <h4 style={{ margin: 0, fontSize: "15px", color: "#212529" }}>
                                        Dictamen Técnico y Rúbrica Psicolaboral
                                    </h4>
                                    <span style={{ fontSize: "12px", color: "#6c757d" }}>
                                        Evaluador Responsable: <strong>{candidatoActivo.evaluador || "Carolina Díaz (Evaluador)"}</strong>
                                    </span>
                                </div>

                                {puedeEvaluar ? (
                                    /* Formulario editable para el Profesional Evaluador */
                                    <form onSubmit={handleGuardarEvaluacionCompleta} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                                            <div>
                                                <label htmlFor="select-dictamen-oficial" style={{ fontSize: "12.5px", fontWeight: "700", color: "#333", display: "block", marginBottom: "4px" }}>
                                                    Dictamen Psicolaboral Oficial *
                                                </label>
                                                <select
                                                    id="select-dictamen-oficial"
                                                    value={resultadoPsicologico}
                                                    onChange={(e) => setResultadoPsicologico(e.target.value)}
                                                    className="form-select form-select-sm"
                                                    style={{ fontSize: "13px", fontWeight: "600" }}
                                                >
                                                    <option value="Pendiente">Pendiente (En evaluación)</option>
                                                    {DICTAMENES_PSICOLABORALES.map((dp) => (
                                                        <option key={dp.valor} value={dp.valor}>
                                                            {dp.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="input-fecha-evaluacion" style={{ fontSize: "12.5px", fontWeight: "700", color: "#333", display: "block", marginBottom: "4px" }}>
                                                    Fecha de Evaluación *
                                                </label>
                                                <input
                                                    id="input-fecha-evaluacion"
                                                    type="date"
                                                    value={fechaEvaluacion}
                                                    onChange={(e) => setFechaEvaluacion(e.target.value)}
                                                    className="form-control form-control-sm"
                                                    style={{ fontSize: "13px" }}
                                                />
                                            </div>
                                        </div>

                                        {/* Selector de Fortalezas */}
                                        <div>
                                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#198754", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                                <Icono nombre="check" size={14} /> Fortalezas y Competencias Clave
                                            </label>
                                            <SelectorTagsPsicolaborales
                                                tagsSeleccionados={fortalezas}
                                                onTagsChange={setFortalezas}
                                                sugerencias={TAGS_FORTALEZAS_SUGERIDOS}
                                                colorBase="#198754"
                                                placeholder="Agregar fortaleza..."
                                            />
                                        </div>

                                        {/* Selector de Debilidades / Oportunidades de Mejora */}
                                        <div>
                                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#d63384", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                                <Icono nombre="alert" size={14} /> Aspectos por Desarrollar / Con Reservas
                                            </label>
                                            <SelectorTagsPsicolaborales
                                                tagsSeleccionados={debilidades}
                                                onTagsChange={setDebilidades}
                                                sugerencias={TAGS_DEBILIDADES_SUGERIDAS}
                                                colorBase="#d63384"
                                                placeholder="Agregar aspecto por desarrollar..."
                                            />
                                        </div>

                                        {/* Conclusiones psicolaborales */}
                                        <div>
                                            <label htmlFor="textarea-conclusiones-evaluacion" style={{ fontSize: "12.5px", fontWeight: "700", color: "#333", display: "block", marginBottom: "4px" }}>
                                                Observaciones y Conclusiones Psicolaborales *
                                            </label>
                                            <textarea
                                                id="textarea-conclusiones-evaluacion"
                                                rows={4}
                                                className="form-control"
                                                placeholder="Detalle los hallazgos de la entrevista por competencias, adecuación al perfil del cargo y recomendaciones para la jefatura..."
                                                value={conclusiones}
                                                onChange={(e) => setConclusiones(e.target.value)}
                                                style={{ fontSize: "13px", resize: "vertical" }}
                                            />
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                                            <BotonOrange
                                                type="submit"
                                                texto={enviando ? "Guardando..." : "Guardar Dictamen Psicolaboral"}
                                                disabled={enviando}
                                            />
                                        </div>
                                    </form>
                                ) : (
                                    /* Modo lectura para Analistas y Jefaturas */
                                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        <div
                                            style={{
                                                padding: "14px 16px",
                                                borderRadius: "8px",
                                                backgroundColor: configDictamen.bg,
                                                border: `1px solid ${configDictamen.borde}`,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div>
                                                <span style={{ fontSize: "12px", color: "#555", display: "block" }}>Dictamen Psicolaboral</span>
                                                <strong style={{ fontSize: "16px", color: configDictamen.color }}>
                                                    {configDictamen.label}
                                                </strong>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ fontSize: "12px", color: "#555", display: "block" }}>Fecha de Evaluación</span>
                                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>
                                                    {fechaEvaluacion || "Pendiente"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Fortalezas */}
                                        <div>
                                            <strong style={{ fontSize: "13px", color: "#198754", display: "block", marginBottom: "6px" }}>
                                                Fortalezas Identificadas ({fortalezas.length}):
                                            </strong>
                                            {fortalezas.length > 0 ? (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {fortalezas.map((f, i) => (
                                                        <span
                                                            key={i}
                                                            style={{
                                                                backgroundColor: "#d1e7dd",
                                                                color: "#0f5132",
                                                                border: "1px solid #badbcc",
                                                                padding: "3px 8px",
                                                                borderRadius: "12px",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            ✓ {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: "#888", fontStyle: "italic", fontSize: "12.5px" }}>
                                                    Sin fortalezas registradas aún.
                                                </span>
                                            )}
                                        </div>

                                        {/* Debilidades */}
                                        <div>
                                            <strong style={{ fontSize: "13px", color: "#d63384", display: "block", marginBottom: "6px" }}>
                                                Aspectos por Desarrollar / Con Reservas ({debilidades.length}):
                                            </strong>
                                            {debilidades.length > 0 ? (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {debilidades.map((d, i) => (
                                                        <span
                                                            key={i}
                                                            style={{
                                                                backgroundColor: "#f8d7da",
                                                                color: "#842029",
                                                                border: "1px solid #f5c2c7",
                                                                padding: "3px 8px",
                                                                borderRadius: "12px",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            ⚠ {d}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: "#888", fontStyle: "italic", fontSize: "12.5px" }}>
                                                    Sin observaciones de reserva registradas.
                                                </span>
                                            )}
                                        </div>

                                        {/* Conclusiones */}
                                        <div style={{ backgroundColor: "#fdfefe", border: "1px solid #e9ecef", borderRadius: "8px", padding: "14px" }}>
                                            <strong style={{ fontSize: "13px", color: "#333", display: "block", marginBottom: "4px" }}>
                                                Conclusiones y Recomendaciones del Evaluador:
                                            </strong>
                                            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "#495057", whiteSpace: "pre-line" }}>
                                                {conclusiones || "Evaluación en proceso. El profesional evaluador aún no ha ingresado el dictamen definitivo."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ==================== PESTAÑA 2: CONSULTAS E INFORME DE JEFATURA ==================== */}
                        {tabActiva === "preguntas" && (
                            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
                                {/* Encabezado de estado de la consulta */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "10px 14px",
                                        backgroundColor: "#f8f9fa",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span
                                            style={{
                                                backgroundColor: esInformeAbierto ? "#d1e7dd" : "#e2e3e5",
                                                color: esInformeAbierto ? "#0f5132" : "#495057",
                                                padding: "3px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                fontWeight: "700",
                                            }}
                                        >
                                            {esInformeAbierto ? "● Solicitud Abierta" : "✓ Solicitud Cerrada"}
                                        </span>
                                        {informeActivo?.urgencia && (
                                            <span style={{ fontSize: "12px", fontWeight: "600", color: "#555" }}>
                                                Urgencia: <strong>{informeActivo.urgencia}</strong>
                                            </span>
                                        )}
                                        {fueraDePlazo && (
                                            <span style={{ fontSize: "11.5px", color: "#842029", backgroundColor: "#f8d7da", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                                                ⚠ Fuera de plazo
                                            </span>
                                        )}
                                    </div>

                                    {esJefe && informeActivo && (
                                        <button
                                            type="button"
                                            onClick={handleToggleEstadoInforme}
                                            className="btn btn-sm"
                                            style={{
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                backgroundColor: esInformeAbierto ? "#6c757d" : "#198754",
                                                color: "white",
                                            }}
                                        >
                                            {esInformeAbierto ? "Cerrar Solicitud de Informe" : "Reabrir Solicitud"}
                                        </button>
                                    )}
                                </div>

                                {/* Lista de Preguntas y Respuestas */}
                                {listaPreguntas.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {listaPreguntas.map((pregunta, idx) => (
                                            <div
                                                key={pregunta.id || idx}
                                                style={{
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #ced4da",
                                                    borderRadius: "8px",
                                                    padding: "14px 16px",
                                                }}
                                            >
                                                {/* Pregunta formulada por Jefatura */}
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                                    <strong style={{ fontSize: "13px", color: "#004085", display: "flex", alignItems: "center", gap: "5px" }}>
                                                        <Icono nombre="help" size={13} />
                                                        Pregunta #{idx + 1} de Jefatura ({pregunta.creadaPor || "Jefe de Área"}):
                                                    </strong>
                                                    <span style={{ fontSize: "11px", color: "#6c757d" }}>
                                                        {pregunta.fecha ? new Date(pregunta.fecha).toLocaleDateString("es-CL") : ""}
                                                    </span>
                                                </div>
                                                <p style={{ margin: "0 0 10px 0", fontSize: "13.5px", color: "#212529" }}>
                                                    {pregunta.texto}
                                                </p>

                                                {/* Hilo de Respuestas de Analista / Evaluador */}
                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginLeft: "14px", borderLeft: "2px solid #e9ecef", paddingLeft: "10px" }}>
                                                    {(pregunta.respuestas || []).map((resp, rIdx) => (
                                                        <div
                                                            key={rIdx}
                                                            style={{
                                                                backgroundColor: "#f8f9fa",
                                                                padding: "8px 12px",
                                                                borderRadius: "6px",
                                                                fontSize: "12.5px",
                                                            }}
                                                        >
                                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                                                                <strong style={{ color: "#0f5132" }}>{resp.autor}</strong>
                                                                <span style={{ fontSize: "11px", color: "#888" }}>
                                                                    {resp.fecha ? new Date(resp.fecha).toLocaleDateString("es-CL") : ""}
                                                                </span>
                                                            </div>
                                                            <div style={{ color: "#333" }}>{resp.texto}</div>
                                                        </div>
                                                    ))}

                                                    {/* Campo para que el analista o evaluador responda si el informe está abierto */}
                                                    {puedeResponder && (
                                                        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                placeholder={`Responder como ${rolActual === "evaluador" ? "Evaluador" : "Analista"}...`}
                                                                value={respuestasInputs[pregunta.id] || ""}
                                                                onChange={(e) =>
                                                                    setRespuestasInputs((prev) => ({
                                                                        ...prev,
                                                                        [pregunta.id]: e.target.value,
                                                                    }))
                                                                }
                                                                style={{ fontSize: "12.5px" }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEnviarRespuesta(pregunta.id)}
                                                                disabled={enviando || !respuestasInputs[pregunta.id]?.trim()}
                                                                className="btn btn-sm btn-success"
                                                                style={{ fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}
                                                            >
                                                                Enviar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "30px 20px",
                                            backgroundColor: "#f8f9fa",
                                            borderRadius: "8px",
                                            border: "1px dashed #ced4da",
                                            color: "#6c757d",
                                        }}
                                    >
                                        <Icono nombre="message" size={28} />
                                        <p style={{ margin: "8px 0 4px 0", fontWeight: "600", fontSize: "14px" }}>
                                            No hay consultas formuladas para este candidato
                                        </p>
                                        <span style={{ fontSize: "12px" }}>
                                            {esJefe
                                                ? "Puedes ingresar preguntas específicas a continuación para que sean respondidas por el equipo de reclutamiento y evaluación."
                                                : "El jefe de área aún no ha ingresado preguntas para este postulante."}
                                        </span>
                                    </div>
                                )}

                                {/* Formulario para que Jefatura formule nuevas preguntas */}
                                {puedeRepreguntar && (
                                    <form onSubmit={handleEnviarNuevaPregunta} style={{ marginTop: "10px" }}>
                                        <label htmlFor="input-nueva-pregunta" style={{ fontSize: "12.5px", fontWeight: "700", color: "#333", display: "block", marginBottom: "4px" }}>
                                            Formular Nueva Pregunta a Reclutamiento / Evaluador:
                                        </label>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <input
                                                id="input-nueva-pregunta"
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Ej. ¿Cuenta con disponibilidad inmediata para iniciar turnos de faena en planta?"
                                                value={nuevaPreguntaTexto}
                                                onChange={(e) => setNuevaPreguntaTexto(e.target.value)}
                                                style={{ fontSize: "13px" }}
                                            />
                                            <BotonOrange
                                                type="submit"
                                                texto={enviando ? "Enviando..." : "Preguntar"}
                                                disabled={enviando || !nuevaPreguntaTexto.trim()}
                                            />
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* ==================== PESTAÑA: ASISTENTE DE EVALUACIÓN ==================== */}
                        {tabActiva === "asistente_ia" && (
                            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1, fontSize: "13px" }}>
                                {/* Nota informativa de apoyo orientativo */}
                                <div
                                    style={{
                                        backgroundColor: "#f8fafc",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        padding: "10px 14px",
                                        marginBottom: "16px",
                                        color: "#475569",
                                        fontSize: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <Icono nombre="info" size={16} />
                                    <span>
                                        Las métricas y preguntas generadas son orientativas para apoyar la revisión de antecedentes. La evaluación y decisión corresponden al evaluador responsable.
                                    </span>
                                </div>

                                {/* Encabezado de Acción */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b", fontWeight: "700" }}>
                                            Análisis Orientativo del Perfil
                                        </h4>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                                            Cargo evaluado: <strong>{candidatoActivo.cargo || candidatoActivo.especialidad || "Postulante"}</strong>
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGenerarAnalisisIa}
                                        disabled={cargandoIa}
                                        className="btn btn-sm d-inline-flex align-items-center gap-2"
                                        style={{
                                            backgroundColor: cargandoIa ? "#64748b" : "#4f46e5",
                                            color: "white",
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            border: "none",
                                            fontWeight: "600",
                                            fontSize: "13px",
                                            cursor: cargandoIa ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        <Icono nombre="clipboard" size={14} />
                                        {cargandoIa ? "Analizando perfil..." : analisisIa ? "Actualizar análisis" : "Generar análisis"}
                                    </button>
                                </div>

                                {errorIa && (
                                    <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "6px", marginBottom: "14px" }}>
                                        {errorIa}
                                    </div>
                                )}

                                {/* Resultados del Análisis */}
                                {analisisIa ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        {/* Tarjeta de Afinidad */}
                                        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                <strong style={{ fontSize: "13px", color: "#334155" }}>Índice de Afinidad con el Cargo</strong>
                                                <span style={{ fontSize: "15px", fontWeight: "700", color: analisisIa.afinidadPorcentaje >= 85 ? "#166534" : "#c2410c" }}>
                                                    {analisisIa.afinidadPorcentaje}% ({analisisIa.nivelAfinidad})
                                                </span>
                                            </div>
                                            <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                                                <div
                                                    style={{
                                                        width: `${analisisIa.afinidadPorcentaje}%`,
                                                        height: "100%",
                                                        backgroundColor: analisisIa.afinidadPorcentaje >= 85 ? "#16a34a" : "#f97316",
                                                        transition: "width 0.4s ease",
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Resumen */}
                                        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px" }}>
                                            <h5 style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#1e293b", fontWeight: "700" }}>
                                                Resumen del Perfil
                                            </h5>
                                            <p style={{ margin: 0, lineHeight: "1.5", color: "#334155" }}>
                                                {analisisIa.resumenPerfil}
                                            </p>
                                        </div>

                                        {/* Fortalezas y Aspectos a Profundizar */}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
                                                <strong style={{ color: "#166534", fontSize: "12.5px", display: "block", marginBottom: "6px" }}>
                                                    Fortalezas Detectadas
                                                </strong>
                                                <ul style={{ margin: 0, paddingLeft: "18px", color: "#14532d" }}>
                                                    {(analisisIa.fortalezasDetectadas || []).map((f, i) => (
                                                        <li key={i} style={{ marginBottom: "3px" }}>{f}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px" }}>
                                                <strong style={{ color: "#92400e", fontSize: "12.5px", display: "block", marginBottom: "6px" }}>
                                                    Aspectos a Profundizar
                                                </strong>
                                                <ul style={{ margin: 0, paddingLeft: "18px", color: "#78350f" }}>
                                                    {(analisisIa.puntosAIndagar || []).map((p, i) => (
                                                        <li key={i} style={{ marginBottom: "3px" }}>{p}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Preguntas Recomendadas para la Entrevista */}
                                        <div style={{ backgroundColor: "#fdf4ff", border: "1px solid #f5d0fe", borderRadius: "8px", padding: "14px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                                <h5 style={{ margin: 0, fontSize: "13.5px", color: "#701a75", fontWeight: "700" }}>
                                                    Preguntas Sugeridas para la Entrevista
                                                </h5>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const textoPreguntas = (analisisIa.preguntasEntrevistaSugeridas || [])
                                                            .map((p, idx) => `${idx + 1}. ${p}`)
                                                            .join("\n");
                                                        navigator.clipboard?.writeText(textoPreguntas);
                                                        setCopiadoPreguntas(true);
                                                        setTimeout(() => setCopiadoPreguntas(false), 2500);
                                                    }}
                                                    style={{
                                                        background: "#701a75",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "4px 10px",
                                                        borderRadius: "4px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {copiadoPreguntas ? "Copiadas" : "Copiar preguntas"}
                                                </button>
                                            </div>

                                            <ol style={{ margin: 0, paddingLeft: "20px", color: "#581c87", lineHeight: "1.5" }}>
                                                {(analisisIa.preguntasEntrevistaSugeridas || []).map((preg, idx) => (
                                                    <li key={idx} style={{ marginBottom: "6px" }}>
                                                        {preg}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            border: "2px dashed #cbd5e1",
                                            borderRadius: "8px",
                                            padding: "36px 20px",
                                            textAlign: "center",
                                            color: "#64748b",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                            <Icono nombre="clipboard" size={28} color="#94a3b8" />
                                        </div>
                                        <p style={{ margin: 0, fontWeight: "600", color: "#334155" }}>
                                            Análisis de adecuación disponible para {candidatoActivo.nombre}
                                        </p>
                                        <p style={{ margin: "4px 0 16px 0", fontSize: "12px", color: "#64748b" }}>
                                            Haga clic a continuación para estimar la afinidad con el cargo y obtener sugerencias para la entrevista.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleGenerarAnalisisIa}
                                            disabled={cargandoIa}
                                            style={{
                                                backgroundColor: "#4f46e5",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 18px",
                                                borderRadius: "6px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                            }}
                                        >
                                            Generar análisis
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
