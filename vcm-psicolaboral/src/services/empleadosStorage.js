/**
 * Almacenamiento y sesión de los EMPLEADOS de AquaChile
 * (Analista de Reclutamiento, Profesional Evaluador y Jefe de Área).
 *
 * IMPORTANTE: este módulo es independiente del flujo de postulantes
 * (ver `services/candidatosStorage.js`). Usa su propia clave de localStorage
 * para no mezclar sesiones ni chocar con la lógica pública de postulación.
 */
import { api } from "./api";

/**
 * Clave de localStorage exclusiva para la sesión de empleados.
 * Distinta de la sesión de postulantes para que ambas puedan coexistir.
 */
const STORAGE_KEY_SESION_EMPLEADO = "aqua_sesion_empleado";

/**
 * Roles que pueden entrar por el Portal de Empleados.
 * Deben calzar con `ROLES_USUARIO` del backend (models.js), excluyendo
 * "candidato" (ese rol usa el Portal de Postulantes).
 */
export const ROLES_EMPLEADO = ["analista", "evaluador", "jefatura"];

/**
 * Ruta del frontend a la que se envía cada rol después de iniciar sesión.
 * La usa `App.jsx` para redirigir tras un login exitoso.
 */
export const RUTA_POR_ROL = {
    analista: "/analista",
    evaluador: "/evaluador",
    jefatura: "/jefatura",
};

/**
 * Devuelve la sesión de empleado guardada, o `null` si no existe / está corrupta.
 */
export function obtenerSesionEmpleado() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SESION_EMPLEADO);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        // Si el JSON está corrupto simplemente se considera que no hay sesión.
        return null;
    }
}

/**
 * Persiste la sesión del empleado en localStorage.
 * @param {{ usuario: object, desdeBackend: boolean }} sesion
 */
export function guardarSesionEmpleado(sesion) {
    try {
        localStorage.setItem(STORAGE_KEY_SESION_EMPLEADO, JSON.stringify(sesion));
    } catch {
        // Ignorar: si el navegador bloquea localStorage, la app sigue funcionando en memoria.
    }
}

/**
 * Elimina la sesión de empleado (equivale a "cerrar sesión").
 */
export function cerrarSesionEmpleado() {
    try {
        localStorage.removeItem(STORAGE_KEY_SESION_EMPLEADO);
    } catch {
        // Ignorar.
    }
}

/**
 * B2 (Empleados): Inicio de sesión de funcionarios internos.
 *
 * Flujo:
 *   1. Llama a `POST /api/auth/login` con el correo corporativo y la contraseña.
 *   2. Rechaza cuentas de postulante (rol "candidato") con un mensaje espejo
 *      al que usa el Portal de Postulantes.
 *   3. Valida que el rol sea uno de `ROLES_EMPLEADO`.
 *   4. Guarda y devuelve la sesión.
 *
 * @param {{ email: string, password: string }} credenciales
 * @returns {Promise<{ usuario: object, desdeBackend: boolean }>}
 */
export async function iniciarSesionEmpleado({ email, password }) {
    const emailLimpio = (email || "").trim().toLowerCase();

    // Validación básica antes de golpear la API.
    if (!emailLimpio || !password) {
        throw new Error("Debes ingresar tu correo corporativo y tu contraseña.");
    }

    // `api.login` devuelve { usuario, perfilCandidato }.
    const respuesta = await api.login({
        identificador: emailLimpio,
        email: emailLimpio,
        password,
    });

    const usuario = respuesta?.usuario;

    if (!usuario) {
        throw new Error("No fue posible validar las credenciales ingresadas.");
    }

    // Un postulante no puede entrar por el Portal de Empleados.
    if (usuario.rol === "candidato") {
        throw new Error(
            "Esta cuenta pertenece al Portal de Postulantes. Ingresa con tu cuenta de postulante."
        );
    }

    // Solo los roles internos tienen acceso al Portal de Empleados.
    if (!ROLES_EMPLEADO.includes(usuario.rol)) {
        throw new Error("Tu cuenta no tiene permisos para acceder al Portal de Empleados.");
    }

    const sesion = {
        usuario,
        desdeBackend: true,
    };

    guardarSesionEmpleado(sesion);
    return sesion;
}
