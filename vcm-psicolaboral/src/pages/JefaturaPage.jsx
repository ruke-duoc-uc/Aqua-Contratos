import { useState, useMemo, useEffect } from "react";
import HeaderRoles from "../components/HeaderRoles";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalSolicitarInforme from "../components/ModalSolicitarInforme";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import BotonOrange from "../components/BotonOrange";
import GestionCandidatosView from "../components/GestionCandidatosView";
import GestionPuestosView from "../components/GestionPuestosView";
import ModalCrearPuesto from "../components/ModalCrearPuesto";
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
import EncabezadoDashboard from "../components/EncabezadoDashboard.jsx";
import EncabezadoRegistro from "../components/EncabezadoRegistro";
import PanelSolicitudes from "../components/PanelSolicitudes";

import { PLANTAS_DISPONIBLES, EVALUADORES_DISPONIBLES, ETIQUETAS_SUGERIDAS } from "../utils/constantes";
import { calcularIndicadores, aplicarFiltros } from "../utils/solicitudesUtils";

function JefaturaPage({ onVolver }) {
    const rolActual = "jefatura";
    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarCandidatosGlobales);
    const [informes, setInformes] = useState(cargarInformesIniciales);
    const [puestos, setPuestos] = useState([]);
    const [etiquetas, setEtiquetas] = useState(ETIQUETAS_SUGERIDAS);
    const [postulaciones, setPostulaciones] = useState(cargarPostulacionesGlobales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [modalCrearInformeAbierto, setModalCrearInformeAbierto] = useState(false);
    const [modalCrearPuestoAbierto, setModalCrearPuestoAbierto] = useState(false);
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
                const [datosRemotos, informesRemotos, puestosRemotos, postulacionesRemotas, etiquetasRemotas] = await Promise.all([
                    api.getSolicitudes(),
                    api.getSolicitudesInforme().catch(() => null),
                    api.getPuestos().catch(() => []),
                    api.getPostulaciones().catch(() => null),
                    api.getEtiquetas().catch(() => []),
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
                }

                if (isMounted && Array.isArray(puestosRemotos)) {
                    setPuestos(puestosRemotos);
                }

                if (isMounted && Array.isArray(etiquetasRemotas) && etiquetasRemotas.length > 0) {
                    const nombres = etiquetasRemotas.map((e) => (typeof e === "string" ? e : e.nombre)).filter(Boolean);
                    if (nombres.length > 0) {
                        setEtiquetas((prev) => Array.from(new Set([...prev, ...nombres])));
                    }
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

    const handleCrearInforme = async (nuevoInformeDatos) => {
        try {
            const creado = await api.crearSolicitudInforme(nuevoInformeDatos);
            setInformes((prev) => [creado, ...prev]);
        } catch {
            setInformes((prev) => {
                const nuevoId = prev.length > 0 ? Math.max(...prev.map((i) => Number(i.id) || 0)) + 1 : 1;
                const nuevoLocal = {
                    id: nuevoId,
                    ...nuevoInformeDatos,
                    estado: "Abierta",
                    fechaCreacion: new Date().toISOString(),
                    preguntas: nuevoInformeDatos.preguntas.map((p, idx) => ({
                        id: idx + 1,
                        texto: p,
                        fecha: new Date().toISOString(),
                        creadaPor: "Jefe de Área",
                        respuestas: [],
                    })),
                };
                const actualizados = [nuevoLocal, ...prev];
                guardarInformesLocal(actualizados);
                return actualizados;
            });
        }
    };

    const handleAgregarPreguntaInforme = async (id, datosPregunta) => {
        try {
            const actualizado = await api.agregarPreguntaInforme(id, datosPregunta);
            setInformes((prev) => prev.map((inf) => (inf.id === id ? actualizado : inf)));
            setInformeSeleccionado(actualizado);
        } catch {
            setInformes((prev) => {
                const actualizados = prev.map((inf) => {
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

    const handleAgendarEntrevista = async ({ postulacionId, fechaEntrevista, evaluadorAsignado, observaciones }) => {
        try {
            const actualizado = await api.agendarEntrevistaPostulacion(postulacionId, {
                fechaEntrevista,
                evaluadorAsignado,
                observaciones,
            });
            setPuestos((prev) => prev); // mantener
            setPostulaciones((prev) => {
                const list = prev.map((p) => (p.id === postulacionId ? { ...p, ...actualizado } : p));
                guardarPostulacionesGlobales(list);
                return list;
            });
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
        }
    };

    const handleCrearEtiqueta = async (nombre) => {
        const limpio = (nombre || "").trim();
        if (!limpio) return;
        try {
            await api.crearEtiqueta(limpio);
        } catch {
            // Continuar con fallback local
        }
        setEtiquetas((prev) => (prev.includes(limpio) ? prev : [...prev, limpio]));
    };

    const handleCrearPuesto = async (datosPuesto) => {
        try {
            const creado = await api.crearPuesto({
                ...datosPuesto,
                creadoPor: "Jefe de Área",
            });
            setPuestos((prev) => [creado, ...prev]);
        } catch {
            // Fallback local
            setPuestos((prev) => {
                const nuevoId = prev.length > 0 ? Math.max(...prev.map((p) => Number(p.id) || 0)) + 1 : 1;
                return [{
                    id: nuevoId,
                    ...datosPuesto,
                    estado: "Abierto",
                    creadoPor: "Jefe de Área",
                    fechaCreacion: new Date().toISOString(),
                }, ...prev];
            });
        }
        if (Array.isArray(datosPuesto.etiquetas) && datosPuesto.etiquetas.length > 0) {
            setEtiquetas((prev) => Array.from(new Set([...prev, ...datosPuesto.etiquetas])));
        }
    };

    const handleCambiarEstadoPuesto = async (id, nuevoEstado) => {
        try {
            const actualizado = await api.cambiarEstadoPuesto(id, nuevoEstado);
            setPuestos((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
        } catch {
            setPuestos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)));
        }
    };

    const handleCambiarEstadoInforme = async (id, nuevoEstado) => {
        try {
            const actualizado = await api.cambiarEstadoSolicitudInforme(id, nuevoEstado);
            setInformes((prev) => prev.map((inf) => (inf.id === id ? actualizado : inf)));
            setInformeSeleccionado(actualizado);
        } catch {
            setInformes((prev) => {
                const actualizados = prev.map((inf) => {
                    if (inf.id === id) {
                        const upd = { ...inf, estado: nuevoEstado };
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

    const indicadores = useMemo(() => {
        const base = calcularIndicadores(candidatos);
        const puestosAbiertos = puestos.filter((p) => p.estado === "Abierto").length;
        return [
            ...base,
            { id: 5, titulo: "Puestos Abiertos", valor: puestosAbiertos },
            { id: 6, titulo: "Informes Solicitados", valor: informes.length },
        ];
    }, [candidatos, puestos, informes.length]);

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
                tabs={[
                    { id: "dashboard", label: "Dashboard Operativo" },
                    { id: "entrevistas", label: "Agenda de Entrevistas" },
                    { id: "puestos", label: "Puestos de Trabajo" },
                    { id: "candidatos", label: "Gestión de Candidatos" },
                    { id: "solicitudes", label: "Solicitudes de Evaluación" },
                    { id: "informes", label: "Informes de Candidatos" },
                ]}
            />

            <BannerEstadoBackend
                backendConectado={backendConectado}
                cargandoApi={cargandoApi}
                etiquetaPantalla="Pantalla Dedicada · Jefe de Área (Solo Lectura)"
            />

            {tabActiva === "dashboard" && (
                <>
                    <EncabezadoDashboard subtitulo="Jefe de Área · Supervisión y seguimiento consolidado">
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <BotonOrange
                                texto="+ Solicitar Informe de Candidato"
                                onClick={() => setModalCrearInformeAbierto(true)}
                            />
                            <span
                                style={{
                                    fontSize: "13px",
                                    backgroundColor: "#e2e3e5",
                                    color: "#495057",
                                    padding: "8px 14px",
                                    borderRadius: "5px",
                                    fontWeight: "bold",
                                }}
                            >
                                Jefatura de Área
                            </span>
                        </div>
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

            {tabActiva === "entrevistas" && (
                <AgendaEntrevistasView
                    postulaciones={postulaciones}
                    onAgendarEntrevista={handleAgendarEntrevista}
                />
            )}

            {tabActiva === "puestos" && (
                <GestionPuestosView
                    puestos={puestos}
                    etiquetas={etiquetas}
                    onCrearEtiqueta={handleCrearEtiqueta}
                    onAbrirCrear={() => setModalCrearPuestoAbierto(true)}
                    onCambiarEstado={handleCambiarEstadoPuesto}
                />
            )}

            {tabActiva === "candidatos" && (
                <GestionCandidatosView
                    candidatos={candidatos}
                    rolActual={rolActual}
                    onVerDetalle={(cand) => setSolicitudSeleccionada(cand)}
                />
            )}

            {tabActiva === "solicitudes" && (
                <PanelSolicitudes
                    encabezado={
                        <EncabezadoRegistro subtitulo="Supervisión y trazabilidad de evaluaciones psicolaborales" />
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
                    onAbrirCrear={() => setModalCrearInformeAbierto(true)}
                    onVerDetalle={(inf) => setInformeSeleccionado(inf)}
                />
            )}

            <ModalDetalleSolicitud
                key={solicitudSeleccionada?.id || "modal-detalle"}
                isOpen={Boolean(solicitudSeleccionada)}
                solicitud={solicitudSeleccionada}
                onCerrar={() => setSolicitudSeleccionada(null)}
                rolActual={rolActual}
            />

            <ModalSolicitarInforme
                isOpen={modalCrearInformeAbierto}
                candidatos={candidatos}
                onCerrar={() => setModalCrearInformeAbierto(false)}
                onCrear={handleCrearInforme}
            />

            <ModalDetalleInforme
                key={informeSeleccionado?.id || "modal-detalle-informe"}
                isOpen={Boolean(informeSeleccionado)}
                informe={informeSeleccionado}
                candidatos={candidatos}
                rolActual={rolActual}
                onCerrar={() => setInformeSeleccionado(null)}
                onAgregarPregunta={handleAgregarPreguntaInforme}
                onCambiarEstado={handleCambiarEstadoInforme}
            />

            <ModalCrearPuesto
                isOpen={modalCrearPuestoAbierto}
                etiquetasDisponibles={etiquetas}
                onCrearEtiqueta={handleCrearEtiqueta}
                onCerrar={() => setModalCrearPuestoAbierto(false)}
                onCrear={handleCrearPuesto}
            />
        </main>
    );
}

export default JefaturaPage;
