/** Modal y Formulario para Registro de Candidatos y Emisión de Solicitudes (RF02, RF04, RF05)
 * @Autor Amaro Villalobos
 * Permite ingresar los datos del postulante (RUT, nombres, apellidos, dirección, comuna,
 * fecha de nacimiento y CV) y los parámetros de la evaluación psicolaboral.
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

const FAMILIAS_CARGO = [
    "Operaciones Productivas",
    "Mantenimiento Industrial",
    "Administración y Finanzas",
    "Logística y Abastecimiento",
    "Calidad y Prevención de Riesgos",
    "Sistemas y TI"
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
    const [rut, setRut] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [direccion, setDireccion] = useState("");
    const [comuna, setComuna] = useState("Puerto Montt");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [cvPdf, setCvPdf] = useState("");
    const [especialidad, setEspecialidad] = useState("");
    const [antecedentes, setAntecedentes] = useState("");

    const [familiaCargo, setFamiliaCargo] = useState("Operaciones Productivas");
    const [cargo, setCargo] = useState("");
    const [evaluador, setEvaluador] = useState("Amaro Villalobos Caseres");
    const [observaciones, setObservaciones] = useState("");

    const [error, setError] = useState("");

    const limpiarFormulario = () => {
        setRut("");
        setNombres("");
        setApellidos("");
        setDireccion("");
        setComuna("Puerto Montt");
        setFechaNacimiento("");
        setCvPdf("");
        setEspecialidad("");
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
        if (!rut.trim()) {
            setError("El RUT del postulante es obligatorio.");
            return;
        }
        if (!nombres.trim()) {
            setError("Los nombres del postulante son obligatorios.");
            return;
        }
        if (!apellidos.trim()) {
            setError("Los apellidos del postulante son obligatorios.");
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

        const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`;
        const cvGenerado = cvPdf.trim() || `cv_${nombres.trim().toLowerCase().replace(/\s+/g, "_")}.pdf`;

        const nuevaSolicitud = {
            id: generarId(),
            rut: rut.trim(),
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            nombre: nombreCompleto,
            direccion: direccion.trim(),
            comuna: comuna.trim(),
            planta: comuna.trim(), // Sincronizado para retrocompatibilidad
            fecha_nacimiento: fechaNacimiento,
            cv_pdf: cvGenerado,
            cvArchivo: cvGenerado,
            especialidad: especialidad.trim() || cargo.trim(),
            antecedentes: antecedentes.trim(),
            familiaCargo,
            cargo: cargo.trim(),
            evaluador,
            observaciones: observaciones.trim(),
            fecha: obtenerFechaActual(),
            estado: "Pendiente",
            resultadoPsicologico: "Pendiente"
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
                style={{ maxWidth: "720px" }}
            >
                <div className="modal-header">
                    <h3>+ Nueva Solicitud y Registro de Postulante</h3>
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

                        <h4 className="form-seccion-titulo">1. Atributos del Postulante (RF02)</h4>
                        <div className="form-grid">
                            <div className="form-grupo">
                                <label htmlFor="nuevo-rut">RUT *</label>
                                <input
                                    id="nuevo-rut"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: 19.876.543-2"
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="nuevo-fecha-nac">Fecha de Nacimiento</label>
                                <input
                                    id="nuevo-fecha-nac"
                                    type="date"
                                    className="form-input"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="nuevo-nombres">Nombres *</label>
                                <input
                                    id="nuevo-nombres"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Juan Andrés"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="nuevo-apellidos">Apellidos *</label>
                                <input
                                    id="nuevo-apellidos"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Pérez González"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="nuevo-direccion">Dirección</label>
                                <input
                                    id="nuevo-direccion"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Av. Angelmó 1420"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="nuevo-comuna">Comuna *</label>
                                <select
                                    id="nuevo-comuna"
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
                                <label htmlFor="nuevo-cv">Nombre archivo CV (PDF)</label>
                                <input
                                    id="nuevo-cv"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: cv_juan_perez.pdf"
                                    value={cvPdf}
                                    onChange={(e) => setCvPdf(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="nuevo-especialidad">Especialidad / Profesión</label>
                                <input
                                    id="nuevo-especialidad"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Técnico en Acuicultura / Mecánica"
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                />
                            </div>

                            <div className="form-grupo form-col-span-2">
                                <label htmlFor="nuevo-antecedentes">Antecedentes / Experiencia Laboral</label>
                                <textarea
                                    id="nuevo-antecedentes"
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
                                    required
                                />
                            </div>

                            <div className="form-grupo">
                                <label htmlFor="evaluador">Evaluador Asignado *</label>
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
                                <label htmlFor="observaciones">Observaciones Iniciales de Reclutamiento</label>
                                <textarea
                                    id="observaciones"
                                    rows="2"
                                    className="form-textarea"
                                    placeholder="Comentarios para el evaluador psicolaboral..."
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
                        <BotonOrange texto="Emitir Solicitud" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalNuevaSolicitud;
