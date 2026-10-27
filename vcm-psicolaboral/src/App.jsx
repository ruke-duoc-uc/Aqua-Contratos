import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AnalistaPage from "./pages/AnalistaPage";
import EvaluadorPage from "./pages/EvaluadorPage";
import JefaturaPage from "./pages/JefaturaPage";
import CandidatoPage from "./pages/CandidatoPage";

/**
 * 1. Portal Principal de Inicio (2 Accesos Principales: Empleados y Candidatos)
 */
function PortalHome() {
    const navigate = useNavigate();

    const portales = [
        {
            id: "empleados",
            titulo: "Portal de Empleados",
            icono: "👥",
            badge: "Equipo AquaChile",
            ruta: "/empleados",
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
            ruta: "/candidato",
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
            className="container-fluid d-flex flex-column align-items-center justify-content-center py-5"
            style={{
                minHeight: "100vh",
                backgroundColor: "#F0F8FF",
                fontFamily: "Arial, Helvetica, sans-serif",
            }}
        >
            <div className="text-center mb-4" style={{ maxWidth: "800px", width: "100%" }}>
                <div
                    className="badge mb-3 px-3 py-2"
                    style={{
                        backgroundColor: "#e3f2fd",
                        color: "#0d47a1",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                    }}
                >
                    AquaChile · Aqua-Contratos
                </div>
                <h1 className="fw-bold mb-2 text-dark" style={{ fontSize: "2.2rem" }}>
                    Portal de Acceso al Sistema
                </h1>
                <p className="text-muted fs-6 mb-0">
                    Selecciona tu perfil de acceso para ingresar al sistema de evaluación psicolaboral y selección:
                </p>
            </div>

            <div className="row g-4 justify-content-center" style={{ maxWidth: "860px", width: "100%" }}>
                {portales.map((p) => (
                    <div key={p.id} className="col-12 col-md-6 d-flex">
                        <article
                            className="card w-100 shadow-sm border-0 d-flex flex-column justify-content-between p-4"
                            style={{
                                borderRadius: "14px",
                                borderTop: `8px solid ${p.colorBorde} !important`,
                                backgroundColor: "white",
                            }}
                        >
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div style={{ fontSize: "2.5rem" }}>{p.icono}</div>
                                    <span
                                        className="badge"
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            padding: "6px 12px",
                                            borderRadius: "12px",
                                            backgroundColor: p.colorFondoBadge,
                                            color: p.colorTextoBadge,
                                        }}
                                    >
                                        {p.badge}
                                    </span>
                                </div>

                                <h2 className="fs-4 fw-bold text-dark mb-2">{p.titulo}</h2>
                                <p className="text-secondary small mb-4" style={{ lineHeight: "1.6" }}>
                                    {p.descripcion}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate(p.ruta)}
                                className="btn w-100 fw-bold py-2 text-white shadow-sm"
                                style={{
                                    backgroundColor: p.colorBorde,
                                    borderColor: p.colorBorde,
                                    borderRadius: "8px",
                                    fontSize: "15px",
                                }}
                            >
                                {p.botonTexto} →
                            </button>
                        </article>
                    </div>
                ))}
            </div>
        </main>
    );
}

/**
 * 2. Vista de Selección de Cargo dentro del Portal de Empleados
 */
