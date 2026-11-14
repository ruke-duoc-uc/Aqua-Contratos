/**
 * Controlador de Autenticación y Cuentas de Usuario (A2, B1, B2)
 * Permite identificación por credenciales (email o RUT + contraseña), listado de perfiles
 * y auto-registro de postulantes con su ficha completa de Datos Postulantes.
 */
import { dataStore } from "../data/dataStore.js";

export const authController = {
    /**
     * GET /api/auth/usuarios
     * Retorna los perfiles base simulados para demo.
     */
    async listarUsuarios(req, res) {
        try {
            const usuarios = await dataStore.obtenerUsuarios();
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
     * POST /api/auth/login (B2: Inicio de sesión Postulantes / Empleados)
     */
    async login(req, res) {
        try {
            const { email, rut, identificador, password } = req.body;
            const idCuenta = (identificador || email || rut || "").trim();

            if (!idCuenta || !password) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe ingresar su correo electrónico (o RUT) y contraseña.",
                });
            }

            const usuario = await dataStore.loginUsuario({
                identificador: idCuenta,
                email,
                rut,
                password,
            });

            if (!usuario) {
                return res.status(401).json({
                    ok: false,
                    mensaje: "Credenciales inválidas. Compruebe su correo/RUT y contraseña.",
                });
            }

            // Si es postulante/candidato, adjuntamos su ficha de perfil (A2)
            let perfilCandidato = null;
            if (usuario.candidatoId) {
                perfilCandidato = await dataStore.obtenerCandidatoPorId(usuario.candidatoId);
            }
            if (!perfilCandidato && usuario.rol === "candidato" && usuario.email) {
                const candidatos = await dataStore.obtenerCandidatos({ busqueda: usuario.email });
                perfilCandidato = candidatos[0] || null;
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
     * POST /api/auth/registro-candidato (B1: Crear Usuario Postulantes + A2: Datos Postulantes)
     * Auto-registro de un nuevo postulante con su cuenta de acceso y datos personales.
     */
    async registroCandidato(req, res) {
        try {
            const {
                nombre,
                nombres,
                apellidos,
                rut,
                email,
                password,
                telefono,
                direccion,
                comuna,
                fecha_nacimiento,
                cv_pdf,
                cvDataUrl,
                especialidad,
                infoMedica,
                experienciaLaboral,
            } = req.body;

            const nombresLimpio = (nombres || "").trim();
            const apellidosLimpio = (apellidos || "").trim();
            const nombreCompleto = (nombre || `${nombresLimpio} ${apellidosLimpio}`).trim();

            if (!nombreCompleto) {
                return res.status(400).json({ ok: false, mensaje: "El nombre y apellido son obligatorios." });
            }
            if (!rut || !rut.trim()) {
                return res.status(400).json({ ok: false, mensaje: "El RUT es obligatorio." });
            }
            if (!email || !email.trim()) {
                return res.status(400).json({ ok: false, mensaje: "El correo electrónico es obligatorio." });
            }
            if (!password || String(password).length < 6) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La contraseña es obligatoria y debe tener al menos 6 caracteres.",
                });
            }

            // Verificar si el correo ya existe antes de insertar el candidato
            const emailNormalizado = email.trim().toLowerCase();
            const usuarioExistente = await dataStore.obtenerUsuarioPorEmail(emailNormalizado);
            if (usuarioExistente) {
                return res.status(409).json({
                    ok: false,
                    mensaje: `El correo electrónico ${emailNormalizado} ya se encuentra registrado.`,
                });
            }

            // Verificar si el RUT ya existe
            const rutExistente = await dataStore.buscarCandidatoPorRut(rut);
            if (rutExistente) {
                return res.status(409).json({
                    ok: false,
                    mensaje: `Ya existe un postulante registrado con el RUT ${rut}.`,
                });
            }

            // 1. Crear el perfil del postulante (A2: Datos Postulantes)
            const nuevoCandidato = await dataStore.crearCandidato({
                nombre: nombreCompleto,
                nombres: nombresLimpio || nombreCompleto.split(" ")[0],
                apellidos: apellidosLimpio || nombreCompleto.split(" ").slice(1).join(" "),
                rut: rut.trim(),
                email: emailNormalizado,
                telefono: telefono?.trim() || "",
                direccion: direccion?.trim() || "",
                comuna: comuna?.trim() || "Puerto Montt",
                fecha_nacimiento: fecha_nacimiento || "",
                cv_pdf: cv_pdf?.trim() || "",
                cvDataUrl: cvDataUrl || "",
                especialidad: especialidad?.trim() || "Postulante Registrado",
                cargo: especialidad?.trim() || "Postulante Registrado",
                infoMedica: infoMedica?.trim() || "",
                experienciaLaboral: experienciaLaboral?.trim() || "",
                estado: "Pendiente",
            });

            // 2. Crear la cuenta de usuario vinculada (B1: Crear Usuario Postulantes)
            const nuevoUsuario = await dataStore.registrarUsuario({
                email: emailNormalizado,
                password: String(password),
                nombre: nombreCompleto,
                rol: "candidato",
                candidatoId: nuevoCandidato.id,
            });

            return res.status(201).json({
                ok: true,
                mensaje: "Cuenta de postulante creada exitosamente.",
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
                mensaje: "Error interno al registrar postulante.",
                error: error.message,
            });
        }
    },
};
