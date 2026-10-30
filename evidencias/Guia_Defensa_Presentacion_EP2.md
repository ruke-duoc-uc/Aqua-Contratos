# Guía Maestra para la Defensa Técnica Individual (EP2 · Nota 7.0)
## Proyecto: Aqua-Contratos · Sistema de Gestión de Evaluaciones Psicolaborales
**Asignatura:** DSY1104 · Desarrollo Full Stack II  
**Ponderación de la Presentación Individual:** **60% de la nota de la Evaluación Parcial 2**  
**Equipo:** Smiling Friends (Amaro Villalobos · Cristóbal Loncón · Joaquín Oyarzún · Luis Villalón)

---

## 📋 0. Preparación Previa (2 minutos antes de presentar)

1. Abre dos terminales en la raíz del proyecto (`Aqua-Contratos`):
   * **Terminal 1 (Servidor Frontend):**
     ```bash
     npm run dev:frontend
     ```
     Verifica que abra en `http://localhost:5173`.
   * **Terminal 2 (Lista para ejecutar Vitest en vivo):**
     Deja escrita o lista la instrucción:
     ```bash
     npm test
     ```
2. Ten abierto en VS Code estos 6 archivos clave en pestañas para mostrarlos al instante cuando el profesor pregunte:
   * `vcm-psicolaboral/src/App.jsx` *(React Router + Grid Bootstrap 5 + `.map()`)*
   * `vcm-psicolaboral/src/pages/AnalistaPage.jsx` *(Hooks `useState`, `useMemo`, `useEffect`, eventos y flujo)*
   * `vcm-psicolaboral/src/components/IndicadorCard.jsx` y `GrillaIndicadores.jsx` *(Props y `.map()`)*
   * `vcm-psicolaboral/src/components/ModalNuevaSolicitud.jsx` y `ModalDetalleSolicitud.jsx` *(Formularios validados)*
   * `vcm-psicolaboral/src/utils/calcularRut.js` y `solicitudesUtils.js` *(Lógica de negocio pura)*
   * `vcm-psicolaboral/src/test/components.test.jsx` *(Testing de componentes y formularios con Vitest)*

---

## 🎯 1. Criterio 1: Problema VcM y Diseño Frontend (IE2.1.3 — 15%)

### ¿Qué evalúa la rúbrica para el 100%?
> *"Explica con claridad problema VcM, alcance, diseño React y valor de funcionalidades demostradas."*

### Guion de respuesta (1 minuto):
> *"El proyecto **Aqua-Contratos** responde a una problemática real de Vinculación con el Medio planteada por **AquaChile**: en sus plantas operativas (Puerto Montt, Osorno, Castro, Calbuco, Puerto Varas, Ancud y Frutillar), la coordinación de evaluaciones psicolaborales entre Reclutamiento, Psicólogos Evaluadores y Jefaturas se realizaba en papel, planillas sueltas y correos, perdiendo trazabilidad de en qué etapa estaba cada candidato y demorando las contrataciones.*
>
> *Nuestra solución es un **MVP Frontend en React 19 con Vite, Bootstrap 5 y React Router 7**, que centraliza el flujo completo en 4 perfiles conectados:*
> 1. ***Postulante (`/candidato`):*** *Postula a vacantes abiertas validando su RUT con Módulo 11 y adjuntando su CV.*
> 2. ***Analista de Reclutamiento (`/analista`):*** *Registra y edita candidatos, emite solicitudes de evaluación psicolaboral y asigna evaluador, planta y familia de cargo.*
> 3. ***Profesional Evaluador (`/evaluador`):*** *Filtra sus solicitudes asignadas, cambia el estado a 'En proceso' y emite el dictamen psicolaboral formal ('Recomendado', 'Con observaciones' o 'No recomendado').*
> 4. ***Jefe de Área (`/jefatura`):*** *Supervisa en tiempo real los 4 KPIs operativos del proceso en modo lectura y solicita informes específicos."*

---

## 💻 2. Criterio 2: Dominio de Componentes, Props, `.map()` y Bootstrap 5 (IE2.1.4 — 15%)

### ¿Qué evalúa la rúbrica para el 100%?
> *"Demuestra y explica props, .map(), componentes, estructura y Bootstrap 5 en código propio con precisión."*

Cuando el docente te pida mostrar el código, ve directo a estos ejemplos exactos:

