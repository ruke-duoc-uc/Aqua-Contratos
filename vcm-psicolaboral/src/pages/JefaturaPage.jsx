import { useState, useMemo, useEffect } from "react";
import HeaderRoles from "../components/HeaderRoles";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalSolicitarInforme from "../components/ModalSolicitarInforme";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import BotonOrange from "../components/BotonOrange";
import GestionCandidatosView from "../components/GestionCandidatosView";
import { api } from "../services/api";
import { cargarCandidatosGlobales, EVENTO_ACTUALIZACION_CANDIDATOS } from "../services/candidatosStorage";
import { cargarInformesIniciales, guardarInformesLocal } from "../services/informesStorage";
import GrillaIndicadores from "../components/GrillaIndicadores";
import BannerEstadoBackend from "../components/BannerEstadoBackend";
import EncabezadoDashboard from "../components/EncabezadoDashboard.jsx";
import EncabezadoRegistro from "../components/EncabezadoRegistro";
import PanelSolicitudes from "../components/PanelSolicitudes";

const PLANTAS_DISPONIBLES = [
    "Puerto Montt",
    "Osorno",
    "Castro",
    "Calbuco",
    "Frutillar",
    "Puerto Varas",
    "Ancud"
];

const EVALUADORES_DISPONIBLES = [
    "Amaro Villalobos Caseres",
    "Carolina Díaz Núñez",
    "Felipe Muñoz Parra",
    "Joaquín Oyarzún Leal"
];

function JefaturaPage({ onVolver, onCambiarRol }) {
    const rolActual = "jefatura";
    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarCandidatosGlobales);
    const [informes, setInformes] = useState(cargarInformesIniciales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [modalCrearInformeAbierto, setModalCrearInformeAbierto] = useState(false);
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

    // Filtros de búsqueda (RF07)
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
        { id: 5, titulo: "Informes Solicitados", valor: informes.length },
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
                onCambiarRol={onCambiarRol}
                onVolver={onVolver}
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
        </main>
    );
}

export default JefaturaPage;
