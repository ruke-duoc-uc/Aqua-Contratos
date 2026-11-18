import { useState } from "react";
import BotonOrange from "./BotonOrange.jsx";
import { COMUNAS } from "../utils/constantes";

function EditarPerfilPostulanteView({ candidato, onGuardar, onVolver }) {
    const [form, setForm] = useState({
        nombres: candidato?.nombres || candidato?.nombre?.split(" ").slice(0, -2).join(" ") || candidato?.nombre || "",
        apellidos: candidato?.apellidos || candidato?.nombre?.split(" ").slice(-2).join(" ") || "",
        rut: candidato?.rut || "",
        email: candidato?.email || "",
        telefono: candidato?.telefono || "",
        direccion: candidato?.direccion || "",
        comuna: candidato?.comuna || "Puerto Montt",
        fecha_nacimiento: candidato?.fecha_nacimiento || "",
    });

    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores((prev) => ({ ...prev, [campo]: null }));
        }
    };

    const validar = () => {
        const errs = {};
        if (!form.nombres.trim()) errs.nombres = "El nombre es obligatorio.";
        if (!form.apellidos.trim()) errs.apellidos = "Los apellidos son obligatorios.";
        if (!form.rut.trim()) errs.rut = "El RUT es obligatorio.";
        if (!form.email.trim()) errs.email = "El correo electrónico es obligatorio.";
        setErrores(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setGuardando(true);
        try {
            const nombreCompleto = `${form.nombres.trim()} ${form.apellidos.trim()}`.trim();
            await onGuardar({
                nombres: form.nombres.trim(),
                apellidos: form.apellidos.trim(),
                nombre: nombreCompleto,
                rut: form.rut.trim(),
                email: form.email.trim().toLowerCase(),
                telefono: form.telefono.trim(),
                direccion: form.direccion.trim(),
                comuna: form.comuna,
                fecha_nacimiento: form.fecha_nacimiento,
            });
        } finally {
            setGuardando(false);
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
        padding: "8px 12px",
        fontSize: "14px",
        border: "1px solid #ced4da",
        borderRadius: "6px",
        boxSizing: "border-box",
    };

    const estiloError = {
        fontSize: "12px",
        color: "#dc3545",
        marginTop: "2px",
        display: "block",
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "10px 0" }}>
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    border: "1px solid #dee2e6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                }}
            >
                {/* Cabecera */}
                <div
                    style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#fafbfc",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                            style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "50%",
                                backgroundColor: "#fff4e6",
                                color: "#e8590c",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                                border: "1px solid #fed7aa",
                            }}
                        >
                            👤
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>
                                Editar Perfil · Datos Personales
                            </h2>
                            <span style={{ fontSize: "13px", color: "#6b7280" }}>
                                Actualiza únicamente tu información de identificación y contacto
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onVolver}
                        style={{
                            padding: "6px 14px",
                            fontSize: "13px",
                            borderRadius: "6px",
                            border: "1px solid #ced4da",
                            background: "white",
                            cursor: "pointer",
                            fontWeight: "600",
                            color: "#495057",
                        }}
                    >
                        ← Volver a Postulaciones
                    </button>
                </div>

                {/* Formulario de Datos Personales */}
                <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    {/* Nombres y Apellidos */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={estiloLabel}>Nombres *</label>
                            <input
                                type="text"
                                value={form.nombres}
                                onChange={(e) => handleChange("nombres", e.target.value)}
                                placeholder="Ej: Luis Andrés"
                                style={{ ...estiloInput, borderColor: errores.nombres ? "#dc3545" : "#ced4da" }}
                            />
                            {errores.nombres && <span style={estiloError}>{errores.nombres}</span>}
                        </div>
                        <div>
                            <label style={estiloLabel}>Apellidos *</label>
                            <input
                                type="text"
                                value={form.apellidos}
                                onChange={(e) => handleChange("apellidos", e.target.value)}
                                placeholder="Ej: Mancilla Peralta"
                                style={{ ...estiloInput, borderColor: errores.apellidos ? "#dc3545" : "#ced4da" }}
                            />
                            {errores.apellidos && <span style={estiloError}>{errores.apellidos}</span>}
                        </div>
                    </div>

                    {/* RUT y Fecha de Nacimiento */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={estiloLabel}>RUT *</label>
                            <input
                                type="text"
                                value={form.rut}
                                onChange={(e) => handleChange("rut", e.target.value)}
                                placeholder="Ej: 21.756.200-7"
                                style={{ ...estiloInput, borderColor: errores.rut ? "#dc3545" : "#ced4da" }}
                            />
                            {errores.rut && <span style={estiloError}>{errores.rut}</span>}
                        </div>
                        <div>
                            <label style={estiloLabel}>Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={form.fecha_nacimiento}
                                onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
                                style={estiloInput}
                            />
                        </div>
                    </div>

                    {/* Email y Teléfono */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={estiloLabel}>Correo Electrónico *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="Ej: postulante@gmail.com"
                                style={{ ...estiloInput, borderColor: errores.email ? "#dc3545" : "#ced4da" }}
                            />
                            {errores.email && <span style={estiloError}>{errores.email}</span>}
                        </div>
                        <div>
                            <label style={estiloLabel}>Teléfono de Contacto</label>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={(e) => handleChange("telefono", e.target.value)}
                                placeholder="Ej: +56 9 8765 4321"
                                style={estiloInput}
                            />
                        </div>
                    </div>

                    {/* Dirección y Comuna */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={estiloLabel}>Dirección de Residencia</label>
                            <input
                                type="text"
                                value={form.direccion}
                                onChange={(e) => handleChange("direccion", e.target.value)}
                                placeholder="Ej: Av. Angelmó 1420"
                                style={estiloInput}
                            />
                        </div>
                        <div>
                            <label style={estiloLabel}>Comuna</label>
                            <select
                                value={form.comuna}
                                onChange={(e) => handleChange("comuna", e.target.value)}
                                style={estiloInput}
                            >
                                {COMUNAS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                            paddingTop: "16px",
                            borderTop: "1px solid #eee",
                            marginTop: "8px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onVolver}
                            style={{
                                padding: "9px 20px",
                                fontSize: "14px",
                                border: "1px solid #ced4da",
                                borderRadius: "6px",
                                background: "white",
                                cursor: "pointer",
                                fontWeight: "600",
                                color: "#495057",
                            }}
                        >
                            Cancelar
                        </button>
                        <BotonOrange
                            texto={guardando ? "Guardando..." : "Guardar Cambios"}
                            type="submit"
                            disabled={guardando}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditarPerfilPostulanteView;
