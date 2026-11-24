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