### A) Componentes Funcionales y `props`
* **Archivo:** `vcm-psicolaboral/src/components/IndicadorCard.jsx` (líneas 5–20)
  * **Qué explicar:** *"Este componente funcional recibe `{ valor, titulo }` por desestructuración de `props`. Es 100% reutilizable: no sabe qué métrica está mostrando, solo recibe el título y el número calculado dinámicamente desde la página padre."*
* **Archivo:** `vcm-psicolaboral/src/components/AlertaExitoCerrable.jsx`
  * **Qué explicar:** *"Recibe la prop `mensaje` (string) y el callback `onCerrar` (función). Aplica **renderizado condicional** (`if (!mensaje) return null`) para no ocupar espacio en el DOM cuando no hay alertas activas."*

### B) Arreglos y Renderizado Dinámico con `.map()`
* **Archivo:** `vcm-psicolaboral/src/components/GrillaIndicadores.jsx` (líneas 3–15)
  * **Qué explicar:** *"Recibe el arreglo `indicadores` y lo recorre con `.map()`, asignando `key={indicador.id}` para que el Virtual DOM de React identifique cada elemento de forma óptima."*
* **Archivo:** `vcm-psicolaboral/src/components/PanelSolicitudes.jsx` (líneas 43–63)
  * **Qué explicar:** *"Aquí combinamos un operador ternario (`solicitudes.length > 0 ? ... : ...`) con `solicitudes.map()` para renderizar cada fila mediante `<CandidatosRecientes />`, o bien mostrar el componente `<EstadoVacio />` si los filtros no arrojan coincidencias."*

### C) Diseño Responsive con Bootstrap 5
* **Archivo:** `vcm-psicolaboral/src/main.jsx` (línea 3) -> `import 'bootstrap/dist/css/bootstrap.min.css'`
* **Archivo:** `vcm-psicolaboral/src/components/IndicadorCard.jsx` (líneas 7–13)
  * **Qué explicar:** *"Usamos el Grid System de Bootstrap 5: `row g-3` en el contenedor padre (`GrillaIndicadores.jsx`) y `col-12 col-sm-6 col-lg-3` en cada `IndicadorCard`. Así, en celulares (`col-12`) se ve 1 tarjeta por fila, en tablets (`col-sm-6`) 2 por fila, y en escritorio (`col-lg-3`) las 4 tarjetas en una sola línea. Además usamos `card shadow-sm h-100`."*
* **Archivo:** `vcm-psicolaboral/src/components/BarraFiltros.jsx` (líneas 29–105)
  * **Qué explicar:** *"Los controles de búsqueda y filtrado usan `form-control form-control-sm`, `form-select form-select-sm`, `btn btn-sm btn-outline-secondary` y utilidades Flexbox de Bootstrap (`d-flex flex-wrap gap-2 align-items-center`)."*
* **Archivo:** `vcm-psicolaboral/src/components/CandidatosRecientes.jsx` (líneas 8–23)
  * **Qué explicar:** *"Los estados usan badges semánticos de Bootstrap 5: `badge bg-warning text-dark` para Pendiente, `badge bg-primary` para En proceso y `badge bg-success` para Finalizado."*

---

## 🔄 3. Criterio 3: Flujo Interactivo, Estado, Validaciones y React Router (IE2.1.6 — 15%)

### ¿Qué evalúa la rúbrica para el 100%?
> *"Presenta flujo fluido con estado, eventos, filtros, formularios, validaciones y React Router; diferencia simulación y operación real."*

### Recorrido paso a paso para la demostración en vivo (3 minutos):

1. **Navegación con React Router (`/` -> `/empleados` -> `/analista`):**
   * En el navegador (`http://localhost:5173/`), muestra cómo al hacer clic en **"Ingresar como Empleado"** la URL cambia a `/empleados`, y al elegir **Analista de Reclutamiento** cambia a `/analista` (configurado en `src/App.jsx` líneas 298–322 con `<BrowserRouter>`, `<Routes>` y `useNavigate()`).
