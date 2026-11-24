import { useState, useMemo, useEffect } from "react";
import HeaderRoles from "../components/HeaderRoles";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import PostulantesPorPuestoView from "../components/PostulantesPorPuestoView";
import AgendaEntrevistasView from "../components/AgendaEntrevistasView";
import { api } from "../services/api";
import {
    cargarCandidatosGlobales,
    guardarCandidatosGlobales,
    EVENTO_ACTUALIZACION_CANDIDATOS,
} from "../services/candidatosStorage";
import {
    cargarPostulacionesGlobales,
    guardarPostulacionesGlobales,
    EVENTO_ACTUALIZACION_POSTULACIONES,
} from "../services/postulacionesStorage";
import { cargarInformesIniciales, guardarInformesLocal } from "../services/informesStorage";
import GrillaIndicadores from "../components/GrillaIndicadores";
import BannerEstadoBackend from "../components/BannerEstadoBackend";
import AlertaExitoCerrable from "../components/AlertaExitoCerrable";
import EncabezadoDashboard from "../components/EncabezadoDashboard.jsx";
import EncabezadoRegistro from "../components/EncabezadoRegistro";
import PanelSolicitudes from "../components/PanelSolicitudes";

import { PLANTAS_DISPONIBLES, EVALUADORES_DISPONIBLES } from "../utils/constantes";
import { calcularIndicadores, aplicarFiltros } from "../utils/solicitudesUtils";

