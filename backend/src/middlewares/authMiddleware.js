/**
 * Middleware de Autenticación y Autorización por Rol (JWT)
 * Valida la existencia y firma del JSON Web Token, e intercepta accesos
 * no autorizados según la matriz de roles del sistema Aqua-Contratos.
 */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "aqua_contratos_secret_key_jwt_2026_super_seguro";

/**
 * Middleware obligatorio: valida que la petición contenga un Bearer token JWT válido.
 */
export function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            mensaje: "Acceso no autorizado: Debe proporcionar un token de autenticación válido en la cabecera Authorization.",
        });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: "Token de autenticación inválido o expirado. Inicie sesión nuevamente.",
            error: error.message,
        });
    }
}

/**
 * Middleware opcional: si se envía un token válido, lo decodifica en req.usuario.
 * Si no viene token, permite que la petición continúe (útil para ofertas públicas o filtros contextuales).
 */
export function opcionalToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.usuario = decoded;
        } catch {
            // Ignorar en rutas con acceso público opcional
        }
    }
    next();
}

/**
 * Middleware de control de acceso basado en roles (RBAC).
 * @param {string[]} rolesPermitidos - Lista de roles con permiso (ej: ["jefatura", "analista"])
 */
export function verificarRol(rolesPermitidos = []) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                ok: false,
                mensaje: "Acceso no autorizado: Identidad no verificada.",
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                ok: false,
                mensaje: `Acceso denegado: El rol '${req.usuario.rol}' no tiene permisos suficientes para realizar esta acción. Roles autorizados: ${rolesPermitidos.join(", ")}.`,
            });
        }

        next();
    };
}
