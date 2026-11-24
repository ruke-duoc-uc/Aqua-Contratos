/** Vista especializada: Postulantes inscritos por Puesto de Trabajo
 * Permite seleccionar un puesto y ver la tabla de postulantes que se inscribieron a él.
 * Incluye acceso rápido al CV y al detalle de la postulación.
 */
import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { abrirCvDocumento } from "../utils/visorCv";
import Icono from "./Icono";
import {
    cargarPuestosGlobales,
    sincronizarPuestosConRemotos,
    EVENTO_ACTUALIZACION_PUESTOS,
} from "../services/puestosStorage";
import { cargarCandidatosGlobales } from "../services/candidatosStorage";

function PostulantesPorPuestoView({ postulaciones = [], candidatos = [], puestos: puestosProp, onVerDetalle }) {
    const [puestos, setPuestos] = useState(() =>
        Array.isArray(puestosProp) && puestosProp.length > 0 ? puestosProp : cargarPuestosGlobales()
    );
    const [puestoSeleccionado, setPuestoSeleccionado] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(false);

    // Sincronizar si el padre pasa puestos actualizados
    useEffect(() => {
        if (Array.isArray(puestosProp) && puestosProp.length > 0) {
            setPuestos(puestosProp);
        }
    }, [puestosProp]);

    // Cargar puestos desde el backend con respaldo en el storage global
    useEffect(() => {
        let activo = true;
        async function cargar() {
            setCargando(true);
            try {
                const datos = await api.getPuestos();
                if (activo && Array.isArray(datos) && datos.length > 0) {
                    const fusionados = sincronizarPuestosConRemotos(datos);
                    setPuestos(fusionados);
                }
            } catch {
                if (activo) {
                    setPuestos(cargarPuestosGlobales());
                }
            } finally {
                if (activo) setCargando(false);
            }
        }
        cargar();

        const handleRecargarPuestos = () => {
            if (activo) setPuestos(cargarPuestosGlobales());
        };
        window.addEventListener(EVENTO_ACTUALIZACION_PUESTOS, handleRecargarPuestos);
        return () => {
            activo = false;
            window.removeEventListener(EVENTO_ACTUALIZACION_PUESTOS, handleRecargarPuestos);
        };
    }, []);

    const listaCandidatos = useMemo(() => {
        return Array.isArray(candidatos) && candidatos.length > 0
            ? candidatos
            : cargarCandidatosGlobales();
    }, [candidatos]);

    const puestoActual = useMemo(
        () => puestos.find((p) => String(p.id) === String(puestoSeleccionado)) || null,
        [puestos, puestoSeleccionado]
    );

    // Enriquecer cada postulación cruzándola con la ficha completa del candidato
    const postulacionesEnriquecidas = useMemo(() => {
        return (postulaciones || []).map((post) => {
            const rutPost = (post.candidatoRut || post.rutCandidato || post.rut || "")
                .replace(/[.-]/g, "")
                .trim()
                .toLowerCase();
            const cand = listaCandidatos.find(
                (c) =>
                    (post.candidatoId && Number(c.id) === Number(post.candidatoId)) ||
                    (rutPost && (c.rut || "").replace(/[.-]/g, "").trim().toLowerCase() === rutPost)
            );

            const nombre =
                post.candidatoNombre ||
                post.nombreCandidato ||
                post.nombre ||
                cand?.nombre ||
                `${cand?.nombres || ""} ${cand?.apellidos || ""}`.trim() ||
                "—";
            const rut = post.candidatoRut || post.rutCandidato || post.rut || cand?.rut || "—";
            const comuna =
                post.comuna ||
                cand?.comuna ||
                post.puestoPlanta ||
                post.planta ||
                cand?.planta ||
                "—";
            const cv_pdf = post.cv_pdf || post.cvArchivo || cand?.cv_pdf || cand?.cvArchivo || null;
            const cvDataUrl = post.cvDataUrl || cand?.cvDataUrl || "";
            const evaluador =
                post.evaluadorAsignado ||
                post.encargado ||
                post.evaluador ||
                cand?.evaluador ||
                "Sin asignar";
            const puestoIdFinal = post.puestoTrabajoId || post.puestoId || null;

            return {
                ...cand,
                ...post,
                id: post.id,
                postulacionId: post.id,
                candidatoId: cand?.id || post.candidatoId || post.id,
                puestoTrabajoId: puestoIdFinal,
                puestoId: puestoIdFinal,
                nombre,
                candidatoNombre: nombre,
                nombreCandidato: nombre,
                nombres: post.nombres || cand?.nombres || "",
                apellidos: post.apellidos || cand?.apellidos || "",
                rut,
                candidatoRut: rut,
                rutCandidato: rut,
                comuna,
                direccion: post.direccion || cand?.direccion || "",
                fecha_nacimiento: post.fecha_nacimiento || cand?.fecha_nacimiento || "",
                antecedentes: post.antecedentes || cand?.antecedentes || "",
                cv_pdf,
                cvArchivo: cv_pdf,
                cvDataUrl,
                evaluadorAsignado: evaluador,
                evaluador,
                candidatoRef: cand || null,
            };
        });
    }, [postulaciones, listaCandidatos]);

    const coincideConPuesto = (post, puesto) => {
        if (!puesto) return false;
        const idPuestoPost = post.puestoTrabajoId ?? post.puestoId;
        if (idPuestoPost !== undefined && idPuestoPost !== null && String(idPuestoPost) === String(puesto.id)) {
            return true;
        }
        const tituloPost = (post.puestoTitulo || post.cargo || "").toLowerCase().trim();
        const tituloPuesto = (puesto.titulo || puesto.nombre || "").toLowerCase().trim();
        if (tituloPost && tituloPuesto && tituloPost === tituloPuesto) {
            const plantaPost = (post.puestoPlanta || post.planta || "").toLowerCase().trim();
            const plantaPuesto = (puesto.planta || "").toLowerCase().trim();
            return !plantaPuesto || !plantaPost || plantaPost === plantaPuesto;
        }
        return false;
    };

    // Filtrar candidatos inscritos por puesto seleccionado y búsqueda (D3: Lista de Candidatos)
    const postulacionesFiltradas = useMemo(() => {
        const base =
            !puestoSeleccionado || puestoSeleccionado === "todos"
                ? postulacionesEnriquecidas
                : puestoActual
                ? postulacionesEnriquecidas.filter((p) => coincideConPuesto(p, puestoActual))
                : postulacionesEnriquecidas.filter(
                      (p) => String(p.puestoTrabajoId ?? p.puestoId) === String(puestoSeleccionado)
                  );

        const termino = busqueda.toLowerCase().trim();
        if (!termino) return base;

        return base.filter((p) => {
            const nombre = (p.candidatoNombre || p.nombre || "").toLowerCase();
            const rut = (p.candidatoRut || p.rut || "").toLowerCase();
            const cargo = (p.puestoTitulo || p.cargo || "").toLowerCase();
            const comuna = (p.comuna || p.planta || "").toLowerCase();
            return (
                nombre.includes(termino) ||
                rut.includes(termino) ||
                cargo.includes(termino) ||
                comuna.includes(termino)
            );
        });
    }, [postulacionesEnriquecidas, puestoSeleccionado, puestoActual, busqueda]);

    return (
        <section
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "1px solid #dbe3eb",
                borderTop: "4px solid #223b4c",
                overflow: "hidden",
                boxShadow: "0 3px 10px rgba(34, 59, 76, 0.05)",
            }}
        >
            {/* Cabecera */}
            <div
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #eee",
                }}
            >
                <h2 style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icono nombre="briefcase" size={20} color="#0e97b3" />
                    Lista de Candidatos (Inscritos en Ofertas de Trabajo)
                </h2>
                <span style={{ fontSize: "13px", color: "gray" }}>
                    Los candidatos son los postulantes que se han inscrito en una oferta laboral específica
                </span>
            </div>

            {/* Selector de puesto y buscador */}
            <div style={{ padding: "12px 20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", backgroundColor: "#f8f9fa", borderBottom: "1px solid #eee" }}>
                <label htmlFor="selector-puesto" style={{ fontWeight: "600", fontSize: "14px" }}>
                    Filtrar por Oferta:
                </label>
                <select
                    id="selector-puesto"
                    className="filtro-select"
                    value={puestoSeleccionado}
                    onChange={(e) => setPuestoSeleccionado(e.target.value)}
                    style={{ minWidth: "300px" }}
                    disabled={cargando}
                >
                    <option value="todos">
                        {cargando
                            ? "Cargando ofertas..."
                            : `Todas las ofertas con candidatos (${postulacionesEnriquecidas.length})`}
                    </option>
                    {puestos.map((p) => {
                        const cantidadInscritos = postulacionesEnriquecidas.filter((post) =>
                            coincideConPuesto(post, p)
                        ).length;
                        return (
                            <option key={p.id} value={p.id}>
                                {p.titulo || p.nombre || `Puesto #${p.id}`}
                                {p.planta ? ` · ${p.planta}` : ""}
                                {p.estado ? ` (${p.estado})` : ""}
                                {` — [${cantidadInscritos} candidato${cantidadInscritos !== 1 ? "s" : ""}]`}
                            </option>
                        );
                    })}
                </select>

                <input
                    type="text"
                    className="buscador-input"
                    placeholder="Buscar candidato por nombre, RUT o cargo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ flex: 1, minWidth: "220px" }}
                />

                <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "auto" }}>
                    <strong>{postulacionesFiltradas.length}</strong> candidato{postulacionesFiltradas.length !== 1 ? "s" : ""} inscrito{postulacionesFiltradas.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Info del puesto seleccionado */}
            {puestoActual && (
                <div style={{ padding: "10px 20px", fontSize: "13px", color: "#555", backgroundColor: "#eff6ff", borderBottom: "1px solid #dbeafe" }}>
                    <strong>Oferta seleccionada: {puestoActual.titulo || puestoActual.nombre}</strong>
                    {puestoActual.planta ? ` — Planta: ${puestoActual.planta}` : ""}
                    {puestoActual.familiaCargo ? ` — Área: ${puestoActual.familiaCargo}` : ""}
                    {puestoActual.estado ? ` — Estado: ${puestoActual.estado}` : ""}
                </div>
            )}

            {/* Tabla de candidatos */}
            {postulacionesFiltradas.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#999", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <Icono nombre="inbox" size={18} />
                    <span>No hay candidatos inscritos en la oferta o filtro seleccionado.</span>
                </div>
            ) : (
                <div className="table-responsive shadow-sm" style={{ borderRadius: "8px" }}>
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: "13.5px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#223b4c", color: "white", textAlign: "left" }}>
                                <th style={{ padding: "12px 14px" }}>Candidato</th>
                                <th style={{ padding: "12px 14px" }}>RUT</th>
                                <th style={{ padding: "12px 14px" }}>Oferta Postulada</th>
                                <th style={{ padding: "12px 14px" }}>Comuna / Planta</th>
                                <th style={{ padding: "12px 14px" }}>Fecha Postulación</th>
                                <th style={{ padding: "12px 14px" }}>Estado</th>
                                <th style={{ padding: "12px 14px" }}>Evaluador</th>
                                <th style={{ padding: "12px 14px" }}>CV</th>
                                <th style={{ padding: "12px 14px", textAlign: "center" }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {postulacionesFiltradas.map((post) => {
                                const nombre = post.candidatoNombre || post.nombreCandidato || post.nombre || "—";
                                const rut = post.candidatoRut || post.rutCandidato || post.rut || "—";
                                const comuna = post.comuna || post.planta || "—";
                                const fechaIns = post.fechaPostulacion || post.fecha || post.createdAt;
                                const fechaMostrar = fechaIns
                                    ? new Date(fechaIns).toLocaleDateString("es-CL")
                                    : "—";
                                const estado = post.estado || post.fase || "Inscrito";
                                const evaluador = post.evaluadorAsignado || post.evaluador || "Sin asignar";
                                const cvArchivo = post.cv_pdf || post.cvArchivo || null;

                                const handleClickDetalle = () => {
                                    const cand = post.candidatoRef || {};
                                    onVerDetalle?.({
                                        ...cand,
                                        ...post,
                                        id: post.candidatoId || cand.id || post.id,
                                        candidatoId: post.candidatoId || cand.id || post.id,
                                        postulacionId: post.id,
                                        nombre,
                                        rut,
                                        comuna,
                                        cargo: puestoActual?.titulo || post.puestoTitulo || post.cargo || cand.cargo,
                                        familiaCargo:
                                            puestoActual?.familiaCargo ||
                                            post.puestoFamilia ||
                                            post.familiaCargo ||
                                            cand.familiaCargo,
                                        planta: puestoActual?.planta || post.puestoPlanta || post.planta || cand.planta,
                                        evaluador,
                                        cv_pdf: cvArchivo,
                                    });
                                };

                                return (
                                    <tr
                                        key={post.id}
                                        style={{ borderBottom: "1px solid #f0f0f0", fontWeight: "500" }}
                                    >
                                        <td style={{ padding: "12px 14px" }}>{nombre}</td>
                                        <td style={{ padding: "12px 14px", fontWeight: "bold", whiteSpace: "nowrap" }}>{rut}</td>
                                        <td style={{ padding: "12px 14px", fontWeight: "600", color: "#0d47a1" }}>
                                            {puestoActual?.titulo || post.puestoTitulo || post.cargo || "—"}
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>{comuna}</td>
                                        <td style={{ padding: "12px 14px" }}>{fechaMostrar}</td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <span
                                                style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    backgroundColor:
                                                        estado === "Inscrito" || estado === "Postulado" || estado === "pendiente" || estado === "Pendiente"
                                                            ? "#fff3cd"
                                                            : estado === "Entrevista agendada" || estado === "en entrevista" || estado === "En proceso"
                                                            ? "#cfe2ff"
                                                            : estado === "Contratado" || estado === "Finalizado" || estado === "aceptado"
                                                            ? "#d1e7dd"
                                                            : estado === "Rechazado" || estado === "rechazado"
                                                            ? "#f8d7da"
                                                            : "#e2e3e5",
                                                    color: "#333",
                                                }}
                                            >
                                                {estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 14px", fontSize: "13px" }}>{evaluador}</td>
                                        <td style={{ padding: "12px 14px" }}>
                                            {cvArchivo ? (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirCvDocumento(post)}
                                                    style={{
                                                        background: "none",
                                                        border: "1px solid #0d6efd",
                                                        borderRadius: "5px",
                                                        color: "#0d6efd",
                                                        padding: "4px 10px",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                        fontWeight: "600",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                    }}
                                                    title="Ver CV del postulante"
                                                >
                                                    <Icono nombre="fileText" size={13} />
                                                    CV
                                                </button>
                                            ) : (
                                                <span style={{ color: "#aaa", fontSize: "12px" }}>Sin CV</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                                            <button
                                                type="button"
                                                onClick={handleClickDetalle}
                                                style={{
                                                    background: "#0d6efd",
                                                    border: "none",
                                                    borderRadius: "5px",
                                                    color: "white",
                                                    padding: "5px 14px",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                    fontWeight: "600",
                                                }}
                                                title="Ver detalle de la postulación"
                                            >
                                                Detalle
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default PostulantesPorPuestoView;
