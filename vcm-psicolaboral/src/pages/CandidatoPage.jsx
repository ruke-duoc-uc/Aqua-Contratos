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
import AlertaAviso from "../components/AlertaAviso";
import { api } from "../services/api";
import { NARANJA } from "../components/Estilos";
import GrillaIndicadores from "../components/GrillaIndicadores";
import EstadoVacio from "../components/EstadoVacio";
import { useState, useEffect, useMemo } from "react";
import { registrarPostulanteGlobal } from "../services/candidatosStorage";
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
    const [puestos, setPuestos] = useState(PUESTOS_INICIALES);
    const [postulaciones, setPostulaciones] = useState(cargarPostulacionesLocales);
    const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroPlanta, setFiltroPlanta] = useState("todas");
    const [backendConectado, setBackendConectado] = useState(false);
    const [alertaExito, setAlertaExito] = useState("");
    const [alertaError, setAlertaError] = useState("");
    const [versionFormulario, setVersionFormulario] = useState(0);

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
        const duplicada = postulaciones.some(
            (postulacion) =>
                (postulacion.rut && rut && postulacion.rut === rut) ||
                (postulacion.cargo.toLowerCase() === cargo.toLowerCase() &&
                postulacion.nombre.toLowerCase() === nombre.toLowerCase() &&
                postulacion.apellido.toLowerCase() === apellido.toLowerCase())
        );

        if (duplicada) {
            setAlertaError(`Ya existe una postulación registrada para ${nombre} ${apellido} en '${cargo}'.`);
            return;
        }

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
        setPuestoSeleccionado(null);
        setVersionFormulario((v) => v + 1); 
        setAlertaExito(`✓ Postulación enviada y registrada globalmente en el sistema para el cargo '${nueva.cargo}'. Visible en las pantallas de reclutadores y jefaturas.`);
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
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.2rem" }}>AquaChile · Aqua-Contratos</h1>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                        Portal de Postulación · Sistema Integrado de Evaluaciones Psicolaborales
                    </span>
                </div>

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
            </header>

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
                            ? "Ofertas sincronizadas con la API REST (Backend Express + SQLite)"
                            : "Modo Local (catálogo de ofertas de demostración)"}
                    </strong>
                </div>
                <span style={{ fontSize: "11px", color: "#666" }}>
                    Pantalla Dedicada · Postulante a Trabajo
                </span>
            </div>

            <AlertaAviso tipo="exito" mensaje={alertaExito} onCerrar={() => setAlertaExito("")} />
            <AlertaAviso tipo="error" mensaje={alertaError} onCerrar={() => setAlertaError("")} />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h2 style={{ margin: 0 }}>Postula a las Vacantes de AquaChile</h2>
                    <span style={{ fontSize: "14px", color: "gray" }}>
                        Completa el formulario, adjunta tu CV y recibe tu comprobante al instante
                    </span>
                </div>
            </div>

            <GrillaIndicadores indicadores={indicadores} />

            <div style={{ marginBottom: "24px" }}>
                <FormularioPostulacion
                    key={versionFormulario}
                    puesto={puestoSeleccionado}
                    onCancelar={() => setPuestoSeleccionado(null)}
                    onEnviar={handleEnviarPostulacion}
                />
            </div>

            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "2px solid gray",
                    overflow: "hidden",
                }}
            >
                <div className="filtros-barra-contenedor">
                    <div className="buscador-input-wrapper">
                        <input
                            type="text"
                            className="buscador-input"
                            placeholder="Buscar por cargo, descripción o requisitos..."
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
                        Mostrando <strong>{ofertasFiltradas.length}</strong> de {puestos.length} ofertas
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
                                seleccionada={puestoSeleccionado?.id === puesto.id}
                                onPostular={handlePostular}
                            />
                        ))}
                    </div>
                ) : (
                    <EstadoVacio
                        mensaje="No se encontraron ofertas que coincidan con los filtros aplicados."
                        onRestablecer={limpiarFiltros}
                    />
                )}
            </div>

            <div style={{ marginTop: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>Comprobantes de Postulación</h2>
                    <span style={{ fontSize: "14px", color: "gray" }}>
                        Postulaciones enviadas desde este navegador
                    </span>
                </div>

                {postulaciones.length > 0 ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {postulaciones.map((postulacion) => (
                            <ComprobantePostulacion key={postulacion.id} postulacion={postulacion} />
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "10px",
                            border: "2px solid gray",
                            padding: "40px 20px",
                            textAlign: "center",
                            color: "#6c757d",
                        }}
                    >
                        <p style={{ fontSize: "16px", margin: 0 }}>
                            Todavía no has enviado ninguna postulación desde este navegador.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default CandidatoPage;