# Guía Maestra para la Presentación Individual (Defensa EP2)
## Proyecto: Aqua-Contratos · Sistema de Gestión de Evaluaciones Psicolaborales
**Asignatura:** DSY1104 · Desarrollo Full Stack II  
**Ponderación de la Presentación:** **60% de la nota final de la EP2**  
**Equipo:** Smiling Friends  

---

## 🎯 Estructura de la Evaluación Individual
El docente evaluará de forma individual a cada integrante según 4 criterios clave (15% cada uno = 60% total):
1. **IE2.1.3 (15%):** Problema y diseño frontend (VcM AquaChile).
2. **IE2.1.4 (15%):** Dominio de componentes, props, `.map()` y Bootstrap 5 en el código.
3. **IE2.1.6 (15%):** Demostración del flujo interactivo y navegación fluida con React Router.
4. **IE2.2.2 / IE2.3.2 (15%):** Ejecución en vivo de Vitest y explicación de testing.

---

## 📌 1. Problema y Diseño Frontend (IE2.1.3 - 15%)

### Pregunta típica del docente:
> *"¿Cuál es la problemática real de AquaChile y qué valor entrega la solución frontend que desarrollaron?"*

### Respuesta modelo para responder con seguridad:
> *"AquaChile gestiona el reclutamiento de cientos de trabajadores en plantas de proceso y faenas (Puerto Montt, Calbuco, Osorno, Castro, etc.). Históricamente, las evaluaciones psicolaborales se coordinaban mediante documentos físicos en papel y correos electrónicos dispersos, lo que provocaba lentitud, falta de estandarización en los dictámenes y nula trazabilidad para las jefaturas.*  
>  
> *Para resolverlo, desarrollamos **Aqua-Contratos**, una Single Page Application en **React 19** que centraliza todo el ciclo: desde que el postulante aplica en línea con validación de RUT y sube su CV, pasando por la gestión del Analista de Reclutamiento y la calificación formal del Profesional Evaluador, hasta la supervisión de indicadores operativos (KPIs) en tiempo real para las Jefaturas de Área.*  
>  
> *El alcance de esta Evaluación Parcial 2 se enfoca en un avance frontend robusto, responsive y probado con Vitest, utilizando datos simulados para garantizar el flujo sin depender obligatoriamente de una base de datos externa."*

---

## 💻 2. Dominio del Código Propio (IE2.1.4 - 15%)

El docente te pedirá: *"Abre tu código y muéstrame dónde usaron props, renderizado con .map(), componentes reutilizables y clases de Bootstrap 5."*

Ten abiertos estos archivos y señala exactamente:

### A) Props y Componentes Reutilizables:
* **Archivo a mostrar:** `src/components/IndicadorCard.jsx`
  * **Explicación:** *"Aquí tenemos un componente reutilizable `IndicadorCard` que recibe mediante `props` desestructuradas el `valor` y el `titulo`. Se utiliza 4 veces en el Dashboard para renderizar cada métrica operativa sin duplicar código."*
* **Archivo a mostrar:** `src/components/AlertaExitoCerrable.jsx`
  * **Explicación:** *"Recibe el `mensaje` y la función callback `onCerrar` como prop. Si no hay mensaje, aplica renderizado condicional retornando `null`."*

### B) Arreglos y Renderizado con `.map()`:
* **Archivo a mostrar:** `src/components/GrillaIndicadores.jsx`
  * **Explicación:** *"Recibe el arreglo `indicadores` y utilizamos `.map()` con una `key` única (`indicador.id`) para renderizar dinámicamente cada tarjeta de KPI."*
* **Archivo a mostrar:** `src/components/BarraFiltros.jsx`
  * **Explicación:** *"En los `<select>`, usamos `.map()` sobre los arreglos `plantasDisponibles` y `evaluadoresDisponibles` centralizados en `constantes.js` para generar las opciones de selección en tiempo real."*

### C) Clases Responsive de Bootstrap 5:
* **Archivo a mostrar:** `src/App.jsx`
  * **Clases:** `container-fluid`, `row g-4 justify-content-center`, `col-12 col-md-6 col-lg-4`, `card h-100 shadow-sm border-0`, `badge`, `btn`.
  * **Explicación:** *"El portal utiliza el sistema de rejilla (Grid) de Bootstrap 5. En pantallas móviles las tarjetas ocupan el ancho completo (`col-12`), en tablets dos columnas (`col-md-6`) y en monitores de escritorio tres columnas (`col-lg-4`)."*
* **Archivo a mostrar:** `src/components/IndicadorCard.jsx`
  * **Clases:** `card shadow-sm h-100 border`, `card-body`, `card-subtitle text-secondary`, `fs-1 fw-bold text-primary`.
* **Archivo a mostrar:** `src/components/CandidatosRecientes.jsx`
  * **Clases:** Badges de estado contextuales de Bootstrap 5 (`badge bg-warning text-dark`, `badge bg-primary`, `badge bg-success`).

---

