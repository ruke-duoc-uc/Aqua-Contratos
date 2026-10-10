/** Modal para Modificar Información de un Candidato Existente (RF03)
 * @Autor Amaro Villalobos
 * Permite al Analista de Reclutamiento actualizar antecedentes personales,
 * especialidad, planta y salud laboral de un postulante.
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

function ModalEditarCandidato({ candidato, isOpen, onCerrar, onGuardar }) {
    const [nombre, setNombre] = useState(candidato?.nombre || "");
    const [rut, setRut] = useState(candidato?.rut || "");
    const [especialidad, setEspecialidad] = useState(candidato?.especialidad || "");
    const [planta, setPlanta] = useState(candidato?.planta || "Puerto Montt");
    const [antecedentes, setAntecedentes] = useState(candidato?.antecedentes || "");
    const [error, setError] = useState("");

    if (!isOpen || !candidato) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nombre.trim()) {
            setError("El nombre completo es obligatorio.");
            return;
        }
        if (!rut.trim()) {
            setError("El RUT es obligatorio.");
            return;
        }
        if (!especialidad.trim()) {
            setError("La especialidad o profesión es obligatoria.");
            return;
        }

        setError("");

        onGuardar({
            ...candidato,
            nombre: nombre.trim(),
            rut: rut.trim(),
            especialidad: especialidad.trim(),
            planta,
            antecedentes: antecedentes.trim(),
        });

        onCerrar();
    };

    return (
        <div className="modal-overlay" onClick={onCerrar}>
            <div
                className="modal-contenido"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header">
                    <h3>✏️ Modificar Información del Candidato (RF03)</h3>
                    <button
                        type="button"
                        className="modal-cerrar-btn"
                        onClick={onCerrar}
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

                        <div className="form-grid">
                            <div className="form-grupo">
                                <label htmlFor="editar-nombre">Nombre Completo *</label>
                                <input
                                    id="editar-nombre"
                                    type="text"
                                    className="form-input"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-rut">RUT *</label>
                                <input
                                    id="editar-rut"
                                    type="text"
                                    className="form-input"
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-especialidad">Especialidad / Profesión *</label>
                                <input
                                    id="editar-especialidad"
                                    type="text"
                                    className="form-input"
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-planta">Planta / Ubicación *</label>
                                <select
                                    id="editar-planta"
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
                                <label htmlFor="editar-antecedentes">
                                    Antecedentes, Experiencia Laboral y Salud
                                </label>
                                <textarea
                                    id="editar-antecedentes"
                                    rows="3"
                                    className="form-textarea"
                                    placeholder="Detalle experiencia previa, condiciones de salud laboral o certificaciones..."
                                    value={antecedentes}
                                    onChange={(e) => setAntecedentes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="boton-secundario"
                            onClick={onCerrar}
                        >
                            Cancelar
                        </button>
                        <BotonOrange texto="Guardar Cambios" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalEditarCandidato;
