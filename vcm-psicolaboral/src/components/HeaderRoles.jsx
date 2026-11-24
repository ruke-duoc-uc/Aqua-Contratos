/** Barra superior de navegación y pestañas
 * Muestra el nombre real del empleado logueado (y su área si es jefe de área)
 * y el botón para salir al portal.
 **/
import { useEffect, useState } from "react";
import { obtenerSesionEmpleado } from "../services/empleadosStorage";
import { api } from "../services/api";
import LogoAquaChile from "./LogoAquaChile";

function HeaderRoles({
    rolActual,
    tabActiva,
    onCambiarTab,
    onVolver,
    tabs: tabsProp,
}) {
    const rolesInfo = {
        analista: { nombre: "Analista de Reclutamiento", descripcion: "Crea candidatos y gestiona solicitudes" },
        evaluador: { nombre: "Profesional Evaluador", descripcion: "Evalúa candidatos y califica" },
        jefatura: { nombre: "Jefe de Área", descripcion: "Supervisión y seguimiento general" },
    };

    const infoActual = rolesInfo[rolActual] || { nombre: "Empleado AquaChile", descripcion: "" };

    // Datos reales del empleado logueado (se leen una vez al montar la barra;
    // cada pantalla de rol monta su propio HeaderRoles).
    const [usuarioSesion] = useState(
        () => obtenerSesionEmpleado()?.usuario || null
    );
    const [nombreArea, setNombreArea] = useState("");
    const areaId = usuarioSesion?.area_id || null;

    // El jefe de área muestra el nombre de su área (usuario.area_id → areas_trabajo).
    useEffect(() => {
        let activo = true;

        async function cargarArea() {
            // Sin área asignada no hay nada que consultar.
            if (!areaId) return;
            try {
                const area = await api.getAreaPorId(areaId);
                if (activo) setNombreArea(area?.tipo_area || "");
            } catch {
                // Si la API no responde, se muestra solo el cargo.
                if (activo) setNombreArea("");
            }
        }

        cargarArea();
        return () => {
            activo = false;
        };
    }, [areaId]);

    // Nombre a mostrar: el real del usuario logueado, o el del rol por defecto.
    const nombreMostrado = usuarioSesion?.nombre || infoActual.nombre;

    const tabsPorDefecto = [
        { id: "dashboard", label: "Dashboard Operativo" },
        { id: "postulantes", label: "Lista de Postulantes" },
        { id: "postulantesPorPuesto", label: "Lista de Candidatos" },
        { id: "entrevistas", label: "Calendario y Citaciones" },
        { id: "informes", label: "Informes de Candidatos" },
    ];

    const tabs = tabsProp || tabsPorDefecto;

    return (
        <header className="header-roles" style={{ flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <LogoAquaChile height={44} />
                    <div style={{ borderLeft: "2px solid #dbe3eb", paddingLeft: "14px" }}>
                        <h1 style={{ margin: 0, fontSize: "1.08rem", fontWeight: "bold", color: "#223b4c" }}>
                            AquaChile · Aqua-Contratos
                        </h1>
                        <span style={{ fontSize: "12px", color: "#5c7485" }}>
                            {nombreMostrado} · Sistema Integrado de Evaluaciones
                        </span>
                    </div>
                </div>

                <div className="selector-rol-container" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#5c7485" }}>
                        Cargo Activo:
                    </span>

                    {/* Nombre fijo del empleado/cargo */}
                    <span
                        className="badge-rol"
                        style={{
                            backgroundColor: "#e6eef4",
                            color: "#223b4c",
                            border: "1px solid #b6c8d6",
                            borderRadius: "6px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            fontWeight: "bold",
                        }}
                    >
                        {nombreMostrado}
                        {nombreArea ? ` · ${nombreArea}` : ""}
                    </span>

                    {/* Botón Salir al Portal (idéntico al funcionamiento de Jefe de Área) */}
                    {onVolver && (
                        <button
                            type="button"
                            onClick={onVolver}
                            style={{
                                background: "#ffffff",
                                border: "1px solid #223b4c",
                                borderRadius: "6px",
                                padding: "6px 14px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                color: "#223b4c",
                                transition: "all 0.2s ease",
                            }}
                            title="Volver a la selección de portal"
                        >
                            ← Salir al Portal
                        </button>
                    )}
                </div>
            </div>

            {/* Pestañas de Navegación de la Vista */}
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
