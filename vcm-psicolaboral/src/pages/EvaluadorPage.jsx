import { useState, useMemo, useEffect } from "react";
import IndicadorCard from "../components/IndicadorCard";
import CandidatosRecientes from "../components/CandidatosRecientes";
import HeaderRoles from "../components/HeaderRoles";
import BarraFiltros from "../components/BarraFiltros";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import GestionCandidatosView from "../components/GestionCandidatosView";
import { COLUMNAS } from "../components/columnasTabla";
import { api } from "../services/api";

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

function EvaluadorPage({ onVolver }) {
    const rolActual = "evaluador";
    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarDatosIniciales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [alertaExito, setAlertaExito] = useState("");

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
                const datosRemotos = await api.getSolicitudes();
                if (isMounted && Array.isArray(datosRemotos)) {
                    const formateados = datosRemotos.map((item) => ({
                        ...item,
                        fecha: new Date(item.fecha),
                    }));
                    setCandidatos(formateados);
                    setBackendConectado(true);
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

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(candidatos));
        } catch {
            // Ignorar
        }
    }, [candidatos]);

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

    const handleGuardarEvaluacion = async (id, evaluacionData) => {
        setCandidatos((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...evaluacionData } : c))
        );
        if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
            setSolicitudSeleccionada((prev) => ({ ...prev, ...evaluacionData }));
        }

        try {
            await api.guardarEvaluacionSolicitud(id, evaluacionData);
            setBackendConectado(true);
            setAlertaExito(`✓ Dictamen guardado en base de datos para ${solicitudSeleccionada?.nombre || "el postulante"}`);
        } catch (err) {
            console.warn("Evaluación local:", err.message);
            setAlertaExito(`✓ Evaluación psicológica registrada con éxito para ${solicitudSeleccionada?.nombre || "el postulante"}`);
        }
        setTimeout(() => setAlertaExito(""), 4500);
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
                    Pantalla Dedicada · Profesional Evaluador
                </span>
            </div>

            {alertaExito && (
                <div
                    style={{
                        backgroundColor: "#d1e7dd",
                        color: "#0f5132",
                        border: "1px solid #badbcc",
                        padding: "12px 18px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        fontWeight: "600",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>{alertaExito}</span>
                    <button
                        onClick={() => setAlertaExito("")}
                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                    >
                        ×
                    </button>
                </div>
            )}

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
                                Profesional Evaluador · Dictamen psicolaboral, evaluación y calificación
                            </span>
                        </div>

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
                                Dictámenes psicolaborales y actualización de estado
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

            <ModalDetalleSolicitud
                key={solicitudSeleccionada?.id || "modal-detalle"}
                isOpen={Boolean(solicitudSeleccionada)}
                solicitud={solicitudSeleccionada}
                onCerrar={() => setSolicitudSeleccionada(null)}
                onCambiarEstado={handleCambiarEstado}
                onGuardarEvaluacion={handleGuardarEvaluacion}
                rolActual={rolActual}
            />
        </main>
    );
}

export default EvaluadorPage;
