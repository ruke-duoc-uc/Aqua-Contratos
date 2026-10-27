import { useState } from "react";
import AnalistaPage from "./pages/AnalistaPage";
import EvaluadorPage from "./pages/EvaluadorPage";
import JefaturaPage from "./pages/JefaturaPage";
import CandidatoPage from "./pages/CandidatoPage";

function App() {
    // Pantalla activa:
    // null: Portal principal (2 accesos: Portal de Empleados y Postulante a Trabajo)
    // "empleados": Selección de cargo interno para empleados (Analista, Evaluador, Jefatura)
    // "analista": Pantalla dedicada de Analista de Reclutamiento
    // "evaluador": Pantalla dedicada de Profesional Evaluador
    // "jefatura": Pantalla dedicada de Jefe de Área
    // "candidato": Pantalla dedicada para Postulante a Trabajo
    const [pantallaActiva, setPantallaActiva] = useState(null);

    // 1. Pantallas Dedicadas por Cargo (separadas e independientes)
    if (pantallaActiva === "analista") {
        return (
            <AnalistaPage
                onVolver={() => setPantallaActiva("empleados")}
                onCambiarRol={(nuevoRol) => setPantallaActiva(nuevoRol)}
            />
        );
    }

    if (pantallaActiva === "evaluador") {
        return (
            <EvaluadorPage
                onVolver={() => setPantallaActiva("empleados")}
                onCambiarRol={(nuevoRol) => setPantallaActiva(nuevoRol)}
            />
        );
    }

    if (pantallaActiva === "jefatura") {
        return (
            <JefaturaPage
                onVolver={() => setPantallaActiva("empleados")}
                onCambiarRol={(nuevoRol) => setPantallaActiva(nuevoRol)}
            />
        );
    }

    // 2. Pantalla Dedicada para Postulante (Portal Público)
    if (pantallaActiva === "candidato") {
        return <CandidatoPage onVolver={() => setPantallaActiva(null)} />;
    }

    // 3. Vista de Selección de Cargo dentro del Portal de Empleados
    if (pantallaActiva === "empleados") {
        const cargosEmpleados = [
            {
                id: "analista",
                titulo: "Analista de Reclutamiento",
                icono: "👤",
                badge: "Reclutamiento y Selección",
                descripcion:
                    "Creación y administración de candidatos, emisión de nuevas solicitudes de evaluación y seguimiento operativo de vacantes.",
                colorBorde: "#0e97b3",
                colorFondoBadge: "#e0f7fa",
                colorTextoBadge: "#006064",
                botonTexto: "Ingresar como Analista",
            },
            {
                id: "evaluador",
                titulo: "Profesional Evaluador",
                icono: "📋",
                badge: "Evaluación Psicolaboral",
                descripcion:
                    "Revisión de postulantes asignados, actualización de estados del proceso y registro formal del dictamen psicolaboral.",
                colorBorde: "#2e7d32",
                colorFondoBadge: "#e8f5e9",
                colorTextoBadge: "#1b5e20",
                botonTexto: "Ingresar como Evaluador",
            },
            {
                id: "jefatura",
                titulo: "Jefe de Área",
                icono: "📊",
                badge: "Supervisión y KPIs",
                descripcion:
                    "Supervisión consolidada de indicadores de gestión, métricas en tiempo real, solicitud de informes y consulta de resultados.",
                colorBorde: "#e65100",
                colorFondoBadge: "#fff3e0",
                colorTextoBadge: "#e65100",
                botonTexto: "Ingresar como Jefatura",
            },
        ];

        return (
            <main
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#F0F8FF",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        maxWidth: "900px",
                        width: "100%",
                        textAlign: "center",
                        marginBottom: "36px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "14px",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setPantallaActiva(null)}
                            style={{
                                background: "white",
                                border: "1px solid #ced4da",
                                borderRadius: "20px",
                                padding: "6px 14px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                color: "#0d47a1",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            }}
                        >
                            ← Volver al Portal de Inicio
                        </button>
                        <span
                            style={{
                                backgroundColor: "#e0f7fa",
                                color: "#006064",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "13px",
                                fontWeight: "bold",
                            }}
                        >
                            Portal de Empleados AquaChile
                        </span>
                    </div>

                    <h1 style={{ fontSize: "2.1rem", margin: "0 0 10px 0", color: "#1a1a1a" }}>
                        Selecciona tu Cargo Operativo
                    </h1>
                    <p style={{ margin: 0, color: "#555", fontSize: "15px" }}>
                        Ingresa a la pantalla dedicada correspondiente a tu perfil en el área de contratación y evaluación:
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "24px",
                        maxWidth: "1050px",
                        width: "100%",
                    }}
                >
                    {cargosEmpleados.map((c) => (
                        <article
                            key={c.id}
                            style={{
                                backgroundColor: "white",
                                borderRadius: "14px",
                                padding: "26px",
                                border: "2px solid #e0e0e0",
                                borderTop: `8px solid ${c.colorBorde}`,
                                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "20px",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                    <div style={{ fontSize: "2.4rem" }}>{c.icono}</div>
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            padding: "4px 10px",
                                            borderRadius: "12px",
                                            backgroundColor: c.colorFondoBadge,
                                            color: c.colorTextoBadge,
                                        }}
                                    >
                                        {c.badge}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: "1.3rem", margin: "0 0 10px 0", color: "#222" }}>
                                    {c.titulo}
                                </h2>
                                <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.55", margin: 0 }}>
                                    {c.descripcion}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPantallaActiva(c.id)}
                                style={{
                                    backgroundColor: c.colorBorde,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "12px 18px",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    width: "100%",
                                    transition: "opacity 0.2s ease",
                                    boxShadow: `0 4px 10px ${c.colorBorde}40`,
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                                {c.botonTexto} →
                            </button>
                        </article>
                    ))}
                </div>
            </main>
        );
    }

    // 4. Portal Principal de Inicio (Estructura Original de 2 Accesos)
    const portales = [
        {
            id: "empleados",
            titulo: "Portal de Empleados",
            icono: "👥",
            badge: "Equipo AquaChile",
            descripcion:
                "Espacio de trabajo para Reclutadores, Evaluadores y Jefaturas. Gestión de postulantes por cargo activo, entrevistas agendadas, catálogo de candidatos y evaluaciones psicolaborales.",
            colorBorde: "#0e97b3",
            colorFondoBadge: "#e0f7fa",
            colorTextoBadge: "#006064",
            botonTexto: "Ingresar como Empleado",
        },
        {
            id: "candidato",
            titulo: "Postulante a Trabajo",
            icono: "📝",
            badge: "Portal Público",
            descripcion:
                "Portal público de postulación: explora las vacantes abiertas de AquaChile, completa el formulario de postulación, adjunta tu currículum y obtén tu comprobante en tiempo real.",
            colorBorde: "#f57c00",
            colorFondoBadge: "#fff4e6",
            colorTextoBadge: "#e8590c",
            botonTexto: "Postular a un cargo",
        },
    ];

    return (
        <main
            style={{
                minHeight: "100vh",
                backgroundColor: "#F0F8FF",
                fontFamily: "Arial, Helvetica, sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    maxWidth: "800px",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "40px",
                }}
            >
                <div
                    style={{
                        display: "inline-block",
                        backgroundColor: "#e3f2fd",
                        color: "#0d47a1",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        marginBottom: "14px",
                    }}
                >
                    AquaChile · Aqua-Contratos
                </div>
                <h1 style={{ fontSize: "2.2rem", margin: "0 0 12px 0", color: "#1a1a1a" }}>
                    Portal de Acceso al Sistema
                </h1>
                <p style={{ margin: 0, color: "#555", fontSize: "16px" }}>
                    Selecciona tu perfil de acceso para ingresar al sistema de evaluación psicolaboral y selección:
                </p>
            </div>

            {/* Dos Accesos Principales: Empleados y Candidatos */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "28px",
                    maxWidth: "860px",
                    width: "100%",
                }}
            >
                {portales.map((p) => (
                    <article
                        key={p.id}
                        style={{
                            backgroundColor: "white",
                            borderRadius: "14px",
                            padding: "28px",
                            border: "2px solid #e0e0e0",
                            borderTop: `8px solid ${p.colorBorde}`,
                            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "20px",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                    >
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                <div style={{ fontSize: "2.5rem" }}>
                                    {p.icono}
                                </div>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        padding: "4px 10px",
                                        borderRadius: "12px",
                                        backgroundColor: p.colorFondoBadge,
                                        color: p.colorTextoBadge,
                                    }}
                                >
                                    {p.badge}
                                </span>
                            </div>

                            <h2 style={{ fontSize: "1.4rem", margin: "0 0 10px 0", color: "#222" }}>
                                {p.titulo}
                            </h2>
                            <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.55", margin: 0 }}>
                                {p.descripcion}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setPantallaActiva(p.id)}
                            style={{
                                backgroundColor: p.colorBorde,
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "14px 20px",
                                fontSize: "15px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: "100%",
                                transition: "opacity 0.2s ease, transform 0.1s ease",
                                boxShadow: `0 4px 10px ${p.colorBorde}40`,
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            {p.botonTexto} →
                        </button>
                    </article>
                ))}
            </div>
        </main>
    );
}

export default App;
