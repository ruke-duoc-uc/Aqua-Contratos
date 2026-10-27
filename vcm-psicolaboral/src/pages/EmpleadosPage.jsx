import { useState, useEffect } from "react";
import HeaderRoles from "../components/HeaderRoles";
import PanelPostulantesView from "../components/PanelPostulantesView";
import GestionCandidatosView from "../components/GestionCandidatosView";
import BandejaInformesView from "../components/BandejaInformesView";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalEditarCandidato from "../components/ModalEditarCandidato";
import ModalNuevaSolicitud from "../components/ModalNuevaSolicitud";
import ModalSolicitarInforme from "../components/ModalSolicitarInforme";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import AlertaExitoCerrable from "../components/AlertaExitoCerrable";

import { api } from "../services/api";
import {
    cargarPostulacionesGlobales,

    actualizarFasePostulacion,
    actualizarPostulacionGlobal,
    EVENTO_ACTUALIZACION_POSTULACIONES,
} from "../services/postulacionesStorage";
import {
    cargarCandidatosGlobales,
    guardarCandidatosGlobales,
    EVENTO_ACTUALIZACION_CANDIDATOS,
} from "../services/candidatosStorage";
import {
    cargarInformesIniciales,
    guardarInformesLocal,
} from "../services/informesStorage";

const PUESTOS_BASE = [
    { id: 1, titulo: "Desarrollador Full Stack", planta: "Puerto Montt", vacantes: 2, estado: "Abierto" },
    { id: 2, titulo: "Prevencionista de Faena", planta: "Osorno", vacantes: 1, estado: "Abierto" },
    { id: 3, titulo: "Técnico de Mantenimiento", planta: "Puerto Varas", vacantes: 3, estado: "Abierto" },
    { id: 4, titulo: "Asistente Administrativo", planta: "Puerto Montt", vacantes: 1, estado: "Abierto" },
    { id: 5, titulo: "Eléctrico de Turno", planta: "Castro", vacantes: 2, estado: "Abierto" },
    { id: 6, titulo: "Coordinador de Despacho", planta: "Calbuco", vacantes: 1, estado: "Abierto" },
];

