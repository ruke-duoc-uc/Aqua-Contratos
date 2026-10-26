/** Barra superior de navegación, pestañas y selector de roles simulados (RF01)
 * @Autor Amaro Villalobos
 * Permite alternar entre los roles de empleado (Analista, Evaluador, Jefatura)
 * y navegar entre las 3 pestañas: Postulantes, Candidatos y Evaluaciones.
 **/

function HeaderRoles({ rolActual, tabActiva, onCambiarTab, onCambiarRol, onVolver }) {
    const rolesInfo = {
        analista: { nombre: "Analista de Reclutamiento", descripcion: "Crea candidatos y gestiona solicitudes" },
        evaluador: { nombre: "Profesional Evaluador", descripcion: "Evalúa candidatos y califica" },
        jefatura: { nombre: "Jefe de Área", descripcion: "Supervisión y seguimiento general" },
    };

    const infoActual = rolesInfo[rolActual] || { nombre: "Empleado AquaChile", descripcion: "" };

    const tabs = [
        { id: "postulantes", label: "Postulantes" },
        { id: "candidatos", label: "Candidatos" },
        { id: "evaluaciones", label: "Evaluaciones" },
    ];

    return (
        <header className="header-roles" style={{ flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "bold" }}>
                            AquaChile · Aqua-Contratos
                        </h1>
                        <span style={{ fontSize: "12px", color: "var(--color-texto-atenuado, #666)" }}>
                            Portal de Empleados · Sistema Integrado de Evaluaciones
                        </span>
                    </div>
                </div>

                <div className="selector-rol-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>
                        Rol de Empleado:
                    </span>

                    {onCambiarRol ? (
                        <select
                            value={rolActual}
                            onChange={(e) => onCambiarRol(e.target.value)}
                            style={{
                                backgroundColor: "#e0f2fe",
                                color: "#0369a1",
                                border: "1px solid #7dd3fc",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "13px",
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                            title="Cambiar rol de empleado activo"
                        >
                            <option value="analista">Analista de Reclutamiento</option>
                            <option value="evaluador">Profesional Evaluador</option>
                            <option value="jefatura">Jefe de Área</option>
                        </select>
                    ) : (
                        <span className="badge-rol">{infoActual.nombre}</span>
                    )}

                    {onVolver && (
                        <button
                            type="button"
                            onClick={onVolver}
                            style={{
                                background: "#f8f9fa",
                                border: "1px solid #ced4da",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                color: "#495057",
                                transition: "all 0.2s ease",
                            }}
                            title="Volver a la selección de portal"
                        >
                            ← Salir al Portal
                        </button>
                    )}
                </div>
            </div>

            {/* 3 Pestañas de Navegación: Postulantes, Candidatos, Evaluaciones */}
            <nav className="nav-tabs-lista" aria-label="Navegación de vistas">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`nav-tab-boton ${tabActiva === tab.id ? "activo" : ""}`}
                        onClick={() => onCambiarTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </header>
    );
}

export default HeaderRoles;
