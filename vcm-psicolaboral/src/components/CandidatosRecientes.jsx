/** Fila de la tabla de candidatos recientes
 * @Autor Luxorar
 **/
import BotonOrange from "./BotonOrange";
import { COLUMNAS } from "./columnasTabla";

function CandidatosRecientes({ nombre, rut, especialidad, planta, fecha, evaluador, estado, onDetalle }) {
    const obtenerClaseEstado = (est) => {
        switch (est?.toLowerCase()) {
            case "pendiente":
                return "badge-estado badge-pendiente";
            case "en proceso":
                return "badge-estado badge-proceso";
            case "finalizado":
            case "finalizada":
                return "badge-estado badge-finalizado";
            case "en revisión":
            case "en revision":
                return "badge-estado badge-revision";
            default:
                return "badge-estado";
        }
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: COLUMNAS,
                alignItems: "center",
                gap: "16px",
                padding: "10px 16px",
                backgroundColor: "white",
                fontWeight: "bold",
                borderBottom: "1px solid #f0f0f0",
            }}
        >
            <span>{nombre}</span>
            <span>{rut}</span>
            <span>{especialidad}</span>
            <span>{planta}</span>
            <span>{fecha}</span>
            <span>{evaluador}</span>
            <div>
                <span className={obtenerClaseEstado(estado)}>{estado}</span>
            </div>
            <BotonOrange texto="Detalle" onClick={onDetalle} />
        </div>
    );
}

export default CandidatosRecientes;