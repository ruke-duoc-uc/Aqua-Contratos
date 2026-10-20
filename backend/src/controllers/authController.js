/**
 * Controlador de Autenticación y Cuentas de Usuario
 * Permite identificación por credenciales (email + contraseña), listado de perfiles
 * simulados para demostración y auto-registro de candidatos.
 */
import { dataStore } from "../data/dataStore.js";

export const authController = {
    /**
     * GET /api/auth/usuarios
     * Retorna los perfiles base simulados para demo.
     */
    listarUsuarios(req, res) {
        try {
            const usuarios = dataStore.obtenerUsuarios();
            return res.status(200).json({
                ok: true,
                total: usuarios.length,
                datos: usuarios,
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al listar usuarios.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/auth/login
     */
    login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe ingresar su correo electrónico y contraseña.",
                });
            }

            const usuario = dataStore.loginUsuario({ email, password });
            if (!usuario) {
                return res.status(401).json({
                    ok: false,
                    mensaje: "Credenciales inválidas. Compruebe el correo y la contraseña.",
                });
            }

            // Si es candidato, adjuntamos su ficha de perfil
            let perfilCandidato = null;
            if (usuario.candidatoId) {
                perfilCandidato = dataStore.obtenerCandidatoPorId(usuario.candidatoId);
            }

            return res.status(200).json({
                ok: true,
                mensaje: `Bienvenido(a) a Aqua-Contratos, ${usuario.nombre}.`,
                datos: {
                    usuario,
                    perfilCandidato,
                },
            });
        } catch (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno en el inicio de sesión.",
                error: error.message,
            });
        }
    },

    /**
     * POST /api/auth/registro-candidato
     * Auto-registro de un nuevo candidato con su perfil personal, médico y profesional.
     */
    registroCandidato(req, res) {
        try {
            const {
                nombre,
                rut,
                email,
                password,
                telefono,
                especialidad,
                infoMedica,
                experienciaLaboral,
            } = req.body;

            if (!nombre || !nombre.trim()) {
                return res.status(400).json({ ok: false, mensaje: "El nombre completo es obligatorio." });
            }
            if (!rut || !rut.trim()) {
                return res.status(400).json({ ok: false, mensaje: "El RUT es obligatorio." });
            }
            if (!email || !email.trim()) {
                return res.status(400).json({ ok: false, mensaje: "El correo electrónico es obligatorio." });
            }
            if (!especialidad || !especialidad.trim()) {
                return res.status(400).json({ ok: false, mensaje: "La especialidad o profesión es obligatoria." });
            }

            // Verificar si el RUT ya existe
            const rutExistente = dataStore.buscarCandidatoPorRut(rut);
            if (rutExistente) {
                return res.status(409).json({
                    ok: false,
                    mensaje: `Ya existe un perfil registrado con el RUT ${rut}.`,
                });
            }

            // 1. Crear el perfil del candidato (sin planta, pues la planta es del puesto)
            const nuevoCandidato = dataStore.crearCandidato({
                nombre: nombre.trim(),
                rut: rut.trim(),
                email: email.trim().toLowerCase(),
                telefono: telefono?.trim() || "",
                especialidad: especialidad.trim(),
                infoMedica: infoMedica?.trim() || "",
                experienciaLaboral: experienciaLaboral?.trim() || "",
                estado: "Registrado",
            });

            // 2. Crear la cuenta de usuario vinculada
            const nuevoUsuario = dataStore.registrarUsuario({
                email: email.trim().toLowerCase(),
                password: password || "password123",
                nombre: nombre.trim(),
                rol: "candidato",
                candidatoId: nuevoCandidato.id,
            });

            return res.status(201).json({
                ok: true,
                mensaje: "Cuenta de candidato creada exitosamente.",
                datos: {
                    usuario: nuevoUsuario,
                    candidato: nuevoCandidato,
                },
            });
        } catch (error) {
            if (error.codigo === "EMAIL_DUPLICADO") {
                return res.status(409).json({
                    ok: false,
                    mensaje: error.message,
                });
            }
            return res.status(500).json({
                ok: false,
                mensaje: "Error interno al registrar candidato.",
                error: error.message,
            });
        }
    },
};
