/**
 * ModalDetalleSolicitud
 * Adaptador de compatibilidad para el Modal Unificado ModalDetallePsicolaboral
 * Garantiza retrocompatibilidad total con la interfaz existente y añade
 * acceso simultáneo a los informes y preguntas de jefatura.
 */
import ModalDetallePsicolaboral from "./ModalDetallePsicolaboral";

export default function ModalDetalleSolicitud(props) {
    return <ModalDetallePsicolaboral {...props} tabInicial="evaluacion" />;
}
