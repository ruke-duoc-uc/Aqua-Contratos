/**
 * Pantalla Dedicada · Postulante a Trabajo (cuarto rol del MVP de Aqua-Contratos)
 *
 * Portal PÚBLICO del candidato: no requiere login ni credenciales. El postulante
 * explora las ofertas abiertas, completa el formulario de postulación (nombre,
 * apellido, cargo y CV) y obtiene un comprobante de su postulación.
 *
 * NOTA DE ALCANCE
 * Las ofertas se leen desde la API REST cuando el backend está disponible y, si no,
 * desde el catálogo local de demostración. Las postulaciones se registran en el
 * navegador (localStorage), porque la API exige un candidato previamente registrado.
 *
 * @Autor Luxo
**/

import TarjetaOferta from "../components/tarjetaOferta";
import FormularioPostulacion from "../components/FormularioPostulacion";
import ComprobantePostulacion from "../components/ComprobantePostulacion";
import MisPostulacionesView from "../components/MisPostulacionesView";
import EditarPerfilPostulanteView from "../components/EditarPerfilPostulanteView";
import AlertaAviso from "../components/AlertaAviso";
import PortalAuthPostulante from "../components/PortalAuthPostulante";
import { api } from "../services/api";
import { NARANJA } from "../components/Estilos";
import GrillaIndicadores from "../components/GrillaIndicadores";
import EstadoVacio from "../components/EstadoVacio";
import { useState, useEffect, useMemo } from "react";
import {
    registrarPostulanteGlobal,
    actualizarDatosPersonalesCandidato,
    obtenerSesionPostulante,
    guardarSesionPostulante,
    cerrarSesionPostulante,
} from "../services/candidatosStorage";
import {
    crearPostulacionGlobal,
    cargarPostulacionesGlobales,
    EVENTO_ACTUALIZACION_POSTULACIONES,
} from "../services/postulacionesStorage";

/* ============================== CONSTANTES ============================== */

const STORAGE_KEY_POSTULACIONES = "aqua_contratos_postulaciones_candidato_v1";

import { PLANTAS_DISPONIBLES as PLANTAS } from "../utils/constantes";

const PUESTOS_INICIALES = [
    {
        id: 1,
        titulo: "Desarrollador Full Stack",
        planta: "Puerto Montt",
        familiaCargo: "Sistemas y TI",
        descripcion:
            "Mantención y evolución de plataformas web corporativas y digitalización de procesos de planta.",
        requisitos:
            "Experiencia en React, Node.js y bases de datos relacionales. Deseable trabajo en equipo ágil.",
        etiquetas: ["React", "Node.js", "Trabajo en equipo", "Resolución de problemas"],
        vacantes: 2,
        estado: "Abierto",
        creadoPor: "Carlos Mendoza (Jefe TI)",
    },
    {
        id: 2,
        titulo: "Prevencionista de Faena",
        planta: "Osorno",
        familiaCargo: "Calidad y Prevención de Riesgos",
        descripcion:
            "Supervisar el cumplimiento de normativas de seguridad, protocolos sanitarios y evaluación de riesgos en faena.",
        requisitos:
            "Título de Ingeniero o Técnico en Prevención de Riesgos con registro SNS vigente. Experiencia en plantas de salmónidos.",
        etiquetas: ["Prevención de riesgos", "Liderazgo", "Comunicación efectiva", "Resolución de problemas"],
        vacantes: 1,
        estado: "Abierto",
        creadoPor: "Mariana Almonacid (Jefa Prevención)",
    },
    {
        id: 3,
        titulo: "Técnico de Mantenimiento",
        planta: "Puerto Varas",
        familiaCargo: "Mantenimiento Industrial",
        descripcion:
            "Ejecución del plan de mantenimiento preventivo y correctivo en líneas de proceso y sistemas hidráulicos.",
        requisitos:
            "Técnico nivel superior en Mecánica Industrial o Electromecánica. Manejo de bombas y refrigeración.",
        etiquetas: ["Mecánica industrial", "Puntualidad", "Resolución de problemas", "Trabajo en equipo"],
        vacantes: 3,
        estado: "Abierto",
        creadoPor: "Hernán Soto (Jefe Mantenimiento)",
    },
    {
        id: 4,
        titulo: "Asistente Administrativo",
        planta: "Puerto Montt",
        familiaCargo: "Administración y Finanzas",
        descripcion:
            "Apoyo en control de gestión, compras de insumos menores y respaldo en tareas de recursos humanos.",
        requisitos:
            "Formación técnica en administración o contabilidad. Manejo de planillas de Excel y archivo documental.",
        etiquetas: ["Organización", "Comunicación efectiva", "Puntualidad", "Adaptabilidad"],
        vacantes: 1,
        estado: "Abierto",
        creadoPor: "Lorena Silva (Jefa Administración)",
    },
    {
        id: 5,
        titulo: "Eléctrico de Turno",
        planta: "Castro",
        familiaCargo: "Mantenimiento Industrial",
        descripcion:
            "Operación y mantención de instalaciones eléctricas en turno, con apoyo en Barrow y Chilquinta.",
        requisitos:
            "Certificación SEC vigente clase B. Experiencia comprobada en turnos de planta industrial.",
        etiquetas: ["Mecánica industrial", "Resolución de problemas", "Trabajo en equipo", "Puntualidad"],
        vacantes: 2,
        estado: "Abierto",
        creadoPor: "Rodrigo Palma (Jefe Electrical)",
    },
    {
        id: 6,
        titulo: "Enfermera Ocupacional",
        planta: "Osorno",
        familiaCargo: "Calidad y Prevención de Riesgos",
        descripcion:
            "Atención primaria de Accidentados y enfermedad profesional, controles de salud ocupacional y protocolos sanitarios.",
        requisitos:
            "Registro profesional vigente y experiencia en salas de primeros auxilios en plantas industriales.",
        etiquetas: ["Salud ocupacional", "Primeros auxilios", "Atención al detalle", "Comunicación efectiva"],
        vacantes: 1,
        estado: "Abierto",
        creadoPor: "Mariana Almonacid (Jefa Prevención)",
    },
];

