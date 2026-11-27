/**
 * Servicio de Almacenamiento Privado de CVs (Requisito clave de TI)
 * 
 * Crea automáticamente una carpeta privada en el servidor identificada con el
 * ID único y nombre del postulante (`uploads/postulantes/candidato_<id>_<nombre>/`)
 * y gestiona el guardado y descarga segura del currículum vitae (PDF).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_UPLOADS_DIR = path.resolve(__dirname, "../../uploads/postulantes");

/**
 * Asegura la existencia del directorio base
 */
function asegurarDirectorioBase() {
    if (!fs.existsSync(BASE_UPLOADS_DIR)) {
        fs.mkdirSync(BASE_UPLOADS_DIR, { recursive: true });
    }
}

/**
 * Sanitiza una cadena para uso seguro en nombres de carpetas
 */
function sanitizarNombre(texto = "") {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quitar tildes
        .replace(/[^a-z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 50);
}

/**
 * Genera un PDF mínimo válido en bytes si el postulante no adjuntó un archivo real
 */
function generarPdfMinimo(nombre = "Postulante", rut = "", cargo = "") {
    const contenido = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 180 >> stream
BT
/F1 18 Tf
50 720 Td
(Curriculum Vitae - AquaChile) Tj
/F1 12 Tf
0 -30 Td
(Postulante: ${nombre}) Tj
0 -20 Td
(RUT: ${rut || "No informado"}) Tj
0 -20 Td
(Cargo Postulado: ${cargo || "General"}) Tj
0 -30 Td
(Documento generado por el sistema de postulacion Aqua-Contratos.) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000242 00000 n 
0000000473 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
554
%%EOF`;
    return Buffer.from(contenido, "utf-8");
}

export const cvStorageService = {
    /**
     * Guarda el CV en la carpeta privada del postulante
     */
    guardarCvEnCarpetaPrivada({ candidatoId, nombre, rut, cargo, cvDataUrl, cvBuffer, nombreArchivo }) {
        asegurarDirectorioBase();

        const nombreLimpio = sanitizarNombre(nombre || `postulante_${candidatoId}`);
        const nombreCarpeta = `candidato_${candidatoId}_${nombreLimpio}`;
        const rutaCarpeta = path.join(BASE_UPLOADS_DIR, nombreCarpeta);

        if (!fs.existsSync(rutaCarpeta)) {
            fs.mkdirSync(rutaCarpeta, { recursive: true });
        }

        const archivoFinal = nombreArchivo || `CV_${nombreLimpio}_${candidatoId}.pdf`;
        const rutaArchivo = path.join(rutaCarpeta, archivoFinal);

        let bufferGuardar = null;

        if (Buffer.isBuffer(cvBuffer)) {
            bufferGuardar = cvBuffer;
        } else if (typeof cvDataUrl === "string" && cvDataUrl.startsWith("data:")) {
            // Extraer base64
            const partes = cvDataUrl.split(",");
            if (partes.length === 2) {
                bufferGuardar = Buffer.from(partes[1], "base64");
            }
        }

        // Si no vino archivo o no se pudo decodificar, generar PDF institucional
        if (!bufferGuardar || bufferGuardar.length === 0) {
            bufferGuardar = generarPdfMinimo(nombre, rut, cargo);
        }

        fs.writeFileSync(rutaArchivo, bufferGuardar);

        const rutaRelativa = path.join("uploads", "postulantes", nombreCarpeta, archivoFinal).replace(/\\/g, "/");

        return {
            ok: true,
            rutaCarpeta,
            rutaArchivo,
            rutaRelativa,
            nombreCarpeta,
            archivoFinal,
            bytes: bufferGuardar.length,
        };
    },

    /**
     * Obtiene la ruta física del CV de un candidato
     */
    obtenerRutaCv(candidatoId, candidatoDatos = null) {
        asegurarDirectorioBase();

        // Buscar si ya existe la carpeta privada del candidato
        const carpetas = fs.readdirSync(BASE_UPLOADS_DIR);
        const prefijo = `candidato_${candidatoId}_`;
        const carpetaCandidato = carpetas.find((c) => c.startsWith(prefijo));

        if (carpetaCandidato) {
            const rutaCarpeta = path.join(BASE_UPLOADS_DIR, carpetaCandidato);
            const archivos = fs.readdirSync(rutaCarpeta).filter((f) => f.endsWith(".pdf"));
            if (archivos.length > 0) {
                return {
                    existe: true,
                    rutaArchivo: path.join(rutaCarpeta, archivos[0]),
                    nombreArchivo: archivos[0],
                };
            }
        }

        // Si no existía físicamente pero tenemos datos del candidato, crearlo bajo demanda
        if (candidatoDatos) {
            const guardado = this.guardarCvEnCarpetaPrivada({
                candidatoId,
                nombre: candidatoDatos.nombre,
                rut: candidatoDatos.rut,
                cargo: candidatoDatos.cargo || candidatoDatos.especialidad,
                cvDataUrl: candidatoDatos.cvDataUrl,
            });
            return {
                existe: true,
                rutaArchivo: guardado.rutaArchivo,
                nombreArchivo: guardado.archivoFinal,
            };
        }

        return { existe: false, rutaArchivo: null, nombreArchivo: null };
    },
};
