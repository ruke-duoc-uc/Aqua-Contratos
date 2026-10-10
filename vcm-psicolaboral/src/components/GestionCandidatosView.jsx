/** Vista Web: Gestión de Candidatos (RF02, RF03)
 * @Autor Amaro Villalobos
 * Interfaz requerida en las bases del MVP para listar, registrar, buscar
 * y editar información de los postulantes de AquaChile.
 **/
import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange";

function GestionCandidatosView({
    candidatos,
    rolActual,
    onAbrirNuevoCandidato,
    onEditarCandidato,
    onVerDetalle,
}) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroPlanta, setFiltroPlanta] = useState("todas");

    const esAnalista = rolActual === "analista";

    const plantas = useMemo(() => {
        const setPlantas = new Set(candidatos.map((c) => c.planta));
        return Array.from(setPlantas);
    }, [candidatos]);

    const candidatosFiltrados = useMemo(() => {
        return candidatos.filter((c) => {
            const termino = busqueda.toLowerCase().trim();
            const coincideTexto =
                !termino ||
                c.nombre.toLowerCase().includes(termino) ||
                c.rut.toLowerCase().includes(termino) ||
                c.especialidad.toLowerCase().includes(termino);

            const coincidePlanta =
                filtroPlanta === "todas" ||
                c.planta.toLowerCase() === filtroPlanta.toLowerCase();

            return coincideTexto && coincidePlanta;
        });
    }, [candidatos, busqueda, filtroPlanta]);

    return (
        <section
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "2px solid gray",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                        👥 Catálogo de Candidatos y Postulantes (RF02, RF03)
                    </h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        Registro maestro de perfiles, antecedentes laborales y salud ocupacional
                    </span>
                </div>

                {esAnalista && (
                    <BotonOrange
                        texto="+ Registrar Candidato"
                        onClick={onAbrirNuevoCandidato}
                    />
                )}
            </div>

            {/* Barra de Filtros para Candidatos */}
            <div className="filtros-barra-contenedor">
                <div className="buscador-input-wrapper">
                    <input
                        type="text"
                        className="buscador-input"
                        placeholder="🔍 Buscar candidato por nombre, RUT o especialidad..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        aria-label="Buscar candidatos"
                    />
                </div>

                <select
                    className="filtro-select"
                    value={filtroPlanta}
                    onChange={(e) => setFiltroPlanta(e.target.value)}
                    aria-label="Filtrar por planta"
                >
                    <option value="todas">Todas las Plantas</option>
                    {plantas.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>

                <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "auto" }}>
                    Mostrando <strong>{candidatosFiltrados.length}</strong> de {candidatos.length} candidatos
                </span>
            </div>

            {/* Listado en Formato Tabla Adaptable */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#CDCDCD", color: "gray", textAlign: "left" }}>
                            <th style={{ padding: "12px 16px" }}>Postulante</th>
                            <th style={{ padding: "12px 16px" }}>RUT</th>
                            <th style={{ padding: "12px 16px" }}>Especialidad</th>
                            <th style={{ padding: "12px 16px" }}>Planta</th>
                            <th style={{ padding: "12px 16px" }}>Antecedentes / Experiencia</th>
                            <th style={{ padding: "12px 16px", textAlign: "center" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidatosFiltrados.length > 0 ? (
                            candidatosFiltrados.map((c) => (
                                <tr
                                    key={c.id}
                                    style={{
                                        borderBottom: "1px solid #f0f0f0",
                                        fontWeight: "500",
                                    }}
                                >
                                    <td style={{ padding: "12px 16px", fontWeight: "bold" }}>
                                        {c.nombre}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>{c.rut}</td>
                                    <td style={{ padding: "12px 16px" }}>{c.especialidad}</td>
                                    <td style={{ padding: "12px 16px" }}>{c.planta}</td>
                                    <td
                                        style={{
                                            padding: "12px 16px",
                                            maxWidth: "320px",
                                            color: "#555",
                                            fontSize: "13px",
                                        }}
                                    >
                                        {c.antecedentes || "Sin antecedentes registrados."}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 16px",
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <div style={{ display: "inline-flex", gap: "8px" }}>
                                            <button
                                                type="button"
                                                onClick={() => onVerDetalle(c)}
                                                style={{
                                                    backgroundColor: "#e3f2fd",
                                                    color: "#0d47a1",
                                                    border: "none",
                                                    padding: "6px 10px",
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Ver Ficha
                                            </button>

                                            {esAnalista && (
                                                <button
                                                    type="button"
                                                    onClick={() => onEditarCandidato(c)}
                                                    style={{
                                                        backgroundColor: "#fff3cd",
                                                        color: "#856404",
                                                        border: "none",
                                                        padding: "6px 10px",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: "40px 20px", textAlign: "center", color: "gray" }}>
                                    No se encontraron candidatos que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default GestionCandidatosView;
