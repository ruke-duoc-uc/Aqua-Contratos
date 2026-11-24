import BarraFiltros from "./BarraFiltros";
import CandidatosRecientes from "./CandidatosRecientes";
import EstadoVacio from "./EstadoVacio";
import { COLUMNAS } from "../utils/columnasTabla";

const TITULOS_COLUMNAS = ["Nombre", "Rut", "Especialidad", "Planta", "Fecha", "Evaluador", "Estado", "Acción"];

/* `filtros` agrupa todas las props que recibe BarraFiltros. */
function PanelSolicitudes({ encabezado, anchoCompleto = false, filtros, solicitudes, mensajeVacio, onDetalle }) {
    return (
        <div
            style={{
                border: "1px solid #dbe3eb",
                borderTop: "4px solid #223b4c",
                borderRadius: "10px",
                ...(anchoCompleto && { width: "100%" }),
                backgroundColor: "white",
                overflow: "hidden",
                boxShadow: "0 3px 10px rgba(34, 59, 76, 0.05)",
            }}
        >
            {encabezado}

            <BarraFiltros {...filtros} />

            <div className="table-responsive" style={{ width: "100%", overflowX: "auto" }}>
                <div style={{ minWidth: "850px" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: COLUMNAS,
                            alignItems: "center",
                            gap: "16px",
                            padding: "11px 16px",
                            backgroundColor: "#223b4c",
                            fontWeight: "bold",
                            color: "white",
                            fontSize: "13px",
                        }}
                    >
                        {TITULOS_COLUMNAS.map((titulo) => (
                            <span key={titulo}>{titulo}</span>
                        ))}
                    </div>

                    {solicitudes.length > 0 ? (
                        solicitudes.map((candidato) => (
                            <CandidatosRecientes
                                key={candidato.id}
                                nombre={candidato.nombre}
                                rut={candidato.rut}
                                especialidad={candidato.especialidad}
                                planta={candidato.planta}
                                fecha={
                                    candidato.fecha instanceof Date
                                        ? candidato.fecha.toLocaleDateString("es-CL")
                                        : candidato.fecha
                                }
                                evaluador={candidato.evaluador}
                                estado={candidato.estado}
                                onDetalle={() => onDetalle(candidato)}
                            />
                        ))
                    ) : (
                        <EstadoVacio mensaje={mensajeVacio} onRestablecer={filtros.onLimpiarFiltros} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default PanelSolicitudes;
