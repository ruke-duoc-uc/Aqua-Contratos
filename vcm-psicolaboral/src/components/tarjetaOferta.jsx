/**
 * Tarjetas de ofertas para la pagina de candidatos
 *
 * @Autor Luxo
 **/
import { NARANJA, NARANJA_OSCURO, ESTILO_ETIQUETA, ESTILO_VALOR } from "./Estilos.jsx";
import BotonOrange from "./BotonOrange.jsx";
import Icono from "./Icono.jsx";

function TarjetaOferta({
    puesto,
    seleccionada,
    yaPostulado = false,
    perfilIncompleto = false,
    onPostular,
    onIrAPerfil,
}) {
    const historial = Array.isArray(puesto.historialModificaciones)
        ? puesto.historialModificaciones
        : [];
    const conteoMod =
        puesto.conteoModificaciones !== undefined
            ? Number(puesto.conteoModificaciones)
            : historial.length;

    return (
        <article
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: `2px solid ${yaPostulado ? "#22c55e" : seleccionada ? NARANJA : "#dee2e6"}`,
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{puesto.titulo}</h3>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                        {puesto.planta} · {puesto.familiaCargo}
                    </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span className="badge-estado badge-finalizado">{puesto.estado || "Abierto"}</span>
                    {conteoMod > 0 && (
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 7px",
                                fontSize: "10.5px",
                                fontWeight: "700",
                                borderRadius: "10px",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                            }}
                        >
                            <Icono nombre="history" size={11} />
                            Modificado {conteoMod} {conteoMod === 1 ? "vez" : "veces"}
                        </span>
                    )}
                </div>
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
                <div>
                    <span style={ESTILO_ETIQUETA}>Fecha Creación</span>
                    <p style={ESTILO_VALOR}>
                        {puesto.fechaCreacion
                            ? new Date(puesto.fechaCreacion).toLocaleDateString("es-CL")
                            : "Reciente"}
                    </p>
                </div>
            </div>

            {/* Historial transparente de modificaciones de la oferta */}
            {historial.length > 0 && (
                <details
                    style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "6px 10px",
                    }}
                >
                    <summary
                        style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#1e40af",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <Icono nombre="history" size={13} />
                        Historial de modificaciones ({conteoMod})
                    </summary>
                    <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        {historial.map((h, hIdx) => (
                            <div
                                key={hIdx}
                                style={{
                                    fontSize: "11px",
                                    backgroundColor: "white",
                                    padding: "5px 8px",
                                    borderRadius: "4px",
                                    borderLeft: "2px solid #3b82f6",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                                    <strong>{h.autor || "Jefatura"}</strong>
                                    <span>{h.fecha ? new Date(h.fecha).toLocaleDateString("es-CL") : ""}</span>
                                </div>
                                <div style={{ color: "#1e293b" }}>{h.detalle}</div>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            <div style={{ marginTop: "auto", paddingTop: "6px" }}>
                {yaPostulado ? (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "9px 16px",
                            borderRadius: "6px",
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            border: "1px solid #86efac",
                            fontSize: "13px",
                            fontWeight: "700",
                            width: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <Icono nombre="check" size={15} />
                        Ya postulaste a este cargo
                    </span>
                ) : perfilIncompleto ? (
                    <button
                        type="button"
                        onClick={() => (onIrAPerfil ? onIrAPerfil() : onPostular(puesto))}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "9px 16px",
                            borderRadius: "6px",
                            backgroundColor: "#fff7ed",
                            color: "#c2410c",
                            border: "1px solid #fdba74",
                            fontSize: "13px",
                            fontWeight: "700",
                            width: "100%",
                            boxSizing: "border-box",
                            cursor: "pointer",
                        }}
                        title="Los postulantes necesitan terminar su perfil para postular"
                    >
                        <Icono nombre="alert" size={15} />
                        Completa tu perfil para postular
                    </button>
                ) : (
                    <BotonOrange
                        texto={seleccionada ? "Postulando..." : "Postular con mi perfil"}
                        onClick={() => onPostular(puesto)}
                    />
                )}
            </div>
        </article>
    );
}

export default TarjetaOferta;
