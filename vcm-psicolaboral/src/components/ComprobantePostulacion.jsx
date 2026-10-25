/** Comprobante de Postulación para Candidatos
 * @Autor Amaro Villalobos
 **/
import { NARANJA, NARANJA_CLARO, ESTILO_ETIQUETA, ESTILO_VALOR } from "./Estilos";
import { calcularEdad } from "../utils/calcularRut";

/* Convierte una fecha a texto. */
const formatearFecha = (valor) => {
    if (!valor) return "Sin fecha";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString("es-CL");
};

function ComprobantePostulacion({ postulacion }) {
    const edad = postulacion.fecha_nacimiento ? calcularEdad(postulacion.fecha_nacimiento) : null;
    const cv = postulacion.cv_pdf || postulacion.cvArchivo || "cv_postulacion.pdf";

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
                        {postulacion.nombre} {postulacion.apellido && !postulacion.nombre.includes(postulacion.apellido) ? postulacion.apellido : ""}
                    </h3>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                        {postulacion.cargo}
                        {postulacion.comuna || postulacion.planta ? ` · ${postulacion.comuna || postulacion.planta}` : ""}
                    </span>
                </div>
                <span className="badge-estado badge-proceso">{postulacion.estado || "Recibida"}</span>
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
                    <p style={{ ...ESTILO_VALOR, wordBreak: "break-word" }}>📄 {cv}</p>
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
                contactará para coordinar las evaluaciones correspondientes.
            </p>
        </article>
    );
}

export default ComprobantePostulacion;
