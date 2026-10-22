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
 * @Autor Equipo Smiling Friends · Full Stack II · DSY1104
 **/

import { useState, useEffect, useMemo } from "react";
import IndicadorCard from "../components/IndicadorCard";
import BotonOrange from "../components/BotonOrange";
import { api } from "../services/api";

/* ============================== CONSTANTES ============================== */

const STORAGE_KEY_POSTULACIONES = "aqua_contratos_postulaciones_candidato_v1";

const NARANJA = "#f57c00";
const NARANJA_OSCURO = "#e8590c";
const NARANJA_CLARO = "#fff4e6";
const LIMITE_CV_BYTES = 10 * 1024 * 1024;

const PLANTAS = [
    "Puerto Montt",
    "Osorno",
    "Castro",
    "Calbuco",
    "Frutillar",
    "Puerto Varas",
    "Ancud",
];

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

/* ============================ UTILIDADES DE UI =========================== */

const formatearFecha = (valor) => {
    if (!valor) return "Sin fecha";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "Sin fecha";
    return fecha.toLocaleDateString("es-CL");
};

const ESTILO_ETIQUETA = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
};

const ESTILO_VALOR = {
    fontSize: "14px",
    color: "#333",
    margin: "3px 0 0 0",
};

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

/* ======================== TARJETA DE OFERTA LABORAL ====================== */

function TarjetaOferta({ puesto, seleccionada, onPostular }) {
    return (
        <article
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: `2px solid ${seleccionada ? NARANJA : "gray"}`,
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{puesto.titulo}</h3>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                        {puesto.planta} · {puesto.familiaCargo}
                    </span>
                </div>
                <span className="badge-estado badge-finalizado">{puesto.estado || "Abierto"}</span>
            </div>

            <p style={{ margin: 0, fontSize: "13.5px", color: "#555", lineHeight: "1.5" }}>
                {puesto.descripcion}
            </p>

            <details>
                <summary
                    style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: NARANJA_OSCURO,
                        cursor: "pointer",
                    }}
                >
                    Ver requisitos
                </summary>
                <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#555", lineHeight: "1.5" }}>
                    {puesto.requisitos}
                </p>
            </details>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div>
                    <span style={ESTILO_ETIQUETA}>Vacantes</span>
                    <p style={ESTILO_VALOR}>{puesto.vacantes}</p>
                </div>
                <div>
                    <span style={ESTILO_ETIQUETA}>Publicado por</span>
                    <p style={ESTILO_VALOR}>{puesto.creadoPor || "AquaChile"}</p>
                </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "6px" }}>
                <BotonOrange
                    texto={seleccionada ? "Postulando" : "Postular"}
                    onClick={() => onPostular(puesto)}
                />
            </div>
        </article>
    );
}

/* ====================== FORMULARIO DE POSTULACIÓN ======================== */

