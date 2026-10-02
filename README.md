# AQUA-CONTRATOS
Repositorio dedicado una página web creada con React y node

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
