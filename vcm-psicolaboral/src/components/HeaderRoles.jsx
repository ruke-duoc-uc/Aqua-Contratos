/** Barra superior de navegación, pestañas y selector de roles simulados (RF01)
 * @Autor Amaro Villalobos
 * Permite alternar entre los roles definidos en las bases del MVP:
 * Analista de Reclutamiento, Profesional Evaluador y Jefe de Área.
 **/

function HeaderRoles({ rolActual, onCambiarRol, tabActiva, onCambiarTab }) {
    const rolesDisponibles = [
        { id: "analista", nombre: "Analista de Reclutamiento", descripcion: "Crea candidatos y solicitudes" },
        { id: "evaluador", nombre: "Profesional Evaluador", descripcion: "Evalúa candidatos y califica" },
        { id: "jefatura", nombre: "Jefe de Área", descripcion: "Solo consulta y seguimiento" },
    ];

    const tabs = [
        { id: "dashboard", label: "Dashboard Operativo" },
        { id: "candidatos", label: "Gestión de Candidatos" },
        { id: "solicitudes", label: "Solicitudes de Evaluación" },
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

                <div className="selector-rol-container">
                    <label htmlFor="selector-rol" style={{ fontSize: "13px", fontWeight: "600" }}>
                        Rol Activo:
                    </label>
                    <select
                        id="selector-rol"
                        className="select-rol"
                        value={rolActual}
                        onChange={(e) => onCambiarRol(e.target.value)}
                    >
                        {rolesDisponibles.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.nombre}
                            </option>
                        ))}
                    </select>
                    <span className="badge-rol">
                        {rolesDisponibles.find((r) => r.id === rolActual)?.nombre}
                    </span>
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
