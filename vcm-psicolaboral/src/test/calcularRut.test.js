import { describe, it, expect } from 'vitest';
import { calcularRut, validarRutCompleto, calcularEdad } from '../utils/calcularRut';

describe('Utilidad: calcularRut (Validación Módulo 11)', () => {
    it('debe validar correctamente un RUT chileno válido con dígito numérico', () => {
        // Ejemplo de RUT conocido válido: 11.111.111-1
        expect(calcularRut('11111111', '1')).toBe(true);
        expect(calcularRut('12.345.678', '5')).toBe(true);
        // RUT con DV 0: 11.111.117-0
        expect(calcularRut('11111117', '0')).toBe(true);
    });

    it('debe validar correctamente un RUT con dígito verificador K (mayúscula o minúscula)', () => {
        // 11.111.112 tiene dígito verificador K
        expect(calcularRut('11111112', 'K')).toBe(true);
        expect(calcularRut('11111112', 'k')).toBe(true);
        // 10.000.013 tiene dígito verificador K
        expect(calcularRut('10000013', 'k')).toBe(true);
    });

    it('debe rechazar un RUT cuando el dígito verificador es incorrecto', () => {
        expect(calcularRut('11111111', '9')).toBe(false);
        expect(calcularRut('12345678', '9')).toBe(false);
        expect(calcularRut('11111112', '5')).toBe(false);
    });

    it('debe rechazar RUTs nulos, vacíos o con longitud inválida', () => {
        expect(calcularRut('', '1')).toBe(false);
        expect(calcularRut('123', '4')).toBe(false);
        expect(calcularRut(null, '1')).toBe(false);
        expect(calcularRut('11111111', null)).toBe(false);
    });

    it('debe limpiar puntos y guiones del cuerpo del RUT antes de validar', () => {
        expect(calcularRut('11.111.111', '1')).toBe(true);
        expect(calcularRut('11-111-111', '1')).toBe(true);
        expect(calcularRut('11.111.112', 'k')).toBe(true);
    });

    it('debe validar strings de RUT completo con o sin formato (validarRutCompleto)', () => {
        expect(validarRutCompleto('11.111.111-1')).toBe(true);
        expect(validarRutCompleto('11111112-K')).toBe(true);
        expect(validarRutCompleto('11.111.111-9')).toBe(false);
        expect(validarRutCompleto('')).toBe(false);
    });
});

describe('Utilidad: calcularEdad', () => {
    it('debe calcular la edad en años correctamente a partir de una fecha de nacimiento', () => {
        const hace25Anios = new Date();
        hace25Anios.setFullYear(hace25Anios.getFullYear() - 25);
        // Aseguramos que ya cumplió años este año fijando enero
        hace25Anios.setMonth(0, 1);

        const fechaStr = hace25Anios.toISOString().split('T')[0];
        const edad = calcularEdad(fechaStr);
        expect(edad).toBe(25);
    });

    it('debe retornar null ante entradas inválidas o vacías', () => {
        expect(calcularEdad('')).toBeNull();
        expect(calcularEdad(null)).toBeNull();
        expect(calcularEdad('fecha-invalida')).toBeNull();
    });
});
