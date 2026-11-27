import { useState, useMemo, useEffect } from "react";
import HeaderRoles from "../components/HeaderRoles";
import ModalDetalleSolicitud from "../components/ModalDetalleSolicitud";
import ModalSolicitarInforme from "../components/ModalSolicitarInforme";
import ModalDetalleInforme from "../components/ModalDetalleInforme";
import BandejaInformesView from "../components/BandejaInformesView";
import BotonOrange from "../components/BotonOrange";
import PostulantesPorPuestoView from "../components/PostulantesPorPuestoView";
import GestionCandidatosView from "../components/GestionCandidatosView";
import GestionPuestosView from "../components/GestionPuestosView";
import ModalCrearPuesto from "../components/ModalCrearPuesto";
import AgendaEntrevistasView from "../components/AgendaEntrevistasView";
import { api } from "../services/api";
import { obtenerSesionEmpleado } from "../services/empleadosStorage";
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
import {
    cargarPuestosGlobales,
    registrarPuestoGlobal,
    actualizarPuestoGlobal,
    actualizarEstadoPuestoGlobal,
    eliminarPuestoGlobal,
    sincronizarPuestosConRemotos,
    cargarEtiquetasGlobales,
    guardarEtiquetasGlobales,
    EVENTO_ACTUALIZACION_PUESTOS,
} from "../services/puestosStorage";
import { cargarInformesIniciales, guardarInformesLocal } from "../services/informesStorage";
import GrillaIndicadores from "../components/GrillaIndicadores";
import BannerEstadoBackend from "../components/BannerEstadoBackend";
import EncabezadoDashboard from "../components/EncabezadoDashboard.jsx";
import EncabezadoRegistro from "../components/EncabezadoRegistro";
import PanelSolicitudes from "../components/PanelSolicitudes";

import { PLANTAS_DISPONIBLES, EVALUADORES_DISPONIBLES, obtenerNombreAreaPorId } from "../utils/constantes";
import { calcularIndicadores, aplicarFiltros } from "../utils/solicitudesUtils";

