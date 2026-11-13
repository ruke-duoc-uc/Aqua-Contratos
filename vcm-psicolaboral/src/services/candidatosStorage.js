/**
 * Servicio de Almacenamiento, Autenticación y Sincronización Global de Postulantes (A2, B1, B2)
 * @Autor Amaro Villalobos
 * Conecta con el Backend Node.js + MongoDB y mantiene respaldo en localStorage.
 */

import { api } from "./api.js";

export const STORAGE_KEY_CANDIDATOS = "aqua_contratos_datos_mvp_v1";
export const STORAGE_KEY_USUARIOS_POSTULANTES = "aqua_contratos_usuarios_postulantes_v1";
export const STORAGE_KEY_SESION_POSTULANTE = "aqua_contratos_sesion_postulante_v1";
export const EVENTO_ACTUALIZACION_CANDIDATOS = "aqua_contratos_actualizados";

export const CANDIDATOS_BASE = [
    {
        id: 1,
        rut: "21.756.200-7",
        nombres: "Luis Andrés",
        apellidos: "Mancilla Peralta",
        nombre: "Luis Mancilla Peralta",
        email: "luis.mancilla@gmail.com",
        telefono: "+56 9 8765 4321",
        direccion: "Av. Angelmó 1420",
        comuna: "Puerto Montt",
        fecha_nacimiento: "1998-05-14",
        cv_pdf: "cv_luis_mancilla.pdf",
        cvArchivo: "cv_luis_mancilla.pdf",
        especialidad: "Ing Software",
        planta: "Puerto Montt",
        cargo: "Desarrollador Full Stack",
        familiaCargo: "Sistemas y TI",
        fecha: new Date(2026, 9, 5).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "En revisión",
        antecedentes: "Experiencia en React y Node.js. Salud compatible para teletrabajo y planta.",
        resultadoPsicologico: "Pendiente",
    },
    {
        id: 2,
        rut: "20.345.118-3",
        nombres: "Camila Ignacia",
        apellidos: "Soto Vargas",
        nombre: "Camila Soto Vargas",
        email: "camila.soto@gmail.com",
        telefono: "+56 9 9123 4567",
        direccion: "Calle Mackenna 540",
        comuna: "Osorno",
        fecha_nacimiento: "2000-03-22",
        cv_pdf: "cv_camila_soto.pdf",
        cvArchivo: "cv_camila_soto.pdf",
        especialidad: "Prevención de Riesgos",
        planta: "Osorno",
        cargo: "Prevencionista de Faena",
        familiaCargo: "Calidad y Prevención de Riesgos",
        fecha: new Date(2026, 9, 4).toISOString(),
        evaluador: "Carolina Díaz Núñez",
        estado: "Pendiente",
        antecedentes: "2 años en plantas de salmónidos en la zona sur.",
        resultadoPsicologico: "Pendiente",
    },
    {
        id: 3,
        rut: "19.872.456-K",
        nombres: "Matías Nicolás",
        apellidos: "Rojas Aguilar",
        nombre: "Matías Rojas Aguilar",
        email: "matias.rojas@gmail.com",
        telefono: "+56 9 7654 3210",
        direccion: "San Francisco 320",
        comuna: "Puerto Varas",
        fecha_nacimiento: "1997-11-08",
        cv_pdf: "cv_matias_rojas.pdf",
        cvArchivo: "cv_matias_rojas.pdf",
        especialidad: "Mecánica Industrial",
        planta: "Puerto Varas",
        cargo: "Técnico de Mantenimiento",
        familiaCargo: "Mantenimiento Industrial",
        fecha: new Date(2026, 9, 4).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "En proceso",
        antecedentes: "Especialista en bombas hidráulicas y líneas de faena.",
        resultadoPsicologico: "Pendiente",
    },
    {
        id: 4,
        rut: "21.034.789-5",
        nombres: "Valentina Paz",
        apellidos: "Cárdenas Ruiz",
        nombre: "Valentina Cárdenas Ruiz",
        email: "valentina.cardenas@gmail.com",
        telefono: "+56 9 6543 2109",
        direccion: "Los Alerces 890",
        comuna: "Puerto Montt",
        fecha_nacimiento: "1999-08-30",
        cv_pdf: "cv_valentina_cardenas.pdf",
        cvArchivo: "cv_valentina_cardenas.pdf",
        especialidad: "Administración",
        planta: "Puerto Montt",
        cargo: "Asistente Administrativo",
        familiaCargo: "Administración y Finanzas",
        fecha: new Date(2026, 9, 3).toISOString(),
        evaluador: "Felipe Muñoz Parra",
        estado: "Finalizado",
        antecedentes: "Práctica profesional y experiencia en control de gestión.",
        resultadoPsicologico: "Recomendado",
        fechaEvaluacion: "2026-10-03",
        conclusiones: "Alta capacidad de trabajo en equipo y apego a protocolos de la empresa.",
    },
    {
        id: 5,
        rut: "18.456.321-2",
        nombres: "Sebastián Alonso",
        apellidos: "Oyarzún Leal",
        nombre: "Sebastián Oyarzún Leal",
        email: "sebastian.oyarzun@gmail.com",
        telefono: "+56 9 5432 1098",
        direccion: "Gamboa Alto 210",
        comuna: "Castro",
        fecha_nacimiento: "1994-01-19",
        cv_pdf: "cv_sebastian_oyarzun.pdf",
        cvArchivo: "cv_sebastian_oyarzun.pdf",
        especialidad: "Electricidad",
        planta: "Castro",
        cargo: "Eléctrico de Turno",
        familiaCargo: "Mantenimiento Industrial",
        fecha: new Date(2026, 9, 2).toISOString(),
        evaluador: "Carolina Díaz Núñez",
        estado: "Pendiente",
        antecedentes: "Certificación SEC vigente clase B.",
        resultadoPsicologico: "Pendiente",
    },
    {
        id: 6,
        rut: "20.987.654-1",
        nombres: "Javiera Belén",
        apellidos: "Barría Montecinos",
        nombre: "Javiera Barría Montecinos",
        email: "javiera.barria@gmail.com",
        telefono: "+56 9 4321 0987",
        direccion: "Costanera Sur 77",
        comuna: "Calbuco",
        fecha_nacimiento: "2001-09-12",
        cv_pdf: "cv_javiera_barria.pdf",
        cvArchivo: "cv_javiera_barria.pdf",
        especialidad: "Logística",
        planta: "Calbuco",
        cargo: "Coordinador de Despacho",
        familiaCargo: "Logística y Abastecimiento",
        fecha: new Date(2026, 9, 2).toISOString(),
        evaluador: "Felipe Muñoz Parra",
        estado: "En proceso",
        antecedentes: "Experiencia en bodegas de frío y control de cadena de valor.",
        resultadoPsicologico: "Pendiente",
    },
    {
        id: 7,
        rut: "19.123.456-8",
        nombres: "Diego Esteban",
        apellidos: "Andrade Contreras",
        nombre: "Diego Andrade Contreras",
        email: "diego.andrade@gmail.com",
        telefono: "+56 9 3210 9876",
        direccion: "Almirante Latorre 405",
        comuna: "Ancud",
        fecha_nacimiento: "1996-06-25",
        cv_pdf: "cv_diego_andrade.pdf",
        cvArchivo: "cv_diego_andrade.pdf",
        especialidad: "Soldadura",
        planta: "Ancud",
        cargo: "Soldador Calificado",
        familiaCargo: "Operaciones Productivas",
        fecha: new Date(2026, 9, 1).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "En revisión",
        antecedentes: "Calificación 6G vigente.",
        resultadoPsicologico: "Pendiente",
    },
    {
        id: 8,
        rut: "21.456.098-6",
        nombres: "Francisca Andrea",
        apellidos: "Mayorga Tapia",
        nombre: "Francisca Mayorga Tapia",
        email: "francisca.mayorga@gmail.com",
        telefono: "+56 9 2109 8765",
        direccion: "Av. Philippi 123",
        comuna: "Frutillar",
        fecha_nacimiento: "2000-12-04",
        cv_pdf: "cv_francisca_mayorga.pdf",
        cvArchivo: "cv_francisca_mayorga.pdf",
        especialidad: "Contabilidad",
        planta: "Frutillar",
        cargo: "Analista Contable",
        familiaCargo: "Administración y Finanzas",
        fecha: new Date(2026, 8, 30).toISOString(),
        evaluador: "Carolina Díaz Núñez",
        estado: "Finalizado",
        antecedentes: "Experiencia con ERP SAP y facturación electrónica.",
        resultadoPsicologico: "Recomendado con observaciones",
        fechaEvaluacion: "2026-10-01",
        conclusiones: "Cumple con el perfil técnico, requiere seguimiento en manejo de presión en cierres contables.",
    },
    {
        id: 9,
        rut: "20.678.912-4",
        nombres: "Nicolás Alejandro",
        apellidos: "Hernández Soto",
        nombre: "Nicolás Hernández Soto",
        email: "nicolas.hernandez@gmail.com",
        telefono: "+56 9 1098 7654",
        direccion: "Pelluco Alto 615",
        comuna: "Puerto Montt",
        fecha_nacimiento: "1999-04-18",
        cv_pdf: "cv_nicolas_hernandez.pdf",
        cvArchivo: "cv_nicolas_hernandez.pdf",
        especialidad: "Ing Civil",
        planta: "Puerto Montt",
        cargo: "Ingeniero de Infraestructura",
        familiaCargo: "Operaciones Productivas",
        fecha: new Date(2026, 8, 29).toISOString(),
        evaluador: "Felipe Muñoz Parra",
        estado: "Pendiente",
        antecedentes: "Supervisión de obras marítimas y concesiones acuícolas.",
        resultadoPsicologico: "Pendiente",
    },
    {
        id: 10,
        rut: "19.765.432-9",
        nombres: "Constanza Elena",
        apellidos: "Vidal Bahamonde",
        nombre: "Constanza Vidal Bahamonde",
        email: "constanza.vidal@gmail.com",
        telefono: "+56 9 0987 6543",
        direccion: "Manuel Rodríguez 820",
        comuna: "Osorno",
        fecha_nacimiento: "1997-07-29",
        cv_pdf: "cv_constanza_vidal.pdf",
        cvArchivo: "cv_constanza_vidal.pdf",
        especialidad: "Enfermería",
        planta: "Osorno",
        cargo: "Enfermera Ocupacional",
        familiaCargo: "Calidad y Prevención de Riesgos",
        fecha: new Date(2026, 8, 28).toISOString(),
        evaluador: "Amaro Villalobos Caseres",
        estado: "Finalizado",
        antecedentes: "Experiencia en salas de primeros auxilios y protocolos sanitarios.",
        resultadoPsicologico: "Recomendado",
        fechaEvaluacion: "2026-09-30",
        conclusiones: "Perfil excelente con alta empatía y vocación de servicio para personal de planta.",
    },
];

