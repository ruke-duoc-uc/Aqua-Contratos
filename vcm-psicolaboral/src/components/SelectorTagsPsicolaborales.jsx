/**
 * Componente interactivo para gestión de etiquetas psicolaborales (fortalezas / debilidades)
 * Exclusivo para el Profesional Evaluador para edición, y modo lectura tipo badges para otros roles.
 */
import { useState } from "react";

export default function SelectorTagsPsicolaborales({
    titulo,
    tipo = "fortaleza", // "fortaleza" | "debilidad"
    tagsActuales = [],
    sugerencias = [],
    esEditable = false,
    onAgregarTag,
    onRemoverTag,
}) {
    const [nuevoTagTexto, setNuevoTagTexto] = useState("");

    const esFortaleza = tipo === "fortaleza";
    const colorBgBadge = esFortaleza ? "#d1e7dd" : "#ffeeba";
    const colorTextoBadge = esFortaleza ? "#0f5132" : "#856404";
    const colorBordeBadge = esFortaleza ? "#badbcc" : "#ffdf7e";
    const icono = esFortaleza ? "✓" : "⚠";

    const sugerenciasDisponibles = sugerencias.filter(
        (sug) => !tagsActuales.some((t) => t.toLowerCase() === sug.toLowerCase())
    );

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const texto = nuevoTagTexto.trim();
            if (texto && !tagsActuales.includes(texto)) {
                onAgregarTag(texto);
                setNuevoTagTexto("");
            }
        }
    };

    return (
        <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <strong style={{ fontSize: "13px", color: esFortaleza ? "#0f5132" : "#856404" }}>
                    {titulo} ({tagsActuales.length})
                </strong>
            </div>

            {/* Listado de tags actuales */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "32px", alignItems: "center" }}>
                {tagsActuales.length === 0 ? (
                    <span style={{ fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                        Sin {esFortaleza ? "fortalezas" : "debilidades"} registradas.
                    </span>
                ) : (
                    tagsActuales.map((tag, idx) => (
                        <span
                            key={idx}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                backgroundColor: colorBgBadge,
                                color: colorTextoBadge,
                                border: `1px solid ${colorBordeBadge}`,
                                borderRadius: "14px",
                                padding: "3px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                            }}
                        >
                            <span>{icono}</span>
                            <span>{tag}</span>
                            {esEditable && (
                                <button
                                    type="button"
                                    onClick={() => onRemoverTag(tag)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: colorTextoBadge,
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: "bold",
                                        padding: 0,
                                        marginLeft: "3px",
                                        lineHeight: 1,
                                    }}
                                    title="Quitar etiqueta"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))
                )}
            </div>

            {/* Selector rápido e input personalizado solo para Evaluador */}
            {esEditable && (
                <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <input
                            type="text"
                            value={nuevoTagTexto}
                            onChange={(e) => setNuevoTagTexto(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`+ Escribir nueva ${esFortaleza ? "fortaleza" : "debilidad"} y pulsar Enter...`}
                            style={{
                                flex: 1,
                                padding: "5px 10px",
                                borderRadius: "4px",
                                border: "1px solid #ced4da",
                                fontSize: "12px",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const texto = nuevoTagTexto.trim();
                                if (texto && !tagsActuales.includes(texto)) {
                                    onAgregarTag(texto);
                                    setNuevoTagTexto("");
                                }
                            }}
                            disabled={!nuevoTagTexto.trim()}
                            style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #ced4da",
                                borderRadius: "4px",
                                padding: "5px 10px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            + Añadir
                        </button>
                    </div>

                    {/* Banco de tags psicolaborales sugeridos */}
                    {sugerenciasDisponibles.length > 0 && (
                        <div style={{ marginTop: "6px" }}>
                            <span style={{ fontSize: "11px", color: "#6c757d", display: "block", marginBottom: "3px" }}>
                                Sugerencias psicolaborales:
                            </span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {sugerenciasDisponibles.slice(0, 6).map((sug, sIdx) => (
                                    <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => onAgregarTag(sug)}
                                        style={{
                                            backgroundColor: "#fff",
                                            border: "1px dashed #ced4da",
                                            borderRadius: "10px",
                                            padding: "2px 8px",
                                            fontSize: "11px",
                                            color: "#495057",
                                            cursor: "pointer",
                                        }}
                                        title="Click para agregar sugerencia"
                                    >
                                        + {sug}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
