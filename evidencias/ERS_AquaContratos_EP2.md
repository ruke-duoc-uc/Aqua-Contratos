# Especificación de Requisitos de Software (ERS)
## Proyecto: Aqua-Contratos · Sistema de Gestión de Evaluaciones Psicolaborales
**Asignatura:** DSY1104 · Desarrollo Full Stack II  
**Evaluación:** Evaluación Parcial N° 2 (30%)  
**Equipo:** Smiling Friends  
**Integrantes:** Amaro Villalobos · Cristóbal Loncón · Joaquín Oyarzún · Luis Villalón  
**Cliente VcM:** AquaChile  

---

## 1. Introducción y Propósito

El presente documento de **Especificación de Requisitos de Software (ERS)** define el alcance técnico y funcional del proyecto **Aqua-Contratos** correspondiente a la **Evaluación Parcial 2**.

### 1.1 Problemática Real (AquaChile)
AquaChile es una empresa líder del sector acuícola nacional. Dentro de su ciclo de reclutamiento y selección de personal para plantas de proceso y oficinas operativas (Puerto Montt, Calbuco, Osorno, Castro, etc.), las jefaturas de área solicitan evaluaciones psicolaborales a profesionales evaluadores. Históricamente, este flujo se gestionaba con planillas manuales, correos electrónicos y documentos físicos en papel, provocando:
* Pérdida de trazabilidad del estado de las solicitudes.
* Falta de estandarización en los dictámenes psicolaborales.
* Desconexión entre postulantes externos, reclutadores internos, evaluadores y jefaturas.
* Falta de indicadores en tiempo real (KPIs) para la toma de decisiones.

### 1.2 Solución Propuesta (MVP Frontend)
El MVP web **Aqua-Contratos** centraliza en una plataforma SPA moderna construida con **React 19**, **Bootstrap 5**, **React Router 7** y validada con pruebas unitarias en **Vitest**, permitiendo digitalizar el ciclo completo de evaluación de candidatos con datos simulados y persistencia en cliente.

---

## 2. Roles del Sistema y Actores del Proceso

| Rol | Tipo de Acceso | Responsabilidades en el Sistema |
| :--- | :--- | :--- |
| **Analista de Reclutamiento** | Interno (`/analista`) | Registro de nuevos candidatos, emisión de solicitudes de evaluación psicolaboral, seguimiento de estados y revisión de informes. |
| **Profesional Evaluador** | Interno (`/evaluador`) | Revisión de solicitudes asignadas, actualización de estado a *En proceso*, registro de fecha de entrevista y emisión de dictamen formal. |
| **Jefe de Área / Jefatura** | Interno (`/jefatura`) | Supervisión de indicadores en tiempo real (KPIs), consulta del avance de postulaciones de su planta y solicitud de informes de gestión. |
| **Postulante a Trabajo** | Público (`/candidato` o `/postular`) | Consulta de ofertas laborales abiertas en plantas AquaChile, postulación en línea con validación de RUT y emisión de comprobante inmediato. |

---

## 3. Alcance Implementado (Evaluación Parcial 2)

A continuación se detalla la matriz de requisitos funcionales implementados y verificables en el Frontend:

| Código | Requisito Funcional | Estado | Componentes / Vistas Responsables |
| :--- | :--- | :---: | :--- |
| **RF01** | **Navegación declarativa por roles y portales** | 🟢 Implementado | `App.jsx`, `HeaderRoles.jsx`, implementado con **React Router** (`/`, `/empleados`, `/analista`, `/evaluador`, `/jefatura`, `/candidato`). |
| **RF02** | **Registro de candidatos con validación obligatoria** | 🟢 Implementado | `ModalNuevaSolicitud.jsx`, `FormularioPostulacion.jsx`. Valida RUT chileno (Módulo 11), nombres, apellidos y cargos. |
| **RF03** | **Edición y consulta de candidatos** | 🟢 Implementado | `ModalEditarCandidato.jsx`, `ModalDetalleSolicitud.jsx`. Permite modificar datos laborales y antecedentes. |
| **RF04** | **Emisión de solicitudes de evaluación asociadas a candidato** | 🟢 Implementado | `ModalNuevaSolicitud.jsx` vincula candidato, cargo y evaluador responsable. |
| **RF05** | **Asignación de catálogos base (Planta, Familia, Evaluador)** | 🟢 Implementado | Catálogos de plantas de AquaChile (Puerto Montt, Castro, Calbuco, etc.) y evaluadores integrados. |
| **RF06** | **Visualización de solicitudes y trazabilidad de detalle** | 🟢 Implementado | `PanelSolicitudes.jsx`, `CandidatosRecientes.jsx` con badges de estado y modal completo de consulta. |
| **RF07** | **Búsqueda y filtros reactivos multicriterio** | 🟢 Implementado | `BarraFiltros.jsx`. Filtrado instantáneo por texto, RUT, cargo, estado, planta y evaluador. |
| **RF08** | **Actualización interactiva del ciclo de vida de la solicitud** | 🟢 Implementado | Transición entre estados (*Pendiente*, *En proceso*, *Finalizado*) desde el modal de detalle. |
| **RF09** | **Formulario de dictamen psicolaboral** | 🟢 Implementado | `ModalDetalleSolicitud.jsx` con registro de fecha de entrevista, observaciones clínicas y dictamen (*Recomendado*, *Con observaciones*, *No recomendado*). |
| **RF10** | **Dashboard con Indicadores Operativos (KPIs)** | 🟢 Implementado | `GrillaIndicadores.jsx`, `IndicadorCard.jsx` con cálculo dinámico y maquetación responsive **Bootstrap 5**. |

---

## 4. Requisitos No Funcionales Implementados

1. **Arquitectura de Componentes (React 19 + Vite):** Modularización en componentes reutilizables, paso limpio de props y renderizado de colecciones mediante `.map()`.
2. **Navegación SPA (React Router 7):** Rutas declarativas con sincronización en la barra de direcciones del navegador, botones atrás/adelante funcionales y redirección de rutas inexistentes (`*` a `/`).
3. **Diseño Visual y Responsividad (Bootstrap 5):** Integración de estilos y clases responsive (`container-fluid`, `row`, `col-*`, `card`, `alert`, `badge`, `form-control`, `form-select`).
4. **Calidad de Software y Testing Automatizado (Vitest):** Suite de 22 pruebas automatizadas cubriendo validaciones de RUT chileno (Módulo 11), cálculo de edad, filtrado multicriterio, cálculo de KPIs y renderizado de componentes.
5. **Persistencia Simulada y Conectividad Híbrida:** Operación offline mediante `localStorage` con soporte reactivo a eventos `storage`, con compatibilidad hacia la API REST desarrollada en Express.

---

## 5. Funcionalidades Pendientes (Próxima Etapa: Entrega Final Full Stack)

Las siguientes capacidades corresponden al alcance de la evaluación final y no forman parte de las exigencias mínimas de la EP2:
1. **Autenticación Formal y Sesiones:** Integración de JWT (JSON Web Tokens) y contraseñas cifradas en backend para reemplazar los selectores de roles simulados.
2. **Persistencia Exclusiva en Base de Datos de Producción:** Desactivación de capas locales (`localStorage`) y consumo exclusivo de base de datos relacional centralizada.
3. **Generación y Descarga de Certificados PDF:** Generación en servidor del informe psicolaboral oficial firmado digitalmente para exportación PDF.
4. **Módulo de Auditoría y Logs:** Registro transaccional en base de datos de cada cambio de estado realizado por analistas o evaluadores.
