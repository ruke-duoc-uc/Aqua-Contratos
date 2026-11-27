/**
 * ModalDetalleInforme
 * Adaptador de compatibilidad para el Modal Unificado ModalDetallePsicolaboral
 * Garantiza retrocompatibilidad total con la interfaz existente y añade
 * acceso simultáneo a la ficha y evaluación técnica del postulante.
 */
import ModalDetallePsicolaboral from "./ModalDetallePsicolaboral";

export default function ModalDetalleInforme(props) {
    return <ModalDetallePsicolaboral {...props} tabInicial="preguntas" />;
}
