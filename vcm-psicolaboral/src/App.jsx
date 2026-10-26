import { useState } from "react";
import EmpleadosPage from "./pages/EmpleadosPage";
import CandidatoPage from "./pages/CandidatoPage";

function App() {
    // Pantalla activa: null (Portal inicial), "empleados", "candidato"
    const [pantallaActiva, setPantallaActiva] = useState(null);

    if (pantallaActiva === "empleados" || pantallaActiva === "analista" || pantallaActiva === "evaluador" || pantallaActiva === "jefatura") {
        return (
            <EmpleadosPage
                rolInicial={pantallaActiva === "empleados" ? "analista" : pantallaActiva}
                onVolver={() => setPantallaActiva(null)}
            />
        );
    }

    if (pantallaActiva === "candidato") {
        return <CandidatoPage onVolver={() => setPantallaActiva(null)} />;
    }

    const portales = [
        {
            id: "empleados",
            titulo: "Portal de Empleados",
            icono: "👥",
            badge: "Equipo AquaChile",
            descripcion:
                "Espacio de trabajo unificado para Reclutadores, Evaluadores y Jefaturas. Gestión de postulantes por cargo activo, entrevistas agendadas, catálogo de candidatos y evaluaciones psicolaborales.",
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
                            border: `2px solid #e0e0e0`,
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
