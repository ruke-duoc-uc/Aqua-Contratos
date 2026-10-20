# Aqua-Contratos API REST 🐟🛠️

Backend y servicios web en **Node.js + Express** para el sistema de centralización y digitalización de evaluaciones psicolaborales de **AquaChile** (DSY1104 · Full Stack II).

---

## 📁 Estructura del Backend

```
backend/
├── .env.example              # Variables de entorno de referencia
├── .gitignore                # Archivos ignorados por git (node_modules, .env)
├── package.json              # Dependencias y scripts de Node.js
├── README.md                 # Especificación de la API REST
└── src/
    ├── app.js                # Configuración de Express, CORS y middleware
    ├── index.js              # Punto de entrada y arranque del servidor
    ├── controllers/          # Lógica de negocio y controladores HTTP
    │   ├── authController.js
    │   ├── puestosController.js
    │   ├── postulacionesController.js
    │   ├── candidatosController.js
    │   ├── solicitudesController.js
    │   ├── informesController.js
    │   └── dashboardController.js
    ├── routes/               # Definición de rutas REST
    │   ├── authRoutes.js
    │   ├── puestosRoutes.js
    │   ├── postulacionesRoutes.js
    │   ├── candidatosRoutes.js
    │   ├── solicitudesRoutes.js
    │   ├── informesRoutes.js
    │   └── dashboardRoutes.js
    ├── data/                 # Capa de datos y persistencia (SQLite nativo)
    │   ├── db.js             # Motor SQLite, esquema de tablas y consultas
    │   ├── seedData.js       # Datos de prueba alineados con el caso AquaChile
    │   └── dataStore.js      # Operaciones CRUD y reglas de negocio
    └── middlewares/          # Manejo de errores y rutas 404
        └── errorHandler.js
```

---

## 🚀 Puesta en Marcha

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Variables de entorno (opcional)
Crea un archivo `.env` basado en `.env.example`:
```env
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```

### 4. Ejecutar en modo producción
```bash
npm start
```

---

## 📡 Especificación de Endpoints REST

### 1. Autenticación y Cuentas (`/api/auth`)

| Método | Endpoint | Descripción | Body / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/usuarios` | Lista los perfiles simulados disponibles para la demo | Ninguno |
| `POST` | `/api/auth/login` | Inicio de sesión con correo y contraseña | `{ "email": "...", "password": "..." }` |
| `POST` | `/api/auth/registro-candidato` | Auto-registro de candidato y creación de cuenta | `{ "nombre", "rut", "email", "password", "especialidad", "infoMedica", "experienciaLaboral" }` |

---

### 2. Puestos de Trabajo (`/api/puestos`)

| Método | Endpoint | Descripción | Parámetros / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/puestos` | Lista puestos u ofertas laborales con filtros | Query: `?busqueda=texto&planta=Osorno&familiaCargo=...&estado=Abierto` |
| `GET` | `/api/puestos/:id` | Detalle del puesto con postulantes asociados | Param: `id` |
| `POST` | `/api/puestos` | Jefatura crea una nueva vacante laboral en una planta | `{ "titulo", "planta", "familiaCargo", "descripcion", "requisitos", "vacantes", "creadoPor" }` |
| `PUT` | `/api/puestos/:id` | Actualiza los datos de un puesto | Param: `id`, Body JSON con campos a modificar |
| `PATCH` | `/api/puestos/:id/estado` | Cambia el estado del puesto (`Abierto`, `Pausado`, `Cerrado`) | `{ "estado": "Cerrado" }` |
| `DELETE` | `/api/puestos/:id` | Elimina o archiva un puesto de trabajo | Param: `id` |

---

### 3. Postulaciones (`/api/postulaciones`)

| Método | Endpoint | Descripción | Parámetros / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/postulaciones` | Lista postulaciones con filtros | Query: `?candidatoId=1&puestoTrabajoId=2&estado=En+proceso` |
| `GET` | `/api/postulaciones/:id` | Detalle completo de la postulación (perfil + puesto) | Param: `id` |
| `POST` | `/api/postulaciones` | Candidato se postula a un puesto abierto | `{ "candidatoId": 1, "puestoTrabajoId": 2 }` |
| `PATCH` | `/api/postulaciones/:id/estado` | Cambia el estado del flujo | `{ "estado": "En revisión" }` |
| `PATCH` | `/api/postulaciones/:id/agendar` | Evaluador fija fecha/hora de entrevista | `{ "fechaEntrevista": "...", "evaluadorAsignado": "...", "observaciones": "..." }` |
| `PATCH` | `/api/postulaciones/:id/respuesta-candidato` | Candidato confirma entrevista o sugiere otra fecha | `{ "respuesta": "Aceptada" | "Sugerir cambio", "sugerenciaFecha": "..." }` |
| `PATCH` | `/api/postulaciones/:id/evaluacion` | Evaluador registra dictamen y observaciones | `{ "dictamenPsicologico": "Recomendado", "conclusiones": "..." }` |
| `PATCH` | `/api/postulaciones/:id/decision-final` | Analista registra decisión final de contratación | `{ "decisionFinal": "Contratado" | "No contratado" }` |

---

### 4. Candidatos (`/api/candidatos`)

| Método | Endpoint | Descripción | Parámetros / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/candidatos` | Lista todos los candidatos | Query: `?busqueda=texto` |
| `GET` | `/api/candidatos/:id` | Detalle del candidato e historial de postulaciones | Param: `id` |
| `POST` | `/api/candidatos` | Registra perfil de candidato (desacoplado de planta) | `{ "nombre", "rut", "email", "telefono", "especialidad", "infoMedica", "experienciaLaboral" }` |
| `PUT` | `/api/candidatos/:id` | Modifica datos personales, médicos o laborales | Param: `id`, Body JSON |
| `DELETE` | `/api/candidatos/:id` | Elimina candidato | Param: `id` |

---

### 5. Consultas e Informes de Jefatura (`/api/solicitudes-informe`)

| Método | Endpoint | Descripción | Parámetros / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/solicitudes-informe` | Lista consultas e informes con filtros | Query: `?busqueda=&estado=&candidatoId=&puestoTrabajoId=&urgencia=&tipo=` |
| `GET` | `/api/solicitudes-informe/:id` | Detalle con preguntas, respuestas e hilos | Param: `id` |
| `POST` | `/api/solicitudes-informe` | Jefatura emite informe por candidato o por puesto | `{ "candidatoId", "puestoTrabajoId", "urgencia", "fechaLimite", "preguntas": [] }` |
| `POST` | `/api/solicitudes-informe/:id/preguntas` | Jefatura agrega repregunta | `{ "texto": "...", "creadaPor": "Jefe de Área" }` |
| `POST` | `/api/solicitudes-informe/:id/preguntas/:preguntaId/respuestas` | Evaluador o analista responde con trazabilidad | `{ "autor": "...", "rol": "evaluador", "texto": "..." }` |
| `PATCH` | `/api/solicitudes-informe/:id/estado` | Cierra o reabre el informe | `{ "estado": "Cerrada" | "Abierta" }` |

---

### 6. Dashboard y Catálogos (`/api/dashboard`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/kpis` | Métricas generales (candidatos, puestos abiertos, postulaciones, contratados). |
| `GET` | `/api/dashboard/catalogos` | Listas maestras de Plantas, Familias de Cargo y Evaluadores. |
| `POST` | `/api/dashboard/reset-demo` | Restablece todos los datos iniciales de prueba en SQLite y JSON. |
