/** Fila de la tabla de candidatos recientes
 * @Autor Luxorar
 **/
import BotonOrange from "./BotonOrange";
import { COLUMNAS } from "./columnasTabla";
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

function CandidatosRecientes({ nombre, rut, especialidad, planta, fecha, evaluador, estado }) {
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
            }}
        >
            <span>{nombre}</span>
            <span>{rut}</span>
            <span>{especialidad}</span>
            <span>{planta}</span>
            <span>{fecha}</span>
            <span>{evaluador}</span>
            <span>{estado}</span>
            <BotonOrange texto="Detalle"/>
        </div>
            );
}

export default CandidatosRecientes;