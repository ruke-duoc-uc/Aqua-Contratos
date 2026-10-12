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
    │   ├── candidatosController.js
    │   ├── solicitudesController.js
    │   └── dashboardController.js
    ├── routes/               # Definición de rutas REST
    │   ├── candidatosRoutes.js
    │   ├── solicitudesRoutes.js
    │   └── dashboardRoutes.js
    ├── data/                 # Capa de datos y almacenamiento en memoria
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

### 1. Candidatos (`/api/candidatos`)

| Método | Endpoint | Descripción | Parámetros / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/candidatos` | Lista todos los candidatos | Query: `?busqueda=texto&planta=Osorno` |
| `GET` | `/api/candidatos/:id` | Detalle de un candidato por ID | Param: `id` |
| `POST` | `/api/candidatos` | Registra un nuevo candidato (valida obligatorios y unicidad de RUT) | Body JSON: `{ nombre, rut, especialidad, planta, cargo, familiaCargo, antecedentes }` |
| `PUT` | `/api/candidatos/:id` | Actualiza la información de un candidato existente | Param: `id`, Body JSON con campos a modificar |
| `DELETE` | `/api/candidatos/:id` | Elimina un candidato | Param: `id` |

#### Ejemplo POST `/api/candidatos`:
```json
{
  "nombre": "Esteban Morales Silva",
  "rut": "17.890.123-4",
  "especialidad": "Mantenimiento Industrial",
  "planta": "Calbuco",
  "cargo": "Técnico Electromecánico",
  "familiaCargo": "Mantenimiento Industrial",
  "antecedentes": "5 años de experiencia en líneas de proceso."
}
```

---

### 2. Solicitudes de Evaluación (`/api/solicitudes`)

| Método | Endpoint | Descripción | Parámetros / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/solicitudes` | Lista las solicitudes de evaluación con filtros | Query: `?busqueda=texto&estado=Pendiente&planta=Puerto+Montt&evaluador=Amaro` |
| `GET` | `/api/solicitudes/:id` | Obtiene la ficha completa de una solicitud | Param: `id` |
| `POST` | `/api/solicitudes` | Emite una nueva solicitud asociada a un cargo (estado inicial: `Pendiente`) | Body JSON: `{ nombre, rut, especialidad, planta, cargo, familiaCargo, evaluador, antecedentes }` |
| `PATCH` | `/api/solicitudes/:id/estado` | Cambia el estado del flujo (`Pendiente`, `En revisión`, `En proceso`, `Finalizado`) | Body JSON: `{ "estado": "En proceso" }` |
| `PATCH` | `/api/solicitudes/:id/evaluacion` | Registra dictamen psicolaboral, fecha y conclusiones | Body JSON: `{ resultadoPsicologico, fechaEvaluacion, conclusiones, estado }` |

#### Ejemplo PATCH `/api/solicitudes/3/evaluacion`:
```json
{
  "resultadoPsicologico": "Recomendado",
  "fechaEvaluacion": "2026-10-12",
  "conclusiones": "Postulante demuestra alto apego a normas de seguridad y estabilidad emocional.",
  "estado": "Finalizado"
}
```

---

### 3. Dashboard y Catálogos (`/api/dashboard`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/kpis` | Retorna los 4 indicadores clave del proceso (Total candidatos, Pendientes, En proceso, Finalizadas). |
| `GET` | `/api/dashboard/catalogos` | Retorna las listas maestras de Plantas, Familias de Cargo y Evaluadores. |
| `POST` | `/api/dashboard/reset-demo` | Restablece los datos iniciales de prueba (utilidad para demostración del Administrador Académico). |