export const USUARIOS_POSTULANTES_BASE = CANDIDATOS_BASE.map((c) => ({
    id: c.id + 3,
    email: c.email,
    rut: c.rut,
    password: "password123",
    nombre: `${c.nombres} ${c.apellidos}`.trim(),
    rol: "candidato",
    candidatoId: c.id,
}));

const limpiarRut = (rut) => (rut || "").replace(/[.-]/g, "").trim().toLowerCase();

/**
 * Normaliza un objeto candidato asegurando que cuente con todos los atributos requeridos (A2).
 */
export function normalizarCandidato(item) {
    const nombres =
        item.nombres ||
        (item.nombre
            ? item.nombre.split(" ").slice(0, -2).join(" ") || item.nombre.split(" ")[0]
            : "");
    const apellidos =
        item.apellidos ||
        (item.nombre ? item.nombre.split(" ").slice(-2).join(" ") : "");
    const nombreCompleto = item.nombre || `${nombres} ${apellidos}`.trim();
    const rutLimpio = item.rut || "";
    const cvArchivo =
        item.cv_pdf ||
        item.cvArchivo ||
        (nombreCompleto
            ? `cv_${nombreCompleto.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`
            : "cv_postulante.pdf");

    return {
        ...item,
        id: item.id || Date.now(),
        rut: rutLimpio,
        nombres: item.nombres || nombres,
        apellidos: item.apellidos || apellidos,
        nombre: nombreCompleto,
        email: item.email || "",
        telefono: item.telefono || "",
        direccion: item.direccion || "Dirección no informada",
        comuna: item.comuna || item.planta || "Puerto Montt",
        planta: item.planta || item.comuna || "Puerto Montt",
        fecha_nacimiento: item.fecha_nacimiento || "1998-01-01",
        cv_pdf: cvArchivo,
        cvArchivo: cvArchivo,
        especialidad: item.especialidad || item.cargo || "Postulante General",
        cargo: item.cargo || item.especialidad || "Postulante General",
        familiaCargo: item.familiaCargo || "Operaciones Productivas",
        evaluador: item.evaluador || "Amaro Villalobos Caseres",
        estado: item.estado || "Pendiente",
        resultadoPsicologico: item.resultadoPsicologico || "Pendiente",
        fecha: item.fecha instanceof Date ? item.fecha : new Date(item.fecha || Date.now()),
    };
}

