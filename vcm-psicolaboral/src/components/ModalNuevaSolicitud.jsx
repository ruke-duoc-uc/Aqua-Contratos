/** Modal y Formulario para Registro de Candidatos y Emisión de Solicitudes (RF02, RF04, RF05)
 * @Autor Amaro Villalobos
 * Permite ingresar los datos del postulante y los parámetros de la evaluación psicolaboral.
 **/
import { useState } from "react";
import BotonOrange from "./BotonOrange";

const PLANTAS = [
    "Puerto Montt",
    "Osorno",
    "Castro",
    "Calbuco",
    "Frutillar",
    "Puerto Varas",
    "Ancud"
];

const FAMILIAS_CARGO = [
    "Operaciones Productivas",
    "Mantenimiento Industrial",
    "Administración y Finanzas",
    "Logística y Abastecimiento",
    "Calidad y Prevención de Riesgos"
];

const EVALUADORES = [
    "Amaro Villalobos Caseres",
    "Carolina Díaz Núñez",
    "Felipe Muñoz Parra",
    "Joaquín Oyarzún Leal"
];

const generarId = () => Date.now();
const obtenerFechaActual = () => new Date();

function ModalNuevaSolicitud({ isOpen, onCerrar, onGuardar }) {
    const [nombre, setNombre] = useState("");
    const [rut, setRut] = useState("");
    const [especialidad, setEspecialidad] = useState("");
    const [planta, setPlanta] = useState("Puerto Montt");
    const [antecedentes, setAntecedentes] = useState("");

    const [familiaCargo, setFamiliaCargo] = useState("Operaciones Productivas");
    const [cargo, setCargo] = useState("");
    const [evaluador, setEvaluador] = useState("Amaro Villalobos Caseres");
    const [observaciones, setObservaciones] = useState("");

    const [error, setError] = useState("");

    const limpiarFormulario = () => {
        setNombre("");
        setRut("");
        setEspecialidad("");
        setPlanta("Puerto Montt");
        setAntecedentes("");
        setFamiliaCargo("Operaciones Productivas");
        setCargo("");
        setEvaluador("Amaro Villalobos Caseres");
        setObservaciones("");
        setError("");
    };

    const handleCancelar = () => {
        limpiarFormulario();
        onCerrar();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validaciones mínimas obligatorias según RF02 y RF05
        if (!nombre.trim()) {
            setError("El nombre completo del candidato es obligatorio.");
            return;
        }
        if (!rut.trim()) {
            setError("El RUT del candidato es obligatorio.");
            return;
        }
        if (!especialidad.trim()) {
            setError("La especialidad o profesión es obligatoria.");
            return;
        }
        if (!cargo.trim()) {
            setError("El cargo al que postula es obligatorio.");
            return;
        }
        if (!evaluador) {
            setError("Debe asignar un evaluador psicolaboral responsable.");
            return;
        }

        setError("");

        const nuevaSolicitud = {
            id: generarId(),
            nombre: nombre.trim(),
            rut: rut.trim(),
            especialidad: especialidad.trim(),
            planta,
            antecedentes: antecedentes.trim(),
            familiaCargo,
            cargo: cargo.trim(),
            evaluador,
            observaciones: observaciones.trim(),
            fecha: obtenerFechaActual(),
            estado: "Pendiente"
        };

        onGuardar(nuevaSolicitud);
        limpiarFormulario();
        onCerrar();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleCancelar}>
            <div
                className="modal-contenido"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header">
                    <h3>+ Nueva Solicitud de Evaluación Psicolaboral</h3>
                    <button
                        type="button"
                        className="modal-cerrar-btn"
                        onClick={handleCancelar}
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="form-error-mensaje">
                                <strong>⚠️ Atención: </strong>{error}
                            </div>
                        )}

                        <h4 className="form-seccion-titulo">1. Datos del Candidato (RF02)</h4>
                        <div className="form-grid">
                            <div className="form-grupo">
                                <label htmlFor="nombre">Nombre Completo *</label>
                                <input
                                    id="nombre"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Juan Pérez González"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="rut">RUT *</label>
                                <input
                                    id="rut"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: 19.876.543-2"
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="especialidad">Especialidad / Profesión *</label>
                                <input
                                    id="especialidad"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Técnico en Acuicultura / Mecánica"
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="planta">Planta / Ubicación *</label>
                                <select
                                    id="planta"
                                    className="form-select"
                                    value={planta}
                                    onChange={(e) => setPlanta(e.target.value)}
                                >
                                    {PLANTAS.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grupo form-col-span-2">
                                <label htmlFor="antecedentes">Antecedentes / Experiencia Laboral</label>
                                <textarea
                                    id="antecedentes"
                                    rows="2"
                                    className="form-textarea"
                                    placeholder="Experiencia previa en el rubro, referencias o estado de salud laboral..."
                                    value={antecedentes}
                                    onChange={(e) => setAntecedentes(e.target.value)}
                                />
                            </div>
                        </div>

                        <h4 className="form-seccion-titulo">2. Parámetros de la Solicitud (RF04, RF05)</h4>
                        <div className="form-grid">
                            <div className="form-grupo">
                                <label htmlFor="familiaCargo">Familia de Cargo *</label>
                                <select
                                    id="familiaCargo"
                                    className="form-select"
                                    value={familiaCargo}
                                    onChange={(e) => setFamiliaCargo(e.target.value)}
                                >
                                    {FAMILIAS_CARGO.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="cargo">Cargo a Postular *</label>
                                <input
                                    id="cargo"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Operador de Enfriamiento / Analista"
                                    value={cargo}
                                    onChange={(e) => setCargo(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo form-col-span-2">
                                <label htmlFor="evaluador">Evaluador Psicolaboral Responsable *</label>
                                <select
                                    id="evaluador"
                                    className="form-select"
                                    value={evaluador}
                                    onChange={(e) => setEvaluador(e.target.value)}
                                >
                                    {EVALUADORES.map((ev) => (
                                        <option key={ev} value={ev}>
                                            {ev}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grupo form-col-span-2">
                                <label htmlFor="observaciones">Observaciones de la Solicitud</label>
                                <textarea
                                    id="observaciones"
                                    rows="2"
                                    className="form-textarea"
                                    placeholder="Comentarios adicionales o urgencia de contratación..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="boton-secundario"
                            onClick={handleCancelar}
                        >
                            Cancelar
                        </button>
                        <BotonOrange texto="Guardar Solicitud" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalNuevaSolicitud;
