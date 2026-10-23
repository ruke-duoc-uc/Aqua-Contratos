import { useState, useMemo, useEffect } from "react";
import IndicadorCard from "../components/IndicadorCard";
import CandidatosRecientes from "../components/CandidatosRecientes";
import HeaderRoles from "../components/HeaderRoles";
import BarraFiltros from "../components/BarraFiltros";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalSolicitarInforme from "../components/ModalSolicitarInforme";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import BotonOrange from "../components/BotonOrange";
import GestionCandidatosView from "../components/GestionCandidatosView";
import { COLUMNAS } from "../components/columnasTabla";
import { api } from "../services/api";
import { cargarInformesIniciales, guardarInformesLocal } from "../services/informesStorage";

const STORAGE_KEY = "aqua_contratos_datos_mvp_v1";

const CANDIDATOS_INICIALES = [
    { id: 1, nombre: "Luis Mancilla Peralta", rut: "21.756.200-7", especialidad: "Ing Software", planta: "Puerto Montt", cargo: "Desarrollador Full Stack", familiaCargo: "Sistemas y TI", fecha: new Date(2026, 9, 5), evaluador: "Amaro Villalobos Caseres", estado: "En revisión", antecedentes: "Experiencia en React y Node.js. Salud compatible para teletrabajo y planta.", resultadoPsicologico: "Pendiente" },
    { id: 2, nombre: "Camila Soto Vargas", rut: "20.345.118-3", especialidad: "Prevención de Riesgos", planta: "Osorno", cargo: "Prevencionista de Faena", familiaCargo: "Calidad y Prevención de Riesgos", fecha: new Date(2026, 9, 4), evaluador: "Carolina Díaz Núñez", estado: "Pendiente", antecedentes: "2 años en plantas de salmónidos en la zona sur.", resultadoPsicologico: "Pendiente" },
    { id: 3, nombre: "Matías Rojas Aguilar", rut: "19.872.456-K", especialidad: "Mecánica Industrial", planta: "Puerto Varas", cargo: "Técnico de Mantenimiento", familiaCargo: "Mantenimiento Industrial", fecha: new Date(2026, 9, 4), evaluador: "Amaro Villalobos Caseres", estado: "En proceso", antecedentes: "Especialista en bombas hidráulicas y líneas de faena.", resultadoPsicologico: "Pendiente" },
    { id: 4, nombre: "Valentina Cárdenas Ruiz", rut: "21.034.789-5", especialidad: "Administración", planta: "Puerto Montt", cargo: "Asistente Administrativo", familiaCargo: "Administración y Finanzas", fecha: new Date(2026, 9, 3), evaluador: "Felipe Muñoz Parra", estado: "Finalizado", antecedentes: "Práctica profesional y experiencia en control de gestión.", resultadoPsicologico: "Recomendado", fechaEvaluacion: "2026-10-03", conclusiones: "Alta capacidad de trabajo en equipo y apego a protocolos de la empresa." },
    { id: 5, nombre: "Sebastián Oyarzún Leal", rut: "18.456.321-2", especialidad: "Electricidad", planta: "Castro", cargo: "Eléctrico de Turno", familiaCargo: "Mantenimiento Industrial", fecha: new Date(2026, 9, 2), evaluador: "Carolina Díaz Núñez", estado: "Pendiente", antecedentes: "Certificación SEC vigente clase B.", resultadoPsicologico: "Pendiente" },
    { id: 6, nombre: "Javiera Barría Montecinos", rut: "20.987.654-1", especialidad: "Logística", planta: "Calbuco", cargo: "Coordinador de Despacho", familiaCargo: "Logística y Abastecimiento", fecha: new Date(2026, 9, 2), evaluador: "Felipe Muñoz Parra", estado: "En proceso", antecedentes: "Experiencia en bodegas de frío y control de cadena de valor.", resultadoPsicologico: "Pendiente" },
    { id: 7, nombre: "Diego Andrade Contreras", rut: "19.123.456-8", especialidad: "Soldadura", planta: "Ancud", cargo: "Soldador Calificado", familiaCargo: "Operaciones Productivas", fecha: new Date(2026, 9, 1), evaluador: "Amaro Villalobos Caseres", estado: "En revisión", antecedentes: "Calificación 6G vigente.", resultadoPsicologico: "Pendiente" },
    { id: 8, nombre: "Francisca Mayorga Tapia", rut: "21.456.098-6", especialidad: "Contabilidad", planta: "Frutillar", cargo: "Analista Contable", familiaCargo: "Administración y Finanzas", fecha: new Date(2026, 8, 30), evaluador: "Carolina Díaz Núñez", estado: "Finalizado", antecedentes: "Experiencia con ERP SAP y facturación electrónica.", resultadoPsicologico: "Recomendado con observaciones", fechaEvaluacion: "2026-10-01", conclusiones: "Cumple con el perfil técnico, requiere seguimiento en manejo de presión en cierres contables." },
    { id: 9, nombre: "Nicolás Hernández Soto", rut: "20.678.912-4", especialidad: "Ing Civil", planta: "Puerto Montt", cargo: "Ingeniero de Infraestructura", familiaCargo: "Operaciones Productivas", fecha: new Date(2026, 8, 29), evaluador: "Felipe Muñoz Parra", estado: "Pendiente", antecedentes: "Supervisión de obras marítimas y concesiones acuícolas.", resultadoPsicologico: "Pendiente" },
    { id: 10, nombre: "Constanza Vidal Bahamonde", rut: "19.765.432-9", especialidad: "Enfermería", planta: "Osorno", cargo: "Enfermera Ocupacional", familiaCargo: "Calidad y Prevención de Riesgos", fecha: new Date(2026, 8, 28), evaluador: "Amaro Villalobos Caseres", estado: "Finalizado", antecedentes: "Experiencia en salas de primeros auxilios y protocolos sanitarios.", resultadoPsicologico: "Recomendado", fechaEvaluacion: "2026-09-30", conclusiones: "Perfil excelente con alta empatía y vocación de servicio para personal de planta." },
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
            return parsed.map((item) => ({
                ...item,
                fecha: new Date(item.fecha),
            }));
        }
    } catch {
        // En caso de error de lectura, usa los datos estáticos
    }
    return CANDIDATOS_INICIALES;
};

