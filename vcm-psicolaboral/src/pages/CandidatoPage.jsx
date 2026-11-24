/**
 * Pantalla Dedicada · Postulante a Trabajo (cuarto rol del MVP de Aqua-Contratos)
 *
 * Portal del candidato autenticado: permite revisar sus postulaciones activas y
 * citas de entrevista, editar su perfil/CV y postular en 1 clic a las ofertas
 * laborales abiertas publicadas por Jefatura de Área.
 *
 * @Autor Luxo
 **/

import TarjetaOferta from "../components/tarjetaOferta";
import MisPostulacionesView from "../components/MisPostulacionesView";
import EditarPerfilPostulanteView from "../components/EditarPerfilPostulanteView";
import AlertaAviso from "../components/AlertaAviso";
import PortalAuthPostulante from "../components/PortalAuthPostulante";
import Icono from "../components/Icono";
import LogoAquaChile from "../components/LogoAquaChile";
import { api } from "../services/api";
import { NARANJA, AZUL_MARINO_AQUA } from "../components/Estilos";
import GrillaIndicadores from "../components/GrillaIndicadores";
import EstadoVacio from "../components/EstadoVacio";
import { useState, useEffect, useMemo } from "react";
import {
    registrarPostulanteGlobal,
    actualizarDatosPersonalesCandidato,
    obtenerSesionPostulante,
    cerrarSesionPostulante,
    obtenerCamposFaltantesPerfil,
} from "../services/candidatosStorage";
import {
    crearPostulacionGlobal,
    cargarPostulacionesGlobales,
    EVENTO_ACTUALIZACION_POSTULACIONES,
} from "../services/postulacionesStorage";
import {
    cargarPuestosGlobales,
    sincronizarPuestosConRemotos,
    EVENTO_ACTUALIZACION_PUESTOS,
} from "../services/puestosStorage";
import { PLANTAS_DISPONIBLES as PLANTAS } from "../utils/constantes";

/* ============================== CONSTANTES ============================== */