2. **Registro y Validación de Formulario (`ModalNuevaSolicitud.jsx`):**
   * En `/analista`, haz clic en **`+ Nueva solicitud`**.
   * **Demuestra la validación:** Escribe un RUT inválido como `11.111.111-9`, completa nombre, apellido y cargo, y presiona **"Emitir Solicitud"**.
   * Muestra que el sistema **bloquea el envío** y despliega la alerta roja de validación Módulo 11 (`✕ Dígito verificador inválido`).
   * Corrige el RUT a `11.111.111-1` (aparece en verde `✓ RUT válido`) y guarda la solicitud.
   * Muestra la alerta verde de éxito y que el KPI **"Candidatos Totales"** subió de `10` a `11`, y **"Solicitudes Pendientes"** subió automáticamente.
3. **Búsqueda y Filtros Multicriterio en Tiempo Real (`BarraFiltros.jsx` + `solicitudesUtils.js`):**
   * Escribe el nombre o RUT del candidato recién creado en el buscador para ver cómo filtra al instante (`onChange` -> `setBusqueda` -> `useMemo` con `aplicarFiltros`).
   * Filtra por Planta (`Puerto Montt`) o por Estado (`Pendiente`) y luego presiona **`✕ Limpiar filtros`**.
4. **Evaluación Psicolaboral y Cambio de Estado (`/evaluador`):**
   * Haz clic en **`← Salir al Portal`** y entra como **Profesional Evaluador (`/evaluador`)**.
   * Abre el **`Detalle`** del candidato recién creado (que persiste entre rutas gracias a `guardarCandidatosGlobales` en `localStorage`).
   * **Demuestra la validación del Evaluador:** Intenta presionar **"Guardar Dictamen de Evaluación"** sin elegir dictamen o sin escribir conclusiones: el formulario muestra alerta de validación exigiendo el dictamen y las observaciones clínicas.
   * Selecciona Dictamen **`Recomendado`**, escribe las conclusiones psicolaborales y presiona **"Guardar Dictamen de Evaluación"**.
   * Muestra cómo el estado pasa automáticamente a **`Finalizado`** (badge verde) y el KPI **"Evaluaciones finalizadas"** aumenta en +1.
5. **Supervisión en Jefatura (`/jefatura`):**
   * Sal al portal y entra a **Jefe de Área (`/jefatura`)**.
   * Muestra que los KPIs reflejan inmediatamente la evaluación finalizada y que desde la vista de Jefatura el modal de detalle es de **solo lectura** (`puedeEvaluar = rolActual === "evaluador"` en `ModalDetalleSolicitud.jsx` línea 41), respetando los permisos del rol.

### Cómo explicar la diferencia entre Simulación y Operación Real (pregunta segura del docente):
> *"Tal como pide la rúbrica de la EP2, el frontend es 100% funcional de manera autónoma usando datos simulados iniciales (`CANDIDATOS_BASE` en `candidatosStorage.js`) y persistencia reactiva en el navegador (`localStorage` + eventos `CustomEvent`), comunicando claramente en el banner superior (`BannerEstadoBackend.jsx`) cuando está `'Operando en Modo Local (localStorage)'`. Adicionalmente, dejamos preparada la capa `src/services/api.js` y la carpeta `backend/` (Express + SQLite) para la entrega final Full Stack."*

---

## 🧪 4. Criterio 4: Ejecución y Explicación de Testing con Vitest (IE2.2.2 / IE2.3.2 — 15%)

### ¿Qué evalúa la rúbrica para el 100%?
> *"Ejecuta Vitest, interpreta resultados y justifica escenarios, errores y utilidad para la calidad del frontend."*

### Paso 1: Ejecutar en vivo en la terminal
Ejecuta:
```bash
npm test
```
Verás en pantalla:
```text
 ✓ src/test/calcularRut.test.js (8 tests)
 ✓ src/test/indicadores.test.js (2 tests)
 ✓ src/test/filtros.test.js (6 tests)
 ✓ src/test/components.test.jsx (7 tests)
 ✓ src/test/router.test.jsx (2 tests)

 Test Files  5 passed (5)
      Tests  25 passed (25)
```

### Paso 2: Cómo explicar e interpretar cada una de las 5 suites (25 pruebas)

1. **`src/test/calcularRut.test.js` (8 pruebas unitarias):**
   * **Qué importa:** `calcularRut`, `validarRutCompleto` y `calcularEdad` desde `src/utils/calcularRut.js`.
   * **Qué comprueba y por qué es útil:** Verifica matemáticamente el algoritmo chileno de Módulo 11 (RUTs con dígito 0–9, dígito `'K'` mayúscula/minúscula, rechazo de dígitos erróneos, rechazo de strings vacíos/nulos y limpieza de puntos/guiones). Garantiza que ningún analista ni postulante pueda ingresar RUTs falsos al sistema.