function JefaturaPage({ onVolver }) {
    const rolActual = "jefatura";
    const [usuarioJefe] = useState(() => obtenerSesionEmpleado()?.usuario || null);
    const areaJefeId = usuarioJefe?.area_id ? Number(usuarioJefe.area_id) : null;
    const nombreAreaJefe = obtenerNombreAreaPorId(areaJefeId);
    const autorJefeTexto = usuarioJefe?.nombre
        ? `${usuarioJefe.nombre}${nombreAreaJefe ? ` (Jefe ${nombreAreaJefe})` : " (Jefe de Área)"}`
        : "Jefe de Área";

    const [tabActiva, setTabActiva] = useState("dashboard");
    const [candidatos, setCandidatos] = useState(cargarCandidatosGlobales);
    const [informes, setInformes] = useState(cargarInformesIniciales);
    const [puestos, setPuestos] = useState(cargarPuestosGlobales);
    const [etiquetas, setEtiquetas] = useState(cargarEtiquetasGlobales);
    const [postulaciones, setPostulaciones] = useState(cargarPostulacionesGlobales);
    const [backendConectado, setBackendConectado] = useState(false);
    const [cargandoApi, setCargandoApi] = useState(false);

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [modalCrearInformeAbierto, setModalCrearInformeAbierto] = useState(false);
    const [modalCrearPuestoAbierto, setModalCrearPuestoAbierto] = useState(false);
    const [puestoEnEdicion, setPuestoEnEdicion] = useState(null);
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
        const handleRecargarPuestos = () => {
            setPuestos(cargarPuestosGlobales());
            setEtiquetas(cargarEtiquetasGlobales());
        };
        window.addEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargar);
        window.addEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleRecargarPostulaciones);
        window.addEventListener(EVENTO_ACTUALIZACION_PUESTOS, handleRecargarPuestos);
        window.addEventListener("storage", handleRecargar);
        window.addEventListener("storage", handleRecargarPuestos);
        return () => {
            window.removeEventListener(EVENTO_ACTUALIZACION_CANDIDATOS, handleRecargar);
            window.removeEventListener(EVENTO_ACTUALIZACION_POSTULACIONES, handleRecargarPostulaciones);
            window.removeEventListener(EVENTO_ACTUALIZACION_PUESTOS, handleRecargarPuestos);
            window.removeEventListener("storage", handleRecargar);
            window.removeEventListener("storage", handleRecargarPuestos);
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
                    guardarInformesLocal(informesRemotos);
                }

                if (isMounted && Array.isArray(puestosRemotos) && puestosRemotos.length > 0) {
                    const fusionados = sincronizarPuestosConRemotos(puestosRemotos);
                    setPuestos(fusionados);
                }

                if (isMounted && Array.isArray(etiquetasRemotas) && etiquetasRemotas.length > 0) {
                    const nombres = etiquetasRemotas.map((e) => (typeof e === "string" ? e : e.nombre)).filter(Boolean);
                    if (nombres.length > 0) {
                        setEtiquetas((prev) => {
                            const nuevas = Array.from(new Set([...prev, ...nombres]));
                            guardarEtiquetasGlobales(nuevas);
                            return nuevas;
                        });
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

    /* ==================== SEGREGACIÓN POR ÁREA DE JEFATURA ==================== */

    // 1. Puestos que competen al área del Jefe logueado
    const puestosDelArea = useMemo(() => {
        if (!areaJefeId && !nombreAreaJefe) return puestos;
        return puestos.filter((p) => {
            const coincideAreaId = p.area_id && Number(p.area_id) === Number(areaJefeId);
            const coincideFamilia =
                nombreAreaJefe &&
                (p.familiaCargo || "").toLowerCase().trim() === nombreAreaJefe.toLowerCase().trim();
            return coincideAreaId || coincideFamilia;
        });
    }, [puestos, areaJefeId, nombreAreaJefe]);

    // 2. Postulaciones inscritas en puestos del área del Jefe
    const postulacionesDelArea = useMemo(() => {
        if (!areaJefeId && !nombreAreaJefe) return postulaciones;
        const idsPuestosArea = new Set(puestosDelArea.map((p) => Number(p.id)));
        const titulosPuestosArea = new Set(
            puestosDelArea.map((p) => (p.titulo || "").toLowerCase().trim()).filter(Boolean)
        );
        return postulaciones.filter((pos) => {
            const pid = Number(pos.puestoTrabajoId || pos.puestoId);
            if (pid && idsPuestosArea.has(pid)) return true;
            const tituloPos = (pos.puestoTitulo || pos.cargo || "").toLowerCase().trim();
            if (tituloPos && titulosPuestosArea.has(tituloPos)) return true;
            const famPos = (pos.puestoFamilia || pos.familiaCargo || "").toLowerCase().trim();
            if (nombreAreaJefe && famPos === nombreAreaJefe.toLowerCase().trim()) return true;
            return false;
        });
    }, [postulaciones, puestosDelArea, areaJefeId, nombreAreaJefe]);

    // 3. Candidatos que postulan en trabajos del área del Jefe
    const candidatosDelArea = useMemo(() => {
        if (!areaJefeId && !nombreAreaJefe) return candidatos;
        const idsCandidatosEnPostulaciones = new Set(
            postulacionesDelArea.map((pos) => Number(pos.candidatoId)).filter(Boolean)
        );
        const rutsEnPostulaciones = new Set(
            postulacionesDelArea
                .map((pos) => (pos.candidatoRut || pos.rut || "").replace(/[.-]/g, "").trim().toLowerCase())
                .filter(Boolean)
        );
        const titulosPuestosArea = new Set(
            puestosDelArea.map((p) => (p.titulo || "").toLowerCase().trim()).filter(Boolean)
        );

        return candidatos.filter((c) => {
            if (idsCandidatosEnPostulaciones.has(Number(c.id))) return true;
            const rutCand = (c.rut || "").replace(/[.-]/g, "").trim().toLowerCase();
            if (rutCand && rutsEnPostulaciones.has(rutCand)) return true;
            if (
                nombreAreaJefe &&
                (c.familiaCargo || "").toLowerCase().trim() === nombreAreaJefe.toLowerCase().trim()
            ) {
                return true;
            }
            const cargoCand = (c.cargo || c.especialidad || "").toLowerCase().trim();
            if (cargoCand && titulosPuestosArea.has(cargoCand)) return true;
            return false;
        });
    }, [candidatos, postulacionesDelArea, puestosDelArea, areaJefeId, nombreAreaJefe]);

    // 4. Informes de candidatos pertenecientes al área del Jefe
    const informesDelArea = useMemo(() => {
        if (!areaJefeId && !nombreAreaJefe) return informes;
        const idsCand = new Set(candidatosDelArea.map((c) => Number(c.id)));
        const nombresCand = new Set(
            candidatosDelArea.map((c) => (c.nombre || "").toLowerCase().trim()).filter(Boolean)
        );
        const idsPuestos = new Set(puestosDelArea.map((p) => Number(p.id)));

        return informes.filter((inf) => {
            if (inf.candidatoId && idsCand.has(Number(inf.candidatoId))) return true;
            if (inf.puestoTrabajoId && idsPuestos.has(Number(inf.puestoTrabajoId))) return true;
            if (
                inf.candidatoNombre &&
                nombresCand.has(inf.candidatoNombre.toLowerCase().trim())
            ) {
                return true;
            }
            return false;
        });
    }, [informes, candidatosDelArea, puestosDelArea, areaJefeId, nombreAreaJefe]);

    const handleCrearInforme = async (nuevoInformeDatos) => {
        const datosConAutor = {
            ...nuevoInformeDatos,
            solicitante: autorJefeTexto,
        };
        try {
            const creado = await api.crearSolicitudInforme(datosConAutor);
            setInformes((prev) => {
                const actualizados = [creado, ...prev];
                guardarInformesLocal(actualizados);
                return actualizados;
            });
        } catch {
            setInformes((prev) => {
                const nuevoId = prev.length > 0 ? Math.max(...prev.map((i) => Number(i.id) || 0)) + 1 : 1;
                const nuevoLocal = {
                    id: nuevoId,
                    ...datosConAutor,
                    estado: "Abierta",
                    fechaCreacion: new Date().toISOString(),
                    preguntas: nuevoInformeDatos.preguntas.map((p, idx) => ({
                        id: idx + 1,
                        texto: p,
                        fecha: new Date().toISOString(),
                        creadaPor: autorJefeTexto,
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
            const actualizado = await api.agregarPreguntaInforme(id, {
                ...datosPregunta,
                creadaPor: autorJefeTexto,
            });
            setInformes((prev) => {
                const actualizados = prev.map((inf) => (inf.id === id ? actualizado : inf));
                guardarInformesLocal(actualizados);
                return actualizados;
            });
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
                            creadaPor: autorJefeTexto,
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

    const handleAgendarEntrevista = async ({
        postulacionId,
        fechaEntrevista,
        tipoCitacion,
        evaluadorAsignado,
        enlaceGoogleMeet,
        urlGoogleCalendar,
        observaciones,
    }) => {
        try {
            const actualizado = await api.agendarEntrevistaPostulacion(postulacionId, {
                fechaEntrevista,
                tipoCitacion,
                evaluadorAsignado,
                enlaceGoogleMeet,
                urlGoogleCalendar,
                observaciones,
            });
            setPostulaciones((prev) => {
                const list = prev.map((p) => (p.id === postulacionId ? { ...p, ...actualizado } : p));
                guardarPostulacionesGlobales(list);
                return list;
            });
        } catch {
            setPostulaciones((prev) => {
                const list = prev.map((p) => {
                    if (p.id === postulacionId) {
                        return {
                            ...p,
                            fechaEntrevista,
                            tipoCitacion: tipoCitacion || "Entrevistas físicas",
                            evaluadorAsignado,
                            enlaceGoogleMeet: enlaceGoogleMeet || "",
                            urlGoogleCalendar: urlGoogleCalendar || "",
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
        const actuales = cargarEtiquetasGlobales();
        const nuevas = actuales.includes(limpio) ? actuales : [...actuales, limpio];
        guardarEtiquetasGlobales(nuevas);
        setEtiquetas(nuevas);
    };

    const handleCrearPuesto = async (datosPuesto) => {
        const payload = {
            ...datosPuesto,
            area_id: areaJefeId || datosPuesto.area_id || null,
            familiaCargo: nombreAreaJefe || datosPuesto.familiaCargo,
            creadoPor: autorJefeTexto,
        };
        try {
            const creado = await api.crearPuesto(payload);
            const actualizados = registrarPuestoGlobal(creado);
            setPuestos(actualizados);
        } catch {
            const actualizados = registrarPuestoGlobal({
                ...payload,
                estado: "Abierto",
                fechaCreacion: new Date().toISOString(),
            });
            setPuestos(actualizados);
        }
        if (Array.isArray(datosPuesto.etiquetas) && datosPuesto.etiquetas.length > 0) {
            const actuales = cargarEtiquetasGlobales();
            const nuevas = Array.from(new Set([...actuales, ...datosPuesto.etiquetas]));
            guardarEtiquetasGlobales(nuevas);
            setEtiquetas(nuevas);
        }
    };

    const handleEditarPuesto = async (id, datosActualizados) => {
        const payload = {
            ...datosActualizados,
            area_id: areaJefeId || datosActualizados.area_id || null,
            familiaCargo: nombreAreaJefe || datosActualizados.familiaCargo,
            modificadoPor: autorJefeTexto,
        };
        try {
            const actualizadoRemoto = await api.actualizarPuesto(id, payload);
            const actualizados = actualizarPuestoGlobal(id, actualizadoRemoto);
            setPuestos(actualizados);
        } catch {
            const actualizados = actualizarPuestoGlobal(id, {
                ...payload,
                forzarCalculoLocal: true,
            });
            setPuestos(actualizados);
        }
        if (Array.isArray(datosActualizados.etiquetas) && datosActualizados.etiquetas.length > 0) {
            const actuales = cargarEtiquetasGlobales();
            const nuevas = Array.from(new Set([...actuales, ...datosActualizados.etiquetas]));
            guardarEtiquetasGlobales(nuevas);
            setEtiquetas(nuevas);
        }
        setPuestoEnEdicion(null);
    };

    const handleCambiarEstadoPuesto = async (id, nuevoEstado) => {
        try {
            const actualizado = await api.cambiarEstadoPuesto(id, nuevoEstado);
            const actualizados = actualizarPuestoGlobal(id, actualizado || { estado: nuevoEstado, modificadoPor: autorJefeTexto, forzarCalculoLocal: true });
            setPuestos(actualizados);
        } catch {
            const actualizados = actualizarEstadoPuestoGlobal(id, nuevoEstado, autorJefeTexto);
            setPuestos(actualizados);
        }
    };

    const handleEliminarPuesto = async (id) => {
        try {
            await api.eliminarPuesto(id);
        } catch {
            // Continuar con eliminación local
        }
        const actualizados = eliminarPuestoGlobal(id);
        setPuestos(actualizados);
    };

    const handleCambiarEstadoInforme = async (id, nuevoEstado) => {
        try {
            const actualizado = await api.cambiarEstadoSolicitudInforme(id, nuevoEstado);
            setInformes((prev) => {
                const actualizados = prev.map((inf) => (inf.id === id ? actualizado : inf));
                guardarInformesLocal(actualizados);
                return actualizados;
            });
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
        const base = calcularIndicadores(candidatosDelArea);
        const puestosAbiertos = puestosDelArea.filter((p) => p.estado === "Abierto").length;
        return [
            ...base,
            { id: 5, titulo: "Puestos Abiertos en Área", valor: puestosAbiertos },
            { id: 6, titulo: "Informes Solicitados", valor: informesDelArea.length },
        ];
    }, [candidatosDelArea, puestosDelArea, informesDelArea.length]);

    const solicitudesFiltradas = useMemo(() => {
        return aplicarFiltros(candidatosDelArea, {
            busqueda,
            filtroEstado,
            filtroPlanta,
            filtroEvaluador,
        });
    }, [candidatosDelArea, busqueda, filtroEstado, filtroPlanta, filtroEvaluador]);

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
        totalOriginal: candidatosDelArea.length,
        onLimpiarFiltros: handleLimpiarFiltros,
    };

    return (
        <main style={{ backgroundColor: "#f3f6f9", fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif", padding: "20px", minHeight: "100vh" }}>
            <HeaderRoles
                rolActual={rolActual}
                tabActiva={tabActiva}
                onCambiarTab={setTabActiva}
                onVolver={onVolver}
                tabs={[
                    { id: "dashboard", label: "Dashboard Operativo" },
                    { id: "puestos", label: "Ofertas de Trabajo" },
                    { id: "postulantes", label: "Lista de Postulantes" },
                    { id: "postulantesPorPuesto", label: "Lista de Candidatos" },
                    { id: "entrevistas", label: "Calendario y Citaciones" },
                    { id: "informes", label: "Informes de Candidatos" },
                ]}
            />

            <BannerEstadoBackend
                backendConectado={backendConectado}
                cargandoApi={cargandoApi}
                etiquetaPantalla={`Pantalla Dedicada · Jefe de Área${nombreAreaJefe ? ` (${nombreAreaJefe})` : ""}`}
            />

            {tabActiva === "dashboard" && (
                <>
                    <EncabezadoDashboard
                        subtitulo={`Jefe de Área${nombreAreaJefe ? ` · ${nombreAreaJefe}` : ""} · Supervisión de candidatos en ofertas de su área`}
                    >
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
                                {nombreAreaJefe ? `Área: ${nombreAreaJefe}` : "Jefatura de Área"}
                            </span>
                        </div>
                    </EncabezadoDashboard>

                    <GrillaIndicadores indicadores={indicadores} />

                    <PanelSolicitudes
                        anchoCompleto
                        encabezado={
                            <EncabezadoRegistro
                                subtitulo={`Supervisión y trazabilidad de postulantes en trabajos del área ${nombreAreaJefe || "asignada"}`}
                            />
                        }
                        filtros={propsFiltros}
                        solicitudes={solicitudesFiltradas}
                        mensajeVacio="No se encontraron candidatos del área con los filtros aplicados."
                        onDetalle={setSolicitudSeleccionada}
                    />
                </>
            )}

            {tabActiva === "postulantes" && (
                <GestionCandidatosView
                    candidatos={candidatosDelArea}
                    rolActual={rolActual}
                    onVerDetalle={setSolicitudSeleccionada}
                />
            )}

            {tabActiva === "entrevistas" && (
                <AgendaEntrevistasView
                    postulaciones={postulacionesDelArea}
                    onAgendarEntrevista={handleAgendarEntrevista}
                />
            )}

            {tabActiva === "puestos" && (
                <GestionPuestosView
                    puestos={puestosDelArea}
                    etiquetas={etiquetas}
                    areaJefeId={areaJefeId}
                    nombreAreaJefe={nombreAreaJefe}
                    onCrearEtiqueta={handleCrearEtiqueta}
                    onAbrirCrear={() => {
                        setPuestoEnEdicion(null);
                        setModalCrearPuestoAbierto(true);
                    }}
                    onAbrirEditar={(puesto) => {
                        setPuestoEnEdicion(puesto);
                        setModalCrearPuestoAbierto(true);
                    }}
                    onCambiarEstado={handleCambiarEstadoPuesto}
                    onEliminarPuesto={handleEliminarPuesto}
                />
            )}

            {tabActiva === "postulantesPorPuesto" && (
                <PostulantesPorPuestoView
                    postulaciones={postulacionesDelArea}
                    candidatos={candidatosDelArea}
                    puestos={puestosDelArea}
                    onVerDetalle={(post) => setSolicitudSeleccionada(post)}
                />
            )}

            {tabActiva === "informes" && (
                <BandejaInformesView
                    informes={informesDelArea}
                    rolActual={rolActual}
                    onAbrirCrear={() => setModalCrearInformeAbierto(true)}
                    onVerDetalle={(inf) => setInformeSeleccionado(inf)}
                />
            )}

            <ModalDetalleSolicitud
                key={solicitudSeleccionada?.id || "modal-detalle"}
                isOpen={Boolean(solicitudSeleccionada)}
                solicitud={solicitudSeleccionada}
                informes={informesDelArea}
                candidatos={candidatosDelArea}
                onCerrar={() => setSolicitudSeleccionada(null)}
                onAgregarPregunta={handleAgregarPreguntaInforme}
                onCambiarEstadoInforme={handleCambiarEstadoInforme}
                rolActual={rolActual}
            />

            <ModalSolicitarInforme
                isOpen={modalCrearInformeAbierto}
                candidatos={candidatosDelArea}
                onCerrar={() => setModalCrearInformeAbierto(false)}
                onCrear={handleCrearInforme}
            />

            <ModalDetalleInforme
                key={informeSeleccionado?.id || "modal-detalle-informe"}
                isOpen={Boolean(informeSeleccionado)}
                informe={informeSeleccionado}
                informes={informesDelArea}
                candidatos={candidatosDelArea}
                rolActual={rolActual}
                onCerrar={() => setInformeSeleccionado(null)}
                onAgregarPregunta={handleAgregarPreguntaInforme}
                onCambiarEstadoInforme={handleCambiarEstadoInforme}
                onCambiarEstado={handleCambiarEstadoInforme}
            />

            <ModalCrearPuesto
                key={puestoEnEdicion?.id || "crear-puesto"}
                isOpen={modalCrearPuestoAbierto}
                puestoInicial={puestoEnEdicion}
                areaJefeId={areaJefeId}
                nombreAreaJefe={nombreAreaJefe}
                etiquetasDisponibles={etiquetas}
                onCrearEtiqueta={handleCrearEtiqueta}
                onCerrar={() => {
                    setModalCrearPuestoAbierto(false);
                    setPuestoEnEdicion(null);
                }}
                onCrear={handleCrearPuesto}
                onEditar={handleEditarPuesto}
            />
        </main>
    );
}

export default JefaturaPage;
