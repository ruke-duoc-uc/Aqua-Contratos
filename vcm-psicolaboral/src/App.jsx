import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AnalistaPage from "./pages/AnalistaPage.jsx";
import EvaluadorPage from "./pages/EvaluadorPage.jsx";
import JefaturaPage from "./pages/JefaturaPage.jsx";
import CandidatoPage from "./pages/CandidatoPage.jsx";
// Portal de acceso para funcionarios internos (reemplaza al antiguo selector de cargo).
import PortalLoginEmpleado from "./components/PortalLoginEmpleado.jsx";
// Sesión de empleados y mapa rol → ruta (independiente del flujo de postulantes).
import {
    obtenerSesionEmpleado,
    cerrarSesionEmpleado,
    RUTA_POR_ROL,
} from "./services/empleadosStorage.js";

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
                            className="card w-100 shadow-sm d-flex flex-column justify-content-between p-4"
                            style={{
                                borderRadius: "14px",
                                border: "none",
                                borderTop: `8px solid ${p.colorBorde}`,
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
 * 2. Portal de Empleados: login de funcionarios internos.
 *
 * Si ya existe una sesión de empleado válida se salta el formulario y se
 * redirige a la pantalla del rol correspondiente. Tras autenticarse, se
 * enruta según `usuario.rol` (analista / evaluador / jefatura).
 */
function PortalEmpleadosRoute() {
    const navigate = useNavigate();
    const sesion = obtenerSesionEmpleado();

    // Sesión previa → directo a su pantalla (evita volver a pedir credenciales).
    if (sesion?.usuario && RUTA_POR_ROL[sesion.usuario.rol]) {
        return <Navigate to={RUTA_POR_ROL[sesion.usuario.rol]} replace />;
    }

    // Al iniciar sesión, `iniciarSesionEmpleado` ya guardó la sesión; aquí solo
    // se decide el destino según el rol devuelto por la API.
    const alAutenticar = (nuevaSesion) => {
        const destino = RUTA_POR_ROL[nuevaSesion?.usuario?.rol] || "/empleados";
        navigate(destino, { replace: true });
    };

    return (
        <PortalLoginEmpleado
            onAutenticado={alAutenticar}
            onVolver={() => navigate("/")}
        />
    );
}

/**
 * 3. Envolturas de rutas para roles con navegación React Router.
 *
 * Cada ruta de empleado está PROTEGIDA: sin una sesión de empleado con el rol
 * correcto se redirige al login (/empleados). El botón "Salir al Portal" de las
 * pantallas cierra la sesión y devuelve al Portal de Inicio (/).
 */
function RutaEmpleadoProtegida({ rol, Componente }) {
    const navigate = useNavigate();
    const sesion = obtenerSesionEmpleado();

    // Sin sesión, o sesión de otro rol → de vuelta al login de empleados.
    if (!sesion?.usuario || sesion.usuario.rol !== rol) {
        return <Navigate to="/empleados" replace />;
    }

    // "Salir al Portal": cerrar sesión y volver al inicio.
    const salir = () => {
        cerrarSesionEmpleado();
        navigate("/");
    };

    return <Componente onVolver={salir} />;
}

function AnalistaRoute() {
    return <RutaEmpleadoProtegida rol="analista" Componente={AnalistaPage} />;
}

function EvaluadorRoute() {
    return <RutaEmpleadoProtegida rol="evaluador" Componente={EvaluadorPage} />;
}

function JefaturaRoute() {
    return <RutaEmpleadoProtegida rol="jefatura" Componente={JefaturaPage} />;
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

                {/* 2. Portal de Empleados (Login de funcionarios internos) */}
                <Route path="/empleados" element={<PortalEmpleadosRoute />} />

                {/* 3. Pantallas Dedicadas por Cargo (rutas protegidas por sesión) */}
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
