/**
 * Portal de Autenticación de EMPLEADOS (B2: Inicio de sesión de funcionarios internos)
 *
 * Reemplaza al antiguo selector de cargo (`EmpleadosSeleccion`). Ahora los
 * funcionarios de AquaChile (Analista de Reclutamiento, Profesional Evaluador y
 * Jefe de Área) deben autenticarse con su correo corporativo y contraseña.
 *
 * Al autenticarse, `App.jsx` redirige a la pantalla correspondiente según el
 * rol devuelto por la API (`usuario.rol`).
 *
 * Estilo: reutiliza el naranja de marca (Estilos.jsx) para mantener coherencia
 * con el Portal de Postulantes.
 */
import { useState } from "react";
import BotonOrange from "./BotonOrange";
import Icono from "./Icono";
import LogoAquaChile from "./LogoAquaChile";
import { NARANJA, NARANJA_OSCURO, NARANJA_CLARO, AZUL_MARINO_AQUA } from "./Estilos";
import { iniciarSesionEmpleado } from "../services/empleadosStorage";

/**
 * Cuentas semilla de empleados para la demostración.
 * Coinciden con `USUARIOS_SEED` del backend (password123 para todas).
 */
const CUENTAS_DEMO_EMPLEADOS = [
    { email: "analista@aquachile.cl", etiqueta: "Analista de Reclutamiento" },
    { email: "evaluador@aquachile.cl", etiqueta: "Profesional Evaluador" },
    { email: "jefe@aquachile.cl", etiqueta: "Jefe Área Sistemas y TI" },
    { email: "jefe.mantenimiento@aquachile.cl", etiqueta: "Jefe Área Mantenimiento" },
];

function PortalLoginEmpleado({ onAutenticado, onVolver }) {
    // Estado del formulario.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    /** Autocompleta el formulario con una cuenta de demostración. */
    const handleSeleccionarDemo = (cuentaDemo) => {
        setEmail(cuentaDemo.email);
        setPassword("password123");
        setError("");
    };

    /** Envía las credenciales al backend y delega el enrutado a App.jsx. */
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Debes ingresar tu correo corporativo y tu contraseña.");
            return;
        }

        setCargando(true);
        try {
            const sesion = await iniciarSesionEmpleado({
                email: email.trim(),
                password,
            });
            // `onAutenticado` lo entrega App.jsx: redirige según `usuario.rol`.
            onAutenticado(sesion);
        } catch (err) {
            setError(err.message || "No fue posible iniciar sesión. Verifica tus credenciales.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <main
            style={{
                backgroundColor: "#f3f6f9",
                fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                padding: "24px 16px",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {/* Barra superior */}
            <header
                style={{
                    width: "100%",
                    maxWidth: "720px",
                    backgroundColor: "white",
                    borderRadius: "10px",
                    borderTop: `4px solid ${AZUL_MARINO_AQUA}`,
                    boxShadow: "0 3px 10px rgba(34, 59, 76, 0.06)",
                    padding: "14px 20px",
                    marginBottom: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <LogoAquaChile height={42} />
                    <div style={{ borderLeft: "2px solid #dbe3eb", paddingLeft: "12px" }}>
                        <h1 style={{ margin: 0, fontSize: "1.1rem", color: "#223b4c" }}>AquaChile · Aqua-Contratos</h1>
                        <span style={{ fontSize: "12px", color: "#5c7485" }}>
                            Portal de Empleados · Acceso de Funcionarios
                        </span>
                    </div>
                </div>

                {onVolver && (
                    <button
                        type="button"
                        className="boton-secundario"
                        onClick={onVolver}
                        title="Volver al portal de inicio"
                    >
                        ← Volver al Portal de Inicio
                    </button>
                )}
            </header>

            {/* Tarjeta de inicio de sesión */}
            <section
                style={{
                    width: "100%",
                    maxWidth: "720px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    borderTop: `6px solid ${AZUL_MARINO_AQUA}`,
                    boxShadow: "0 4px 14px rgba(34, 59, 76, 0.08)",
                    overflow: "hidden",
                }}
            >
                <div style={{ padding: "24px" }}>
                    {/* Encabezado de la tarjeta */}
                    <div style={{ marginBottom: "20px" }}>
                        <h2 style={{ margin: "0 0 6px 0", fontSize: "1.35rem", color: "#212529" }}>
                            Inicia Sesión como Empleado
                        </h2>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "#6c757d" }}>
                            Accede con tu correo corporativo de AquaChile y tu contraseña. El sistema
                            te llevará automáticamente a tu pantalla de trabajo según tu cargo.
                        </p>
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div
                            className="form-error-mensaje"
                            role="alert"
                            style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <Icono nombre="alert" size={16} />
                            <span><strong>Atención: </strong>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit} noValidate>
                        <div className="form-grid" style={{ marginBottom: "18px" }}>
                            {/* Correo corporativo */}
                            <div className="form-grupo form-col-span-2">
                                <label htmlFor="empleado-login-email">
                                    Correo Electrónico Corporativo *
                                </label>
                                <input
                                    id="empleado-login-email"
                                    type="email"
                                    className="form-input"
                                    placeholder="Ej. analista@aquachile.cl"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    required
                                />
                            </div>

                            {/* Contraseña */}
                            <div className="form-grupo form-col-span-2">
                                <label htmlFor="empleado-login-password">Contraseña *</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        id="empleado-login-password"
                                        type={mostrarPassword ? "text" : "password"}
                                        className="form-input"
                                        style={{ flex: 1 }}
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="boton-secundario"
                                        onClick={() => setMostrarPassword((v) => !v)}
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        {mostrarPassword ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <BotonOrange
                                type="submit"
                                texto={cargando ? "Verificando credenciales..." : "Iniciar Sesión →"}
                                disabled={cargando}
                            />
                        </div>
                    </form>

                    {/* Acceso rápido con cuentas semilla para demostración */}
                    <div
                        style={{
                            marginTop: "28px",
                            padding: "16px",
                            backgroundColor: "#fff8f1",
                            border: `1px solid ${NARANJA_CLARO}`,
                            borderRadius: "8px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "12.5px",
                                fontWeight: "bold",
                                color: NARANJA_OSCURO,
                                marginBottom: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <Icono nombre="zap" size={15} />
                            Cuentas de Empleados de demostración (Clic para autocompletar · Contraseña: password123):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {CUENTAS_DEMO_EMPLEADOS.map((cuenta) => (
                                <button
                                    key={cuenta.email}
                                    type="button"
                                    onClick={() => handleSeleccionarDemo(cuenta)}
                                    style={{
                                        fontSize: "12px",
                                        padding: "6px 10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ffd8a8",
                                        backgroundColor: "white",
                                        color: "#333",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <Icono nombre="user" size={13} color={NARANJA_OSCURO} />
                                    {cuenta.etiqueta} ({cuenta.email})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default PortalLoginEmpleado;
