/**
 * Servicio de notificaciones por correo electrónico (Resend)
 * Envía dos correos al recibir una postulación:
 *   1. Confirmación al postulante.
 *   2. Aviso al analista de reclutamiento (CORREO_INFORME).
 *
 * La configuración se lee de forma diferida para que dotenv ya haya cargado
 * el archivo .env. Un fallo de Resend nunca debe interrumpir el registro del
 * candidato: solo se deja una advertencia en consola.
 */
let clienteResend = null;

/** Crea (una sola vez) el cliente de Resend usando la API key del entorno. */
async function obtenerCliente() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    if (!clienteResend) {
        try {
            const { Resend } = await import("resend");
            clienteResend = new Resend(apiKey);
        } catch {
            console.warn("[correo] Paquete 'resend' no instalado: se omiten correos.");
            return null;
        }
    }
    return clienteResend;
}

function remitente() {
    return process.env.RESEND_FROM || "onboarding@resend.dev";
}

function textoConfirmacion({ nombre, cargo }) {
    return `Estimado(a) ${nombre}:

Confirmamos la recepción exitosa de su postulación para el cargo de ${cargo}.

Nuestro equipo evaluará sus antecedentes y nos pondremos en contacto con usted a la brevedad.

Atentamente,
Equipo de Reclutamiento - AquaChile`;
}

function textoAvisoAnalista({ nombre, email, rut, cargo }) {
    return `Estimado(a) Analista,

Se ha recibido una nueva postulación para el cargo de ${cargo}.

Datos del postulante:
- Nombre: ${nombre}
- RUT: ${rut || "No informado"}
- Correo de contacto: ${email || "No informado"}

Los antecedentes se encuentran disponibles para su revisión en la plataforma.`;
}

/**
 * Envía la confirmación al postulante y el aviso al analista.
 * @param {{ nombre: string, email?: string, rut?: string, cargo?: string }} datos
 * @returns {Promise<{ enviados: string[], errores: string[] }>}
 */
export async function enviarCorreosPostulacion(datos) {
    const resend = await obtenerCliente();
    if (!resend) {
        console.warn("[correo] RESEND_API_KEY no configurada: no se enviaron notificaciones.");
        return { enviados: [], errores: ["RESEND_API_KEY no configurada"] };
    }

    const { nombre, email, rut, cargo } = datos;
    const cargoTexto = cargo || "el cargo publicado";
    const destinatarioInforme = process.env.CORREO_INFORME;

    const tareas = [];

    if (email) {
        tareas.push({
            tipo: "confirmacion-postulante",
            promesa: resend.emails.send({
                from: remitente(),
                to: email,
                subject: "Confirmación de Postulación - AquaChile",
                text: textoConfirmacion({ nombre, cargo: cargoTexto }),
            }),
        });
    } else {
        console.warn("[correo] El postulante no informó email: se omite la confirmación.");
    }

    if (destinatarioInforme) {
        tareas.push({
            tipo: "aviso-analista",
            promesa: resend.emails.send({
                from: remitente(),
                to: destinatarioInforme,
                subject: "Nueva Postulación Recibida - AquaChile",
                text: textoAvisoAnalista({ nombre, email, rut, cargo: cargoTexto }),
            }),
        });
    } else {
        console.warn("[correo] CORREO_INFORME no configurado: se omite el aviso al analista.");
    }

    if (tareas.length === 0) {
        return { enviados: [], errores: ["Sin destinatarios configurados"] };
    }

    const resultados = await Promise.allSettled(tareas.map((tarea) => tarea.promesa));
    const enviados = [];
    const errores = [];

    resultados.forEach((resultado, indice) => {
        const tipo = tareas[indice].tipo;
        if (resultado.status === "rejected") {
            errores.push(`${tipo}: ${resultado.reason?.message || "error desconocido"}`);
            return;
        }
        if (resultado.value?.error) {
            errores.push(`${tipo}: ${resultado.value.error.message || "error de Resend"}`);
            return;
        }
        enviados.push(tipo);
    });

    if (errores.length > 0) {
        console.warn("[correo] No se pudieron enviar todas las notificaciones:", errores.join(" | "));
    }
    if (enviados.length > 0) {
        console.log(`[correo] Notificaciones enviadas: ${enviados.join(", ")}`);
    }

    return { enviados, errores };
}

/**
 * Plantilla de texto para citación a entrevista
 */
function textoCitacionCandidato({
    nombre,
    cargo,
    fechaEntrevista,
    tipoCitacion,
    planta,
    evaluador,
    enlaceGoogleMeet,
    urlGoogleCalendar,
    observaciones,
}) {
    const esOnline = tipoCitacion === "Entrevistas online";
    const lineas = [
        `Estimado(a) ${nombre || "Postulante"}:`,
        ``,
        `Le informamos que ha sido citado(a) a una evaluación en el proceso de selección de AquaChile para el puesto de "${cargo || "Postulante"}".`,
        ``,
        `Detalles de la Citación:`,
        `- Tipo / Modalidad: ${tipoCitacion || "Entrevista"}`,
        `- Fecha y Hora: ${fechaEntrevista}`,
        evaluador ? `- Evaluador Responsable: ${evaluador}` : null,
        !esOnline && planta ? `- Ubicación: Planta AquaChile (${planta})` : null,
        esOnline && enlaceGoogleMeet ? `- Sala Google Meet (Videollamada): ${enlaceGoogleMeet}` : null,
        observaciones ? `- Indicaciones: ${observaciones}` : null,
        ``,
        urlGoogleCalendar
            ? `Puede sincronizar esta cita en su Google Calendar mediante el siguiente enlace:\n${urlGoogleCalendar}\n`
            : null,
        `Por favor conéctese o preséntese puntualmente con su cédula de identidad vigente.`,
        ``,
        `Atentamente,`,
        `Equipo de Reclutamiento y Selección · AquaChile`,
    ].filter(Boolean);

    return lineas.join("\n");
}