## 🔄 3. Recorrido del Flujo Interactivo (IE2.1.6 - 15%)

### Pasos recomendados para hacer la demo en vivo:

1. **Paso 1: Portal de Acceso Principal (`http://localhost:5173/`)**
   * Muestra la pantalla inicial con dos accesos: **Portal de Empleados** y **Postulante a Trabajo**.
2. **Paso 2: Postulación Pública (`/candidato` o `/postular`)**
   * Haz clic en *"Postular a un cargo"*.
   * Demuestra la validación de RUT chileno: ingresa un RUT erróneo para que el profesor vea el bloqueo, luego ingresa uno válido (ej. `11.111.111-1`).
   * Adjunta un archivo de prueba y envía la postulación.
   * Muestra el **Comprobante Digital** generado inmediatamente y haz clic en **"↗ Ver CV en nueva pestaña"** para mostrar el expediente generado.
3. **Paso 3: Portal de Empleados y Analista (`/analista`)**
   * Vuelve al inicio y entra a *Portal de Empleados* -> *Analista de Reclutamiento*.
   * Muestra que el candidato postulado aparece en la tabla en tiempo real.
   * Abre el botón **"Detalle"**: muestra los antecedentes y haz clic en **"↗ Abrir CV en nueva pestaña"**.
   * Demuestra los filtros en tiempo real en la barra de búsqueda (filtrar por estado *Pendiente* o por planta *Puerto Montt*).
4. **Paso 4: Profesional Evaluador (`/evaluador`)**
   * Sal al portal y entra como *Profesional Evaluador*.
   * Abre la solicitud en estado *Pendiente*.
   * Cambia el estado a *En proceso*, registra la fecha de entrevista y califica con dictamen *Recomendado* ingresando observaciones clínicas.
   * Al guardar, muestra la alerta verde de confirmación y el cambio a estado *Finalizado*.
5. **Paso 5: Jefe de Área (`/jefatura`)**
   * Entra a *Jefe de Área* y muestra cómo los 4 KPIs (Totales, Pendientes, En proceso y Finalizadas) se actualizaron instantáneamente.

### Si el docente pregunta: *"¿Esto está conectado a la base de datos?"*
> *"Para esta entrega de la Evaluación Parcial 2, la rúbrica establece explícitamente trabajar con avance frontend y datos simulados en cliente (`localStorage`). Toda la reactividad, persistencia local y validación opera de forma autónoma. No obstante, en la carpeta `backend/` ya dejamos estructurada la API REST en Node.js + Express con base de datos SQLite para la etapa final Full Stack."*

---

## 🧪 4. Ejecución y Explicación de Testing con Vitest (IE2.2.2 / IE2.3.2 - 15%)

El docente te pedirá: *"Abre una terminal, ejecuta las pruebas automatizadas y explícame qué verifican."*

### Paso a paso:
1. Abre la terminal en la raíz del proyecto y escribe:
   ```bash
   npm test
   ```
2. Muestra los resultados en pantalla:
   * **5 archivos de prueba (Test Files: 5 passed).**
   * **23 pruebas unitarias completadas en verde (Tests: 23 passed).**
   * Tiempo de ejecución: **~1.5 segundos**.

### Explicación de cada archivo de prueba:
* **`calcularRut.test.js` (7 tests):**  
  *"Prueba la función algorítmica de Módulo 11 que valida el RUT chileno. Probamos números estándar, RUTs que terminan en dígito verificador 'K' (mayúscula y minúscula), rechazo de dígitos incorrectos, rechazo de valores vacíos o nulos, limpieza automática de puntos y guiones, y el cálculo de edad a partir de la fecha de nacimiento."*
* **`indicadores.test.js` (2 tests):**  
  *"Verifica la lógica de negocio que totaliza las métricas del Dashboard (Candidatos Totales, Solicitudes Pendientes, En proceso y Finalizadas), comprobando tanto listas vacías como listas con estados mixtos."*
* **`filtros.test.js` (6 tests):**  
  *"Prueba el algoritmo de filtrado en tiempo real: búsqueda por texto libre (nombre, RUT, cargo), filtro exacto por estado, filtro por planta acuícola y la combinación simultánea de múltiples criterios."*
* **`components.test.jsx` (6 tests):**  
  *"Utiliza `@testing-library/react` para montar los componentes en un DOM simulado (`jsdom`). Verifica que `IndicadorCard` renderice sus datos y aplique las clases de Bootstrap 5 (`card`, `shadow-sm`), que `AlertaExitoCerrable` responda al clic de cierre y que `BarraFiltros` dispare los eventos de búsqueda y limpieza."*
* **`router.test.jsx` (2 tests):**  
  *"Comprueba la integración de React Router, verificando que la ruta inicial monte correctamente el portal de acceso y navegue hacia el portal de empleados."*

---

## 🏆 Resumen de Éxito
Siguiendo este guion, tendrás cubierto cada uno de los 4 indicadores con argumentos técnicos sólidos, referencias exactas a tu código y demostraciones prácticas en vivo.
