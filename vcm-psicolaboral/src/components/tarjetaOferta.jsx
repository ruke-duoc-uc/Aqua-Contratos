/**
 * Tarjetas de ofertas para la pagina de candidatos
 *
 * @Autor Luxo
 **/
import { NARANJA, NARANJA_OSCURO, ESTILO_ETIQUETA, ESTILO_VALOR } from "./Estilos.jsx"
import BotonOrange from "./BotonOrange.jsx";
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

            {/* Apartado de Cualidades / Etiquetas */}
            {Array.isArray(puesto.etiquetas) && puesto.etiquetas.length > 0 && (
                <div
                    style={{
                        padding: "8px 12px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    <span style={{ ...ESTILO_ETIQUETA, fontSize: "11px", color: "#64748b" }}>
                        Cualidades solicitadas
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {puesto.etiquetas.map((tag, idx) => (
                            <span
                                key={idx}
                                style={{
                                    display: "inline-block",
                                    padding: "3px 10px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    backgroundColor: "#e2e8f0",
                                    borderRadius: "14px",
                                    border: "1px solid #cbd5e1",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

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

export default TarjetaOferta;