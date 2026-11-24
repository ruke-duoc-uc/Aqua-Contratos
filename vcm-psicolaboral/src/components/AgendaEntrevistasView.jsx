import { useState, useMemo, useEffect } from "react";
import CalendarioEntrevistas from "./CalendarioEntrevistas.jsx";
import ModalAgendarEntrevista from "./ModalAgendarEntrevista.jsx";
import BotonOrange from "./BotonOrange.jsx";
import Icono from "./Icono.jsx";
import { ESTILO_ETIQUETA, NARANJA_OSCURO } from "./Estilos.jsx";
import { PLANTAS_DISPONIBLES, TIPOS_FECHA_ESPECIAL } from "../utils/constantes";
import {
    construirUrlGoogleCalendar,
    cargarFechasEspecialesCalendario,
    registrarFechaEspecialCalendario,
    eliminarFechaEspecialCalendario,
    EVENTO_ACTUALIZACION_CALENDARIO,
} from "../utils/googleCalendar";

/**
 * Normaliza una fecha de entrevista (ISO o dd/mm/aaaa) a formato YYYY-MM-DD
 */
function extraerClaveFecha(fechaStr) {
    if (!fechaStr) return null;
    if (typeof fechaStr === "string" && fechaStr.includes("-")) {
        const parteFecha = fechaStr.split("T")[0];
        const partes = parteFecha.split("-");
        if (partes.length === 3) {
            return `${partes[0]}-${partes[1].padStart(2, "0")}-${partes[2].padStart(2, "0")}`;
        }
    }
    if (typeof fechaStr === "string" && fechaStr.includes("/")) {
        const parteFecha = fechaStr.split(" ")[0];
        const [d, m, y] = parteFecha.split("/");
        if (d && m && y) {
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
    }
    const d = new Date(fechaStr);
    if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${dia}`;
    }
    return null;
}

function formatearFechaHora(fechaStr) {
    if (!fechaStr) return "Sin fecha";
    const d = new Date(fechaStr);
    if (!isNaN(d.getTime())) {
        return d.toLocaleString("es-CL", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }
    return fechaStr;
}

function AgendaEntrevistasView({ postulaciones = [], onAgendarEntrevista }) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos" | "agendados" | "sin_agendar"
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [postulanteAEditar, setPostulanteAEditar] = useState(null);
    const [fechasEspeciales, setFechasEspeciales] = useState(cargarFechasEspecialesCalendario);
    const [modalFechaEspecialAbierto, setModalFechaEspecialAbierto] = useState(false);
    const [formFechaEspecial, setFormFechaEspecial] = useState({
        titulo: "",
        tipoEvento: TIPOS_FECHA_ESPECIAL[0],
        fecha: new Date().toISOString().slice(0, 16),
        planta: "Todas las Plantas",
        observaciones: "",
    });
    const [errorFechaEspecial, setErrorFechaEspecial] = useState("");

    useEffect(() => {
        const handleSyncCalendario = () => {
            setFechasEspeciales(cargarFechasEspecialesCalendario());
        };
        window.addEventListener(EVENTO_ACTUALIZACION_CALENDARIO, handleSyncCalendario);
        window.addEventListener("storage", handleSyncCalendario);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_CALENDARIO, handleSyncCalendario);
            window.removeEventListener("storage", handleSyncCalendario);
        };
    }, []);

    // Filtrar entrevistas activas (que tienen fecha asignada)
    const entrevistasConFecha = useMemo(() => {
        return postulaciones.filter((p) =>
            Boolean(
                p.fechaEntrevista ||
                    (p.entrevista &&
                        p.entrevista !== "Pendiente de confirmación" &&
                        p.entrevista !== "Por agendar" &&
                        p.entrevista !== "Pendiente de agendar")
            )
        );
    }, [postulaciones]);

    // Todos los eventos del calendario: citaciones a postulantes + fechas operativas/feriados
    const eventosCalendario = useMemo(() => {
        return [...entrevistasConFecha, ...fechasEspeciales];
    }, [entrevistasConFecha, fechasEspeciales]);

    // Entrevistas que caen en el día seleccionado
    const entrevistasDelDia = useMemo(() => {
        if (!diaSeleccionado) return [];
        return entrevistasConFecha.filter((p) => {
            const clave = extraerClaveFecha(p.fechaEntrevista || p.entrevista);
            return clave === diaSeleccionado;
        });
    }, [entrevistasConFecha, diaSeleccionado]);

    // Fechas operativas que caen en el día seleccionado
    const fechasEspecialesDelDia = useMemo(() => {
        if (!diaSeleccionado) return fechasEspeciales;
        return fechasEspeciales.filter((f) => extraerClaveFecha(f.fecha) === diaSeleccionado);
    }, [fechasEspeciales, diaSeleccionado]);

    // Filtrar postulantes para las tarjetas
    const postulantesFiltrados = useMemo(() => {
        return postulaciones.filter((p) => {
            const nombre = (p.candidatoNombre || p.nombre || "").toLowerCase();
            const rut = (p.candidatoRut || p.rut || "").toLowerCase();
            const cargo = (p.puestoTitulo || p.cargo || "").toLowerCase();
            const planta = (p.puestoPlanta || p.planta || "").toLowerCase();
            const termino = busqueda.toLowerCase().trim();

            const coincideBusqueda =
                !termino ||
                nombre.includes(termino) ||
                rut.includes(termino) ||
                cargo.includes(termino) ||
                planta.includes(termino);

            const tieneFecha = Boolean(
                p.fechaEntrevista ||
                    (p.entrevista &&
                        p.entrevista !== "Pendiente de confirmación" &&
                        p.entrevista !== "Por agendar" &&
                        p.entrevista !== "Pendiente de agendar")
            );

            let coincideEstado = true;
            if (filtroEstado === "agendados") coincideEstado = tieneFecha;
            if (filtroEstado === "sin_agendar") coincideEstado = !tieneFecha;

            return coincideBusqueda && coincideEstado;
        });
    }, [postulaciones, busqueda, filtroEstado]);

    const handleAgendar = async (datos) => {
        if (onAgendarEntrevista) {
            await onAgendarEntrevista(datos);
        }
    };

    const handleGuardarFechaEspecial = (e) => {
        e.preventDefault();
        if (!formFechaEspecial.titulo.trim() || !formFechaEspecial.fecha) {
            setErrorFechaEspecial("Debe ingresar un título y una fecha para el evento del calendario.");
            return;
        }
        const actualizadas = registrarFechaEspecialCalendario(formFechaEspecial);
        setFechasEspeciales(actualizadas);
        setFormFechaEspecial({
            titulo: "",
            tipoEvento: TIPOS_FECHA_ESPECIAL[0],
            fecha: new Date().toISOString().slice(0, 16),
            planta: "Todas las Plantas",
            observaciones: "",
        });
        setErrorFechaEspecial("");
        setModalFechaEspecialAbierto(false);
    };

    const handleEliminarFechaEspecial = (id) => {
        const actualizadas = eliminarFechaEspecialCalendario(id);
        setFechasEspeciales(actualizadas);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Encabezado */}
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
                        <Icono nombre="calendar" size={20} color="#0e97b3" />
                        Calendario y Coordinación de Citaciones (Google Calendar)
                    </h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        Entrevistas físicas/online, escuela de buceo, firma/entrega de papeles y fechas operativas (cierres, vacaciones, mantenimientos, feriados)
                    </span>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={() => setModalFechaEspecialAbierto(true)}
                        style={{
                            padding: "8px 14px",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            borderRadius: "6px",
                            border: "1px solid #f59e0b",
                            backgroundColor: "#fffbeb",
                            color: "#b45309",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <Icono nombre="plus" size={14} />
                        Registrar Fecha Operativa / Feriado
                    </button>
                    <div style={{ padding: "6px 14px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #dee2e6", textAlign: "center" }}>
                        <span style={ESTILO_ETIQUETA}>Total Postulantes</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>{postulaciones.length}</div>
                    </div>
                    <div style={{ padding: "6px 14px", backgroundColor: "#dcfce7", borderRadius: "6px", border: "1px solid #bbf7d0", textAlign: "center" }}>
                        <span style={{ ...ESTILO_ETIQUETA, color: "#166534" }}>Con Cita Agendada</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#166534" }}>{entrevistasConFecha.length}</div>
                    </div>
                    <div style={{ padding: "6px 14px", backgroundColor: "#fff3cd", borderRadius: "6px", border: "1px solid #ffeeba", textAlign: "center" }}>
                        <span style={{ ...ESTILO_ETIQUETA, color: "#856404" }}>Pendientes de Cita</span>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#856404" }}>
                            {postulaciones.length - entrevistasConFecha.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fila Superior: Calendario (izq) + Lista de Postulantes a modo de Tarjetas (der) */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                    gap: "20px",
                    alignItems: "stretch",
                }}
            >
                {/* Calendario */}
                <CalendarioEntrevistas
                    entrevistas={eventosCalendario}
                    diaSeleccionado={diaSeleccionado}
                    onSeleccionarDia={(clave) => setDiaSeleccionado(clave === diaSeleccionado ? null : clave)}
                />

                {/* Lista de Postulantes (Tarjetas) */}
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        border: "1px solid #dee2e6",
                        padding: "16px 20px",
                        minHeight: "440px",
                        maxHeight: "560px",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    }}
                >
                    {/* Encabezado y buscador compacto */}
                    <div style={{ borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Icono nombre="users" size={18} color="#0e97b3" />
                                Lista de Postulantes ({postulantesFiltrados.length})
                            </h3>
                            <span style={{ fontSize: "11px", color: "#888" }}>
                                {filtroEstado === "todos" ? "Todos" : filtroEstado === "sin_agendar" ? "Por citar" : "Agendados"}
                            </span>
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cargo, RUT..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    fontSize: "12px",
                                    border: "1px solid #ced4da",
                                    borderRadius: "5px",
                                    minWidth: "160px",
                                }}
                            />
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                style={{
                                    padding: "6px 8px",
                                    fontSize: "12px",
                                    border: "1px solid #ced4da",
                                    borderRadius: "5px",
                                }}
                            >
                                <option value="todos">Todos</option>
                                <option value="sin_agendar">Por citar</option>
                                <option value="agendados">Con cita</option>
                            </select>
                        </div>
                    </div>

                    {/* Tarjetas de postulantes con scroll vertical */}
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
                        {postulantesFiltrados.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 10px", color: "#888" }}>
                                No se encontraron postulantes con el filtro aplicado.
                            </div>
                        ) : (
                            postulantesFiltrados.map((postulante) => {
                                const tieneCita = Boolean(
                                    postulante.fechaEntrevista ||
                                        (postulante.entrevista &&
                                            postulante.entrevista !== "Pendiente de confirmación" &&
                                            postulante.entrevista !== "Por agendar" &&
                                            postulante.entrevista !== "Pendiente de agendar")
                                );

                                return (
                                    <article
                                        key={postulante.id}
                                        style={{
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            padding: "12px 14px",
                                            backgroundColor: tieneCita ? "#fdfefe" : "#fff",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#111827" }}>
                                                    {postulante.candidatoNombre || postulante.nombre}
                                                </h4>
                                                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                                    {postulante.puestoTitulo || postulante.cargo} · {postulante.puestoPlanta || postulante.planta}
                                                </span>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: "700",
                                                    borderRadius: "10px",
                                                    padding: "2px 7px",
                                                    backgroundColor: tieneCita ? "#dcfce7" : "#fef3c7",
                                                    color: tieneCita ? "#166534" : "#92400e",
                                                    border: tieneCita ? "1px solid #bbf7d0" : "1px solid #fde68a",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {tieneCita ? postulante.tipoCitacion || "Agendada" : "Por Citar"}
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", fontSize: "11px", color: "#4b5563" }}>
                                            <span>RUT: {postulante.candidatoRut || postulante.rut || "Sin RUT"}</span>
                                            {tieneCita && (
                                                <span style={{ color: "#166534", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <Icono nombre="clock" size={12} />
                                                    {formatearFechaHora(postulante.fechaEntrevista || postulante.entrevista)}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
                                            <BotonOrange
                                                texto={tieneCita ? "Reagendar" : "Programar Citación"}
                                                onClick={() => setPostulanteAEditar(postulante)}
                                            />
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Sección Inferior: Citaciones y Fechas Operativas Programadas */}
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                    padding: "20px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
            >
                {/* Cabecera de Entrevistas Programadas */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "12px",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Icono nombre="pin" size={18} color="#e8590c" />
                            {diaSeleccionado ? `Citaciones y Eventos del día: ${diaSeleccionado}` : "Citaciones y Fechas Operativas Programadas"}
                        </h3>
                        <span style={{ fontSize: "13px", color: "gray" }}>
                            {diaSeleccionado
                                ? `Mostrando ${entrevistasDelDia.length} citación(es) y ${fechasEspecialesDelDia.length} evento(s) operativo(s) para la fecha seleccionada`
                                : `Mostrando todas las citaciones confirmadas (${entrevistasConFecha.length}) y fechas operativas (${fechasEspeciales.length}). Haz clic en un día del calendario para filtrar.`}
                        </span>
                    </div>

                    {diaSeleccionado && (
                        <button
                            type="button"
                            onClick={() => setDiaSeleccionado(null)}
                            style={{
                                padding: "6px 12px",
                                fontSize: "12px",
                                borderRadius: "5px",
                                border: "1px solid #ced4da",
                                background: "#f8f9fa",
                                cursor: "pointer",
                                fontWeight: "600",
                                color: "#495057",
                            }}
                        >
                            Ver todas las fechas
                        </button>
                    )}
                </div>

                {/* Grilla de citaciones a postulantes */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "14px",
                    }}
                >
                    {(diaSeleccionado ? entrevistasDelDia : entrevistasConFecha).map((item) => {
                        const tipoCitacion = item.tipoCitacion || "Entrevistas físicas";
                        const urlGCal =
                            item.urlGoogleCalendar ||
                            construirUrlGoogleCalendar({
                                tipoCitacion,
                                fechaHora: item.fechaEntrevista || item.entrevista,
                                candidatoNombre: item.candidatoNombre || item.nombre,
                                candidatoEmail: item.candidatoEmail || item.email,
                                puestoTitulo: item.puestoTitulo || item.cargo,
                                planta: item.puestoPlanta || item.planta,
                                evaluador: item.evaluadorAsignado || item.encargado,
                                enlaceMeet: item.enlaceGoogleMeet,
                                observaciones: item.observaciones,
                            });

                        return (
                            <div
                                key={item.id}
                                style={{
                                    padding: "16px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                        <div style={{ fontWeight: "bold", fontSize: "15px", color: "#111827" }}>
                                            {item.candidatoNombre || item.nombre}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "bold",
                                                color: "#166534",
                                                backgroundColor: "#dcfce7",
                                                padding: "2px 8px",
                                                borderRadius: "12px",
                                                border: "1px solid #bbf7d0",
                                            }}
                                        >
                                            {tipoCitacion}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "4px" }}>
                                        {item.puestoTitulo || item.cargo} · {item.puestoPlanta || item.planta}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#166534", fontWeight: "600", marginTop: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                                        <Icono nombre="clock" size={13} />
                                        {formatearFechaHora(item.fechaEntrevista || item.entrevista)}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                                        Encargado: {item.evaluadorAsignado || item.encargado || "Sin asignar"}
                                    </div>
                                    {item.enlaceGoogleMeet && (
                                        <div style={{ fontSize: "12px", marginTop: "4px" }}>
                                            <a
                                                href={item.enlaceGoogleMeet}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: "#1d4ed8", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                            >
                                                <Icono nombre="externalLink" size={12} />
                                                Unirse a Google Meet
                                            </a>
                                        </div>
                                    )}
                                    {item.observaciones && (
                                        <div style={{ fontSize: "12px", color: "#374151", marginTop: "6px", backgroundColor: "#fff", padding: "6px 8px", borderRadius: "4px", border: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                            <Icono nombre="fileText" size={13} style={{ marginTop: "2px" }} />
                                            <span>{item.observaciones}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", paddingTop: "8px", borderTop: "1px solid #e5e7eb", flexWrap: "wrap" }}>
                                    <a
                                        href={urlGCal}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: "5px 10px",
                                            fontSize: "11.5px",
                                            borderRadius: "5px",
                                            border: "1px solid #bfdbfe",
                                            backgroundColor: "#eff6ff",
                                            color: "#1d4ed8",
                                            fontWeight: "700",
                                            textDecoration: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "5px",
                                        }}
                                    >
                                        <Icono nombre="calendar" size={12} />
                                        Google Calendar
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setPostulanteAEditar(item)}
                                        style={{
                                            padding: "6px 14px",
                                            fontSize: "12px",
                                            borderRadius: "5px",
                                            border: "1px solid #ced4da",
                                            background: "white",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            color: NARANJA_OSCURO,
                                        }}
                                    >
                                        Reagendar Cita
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Tarjetas de Fechas Operativas / Feriados */}
                    {fechasEspecialesDelDia.map((ev) => (
                        <div
                            key={ev.id}
                            style={{
                                padding: "16px",
                                borderRadius: "8px",
                                backgroundColor: "#fffbeb",
                                border: "1px solid #fde68a",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "10px",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                    <div style={{ fontWeight: "bold", fontSize: "14.5px", color: "#92400e" }}>
                                        {ev.titulo}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: "bold",
                                            color: "#92400e",
                                            backgroundColor: "#fef3c7",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            border: "1px solid #fcd34d",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {ev.tipoEvento}
                                    </span>
                                </div>
                                <div style={{ fontSize: "12.5px", color: "#78350f", marginTop: "4px" }}>
                                    Sede / Planta: {ev.planta || "Todas las Plantas"}
                                </div>
                                <div style={{ fontSize: "12.5px", color: "#b45309", fontWeight: "600", marginTop: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                                    <Icono nombre="calendar" size={13} />
                                    {formatearFechaHora(ev.fecha)}
                                </div>
                                {ev.observaciones && (
                                    <div style={{ fontSize: "12px", color: "#78350f", marginTop: "6px", backgroundColor: "#fff", padding: "6px 8px", borderRadius: "4px", border: "1px solid #fde68a" }}>
                                        {ev.observaciones}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #fde68a" }}>
                                <button
                                    type="button"
                                    onClick={() => handleEliminarFechaEspecial(ev.id)}
                                    style={{
                                        padding: "4px 10px",
                                        fontSize: "11.5px",
                                        borderRadius: "5px",
                                        border: "1px solid #fca5a5",
                                        background: "#fef2f2",
                                        color: "#b91c1c",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <Icono nombre="trash" size={12} />
                                    Quitar fecha
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para Citar / Reagendar Postulante */}
            <ModalAgendarEntrevista
                key={postulanteAEditar?.id || "modal-agendar"}
                isOpen={Boolean(postulanteAEditar)}
                postulante={postulanteAEditar}
                onCerrar={() => setPostulanteAEditar(null)}
                onAgendar={handleAgendar}
            />

            {/* Modal para Registrar Fecha Operativa (Cierres, Vacaciones, Mantenimientos, Feriados) */}
            {modalFechaEspecialAbierto && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1100,
                    }}
                    onClick={() => setModalFechaEspecialAbierto(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            width: "95%",
                            maxWidth: "480px",
                            padding: "20px 24px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Icono nombre="calendar" size={18} color="#b45309" />
                                    Registrar Fecha Operativa en Calendario
                                </h3>
                                <span style={{ fontSize: "12px", color: "#666" }}>
                                    Cierres de local, vacaciones, mantenimientos, sanitizaciones o feriados
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalFechaEspecialAbierto(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}
                            >
                                <Icono nombre="close" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarFechaEspecial} noValidate style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                                    Tipo de Fecha Competente *
                                </label>
                                <select
                                    value={formFechaEspecial.tipoEvento}
                                    onChange={(e) => setFormFechaEspecial((prev) => ({ ...prev, tipoEvento: e.target.value }))}
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #ced4da" }}
                                >
                                    {TIPOS_FECHA_ESPECIAL.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                                    Título / Motivo *
                                </label>
                                <input
                                    type="text"
                                    value={formFechaEspecial.titulo}
                                    onChange={(e) => {
                                        setFormFechaEspecial((prev) => ({ ...prev, titulo: e.target.value }));
                                        setErrorFechaEspecial("");
                                    }}
                                    placeholder="Ej: Sanitización programada línea de proceso"
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #ced4da", boxSizing: "border-box" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                                        Fecha y Hora *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formFechaEspecial.fecha}
                                        onChange={(e) => setFormFechaEspecial((prev) => ({ ...prev, fecha: e.target.value }))}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #ced4da", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                                        Planta / Sede
                                    </label>
                                    <select
                                        value={formFechaEspecial.planta}
                                        onChange={(e) => setFormFechaEspecial((prev) => ({ ...prev, planta: e.target.value }))}
                                        style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #ced4da" }}
                                    >
                                        <option value="Todas las Plantas">Todas las Plantas</option>
                                        {PLANTAS_DISPONIBLES.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                                    Observaciones
                                </label>
                                <textarea
                                    rows={2}
                                    value={formFechaEspecial.observaciones}
                                    onChange={(e) => setFormFechaEspecial((prev) => ({ ...prev, observaciones: e.target.value }))}
                                    placeholder="Detalle impacto en horarios de citación..."
                                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #ced4da", boxSizing: "border-box" }}
                                />
                            </div>

                            {errorFechaEspecial && (
                                <div style={{ color: "#721c24", backgroundColor: "#f8d7da", padding: "8px 12px", borderRadius: "4px", fontSize: "12.5px" }}>
                                    {errorFechaEspecial}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                                <button
                                    type="button"
                                    onClick={() => setModalFechaEspecialAbierto(false)}
                                    style={{ padding: "8px 16px", borderRadius: "5px", border: "1px solid #ced4da", background: "white", cursor: "pointer", fontWeight: "600" }}
                                >
                                    Cancelar
                                </button>
                                <BotonOrange type="submit" texto="Guardar en Calendario" />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AgendaEntrevistasView;
