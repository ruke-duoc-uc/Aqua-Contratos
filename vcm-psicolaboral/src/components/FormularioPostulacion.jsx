import { useState } from "react";
import BotonOrange from "./BotonOrange";
import { NARANJA, NARANJA_OSCURO, NARANJA_CLARO } from "./Estilos";

const LIMITE_CV_BYTES = 10 * 1024 * 1024;

function FormularioPostulacion({ puesto, onCancelar, onEnviar }) {
    const [datos, setDatos] = useState({ nombre: "", apellido: "" });
    const [cargoElegido, setCargoElegido] = useState({ clave: "libre", valor: "" });
    const [archivoCv, setArchivoCv] = useState(null);
    const [campoEnfocado, setCampoEnfocado] = useState("");
    const [error, setError] = useState("");

    /**
     * El cargo sigue a la oferta seleccionada mientras no se edite a mano:
     * al elegir otra vacante, el campo vuelve a mostrar el título del puesto.
     */
    const clavePuesto = puesto?.id ?? "libre";
    const cargo = cargoElegido.clave === clavePuesto ? cargoElegido.valor : puesto?.titulo || "";

    const actualizarCampo = (campo) => (evento) => {
        setDatos((prev) => ({ ...prev, [campo]: evento.target.value }));
        setError("");
    };

    const actualizarCargo = (evento) => {
        setCargoElegido({ clave: clavePuesto, valor: evento.target.value });
        setError("");
    };

    /** Enfoque en naranja: identidad visual del postulante sobre los campos. */
    const estiloCampo = (campo) => ({
        borderColor: campoEnfocado === campo ? NARANJA : "#cccccc",
        boxShadow: campoEnfocado === campo ? "0 0 0 3px rgba(245, 124, 0, 0.15)" : "none",
    });

    const propsFoco = (campo) => ({
        onFocus: () => setCampoEnfocado(campo),
        onBlur: () => setCampoEnfocado(""),
        style: estiloCampo(campo),
    });

    const manejarArchivo = (evento) => {
        const archivo = evento.target.files?.[0] || null;
        setError("");
        if (archivo && archivo.size > LIMITE_CV_BYTES) {
            setArchivoCv(null);
            setError("El CV no puede superar los 10 MB.");
            return;
        }
        setArchivoCv(archivo);
    };

    const manejarEnvio = (evento) => {
        evento.preventDefault();

        if (!datos.nombre.trim() || !datos.apellido.trim() || !cargo.trim()) {
            setError("El nombre, el apellido y el cargo al que postulas son obligatorios.");
            return;
        }
        if (!archivoCv) {
            setError("Adjunta tu currículum (PDF o Word) para enviar la postulación.");
            return;
        }

        onEnviar({
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            cargo: cargo.trim(),
            archivoCv,
        });
    };

    return (
        <section
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: `2px solid ${NARANJA}`,
                overflow: "hidden",
            }}
        >
            <header
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: NARANJA_OSCURO }}>
                        Formulario de Postulación
                    </h3>
                    <span style={{ fontSize: "13px", color: "#666" }}>
                        {puesto
                            ? `Postulando a ${puesto.titulo} · ${puesto.planta}`
                            : "Completa tus datos y adjunta tu currículum"}
                    </span>
                </div>
            </header>

            <form onSubmit={manejarEnvio} style={{ padding: "20px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                    }}
                >
                    <div className="form-grupo">
                        <label htmlFor="postulacion-nombre">Nombre *</label>
                        <input
                            id="postulacion-nombre"
                            type="text"
                            className="form-input"
                            value={datos.nombre}
                            onChange={actualizarCampo("nombre")}
                            {...propsFoco("nombre")}
                            placeholder="Ej. Ana"
                            required
                        />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="postulacion-apellido">Apellido *</label>
                        <input
                            id="postulacion-apellido"
                            type="text"
                            className="form-input"
                            value={datos.apellido}
                            onChange={actualizarCampo("apellido")}
                            {...propsFoco("apellido")}
                            placeholder="Ej. García"
                            required
                        />
                    </div>

                    <div className="form-grupo" style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor="postulacion-cargo">Cargo al que postulas *</label>
                        <input
                            id="postulacion-cargo"
                            type="text"
                            className="form-input"
                            value={cargo}
                            onChange={actualizarCargo}
                            {...propsFoco("cargo")}
                            placeholder="Ej. Prevencionista de Faena"
                            required
                        />
                    </div>

                    <div className="form-grupo" style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor="postulacion-cv">Adjuntar currículum (CV) *</label>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <label
                                htmlFor="postulacion-cv"
                                style={{
                                    display: "inline-block",
                                    padding: "9px 16px",
                                    border: `1px solid ${NARANJA}`,
                                    borderRadius: "6px",
                                    backgroundColor: archivoCv ? NARANJA_CLARO : "white",
                                    color: NARANJA_OSCURO,
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                }}
                            >
                                {archivoCv ? "Cambiar archivo" : "Seleccionar CV"}
                            </label>
                            <input
                                id="postulacion-cv"
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf"
                                onChange={manejarArchivo}
                                style={{
                                    position: "absolute",
                                    width: "1px",
                                    height: "1px",
                                    padding: 0,
                                    margin: "-1px",
                                    overflow: "hidden",
                                    clip: "rect(0, 0, 0, 0)",
                                    whiteSpace: "nowrap",
                                    border: 0,
                                }}
                            />
                            <span
                                style={{
                                    fontSize: "13px",
                                    color: archivoCv ? "#333" : "#6c757d",
                                    wordBreak: "break-word",
                                }}
                            >
                                {archivoCv
                                    ? archivoCv.name
                                    : "Ningún archivo seleccionado (PDF o Word, máx. 10 MB)"}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="form-error-mensaje" role="alert" style={{ marginTop: "16px" }}>
                        {error}
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginTop: "20px",
                    }}
                >
                    <BotonOrange type="submit" texto="Enviar postulación" />
                    {puesto && (
                        <button type="button" className="boton-secundario" onClick={onCancelar}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

export default FormularioPostulacion;