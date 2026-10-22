import { useState } from "react";
import AnalistaPage from "./pages/AnalistaPage";
import EvaluadorPage from "./pages/EvaluadorPage";
import JefaturaPage from "./pages/JefaturaPage";
import CandidatoPage from "./pages/CandidatoPage";

function App() {
    // Pantalla activa: null (Portal inicial), "analista", "evaluador", "jefatura", "candidato"
    const [pantallaActiva, setPantallaActiva] = useState(null);
    const [mensajeNuevoUsuario, setMensajeNuevoUsuario] = useState(false);

    if (pantallaActiva === "analista") {
        return <AnalistaPage onVolver={() => setPantallaActiva(null)} />;
    }

    if (pantallaActiva === "evaluador") {
        return <EvaluadorPage onVolver={() => setPantallaActiva(null)} />;
    }

    if (pantallaActiva === "jefatura") {
        return <JefaturaPage onVolver={() => setPantallaActiva(null)} />;
    }

    if (pantallaActiva === "candidato") {
        return <CandidatoPage onVolver={() => setPantallaActiva(null)} />;
    }

    const usuarios = [
        {
            id: "analista",
            titulo: "Analista de Reclutamiento",
            icono: "👤",
            descripcion: "Creación y administración de candidatos, emisión de nuevas solicitudes de evaluación y seguimiento operativo.",
            colorBorde: "#0e97b3",
            colorFondoBadge: "#e0f7fa",
            colorTextoBadge: "#006064",
            botonTexto: "Ingresar como Analista",
        },
        {
            id: "evaluador",
            titulo: "Profesional Evaluador",
            icono: "📋",
            descripcion: "Revisión de postulantes asignados, actualización de estados del proceso y registro del dictamen psicolaboral.",
            colorBorde: "#2e7d32",
            colorFondoBadge: "#e8f5e9",
            colorTextoBadge: "#1b5e20",
            botonTexto: "Ingresar como Evaluador",
        },
        {
            id: "jefatura",
            titulo: "Jefe de Área",
            icono: "📊",
            descripcion: "Supervisión consolidada de indicadores de gestión, métricas en tiempo real y consulta de evaluaciones en modo lectura.",
            colorBorde: "#e65100",
            colorFondoBadge: "#fff3e0",
            colorTextoBadge: "#e65100",
            botonTexto: "Ingresar como Jefatura",
        },
        {
            id: "candidato",
            titulo: "Postulante a Trabajo",
            icono: "📝",
            descripcion: "Portal público de postulación: explora las vacantes abiertas, completa el formulario y adjunta tu currículum. Sin necesidad de registro.",
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
                padding: "30px 20px",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    maxWidth: "960px",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "36px",
                }}
            >
                <div
                    style={{
                        display: "inline-block",
                        backgroundColor: "#e3f2fd",
                        color: "#0d47a1",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        marginBottom: "12px",
                    }}
                >
                    AquaChile · Aqua-Contratos
                </div>
                <h1 style={{ fontSize: "2rem", margin: "0 0 10px 0", color: "#1a1a1a" }}>
                    Portal de Selección de Usuario
                </h1>
                <p style={{ margin: 0, color: "#666", fontSize: "15px" }}>
                    Selecciona una pantalla dedicada para acceder al espacio de trabajo correspondiente a tu rol:
                </p>
            </div>

            {/* Rejilla de Pantallas Dedicadas */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px",
                    maxWidth: "1200px",
                    width: "100%",
                    marginBottom: "30px",
                }}
            >
                {usuarios.map((u) => (
                    <article
                        key={u.id}
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "24px",
                            border: `2px solid #e0e0e0`,
                            borderTop: `6px solid ${u.colorBorde}`,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                    >
                        <div>
                            <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>
                                {u.icono}
                            </div>
                            <h2 style={{ fontSize: "1.25rem", margin: "0 0 10px 0", color: "#222" }}>
                                {u.titulo}
                            </h2>
                            <p style={{ fontSize: "13.5px", color: "#555", lineHeight: "1.5", margin: "0 0 20px 0" }}>
                                {u.descripcion}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setPantallaActiva(u.id)}
                            style={{
                                backgroundColor: u.colorBorde,
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "12px 18px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: "100%",
                                transition: "opacity 0.2s ease",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            {u.botonTexto} →
                        </button>
                    </article>
                ))}
            </div>

            {/* Sección de Nuevo Usuario (Botón reservado para avance futuro) */}
            <div
                style={{
                    maxWidth: "960px",
                    width: "100%",
                    borderTop: "1px dashed #ced4da",
                    paddingTop: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <button
                    type="button"
                    onClick={() => setMensajeNuevoUsuario(true)}
                    style={{
                        backgroundColor: "#f8f9fa",
                        color: "#495057",
                        border: "2px dashed #6c757d",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#e9ecef";
                        e.currentTarget.style.borderColor = "#343a40";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.borderColor = "#6c757d";
                    }}
                    title="Módulo preparado para registrar o habilitar un nuevo usuario"
                >
                    <span style={{ fontSize: "18px" }}>➕</span>
                    <span>+ Nuevo Usuario (Próximamente)</span>
                </button>

                {mensajeNuevoUsuario && (
                    <div
                        style={{
                            backgroundColor: "#fff3cd",
                            color: "#664d03",
                            border: "1px solid #ffecb5",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <span>ℹ️ El botón está reservado para avanzar la integración de nuevos usuarios más adelante.</span>
                        <button
                            type="button"
                            onClick={() => setMensajeNuevoUsuario(false)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold",
                                color: "#664d03",
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

export default App;