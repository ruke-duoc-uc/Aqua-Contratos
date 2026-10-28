import { useState, useMemo, useEffect } from "react";
import BotonOrange from "../components/BotonOrange";
import HeaderRoles from "../components/HeaderRoles";
import ModalNuevaSolicitud from "../components/ModalNuevaSolicitud";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalEditarCandidato from "../components/ModalEditarCandidato";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import GestionCandidatosView from "../components/GestionCandidatosView";
import { api } from "../services/api";
import { cargarCandidatosGlobales, EVENTO_ACTUALIZACION_CANDIDATOS } from "../services/candidatosStorage";
import { cargarInformesIniciales, guardarInformesLocal } from "../services/informesStorage";
import GrillaIndicadores from "../components/GrillaIndicadores";
import BannerEstadoBackend from "../components/BannerEstadoBackend";
import AlertaExitoCerrable from "../components/AlertaExitoCerrable";
import EncabezadoDashboard from "../components/EncabezadoDashboard.jsx";
import EncabezadoRegistro from "../components/EncabezadoRegistro";
import PanelSolicitudes from "../components/PanelSolicitudes";

import { PLANTAS_DISPONIBLES, EVALUADORES_DISPONIBLES } from "../utils/constantes";

function AnalistaPage({ onVolver }) {
    const rolActual = "analista";
    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarCandidatosGlobales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [candidatoAEditar, setCandidatoAEditar] = useState(null);
    const [alertaExito, setAlertaExito] = useState("");
    const [informes, setInformes] = useState(cargarInformesIniciales);
    const [informeSeleccionado, setInformeSeleccionado] = useState(null);

    // Sincronización en tiempo real con postulantes inscritos desde la pantalla pública
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

    const pendientes = candidatos.filter(
        (c) => c.estado === "Pendiente" || c.estado === "En revisión"
    ).length;
    const enProceso = candidatos.filter((c) => c.estado === "En proceso").length;
    const finalizadas = candidatos.filter(
        (c) => c.estado === "Finalizado" || c.estado === "Finalizada"
    ).length;

    const indicadores = [
        { id: 1, titulo: "Candidatos Totales", valor: candidatos.length },
        { id: 2, titulo: "Solicitudes Pendientes", valor: pendientes },
        { id: 3, titulo: "En proceso", valor: enProceso },
        { id: 4, titulo: "Evaluaciones finalizadas", valor: finalizadas },
    ];

    const solicitudesFiltradas = useMemo(() => {
        return candidatos.filter((c) => {
            const termino = busqueda.toLowerCase().trim();
            const coincideTexto =
                !termino ||
                c.nombre.toLowerCase().includes(termino) ||
                c.rut.toLowerCase().includes(termino) ||
                (c.cargo && c.cargo.toLowerCase().includes(termino)) ||
                c.especialidad.toLowerCase().includes(termino) ||
                c.evaluador.toLowerCase().includes(termino);

            const coincideEstado =
                filtroEstado === "todos" ||
                c.estado.toLowerCase() === filtroEstado.toLowerCase();

            const coincidePlanta =
                filtroPlanta === "todas" ||
                c.planta.toLowerCase() === filtroPlanta.toLowerCase();

            const coincideEvaluador =
                filtroEvaluador === "todos" ||
                c.evaluador.toLowerCase() === filtroEvaluador.toLowerCase();

            return coincideTexto && coincideEstado && coincidePlanta && coincideEvaluador;
        });
    }, [candidatos, busqueda, filtroEstado, filtroPlanta, filtroEvaluador]);

    const handleLimpiarFiltros = () => {
        setBusqueda("");
        setFiltroEstado("todos");
        setFiltroPlanta("todas");
        setFiltroEvaluador("todos");
    };

    const handleGuardarSolicitud = async (nuevaSolicitud) => {
        try {
            const creada = await api.crearSolicitud(nuevaSolicitud);
            const formateada = { ...creada, fecha: new Date(creada.fecha) };
            setCandidatos((prev) => [formateada, ...prev.filter((c) => c.id !== formateada.id)]);
            setBackendConectado(true);
            setAlertaExito(`✓ Solicitud guardada en base de datos para ${formateada.nombre} (${formateada.cargo})`);
        } catch (err) {
            console.warn("Guardado local:", err.message);
            setCandidatos([nuevaSolicitud, ...candidatos]);
            setAlertaExito(`✓ Solicitud creada exitosamente para ${nuevaSolicitud.nombre} (${nuevaSolicitud.cargo})`);
        }
        setTimeout(() => setAlertaExito(""), 4500);
    };

    const handleGuardarCandidatoEditado = async (candidatoActualizado) => {
        try {
            const actualizado = await api.actualizarCandidato(candidatoActualizado.id, candidatoActualizado);
            const formateado = {
                ...actualizado,
                fecha: new Date(actualizado.fecha || candidatoActualizado.fecha),
            };
            setCandidatos((prev) =>
                prev.map((c) => (c.id === formateado.id ? { ...c, ...formateado } : c))
            );
            setBackendConectado(true);
            setAlertaExito(`✓ Candidato actualizado en base de datos para ${formateado.nombre}`);
        } catch (err) {
            console.warn("Actualización local:", err.message);
            setCandidatos((prev) =>
                prev.map((c) => (c.id === candidatoActualizado.id ? { ...c, ...candidatoActualizado } : c))
            );
            setAlertaExito(`✓ Información actualizada para el candidato ${candidatoActualizado.nombre}`);
        }
        setCandidatoAEditar(null);
        setTimeout(() => setAlertaExito(""), 4500);
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        setCandidatos((prev) =>
            prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
        );
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
                    <EncabezadoDashboard subtitulo="Analista de Reclutamiento · Emisión y gestión integral de solicitudes">
                        <BotonOrange
                            texto="+ Nueva solicitud"
                            onClick={() => setModalNuevaAbierto(true)}
                        />
                    </EncabezadoDashboard>

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
                    onAbrirNuevoCandidato={() => setModalNuevaAbierto(true)}
                    onEditarCandidato={(cand) => setCandidatoAEditar(cand)}
                    onVerDetalle={(cand) => setSolicitudSeleccionada(cand)}
                />
            )}

            {tabActiva === "solicitudes" && (
                <PanelSolicitudes
                    encabezado={
                        <EncabezadoRegistro subtitulo="Seguimiento de postulaciones y emisión de solicitudes">
                            <BotonOrange
                                texto="+ Nueva Solicitud"
                                onClick={() => setModalNuevaAbierto(true)}
                            />
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

            <ModalNuevaSolicitud
                isOpen={modalNuevaAbierto}
                onCerrar={() => setModalNuevaAbierto(false)}
                onGuardar={handleGuardarSolicitud}
            />

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
