/** Barra superior de navegación, pestañas y selector de roles simulados (RF01)
 * @Autor Amaro Villalobos
 * Permite alternar entre los roles definidos en las bases del MVP:
 * Analista de Reclutamiento, Profesional Evaluador y Jefe de Área.
 **/

function HeaderRoles({ rolActual, tabActiva, onCambiarTab, onVolver }) {
    const rolesInfo = {
        analista: { nombre: "Analista de Reclutamiento", descripcion: "Crea candidatos y solicitudes" },
        evaluador: { nombre: "Profesional Evaluador", descripcion: "Evalúa candidatos y califica" },
        jefatura: { nombre: "Jefe de Área", descripcion: "Solo consulta y seguimiento" },
    };

    const infoActual = rolesInfo[rolActual] || { nombre: rolActual, descripcion: "" };

    const tabs = [
        { id: "dashboard", label: "Dashboard Operativo" },
        { id: "candidatos", label: "Gestión de Candidatos" },
        { id: "solicitudes", label: "Solicitudes de Evaluación" },
        { id: "informes", label: "Informes de Candidatos" },
    ];

    return (
        <header className="header-roles" style={{ flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "bold" }}>
                            AquaChile · Aqua-Contratos
                        </h1>
                        <span style={{ fontSize: "12px", color: "var(--color-texto-atenuado, #666)" }}>
                            Sistema Integrado de Evaluaciones Psicolaborales
                        </span>
                    </div>
                </div>

                <div className="selector-rol-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>
                        Usuario:
                    </span>
                    <span className="badge-rol">
                        {infoActual.nombre}
                    </span>
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
                                transition: "all 0.2s ease"
                            }}
                            title="Volver a la selección de usuarios"
                        >
                            ← Cambiar de Pantalla
                        </button>
                    )}
                </div>
            </div>

            {/* Pestañas de Navegación entre Vistas del MVP */}
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