function EmpleadosPage({ onVolver, rolInicial = "jefatura" }) {
    const [rolActual, setRolActual] = useState(rolInicial);
    const [tabActiva, setTabActiva] = useState("postulantes"); // "postulantes", "candidatos", "evaluaciones"
    
    const [puestos, setPuestos] = useState(PUESTOS_BASE);
    const [postulaciones, setPostulaciones] = useState(cargarPostulacionesGlobales);
    const [candidatos, setCandidatos] = useState(cargarCandidatosGlobales);
    const [informes, setInformes] = useState(cargarInformesIniciales);

    // Estados para Modales
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [candidatoAEditar, setCandidatoAEditar] = useState(null);
    const [modalNuevoCandidatoAbierto, setModalNuevoCandidatoAbierto] = useState(false);
    const [modalSolicitarInformeAbierto, setModalSolicitarInformeAbierto] = useState(false);
    const [informeSeleccionado, setInformeSeleccionado] = useState(null);
    const [alertaExito, setAlertaExito] = useState("");

    // Cargar ofertas activas desde API si está disponible
    useEffect(() => {
        let isMounted = true;
        async function cargarPuestos() {
            try {
                const remotos = await api.getPuestos({ estado: "Abierto" });
                if (isMounted && Array.isArray(remotos) && remotos.length > 0) {
                    setPuestos(remotos);
                }
            } catch {
                // Mantiene puestos locales
            }
        }
        cargarPuestos();
        return () => {
            isMounted = false;
        };
    }, []);

    // Sincronización en tiempo real de postulaciones
    useEffect(() => {
        const handleRecargarPostulaciones = () => {
            const actualizadas = cargarPostulacionesGlobales();
            setPostulaciones(actualizadas);
        };
        window.addEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleRecargarPostulaciones);
        window.addEventListener("storage", handleRecargarPostulaciones);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleRecargarPostulaciones);
            window.removeEventListener("storage", handleRecargarPostulaciones);
        };
    }, []);

    // Sincronización en tiempo real de candidatos
    useEffect(() => {
        const handleRecargarCandidatos = () => {
            const actualizados = cargarCandidatosGlobales();
            setCandidatos(actualizados);
        };
        window.addEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargarCandidatos);
        window.addEventListener("storage", handleRecargarCandidatos);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargarCandidatos);
            window.removeEventListener("storage", handleRecargarCandidatos);
        };
    }, []);

    // Manejo de cambio de fase en postulaciones
    const handleCambiarFase = (id, nuevaFase) => {
        actualizarFasePostulacion(id, nuevaFase);
        setPostulaciones((prev) =>
            prev.map((p) => (p.id === id ? { ...p, fase: nuevaFase } : p))
        );
        if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
            setSolicitudSeleccionada((prev) => ({ ...prev, fase: nuevaFase }));
        }
        setAlertaExito(`✓ Condición del postulante actualizada a '${nuevaFase}'`);
        setTimeout(() => setAlertaExito(""), 3500);
    };

    // Manejo de dictamen y evaluación psicológica formal
    const handleGuardarEvaluacion = (id, evaluacionData) => {
        // 1. Actualizar en postulaciones
        actualizarPostulacionGlobal(id, {
            dictamenPsicologico: evaluacionData.resultadoPsicologico,
            conclusiones: evaluacionData.conclusiones,
            fechaEvaluacion: evaluacionData.fechaEvaluacion,
            fase: evaluacionData.resultadoPsicologico === "Recomendado" ? "aceptado" : evaluacionData.resultadoPsicologico === "No recomendado" ? "rechazado" : "en entrevista",
        });

        // 2. Actualizar en candidatos
        const candidatosActualizados = candidatos.map((c) =>
            c.id === id ? { ...c, ...evaluacionData } : c
        );
        setCandidatos(candidatosActualizados);
        guardarCandidatosGlobales(candidatosActualizados);

        // 3. Actualizar estado local
        setPostulaciones(cargarPostulacionesGlobales());
        if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
            setSolicitudSeleccionada((prev) => ({ ...prev, ...evaluacionData }));
        }

        setAlertaExito(`✓ Evaluación psicológica registrada exitosamente para el postulante.`);
        setTimeout(() => setAlertaExito(""), 4000);
    };

    // Manejo de cambio de estado legacy (RF08)
    const handleCambiarEstado = (id, nuevoEstado) => {
        const candidatosActualizados = candidatos.map((c) =>
            c.id === id ? { ...c, estado: nuevoEstado } : c
        );
        setCandidatos(candidatosActualizados);
        guardarCandidatosGlobales(candidatosActualizados);

        actualizarPostulacionGlobal(id, { estado: nuevoEstado });
        setPostulaciones(cargarPostulacionesGlobales());
        if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
            setSolicitudSeleccionada((prev) => ({ ...prev, estado: nuevoEstado }));
        }
    };

    // Guardar edición de candidato (RF02)
    const handleGuardarEdicionCandidato = (candidatoActualizado) => {
        const actualizados = candidatos.map((c) =>
            c.id === candidatoActualizado.id ? candidatoActualizado : c
        );
        setCandidatos(actualizados);
        guardarCandidatosGlobales(actualizados);
        setCandidatoAEditar(null);
        setAlertaExito(`✓ Información de ${candidatoActualizado.nombre} actualizada correctamente.`);
        setTimeout(() => setAlertaExito(""), 4000);
    };

    // Guardar nuevo candidato manual
    const handleGuardarNuevoCandidato = (nuevo) => {
        const actualizados = [nuevo, ...candidatos.filter((c) => c.id !== nuevo.id)];
        setCandidatos(actualizados);
        guardarCandidatosGlobales(actualizados);
        setModalNuevoCandidatoAbierto(false);
        setAlertaExito(`✓ Nuevo candidato ${nuevo.nombre} agregado al catálogo general.`);
        setTimeout(() => setAlertaExito(""), 4000);
    };

    // ==================== INFORMES / PREGUNTAS DEL JEFE ====================
    const handleCrearSolicitudInforme = (datos) => {
        const nuevoId = informes.length > 0 ? Math.max(...informes.map((i) => Number(i.id) || 0)) + 1 : 1;
        const nuevoInforme = {
            id: nuevoId,
            ...datos,
            estado: "Abierta",
            fechaCreacion: new Date().toISOString(),
            solicitante: rolActual === "jefatura" ? "Jefe de Área" : "Jefatura de Área",
            preguntas: (datos.preguntas || []).map((p, idx) => ({
                id: idx + 1,
                texto: typeof p === "string" ? p : p.texto || "",
                fecha: new Date().toISOString(),
                creadaPor: "Jefe de Área",
                respuestas: [],
            })),
        };
        const actualizados = [nuevoInforme, ...informes];
        setInformes(actualizados);
        guardarInformesLocal(actualizados);
        setModalSolicitarInformeAbierto(false);
        setAlertaExito(`✓ Solicitud de informe y preguntas del jefe formuladas con éxito.`);
        setTimeout(() => setAlertaExito(""), 4000);
    };

    const handleAgregarPreguntaInforme = (id, datosPregunta) => {
        const actualizados = informes.map((inf) => {
            if (inf.id === id) {
                const nuevaPreguntaId = (inf.preguntas || []).length > 0
                    ? Math.max(...inf.preguntas.map((p) => Number(p.id) || 0)) + 1
                    : 1;
                const nuevaP = {
                    id: nuevaPreguntaId,
                    texto: datosPregunta.texto,
                    fecha: new Date().toISOString(),
                    creadaPor: "Jefe de Área",
                    respuestas: [],
                };
                const upd = { ...inf, preguntas: [...(inf.preguntas || []), nuevaP] };
                if (informeSeleccionado && informeSeleccionado.id === id) {
                    setInformeSeleccionado(upd);
                }
                return upd;
            }
            return inf;
        });
        setInformes(actualizados);
        guardarInformesLocal(actualizados);
        setAlertaExito(`✓ Nueva pregunta agregada al informe por Jefatura.`);
        setTimeout(() => setAlertaExito(""), 3500);
    };

    const handleResponderPreguntaInforme = (informeId, preguntaId, datosRespuesta) => {
        const actualizados = informes.map((inf) => {
            if (inf.id === informeId) {
                const preguntasAct = (inf.preguntas || []).map((p) => {
                    if (p.id === preguntaId) {
                        const rId = (p.respuestas || []).length + 1;
                        return {
                            ...p,
                            respuestas: [
                                ...(p.respuestas || []),
                                { id: rId, ...datosRespuesta, fecha: new Date().toISOString() },
                            ],
                        };
                    }
                    return p;
                });
                const act = { ...inf, preguntas: preguntasAct };
                if (informeSeleccionado && informeSeleccionado.id === informeId) {
                    setInformeSeleccionado(act);
                }
                return act;
            }
            return inf;
        });
        setInformes(actualizados);
        guardarInformesLocal(actualizados);
        setAlertaExito(`✓ Respuesta a la pregunta del jefe enviada exitosamente.`);
        setTimeout(() => setAlertaExito(""), 3500);
    };

    const handleCambiarEstadoInforme = (id, nuevoEstado) => {
        const actualizados = informes.map((inf) => {
            if (inf.id === id) {
                const upd = { ...inf, estado: nuevoEstado };
                if (informeSeleccionado && informeSeleccionado.id === id) {
                    setInformeSeleccionado(upd);
                }
                return upd;
            }
            return inf;
        });
        setInformes(actualizados);
        guardarInformesLocal(actualizados);
    };

    return (
        <main
            style={{
                backgroundColor: "#F0F8FF",
                fontFamily: "Arial, Helvetica, sans-serif",
                padding: "20px",
                minHeight: "100vh",
            }}
        >
            {/* Header unificado para empleados con las 3 pestañas y selector de rol */}
            <HeaderRoles
                rolActual={rolActual}
                tabActiva={tabActiva}
                onCambiarTab={setTabActiva}
                onCambiarRol={setRolActual}
                onVolver={onVolver}
            />

            {alertaExito && (
                <div style={{ margin: "16px 0" }}>
                    <AlertaExitoCerrable
                        mensaje={alertaExito}
                        onCerrar={() => setAlertaExito("")}
                    />
                </div>
            )}

            {/* PESTAÑA 1: POSTULANTES */}
            {tabActiva === "postulantes" && (
                <div style={{ marginTop: "16px" }}>
                    <PanelPostulantesView
                        puestos={puestos}
                        postulaciones={postulaciones}
                        onVerDetalle={(postulacion) => setSolicitudSeleccionada(postulacion)}
                        onCambiarFase={handleCambiarFase}
                    />
                </div>
            )}

            {/* PESTAÑA 2: CANDIDATOS */}
            {tabActiva === "candidatos" && (
                <div style={{ marginTop: "16px" }}>
                    <GestionCandidatosView
                        candidatos={candidatos}
                        rolActual={rolActual}
                        onAbrirNuevoCandidato={() => setModalNuevoCandidatoAbierto(true)}
                        onEditarCandidato={(c) => setCandidatoAEditar(c)}
                        onVerDetalle={(c) => setSolicitudSeleccionada(c)}
                    />
                </div>
            )}

            {/* PESTAÑA 3: EVALUACIONES (Conserva todas las funciones de Informes y Preguntas del Jefe) */}
            {tabActiva === "evaluaciones" && (
                <div style={{ marginTop: "16px" }}>
                    <BandejaInformesView
                        informes={informes}
                        rolActual={rolActual}
                        onAbrirCrear={() => setModalSolicitarInformeAbierto(true)}
                        onVerDetalle={(inf) => setInformeSeleccionado(inf)}
                    />
                </div>
            )}

            {/* MODAL DETALLE DE POSTULANTE / CANDIDATO */}
            {solicitudSeleccionada && (
                <ModalDetalleSolicitud
                    solicitud={solicitudSeleccionada}
                    isOpen={Boolean(solicitudSeleccionada)}
                    onCerrar={() => setSolicitudSeleccionada(null)}
                    onCambiarEstado={handleCambiarEstado}
                    onGuardarEvaluacion={handleGuardarEvaluacion}
                    onCambiarFase={handleCambiarFase}
                    rolActual={rolActual}
                />
            )}

            {/* MODAL EDITAR CANDIDATO */}
            {candidatoAEditar && (
                <ModalEditarCandidato
                    candidato={candidatoAEditar}
                    isOpen={Boolean(candidatoAEditar)}
                    onCerrar={() => setCandidatoAEditar(null)}
                    onGuardar={handleGuardarEdicionCandidato}
                />
            )}

            {/* MODAL NUEVO CANDIDATO MANUAL */}
            {modalNuevoCandidatoAbierto && (
                <ModalNuevaSolicitud
                    isOpen={modalNuevoCandidatoAbierto}
                    onCerrar={() => setModalNuevoCandidatoAbierto(false)}
                    onGuardar={handleGuardarNuevoCandidato}
                />
            )}

            {/* MODAL SOLICITAR INFORME Y FORMULAR PREGUNTAS (JEFATURA) */}
            {modalSolicitarInformeAbierto && (
                <ModalSolicitarInforme
                    isOpen={modalSolicitarInformeAbierto}
                    candidatos={candidatos}
                    onCerrar={() => setModalSolicitarInformeAbierto(false)}
                    onCrear={handleCrearSolicitudInforme}
                />
            )}

            {/* MODAL DETALLE DE INFORME (PREGUNTAS DEL JEFE Y RESPUESTAS) */}
            {informeSeleccionado && (
                <ModalDetalleInforme
                    informe={informeSeleccionado}
                    isOpen={Boolean(informeSeleccionado)}
                    candidatos={candidatos}
                    rolActual={rolActual}
                    onCerrar={() => setInformeSeleccionado(null)}
                    onAgregarPregunta={handleAgregarPreguntaInforme}
                    onAgregarRespuesta={handleResponderPreguntaInforme}
                    onCambiarEstado={handleCambiarEstadoInforme}
                />
            )}
        </main>
    );
}

export default EmpleadosPage;