export function cargarCandidatosGlobales() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_CANDIDATOS);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(normalizarCandidato);
            }
        }
    } catch (e) {
        console.warn("Fallo al leer almacenamiento global de candidatos:", e);
    }
    const iniciales = CANDIDATOS_BASE.map(normalizarCandidato);
    guardarCandidatosGlobales(iniciales);
    return iniciales;
}

export function guardarCandidatosGlobales(candidatos) {
    try {
        localStorage.setItem(STORAGE_KEY_CANDIDATOS, JSON.stringify(candidatos));
        notificarCambioGlobal();
    } catch (e) {
        console.error("Error al persistir candidatos en localStorage:", e);
    }
}

export async function registrarPostulanteGlobal(nuevoPostulante) {
    const normalizado = normalizarCandidato({
        ...nuevoPostulante,
        fecha: new Date(),
        estado: nuevoPostulante.estado || "Pendiente",
        resultadoPsicologico: "Pendiente",
    });

    try {
        const actuales = cargarCandidatosGlobales();
        const rutNuevo = limpiarRut(normalizado.rut);
        const filtrados = actuales.filter((c) => {
            const rutActual = limpiarRut(c.rut);
            return rutActual !== rutNuevo && c.id !== normalizado.id;
        });

        const actualizada = [normalizado, ...filtrados];
        localStorage.setItem(STORAGE_KEY_CANDIDATOS, JSON.stringify(actualizada));
        notificarCambioGlobal();
    } catch (e) {
        console.error("Error guardando postulante en almacenamiento global:", e);
    }

    try {
        await api.crearSolicitud(normalizado);
    } catch (err) {
        console.warn("Backend no disponible al registrar postulante (permanece en modo local global):", err.message);
    }

    return normalizado;
}

