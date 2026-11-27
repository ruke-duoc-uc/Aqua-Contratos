export const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "Aqua-Contratos API REST",
        version: "2.0.0",
        description:
            "Documentación oficial e interactiva de la API REST del sistema de reclutamiento y evaluación psicolaboral Aqua-Contratos (AquaChile). Incluye autenticación JWT, RBAC, gestión de postulaciones, informes, almacenamiento de CVs, Google Calendar y asistencia por Inteligencia Artificial.",
        contact: {
            name: "Equipo de Desarrollo AquaChile - Duoc UC",
            email: "contacto@aquachile.cl",
        },
    },
    servers: [
        {
            url: "/api",
            description: "Servidor API actual (Local / Producción ajoloserver)",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Ingrese el token JWT obtenido en /api/auth/login o /api/auth/registro-candidato",
            },
        },
    },
    security: [{ bearerAuth: [] }],
    tags: [
        { name: "Autenticación", description: "Login, registro y perfil de usuarios con JWT y BCrypt" },
        { name: "Puestos de Trabajo", description: "CRUD y publicación de ofertas laborales de AquaChile" },
        { name: "Postulaciones", description: "Flujo de postulación, agendamiento y evaluación" },
        { name: "Candidatos", description: "Consulta de perfiles y descarga privada de CV (PDF)" },
        { name: "Informes y Dictamen", description: "Solicitudes de informes y dictamen psicolaboral unificado" },
        { name: "Inteligencia Artificial", description: "Módulo orientativo de apoyo a analistas y evaluadores" },
        { name: "Google Calendar & Meet", description: "Coordinación de citas y videollamadas con Google" },
    ],
    paths: {
        "/auth/login": {
            post: {
                tags: ["Autenticación"],
                summary: "Iniciar sesión (postulante o empleado)",
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["identificador", "password"],
                                properties: {
                                    identificador: { type: "string", example: "jefe@aquachile.cl" },
                                    password: { type: "string", example: "password123" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Autenticación exitosa con Token JWT" },
                    401: { description: "Credenciales inválidas" },
                },
            },
        },
        "/auth/registro-candidato": {
            post: {
                tags: ["Autenticación"],
                summary: "Auto-registro público de postulantes con CV",
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["nombre", "rut", "email", "password"],
                                properties: {
                                    nombre: { type: "string", example: "Camila Soto" },
                                    rut: { type: "string", example: "18.452.123-5" },
                                    email: { type: "string", example: "camila.soto@gmail.com" },
                                    password: { type: "string", example: "secreto123" },
                                    especialidad: { type: "string", example: "Técnico Acuícola" },
                                    consentimientoPrivacidad: { type: "boolean", example: true },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Postulante registrado y carpeta privada creada" },
                    400: { description: "Faltan datos obligatorios" },
                },
            },
        },
        "/auth/me": {
            get: {
                tags: ["Autenticación"],
                summary: "Obtener perfil del usuario autenticado actual",
                responses: {
                    200: { description: "Datos del perfil y rol del usuario" },
                    401: { description: "Token no proporcionado o inválido" },
                },
            },
        },
        "/puestos": {
            get: {
                tags: ["Puestos de Trabajo"],
                summary: "Catálogo de ofertas de trabajo activas",
                security: [],
                responses: { 200: { description: "Lista de puestos de trabajo" } },
            },
            post: {
                tags: ["Puestos de Trabajo"],
                summary: "Crear una nueva oferta de trabajo (Solo Jefatura)",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["titulo", "planta", "area_id"],
                                properties: {
                                    titulo: { type: "string", example: "Operario de Planta" },
                                    planta: { type: "string", example: "Puerto Montt" },
                                    area_id: { type: "integer", example: 1 },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: "Puesto creado" }, 403: { description: "Acceso denegado (requiere jefatura)" } },
            },
        },
        "/postulaciones": {
            get: {
                tags: ["Postulaciones"],
                summary: "Listado de postulaciones (filtradas por área según rol)",
                responses: { 200: { description: "Postulaciones recuperadas" } },
            },
            post: {
                tags: ["Postulaciones"],
                summary: "Enviar postulación a un puesto de trabajo",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["candidatoId", "puestoTrabajoId"],
                                properties: {
                                    candidatoId: { type: "integer", example: 1 },
                                    puestoTrabajoId: { type: "integer", example: 2 },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: "Postulación registrada" } },
            },
        },
        "/postulaciones/{id}/agendar": {
            patch: {
                tags: ["Postulaciones"],
                summary: "Agendar citación o entrevista (envía correo al candidato)",
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["fechaEntrevista"],
                                properties: {
                                    fechaEntrevista: { type: "string", example: "2026-11-28 10:00" },
                                    tipoCitacion: { type: "string", example: "Entrevistas online" },
                                    evaluadorAsignado: { type: "string", example: "Amaro Villalobos" },
                                    enlaceGoogleMeet: { type: "string", example: "https://meet.google.com/abc-defg-hij" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Entrevista agendada y correo enviado" } },
            },
        },
        "/candidatos": {
            get: {
                tags: ["Candidatos"],
                summary: "Catálogo de candidatos postulantes (Segregado por área)",
                responses: { 200: { description: "Listado de candidatos" } },
            },
        },
        "/candidatos/{id}/cv": {
            get: {
                tags: ["Candidatos"],
                summary: "Descargar CV (PDF) desde la carpeta privada del servidor",
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
                responses: {
                    200: { description: "Archivo PDF del currículum vitae" },
                    404: { description: "CV no encontrado" },
                },
            },
        },
        "/solicitudes-informe": {
            get: {
                tags: ["Informes y Dictamen"],
                summary: "Consultar solicitudes de informe psicolaboral",
                responses: { 200: { description: "Lista de informes" } },
            },
        },
        "/informes-psicolaborales/{id}/dictamen": {
            patch: {
                tags: ["Informes y Dictamen"],
                summary: "Registrar dictamen psicolaboral homologado (Recomendable / Con reservas / No recomendable)",
                parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["dictamen"],
                                properties: {
                                    dictamen: { type: "string", enum: ["Recomendable", "Con reservas", "No recomendable"], example: "Recomendable" },
                                    conclusiones: { type: "string", example: "Candidato apto para el cargo." },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Dictamen actualizado" } },
            },
        },
        "/ia/analizar-candidato": {
            post: {
                tags: ["Inteligencia Artificial"],
                summary: "Asistente IA: Generar resumen de CV, preguntas y afinidad con vacante",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    candidatoId: { type: "integer", example: 1 },
                                    cargoPostulado: { type: "string", example: "Técnico en Mantención" },
                                    planta: { type: "string", example: "Puerto Montt" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Análisis orientativo de IA generado con disclaimer" } },
            },
        },
        "/calendar/estado": {
            get: {
                tags: ["Google Calendar & Meet"],
                summary: "Consultar estado de la conexión OAuth con Google",
                security: [],
                responses: { 200: { description: "Estado de integración y modo activo" } },
            },
        },
        "/calendar/citacion": {
            post: {
                tags: ["Google Calendar & Meet"],
                summary: "Crear evento real con sala de Google Meet",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["fechaHora"],
                                properties: {
                                    cargo: { type: "string", example: "Operario de Producción" },
                                    candidatoNombre: { type: "string", example: "Juan Pérez" },
                                    candidatoEmail: { type: "string", example: "juan.perez@gmail.com" },
                                    fechaHora: { type: "string", example: "2026-11-28T10:00:00" },
                                    tipoCitacion: { type: "string", example: "Entrevistas online" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Evento y sala Meet creados" } },
            },
        },
    },
};
