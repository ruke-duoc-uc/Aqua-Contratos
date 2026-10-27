/** Vista Web: Gestión y Catálogo de Candidatos y Postulantes (RF02, RF03)
 * @Autor Amaro Villalobos
 * Interfaz requerida en las bases del MVP para listar, registrar, buscar
 * y administrar información de los postulantes de AquaChile.
 *
 * Atributos del postulante:
 * - rut
 * - nombres
 * - apellidos
 * - direccion
 * - comuna
 * - fecha_nacimiento (edad)
 * - cv_pdf
 **/
import { useState, useMemo } from "react";
import BotonOrange from "./BotonOrange";
import { calcularEdad } from "../utils/calcularRut";

function GestionCandidatosView({
    candidatos = [],
    rolActual,
    onAbrirNuevoCandidato,
    onEditarCandidato,
    onVerDetalle,
}) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroComuna, setFiltroComuna] = useState("todas");

    const esAnalista = rolActual === "analista";

    // Obtener lista única de comunas disponibles a partir de los datos
    const comunas = useMemo(() => {
        const setComunas = new Set();
        candidatos.forEach((c) => {
            const com = c.comuna || c.planta;
            if (com) setComunas.add(com);
        });
        return Array.from(setComunas).sort();
    }, [candidatos]);

    // Filtrar candidatos en base a los atributos solicitados
    const candidatosFiltrados = useMemo(() => {
        return candidatos.filter((c) => {
            const termino = busqueda.toLowerCase().trim();
            const nombres = (c.nombres || (c.nombre ? c.nombre.split(" ").slice(0, -2).join(" ") || c.nombre.split(" ")[0] : "")).toLowerCase();
            const apellidos = (c.apellidos || (c.nombre ? c.nombre.split(" ").slice(-2).join(" ") : "")).toLowerCase();
            const nombreCompleto = (c.nombre || `${c.nombres || ""} ${c.apellidos || ""}`).toLowerCase();
            const rut = (c.rut || "").toLowerCase();
            const direccion = (c.direccion || "").toLowerCase();
            const comuna = (c.comuna || c.planta || "").toLowerCase();

            const coincideTexto =
                !termino ||
                nombres.includes(termino) ||
                apellidos.includes(termino) ||
                nombreCompleto.includes(termino) ||
                rut.includes(termino) ||
                direccion.includes(termino) ||
                comuna.includes(termino);

            const coincideComuna =
                filtroComuna === "todas" ||
                comuna === filtroComuna.toLowerCase();

            return coincideTexto && coincideComuna;
        });
    }, [candidatos, busqueda, filtroComuna]);

    const handleLimpiarFiltros = () => {
        setBusqueda("");
        setFiltroComuna("todas");
    };

    const hayFiltrosActivos = busqueda.trim() !== "" || filtroComuna !== "todas";

    return (
        <section
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "2px solid gray",
                overflow: "hidden",
            }}
        >
            {/* Cabecera de la sección */}
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
                        Catálogo de Postulantes (RF02, RF03)
                    </h2>
                    <span style={{ fontSize: "13px", color: "gray" }}>
                        Registro maestro con RUT, nombres, apellidos, dirección, comuna, fecha de nacimiento, edad y CV
                    </span>
                </div>

                {esAnalista && (
                    <BotonOrange
                        texto="+ Registrar Postulante"
                        onClick={onAbrirNuevoCandidato}
                    />
                )}
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="filtros-barra-contenedor" style={{ padding: "12px 20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div className="buscador-input-wrapper" style={{ flex: 1, minWidth: "260px" }}>
                    <input
                        type="text"
                        className="buscador-input"
                        placeholder="Buscar por RUT, nombres, apellidos, dirección o comuna..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        aria-label="Buscar postulantes"
                    />
                </div>

                <select
                    className="filtro-select"
                    value={filtroComuna}
                    onChange={(e) => setFiltroComuna(e.target.value)}
                    aria-label="Filtrar por comuna"
                    style={{ minWidth: "180px" }}
                >
                    <option value="todas">Todas las Comunas</option>
                    {comunas.map((com) => (
                        <option key={com} value={com}>
                            {com}
                        </option>
                    ))}
                </select>

                {hayFiltrosActivos && (
                    <button
                        type="button"
                        className="boton-limpiar-filtros"
                        onClick={handleLimpiarFiltros}
                        title="Restablecer filtros"
                    >
                        Limpiar
                    </button>
                )}

                <span style={{ fontSize: "12px", color: "#6c757d", marginLeft: "auto" }}>
                    Mostrando <strong>{candidatosFiltrados.length}</strong> de {candidatos.length} postulantes
                </span>
            </div>

            {/* Listado en Formato Tabla Acorde a los Atributos Solicitados */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#CDCDCD", color: "#333", textAlign: "left" }}>
                            <th style={{ padding: "12px 14px" }}>RUT</th>
                            <th style={{ padding: "12px 14px" }}>Nombres</th>
                            <th style={{ padding: "12px 14px" }}>Apellidos</th>
                            <th style={{ padding: "12px 14px" }}>Dirección</th>
                            <th style={{ padding: "12px 14px" }}>Comuna</th>
                            <th style={{ padding: "12px 14px" }}>Fecha Nac. (Edad)</th>
                            <th style={{ padding: "12px 14px" }}>CV (PDF)</th>
                            <th style={{ padding: "12px 14px", textAlign: "center" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidatosFiltrados.length > 0 ? (
                            candidatosFiltrados.map((c) => {
                                // Normalización de nombres y apellidos si venían unificados en 'nombre'
                                const nombresMostrar = c.nombres || (c.nombre ? c.nombre.split(" ").slice(0, -2).join(" ") || c.nombre.split(" ")[0] : "—");
                                const apellidosMostrar = c.apellidos || (c.nombre ? c.nombre.split(" ").slice(-2).join(" ") || c.nombre.split(" ").slice(1).join(" ") : "—");
                                const direccionMostrar = c.direccion || "Dirección no informada";
                                const comunaMostrar = c.comuna || c.planta || "No informada";
                                const fechaNac = c.fecha_nacimiento;
                                const edad = fechaNac ? calcularEdad(fechaNac) : null;
                                const cvArchivo = c.cv_pdf || c.cvArchivo || (c.nombre ? `cv_${c.nombre.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf` : null);

                                return (
                                    <tr
                                        key={c.id}
                                        style={{
                                            borderBottom: "1px solid #f0f0f0",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {/* 1. RUT */}
                                        <td style={{ padding: "12px 14px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                                            {c.rut}
                                        </td>

                                        {/* 2. Nombres */}
                                        <td style={{ padding: "12px 14px" }}>
                                            {nombresMostrar}
                                        </td>

                                        {/* 3. Apellidos */}
                                        <td style={{ padding: "12px 14px" }}>
                                            {apellidosMostrar}
                                        </td>

                                        {/* 4. Dirección */}
                                        <td style={{ padding: "12px 14px", color: "#555" }}>
                                            {direccionMostrar}
                                        </td>

                                        {/* 5. Comuna */}
                                        <td style={{ padding: "12px 14px" }}>
                                            <span
                                                style={{
                                                    backgroundColor: "#f0f4f8",
                                                    color: "#334e68",
                                                    padding: "3px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {comunaMostrar}
                                            </span>
                                        </td>

                                        {/* 6. Fecha de Nacimiento (Edad) */}
                                        <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                                            {fechaNac ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span>{fechaNac}</span>
                                                    {edad !== null && (
                                                        <span
                                                            style={{
                                                                backgroundColor: "#e8f5e9",
                                                                color: "#2e7d32",
                                                                padding: "2px 6px",
                                                                borderRadius: "10px",
                                                                fontSize: "11px",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {edad} años
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: "#999", fontStyle: "italic" }}>No registrada</span>
                                            )}
                                        </td>

                                        {/* 7. CV (PDF) */}
                                        <td style={{ padding: "12px 14px" }}>
                                            {cvArchivo ? (
                                                <span
                                                    title={`Documento: ${cvArchivo}`}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                        backgroundColor: "#e3f2fd",
                                                        color: "#0d47a1",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        wordBreak: "break-all",
                                                    }}
                                                >
                                                    {cvArchivo}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#999", fontSize: "12px" }}>Sin CV</span>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td
                                            style={{
                                                padding: "12px 14px",
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
                                                    title="Ver antecedentes completos del postulante"
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
                                                        title="Editar datos del postulante"
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ padding: "40px 20px", textAlign: "center", color: "gray" }}>
                                    No se encontraron postulantes que coincidan con la búsqueda.
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