export function notificarCambioGlobal() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(EVENTO_ACTUALIZACION_CANDIDATOS));
    }
}

/* ==================== CUENTAS Y SESIÓN DE POSTULANTES (B1 / B2) ==================== */

export function cargarUsuariosPostulantesLocales() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_USUARIOS_POSTULANTES);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // Ignorar
    }
    try {
        localStorage.setItem(STORAGE_KEY_USUARIOS_POSTULANTES, JSON.stringify(USUARIOS_POSTULANTES_BASE));
    } catch {
        // Ignorar
    }
    return [...USUARIOS_POSTULANTES_BASE];
}

export function guardarUsuariosPostulantesLocales(usuarios) {
    try {
        localStorage.setItem(STORAGE_KEY_USUARIOS_POSTULANTES, JSON.stringify(usuarios));
    } catch {
        // Ignorar
    }
}

export function obtenerSesionPostulante() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SESION_POSTULANTE);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function guardarSesionPostulante(sesion) {
    try {
        localStorage.setItem(STORAGE_KEY_SESION_POSTULANTE, JSON.stringify(sesion));
    } catch {
        // Ignorar
    }
}

export function cerrarSesionPostulante() {
    try {
        localStorage.removeItem(STORAGE_KEY_SESION_POSTULANTE);
    } catch {
        // Ignorar
    }
}

