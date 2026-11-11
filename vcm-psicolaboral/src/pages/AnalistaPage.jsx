import { useState, useMemo, useEffect } from "react";
import HeaderRoles from "../components/HeaderRoles";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalEditarCandidato from "../components/ModalEditarCandidato";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import GestionCandidatosView from "../components/GestionCandidatosView";
import { api } from "../services/api";
import {
    cargarCandidatosGlobales,
    guardarCandidatosGlobales,
    EVENTO_ACTUALIZACION_CANDIDATOS,
} from "../services/candidatosStorage";
import { cargarInformesIniciales, guardarInformesLocal } from "../services/informesStorage";
import GrillaIndicadores from "../components/GrillaIndicadores";
import BannerEstadoBackend from "../components/BannerEstadoBackend";
import AlertaExitoCerrable from "../components/AlertaExitoCerrable";
import EncabezadoDashboard from "../components/EncabezadoDashboard.jsx";
import EncabezadoRegistro from "../components/EncabezadoRegistro";
import PanelSolicitudes from "../components/PanelSolicitudes";

import { PLANTAS_DISPONIBLES, EVALUADORES_DISPONIBLES } from "../utils/constantes";
import { calcularIndicadores, aplicarFiltros } from "../utils/solicitudesUtils";

function AnalistaPage({ onVolver }) {
    const rolActual = "analista";
    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarCandidatosGlobales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [candidatoAEditar, setCandidatoAEditar] = useState(null);
    const [alertaExito, setAlertaExito] = useState("");
    const [informes, setInformes] = useState(cargarInformesIniciales);
    const [informeSeleccionado, setInformeSeleccionado] = useState(null);

    // Sincronización en tiempo real con postulantes inscritos desde la pantalla pública o cambios de rol
    useEffect(() => {
        const handleRecargar = () => {
            const actualizados = cargarCandidatosGlobales();
            setCandidatos(actualizados);
        };
        window.addEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargar);
        window.addEventListener("storage", handleRecargar);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargar);
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
                const [datosRemotos, informesRemotos] = await Promise.all([
                    api.getSolicitudes(),
                    api.getSolicitudesInforme().catch(() => null),
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


    const handleGuardarCandidatoEditado = async (candidatoActualizado) => {
        try {
            const actualizado = await api.actualizarCandidato(candidatoActualizado.id, candidatoActualizado);
            const formateado = {
                ...actualizado,
                fecha: new Date(actualizado.fecha || candidatoActualizado.fecha),
            };
            setCandidatos((prev) => {
                const actualizados = prev.map((c) => (c.id === formateado.id ? { ...c, ...formateado } : c));
                guardarCandidatosGlobales(actualizados);
                return actualizados;
            });
            setBackendConectado(true);
            setAlertaExito(`✓ Candidato actualizado en base de datos para ${formateado.nombre}`);
        } catch (err) {
            console.warn("Actualización local:", err.message);
            setCandidatos((prev) => {
                const actualizados = prev.map((c) => (c.id === candidatoActualizado.id ? { ...c, ...candidatoActualizado } : c));
                guardarCandidatosGlobales(actualizados);
                return actualizados;
            });
            setAlertaExito(`✓ Información actualizada para el candidato ${candidatoActualizado.nombre}`);
        }
        setCandidatoAEditar(null);
        setTimeout(() => setAlertaExito(""), 4500);
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
                etiquetaPantalla="Pantalla Dedicada · Analista de Reclutamiento"
            />

            <AlertaExitoCerrable mensaje={alertaExito} onCerrar={() => setAlertaExito("")} />

            {tabActiva === "dashboard" && (
                <>
                    <EncabezadoDashboard subtitulo="Analista de Reclutamiento · Emisión y gestión integral de solicitudes"/>
                    <GrillaIndicadores indicadores={indicadores} />

                    <PanelSolicitudes
                        anchoCompleto
                        filtros={propsFiltros}
                        solicitudes={solicitudesFiltradas}
                        mensajeVacio="🔍 No se encontraron solicitudes con los filtros aplicados."
                        onDetalle={setSolicitudSeleccionada}
                    />
                </>
            )}

            {tabActiva === "candidatos" && (
                <GestionCandidatosView
                    candidatos={candidatos}
                    rolActual={rolActual}
                    onEditarCandidato={(cand) => setCandidatoAEditar(cand)}
                    onVerDetalle={(cand) => setSolicitudSeleccionada(cand)}
                />
            )}

            {tabActiva === "solicitudes" && (
                <PanelSolicitudes
                    encabezado={
                        <EncabezadoRegistro subtitulo="Seguimiento de postulaciones y emisión de solicitudes">
                        </EncabezadoRegistro>
                    }
                    filtros={propsFiltros}
                    solicitudes={solicitudesFiltradas}
                    mensajeVacio="🔍 No se encontraron solicitudes que coincidan con la búsqueda."
                    onDetalle={setSolicitudSeleccionada}
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
                onCerrar={() => setSolicitudSeleccionada(null)}
                onCambiarEstado={handleCambiarEstado}
                rolActual={rolActual}
            />

            <ModalEditarCandidato
                key={candidatoAEditar?.id || "modal-editar"}
                isOpen={Boolean(candidatoAEditar)}
                candidato={candidatoAEditar}
                onCerrar={() => setCandidatoAEditar(null)}
                onGuardar={handleGuardarCandidatoEditado}
            />

            <ModalDetalleInforme
                key={informeSeleccionado?.id || "modal-detalle-informe"}
                isOpen={Boolean(informeSeleccionado)}
                informe={informeSeleccionado}
                candidatos={candidatos}
                rolActual={rolActual}
                onCerrar={() => setInformeSeleccionado(null)}
                onAgregarRespuesta={handleAgregarRespuestaInforme}
            />
        </main>
    );
}

export default AnalistaPage;
