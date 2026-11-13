/**
 * Portal de Autenticación de Postulantes (B1: Crear Usuario Postulantes, B2: Inicio de sesión Postulantes)
 * Permite a los postulantes iniciar sesión con su correo o RUT + contraseña,
 * o crear una cuenta de forma ágil con sus datos básicos de identificación (RUT, Nombres, Apellidos, Email y Contraseña).
 */
import { useState } from "react";
import BotonOrange from "./BotonOrange";
import { NARANJA, NARANJA_OSCURO, NARANJA_CLARO } from "./Estilos";
import { calcularRut } from "../utils/calcularRut";
import {
    iniciarSesionPostulante,
    registrarCuentaPostulante,
    CANDIDATOS_BASE,
} from "../services/candidatosStorage";

function PortalAuthPostulante({ onAutenticado, onVolver }) {
    const [modo, setModo] = useState("login"); // "login" (B2) | "registro" (B1)
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);

    // Estado Inicio de Sesión (B2)
    const [identificador, setIdentificador] = useState("");
    const [passwordLogin, setPasswordLogin] = useState("");

    // Estado Crear Usuario Postulante simplificado (B1)
    const [registro, setRegistro] = useState({
        rutCuerpo: "",
        rutDv: "",
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        confirmarPassword: "",
    });

    const cambiarModo = (nuevoModo) => {
        setModo(nuevoModo);
        setError("");
    };

    const handleSeleccionarDemo = (candidatoDemo) => {
        setModo("login");
        setIdentificador(candidatoDemo.email);
        setPasswordLogin("password123");
        setError("");
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!identificador.trim() || !passwordLogin) {
            setError("Debes ingresar tu correo electrónico (o RUT) y tu contraseña.");
            return;
        }

        setCargando(true);
        try {
            const sesion = await iniciarSesionPostulante({
                identificador: identificador.trim(),
                password: passwordLogin,
            });
            onAutenticado(sesion);
        } catch (err) {
            setError(err.message || "No fue posible iniciar sesión. Verifica tus credenciales.");
        } finally {
            setCargando(false);
        }
    };

    const handleRegistroSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!calcularRut(registro.rutCuerpo, registro.rutDv)) {
            setError("El RUT ingresado no es válido según el algoritmo Módulo 11. Revisa el cuerpo y el dígito verificador.");
            return;
        }
        if (!registro.nombres.trim() || !registro.apellidos.trim()) {
            setError("Los nombres y apellidos son obligatorios.");
            return;
        }
        if (!registro.email.trim() || !registro.email.includes("@")) {
            setError("Debes ingresar un correo electrónico válido.");
            return;
        }
        if (!registro.password || registro.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (registro.password !== registro.confirmarPassword) {
            setError("Las contraseñas ingresadas no coinciden.");
            return;
        }

        const rutFormateado = `${registro.rutCuerpo}-${registro.rutDv}`;

        setCargando(true);
        try {
            const sesion = await registrarCuentaPostulante({
                rut: rutFormateado,
                nombres: registro.nombres.trim(),
                apellidos: registro.apellidos.trim(),
                email: registro.email.trim().toLowerCase(),
                password: registro.password,
            });
            onAutenticado(sesion);
        } catch (err) {
            setError(err.message || "Error al crear la cuenta de postulante.");
        } finally {
            setCargando(false);
        }
    };

    const rutCompleto = Boolean(registro.rutCuerpo && registro.rutDv);
    const rutValido = rutCompleto ? calcularRut(registro.rutCuerpo, registro.rutDv) : null;

    return (
        <main
            style={{
                backgroundColor: "#F0F8FF",
                fontFamily: "Arial, Helvetica, sans-serif",
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
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                    padding: "16px 20px",
                    marginBottom: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.2rem" }}>AquaChile · Aqua-Contratos</h1>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                        Portal de Postulantes · Acceso y Registro de Cuenta
                    </span>
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

            {/* Tarjeta de Autenticación (B1 / B2) */}
            <section
                style={{
                    width: "100%",
                    maxWidth: "720px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    borderTop: `6px solid ${NARANJA}`,
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                    overflow: "hidden",
                }}
            >
                {/* Pestañas Iniciar Sesión / Crear Usuario */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        borderBottom: "1px solid #e9ecef",
                        backgroundColor: "#fafafa",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => cambiarModo("login")}
                        style={{
                            padding: "16px",
                            border: "none",
                            backgroundColor: modo === "login" ? "white" : "transparent",
                            color: modo === "login" ? NARANJA_OSCURO : "#6c757d",
                            fontWeight: "bold",
                            fontSize: "15px",
                            borderBottom: modo === "login" ? `3px solid ${NARANJA}` : "3px solid transparent",
                            cursor: "pointer",
                        }}
                    >
                        🔑 Iniciar Sesión Postulante
                    </button>
                    <button
                        type="button"
                        onClick={() => cambiarModo("registro")}
                        style={{
                            padding: "16px",
                            border: "none",
                            backgroundColor: modo === "registro" ? "white" : "transparent",
                            color: modo === "registro" ? NARANJA_OSCURO : "#6c757d",
                            fontWeight: "bold",
                            fontSize: "15px",
                            borderBottom: modo === "registro" ? `3px solid ${NARANJA}` : "3px solid transparent",
                            cursor: "pointer",
                        }}
                    >
                        📝 Crear Usuario Postulante
                    </button>
                </div>

                <div style={{ padding: "24px" }}>
                    {error && (
                        <div
                            className="form-error-mensaje"
                            role="alert"
                            style={{ marginBottom: "18px" }}
                        >
                            <strong>⚠️ Atención: </strong>
                            {error}
                        </div>
                    )}

                    {modo === "login" ? (
                        /* ==================== VISTA B2: INICIO DE SESIÓN POSTULANTES ==================== */
                        <div>
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ margin: "0 0 6px 0", fontSize: "1.35rem", color: "#212529" }}>
                                    Ingresa a tu Cuenta de Postulante
                                </h2>
                                <p style={{ margin: 0, fontSize: "13.5px", color: "#6c757d" }}>
                                    Accede con tu correo electrónico o RUT y contraseña para postular a las ofertas de AquaChile y revisar tus postulaciones en curso.
                                </p>
                            </div>

                            <form onSubmit={handleLoginSubmit}>
                                <div className="form-grid" style={{ marginBottom: "18px" }}>
                                    <div className="form-grupo form-col-span-2">
                                        <label htmlFor="login-identificador">
                                            Correo Electrónico o RUT *
                                        </label>
                                        <input
                                            id="login-identificador"
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej. luis.mancilla@gmail.com o 21.756.200-7"
                                            value={identificador}
                                            onChange={(e) => {
                                                setIdentificador(e.target.value);
                                                setError("");
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="form-grupo form-col-span-2">
                                        <label htmlFor="login-password">Contraseña *</label>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <input
                                                id="login-password"
                                                type={mostrarPassword ? "text" : "password"}
                                                className="form-input"
                                                style={{ flex: 1 }}
                                                placeholder="Ingresa tu contraseña"
                                                value={passwordLogin}
                                                onChange={(e) => {
                                                    setPasswordLogin(e.target.value);
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
                                    <button
                                        type="button"
                                        className="boton-secundario"
                                        onClick={() => cambiarModo("registro")}
                                    >
                                        ¿No tienes cuenta? Crear usuario
                                    </button>
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
                                <div style={{ fontSize: "12.5px", fontWeight: "bold", color: NARANJA_OSCURO, marginBottom: "8px" }}>
                                    ⚡ Cuentas de Postulantes registradas (Clic para autocompletar · Contraseña: password123):
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {CANDIDATOS_BASE.slice(0, 4).map((cand) => (
                                        <button
                                            key={cand.id}
                                            type="button"
                                            onClick={() => handleSeleccionarDemo(cand)}
                                            style={{
                                                fontSize: "12px",
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                border: "1px solid #ffd8a8",
                                                backgroundColor: "white",
                                                color: "#333",
                                                cursor: "pointer",
                                                fontWeight: "600",
                                            }}
                                        >
                                            👤 {cand.nombres} {cand.apellidos} ({cand.rut})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ==================== VISTA B1: CREAR USUARIO POSTULANTE (DATOS SIMPLES DE CUENTA) ==================== */
                        <div>
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ margin: "0 0 6px 0", fontSize: "1.35rem", color: "#212529" }}>
                                    Crear Cuenta de Postulante
                                </h2>
                                <p style={{ margin: 0, fontSize: "13.5px", color: "#6c757d" }}>
                                    Regístrate con tus datos básicos para crear tu cuenta. Tu currículum y datos complementarios solo se solicitarán al momento de postular.
                                </p>
                            </div>

                            <form onSubmit={handleRegistroSubmit}>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                                        gap: "16px",
                                    }}
                                >
                                    {/* RUT dividido en cuerpo y verificador */}
                                    <div className="form-grupo">
                                        <label htmlFor="registro-rut-cuerpo">RUT *</label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <input
                                                id="registro-rut-cuerpo"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="12345678"
                                                maxLength={8}
                                                className="form-input"
                                                style={{ flex: 1, minWidth: 0 }}
                                                value={registro.rutCuerpo}
                                                onChange={(e) => {
                                                    setRegistro((prev) => ({
                                                        ...prev,
                                                        rutCuerpo: e.target.value.replace(/\D/g, "").slice(0, 8),
                                                    }));
                                                    setError("");
                                                }}
                                                required
                                            />
                                            <span>-</span>
                                            <input
                                                id="registro-rut-dv"
                                                type="text"
                                                placeholder="K"
                                                maxLength={1}
                                                aria-label="Dígito verificador"
                                                className="form-input"
                                                style={{ width: "52px", textAlign: "center" }}
                                                value={registro.rutDv}
                                                onChange={(e) => {
                                                    setRegistro((prev) => ({
                                                        ...prev,
                                                        rutDv: e.target.value
                                                            .replace(/[^0-9kK]/g, "")
                                                            .toUpperCase()
                                                            .slice(0, 1),
                                                    }));
                                                    setError("");
                                                }}
                                                required
                                            />
                                        </div>
                                        {rutCompleto && (
                                            <div style={{ marginTop: "4px" }}>
                                                {rutValido ? (
                                                    <span style={{ color: "#198754", fontSize: "12px", fontWeight: "bold" }}>
                                                        ✓ RUT válido (Módulo 11)
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#dc3545", fontSize: "12px", fontWeight: "bold" }}>
                                                        ✕ Dígito verificador incorrecto
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="form-grupo">
                                        <label htmlFor="registro-email">Correo Electrónico (E-mail) *</label>
                                        <input
                                            id="registro-email"
                                            type="email"
                                            className="form-input"
                                            placeholder="Ej. rafael.munoz@gmail.com"
                                            value={registro.email}
                                            onChange={(e) =>
                                                setRegistro((prev) => ({ ...prev, email: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>

                                    {/* Nombres */}
                                    <div className="form-grupo">
                                        <label htmlFor="registro-nombres">Nombres *</label>
                                        <input
                                            id="registro-nombres"
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej. Rafael Andrés"
                                            value={registro.nombres}
                                            onChange={(e) =>
                                                setRegistro((prev) => ({ ...prev, nombres: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>

                                    {/* Apellidos */}
                                    <div className="form-grupo">
                                        <label htmlFor="registro-apellidos">Apellidos *</label>
                                        <input
                                            id="registro-apellidos"
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej. Muñoz Soto"
                                            value={registro.apellidos}
                                            onChange={(e) =>
                                                setRegistro((prev) => ({ ...prev, apellidos: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>

                                    {/* Contraseña */}
                                    <div className="form-grupo">
                                        <label htmlFor="registro-password">Contraseña * (mín. 6 caracteres)</label>
                                        <input
                                            id="registro-password"
                                            type={mostrarPassword ? "text" : "password"}
                                            className="form-input"
                                            placeholder="Crea una contraseña segura"
                                            value={registro.password}
                                            onChange={(e) =>
                                                setRegistro((prev) => ({ ...prev, password: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    <div className="form-grupo">
                                        <label htmlFor="registro-confirmar-password">Confirmar Contraseña *</label>
                                        <input
                                            id="registro-confirmar-password"
                                            type={mostrarPassword ? "text" : "password"}
                                            className="form-input"
                                            placeholder="Repite tu contraseña"
                                            value={registro.confirmarPassword}
                                            onChange={(e) =>
                                                setRegistro((prev) => ({
                                                    ...prev,
                                                    confirmarPassword: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "22px", flexWrap: "wrap" }}>
                                    <BotonOrange
                                        type="submit"
                                        texto={cargando ? "Creando cuenta..." : "Registrar Cuenta de Postulante"}
                                        disabled={cargando}
                                    />
                                    <button
                                        type="button"
                                        className="boton-secundario"
                                        onClick={() => cambiarModo("login")}
                                    >
                                        Ya tengo cuenta · Iniciar Sesión
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default PortalAuthPostulante;
