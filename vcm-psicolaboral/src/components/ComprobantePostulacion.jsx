/** Comprobante de Postulación para Candidatos
 * @Autor Amaro Villalobos
 * Muestra el estado actualizado en tiempo real, fase de selección y fecha de entrevista.
 **/
import { NARANJA, NARANJA_CLARO, ESTILO_ETIQUETA, ESTILO_VALOR } from "./Estilos";
import { calcularEdad } from "../utils/calcularRut";
import { abrirCvDocumento } from "../utils/visorCv";

/* Convierte una fecha a texto. */
const formatearFecha = (valor) => {
    if (!valor) return "Sin fecha";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString("es-CL");
};

const COLORES_FASE = {
    "en entrevista": { fondo: "#e3f2fd", texto: "#0d47a1", borde: "#90caf9", icono: "🗓️" },
    "aceptado": { fondo: "#e8f5e9", texto: "#1b5e20", borde: "#a5d6a7", icono: "✓" },
    "rechazado": { fondo: "#ffebee", texto: "#b71c1c", borde: "#ef9a9a", icono: "✕" },
    "esperando respuesta": { fondo: "#fff8e1", texto: "#f57f17", borde: "#ffe082", icono: "⏳" },
};

function ComprobantePostulacion({ postulacion }) {
    const edad = postulacion.fecha_nacimiento ? calcularEdad(postulacion.fecha_nacimiento) : null;
    const cv = postulacion.cv_pdf || postulacion.cvArchivo || "cv_postulacion.pdf";
    const fase = (postulacion.fase || "esperando respuesta").toLowerCase();
    const estiloFase = COLORES_FASE[fase] || COLORES_FASE["esperando respuesta"];

    return (
        <article
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "2px solid #e0e0e0",
                borderTop: `5px solid ${estiloFase.borde}`,
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#111" }}>
                        {postulacion.nombre} {postulacion.apellido && !postulacion.nombre.includes(postulacion.apellido) ? postulacion.apellido : ""}
                    </h3>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                        {postulacion.cargo}
                        {postulacion.comuna || postulacion.planta ? ` · ${postulacion.comuna || postulacion.planta}` : ""}
                    </span>
                </div>
                
                {/* Badge de Fase de Selección */}
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "5px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: estiloFase.fondo,
                        color: estiloFase.texto,
                        border: `1px solid ${estiloFase.borde}`,
                        textTransform: "capitalize",
                    }}
                >
                    <span>{estiloFase.icono}</span>
                    <span>{fase}</span>
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                {postulacion.rut && (
                    <div>
                        <span style={ESTILO_ETIQUETA}>RUT</span>
                        <p style={ESTILO_VALOR}>{postulacion.rut}</p>
                    </div>
                )}
                <div>
                    <span style={ESTILO_ETIQUETA}>Enviada</span>
                    <p style={ESTILO_VALOR}>{formatearFecha(postulacion.fechaPostulacion)}</p>
                </div>
                {postulacion.entrevista && postulacion.entrevista !== "Por agendar" && (
                    <div>
                        <span style={{ ...ESTILO_ETIQUETA, color: "#0d47a1" }}>Entrevista</span>
                        <p style={{ ...ESTILO_VALOR, color: "#0d47a1", fontWeight: "bold" }}>
                            📅 {postulacion.entrevista}
                        </p>
                    </div>
                )}
                {postulacion.fecha_nacimiento && (
                    <div>
                        <span style={ESTILO_ETIQUETA}>Nacimiento</span>
                        <p style={ESTILO_VALOR}>
                            {postulacion.fecha_nacimiento}
                            {edad !== null && ` (${edad} años)`}
                        </p>
                    </div>
                )}
                <div>
                    <span style={ESTILO_ETIQUETA}>CV Adjunto</span>
                    <p style={{ ...ESTILO_VALOR, wordBreak: "break-word", margin: "2px 0 6px 0" }}>📄 {cv}</p>
                    <button
                        type="button"
                        onClick={() => abrirCvDocumento(postulacion)}
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: "11px", padding: "2px 8px" }}
                        title="Ver documento en nueva pestaña"
                    >
                        ↗ Ver CV en nueva pestaña
                    </button>
                </div>
            </div>

            {/* Mensaje de estado dinámico */}
            {fase === "en entrevista" ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#084298",
                        backgroundColor: "#cff4fc",
                        borderLeft: "4px solid #0dcaf0",
                        padding: "8px 12px",
                        borderRadius: "4px",
                    }}
                >
                    🗓️ <strong>¡Entrevista Agendada!</strong> Revisa la fecha indicada arriba. El evaluador asignado se contactará contigo.
                </p>
            ) : fase === "aceptado" ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#0f5132",
                        backgroundColor: "#d1e7dd",
                        borderLeft: "4px solid #198754",
                        padding: "8px 12px",
                        borderRadius: "4px",
                    }}
                >
                    🎉 <strong>¡Postulación Aprobada!</strong> Has sido seleccionado(a) en el proceso psicolaboral de AquaChile.
                </p>
            ) : fase === "rechazado" ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#842029",
                        backgroundColor: "#f8d7da",
                        borderLeft: "4px solid #dc3545",
                        padding: "8px 12px",
                        borderRadius: "4px",
                    }}
                >
                    ✕ Proceso de postulación cerrado. Agradecemos tu participación e interés en AquaChile.
                </p>
            ) : (
                <p
                    style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#7a3e00",
                        backgroundColor: NARANJA_CLARO,
                        borderLeft: `4px solid ${NARANJA}`,
                        padding: "8px 12px",
                        borderRadius: "4px",
                    }}
                >
                    Tu postulación está registrada. El equipo de Reclutamiento revisará tus antecedentes y asignará fecha de evaluación.
                </p>
            )}
        </article>
    );
}

export default ComprobantePostulacion;