function JefaturaPage({ onVolver }) {
    const rolActual = "jefatura";
    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarDatosIniciales);
    const [informes, setInformes] = useState(cargarInformesIniciales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [modalCrearInformeAbierto, setModalCrearInformeAbierto] = useState(false);
    const [informeSeleccionado, setInformeSeleccionado] = useState(null);

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

    return (
        <main style={{ backgroundColor: "#F0F8FF", fontFamily: "Arial, Helvetica, sans-serif", padding: "20px", minHeight: "100vh" }}>
            <HeaderRoles
                rolActual={rolActual}
                tabActiva={tabActiva}
                onCambiarTab={setTabActiva}
                onVolver={onVolver}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 14px",
                    backgroundColor: backendConectado ? "#e8f5e9" : "#fff8e1",
                    borderRadius: "6px",
                    border: `1px solid ${backendConectado ? "#c8e6c9" : "#ffe082"}`,
                    marginBottom: "16px",
                    fontSize: "12px",
                    color: backendConectado ? "#1b5e20" : "#795548",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                        style={{
                            display: "inline-block",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: backendConectado ? "#2e7d32" : "#f57c00",
                        }}
                    />
                    <strong>
                        {backendConectado
                            ? "🟢 Conectado a la API REST (Backend Express + SQLite)"
                            : "🟡 Operando en Modo Local (localStorage)"}
                    </strong>
                    {cargandoApi && <span style={{ color: "#0d6efd" }}>(Sincronizando datos...)</span>}
                </div>
                <span style={{ fontSize: "11px", color: "#666" }}>
                    Pantalla Dedicada · Jefe de Área (Solo Lectura)
                </span>
            </div>

            {tabActiva === "dashboard" && (
                <>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px",
                        }}
                    >
                        <div>
                            <h2 style={{ margin: 0 }}>Panel de Control Operativo</h2>
                            <span style={{ fontSize: "14px", color: "gray" }}>
                                Jefe de Área · Supervisión y seguimiento consolidado
                            </span>
                        </div>

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
                    </div>

                    <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                        {indicadores.map((indicador) => (
                            <IndicadorCard
                                key={indicador.id}
                                valor={indicador.valor}
                                titulo={indicador.titulo}
                            />
                        ))}
                    </div>

                    <div
                        style={{
                            border: "2px solid gray",
                            borderRadius: "10px",
                            width: "100%",
                            backgroundColor: "white",
                            overflow: "hidden",
                        }}
                    >
                        <BarraFiltros
                            busqueda={busqueda}
                            onBusquedaChange={setBusqueda}
                            filtroEstado={filtroEstado}
                            onFiltroEstadoChange={setFiltroEstado}
                            filtroPlanta={filtroPlanta}
                            onFiltroPlantaChange={setFiltroPlanta}
                            filtroEvaluador={filtroEvaluador}
                            onFiltroEvaluadorChange={setFiltroEvaluador}
                            plantasDisponibles={PLANTAS_DISPONIBLES}
                            evaluadoresDisponibles={EVALUADORES_DISPONIBLES}
                            totalResultados={solicitudesFiltradas.length}
                            totalOriginal={candidatos.length}
                            onLimpiarFiltros={handleLimpiarFiltros}
                        />

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: COLUMNAS,
                                alignItems: "center",
                                gap: "16px",
                                padding: "10px 16px",
                                backgroundColor: "#CDCDCD",
                                fontWeight: "bold",
                                color: "gray",
                            }}
                        >
                            <span>Nombre</span>
                            <span>Rut</span>
                            <span>Especialidad</span>
                            <span>Planta</span>
                            <span>Fecha</span>
                            <span>Evaluador</span>
                            <span>Estado</span>
                            <span>Acción</span>
                        </div>

                        {solicitudesFiltradas.length > 0 ? (
                            solicitudesFiltradas.map((candidato) => (
                                <CandidatosRecientes
                                    key={candidato.id}
                                    nombre={candidato.nombre}
                                    rut={candidato.rut}
                                    especialidad={candidato.especialidad}
                                    planta={candidato.planta}
                                    fecha={
                                        candidato.fecha instanceof Date
                                            ? candidato.fecha.toLocaleDateString("es-CL")
                                            : candidato.fecha
                                    }
                                    evaluador={candidato.evaluador}
                                    estado={candidato.estado}
                                    onDetalle={() => setSolicitudSeleccionada(candidato)}
                                />
                            ))
                        ) : (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
                                <p style={{ fontSize: "16px", margin: "0 0 10px 0" }}>
                                    🔍 No se encontraron solicitudes con los filtros aplicados.
                                </p>
                                <button type="button" className="boton-limpiar-filtros" onClick={handleLimpiarFiltros}>
                                    Restablecer filtros
                                </button>
                            </div>
                        )}
                    </div>
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
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        border: "2px solid gray",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                                📋 Registro Integral de Solicitudes de Evaluación
                            </h2>
                            <span style={{ fontSize: "13px", color: "gray" }}>
                                Supervisión y trazabilidad de evaluaciones psicolaborales
                            </span>
                        </div>
                    </div>

                    <BarraFiltros
                        busqueda={busqueda}
                        onBusquedaChange={setBusqueda}
                        filtroEstado={filtroEstado}
                        onFiltroEstadoChange={setFiltroEstado}
                        filtroPlanta={filtroPlanta}
                        onFiltroPlantaChange={setFiltroPlanta}
                        filtroEvaluador={filtroEvaluador}
                        onFiltroEvaluadorChange={setFiltroEvaluador}
                        plantasDisponibles={PLANTAS_DISPONIBLES}
                        evaluadoresDisponibles={EVALUADORES_DISPONIBLES}
                        totalResultados={solicitudesFiltradas.length}
                        totalOriginal={candidatos.length}
                        onLimpiarFiltros={handleLimpiarFiltros}
                    />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: COLUMNAS,
                            alignItems: "center",
                            gap: "16px",
                            padding: "10px 16px",
                            backgroundColor: "#CDCDCD",
                            fontWeight: "bold",
                            color: "gray",
                        }}
                    >
                        <span>Nombre</span>
                        <span>Rut</span>
                        <span>Especialidad</span>
                        <span>Planta</span>
                        <span>Fecha</span>
                        <span>Evaluador</span>
                        <span>Estado</span>
                        <span>Acción</span>
                    </div>

                    {solicitudesFiltradas.length > 0 ? (
                        solicitudesFiltradas.map((candidato) => (
                            <CandidatosRecientes
                                key={candidato.id}
                                nombre={candidato.nombre}
                                rut={candidato.rut}
                                especialidad={candidato.especialidad}
                                planta={candidato.planta}
                                fecha={
                                    candidato.fecha instanceof Date
                                        ? candidato.fecha.toLocaleDateString("es-CL")
                                        : candidato.fecha
                                }
                                evaluador={candidato.evaluador}
                                estado={candidato.estado}
                                onDetalle={() => setSolicitudSeleccionada(candidato)}
                            />
                        ))
                    ) : (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
                            <p style={{ fontSize: "16px", margin: "0 0 10px 0" }}>
                                🔍 No se encontraron solicitudes que coincidan con la búsqueda.
                            </p>
                            <button type="button" className="boton-limpiar-filtros" onClick={handleLimpiarFiltros}>
                                Restablecer filtros
                            </button>
                        </div>
                    )}
                </div>
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
