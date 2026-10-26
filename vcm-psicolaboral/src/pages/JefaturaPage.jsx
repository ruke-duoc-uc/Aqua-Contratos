import { useState, useMemo, useEffect } from "react";
import HeaderRoles from "../components/HeaderRoles";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalSolicitarInforme from "../components/ModalSolicitarInforme";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import BotonOrange from "../components/BotonOrange";
import GestionCandidatosView from "../components/GestionCandidatosView";
import { api } from "../services/api";
import { cargarCandidatosGlobales, guardarCandidatosGlobales, EVENTO_ACTUALIZACION_CANDIDATOS } from "../services/candidatosStorage";
import { cargarInformesIniciales, guardarInformesLocal } from "../services/informesStorage";
import GrillaIndicadores from "../components/GrillaIndicadores";
import BannerEstadoBackend from "../components/BannerEstadoBackend";
import EncabezadoDashboard from "../components/EncabezadoDashboard.jsx";
import EncabezadoRegistro from "../components/EncabezadoRegistro";
import PanelSolicitudes from "../components/PanelSolicitudes";

const STORAGE_KEY = "aqua_contratos_datos_mvp_v1";

const CANDIDATOS_INICIALES = [
    { id: 1, rut: '21.756.200-7', nombres: 'Luis Andrés', apellidos: 'Mancilla Peralta', nombre: 'Luis Mancilla Peralta', direccion: 'Av. Angelmó 1420', comuna: 'Puerto Montt', fecha_nacimiento: '1998-05-14', cv_pdf: 'cv_luis_mancilla.pdf', especialidad: 'Ing Software', planta: 'Puerto Montt', cargo: 'Desarrollador Full Stack', familiaCargo: 'Sistemas y TI', fecha: new Date(2026, 9, 5), evaluador: 'Amaro Villalobos Caseres', estado: 'En revisión', antecedentes: 'Experiencia en React y Node.js. Salud compatible para teletrabajo y planta.', resultadoPsicologico: 'Pendiente' },
    { id: 2, rut: '20.345.118-3', nombres: 'Camila Ignacia', apellidos: 'Soto Vargas', nombre: 'Camila Soto Vargas', direccion: 'Calle Mackenna 540', comuna: 'Osorno', fecha_nacimiento: '2000-03-22', cv_pdf: 'cv_camila_soto.pdf', especialidad: 'Prevención de Riesgos', planta: 'Osorno', cargo: 'Prevencionista de Faena', familiaCargo: 'Calidad y Prevención de Riesgos', fecha: new Date(2026, 9, 4), evaluador: 'Carolina Díaz Núñez', estado: 'Pendiente', antecedentes: '2 años en plantas de salmónidos en la zona sur.', resultadoPsicologico: 'Pendiente' },
    { id: 3, rut: '19.872.456-K', nombres: 'Matías Nicolás', apellidos: 'Rojas Aguilar', nombre: 'Matías Rojas Aguilar', direccion: 'San Francisco 320', comuna: 'Puerto Varas', fecha_nacimiento: '1997-11-08', cv_pdf: 'cv_matias_rojas.pdf', especialidad: 'Mecánica Industrial', planta: 'Puerto Varas', cargo: 'Técnico de Mantenimiento', familiaCargo: 'Mantenimiento Industrial', fecha: new Date(2026, 9, 4), evaluador: 'Amaro Villalobos Caseres', estado: 'En proceso', antecedentes: 'Especialista en bombas hidráulicas y líneas de faena.', resultadoPsicologico: 'Pendiente' },
    { id: 4, rut: '21.034.789-5', nombres: 'Valentina Paz', apellidos: 'Cárdenas Ruiz', nombre: 'Valentina Cárdenas Ruiz', direccion: 'Los Alerces 890', comuna: 'Puerto Montt', fecha_nacimiento: '1999-08-30', cv_pdf: 'cv_valentina_cardenas.pdf', especialidad: 'Administración', planta: 'Puerto Montt', cargo: 'Asistente Administrativo', familiaCargo: 'Administración y Finanzas', fecha: new Date(2026, 9, 3), evaluador: 'Felipe Muñoz Parra', estado: 'Finalizado', antecedentes: 'Práctica profesional y experiencia en control de gestión.', resultadoPsicologico: 'Recomendado', fechaEvaluacion: '2026-10-03', conclusiones: 'Alta capacidad de trabajo en equipo y apego a protocolos de la empresa.' },
    { id: 5, rut: '18.456.321-2', nombres: 'Sebastián Alonso', apellidos: 'Oyarzún Leal', nombre: 'Sebastián Oyarzún Leal', direccion: 'Gamboa Alto 210', comuna: 'Castro', fecha_nacimiento: '1994-01-19', cv_pdf: 'cv_sebastian_oyarzun.pdf', especialidad: 'Electricidad', planta: 'Castro', cargo: 'Eléctrico de Turno', familiaCargo: 'Mantenimiento Industrial', fecha: new Date(2026, 9, 2), evaluador: 'Carolina Díaz Núñez', estado: 'Pendiente', antecedentes: 'Certificación SEC vigente clase B.', resultadoPsicologico: 'Pendiente' },
    { id: 6, rut: '20.987.654-1', nombres: 'Javiera Belén', apellidos: 'Barría Montecinos', nombre: 'Javiera Barría Montecinos', direccion: 'Costanera Sur 77', comuna: 'Calbuco', fecha_nacimiento: '2001-09-12', cv_pdf: 'cv_javiera_barria.pdf', especialidad: 'Logística', planta: 'Calbuco', cargo: 'Coordinador de Despacho', familiaCargo: 'Logística y Abastecimiento', fecha: new Date(2026, 9, 2), evaluador: 'Felipe Muñoz Parra', estado: 'En proceso', antecedentes: 'Experiencia en bodegas de frío y control de cadena de valor.', resultadoPsicologico: 'Pendiente' },
    { id: 7, rut: '19.123.456-8', nombres: 'Diego Esteban', apellidos: 'Andrade Contreras', nombre: 'Diego Andrade Contreras', direccion: 'Almirante Latorre 405', comuna: 'Ancud', fecha_nacimiento: '1996-06-25', cv_pdf: 'cv_diego_andrade.pdf', especialidad: 'Soldadura', planta: 'Ancud', cargo: 'Soldador Calificado', familiaCargo: 'Operaciones Productivas', fecha: new Date(2026, 9, 1), evaluador: 'Amaro Villalobos Caseres', estado: 'En revisión', antecedentes: 'Calificación 6G vigente.', resultadoPsicologico: 'Pendiente' },
    { id: 8, rut: '21.456.098-6', nombres: 'Francisca Andrea', apellidos: 'Mayorga Tapia', nombre: 'Francisca Mayorga Tapia', direccion: 'Av. Philippi 123', comuna: 'Frutillar', fecha_nacimiento: '2000-12-04', cv_pdf: 'cv_francisca_mayorga.pdf', especialidad: 'Contabilidad', planta: 'Frutillar', cargo: 'Analista Contable', familiaCargo: 'Administración y Finanzas', fecha: new Date(2026, 8, 30), evaluador: 'Carolina Díaz Núñez', estado: 'Finalizado', antecedentes: 'Experiencia con ERP SAP y facturación electrónica.', resultadoPsicologico: 'Recomendado con observaciones', fechaEvaluacion: '2026-10-01', conclusiones: 'Cumple con el perfil técnico, requiere seguimiento en manejo de presión en cierres contables.' },
    { id: 9, rut: '20.678.912-4', nombres: 'Nicolás Alejandro', apellidos: 'Hernández Soto', nombre: 'Nicolás Hernández Soto', direccion: 'Pelluco Alto 615', comuna: 'Puerto Montt', fecha_nacimiento: '1999-04-18', cv_pdf: 'cv_nicolas_hernandez.pdf', especialidad: 'Ing Civil', planta: 'Puerto Montt', cargo: 'Ingeniero de Infraestructura', familiaCargo: 'Operaciones Productivas', fecha: new Date(2026, 8, 29), evaluador: 'Felipe Muñoz Parra', estado: 'Pendiente', antecedentes: 'Supervisión de obras marítimas y concesiones acuícolas.', resultadoPsicologico: 'Pendiente' },
    { id: 10, rut: '19.765.432-9', nombres: 'Constanza Elena', apellidos: 'Vidal Bahamonde', nombre: 'Constanza Vidal Bahamonde', direccion: 'Manuel Rodríguez 820', comuna: 'Osorno', fecha_nacimiento: '1997-07-29', cv_pdf: 'cv_constanza_vidal.pdf', especialidad: 'Enfermería', planta: 'Osorno', cargo: 'Enfermera Ocupacional', familiaCargo: 'Calidad y Prevención de Riesgos', fecha: new Date(2026, 8, 28), evaluador: 'Amaro Villalobos Caseres', estado: 'Finalizado', antecedentes: 'Experiencia en salas de primeros auxilios y protocolos sanitarios.', resultadoPsicologico: 'Recomendado', fechaEvaluacion: '2026-09-30', conclusiones: 'Perfil excelente con alta empatía y vocación de servicio para personal de planta.' },
];

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

