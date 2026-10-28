/**
 * Utilidad para visualización y apertura de Currículum Vitae (CV)
 * Permite abrir el documento del candidato en una nueva pestaña del navegador.
 * Si el usuario subió un PDF real, lo proyecta; si es un candidato del sistema,
 * genera el expediente formal de postulación AquaChile con opción de impresión.
 */

export function abrirCvDocumento(candidato) {
    if (!candidato) return;

    // 1. Si el postulante subió un archivo real (guardado como Data URL base64)
    if (candidato.cvDataUrl) {
        const win = window.open("", "_blank");
        if (win) {
            win.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Currículum Vitae · ${candidato.nombre || "Postulante"}</title>
                    <style>
                        body { margin: 0; padding: 0; background-color: #525659; display: flex; justify-content: center; height: 100vh; }
                        iframe { width: 100%; height: 100%; border: none; }
                    </style>
                </head>
                <body>
                    <iframe src="${candidato.cvDataUrl}" title="Visor de CV"></iframe>
                </body>
                </html>
            `);
            win.document.close();
            return;
        }
    }

    // 2. Si es un candidato del sistema o mock, generar el documento oficial en pestaña nueva
    const win = window.open("", "_blank");
    if (!win) {
        alert("Por favor permite las ventanas emergentes en tu navegador para ver el currículum.");
        return;
    }

    const nombre = candidato.nombre || `${candidato.nombres || ""} ${candidato.apellidos || ""}`.trim() || "Postulante AquaChile";
    const rut = candidato.rut || "No informado";
    const cargo = candidato.cargo || candidato.especialidad || "Operario de Producción";
    const comuna = candidato.comuna || candidato.planta || "Puerto Montt";
    const antecedentes = candidato.antecedentes || "Experiencia comprobada en procesos de producción, mantención y logística en plantas acuícolas.";
    const cvNombre = candidato.cv_pdf || candidato.cvArchivo || `cv_${nombre.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;
    const evaluador = candidato.evaluador || "Felipe Muñoz Parra";
    const estado = candidato.estado || "En proceso";
    const fecha = candidato.fecha ? new Date(candidato.fecha).toLocaleDateString("es-CL") : new Date().toLocaleDateString("es-CL");

    win.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Currículum Vitae · ${nombre}</title>
            <style>
                * { box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background-color: #f1f5f9;
                    margin: 0;
                    padding: 40px 20px;
                    color: #1e293b;
                }
                .documento {
                    max-width: 820px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 48px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    border-top: 8px solid #0e97b3;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 24px;
                    margin-bottom: 28px;
                    gap: 16px;
                }
                .badge-empresa {
                    display: inline-block;
                    background: #e0f7fa;
                    color: #006064;
                    font-weight: 700;
                    font-size: 12px;
                    padding: 5px 12px;
                    border-radius: 16px;
                    margin-bottom: 8px;
                }
                h1 {
                    margin: 4px 0;
                    font-size: 28px;
                    color: #0f172a;
                }
                .cargo-subtitulo {
                    font-size: 18px;
                    color: #0e97b3;
                    font-weight: 600;
                    margin: 0;
                }
                .btn-imprimir {
                    background: #0e97b3;
                    color: #ffffff;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: opacity 0.2s;
                }
                .btn-imprimir:hover {
                    opacity: 0.9;
                }
                .seccion {
                    margin-bottom: 28px;
                }
                .seccion-titulo {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #64748b;
                    font-weight: 700;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 8px;
                    margin-bottom: 16px;
                }
                .grid-datos {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 14px 24px;
                    font-size: 14px;
                }
                .dato-item strong {
                    display: block;
                    font-size: 12px;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                }
                .antecedentes-caja {
                    background: #f8fafc;
                    border-left: 4px solid #0e97b3;
                    padding: 18px 22px;
                    font-size: 14px;
                    line-height: 1.7;
                    border-radius: 0 8px 8px 0;
                    color: #334155;
                }
                .footer-doc {
                    margin-top: 48px;
                    padding-top: 18px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #94a3b8;
                }
                @media print {
                    body { background: white; padding: 0; }
                    .documento { box-shadow: none; border-radius: 0; padding: 20px; }
                    .btn-imprimir { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="documento">
                <div class="header">
                    <div>
                        <span class="badge-empresa">AquaChile · Expediente Digital de Currículum</span>
                        <h1>${nombre}</h1>
                        <p class="cargo-subtitulo">${cargo}</p>
                    </div>
                    <button type="button" class="btn-imprimir" onclick="window.print()">
                        🖨️ Imprimir / Guardar PDF
                    </button>
                </div>

                <div class="seccion">
                    <div class="seccion-titulo">1. Información del Postulante</div>
                    <div class="grid-datos">
                        <div class="dato-item">
                            <strong>RUT Oficial:</strong>
                            <span>${rut}</span>
                        </div>
                        <div class="dato-item">
                            <strong>Planta / Comuna:</strong>
                            <span>${comuna}</span>
                        </div>
                        <div class="dato-item">
                            <strong>Nombre del Archivo Adjunto:</strong>
                            <span style="font-family: monospace; color: #0369a1;">${cvNombre}</span>
                        </div>
                        <div class="dato-item">
                            <strong>Estado de Postulación:</strong>
                            <span>${estado}</span>
                        </div>
                    </div>
                </div>

                <div class="seccion">
                    <div class="seccion-titulo">2. Resumen de Experiencia y Antecedentes</div>
                    <div class="antecedentes-caja">
                        ${antecedentes}
                    </div>
                </div>

                <div class="seccion">
                    <div class="seccion-titulo">3. Control de Reclutamiento y Selección</div>
                    <div class="grid-datos">
                        <div class="dato-item">
                            <strong>Evaluador Responsable:</strong>
                            <span>${evaluador}</span>
                        </div>
                        <div class="dato-item">
                            <strong>Fecha de Registro en Sistema:</strong>
                            <span>${fecha}</span>
                        </div>
                    </div>
                </div>

                <div class="footer-doc">
                    <span>Sistema Aqua-Contratos · Vinculación con el Medio (AquaChile)</span>
                    <span>Documento oficial de selección · Validez interna</span>
                </div>
            </div>
        </body>
        </html>
    `);
    win.document.close();
}
