/** Fila de la tabla de candidatos recientes con Bootstrap 5
 * @Autor Luxorar
 **/
import BotonOrange from "./BotonOrange";
import { COLUMNAS } from "../utils/columnasTabla";

function CandidatosRecientes({ nombre, rut, especialidad, planta, fecha, evaluador, estado, onDetalle }) {
    const obtenerClaseEstado = (est) => {
        switch (est?.toLowerCase()) {
            case "pendiente":
                return "badge bg-warning text-dark px-2 py-1";
            case "en proceso":
                return "badge bg-primary px-2 py-1";
            case "finalizado":
            case "finalizada":
                return "badge bg-success px-2 py-1";
            case "en revisión":
            case "en revision":
                return "badge bg-secondary px-2 py-1";
            default:
                return "badge bg-light text-dark border px-2 py-1";
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
