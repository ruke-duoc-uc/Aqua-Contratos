import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange.jsx";
import EncabezadoRegistro from "./EncabezadoRegistro.jsx";
import { PLANTAS_DISPONIBLES, FAMILIAS_CARGO } from "../utils/constantes";
import { ESTILO_ETIQUETA, ESTILO_VALOR, NARANJA, NARANJA_OSCURO } from "./Estilos.jsx";

function GestionPuestosView({ puestos, onAbrirCrear, onCambiarEstado, etiquetas = [], onCrearEtiqueta }) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroPlanta, setFiltroPlanta] = useState("todas");
    const [filtroFamilia, setFiltroFamilia] = useState("todas");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [modalBancoAbierto, setModalBancoAbierto] = useState(false);
    const [nuevaEtiquetaBanco, setNuevaEtiquetaBanco] = useState("");

    const puestosFiltrados = useMemo(() => {
        return puestos.filter((p) => {
            const termino = busqueda.toLowerCase().trim();
            const coincideTexto =
                !termino ||
                p.titulo.toLowerCase().includes(termino) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(termino)) ||
                (p.requisitos && p.requisitos.toLowerCase().includes(termino)) ||
                (Array.isArray(p.etiquetas) && p.etiquetas.some((t) => t.toLowerCase().includes(termino)));

            const coincidePlanta =
                filtroPlanta === "todas" || p.planta === filtroPlanta;

            const coincideFamilia =
                filtroFamilia === "todas" || p.familiaCargo === filtroFamilia;

            const coincideEstado =
                filtroEstado === "todos" || p.estado === filtroEstado;

            return coincideTexto && coincidePlanta && coincideFamilia && coincideEstado;
        });
    }, [puestos, busqueda, filtroPlanta, filtroFamilia, filtroEstado]);

    const estiloFiltro = {
        padding: "7px 10px",
        fontSize: "13px",
        border: "1px solid #ced4da",
        borderRadius: "5px",
        minWidth: "140px",
    };

    const badgeEstado = (estado) => {
        const colores = {
            Abierto: { bg: "#d4edda", color: "#155724", border: "#c3e6cb" },
            Pausado: { bg: "#fff3cd", color: "#856404", border: "#ffeeba" },
            Cerrado: { bg: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
        };
        const c = colores[estado] || colores.Abierto;
        return {
            display: "inline-block",
            padding: "3px 10px",
            fontSize: "12px",
            fontWeight: "700",
            borderRadius: "12px",
            backgroundColor: c.bg,
            color: c.color,
            border: `1px solid ${c.border}`,
        };
    };

    return (
        <div>
            {/* Encabezado */}
            <div
                style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Puestos de Trabajo</h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        Gestión de ofertas laborales · {puestosFiltrados.length} de {puestos.length} puestos
                    </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={() => setModalBancoAbierto(true)}
                        style={{
                            padding: "9px 15px",
                            fontSize: "13.5px",
                            fontWeight: "600",
                            borderRadius: "6px",
                            border: "1px solid #ced4da",
                            backgroundColor: "#ffffff",
                            color: "#2c3e50",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                    >
                        🏷️ Banco de Etiquetas ({etiquetas.length})
                    </button>
                    <BotonOrange texto="+ Crear Puesto de Trabajo" onClick={onAbrirCrear} />
                </div>
            </div>

            {/* Filtros */}
            <div
                style={{
                    padding: "12px 20px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar por título, descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ ...estiloFiltro, flex: "1", minWidth: "200px" }}
                />
                <select value={filtroPlanta} onChange={(e) => setFiltroPlanta(e.target.value)} style={estiloFiltro}>
                    <option value="todas">Todas las plantas</option>
                    {PLANTAS_DISPONIBLES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                <select value={filtroFamilia} onChange={(e) => setFiltroFamilia(e.target.value)} style={estiloFiltro}>
                    <option value="todas">Todas las familias</option>
                    {FAMILIAS_CARGO.map((f) => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={estiloFiltro}>
                    <option value="todos">Todos los estados</option>
                    <option value="Abierto">Abierto</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Cerrado">Cerrado</option>
                </select>
            </div>

            {/* Lista de puestos */}
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {puestosFiltrados.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
                        <p style={{ fontSize: "16px", margin: 0 }}>
                            {puestos.length === 0
                                ? "No hay puestos de trabajo creados. Cree el primero con el botón superior."
                                : "🔍 No se encontraron puestos con los filtros aplicados."}
                        </p>
                    </div>
                ) : (
                    puestosFiltrados.map((puesto) => (
                        <article
                            key={puesto.id}
                            style={{
                                backgroundColor: "white",
                                borderRadius: "10px",
                                border: "1px solid #dee2e6",
                                padding: "16px 20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            {/* Cabecera */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{puesto.titulo}</h3>
                                    <span style={{ fontSize: "12px", color: "#666" }}>
                                        {puesto.planta} · {puesto.familiaCargo}
                                    </span>
                                </div>
                                <span style={badgeEstado(puesto.estado)}>{puesto.estado}</span>
                            </div>

                            {/* Descripción */}
                            {puesto.descripcion && (
                                <p style={{ margin: 0, fontSize: "13.5px", color: "#555", lineHeight: "1.5" }}>
                                    {puesto.descripcion}
                                </p>
                            )}

                            {/* Requisitos colapsables */}
                            {puesto.requisitos && (
                                <details>
                                    <summary
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: NARANJA_OSCURO,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Ver requisitos
                                    </summary>
                                    <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#555", lineHeight: "1.5" }}>
                                        {puesto.requisitos}
                                    </p>
                                </details>
                            )}

                            {/* Apartado de Cualidades / Etiquetas */}
                            {Array.isArray(puesto.etiquetas) && puesto.etiquetas.length > 0 && (
                                <div
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "5px",
                                    }}
                                >
                                    <span style={{ ...ESTILO_ETIQUETA, fontSize: "11px", color: "#64748b" }}>
                                        Cualidades solicitadas
                                    </span>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {puesto.etiquetas.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    display: "inline-block",
                                                    padding: "3px 10px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    color: "#1e293b",
                                                    backgroundColor: "#e2e8f0",
                                                    borderRadius: "14px",
                                                    border: "1px solid #cbd5e1",
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Datos y acciones */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                                    <div>
                                        <span style={ESTILO_ETIQUETA}>Vacantes</span>
                                        <p style={ESTILO_VALOR}>{puesto.vacantes}</p>
                                    </div>
                                    <div>
                                        <span style={ESTILO_ETIQUETA}>Creado por</span>
                                        <p style={ESTILO_VALOR}>{puesto.creadoPor || "Jefe de Área"}</p>
                                    </div>
                                    <div>
                                        <span style={ESTILO_ETIQUETA}>Fecha</span>
                                        <p style={ESTILO_VALOR}>
                                            {puesto.fechaCreacion
                                                ? new Date(puesto.fechaCreacion).toLocaleDateString("es-CL")
                                                : "—"}
                                        </p>
                                    </div>
                                    {puesto.totalPostulantes !== undefined && (
                                        <div>
                                            <span style={ESTILO_ETIQUETA}>Postulantes</span>
                                            <p style={ESTILO_VALOR}>{puesto.totalPostulantes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Botones de cambio de estado */}
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {puesto.estado !== "Abierto" && (
                                        <button
                                            type="button"
                                            onClick={() => onCambiarEstado(puesto.id, "Abierto")}
                                            style={{
                                                padding: "5px 12px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                border: "1px solid #c3e6cb",
                                                borderRadius: "5px",
                                                backgroundColor: "#d4edda",
                                                color: "#155724",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Abrir
                                        </button>
                                    )}
                                    {puesto.estado !== "Pausado" && (
                                        <button
                                            type="button"
                                            onClick={() => onCambiarEstado(puesto.id, "Pausado")}
                                            style={{
                                                padding: "5px 12px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                border: "1px solid #ffeeba",
                                                borderRadius: "5px",
                                                backgroundColor: "#fff3cd",
                                                color: "#856404",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Pausar
                                        </button>
                                    )}
                                    {puesto.estado !== "Cerrado" && (
                                        <button
                                            type="button"
                                            onClick={() => onCambiarEstado(puesto.id, "Cerrado")}
                                            style={{
                                                padding: "5px 12px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                border: "1px solid #f5c6cb",
                                                borderRadius: "5px",
                                                backgroundColor: "#f8d7da",
                                                color: "#721c24",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Cerrar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Modal Banco de Etiquetas */}
            {modalBancoAbierto && (
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
                    onClick={() => setModalBancoAbierto(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            width: "95%",
                            maxWidth: "520px",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            padding: "20px 24px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Banco de Etiquetas de Cualidades</h3>
                                <span style={{ fontSize: "12px", color: "#666" }}>
                                    Cualidades globales reutilizables para cualquier puesto de trabajo
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalBancoAbierto(false)}
                                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}
                                title="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Input para agregar una nueva etiqueta al banco */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            <input
                                type="text"
                                value={nuevaEtiquetaBanco}
                                onChange={(e) => setNuevaEtiquetaBanco(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (nuevaEtiquetaBanco.trim() && onCrearEtiqueta) {
                                            onCrearEtiqueta(nuevaEtiquetaBanco.trim());
                                            setNuevaEtiquetaBanco("");
                                        }
                                    }
                                }}
                                placeholder="Nueva cualidad (ej: Manejo de grúa horquilla)..."
                                style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    fontSize: "14px",
                                    border: "1px solid #ced4da",
                                    borderRadius: "5px",
                                    boxSizing: "border-box",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (nuevaEtiquetaBanco.trim() && onCrearEtiqueta) {
                                        onCrearEtiqueta(nuevaEtiquetaBanco.trim());
                                        setNuevaEtiquetaBanco("");
                                    }
                                }}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    backgroundColor: "#ff7700",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                + Agregar
                            </button>
                        </div>

                        {/* Lista de etiquetas del banco como cajitas redondeadas */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#495057" }}>
                                Etiquetas disponibles en el catálogo ({etiquetas.length}):
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "8px",
                                    padding: "12px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    maxHeight: "240px",
                                    overflowY: "auto",
                                }}
                            >
                                {etiquetas.length === 0 ? (
                                    <span style={{ fontSize: "12px", color: "#888" }}>No hay etiquetas registradas.</span>
                                ) : (
                                    etiquetas.map((tag) => (
                                        <span
                                            key={tag}
                                            style={{
                                                display: "inline-block",
                                                padding: "5px 12px",
                                                fontSize: "12.5px",
                                                fontWeight: "600",
                                                color: "#1e293b",
                                                backgroundColor: "#e2e8f0",
                                                borderRadius: "16px",
                                                border: "1px solid #cbd5e1",
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: "18px", textAlign: "right" }}>
                            <button
                                type="button"
                                onClick={() => setModalBancoAbierto(false)}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    borderRadius: "5px",
                                    border: "1px solid #ced4da",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                    color: "#495057",
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestionPuestosView;