/**
 * Plantilla HTML con diseño corporativo para la citación
 */
function htmlCitacionCandidato({
    nombre,
    cargo,
    fechaEntrevista,
    tipoCitacion,
    planta,
    evaluador,
    enlaceGoogleMeet,
    urlGoogleCalendar,
    observaciones,
}) {
    const esOnline = tipoCitacion === "Entrevistas online";
    return `
<div style="font-family: Arial, sans-serif; color: #212529; max-width: 600px; margin: 0 auto; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0b3b60; color: white; padding: 22px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">🐟 AquaChile · Citación Oficial</h2>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Gestión de Personas y Evaluación Psicolaboral</p>
    </div>
    <div style="padding: 24px;">
        <p style="font-size: 15px;">Estimado(a) <strong>${nombre || "Postulante"}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5;">
            Nos complace citarle para continuar su proceso de postulación al cargo de <strong>${cargo || "el cargo"}</strong>.
        </p>
        <div style="background-color: #f8f9fa; border-left: 4px solid #e8590c; padding: 16px; margin: 20px 0; border-radius: 4px; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Tipo de Citación:</strong> ${tipoCitacion || "Entrevista"}</p>
            <p style="margin: 5px 0;"><strong>Fecha y Hora:</strong> ${fechaEntrevista}</p>
            ${evaluador ? `<p style="margin: 5px 0;"><strong>Evaluador(a):</strong> ${evaluador}</p>` : ""}
            ${!esOnline && planta ? `<p style="margin: 5px 0;"><strong>Lugar:</strong> Planta AquaChile · ${planta}</p>` : ""}
            ${
                esOnline && enlaceGoogleMeet
                    ? `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #ced4da;">
                        <strong>Videollamada Google Meet:</strong><br/>
                        <a href="${enlaceGoogleMeet}" target="_blank" style="display: inline-block; margin-top: 6px; background-color: #1a73e8; color: white; padding: 8px 14px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px;">
                            🎥 Unirse a Google Meet
                        </a>
                       </div>`
                    : ""
            }
            ${
                observaciones
                    ? `<p style="margin: 10px 0 0; color: #495057; font-size: 13px;"><em>Instrucciones: ${observaciones}</em></p>`
                    : ""
            }
        </div>
        ${
            urlGoogleCalendar
                ? `<div style="text-align: center; margin: 22px 0;">
                    <a href="${urlGoogleCalendar}" target="_blank" style="background-color: #0b3b60; color: white; text-decoration: none; padding: 10px 18px; border-radius: 5px; font-weight: bold; font-size: 13px; display: inline-block;">
                        📅 Añadir a Google Calendar
                    </a>
                   </div>`
                : ""
        }
        <p style="font-size: 13px; color: #6c757d; line-height: 1.4;">
            Si necesita solicitar un cambio de fecha o indicar alguna observación, puede hacerlo ingresando a su portal de postulante en Aqua-Contratos.
        </p>
    </div>
    <div style="background-color: #f1f3f5; padding: 14px; text-align: center; font-size: 11px; color: #868e96;">
        AquaChile S.A. · Puerto Montt, Chile · Correo generado automáticamente por el sistema Aqua-Contratos
    </div>
</div>`;
}

/**
 * Envía el correo de citación al candidato cuando se agenda una entrevista.
 * @param {{
 *   nombre: string,
 *   email: string,
 *   cargo: string,
 *   fechaEntrevista: string,
 *   tipoCitacion: string,
 *   evaluador?: string,
 *   planta?: string,
 *   enlaceGoogleMeet?: string,
 *   urlGoogleCalendar?: string,
 *   observaciones?: string,
 * }} datos
 * @returns {Promise<{ ok: boolean, modo: string, mensaje: string }>}
 */
export async function enviarCorreoCitacion(datos) {
    const { nombre, email, cargo, fechaEntrevista, tipoCitacion } = datos;

    if (!email) {
        console.warn("[correo-citacion] Candidato sin correo registrado: se omite notificación.");
        return { ok: false, modo: "sin_email", mensaje: "Candidato sin correo electrónico." };
    }

    const resend = await obtenerCliente();
    const asunto = `Citación a Entrevista - AquaChile · ${cargo || "Postulación"}`;
    const texto = textoCitacionCandidato(datos);
    const html = htmlCitacionCandidato(datos);

    if (!resend) {
        console.log(`[correo-citacion] (Simulación / Desarrollo) Citación preparada para: ${email} | Asunto: ${asunto}`);
        return {
            ok: true,
            modo: "simulacion",
            mensaje: `Notificación generada correctamente para ${email} (modo simulación/desarrollo sin API key de Resend).`,
        };
    }

    try {
        const respuesta = await resend.emails.send({
            from: remitente(),
            to: email,
            subject: asunto,
            text: texto,
            html: html,
        });

        if (respuesta.error) {
            console.warn("[correo-citacion] Error devuelto por Resend:", respuesta.error);
            return { ok: false, modo: "error_resend", mensaje: respuesta.error.message };
        }

        console.log(`[correo-citacion] Correo enviado exitosamente a ${email} (ID: ${respuesta.data?.id})`);
        return { ok: true, modo: "enviado", id: respuesta.data?.id };
    } catch (error) {
        console.warn("[correo-citacion] Excepción al enviar correo de citación:", error.message);
        return { ok: false, modo: "error_red", mensaje: error.message };
    }
}
