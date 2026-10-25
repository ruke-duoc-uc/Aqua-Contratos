/**
 * Función para verificar la veracidad de un RUT chileno.
 * Rompe el RUT en cuerpo y dígito verificador para validar con Módulo 11.
 * 
 * @returns {boolean} True si el RUT es válido, false si no lo es.
 * @autor Luxorar 
 */

export function calcularRut(rut, verificador) {
    if (!rut || !verificador || rut.toString().length < 7) return false;

    let ordenRut = rut.toString().split('');
    ordenRut.reverse();
    let verificadornum;
    let verificadorTexto = verificador.toString().toLowerCase();

    if (verificadorTexto === "k") {
        verificadornum = 10;
    } else if (verificadorTexto === "0") {
        verificadornum = 11;
    } else {
        verificadornum = parseInt(verificador, 10); 
    }

    let multiplicador = 2;
    let resultadoSumaRut = 0;
    for (let i = 0; i < ordenRut.length; i++) {
        resultadoSumaRut += parseInt(ordenRut[i], 10) * multiplicador;
        multiplicador++;
        if (multiplicador > 7) {
            multiplicador = 2;
        }
    }
    const restoRut = resultadoSumaRut % 11; 
    let onceMenosResto = 11 - restoRut;
    if (verificadornum === onceMenosResto) {
        return true;
    } else {
        return false;
    }
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

export default calcularRut;