const cargarDatosIniciales = () => {
    try {
        const datos = localStorage.getItem(STORAGE_KEY);
        if (datos) {
            const parsed = JSON.parse(datos);
            return parsed.map((item) => {
                const nombres = item.nombres || (item.nombre ? item.nombre.split(' ').slice(0, -2).join(' ') || item.nombre.split(' ')[0] : '');
                const apellidos = item.apellidos || (item.nombre ? item.nombre.split(' ').slice(-2).join(' ') : '');
                return {
                    ...item,
                    nombres: item.nombres || nombres,
                    apellidos: item.apellidos || apellidos,
                    nombre: item.nombre || (nombres + ' ' + apellidos).trim(),
                    direccion: item.direccion || 'Dirección no informada',
                    comuna: item.comuna || item.planta || 'Puerto Montt',
                    fecha_nacimiento: item.fecha_nacimiento || '1998-01-01',
                    cv_pdf: item.cv_pdf || item.cvArchivo || (item.nombre ? 'cv_' + item.nombre.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.pdf' : 'cv_postulante.pdf'),
                    fecha: new Date(item.fecha),
                };
            });
        }
    } catch {
        // En caso de error de lectura, usa los datos estáticos
    }
    return CANDIDATOS_INICIALES;
};

function JefaturaPage({ onVolver }) {
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