2. **`src/test/indicadores.test.js` (2 pruebas unitarias):**
   * **Qué importa:** `calcularIndicadores` desde `src/utils/solicitudesUtils.js`.
   * **Qué comprueba y por qué es útil:** Verifica que los 4 KPIs del Dashboard (*Totales*, *Pendientes*, *En proceso*, *Finalizadas*) sumen con exactitud tanto cuando el arreglo está vacío (`0`) como cuando existen múltiples solicitudes en distintos estados.
3. **`src/test/filtros.test.js` (6 pruebas unitarias):**
   * **Qué importa:** `aplicarFiltros` desde `src/utils/solicitudesUtils.js`.
   * **Qué comprueba y por qué es útil:** Comprueba la búsqueda insensible a mayúsculas por nombre y RUT, el filtrado exacto por estado y por planta acuícola, y la intersección de múltiples filtros combinados al mismo tiempo.
4. **`src/test/components.test.jsx` (7 pruebas de componentes con `@testing-library/react` y `jsdom`):**
   * **Qué importa:** `IndicadorCard`, `AlertaExitoCerrable`, `BarraFiltros` y `ModalNuevaSolicitud`.
   * **Qué comprueba y por qué es útil:**
     * Que `IndicadorCard` renderice sus props y aplique las clases `card` y `shadow-sm` de Bootstrap 5.
     * Que `AlertaExitoCerrable` no renderice nada si el mensaje es vacío y ejecute el spy `vi.fn()` al hacer clic en cerrar.
     * Que `BarraFiltros` dispare los eventos `onChange` al escribir y muestre/ejecute el botón de limpiar filtros.
     * Que `ModalNuevaSolicitud` **bloquee el submit** (`expect(handleGuardar).not.toHaveBeenCalled()`) y muestre un `role="alert"` cuando se intenta enviar un RUT inválido (`11.111.111-9`).
5. **`src/test/router.test.jsx` (2 pruebas de integración de rutas):**
   * **Qué importa:** `App` desde `src/App.jsx`.
   * **Qué comprueba y por qué es útil:** Verifica que React Router monte correctamente la pantalla de inicio (`/`) y que al hacer clic en *"Ingresar como Empleado"* navegue hacia la selección de cargos (`/empleados`).

---

## ❓ 5. Preguntas Frecuentes del Docente (Respuestas Rápidas para el 7.0)

* **P1: *"¿Dónde usan `useState` y cómo actualiza la interfaz?"***
  * **Respuesta:** En `AnalistaPage.jsx` (líneas 24–54) manejamos estados como `candidatos`, `busqueda`, `filtroEstado`, `filtroPlanta` y `modalNuevaAbierto`. Cuando el usuario escribe en el buscador o guarda una solicitud, la función setter (`setBusqueda` o `setCandidatos`) actualiza el estado e induce un re-render automático en React, recalculando `solicitudesFiltradas` e `indicadores`.
* **P2: *"¿Por qué usaron `useMemo` en las páginas?"***
  * **Respuesta:** En `AnalistaPage.jsx` (líneas 136–146) usamos `useMemo` para memorizar `indicadores` y `solicitudesFiltradas`. Así evitamos recalcular el filtrado si cambia un estado no relacionado (como abrir o cerrar un modal).
* **P3: *"¿Qué pasa si escribo una ruta que no existe en la URL, como `/xyz`?"***
  * **Respuesta:** En `src/App.jsx` (línea 318) definimos una ruta comodín `<Route path="*" element={<Navigate to="/" replace />} />` que redirige automáticamente al portal principal evitando pantallas en blanco o enlaces rotos (requisito explícito de la Clase 7 y 8).
* **P4: *"¿Cómo evitaron que las acciones aparenten guardar sin comunicarlo al usuario?"***
  * **Respuesta:** Cumpliendo la instrucción 5 de la pauta, cada operación muestra feedback inmediato mediante `<AlertaExitoCerrable />`, actualiza el contador de los KPIs en pantalla, persiste en `localStorage` y muestra en `<BannerEstadoBackend />` si los datos se están guardando en modo local (`localStorage`) o en el servidor backend.
