# AQUA-CONTRATOS
Repositorio dedicado una página web creada con React y node

# INDICE
- [Problematica](#problematica)
- [Solucion](#solución)
- [Requisitos funcionales](#requisitos-funcionales)

# PROBLEMATICA
AquaChile es una empresa del rubro acuícola que desarrolla operaciones productivas y administrativas en distintas áreas de gestión. Dentro de sus procesos internos, el área de Reclutamiento y Selección requiere coordinar evaluaciones psicolaborales para candidatos que postulan a distintos cargos.
Actualmente se lleva a cabo todo el proceso en fisico (papeles) y varias herramientas digitales, debido a esto el flujo es torpe y muy propenso a errores, tanto de parte del equipo de contratacion, los departamentos internos y los postulantes

# SOLUCIÓN
Aqua-Contratos es una página web que centraliza información básica del proceso de evaluación psicolaboral, permitiendo registrar candidatos, crear solicitudes, hacer seguimiento de estados y consultar antecedentes relevantes desde una aplicación Full Stack.

# REQUISITOS FUNCIONALES
|Código|Requerimiento funcional|Prioridad|
|:---|---|:---:|
|RF01|Permitir ingreso simple al sistema con usuarios ficticios o roles simulados|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF02|Registrar candidatos con datos mínimos obligatorios|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF03|Editar y consultar información principal de un candidato|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF04|Crear solicitudes de evaluación asociadas a un candidato|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF05|Registrar cargo, familia de cargo, fecha de solicitud y responsable|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF06|Visualizar listado de solicitudes y consultar su detalle|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF07|Buscar o filtrar solicitudes por estado, fecha, cargo o candidato|<div style="background-color: green; color: white; padding: 4px; text-align: center; border-radius: 4px;">Media</div>|
|RF08|Actualizar el estado de la solicitud: Pendiente, En proceso o Finalizada|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF09|Registrar fecha de evaluación, observaciones o resultado general|<div style="background-color: red; color: white; padding: 4px; text-align: center; border-radius: 4px;">Alta</div>|
|RF10|Mostrar dashboard simple con indicadores generales del proceso|<div style="background-color: green; color: white; padding: 4px; text-align: center; border-radius: 4px;">Media</div>|
```mermaid
flowchart TD
    subgraph Analista ["👤 Rol: Analista de Reclutamiento"]
        A(["Inicio: Ingresa a la Web y selecciona rol Analista"]) --> B["Vista Web: Gestión de Candidatos<br/>Completa formulario de nuevo candidato"]
        B --> C{"¿Datos del candidato<br/>son válidos?"}
        C -- "No" --> D["Muestra alerta de validación en el formulario"]
        D --> B
        C -- "Sí" --> E["Guarda candidato en el listado"]
        E --> F["Vista Web: Solicitudes de Evaluación<br/>Crea solicitud asociada al candidato"]
        F --> G["Asigna Cargo, Familia de Cargo,<br/>Evaluador Responsable y Observaciones"]
        G --> H["Guarda Solicitud con estado: PENDIENTE"]
    end

    subgraph Evaluador ["🧠 Rol: Profesional Evaluador"]
        H --> I["Vista Web: Solicitudes de Evaluación<br/>Filtra solicitudes en estado PENDIENTE"]
        I --> J["Vista Web: Detalle y Evaluación<br/>Revisa antecedentes del candidato y cargo"]
        J --> K{"¿Antecedentes completos<br/>para agendar?"}
        K -- "Sí" --> L["Registra Fecha de Evaluación y<br/>cambia estado a: EN PROCESO"]
        L --> M["Realiza evaluación, ingresa Observaciones<br/>y selecciona Categoría de Resultado<br/>(Recomendado / Con obs. / No recomendado)"]
        M --> N{"¿Formulario de evaluación<br/>completo?"}
        N -- "No" --> O["Muestra error de campos obligatorios"]
        O --> M
        N -- "Sí" --> P["Guarda evaluación y<br/>actualiza estado a: FINALIZADA"]
    end

    subgraph Consulta ["📊 Rol: Analista / Jefatura"]
        P --> Q["Vista Web: Dashboard de Inicio<br/>Actualiza tarjetas de indicadores (KPIs)"]
        Q --> R(["Fin: Consulta de solicitud y resultado consolidado"])
    end

    %% Estilos visuales para estados clave
    style H fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000
    style L fill:#cfe2ff,stroke:#0d6efd,stroke-width:2px,color:#000
    style P fill:#d1e7dd,stroke:#198754,stroke-width:2px,color:#000
```
