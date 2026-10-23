import { NARANJA, NARANJA_CLARO, ESTILO_ETIQUETA, ESTILO_VALOR } from "./Estilos";

/* Convierte una fecha a texto. */
const formatearFecha = (valor) => {
    if (!valor) return "Sin fecha";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "Sin fecha";
    return fecha.toLocaleDateString("es-CL");
};

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

export default ComprobantePostulacion;