/**
 * B1: Crear Usuario Postulante + A2: Datos Postulantes
 * Registra la cuenta en el backend (MongoDB) y sincroniza en el almacenamiento local.
 */
export async function registrarCuentaPostulante(datos) {
    const emailLimpio = (datos.email || "").trim().toLowerCase();
    const rutLimpio = (datos.rut || "").trim();
    const nombresLimpio = (datos.nombres || "").trim();
    const apellidosLimpio = (datos.apellidos || "").trim();
    const nombreCompleto = `${nombresLimpio} ${apellidosLimpio}`.trim();

    let usuarioCreado = null;
    let candidatoCreado = null;
    let desdeBackend = false;

    try {
        const respuestaApi = await api.registroCandidato({
            nombre: nombreCompleto,
            nombres: nombresLimpio,
            apellidos: apellidosLimpio,
            rut: rutLimpio,
            email: emailLimpio,
            password: datos.password,
            telefono: datos.telefono || "",
            direccion: datos.direccion || "",
            comuna: datos.comuna || "Puerto Montt",
            fecha_nacimiento: datos.fecha_nacimiento || "",
            cv_pdf: datos.cv_pdf || "",
            cvDataUrl: datos.cvDataUrl || "",
            especialidad: "Postulante Registrado",
        });

        usuarioCreado = respuestaApi.usuario;
        candidatoCreado = normalizarCandidato(respuestaApi.candidato);
        if (!datos.cv_pdf) {
            candidatoCreado.cv_pdf = "";
            candidatoCreado.cvArchivo = "";
        }
        if (!datos.fecha_nacimiento) {
            candidatoCreado.fecha_nacimiento = "";
        }
        if (!datos.comuna) {
            candidatoCreado.comuna = "";
        }
        desdeBackend = true;
    } catch (error) {
        // Si el backend respondió 400 o 409 (RUT o Email duplicado), propagar el error
        if (error.status === 400 || error.status === 409) {
            throw error;
        }

        // Fallback local si el backend está apagado
        const actuales = cargarCandidatosGlobales();
        const usuariosLocales = cargarUsuariosPostulantesLocales();

        if (usuariosLocales.some((u) => (u.email || "").toLowerCase() === emailLimpio)) {
            throw new Error(`El correo electrónico ${emailLimpio} ya se encuentra registrado.`);
        }
        if (actuales.some((c) => limpiarRut(c.rut) === limpiarRut(rutLimpio))) {
            throw new Error(`Ya existe un postulante registrado con el RUT ${rutLimpio}.`);
        }

        const nuevoId = actuales.length > 0 ? Math.max(...actuales.map((c) => Number(c.id) || 0)) + 1 : 1;
        candidatoCreado = normalizarCandidato({
            id: nuevoId,
            rut: rutLimpio,
            nombres: nombresLimpio,
            apellidos: apellidosLimpio,
            nombre: nombreCompleto,
            email: emailLimpio,
            telefono: datos.telefono || "",
            direccion: datos.direccion || "",
            comuna: datos.comuna || "",
            fecha_nacimiento: datos.fecha_nacimiento || "",
            cv_pdf: datos.cv_pdf || "",
            cvArchivo: datos.cv_pdf || "",
            cvDataUrl: datos.cvDataUrl || "",
            especialidad: "Postulante Registrado",
            cargo: "Postulante Registrado",
            estado: "Pendiente",
            fecha: new Date(),
        });
        if (!datos.cv_pdf) {
            candidatoCreado.cv_pdf = "";
            candidatoCreado.cvArchivo = "";
        }
        if (!datos.fecha_nacimiento) {
            candidatoCreado.fecha_nacimiento = "";
        }
        if (!datos.comuna) {
            candidatoCreado.comuna = "";
        }

        usuarioCreado = {
            id: Date.now(),
            email: emailLimpio,
            rut: rutLimpio,
            nombre: nombreCompleto,
            rol: "candidato",
            candidatoId: candidatoCreado.id,
        };
    }

    // Sincronizar con el catálogo local y lista de usuarios locales
    const candidatosActuales = cargarCandidatosGlobales();
    const filtrados = candidatosActuales.filter(
        (c) => limpiarRut(c.rut) !== limpiarRut(candidatoCreado.rut) && Number(c.id) !== Number(candidatoCreado.id)
    );
    guardarCandidatosGlobales([candidatoCreado, ...filtrados]);

    const usuariosActuales = cargarUsuariosPostulantesLocales().filter(
        (u) => (u.email || "").toLowerCase() !== emailLimpio
    );
    guardarUsuariosPostulantesLocales([
        ...usuariosActuales,
        {
            ...usuarioCreado,
            rut: rutLimpio,
            password: datos.password,
        },
    ]);

    const sesion = {
        usuario: usuarioCreado,
        candidato: candidatoCreado,
        desdeBackend,
    };
    guardarSesionPostulante(sesion);
    return sesion;
}

