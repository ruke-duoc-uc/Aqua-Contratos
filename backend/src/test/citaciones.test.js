import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { enviarCorreoCitacion } from "../services/emailService.js";
import {
    obtenerEstadoIntegracion,
    obtenerUrlAutorizacionGoogle,
    generarEnlaceMeetFallback,
    construirUrlTemplateGoogleCalendar,
    crearCitacionGoogleCalendarConMeet,
} from "../services/googleCalendarService.js";

after(() => {
    setTimeout(() => process.exit(0), 50).unref();
});

describe("Nivel 4: Notificaciones por Correo de Citaciones (Email Service)", () => {
    it("debe rechazar notificación si el candidato no tiene correo informado", async () => {
        const res = await enviarCorreoCitacion({
            nombre: "Juan Pérez",
            email: "",
            cargo: "Operario de Planta",
            fechaEntrevista: "2026-10-28 10:00",
            tipoCitacion: "Entrevistas físicas",
        });

        assert.equal(res.ok, false);
        assert.equal(res.modo, "sin_email");
    });

    it("debe generar exitosamente la notificación en modo desarrollo/simulación si no hay API key de Resend", async () => {
        const res = await enviarCorreoCitacion({
            nombre: "Camila Soto",
            email: "camila.soto@gmail.com",
            cargo: "Técnico en Mantención",
            fechaEntrevista: "2026-10-29 11:30",
            tipoCitacion: "Entrevistas online",
            evaluador: "Amaro Villalobos",
            enlaceGoogleMeet: "https://meet.google.com/abc-defg-hij",
            urlGoogleCalendar: "https://calendar.google.com/calendar/render?action=TEMPLATE",
            observaciones: "Conectarse 5 minutos antes.",
        });

        assert.equal(res.ok, true);
        assert.ok(["simulacion", "enviado"].includes(res.modo));
    });
});

describe("Nivel 4: Google Calendar API y Google Meet", () => {
    it("debe reportar el estado de la integración con Google Calendar", () => {
        const estado = obtenerEstadoIntegracion();
        assert.ok(estado);
        assert.equal(estado.ok, true);
        assert.ok(estado.modo);
        assert.ok(typeof estado.conectado === "boolean");
    });

    it("debe generar un enlace de Google Meet estructurado en modo fallback", () => {
        const meetUrl = generarEnlaceMeetFallback("camila soto");
        assert.match(meetUrl, /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
    });

    it("debe construir una URL válida de Google Calendar con parámetros de fecha y detalles", () => {
        const url = construirUrlTemplateGoogleCalendar({
            titulo: "Entrevista Psicolaboral · Camila Soto",
            fechaHora: "2026-10-30T10:00",
            duracionMinutos: 45,
            descripcion: "Citación para evaluación técnica",
            ubicacion: "Planta Puerto Montt",
            candidatoEmail: "camila.soto@gmail.com",
        });

        assert.ok(url.startsWith("https://calendar.google.com/calendar/render?"));
        assert.ok(url.includes("action=TEMPLATE"));
        assert.ok(url.includes("Camila"));
        assert.ok(url.includes("add=camila.soto%40gmail.com"));
    });

    it("crearCitacionGoogleCalendarConMeet debe devolver URLs de calendario y meet válidas", async () => {
        const citacion = await crearCitacionGoogleCalendarConMeet({
            cargo: "Operario de Producción",
            candidatoNombre: "Rodrigo Valenzuela",
            candidatoEmail: "rodrigo@gmail.com",
            fechaHora: "2026-11-05T09:30",
            tipoCitacion: "Entrevistas online",
            evaluador: "Constanza Baeza",
        });

        assert.equal(citacion.ok, true);
        assert.ok(citacion.urlGoogleCalendar);
        assert.ok(citacion.enlaceGoogleMeet);
        assert.match(citacion.enlaceGoogleMeet, /^https:\/\/meet\.google\.com\//);
    });
});