function EmpleadosSeleccion() {
    const navigate = useNavigate();

    const cargosEmpleados = [
        {
            id: "analista",
            titulo: "Analista de Reclutamiento",
            icono: "👤",
            badge: "Reclutamiento y Selección",
            ruta: "/analista",
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
            ruta: "/evaluador",
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
            ruta: "/jefatura",
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
            className="container-fluid d-flex flex-column align-items-center justify-content-center py-5"
            style={{
                minHeight: "100vh",
                backgroundColor: "#F0F8FF",
                fontFamily: "Arial, Helvetica, sans-serif",
            }}
        >
            <div className="text-center mb-4" style={{ maxWidth: "900px", width: "100%" }}>
                <div className="d-flex justify-content-center align-items-center gap-2 mb-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="btn btn-outline-secondary btn-sm bg-white shadow-sm px-3 py-1"
                        style={{ borderRadius: "20px", fontWeight: "600", color: "#0d47a1" }}
                    >
                        ← Volver al Portal de Inicio
                    </button>
                    <span
                        className="badge px-3 py-2"
                        style={{
                            backgroundColor: "#e0f7fa",
                            color: "#006064",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "bold",
                        }}
                    >
                        Portal de Empleados AquaChile
                    </span>
                </div>

                <h1 className="fw-bold mb-2 text-dark" style={{ fontSize: "2.1rem" }}>
                    Selecciona tu Cargo Operativo
                </h1>
                <p className="text-muted fs-6 mb-0">
                    Ingresa a la pantalla dedicada correspondiente a tu perfil en el área de contratación y evaluación:
                </p>
            </div>

            <div className="row g-4 justify-content-center" style={{ maxWidth: "1050px", width: "100%" }}>
                {cargosEmpleados.map((c) => (
                    <div key={c.id} className="col-12 col-md-6 col-lg-4 d-flex">
                        <article
                            className="card w-100 shadow-sm border-0 d-flex flex-column justify-content-between p-4"
                            style={{
                                borderRadius: "14px",
                                borderTop: `8px solid ${c.colorBorde} !important`,
                                backgroundColor: "white",
                            }}
                        >
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div style={{ fontSize: "2.4rem" }}>{c.icono}</div>
                                    <span
                                        className="badge"
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            padding: "6px 10px",
                                            borderRadius: "12px",
                                            backgroundColor: c.colorFondoBadge,
                                            color: c.colorTextoBadge,
                                        }}
                                    >
                                        {c.badge}
                                    </span>
                                </div>
                                <h2 className="fs-5 fw-bold text-dark mb-2">{c.titulo}</h2>
                                <p className="text-secondary small mb-4" style={{ lineHeight: "1.55" }}>
                                    {c.descripcion}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate(c.ruta)}
                                className="btn w-100 fw-bold py-2 text-white shadow-sm"
                                style={{
                                    backgroundColor: c.colorBorde,
                                    borderColor: c.colorBorde,
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                }}
                            >
                                {c.botonTexto} →
                            </button>
                        </article>
                    </div>
                ))}
            </div>
        </main>
    );
}

/**
 * 3. Envolturas de rutas para roles con navegación React Router
 */
function AnalistaRoute() {
    const navigate = useNavigate();
    return <AnalistaPage onVolver={() => navigate("/empleados")} />;
}

function EvaluadorRoute() {
    const navigate = useNavigate();
    return <EvaluadorPage onVolver={() => navigate("/empleados")} />;
}

function JefaturaRoute() {
    const navigate = useNavigate();
    return <JefaturaPage onVolver={() => navigate("/empleados")} />;
}

function CandidatoRoute() {
    const navigate = useNavigate();
    return <CandidatoPage onVolver={() => navigate("/")} />;
}

/**
 * Componente Principal con Router
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Portal de Inicio */}
                <Route path="/" element={<PortalHome />} />

                {/* 2. Portal de Empleados (Selector de Cargo) */}
                <Route path="/empleados" element={<EmpleadosSeleccion />} />

                {/* 3. Pantallas Dedicadas por Cargo */}
                <Route path="/analista" element={<AnalistaRoute />} />
                <Route path="/evaluador" element={<EvaluadorRoute />} />
                <Route path="/jefatura" element={<JefaturaRoute />} />

                {/* 4. Portal Público de Candidatos */}
                <Route path="/candidato" element={<CandidatoRoute />} />
                <Route path="/postular" element={<CandidatoRoute />} />

                {/* 5. Fallback para cualquier ruta no reconocida */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