/**
 * B2: Inicio de sesión de Postulantes (por correo electrónico o RUT + contraseña)
 */
export async function iniciarSesionPostulante({ identificador, password }) {
    const idLimpio = (identificador || "").trim();
    if (!idLimpio || !password) {
        throw new Error("Debes ingresar tu correo electrónico (o RUT) y contraseña.");
    }

    try {
        const respuestaApi = await api.login({
            identificador: idLimpio,
            email: idLimpio,
            rut: idLimpio,
            password,
        });

        if (respuestaApi.usuario && respuestaApi.usuario.rol !== "candidato") {
            throw new Error("Esta cuenta pertenece al Portal de Empleados. Ingresa con una cuenta de postulante.");
        }

        const candidatoNormalizado = respuestaApi.perfilCandidato
            ? normalizarCandidato(respuestaApi.perfilCandidato)
            : normalizarCandidato({
                  id: respuestaApi.usuario.candidatoId || Date.now(),
                  nombre: respuestaApi.usuario.nombre,
                  email: respuestaApi.usuario.email,
              });

        const sesion = {
            usuario: respuestaApi.usuario,
            candidato: candidatoNormalizado,
            desdeBackend: true,
        };
        guardarSesionPostulante(sesion);
        return sesion;
    } catch (error) {
        if (error.status === 401 || error.status === 400 || error.message?.includes("Portal de Empleados")) {
            throw error;
        }

        // Fallback local cuando el backend no está en línea
        const usuariosLocales = cargarUsuariosPostulantesLocales();
        const candidatosLocales = cargarCandidatosGlobales();

        const usuarioEncontrado = usuariosLocales.find((u) => {
            const coincideEmail = (u.email || "").toLowerCase() === idLimpio.toLowerCase();
            const coincideRut = u.rut && limpiarRut(u.rut) === limpiarRut(idLimpio);
            if (coincideEmail || coincideRut) return true;
            const cand = candidatosLocales.find((c) => Number(c.id) === Number(u.candidatoId));
            return cand && limpiarRut(cand.rut) === limpiarRut(idLimpio);
        });

        if (!usuarioEncontrado || usuarioEncontrado.password !== password) {
            throw new Error("Credenciales inválidas. Verifica tu correo/RUT y contraseña.");
        }

        const perfil =
            candidatosLocales.find(
                (c) =>
                    Number(c.id) === Number(usuarioEncontrado.candidatoId) ||
                    (c.email && c.email.toLowerCase() === usuarioEncontrado.email.toLowerCase())
            ) ||
            normalizarCandidato({
                id: usuarioEncontrado.candidatoId || Date.now(),
                nombre: usuarioEncontrado.nombre,
                email: usuarioEncontrado.email,
                rut: usuarioEncontrado.rut || "",
            });

        const { password: _, ...usuarioSinPass } = usuarioEncontrado;
        const sesion = {
            usuario: usuarioSinPass,
            candidato: perfil,
            desdeBackend: false,
        };
        guardarSesionPostulante(sesion);
        return sesion;
    }
}
