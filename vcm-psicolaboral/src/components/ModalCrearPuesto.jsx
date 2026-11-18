import { useState } from "react";
import BotonOrange from "./BotonOrange.jsx";
import { PLANTAS_DISPONIBLES, FAMILIAS_CARGO } from "../utils/constantes";

function ModalCrearPuesto({ isOpen, onCerrar, onCrear, etiquetasDisponibles = [], onCrearEtiqueta }) {
    const [form, setForm] = useState({
        titulo: "",
        planta: "",
        familiaCargo: "",
        descripcion: "",
        requisitos: "",
        vacantes: 1,
        etiquetas: [],
    });
    const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    if (!isOpen) return null;

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores((prev) => ({ ...prev, [campo]: null }));
        }
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!form.titulo.trim()) nuevosErrores.titulo = "El título del puesto es obligatorio.";
        if (!form.planta) nuevosErrores.planta = "Debe seleccionar una planta.";
        if (!form.familiaCargo) nuevosErrores.familiaCargo = "Debe seleccionar una familia de cargo.";
        if (!form.vacantes || Number(form.vacantes) < 1) nuevosErrores.vacantes = "Debe haber al menos 1 vacante.";
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleToggleEtiqueta = (tag) => {
        setForm((prev) => {
            const yaExiste = prev.etiquetas.includes(tag);
            return {
                ...prev,
                etiquetas: yaExiste
                    ? prev.etiquetas.filter((t) => t !== tag)
                    : [...prev.etiquetas, tag],
            };
        });
    };

    const handleAgregarNuevaEtiqueta = () => {
        const limpia = nuevaEtiqueta.trim();
        if (!limpia) return;
        if (!form.etiquetas.includes(limpia)) {
            setForm((prev) => ({
                ...prev,
                etiquetas: [...prev.etiquetas, limpia],
            }));
        }
        if (onCrearEtiqueta) {
            onCrearEtiqueta(limpia);
        }
        setNuevaEtiqueta("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setEnviando(true);
        try {
            await onCrear({
                titulo: form.titulo.trim(),
                planta: form.planta,
                familiaCargo: form.familiaCargo,
                descripcion: form.descripcion.trim(),
                requisitos: form.requisitos.trim(),
                etiquetas: form.etiquetas,
                vacantes: Number(form.vacantes),
            });
            setForm({
                titulo: "",
                planta: "",
                familiaCargo: "",
                descripcion: "",
                requisitos: "",
                vacantes: 1,
                etiquetas: [],
            });
            setNuevaEtiqueta("");
            setErrores({});
            onCerrar();
        } finally {
            setEnviando(false);
        }
    };

    const estiloLabel = {
        display: "block",
        fontSize: "13px",
        fontWeight: "700",
        color: "#495057",
        marginBottom: "4px",
    };

    const estiloInput = {
        width: "100%",
        padding: "8px 10px",
        fontSize: "14px",
        border: "1px solid #ced4da",
        borderRadius: "5px",
        boxSizing: "border-box",
    };

    const estiloError = {
        fontSize: "12px",
        color: "#dc3545",
        marginTop: "2px",
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onCerrar}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    width: "95%",
                    maxWidth: "560px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "18px 24px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Crear Puesto de Trabajo</h2>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                            Complete los datos de la nueva oferta laboral
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "22px",
                            cursor: "pointer",
                            color: "#888",
                            padding: "4px 8px",
                        }}
                        title="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Título */}
                    <div>
                        <label style={estiloLabel}>Título del Puesto *</label>
                        <input
                            type="text"
                            value={form.titulo}
                            onChange={(e) => handleChange("titulo", e.target.value)}
                            placeholder="Ej: Técnico de Mantenimiento"
                            style={{ ...estiloInput, borderColor: errores.titulo ? "#dc3545" : "#ced4da" }}
                        />
                        {errores.titulo && <span style={estiloError}>{errores.titulo}</span>}
                    </div>

                    {/* Planta + Familia de Cargo */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={estiloLabel}>Planta *</label>
                            <select
                                value={form.planta}
                                onChange={(e) => handleChange("planta", e.target.value)}
                                style={{ ...estiloInput, borderColor: errores.planta ? "#dc3545" : "#ced4da" }}
                            >
                                <option value="">Seleccionar...</option>
                                {PLANTAS_DISPONIBLES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            {errores.planta && <span style={estiloError}>{errores.planta}</span>}
                        </div>
                        <div>
                            <label style={estiloLabel}>Familia de Cargo *</label>
                            <select
                                value={form.familiaCargo}
                                onChange={(e) => handleChange("familiaCargo", e.target.value)}
                                style={{ ...estiloInput, borderColor: errores.familiaCargo ? "#dc3545" : "#ced4da" }}
                            >
                                <option value="">Seleccionar...</option>
                                {FAMILIAS_CARGO.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            {errores.familiaCargo && <span style={estiloError}>{errores.familiaCargo}</span>}
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label style={estiloLabel}>Descripción del Puesto</label>
                        <textarea
                            value={form.descripcion}
                            onChange={(e) => handleChange("descripcion", e.target.value)}
                            placeholder="Describa las funciones y responsabilidades principales..."
                            rows={3}
                            style={{ ...estiloInput, resize: "vertical" }}
                        />
                    </div>

                    {/* Requisitos */}
                    <div>
                        <label style={estiloLabel}>Requisitos</label>
                        <textarea
                            value={form.requisitos}
                            onChange={(e) => handleChange("requisitos", e.target.value)}
                            placeholder="Experiencia, certificaciones, formación requerida..."
                            rows={3}
                            style={{ ...estiloInput, resize: "vertical" }}
                        />
                    </div>

                    {/* Apartado de Etiquetas / Cualidades Requeridas */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                            <label style={estiloLabel}>Etiquetas de Cualidades Requeridas</label>
                            <span style={{ fontSize: "11px", color: "#6c757d" }}>
                                Seleccione cualidades o cree una nueva reutilizable
                            </span>
                        </div>

                        {/* Input para agregar o crear etiqueta */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                            <input
                                type="text"
                                value={nuevaEtiqueta}
                                onChange={(e) => setNuevaEtiqueta(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAgregarNuevaEtiqueta();
                                    }
                                }}
                                placeholder="Escriba una cualidad (ej: Liderazgo) y presione '+ Crear'..."
                                style={{ ...estiloInput, flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleAgregarNuevaEtiqueta}
                                style={{
                                    padding: "8px 14px",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    backgroundColor: "#2c3e50",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                + Crear
                            </button>
                        </div>

                        {/* Cajitas redondeadas de etiquetas disponibles */}
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                                padding: "10px",
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                maxHeight: "130px",
                                overflowY: "auto",
                            }}
                        >
                            {Array.from(new Set([...etiquetasDisponibles, ...form.etiquetas])).map((tag) => {
                                const seleccionada = form.etiquetas.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleToggleEtiqueta(tag)}
                                        style={{
                                            padding: "4px 12px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            borderRadius: "16px",
                                            border: seleccionada ? "1.5px solid #ff7700" : "1px solid #cbd5e1",
                                            backgroundColor: seleccionada ? "#fff3e6" : "#ffffff",
                                            color: seleccionada ? "#d35400" : "#334155",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            transition: "all 0.15s ease",
                                        }}
                                        title={seleccionada ? "Clic para deseleccionar" : "Clic para seleccionar"}
                                    >
                                        {tag}
                                        {seleccionada ? (
                                            <span style={{ fontWeight: "bold" }}>✓</span>
                                        ) : (
                                            <span style={{ color: "#94a3b8", fontSize: "11px" }}>+</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {form.etiquetas.length > 0 && (
                            <span style={{ fontSize: "12px", color: "#d35400", fontWeight: "600", marginTop: "4px", display: "inline-block" }}>
                                {form.etiquetas.length} cualidad{form.etiquetas.length > 1 ? "es" : ""} seleccionada{form.etiquetas.length > 1 ? "s" : ""} para este puesto
                            </span>
                        )}
                    </div>

                    {/* Vacantes */}
                    <div style={{ maxWidth: "140px" }}>
                        <label style={estiloLabel}>Vacantes *</label>
                        <input
                            type="number"
                            min={1}
                            value={form.vacantes}
                            onChange={(e) => handleChange("vacantes", e.target.value)}
                            style={{ ...estiloInput, borderColor: errores.vacantes ? "#dc3545" : "#ced4da" }}
                        />
                        {errores.vacantes && <span style={estiloError}>{errores.vacantes}</span>}
                    </div>

                    {/* Botones */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #eee" }}>
                        <button
                            type="button"
                            onClick={onCerrar}
                            style={{
                                padding: "9px 18px",
                                fontSize: "14px",
                                border: "1px solid #ced4da",
                                borderRadius: "5px",
                                background: "#fff",
                                cursor: "pointer",
                                fontWeight: "600",
                                color: "#495057",
                            }}
                        >
                            Cancelar
                        </button>
                        <BotonOrange texto={enviando ? "Creando..." : "Crear Puesto"} type="submit" disabled={enviando} />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalCrearPuesto;
