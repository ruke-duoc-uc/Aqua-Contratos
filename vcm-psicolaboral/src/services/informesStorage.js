/**
 * Utilidades de almacenamiento local (fallback) para Solicitudes de Informes.
 * Permite que Analistas, Evaluadores y Jefatura compartan y sincronicen las
 * solicitudes de informe aun cuando el backend no esté en ejecución.
 */

export const STORAGE_KEY_INFORMES = "aqua_contratos_informes_mvp_v2";

export const INFORMES_INICIALES = [];

export const cargarInformesIniciales = () => {
    try {
        const datos = localStorage.getItem(STORAGE_KEY_INFORMES);
        if (datos) {
            return JSON.parse(datos);
        }
    } catch {
        // En caso de fallo de lectura de localStorage, retorna iniciales
    }
    return INFORMES_INICIALES;
};

export const guardarInformesLocal = (informes) => {
    try {
        localStorage.setItem(STORAGE_KEY_INFORMES, JSON.stringify(informes));
    } catch {
        // Ignorar errores de almacenamiento
    }
};
