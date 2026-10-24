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
                border: "2px solid gray",
                borderRadius: "10px",
                ...(anchoCompleto && { width: "100%" }),
                backgroundColor: "white",
                overflow: "hidden",
            }}
        >
            {encabezado}

            <BarraFiltros {...filtros} />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: COLUMNAS,
                    alignItems: "center",
                    gap: "16px",
                    padding: "10px 16px",
                    backgroundColor: "#CDCDCD",
                    fontWeight: "bold",
                    color: "gray",
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
    );
}

export default PanelSolicitudes;