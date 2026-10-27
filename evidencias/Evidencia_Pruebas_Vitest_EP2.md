# Evidencia de Pruebas Unitarias Automatizadas (Vitest)
## Proyecto: Aqua-Contratos · Sistema de Gestión de Evaluaciones Psicolaborales
**Asignatura:** DSY1104 · Desarrollo Full Stack II  
**Evaluación:** Evaluación Parcial N° 2 (Ponderación Testing: 25% total)  
**Equipo:** Smiling Friends  
**Entorno de Ejecución:** Vitest v5.0.5 · @testing-library/react v16.3.3 · @testing-library/jest-dom v7.0.1 · jsdom v30.1.3  

---

## 1. Justificación de los Escenarios Seleccionados

Para garantizar la calidad de la solución y responder con exactitud a los indicadores **IE2.2.1 / IE2.3.1** (Encargo) e **IE2.2.2 / IE2.3.2** (Presentación), se estructuraron 5 suites de pruebas que abarcan las reglas críticas de negocio, la lógica de cálculo y la integridad de la interfaz:

### 1.1 Suite 1: Validación de RUT Chileno y Cálculo de Edad (`src/test/calcularRut.test.js`)
* **Justificación:** El RUT es el identificador único obligatorio de candidatos y postulantes (RF02). Un error en su validación permitiría el ingreso de datos basura o corruptos. Se verifica el algoritmo oficial de Módulo 11 para dígitos 0-9, el dígito verificador 'K' (mayúscula y minúscula), la limpieza de puntos y guiones, y el rechazo de valores vacíos o nulos. También se evalúa la función de cálculo de edad para asegurar el cómputo exacto de años cumplidos.

### 1.2 Suite 2: Cálculo Dinámico de Indicadores del Dashboard (`src/test/indicadores.test.js`)
* **Justificación:** El Dashboard Operativo (RF10) consolida 4 métricas críticas para la toma de decisiones de Jefaturas y Analistas: *Candidatos Totales*, *Solicitudes Pendientes*, *En proceso* y *Evaluaciones finalizadas*. Se verifica que el algoritmo totalice con precisión tanto con listas vacías como con listas mixtas de solicitudes.

### 1.3 Suite 3: Algoritmo de Búsqueda y Filtros Multicriterio (`src/test/filtros.test.js`)
* **Justificación:** El requisito RF07 exige filtrar solicitudes en tiempo real. Se prueban escenarios de búsqueda por texto libre (nombre, RUT, cargo), filtros exactos por estado, filtros por planta productiva de AquaChile, y la combinación simultánea de múltiples filtros.

### 1.4 Suite 4: Renderizado de Componentes UI y Bootstrap 5 (`src/test/components.test.jsx`)
* **Justificación:** Se verifica que los componentes visuales reutilizables (`IndicadorCard`, `AlertaExitoCerrable`, `BarraFiltros`) rendericen correctamente sus props, apliquen las clases de maquetación responsive de Bootstrap 5 y disparen los eventos de usuario (`onChange`, `onClick`).

### 1.5 Suite 5: Enrutamiento Declarativo con React Router (`src/test/router.test.jsx`)
* **Justificación:** Comprueba que el componente raíz de la aplicación configure adecuadamente el `<BrowserRouter>` y monte la vista inicial del Portal de Acceso con los accesos directos al Portal de Empleados y Postulante.

---

## 2. Comandos de Ejecución

Para reproducir y ejecutar las pruebas automatizadas:

```bash
# Opción 1: Desde la raíz del repositorio
npm test

# Opción 2: Desde la carpeta del frontend
cd vcm-psicolaboral
npm test

# Opción 3: Modo interactivo / observador
npm --prefix vcm-psicolaboral run test:watch
```

---

## 3. Resumen de Resultados de Ejecución

```text
> vcm-psicolaboral@0.0.0 test
> vitest run

 RUN  v5.0.5 C:/Users/Usuario/OneDrive/Desktop/Aqua-Contratos/vcm-psicolaboral

 ✓ src/test/filtros.test.js (6 tests)
 ✓ src/test/calcularRut.test.js (7 tests)
 ✓ src/test/indicadores.test.js (2 tests)
 ✓ src/test/components.test.jsx (6 tests)
 ✓ src/test/router.test.jsx (1 test)

 Test Files  5 passed (5)
      Tests  22 passed (22)
   Start at  21:21:14
   Duration  1.40s
```

### Detalle de Pruebas Ejecutadas:

| Archivo de Prueba | Casos de Prueba | Resultado |
| :--- | :--- | :---: |
| `src/test/calcularRut.test.js` | 7 pruebas (RUT numérico, RUT con DV 'K', rechazo de RUT inválido, rechazo de nulos/vacíos, limpieza de formato, cálculo de edad, edad con datos nulos) | ✅ 7/7 Aprobadas |
| `src/test/indicadores.test.js` | 2 pruebas (cálculo con lista vacía, totalización de estados Pendiente/Proceso/Finalizada) | ✅ 2/2 Aprobadas |
| `src/test/filtros.test.js` | 6 pruebas (sin filtros, filtro por nombre, filtro por RUT, filtro por estado, filtro por planta, filtros combinados) | ✅ 6/6 Aprobadas |
| `src/test/components.test.jsx` | 6 pruebas (renderizado y props de IndicadorCard, clases Bootstrap 5, AlertaExitoCerrable render/cierre, eventos de BarraFiltros y botón limpiar) | ✅ 6/6 Aprobadas |
| `src/test/router.test.jsx` | 1 prueba (montaje del Router, títulos, portal de empleados y candidato) | ✅ 1/1 Aprobada |
| **TOTAL** | **22 casos de prueba automatizados** | **✅ 100% Exitosos** |

---

## 4. Conclusión
La suite de pruebas con Vitest demuestra la estabilidad del avance frontend del MVP, otorgando comprobabilidad matemática a las funciones críticas del sistema y respaldo objetivo para la evaluación en vivo ante el docente.
