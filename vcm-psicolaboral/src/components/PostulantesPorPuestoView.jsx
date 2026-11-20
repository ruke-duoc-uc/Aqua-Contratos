/** Vista especializada: Postulantes inscritos por Puesto de Trabajo
 * Permite seleccionar un puesto y ver la tabla de postulantes que se inscribieron a él.
 * Incluye acceso rápido al CV y al detalle de la postulación.
 */
import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { calcularEdad } from "../utils/calcularRut";
import { abrirCvDocumento } from "../utils/visorCv";

function PostulantesPorPuestoView({ postulaciones = [], onVerDetalle }) {
    const [puestos, setPuestos] = useState([]);
    const [puestoSeleccionado, setPuestoSeleccionado] = useState("");
    const [cargando, setCargando] = useState(true);

    // Cargar puestos al montar
    useEffect(() => {
        let activo = true;
        async function cargar() {
            setCargando(true);
            try {
                const datos = await api.getPuestos();
                if (activo && Array.isArray(datos)) setPuestos(datos);
            } catch {
                if (activo) setPuestos([]);
            } finally {
                if (activo) setCargando(false);
            }
        }
        cargar();
        return () => { activo = false; };
    }, []);

    // Filtrar postulaciones por puesto seleccionado
    const postulacionesFiltradas = useMemo(() => {
        if (!puestoSeleccionado) return [];
        return postulaciones.filter(
            (p) => String(p.puestoTrabajoId) === String(puestoSeleccionado)
        );
    }, [postulaciones, puestoSeleccionado]);

    const puestoActual = puestos.find((p) => String(p.id) === String(puestoSeleccionado));

    return (
        <section
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "2px solid gray",
                overflow: "hidden",
            }}
        >
            {/* Cabecera */}
            <div
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #eee",
                }}
            >
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                    Postulantes por Puesto de Trabajo
                </h2>
                <span style={{ fontSize: "13px", color: "gray" }}>
                    Seleccione un puesto para ver los postulantes inscritos
                </span>
            </div>

            {/* Selector de puesto */}
            <div style={{ padding: "12px 20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <label htmlFor="selector-puesto" style={{ fontWeight: "600", fontSize: "14px" }}>
                    Puesto:
                </label>
                <select
                    id="selector-puesto"
                    className="filtro-select"
                    value={puestoSeleccionado}
                    onChange={(e) => setPuestoSeleccionado(e.target.value)}
                    style={{ minWidth: "300px" }}
                    disabled={cargando}
                >
                    <option value="">
                        {cargando ? "Cargando puestos..." : "— Seleccione un puesto —"}
                    </option>
                    {puestos.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.titulo || p.nombre || `Puesto #${p.id}`}
                            {p.planta ? ` · ${p.planta}` : ""}
                            {p.estado ? ` (${p.estado})` : ""}
                        </option>
                    ))}
                </select>

                {puestoSeleccionado && (
                    <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "auto" }}>
                        <strong>{postulacionesFiltradas.length}</strong> postulante{postulacionesFiltradas.length !== 1 ? "s" : ""} inscrito{postulacionesFiltradas.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Info del puesto seleccionado */}
            {puestoActual && (
                <div style={{ padding: "0 20px 12px", fontSize: "13px", color: "#555" }}>
                    <strong>{puestoActual.titulo || puestoActual.nombre}</strong>
                    {puestoActual.planta ? ` — Planta: ${puestoActual.planta}` : ""}
                    {puestoActual.familiaCargo ? ` — Familia: ${puestoActual.familiaCargo}` : ""}
                    {puestoActual.estado ? ` — Estado: ${puestoActual.estado}` : ""}
                </div>
            )}

            {/* Tabla de postulantes */}
            {!puestoSeleccionado ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#999" }}>
                    📋 Seleccione un puesto de trabajo para visualizar sus postulantes.
                </div>
            ) : postulacionesFiltradas.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#999" }}>
                    📭 No hay postulantes inscritos en este puesto.
                </div>
            ) : (
                <div className="table-responsive shadow-sm" style={{ borderRadius: "8px" }}>
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: "13.5px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#CDCDCD", color: "#333", textAlign: "left" }}>
                                <th style={{ padding: "12px 14px" }}>Nombre</th>
                                <th style={{ padding: "12px 14px" }}>RUT</th>
                                <th style={{ padding: "12px 14px" }}>Comuna</th>
                                <th style={{ padding: "12px 14px" }}>Fecha Inscripción</th>
                                <th style={{ padding: "12px 14px" }}>Estado</th>
                                <th style={{ padding: "12px 14px" }}>Evaluador</th>
                                <th style={{ padding: "12px 14px" }}>CV</th>
                                <th style={{ padding: "12px 14px", textAlign: "center" }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {postulacionesFiltradas.map((post) => {
                                const nombre = post.nombreCandidato || post.nombre || "—";
                                const rut = post.rutCandidato || post.rut || "—";
                                const comuna = post.comuna || post.planta || "—";
                                const fechaIns = post.fechaPostulacion || post.fecha || post.createdAt;
                                const fechaMostrar = fechaIns
                                    ? new Date(fechaIns).toLocaleDateString("es-CL")
                                    : "—";
                                const estado = post.estado || post.fase || "Inscrito";
                                const evaluador = post.evaluadorAsignado || "Sin asignar";
                                const cvArchivo = post.cv_pdf || post.cvArchivo || null;

                                return (
                                    <tr
                                        key={post.id}
                                        style={{ borderBottom: "1px solid #f0f0f0", fontWeight: "500" }}
                                    >
                                        <td style={{ padding: "12px 14px" }}>{nombre}</td>
                                        <td style={{ padding: "12px 14px", fontWeight: "bold", whiteSpace: "nowrap" }}>{rut}</td>
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
                                                        estado === "Inscrito" || estado === "pendiente"
                                                            ? "#fff3cd"
                                                            : estado === "Entrevista agendada" || estado === "en entrevista"
                                                            ? "#cfe2ff"
                                                            : estado === "Contratado"
                                                            ? "#d1e7dd"
                                                            : estado === "Rechazado"
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
                                                    onClick={() => abrirCvDocumento(cvArchivo)}
                                                    style={{
                                                        background: "none",
                                                        border: "1px solid #0d6efd",
                                                        borderRadius: "5px",
                                                        color: "#0d6efd",
                                                        padding: "4px 10px",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                        fontWeight: "600",
                                                    }}
                                                    title="Ver CV del postulante"
                                                >
                                                    📄 CV
                                                </button>
                                            ) : (
                                                <span style={{ color: "#aaa", fontSize: "12px" }}>Sin CV</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                                            <button
                                                type="button"
                                                onClick={() => onVerDetalle?.(post)}
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