const STORAGE_KEY_POSTULACIONES = "aqua_contratos_postulaciones_candidato_v1";

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
    const [puestos, setPuestos] = useState(cargarPuestosGlobales);
    const [postulaciones, setPostulaciones] = useState(cargarPostulacionesLocales);
    const [puestoPostulandoId, setPuestoPostulandoId] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroPlanta, setFiltroPlanta] = useState("todas");
    const [backendConectado, setBackendConectado] = useState(false);
    const [alertaExito, setAlertaExito] = useState("");
    const [alertaError, setAlertaError] = useState("");

    const handleCerrarSesion = () => {
        cerrarSesionPostulante();
        setSesionPostulante(null);
        setAlertaExito("");
        setAlertaError("");
    };

    /* Carga las ofertas desde la API y las fusiona con las creadas localmente por Jefatura */
    useEffect(() => {
        let isMounted = true;

        async function cargarOfertas() {
            try {
                const remotos = await api.getPuestos();
                if (isMounted && Array.isArray(remotos) && remotos.length > 0) {
                    const fusionados = sincronizarPuestosConRemotos(remotos);
                    setPuestos(fusionados);
                    setBackendConectado(true);
                }
            } catch {
                if (isMounted) {
                    setPuestos(cargarPuestosGlobales());
                    setBackendConectado(false);
                }
            }
        }

        cargarOfertas();
        return () => {
            isMounted = false;
        };
    }, []);

    /* Sincronización reactiva cuando el Jefe de Área crea o cambia el estado de un puesto */
    useEffect(() => {
        const handleSyncPuestos = () => {
            setPuestos(cargarPuestosGlobales());
        };
        window.addEventListener(EVENTO_ACTUALIZACION_PUESTOS, handleSyncPuestos);
        window.addEventListener("storage", handleSyncPuestos);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_PUESTOS, handleSyncPuestos);
            window.removeEventListener("storage", handleSyncPuestos);
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
                            fechaEntrevista: match.fechaEntrevista,
                            tipoCitacion: match.tipoCitacion,
                            enlaceGoogleMeet: match.enlaceGoogleMeet,
                            urlGoogleCalendar: match.urlGoogleCalendar,
                            encargado: match.encargado,
                            evaluadorAsignado: match.evaluadorAsignado,
                            dictamenPsicologico: match.dictamenPsicologico,
                            observaciones: match.observaciones,
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

    const candidatoActivo = sesionPostulante?.candidato;
    const camposFaltantesPerfil = useMemo(
        () => obtenerCamposFaltantesPerfil(candidatoActivo),
        [candidatoActivo]
    );
    const perfilIncompleto = camposFaltantesPerfil.length > 0;

    const misPostulaciones = useMemo(() => {
        if (!candidatoActivo) return [];
        const rutActivo = (candidatoActivo?.rut || "").replace(/[.-]/g, "").trim().toLowerCase();
        const idActivo = candidatoActivo?.id;
        const globales = cargarPostulacionesGlobales();

        const lista = postulaciones.filter((loc) => {
            const locRut = (loc.rut || "").replace(/[.-]/g, "").trim().toLowerCase();
            return (rutActivo && locRut === rutActivo) || (idActivo && Number(loc.candidatoId) === Number(idActivo));
        });

        for (const g of globales) {
            const gRut = (g.rut || g.candidatoRut || "").replace(/[.-]/g, "").trim().toLowerCase();
            const coincideRut = rutActivo && gRut === rutActivo;
            const coincideId = idActivo && (Number(g.candidatoId) === Number(idActivo) || Number(g.id) === Number(idActivo));
            if (coincideRut || coincideId) {
                if (
                    !lista.some(
                        (item) =>
                            item.id === g.id ||
                            Number(item.puestoTrabajoId || item.puestoId) === Number(g.puestoId || g.puestoTrabajoId) ||
                            ((item.puestoTitulo || item.cargo) === (g.puestoTitulo || g.cargo))
                    )
                ) {
                    lista.push(g);
                }
            }
        }
        return lista;
    }, [postulaciones, candidatoActivo]);

    const puestosAbiertos = useMemo(() => {
        return puestos.filter((p) => !p.estado || p.estado === "Abierto");
    }, [puestos]);

    const ofertasFiltradas = useMemo(() => {
        const termino = busqueda.toLowerCase().trim();
        return puestosAbiertos.filter((puesto) => {
            const coincideTexto =
                !termino ||
                (puesto.titulo || "").toLowerCase().includes(termino) ||
                (puesto.descripcion || "").toLowerCase().includes(termino) ||
                (puesto.requisitos || "").toLowerCase().includes(termino) ||
                (puesto.familiaCargo || "").toLowerCase().includes(termino) ||
                (Array.isArray(puesto.etiquetas) && puesto.etiquetas.some((t) => t.toLowerCase().includes(termino)));
            const coincidePlanta = filtroPlanta === "todas" || puesto.planta === filtroPlanta;
            return coincideTexto && coincidePlanta;
        });
    }, [puestosAbiertos, busqueda, filtroPlanta]);

    const indicadores = [
        { id: 1, titulo: "Ofertas Abiertas", valor: ofertasFiltradas.length },
        {
            id: 2,
            titulo: "Vacantes Totales",
            valor: ofertasFiltradas.reduce((total, puesto) => total + (Number(puesto.vacantes) || 0), 0),
        },
        { id: 3, titulo: "Mis Postulaciones", valor: misPostulaciones.length },
    ];

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroPlanta("todas");
    };

    const verificarYaPostulado = (puesto) => {
        if (!puesto) return false;
        const tituloObjetivo = (puesto.titulo || "").toLowerCase().trim();
        return misPostulaciones.some(
            (p) =>
                Number(p.puestoId || p.puestoTrabajoId) === Number(puesto.id) ||
                ((p.puestoTitulo || p.cargo || "").toLowerCase().trim() === tituloObjetivo &&
                    (p.planta || "") === (puesto.planta || ""))
        );
    };

    /**
     * Postulación directa en 1 clic usando el perfil autenticado del postulante (sin formulario).
     */
    const handlePostular = async (puesto) => {
        setAlertaError("");
        setAlertaExito("");

        if (!candidatoActivo) {
            setAlertaError("Debes iniciar sesión para postular a una vacante.");
            return;
        }

        const faltantes = obtenerCamposFaltantesPerfil(candidatoActivo);
        if (faltantes.length > 0) {
            setAlertaError(
                `Para postular debes completar primero tu perfil (${faltantes.join(", ")}). Completa los datos a continuación.`
            );
            setEditandoPerfil(true);
            return;
        }

        if (verificarYaPostulado(puesto)) {
            setAlertaError(`Ya te encuentras postulado al cargo '${puesto.titulo}' en ${puesto.planta}.`);
            return;
        }

        setPuestoPostulandoId(puesto.id);

        try {
            const nombreCompleto =
                candidatoActivo.nombre ||
                `${candidatoActivo.nombres || ""} ${candidatoActivo.apellidos || ""}`.trim() ||
                sesionPostulante?.usuario?.nombre ||
                "Postulante";
            const partesNombre = nombreCompleto.split(" ");
            const nombres = candidatoActivo.nombres || partesNombre.slice(0, -1).join(" ") || partesNombre[0] || "";
            const apellidos = candidatoActivo.apellidos || partesNombre.slice(-1).join(" ") || "";
            const rut = candidatoActivo.rut || sesionPostulante?.usuario?.rut || "";
            const email = candidatoActivo.email || sesionPostulante?.usuario?.email || "";
            const comuna = candidatoActivo.comuna || puesto.planta || "Puerto Montt";
            const direccion = candidatoActivo.direccion || "Dirección registrada en perfil";
            const cvNombre =
                candidatoActivo.cv_pdf ||
                candidatoActivo.cvArchivo ||
                `cv_${nombreCompleto.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;

            const candidatoIdFinal = candidatoActivo.id || Date.now();
            const nuevaPostulacionId = Date.now();

            // 1. Actualizar/registrar ficha del candidato en el catálogo global visible para empleados
            await registrarPostulanteGlobal({
                id: candidatoIdFinal,
                rut,
                nombres,
                apellidos,
                nombre: nombreCompleto,
                email,
                telefono: candidatoActivo.telefono || "",
                direccion,
                comuna,
                planta: puesto.planta,
                fecha_nacimiento: candidatoActivo.fecha_nacimiento || "",
                cv_pdf: cvNombre,
                cvArchivo: cvNombre,
                cvDataUrl: candidatoActivo.cvDataUrl || "",
                cargo: puesto.titulo,
                especialidad: puesto.titulo,
                familiaCargo: puesto.familiaCargo || "Operaciones Productivas",
                evaluador: "Amaro Villalobos Caseres",
                estado: "Pendiente",
                antecedentes: `Postulación directa desde perfil al cargo '${puesto.titulo}' (${puesto.planta}).`,
                resultadoPsicologico: "Pendiente",
            });

            // 2. Intentar registrar el vínculo en la API REST si el backend está conectado
            try {
                await api.crearPostulacion({
                    candidatoId: candidatoIdFinal,
                    puestoTrabajoId: puesto.id,
                    evaluadorAsignado: "Amaro Villalobos Caseres",
                });
            } catch {
                // Si el backend no está activo o el candidato aún es solo local, continúa con el registro global local
            }

            // 3. Registrar en la lista GLOBAL de postulaciones (sincronizada con Analista, Evaluador y Jefatura)
            crearPostulacionGlobal({
                id: nuevaPostulacionId,
                puestoId: puesto.id,
                puestoTitulo: puesto.titulo,
                planta: puesto.planta,
                candidatoId: candidatoIdFinal,
                nombre: nombreCompleto,
                rut,
                fase: "esperando respuesta",
                entrevista: "Por agendar",
                encargado: "Amaro Villalobos Caseres",
                cv_pdf: cvNombre,
            });

            // 4. Registrar en el estado local del candidato
            const nuevaLocal = {
                id: nuevaPostulacionId,
                candidatoId: candidatoIdFinal,
                rut,
                nombres,
                apellidos,
                nombre: nombreCompleto,
                direccion,
                comuna,
                fecha_nacimiento: candidatoActivo.fecha_nacimiento || "",
                cargo: puesto.titulo,
                puestoTitulo: puesto.titulo,
                puestoId: puesto.id,
                puestoTrabajoId: puesto.id,
                planta: puesto.planta,
                cv_pdf: cvNombre,
                cvArchivo: cvNombre,
                cvDataUrl: candidatoActivo.cvDataUrl || "",
                fechaPostulacion: new Date().toISOString(),
                estado: "Recibida",
                fase: "esperando respuesta",
                entrevista: "Por agendar",
                encargado: "Amaro Villalobos Caseres",
            };

            setPostulaciones((prev) => [nuevaLocal, ...prev]);
            setAlertaExito(
                `✓ Has postulado exitosamente al cargo '${puesto.titulo}' en ${puesto.planta} usando los datos de tu perfil.`
            );
        } finally {
            setPuestoPostulandoId(null);
        }
    };

    if (!sesionPostulante) {
        return (
            <PortalAuthPostulante
                onAutenticado={(nuevaSesion) => {
                    setSesionPostulante(nuevaSesion);
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
            setAlertaExito("✓ Datos personales y CV actualizados exitosamente en tu perfil.");
            setEditandoPerfil(false);
        } catch (err) {
            setAlertaError(err.message || "Error al actualizar los datos personales.");
        }
    };

    return (
        <main
            style={{
                backgroundColor: "#f3f6f9",
                fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                padding: "20px",
                minHeight: "100vh",
            }}
        >
            <header
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    borderTop: `4px solid ${AZUL_MARINO_AQUA}`,
                    borderBottom: "1px solid #dbe3eb",
                    boxShadow: "0 3px 10px rgba(34, 59, 76, 0.06)",
                    padding: "14px 20px",
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                {/* Parte superior izquierda: Logo AquaChile + Perfil del Postulante + Botón Editar perfil */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <LogoAquaChile height={42} />
                    <div
                        style={{
                            borderLeft: "2px solid #dbe3eb",
                            paddingLeft: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <div
                            style={{
                                width: "46px",
                                height: "46px",
                                borderRadius: "50%",
                                backgroundColor: "#e6eef4",
                                color: AZUL_MARINO_AQUA,
                                border: "2px solid #b6c8d6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                            title="Foto de perfil"
                        >
                            <Icono nombre="user" size={24} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#162936", lineHeight: "1.2" }}>
                                {candidatoActivo?.nombre || sesionPostulante.usuario?.nombre}
                            </span>
                            <button
                                type="button"
                                onClick={() => setEditandoPerfil(true)}
                                style={{
                                    alignSelf: "flex-start",
                                    background: "#fff",
                                    border: "1px solid #223b4c",
                                    borderRadius: "5px",
                                    padding: "3px 12px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#223b4c",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <Icono nombre="edit" size={13} />
                                Editar perfil
                            </button>
                        </div>
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
                            Postulaciones activas ({misPostulaciones.length})
                        </button>
                        <button
                            type="button"
                            className={`nav-tab-boton ${tabActiva === "ofertas_laborales" ? "activo" : ""}`}
                            onClick={() => setTabActiva("ofertas_laborales")}
                        >
                            Ofertas Laborales ({puestosAbiertos.length})
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
                                    : "Modo Local Sincronizado (demostración)"}
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

                    {/* Pestaña 2: Catálogo de Ofertas Laborales con Postulación en 1 Clic */}
                    {tabActiva === "ofertas_laborales" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Banner de aviso si el perfil está incompleto (B4 -> F3) */}
                            {perfilIncompleto && (
                                <div
                                    role="alert"
                                    style={{
                                        backgroundColor: "#fff7ed",
                                        border: "1px solid #fdba74",
                                        borderLeft: "5px solid #e8590c",
                                        borderRadius: "10px",
                                        padding: "14px 20px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: "12px",
                                    }}
                                >
                                    <div style={{ fontSize: "13px", color: "#9a3412", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Icono nombre="alert" size={16} />
                                        <span>
                                            <strong>Necesitas terminar tu perfil para postular:</strong>{" "}
                                            Te falta completar <strong>{camposFaltantesPerfil.join(", ")}</strong>.
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditandoPerfil(true)}
                                        style={{
                                            padding: "7px 14px",
                                            fontSize: "12.5px",
                                            fontWeight: "700",
                                            borderRadius: "6px",
                                            border: "none",
                                            backgroundColor: "#e8590c",
                                            color: "white",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <Icono nombre="edit" size={13} />
                                        Completar mi Perfil ahora
                                    </button>
                                </div>
                            )}

                            {/* Encabezado y resumen de postulación rápida */}
                            <div
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: "10px",
                                    border: "1px solid #dee2e6",
                                    padding: "18px 24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "14px",
                                }}
                            >
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Icono nombre="briefcase" size={20} color="#e8590c" />
                                        Vacantes Disponibles en AquaChile
                                    </h2>
                                    <span style={{ fontSize: "13px", color: "gray" }}>
                                        Postula en 1 clic directamente con los datos y el CV registrados en tu perfil ({candidatoActivo?.rut || "Sin RUT"})
                                    </span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            backgroundColor: candidatoActivo?.cv_pdf ? "#f0fdf4" : "#fff7ed",
                                            color: candidatoActivo?.cv_pdf ? "#166534" : "#9a3412",
                                            border: `1px solid ${candidatoActivo?.cv_pdf ? "#bbf7d0" : "#fed7aa"}`,
                                            fontWeight: "600",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <Icono nombre="fileText" size={14} />
                                        {candidatoActivo?.cv_pdf ? `CV en perfil: ${candidatoActivo.cv_pdf}` : "CV pendiente de subir en tu perfil"}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setEditandoPerfil(true)}
                                        style={{
                                            padding: "6px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            borderRadius: "6px",
                                            border: "1px solid #ced4da",
                                            backgroundColor: "white",
                                            color: "#e8590c",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <Icono nombre="edit" size={13} />
                                        Actualizar Perfil / CV
                                    </button>
                                </div>
                            </div>

                            <GrillaIndicadores indicadores={indicadores} />

                            {/* Buscador y Grilla de Tarjetas de Oferta */}
                            <div
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: "10px",
                                    border: "1px solid #dee2e6",
                                    overflow: "hidden",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                                }}
                            >
                                <div className="filtros-barra-contenedor">
                                    <div className="buscador-input-wrapper">
                                        <input
                                            type="text"
                                            className="buscador-input"
                                            placeholder="Buscar por cargo, cualidades, descripción o requisitos..."
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            aria-label="Buscar ofertas laborales"
                                        />
                                    </div>

                                    <select
                                        className="filtro-select"
                                        value={filtroPlanta}
                                        onChange={(e) => setFiltroPlanta(e.target.value)}
                                        aria-label="Filtrar ofertas por planta"
                                    >
                                        <option value="todas">Todas las Plantas</option>
                                        {PLANTAS.map((planta) => (
                                            <option key={planta} value={planta}>
                                                {planta}
                                            </option>
                                        ))}
                                    </select>

                                    {(busqueda.trim() !== "" || filtroPlanta !== "todas") && (
                                        <button
                                            type="button"
                                            className="boton-limpiar-filtros"
                                            onClick={limpiarFiltros}
                                            title="Restablecer filtros"
                                        >
                                            ✕ Limpiar filtros
                                        </button>
                                    )}

                                    <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "auto" }}>
                                        Mostrando <strong>{ofertasFiltradas.length}</strong> de {puestosAbiertos.length} ofertas abiertas
                                    </span>
                                </div>

                                {ofertasFiltradas.length > 0 ? (
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                            gap: "16px",
                                            padding: "16px",
                                        }}
                                    >
                                        {ofertasFiltradas.map((puesto) => (
                                            <TarjetaOferta
                                                key={puesto.id}
                                                puesto={puesto}
                                                seleccionada={puestoPostulandoId === puesto.id}
                                                yaPostulado={verificarYaPostulado(puesto)}
                                                perfilIncompleto={perfilIncompleto}
                                                onPostular={handlePostular}
                                                onIrAPerfil={() => {
                                                    setAlertaError(
                                                        `Para postular debes terminar de completar tu perfil: ${camposFaltantesPerfil.join(", ")}.`
                                                    );
                                                    setEditandoPerfil(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EstadoVacio
                                        mensaje="No se encontraron ofertas abiertas que coincidan con los filtros aplicados."
                                        onRestablecer={limpiarFiltros}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

export default CandidatoPage;