/* ===================== CAPA DE DATOS LOCAL (MODO DEMO) ==================== */

const cargarPostulacionesLocales = () => {
    try {
        const datos = localStorage.getItem(STORAGE_KEY_POSTULACIONES);
        const parseados = datos ? JSON.parse(datos) : [];
        return Array.isArray(parseados) ? parseados : [];
    } catch {
        return [];
    }
};

const guardarPostulacionesLocales = (postulaciones) => {
    try {
        localStorage.setItem(STORAGE_KEY_POSTULACIONES, JSON.stringify(postulaciones));
    } catch {
        // Se ignora el error de almacenamiento
    }
};

/* ============================ PANTALLA PRINCIPAL ========================== */

function CandidatoPage({ onVolver }) {
    const [tabActiva, setTabActiva] = useState("postulaciones_activas");
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [sesionPostulante, setSesionPostulante] = useState(obtenerSesionPostulante);
    const [puestos, setPuestos] = useState(PUESTOS_INICIALES);
    const [postulaciones, setPostulaciones] = useState(cargarPostulacionesLocales);
    const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroPlanta, setFiltroPlanta] = useState("todas");
    const [backendConectado, setBackendConectado] = useState(false);
    const [alertaExito, setAlertaExito] = useState("");
    const [alertaError, setAlertaError] = useState("");
    const [versionFormulario, setVersionFormulario] = useState(0);

    const handleCerrarSesion = () => {
        cerrarSesionPostulante();
        setSesionPostulante(null);
        setAlertaExito("");
        setAlertaError("");
    };

    /* Carga las ofertas desde la API y, si no responde, mantiene el catálogo local. */
    useEffect(() => {
        let isMounted = true;

        async function cargarOfertas() {
            try {
                const remotos = await api.getPuestos({ estado: "Abierto" });
                if (isMounted && Array.isArray(remotos) && remotos.length > 0) {
                    setPuestos(remotos);
                    setBackendConectado(true);
                }
            } catch {
                if (isMounted) setBackendConectado(false);
            }
        }

        cargarOfertas();
        return () => {
            isMounted = false;
        };
    }, []);

    /* Persistencia local de las postulaciones enviadas. */
    useEffect(() => {
        guardarPostulacionesLocales(postulaciones);
    }, [postulaciones]);

    /* Sincronización en tiempo real con fases y entrevistas actualizadas por los empleados */
    useEffect(() => {
        const handleSyncPostulaciones = () => {
            const globales = cargarPostulacionesGlobales();
            setPostulaciones((locales) =>
                locales.map((loc) => {
                    const match = globales.find(
                        (g) =>
                            g.id === loc.id ||
                            (g.rut && loc.rut && g.rut === loc.rut && (g.puestoTitulo === loc.cargo || g.puestoId === loc.puestoTrabajoId))
                    );
                    if (match) {
                        return {
                            ...loc,
                            fase: match.fase,
                            entrevista: match.entrevista,
                            encargado: match.encargado,
                            dictamenPsicologico: match.dictamenPsicologico,
                        };
                    }
                    return loc;
                })
            );
        };
        handleSyncPostulaciones();
        window.addEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleSyncPostulaciones);
        window.addEventListener("storage", handleSyncPostulaciones);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleSyncPostulaciones);
            window.removeEventListener("storage", handleSyncPostulaciones);
        };
    }, []);

    /* Autocierre de los avisos, con limpieza del temporizador al desmontar. */
    useEffect(() => {
        if (!alertaExito) return;
        const temporizador = setTimeout(() => setAlertaExito(""), 5000);
        return () => clearTimeout(temporizador);
    }, [alertaExito]);

    useEffect(() => {
        if (!alertaError) return;
        const temporizador = setTimeout(() => setAlertaError(""), 6000);
        return () => clearTimeout(temporizador);
    }, [alertaError]);

    const ofertasFiltradas = useMemo(() => {
        const termino = busqueda.toLowerCase().trim();
        return puestos.filter((puesto) => {
            const coincideTexto =
                !termino ||
                puesto.titulo.toLowerCase().includes(termino) ||
                (puesto.descripcion || "").toLowerCase().includes(termino) ||
                (puesto.requisitos || "").toLowerCase().includes(termino);
            const coincidePlanta = filtroPlanta === "todas" || puesto.planta === filtroPlanta;
            return coincideTexto && coincidePlanta;
        });
    }, [puestos, busqueda, filtroPlanta]);

    const indicadores = [
        { id: 1, titulo: "Ofertas Abiertas", valor: ofertasFiltradas.length },
        {
            id: 2,
            titulo: "Vacantes Totales",
            valor: ofertasFiltradas.reduce((total, puesto) => total + (Number(puesto.vacantes) || 0), 0),
        },
        { id: 3, titulo: "Postulaciones Enviadas", valor: postulaciones.length },
    ];

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroPlanta("todas");
    };

    const handlePostular = (puesto) => {
        setAlertaError("");
        setAlertaExito("");
        setPuestoSeleccionado(puesto);
    };

    const handleEnviarPostulacion = ({ nombre, apellido, rut, fecha, comuna, direccion, cargo, archivoCv, cvDataUrl }) => {
        const nuevoPostulanteId = Date.now();
        const cvNombre = archivoCv?.name || `cv_${nombre.toLowerCase().replace(/\s+/g, "_")}.pdf`;

        // Determinar vacante y planta correspondiente
        const puestoCoincidente = puestoSeleccionado || puestos.find((p) => p.titulo.toLowerCase().trim() === cargo.toLowerCase().trim());
        const puestoIdFinal = puestoCoincidente?.id || 1;
        const puestoTituloFinal = puestoCoincidente?.titulo || cargo;
        const plantaFinal = puestoCoincidente?.planta || comuna || "Puerto Montt";

        // 1. Registrar en el catálogo GLOBAL de candidatos visible para los empleados
        registrarPostulanteGlobal({
            id: nuevoPostulanteId,
            rut: rut || "",
            nombres: nombre,
            apellidos: apellido,
            nombre: `${nombre} ${apellido}`,
            direccion: direccion || "No informada",
            comuna: comuna || plantaFinal,
            planta: plantaFinal,
            fecha_nacimiento: fecha || "",
            cv_pdf: cvNombre,
            cvArchivo: cvNombre,
            cvDataUrl: cvDataUrl || "",
            cargo: puestoTituloFinal,
            especialidad: puestoTituloFinal,
            familiaCargo: puestoCoincidente?.familiaCargo || "Operaciones Productivas",
            evaluador: "Amaro Villalobos Caseres",
            estado: "Pendiente",
            antecedentes: `Postulación pública al cargo '${puestoTituloFinal}'. Comuna: ${comuna || "No informada"}. Dirección: ${direccion || "No informada"}.`,
            resultadoPsicologico: "Pendiente",
        });

        // 2. Registrar en la lista GLOBAL de postulaciones por cargo activo
        crearPostulacionGlobal({
            id: nuevoPostulanteId,
            puestoId: puestoIdFinal,
            puestoTitulo: puestoTituloFinal,
            planta: plantaFinal,
            candidatoId: nuevoPostulanteId,
            nombre: `${nombre} ${apellido}`,
            rut: rut || "",
            fase: "esperando respuesta",
            entrevista: "Por agendar",
            encargado: "Amaro Villalobos Caseres",
            cv_pdf: cvNombre,
        });

        // 3. Conservar comprobante local en el portal del postulante
        const nueva = {
            id: nuevoPostulanteId,
            rut: rut || "",
            nombres: nombre,
            apellidos: apellido,
            nombre: `${nombre} ${apellido}`,
            direccion: direccion || "",
            comuna: comuna || plantaFinal,
            fecha_nacimiento: fecha || "",
            cargo: puestoTituloFinal,
            puestoTrabajoId: puestoIdFinal,
            planta: plantaFinal,
            cv_pdf: cvNombre,
            cvArchivo: cvNombre,
            cvDataUrl: cvDataUrl || "",
            cvTipo: archivoCv?.type || "application/pdf",
            cvPeso: archivoCv?.size || 0,
            fechaPostulacion: new Date().toISOString(),
            estado: "Recibida",
            fase: "esperando respuesta",
            entrevista: "Por agendar",
            encargado: "Amaro Villalobos Caseres",
        };

        setPostulaciones((prev) => [nueva, ...prev.filter((p) => p.id !== nueva.id)]);
        if (sesionPostulante) {
            const sesionActualizada = {
                ...sesionPostulante,
                candidato: {
                    ...sesionPostulante.candidato,
                    nombres: nombre,
                    apellidos: apellido,
                    nombre: `${nombre} ${apellido}`,
                    rut: rut || sesionPostulante.candidato?.rut || "",
                    direccion: direccion || sesionPostulante.candidato?.direccion || "",
                    comuna: comuna || sesionPostulante.candidato?.comuna || "",
                    fecha_nacimiento: fecha || sesionPostulante.candidato?.fecha_nacimiento || "",
                    cv_pdf: cvNombre,
                    cvArchivo: cvNombre,
                    cvDataUrl: cvDataUrl || sesionPostulante.candidato?.cvDataUrl || "",
                },
            };
            setSesionPostulante(sesionActualizada);
            guardarSesionPostulante(sesionActualizada);
        }
        setPuestoSeleccionado(null);
        setVersionFormulario((v) => v + 1); 
        setAlertaExito(`✓ Postulación enviada y registrada globalmente en el sistema para el cargo '${nueva.cargo}'. Visible en las pantallas de reclutadores y jefaturas.`);
    };

    const candidatoActivo = sesionPostulante?.candidato;

    const misPostulaciones = useMemo(() => {
        if (!candidatoActivo) return [];
        const rutActivo = (candidatoActivo?.rut || "").replace(/[.-]/g, "").trim().toLowerCase();
        const idActivo = candidatoActivo?.id;
        const globales = cargarPostulacionesGlobales();

        const lista = [...postulaciones];
        for (const g of globales) {
            const gRut = (g.rut || g.candidatoRut || "").replace(/[.-]/g, "").trim().toLowerCase();
            const coincideRut = rutActivo && gRut === rutActivo;
            const coincideId = idActivo && (Number(g.candidatoId) === Number(idActivo) || Number(g.id) === Number(idActivo));
            if (coincideRut || coincideId) {
                if (!lista.some((item) => item.id === g.id || (item.puestoTitulo === g.puestoTitulo && item.rut === g.rut))) {
                    lista.push(g);
                }
            }
        }
        return lista;
    }, [postulaciones, candidatoActivo]);

    if (!sesionPostulante) {
        return (
            <PortalAuthPostulante
                onAutenticado={(nuevaSesion) => {
                    setSesionPostulante(nuevaSesion);
                    setVersionFormulario((v) => v + 1);
                }}
                onVolver={onVolver}
            />
        );
    }

    const handleGuardarPerfil = async (datosPersonales) => {
        try {
            const sesionUpd = await actualizarDatosPersonalesCandidato(candidatoActivo?.id, datosPersonales);
            if (sesionUpd) {
                setSesionPostulante(sesionUpd);
            }
            setAlertaExito("✓ Datos personales actualizados exitosamente.");
            setEditandoPerfil(false);
        } catch (err) {
            setAlertaError(err.message || "Error al actualizar los datos personales.");
        }
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
            <header
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                    padding: "16px 20px",
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                {/* Parte superior izquierda: Monigote de persona + Nombre + Botón Editar perfil */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                        style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "#fff4e6",
                            color: "#e8590c",
                            border: "2px solid #fdba74",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.7rem",
                            flexShrink: 0,
                        }}
                        title="Foto de perfil"
                    >
                        👤
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#111827", lineHeight: "1.2" }}>
                            {candidatoActivo?.nombre || sesionPostulante.usuario?.nombre}
                        </span>
                        <button
                            type="button"
                            onClick={() => setEditandoPerfil(true)}
                            style={{
                                alignSelf: "flex-start",
                                background: "#fff",
                                border: "1px solid #ced4da",
                                borderRadius: "5px",
                                padding: "4px 12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#e8590c",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            ✏️ Editar perfil
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="boton-secundario"
                        onClick={handleCerrarSesion}
                        title="Cerrar sesión de postulante"
                    >
                        Cerrar Sesión
                    </button>

                    {onVolver && (
                        <button
                            type="button"
                            className="boton-secundario"
                            onClick={onVolver}
                            title="Volver a la selección de usuarios"
                        >
                            ← Cambiar de Pantalla
                        </button>
                    )}
                </div>
            </header>

            <AlertaAviso tipo="exito" mensaje={alertaExito} onCerrar={() => setAlertaExito("")} />
            <AlertaAviso tipo="error" mensaje={alertaError} onCerrar={() => setAlertaError("")} />

            {/* Vista condicional: Pantalla de Edición de Perfil vs Vista Principal con Pestañas */}
            {editandoPerfil ? (
                <EditarPerfilPostulanteView
                    candidato={candidatoActivo}
                    onVolver={() => setEditandoPerfil(false)}
                    onGuardar={handleGuardarPerfil}
                />
            ) : (
                <>
                    {/* Pestañas de Navegación del Postulante */}
                    <nav className="nav-tabs-lista" style={{ marginBottom: "20px" }} aria-label="Navegación postulante">
                        <button
                            type="button"
                            className={`nav-tab-boton ${tabActiva === "postulaciones_activas" ? "activo" : ""}`}
                            onClick={() => setTabActiva("postulaciones_activas")}
                        >
                            Postulaciones activas
                        </button>
                        <button
                            type="button"
                            className={`nav-tab-boton ${tabActiva === "vacia" ? "activo" : ""}`}
                            onClick={() => setTabActiva("vacia")}
                        >
                            Pestaña 2
                        </button>
                    </nav>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 14px",
                            backgroundColor: backendConectado ? "#e8f5e9" : "#fff8e1",
                            borderRadius: "6px",
                            border: `1px solid ${backendConectado ? "#c8e6c9" : "#ffe082"}`,
                            marginBottom: "20px",
                            fontSize: "12px",
                            color: backendConectado ? "#1b5e20" : "#795548",
                            gap: "10px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                                style={{
                                    display: "inline-block",
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: backendConectado ? "#2e7d32" : NARANJA,
                                }}
                            />
                            <strong>
                                {backendConectado
                                    ? "Conexión en línea con la API REST (Backend Express + MongoDB)"
                                    : "Modo Local (demostración)"}
                            </strong>
                        </div>
                        <span style={{ fontSize: "11px", color: "#666" }}>
                            Portal del Postulante · AquaChile
                        </span>
                    </div>

                    {/* Pestaña 1: Postulaciones activas */}
                    {tabActiva === "postulaciones_activas" && (
                        <MisPostulacionesView postulaciones={misPostulaciones} />
                    )}

                    {/* Pestaña 2: Vacía */}
                    {tabActiva === "vacia" && (
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "10px",
                                border: "1px dashed #ced4da",
                                padding: "80px 20px",
                                textAlign: "center",
                                color: "#6c757d",
                            }}
                        >
                            <div style={{ fontSize: "2.8rem", marginBottom: "14px" }}>📄</div>
                            <h3 style={{ margin: "0 0 8px 0", color: "#495057", fontSize: "1.2rem" }}>Pestaña Vacía</h3>
                            <p style={{ margin: 0, fontSize: "14px" }}>
                                Espacio disponible listo para la siguiente función que definiremos.
                            </p>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

export default CandidatoPage;