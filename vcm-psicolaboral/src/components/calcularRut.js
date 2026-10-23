/**
 * Función para verificar la veracidad de un RUT chileno.
 * Rompe el RUT en cuerpo y dígito verificador para validar con Módulo 11.
 * 
 * @returns {boolean} True si el RUT es válido, false si no lo es.
 * @autor Luxorar 
 */

function calcularRut(rut, verificador) {
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