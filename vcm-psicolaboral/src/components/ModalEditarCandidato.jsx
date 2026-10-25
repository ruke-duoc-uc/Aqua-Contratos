/** Modal para Modificar Información de un Candidato Existente (RF03)
 * @Autor Amaro Villalobos
 * Permite al Analista de Reclutamiento actualizar antecedentes personales,
 * RUT, nombres, apellidos, dirección, comuna, fecha de nacimiento y CV de un postulante.
 **/
import { useState } from "react";
import BotonOrange from "./BotonOrange";

const COMUNAS = [
    "Ancud", 
    "Calbuco", 
    "Castro", 
    "Chaitén", 
    "Chonchi", 
    "Cochamó",
    "Curaco de Vélez", 
    "Dalcahue", 
    "Fresia", 
    "Frutillar", 
    "Futaleufú", 
    "Hualaihué", 
    "Llanquihue", 
    "Los Muermos", 
    "Maullín", 
    "Osorno", 
    "Palena", 
    "Puerto Montt", 
    "Puerto Octay", 
    "Puerto Varas", 
    "Puqueldón", 
    "Purranque", 
    "Puyehue", 
    "Queilén", 
    "Quellón", 
    "Quemchi", 
    "Quinchao", 
    "Río Negro", 
    "San Juan de la Costa", 
    "San Pablo"
];

function ModalEditarCandidato({ candidato, isOpen, onCerrar, onGuardar }) {
    const nombresIniciales = candidato?.nombres || (candidato?.nombre ? candidato.nombre.split(" ").slice(0, -2).join(" ") || candidato.nombre.split(" ")[0] : "");
    const apellidosIniciales = candidato?.apellidos || (candidato?.nombre ? candidato.nombre.split(" ").slice(-2).join(" ") : "");

    const [rut, setRut] = useState(candidato?.rut || "");
    const [nombres, setNombres] = useState(nombresIniciales);
    const [apellidos, setApellidos] = useState(apellidosIniciales);
    const [direccion, setDireccion] = useState(candidato?.direccion || "");
    const [comuna, setComuna] = useState(candidato?.comuna || candidato?.planta || "Puerto Montt");
    const [fechaNacimiento, setFechaNacimiento] = useState(candidato?.fecha_nacimiento || "");
    const [cvPdf, setCvPdf] = useState(candidato?.cv_pdf || candidato?.cvArchivo || "");
    const [especialidad, setEspecialidad] = useState(candidato?.especialidad || "");
    const [antecedentes, setAntecedentes] = useState(candidato?.antecedentes || "");
    const [error, setError] = useState("");

    if (!isOpen || !candidato) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!rut.trim()) {
            setError("El RUT es obligatorio.");
            return;
        }
        if (!nombres.trim()) {
            setError("Los nombres son obligatorios.");
            return;
        }
        if (!apellidos.trim()) {
            setError("Los apellidos son obligatorios.");
            return;
        }

        setError("");

        const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`;

        onGuardar({
            ...candidato,
            rut: rut.trim(),
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            nombre: nombreCompleto,
            direccion: direccion.trim(),
            comuna: comuna.trim(),
            planta: comuna.trim(), // Sincronizado para retrocompatibilidad
            fecha_nacimiento: fechaNacimiento,
            cv_pdf: cvPdf.trim() || `cv_${nombres.trim().toLowerCase().replace(/\s+/g, "_")}.pdf`,
            especialidad: especialidad.trim() || candidato.especialidad || "Postulante General",
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
                style={{ maxWidth: "680px" }}
            >
                <div className="modal-header">
                    <h3>✏️ Modificar Información del Postulante (RF03)</h3>
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
                                <label htmlFor="editar-rut">RUT *</label>
                                <input
                                    id="editar-rut"
                                    type="text"
                                    className="form-input"
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                    placeholder="12.345.678-9"
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-fecha-nac">Fecha de Nacimiento</label>
                                <input
                                    id="editar-fecha-nac"
                                    type="date"
                                    className="form-input"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-nombres">Nombres *</label>
                                <input
                                    id="editar-nombres"
                                    type="text"
                                    className="form-input"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                    placeholder="Ej. Luis Andrés"
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-apellidos">Apellidos *</label>
                                <input
                                    id="editar-apellidos"
                                    type="text"
                                    className="form-input"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    placeholder="Ej. Mancilla Peralta"
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-direccion">Dirección</label>
                                <input
                                    id="editar-direccion"
                                    type="text"
                                    className="form-input"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Ej. Av. Angelmó 1420"
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-comuna">Comuna</label>
                                <select
                                    id="editar-comuna"
                                    className="form-select"
                                    value={comuna}
                                    onChange={(e) => setComuna(e.target.value)}
                                >
                                    {COMUNAS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-cv">Nombre archivo CV (PDF)</label>
                                <input
                                    id="editar-cv"
                                    type="text"
                                    className="form-input"
                                    value={cvPdf}
                                    onChange={(e) => setCvPdf(e.target.value)}
                                    placeholder="cv_postulante.pdf"
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="editar-especialidad">Especialidad / Cargo</label>
                                <input
                                    id="editar-especialidad"
                                    type="text"
                                    className="form-input"
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                    placeholder="Ej. Operador Planta"
                                />
                            </div>

                            <div className="form-grupo form-col-span-2">
                                <label htmlFor="editar-antecedentes">
                                    Antecedentes, Experiencia Laboral y Observaciones
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