function EvaluadorPage({ onVolver }) {
    const rolActual = "evaluador";
    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarCandidatosGlobales);
    const [postulaciones, setPostulaciones] = useState(cargarPostulacionesGlobales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [alertaExito, setAlertaExito] = useState("");
    const [informes, setInformes] = useState(cargarInformesIniciales);
    const [informeSeleccionado, setInformeSeleccionado] = useState(null);

    // Sincronización en tiempo real con postulantes inscritos desde la pantalla pública o cambios de rol
    useEffect(() => {
        const handleRecargar = () => {
            const actualizados = cargarCandidatosGlobales();
            setCandidatos(actualizados);
        };
        const handleRecargarPostulaciones = () => {
            const actualizadas = cargarPostulacionesGlobales();
            setPostulaciones(actualizadas);
        };
        window.addEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargar);
        window.addEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleRecargarPostulaciones);
        window.addEventListener("storage", handleRecargar);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargar);
            window.removeEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleRecargarPostulaciones);
            window.removeEventListener("storage", handleRecargar);
        };
    }, []);

    // Filtros de búsqueda
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [filtroPlanta, setFiltroPlanta] = useState("todas");
    const [filtroEvaluador, setFiltroEvaluador] = useState("todos");

    useEffect(() => {
        let isMounted = true;
        async function sincronizarConBackend() {
            setCargandoApi(true);
            try {
                const [datosRemotos, informesRemotos, postulacionesRemotas] = await Promise.all([
                    api.getSolicitudes(),
                    api.getSolicitudesInforme().catch(() => null),
                    api.getPostulaciones().catch(() => null),
                ]);

                if (isMounted && Array.isArray(datosRemotos)) {
                    const formateados = datosRemotos.map((item) => ({
                        ...item,
                        fecha: new Date(item.fecha),
                    }));
                    setCandidatos(formateados);
                    guardarCandidatosGlobales(formateados);
                    setBackendConectado(true);
                }

                if (isMounted && Array.isArray(informesRemotos)) {
                    setInformes(informesRemotos);
                    guardarInformesLocal(informesRemotos);
                }

                if (isMounted && Array.isArray(postulacionesRemotas)) {
                    setPostulaciones(postulacionesRemotas);
                    guardarPostulacionesGlobales(postulacionesRemotas);
                }
            } catch (err) {
                console.warn("Backend no disponible:", err.message);
                if (isMounted) setBackendConectado(false);
            } finally {
                if (isMounted) setCargandoApi(false);
            }
        }
        sincronizarConBackend();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleActualizarInformeEvaluador = async (id, datosActualizados) => {
        try {
            const actualizado = await api.actualizarDictamenInforme(id, datosActualizados);
            setInformes((prev) => {
                const actualizados = prev.map((inf) => (inf.id === id ? { ...inf, ...actualizado } : inf));
                guardarInformesLocal(actualizados);
                return actualizados;
            });
            setInformeSeleccionado((prev) => (prev?.id === id ? { ...prev, ...actualizado } : prev));
        } catch {
            setInformes((prev) => {
                const actualizados = prev.map((inf) => {
                    if (inf.id === id) {
                        const nuevoHistorial = [
                            ...(inf.historial || []),
                            ...(datosActualizados.historialItem ? [{ fecha: new Date().toISOString(), ...datosActualizados.historialItem }] : []),
                        ];
                        return {
                            ...inf,
                            ...datosActualizados,
                            historial: nuevoHistorial,
                        };
                    }
                    return inf;
                });
                guardarInformesLocal(actualizados);
                return actualizados;
            });
            setInformeSeleccionado((prev) => {
                if (prev?.id === id) {
                    return {
                        ...prev,
                        ...datosActualizados,
                        historial: [
                            ...(prev.historial || []),
                            ...(datosActualizados.historialItem ? [{ fecha: new Date().toISOString(), ...datosActualizados.historialItem }] : []),
                        ],
                    };
                }
                return prev;
            });
        }
    };

    const handleAgendarEntrevista = async ({ postulacionId, fechaEntrevista, evaluadorAsignado, observaciones }) => {
        try {
            const actualizado = await api.agendarEntrevistaPostulacion(postulacionId, {
                fechaEntrevista,
                evaluadorAsignado,
                observaciones,
            });
            setPostulaciones((prev) => {
                const list = prev.map((p) => (p.id === postulacionId ? { ...p, ...actualizado } : p));
                guardarPostulacionesGlobales(list);
                return list;
            });
            setAlertaExito("Entrevista laboral agendada exitosamente.");
        } catch {
            // Fallback local
            setPostulaciones((prev) => {
                const list = prev.map((p) => {
                    if (p.id === postulacionId) {
                        return {
                            ...p,
                            fechaEntrevista,
                            evaluadorAsignado,
                            observaciones,
                            fase: "en entrevista",
                            estado: "Entrevista agendada",
                        };
                    }
                    return p;
                });
                guardarPostulacionesGlobales(list);
                return list;
            });
            setAlertaExito("Entrevista laboral agendada exitosamente.");
        }
    };

    const handleAgregarRespuestaInforme = async (id, preguntaId, datosRespuesta) => {
        try {
            const actualizado = await api.agregarRespuestaInforme(id, preguntaId, datosRespuesta);
            setInformes((prev) => {
                const actualizados = prev.map((inf) => (inf.id === id ? actualizado : inf));
                guardarInformesLocal(actualizados);
                return actualizados;
            });
            setInformeSeleccionado(actualizado);
        } catch {
            // Fallback modo local (localStorage)
            setInformes((prev) => {
                const actualizados = prev.map((inf) => {
                    if (inf.id === id) {
                        const preguntasActualizadas = (inf.preguntas || []).map((p) => {
                            if (p.id === preguntaId) {
                                const nuevaRespId = (p.respuestas || []).length > 0
                                    ? Math.max(...p.respuestas.map((r) => Number(r.id) || 0)) + 1
                                    : 1;
                                return {
                                    ...p,
                                    respuestas: [
                                        ...(p.respuestas || []),
                                        { id: nuevaRespId, ...datosRespuesta, fecha: new Date().toISOString() },
                                    ],
                                };
                            }
                            return p;
                        });
                        const upd = { ...inf, preguntas: preguntasActualizadas };
                        setInformeSeleccionado(upd);
                        return upd;
                    }
                    return inf;
                });
                guardarInformesLocal(actualizados);
                return actualizados;
            });
        }
    };

    const indicadores = useMemo(() => calcularIndicadores(candidatos), [candidatos]);

    const solicitudesFiltradas = useMemo(() => {
        return aplicarFiltros(candidatos, {
            busqueda,
            filtroEstado,
            filtroPlanta,
            filtroEvaluador,
        });
    }, [candidatos, busqueda, filtroEstado, filtroPlanta, filtroEvaluador]);

    const handleLimpiarFiltros = () => {
        setBusqueda("");
        setFiltroEstado("todos");
        setFiltroPlanta("todas");
        setFiltroEvaluador("todos");
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        setCandidatos((prev) => {
            const actualizados = prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c));
            guardarCandidatosGlobales(actualizados);
            return actualizados;
        });
        if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
            setSolicitudSeleccionada((prev) => ({ ...prev, estado: nuevoEstado }));
        }

        try {
            await api.cambiarEstadoSolicitud(id, nuevoEstado);
            setBackendConectado(true);
        } catch (err) {
            console.warn("Estado local:", err.message);
        }
    };

    const handleGuardarEvaluacion = async (id, evaluacionData) => {
        // 1. Sincronizar en el informe psicolaboral (Fuente única de verdad)
        const informeRelacionado = informes.find((inf) => {
            const mismoCandidatoId = inf.candidatoId && (String(inf.candidatoId) === String(solicitudSeleccionada?.candidatoId || id));
            const mismoNombre = inf.candidatoNombre && solicitudSeleccionada?.nombre && inf.candidatoNombre.toLowerCase() === solicitudSeleccionada.nombre.toLowerCase();
            const mismaPostulacion = inf.postulacionId && (String(inf.postulacionId) === String(id));
            return mismoCandidatoId || mismoNombre || mismaPostulacion;
        });

        if (informeRelacionado) {
            handleActualizarInformeEvaluador(informeRelacionado.id, {
                evaluador: "Carolina Díaz (Evaluador)",
                fechaEvaluacion: evaluacionData.fechaEvaluacion,
                dictamen: evaluacionData.resultadoPsicologico,
                conclusiones: evaluacionData.conclusiones,
                fortalezas: evaluacionData.fortalezas || [],
                debilidades: evaluacionData.debilidades || [],
                historialItem: {
                    accion: "Evaluación formal registrada desde ficha de candidato",
                    autor: "Carolina Díaz",
                    rol: "evaluador",
                    detalle: `Dictamen: ${evaluacionData.resultadoPsicologico}.`,
                },
            });
        }

        // 2. Mantener consistencia en el estado de candidatos
        setCandidatos((prev) => {
            const actualizados = prev.map((c) => (c.id === id ? { ...c, ...evaluacionData } : c));
            guardarCandidatosGlobales(actualizados);
            return actualizados;
        });
        if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
            setSolicitudSeleccionada((prev) => ({ ...prev, ...evaluacionData }));
        }

        try {
            await api.guardarEvaluacionSolicitud(id, evaluacionData);
            setBackendConectado(true);
            setAlertaExito(`✓ Dictamen e informe sincronizados exitosamente para ${solicitudSeleccionada?.nombre || "el postulante"}`);
        } catch (err) {
            console.warn("Evaluación local:", err.message);
            setAlertaExito(`✓ Evaluación psicológica registrada con éxito para ${solicitudSeleccionada?.nombre || "el postulante"}`);
        }
        setTimeout(() => setAlertaExito(""), 4500);
    };

    const propsFiltros = {
        busqueda,
        onBusquedaChange: setBusqueda,
        filtroEstado,
        onFiltroEstadoChange: setFiltroEstado,
        filtroPlanta,
        onFiltroPlantaChange: setFiltroPlanta,
        filtroEvaluador,
        onFiltroEvaluadorChange: setFiltroEvaluador,
        plantasDisponibles: PLANTAS_DISPONIBLES,
        evaluadoresDisponibles: EVALUADORES_DISPONIBLES,
        totalResultados: solicitudesFiltradas.length,
        totalOriginal: candidatos.length,
        onLimpiarFiltros: handleLimpiarFiltros,
    };

    return (
        <main style={{ backgroundColor: "#F0F8FF", fontFamily: "Arial, Helvetica, sans-serif", padding: "20px", minHeight: "100vh" }}>
            <HeaderRoles
                rolActual={rolActual}
                tabActiva={tabActiva}
                onCambiarTab={setTabActiva}
                onVolver={onVolver}
            />

            <BannerEstadoBackend
                backendConectado={backendConectado}
                cargandoApi={cargandoApi}
                etiquetaPantalla="Pantalla Dedicada · Profesional Evaluador"
            />

            <AlertaExitoCerrable mensaje={alertaExito} onCerrar={() => setAlertaExito("")} />

            {tabActiva === "dashboard" && (
                <>
                    <EncabezadoDashboard subtitulo="Profesional Evaluador · Dictamen psicolaboral, evaluación y calificación">
                        <span
                            style={{
                                fontSize: "13px",
                                backgroundColor: "#cfe2ff",
                                color: "#084298",
                                padding: "8px 14px",
                                borderRadius: "5px",
                                fontWeight: "bold",
                            }}
                        >
                            Modo Evaluador (Selecciona "Detalle" para calificar)
                        </span>
                    </EncabezadoDashboard>

                    <GrillaIndicadores indicadores={indicadores} />

                    <PanelSolicitudes
                        anchoCompleto
                        encabezado={
                            <EncabezadoRegistro subtitulo="Dictámenes psicolaborales y actualización de estado" />
                        }
                        filtros={propsFiltros}
                        solicitudes={solicitudesFiltradas}
                        mensajeVacio="🔍 No se encontraron solicitudes con los filtros aplicados."
                        onDetalle={setSolicitudSeleccionada}
                    />
                </>
            )}

            {tabActiva === "entrevistas" && (
                <AgendaEntrevistasView
                    postulaciones={postulaciones}
                    onAgendarEntrevista={handleAgendarEntrevista}
                />
            )}

            {tabActiva === "postulantesPorPuesto" && (
                <PostulantesPorPuestoView
                    postulaciones={postulaciones}
                    candidatos={candidatos}
                    onVerDetalle={(post) => setSolicitudSeleccionada(post)}
                />
            )}

            {tabActiva === "informes" && (
                <BandejaInformesView
                    informes={informes}
                    rolActual={rolActual}
                    onVerDetalle={(inf) => setInformeSeleccionado(inf)}
                />
            )}

            <ModalDetalleSolicitud
                key={solicitudSeleccionada?.id || "modal-detalle"}
                isOpen={Boolean(solicitudSeleccionada)}
                solicitud={solicitudSeleccionada}
                informes={informes}
                onCerrar={() => setSolicitudSeleccionada(null)}
                onCambiarEstado={handleCambiarEstado}
                onGuardarEvaluacion={handleGuardarEvaluacion}
                rolActual={rolActual}
            />

            <ModalDetalleInforme
                key={informeSeleccionado?.id || "modal-detalle-informe"}
                isOpen={Boolean(informeSeleccionado)}
                informe={informeSeleccionado}
                candidatos={candidatos}
                rolActual={rolActual}
                onCerrar={() => setInformeSeleccionado(null)}
                onAgregarRespuesta={handleAgregarRespuestaInforme}
                onActualizarInforme={handleActualizarInformeEvaluador}
            />
        </main>
    );
}

export default EvaluadorPage;
