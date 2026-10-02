# AQUA-CONTRATOS
Repositorio dedicado una página web creada con React y node

@startuml
title Flujo Principal MVP - Gestión de Evaluaciones Psicolaborales (AquaChile)

|Analista de Reclutamiento|
start
:Ingresa al sistema (Selector de Rol);
:Abre "Formulario de Candidato" y
registra datos del postulante;

if (¿Datos de candidato válidos?) then (No)
  :Muestra errores de validación;
  stop
else (Sí)
  :Guarda Candidato en el sistema;
endif

:Abre "Nueva Solicitud de Evaluación"
y asocia al Candidato;
:Asigna Cargo, Familia de Cargo,
Evaluador Responsable y Observaciones;
:Guarda Solicitud (Estado = **Pendiente**);

|Profesional Evaluador|
:Consulta "Listado de Solicitudes"
y filtra estado **Pendiente**;
:Abre "Detalle de Solicitud";
:Registra Fecha de Evaluación y
actualiza estado a **En proceso**;
:Realiza evaluación y registra Observaciones
y Resultado (Recomendado / Con obs. / No rec.);

if (¿Datos de evaluación completos?) then (No)
  :Muestra alerta de campos requeridos;
else (Sí)
  :Actualiza estado a **Finalizada**;
endif

|Analista de Reclutamiento / Jefatura|
:Visualiza indicadores actualizados en "Dashboard";
:Consulta resultado final en "Detalle de Solicitud";
stop
@enduml