function FormularioPostulacion({ puesto, onCancelar, onEnviar }) {
    const [datos, setDatos] = useState({ nombre: "", apellido: "" });
    const [cargoElegido, setCargoElegido] = useState({ clave: "libre", valor: "" });
    const [archivoCv, setArchivoCv] = useState(null);
    const [campoEnfocado, setCampoEnfocado] = useState("");
    const [error, setError] = useState("");

    /**
     * El cargo sigue a la oferta seleccionada mientras no se edite a mano:
     * al elegir otra vacante, el campo vuelve a mostrar el título del puesto.
     */
    const clavePuesto = puesto?.id ?? "libre";
    const cargo = cargoElegido.clave === clavePuesto ? cargoElegido.valor : puesto?.titulo || "";

    const actualizarCampo = (campo) => (evento) => {
        setDatos((prev) => ({ ...prev, [campo]: evento.target.value }));
        setError("");
    };

    const actualizarCargo = (evento) => {
        setCargoElegido({ clave: clavePuesto, valor: evento.target.value });
        setError("");
    };

    /** Enfoque en naranja: identidad visual del postulante sobre los campos. */
    const estiloCampo = (campo) => ({
        borderColor: campoEnfocado === campo ? NARANJA : "#cccccc",
        boxShadow: campoEnfocado === campo ? "0 0 0 3px rgba(245, 124, 0, 0.15)" : "none",
    });

    const manejarArchivo = (evento) => {
        const archivo = evento.target.files?.[0] || null;
        setError("");
        if (archivo && archivo.size > LIMITE_CV_BYTES) {
            setArchivoCv(null);
            setError("El CV no puede superar los 10 MB.");
            return;
        }
        setArchivoCv(archivo);
    };

    const manejarEnvio = (evento) => {
        evento.preventDefault();

        if (!datos.nombre.trim() || !datos.apellido.trim() || !cargo.trim()) {
            setError("El nombre, el apellido y el cargo al que postulas son obligatorios.");
            return;
        }
        if (!archivoCv) {
            setError("Adjunta tu currículum (PDF o Word) para enviar la postulación.");
            return;
        }

        onEnviar({
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            cargo: cargo.trim(),
            archivoCv,
        });
    };

    return (
        <section
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: `2px solid ${NARANJA}`,
                overflow: "hidden",
            }}
        >
            <header
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: NARANJA_OSCURO }}>
                        Formulario de Postulación
                    </h3>
                    <span style={{ fontSize: "13px", color: "#666" }}>
                        {puesto
                            ? `Postulando a ${puesto.titulo} · ${puesto.planta}`
                            : "Completa tus datos y adjunta tu currículum"}
                    </span>
                </div>
            </header>

            <form onSubmit={manejarEnvio} style={{ padding: "20px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                    }}
                >
                    <div className="form-grupo">
                        <label htmlFor="postulacion-nombre">Nombre *</label>
                        <input
                            id="postulacion-nombre"
                            type="text"
                            className="form-input"
                            value={datos.nombre}
                            onChange={actualizarCampo("nombre")}
                            onFocus={() => setCampoEnfocado("nombre")}
                            onBlur={() => setCampoEnfocado("")}
                            style={estiloCampo("nombre")}
                            placeholder="Ej. Ana"
                            required
                        />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="postulacion-apellido">Apellido *</label>
                        <input
                            id="postulacion-apellido"
                            type="text"
                            className="form-input"
                            value={datos.apellido}
                            onChange={actualizarCampo("apellido")}
                            onFocus={() => setCampoEnfocado("apellido")}
                            onBlur={() => setCampoEnfocado("")}
                            style={estiloCampo("apellido")}
                            placeholder="Ej. García"
                            required
                        />
                    </div>

                    <div className="form-grupo" style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor="postulacion-cargo">Cargo al que postulas *</label>
                        <input
                            id="postulacion-cargo"
                            type="text"
                            className="form-input"
                            value={cargo}
                            onChange={actualizarCargo}
                            onFocus={() => setCampoEnfocado("cargo")}
                            onBlur={() => setCampoEnfocado("")}
                            style={estiloCampo("cargo")}
                            placeholder="Ej. Prevencionista de Faena"
                            required
                        />
                    </div>

                    <div className="form-grupo" style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor="postulacion-cv">Adjuntar currículum (CV) *</label>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <label
                                htmlFor="postulacion-cv"
                                style={{
                                    display: "inline-block",
                                    padding: "9px 16px",
                                    border: `1px solid ${NARANJA}`,
                                    borderRadius: "6px",
                                    backgroundColor: archivoCv ? NARANJA_CLARO : "white",
                                    color: NARANJA_OSCURO,
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                }}
                            >
                                {archivoCv ? "Cambiar archivo" : "Seleccionar CV"}
                            </label>
                            <input
                                id="postulacion-cv"
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf"
                                onChange={manejarArchivo}
                                style={{
                                    position: "absolute",
                                    width: "1px",
                                    height: "1px",
                                    padding: 0,
                                    margin: "-1px",
                                    overflow: "hidden",
                                    clip: "rect(0, 0, 0, 0)",
                                    whiteSpace: "nowrap",
                                    border: 0,
                                }}
                            />
                            <span
                                style={{
                                    fontSize: "13px",
                                    color: archivoCv ? "#333" : "#6c757d",
                                    wordBreak: "break-word",
                                }}
                            >
                                {archivoCv
                                    ? archivoCv.name
                                    : "Ningún archivo seleccionado (PDF o Word, máx. 10 MB)"}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="form-error-mensaje" role="alert" style={{ marginTop: "16px" }}>
                        {error}
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginTop: "20px",
                    }}
                >
                    <BotonOrange type="submit" texto="Enviar postulación" />
                    {puesto && (
                        <button type="button" className="boton-secundario" onClick={onCancelar}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

/* ===================== COMPROBANTE DE POSTULACIÓN ======================== */

function ComprobantePostulacion({ postulacion }) {
    return (
        <article
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "2px solid gray",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
                        {postulacion.nombre} {postulacion.apellido}
                    </h3>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                        {postulacion.cargo}
                        {postulacion.planta ? ` · ${postulacion.planta}` : ""}
                    </span>
                </div>
                <span className="badge-estado badge-proceso">{postulacion.estado}</span>
            </div>

            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
                <div>
                    <span style={ESTILO_ETIQUETA}>Enviada</span>
                    <p style={ESTILO_VALOR}>{formatearFecha(postulacion.fechaPostulacion)}</p>
                </div>
                <div>
                    <span style={ESTILO_ETIQUETA}>CV adjunto</span>
                    <p style={{ ...ESTILO_VALOR, wordBreak: "break-word" }}>{postulacion.cvArchivo}</p>
                </div>
            </div>

            <p
                style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#7a3e00",
                    backgroundColor: NARANJA_CLARO,
                    borderLeft: `3px solid ${NARANJA}`,
                    padding: "8px 12px",
                    borderRadius: "4px",
                }}
            >
                Tu postulación quedó registrada. El equipo de Reclutamiento revisará tu CV y te
                contactará para coordinar las entrevistas.
            </p>
        </article>
    );
}

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

    const handlePostular = (puesto) => {
        setAlertaError("");
        setAlertaExito("");
        setPuestoSeleccionado(puesto);
    };

    const handleEnviarPostulacion = ({ nombre, apellido, cargo, archivoCv }) => {
        const duplicada = postulaciones.some(
            (postulacion) =>
                postulacion.cargo.toLowerCase() === cargo.toLowerCase() &&
                postulacion.nombre.toLowerCase() === nombre.toLowerCase() &&
                postulacion.apellido.toLowerCase() === apellido.toLowerCase()
        );

        if (duplicada) {
            setAlertaError(`Ya existe una postulación registrada para ${nombre} ${apellido} en '${cargo}'.`);
            return;
        }

        const nueva = {
            id:
                postulaciones.reduce(
                    (maximo, postulacion) => Math.max(maximo, Number(postulacion.id) || 0),
                    0
                ) + 1,
            nombre,
            apellido,
            cargo,
            puestoTrabajoId: puestoSeleccionado?.id ?? null,
            planta: puestoSeleccionado?.planta ?? "",
            cvArchivo: archivoCv.name,
            cvTipo: archivoCv.type,
            cvPeso: archivoCv.size,
            fechaPostulacion: new Date().toISOString(),
            estado: "Recibida",
        };

        setPostulaciones((prev) => [...prev, nueva]);
        setPuestoSeleccionado(null);
        setAlertaExito(`✓ Postulación enviada exitosamente para el cargo '${nueva.cargo}'.`);
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
                    <h1 style={{ margin: 0, fontSize: "1.2rem" }}>
                        AquaChile · Aqua-Contratos
                    </h1>
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

            {alertaExito && (
                <div
                    role="status"
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
                        gap: "12px",
                    }}
                >
                    <span>{alertaExito}</span>
                    <button
                        type="button"
                        onClick={() => setAlertaExito("")}
                        aria-label="Cerrar aviso"
                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                    >
                        ×
                    </button>
                </div>
            )}

            {alertaError && (
                <div
                    role="alert"
                    style={{
                        backgroundColor: "var(--fondo-badge-rojo)",
                        color: "var(--color-badge-rojo)",
                        border: "1px solid #f5c2c7",
                        padding: "12px 18px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        fontWeight: "600",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <span>{alertaError}</span>
                    <button
                        type="button"
                        onClick={() => setAlertaError("")}
                        aria-label="Cerrar aviso"
                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                    >
                        ×
                    </button>
                </div>
            )}

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

            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                }}
            >
                {indicadores.map((indicador) => (
                    <IndicadorCard
                        key={indicador.id}
                        valor={indicador.valor}
                        titulo={indicador.titulo}
                    />
                ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
                <FormularioPostulacion
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
                            onClick={() => {
                                setBusqueda("");
                                setFiltroPlanta("todas");
                            }}
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
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
                        <p style={{ fontSize: "16px", margin: "0 0 10px 0" }}>
                            No se encontraron ofertas que coincidan con los filtros aplicados.
                        </p>
                        <button
                            type="button"
                            className="boton-limpiar-filtros"
                            onClick={() => {
                                setBusqueda("");
                                setFiltroPlanta("todas");
                            }}
                        >
                            Restablecer filtros
                        </button>
                    </div>
                )}
            </div>

            <div style={{ marginTop: "24px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0 }}>Comprobantes de Postulación</h2>
                        <span style={{ fontSize: "14px", color: "gray" }}>
                            Postulaciones enviadas desde este navegador
                        </span>
                    </div>
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
