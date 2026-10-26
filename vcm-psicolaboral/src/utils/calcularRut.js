/**
 * Función para verificar la veracidad de un RUT chileno.
 * Rompe el RUT en cuerpo y dígito verificador para validar con Módulo 11.
 * 
 * @returns {boolean} True si el RUT es válido, false si no lo es.
 * @autor Luxorar 
 */

export function calcularRut(rut, verificador) {
    if (!rut || !verificador) return false;
    const cuerpoLimpio = rut.toString().replace(/[^0-9]/g, "");
    if (cuerpoLimpio.length < 7 || cuerpoLimpio.length > 9) return false;

    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpoLimpio.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpoLimpio[i], 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dvEsperadoNum = 11 - resto;
    const dvEsperado = dvEsperadoNum === 11 ? "0" : dvEsperadoNum === 10 ? "k" : dvEsperadoNum.toString();

    const dvIngresado = verificador.toString().trim().toLowerCase();
    return dvEsperado === dvIngresado;
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD o Date)
 * @param {string|Date} fechaNacimiento
 * @returns {number|null} Edad en años cumplidos o null si es inválida
 */
export function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const nacimiento = new Date(fechaNacimiento);
    if (isNaN(nacimiento.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad >= 0 ? edad : null;
}
