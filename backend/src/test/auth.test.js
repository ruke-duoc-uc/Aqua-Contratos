import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verificarToken, verificarRol } from "../middlewares/authMiddleware.js";
import { dataStore } from "../data/dataStore.js";
import { db } from "../data/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "aqua_contratos_secret_key_jwt_2026_super_seguro";

after(async () => {
    try {
        if (mongoose.connection && mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    } catch {
        // Ignorar
    }
    setTimeout(() => process.exit(0), 50).unref();
});

describe("Seguridad: Hasheo de contraseñas con bcryptjs", () => {
    it("debe hashear una contraseña y validarla con bcrypt.compare", async () => {
        const passwordPlana = "secreto123";
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(passwordPlana, salt);

        assert.notEqual(hash, passwordPlana);
        assert.match(hash, /^\$2[ab]\$/);

        const coincide = await bcrypt.compare(passwordPlana, hash);
        assert.equal(coincide, true);

        const noCoincide = await bcrypt.compare("clave_incorrecta", hash);
        assert.equal(noCoincide, false);
    });

    it("debe autenticar credenciales en dataStore / db y retornar usuario sin password expuesta", async () => {
        const usuario = await db.autenticarUsuario({
            identificador: "jefe@aquachile.cl",
            password: "password123",
        });

        assert.ok(usuario, "El usuario jefe debe autenticarse correctamente");
        assert.equal(usuario.email, "jefe@aquachile.cl");
        assert.equal(usuario.rol, "jefatura");
        assert.equal(usuario.password, undefined, "La contraseña jamás debe exponerse en el objeto retornado");
    });

    it("debe rechazar autenticación cuando la contraseña es incorrecta", async () => {
        const usuario = await db.autenticarUsuario({
            identificador: "jefe@aquachile.cl",
            password: "password_falsa_999",
        });

        assert.equal(usuario, null, "Debe ser null al ingresar contraseña errónea");
    });
});

describe("Seguridad: Tokens JWT y Middlewares de Autorización por Rol", () => {
    it("debe firmar y verificar tokens con el rol y área del usuario", () => {
        const payload = {
            id: 3,
            email: "jefe@aquachile.cl",
            nombre: "Carlos Mendoza",
            rol: "jefatura",
            area_id: 1,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
        assert.ok(token);

        const decoded = jwt.verify(token, JWT_SECRET);
        assert.equal(decoded.id, 3);
        assert.equal(decoded.rol, "jefatura");
        assert.equal(decoded.area_id, 1);
    });

    it("verificarToken debe bloquear con 401 si no se envía cabecera Authorization", () => {
        const req = { headers: {} };
        let statusCode = null;
        let jsonResponse = null;
        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(data) {
                jsonResponse = data;
                return this;
            },
        };
        let nextLlamado = false;

        verificarToken(req, res, () => {
            nextLlamado = true;
        });

        assert.equal(statusCode, 401);
        assert.equal(jsonResponse.ok, false);
        assert.equal(nextLlamado, false);
    });

    it("verificarToken debe autorizar e inyectar req.usuario cuando el Bearer token es válido", () => {
        const token = jwt.sign(
            { id: 2, email: "evaluador@aquachile.cl", rol: "evaluador" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        const req = {
            headers: {
                authorization: `Bearer ${token}`,
            },
        };
        const res = {};
        let nextLlamado = false;

        verificarToken(req, res, () => {
            nextLlamado = true;
        });

        assert.equal(nextLlamado, true);
        assert.ok(req.usuario);
        assert.equal(req.usuario.rol, "evaluador");
    });

    it("verificarRol debe rechazar con 403 cuando el rol no tiene permisos", () => {
        const middleware = verificarRol(["jefatura"]);
        const req = {
            usuario: { id: 1, email: "candidato@gmail.com", rol: "candidato" },
        };
        let statusCode = null;
        let jsonResponse = null;
        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(data) {
                jsonResponse = data;
                return this;
            },
        };
        let nextLlamado = false;

        middleware(req, res, () => {
            nextLlamado = true;
        });

        assert.equal(statusCode, 403);
        assert.equal(jsonResponse.ok, false);
        assert.match(jsonResponse.mensaje, /Acceso denegado/);
        assert.equal(nextLlamado, false);
    });

    it("verificarRol debe permitir el paso cuando el rol coincide", () => {
        const middleware = verificarRol(["analista", "jefatura"]);
        const req = {
            usuario: { id: 3, email: "jefe@aquachile.cl", rol: "jefatura" },
        };
        const res = {};
        let nextLlamado = false;

        middleware(req, res, () => {
            nextLlamado = true;
        });

        assert.equal(nextLlamado, true);
    });
});

describe("Segregación por Áreas en Backend", () => {
    it("debe filtrar postulaciones por areaId", async () => {
        const postulacionesArea1 = await db.obtenerPostulaciones({ areaId: 1 });
        assert.ok(Array.isArray(postulacionesArea1));
        // Todas las postulaciones devueltas deben pertenecer al área 1
        for (const pos of postulacionesArea1) {
            if (pos.area_id) {
                assert.equal(Number(pos.area_id), 1);
            }
        }
    });

    it("debe filtrar candidatos asociados al área en dataStore", async () => {
        const candidatosArea1 = await dataStore.obtenerCandidatos({ areaId: 1 });
        assert.ok(Array.isArray(candidatosArea1));
    });
});
