import { useState } from "react";
import BotonOrange from "./BotonOrange";
import { NARANJA, NARANJA_OSCURO, NARANJA_CLARO } from "./Estilos";
import BarraValorFormularioPostulante from "./BarraValorFormularioPostulante";
import { calcularRut } from "../utils/calcularRut";


function FormularioPostulacion({ puesto, onCancelar, onEnviar }) {
    const [datos, setDatos] = useState({
        nombre: "",
        apellido: "",
        rut: "",
        dv: "",
        fecha: "",
        comuna: "",
    });
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
    const [cargoElegido, setCargoElegido] = useState({ clave: "libre", valor: "" });
    const [archivoCv, setArchivoCv] = useState(null);
    const [cvDataUrl, setCvDataUrl] = useState("");
    const [campoEnfocado, setCampoEnfocado] = useState("");
    const [error, setError] = useState("");
    const LIMITE_CV_BYTES = 10 * 1024 * 1024;

    const CAMPOS_PERSONALES = [
        { campo: "nombre", etiqueta: "Nombre", placeholder: "Ej. Ana" },
        { campo: "apellido", etiqueta: "Apellido", placeholder: "Ej. García" },
        { campo: "direccion", etiqueta: "Dirección", placeholder: "Ej. Av. Central 123", columnaCompleta: true },
        { campo: "email", etiqueta: "E-mail", placeholder: "Ej. ana.gar@gmail.com", columnaCompleta: true },
    ];

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
            setCvDataUrl("");
            setError("El CV no puede superar los 10 MB.");
            return;
        }
        setArchivoCv(archivo);
        if (archivo) {
            const reader = new FileReader();
            reader.onload = (e) => setCvDataUrl(e.target?.result || "");
            reader.readAsDataURL(archivo);
        } else {
            setCvDataUrl("");
        }
    };

    const manejarEnvio = (evento) => {
        evento.preventDefault();

        if (!datos.nombre.trim() || !datos.apellido.trim() || !cargo.trim()) {
            setError("El nombre, el apellido y el cargo al que postulas son obligatorios.");
            return;
        }
        if (!calcularRut(datos.rut, datos.dv)) {
            setError("El RUT ingresado no es válido. Revisa el número y el dígito verificador.");
            return;
        }
        if (!archivoCv) {
            setError("Adjunta tu currículum (PDF o Word) para enviar la postulación.");
            return;
        }

        onEnviar({
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            rut: `${datos.rut}-${datos.dv}`,
            fecha: datos.fecha,
            comuna: datos.comuna,
            direccion: datos.direccion?.trim() || "",
            email: datos.email?.trim() || "",
            cargo: cargo.trim(),
            archivoCv,
            cvDataUrl,
        });
    };

    const rutCompleto = Boolean(datos.rut && datos.dv);
    const rutValido = rutCompleto ? calcularRut(datos.rut, datos.dv) : null;

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
                    <label htmlFor="postulacion-rut">Rut *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            id="postulacion-rut"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="12345678"
                            maxLength={8}
                            className="form-input"
                            style={{ flex: 1, minWidth: 0, width: "auto" }}
                            value={datos.rut}
                            onChange={(e) => {
                                setDatos((prev) => ({ ...prev, rut: e.target.value.replace(/\D/g, "").slice(0, 8) }));
                                setError("");
                            }}
                            required
                        />
                        <span>-</span>
                        <input
                            id="postulacion-dv"
                            type="text"
                            autoComplete="off"
                            placeholder="K"
                            maxLength={1}
                            className="form-input"
                            style={{ flex: "0 0 50px", width: "50px", minWidth: 0, textAlign: "center" }}
                            value={datos.dv}
                            onChange={(e) => {
                                setDatos((prev) => ({
                                    ...prev,
                                    dv: e.target.value.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 1),
                                }));
                                setError("");
                            }}
                            required
                        />
                    </div>
                    {rutCompleto && (
                        <div style={{ marginTop: "4px" }}>
                            {rutValido ? (
                                <span style={{ color: "#198754", fontSize: "12px", fontWeight: "bold" }}>
                                    ✓ RUT válido
                                </span>
                            ) : (
                                <span style={{ color: "#dc3545", fontSize: "12px", fontWeight: "bold" }}>
                                    ✕ Dígito verificador incorrecto
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {CAMPOS_PERSONALES.map(({ campo, etiqueta, placeholder, columnaCompleta }) => (
                    <BarraValorFormularioPostulante
                        key={campo}
                        id={`postulacion-${campo}`}
                        etiqueta={etiqueta}
                        placeholder={placeholder}
                        value={datos[campo]}
                        onChange={actualizarCampo(campo)}
                        propsFoco={propsFoco(campo)}
                        columnaCompleta={columnaCompleta}
                    />
                ))}
                <div className="form-grupo">
                    <label htmlFor="postulacion-comuna">Comuna *</label>
                    <select
                        id="postulacion-comuna"
                        className="form-input"
                        value={datos.comuna}
                        onChange={actualizarCampo("comuna")}
                        {...propsFoco("comuna")}
                        required
                    >
                        <option value="">Selecciona tu comuna</option>
                        {COMUNAS.map((comuna) => (
                            <option key={comuna} value={comuna}>
                                {comuna}
                            </option>
                        ))}
                    </select>
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
                    <div className="form-grupo">
                        <label htmlFor="postulacion-fecha">Fecha de Nacimiento *</label>
                        <input
                            id="postulacion-fecha"
                            type="date"
                            className="form-input"
                            value={datos.fecha}
                            onChange={actualizarCampo("fecha")}
                            {...propsFoco("fecha")}
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