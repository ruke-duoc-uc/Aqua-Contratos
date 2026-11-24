import { useState, useMemo } from "react";
import { NARANJA } from "./Estilos.jsx";
import Icono from "./Icono.jsx";

const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Normaliza una fecha de entrevista (ISO o dd/mm/aaaa) a formato YYYY-MM-DD
 */
function extraerClaveFecha(fechaStr) {
    if (!fechaStr) return null;

    // Si viene en formato ISO (e.g., 2026-10-22T15:00:00 o 2026-10-22)
    if (typeof fechaStr === "string" && fechaStr.includes("-")) {
        const parteFecha = fechaStr.split("T")[0];
        const partes = parteFecha.split("-");
        if (partes.length === 3) {
            return `${partes[0]}-${partes[1].padStart(2, "0")}-${partes[2].padStart(2, "0")}`;
        }
    }

    // Si viene en formato dd/mm/yyyy hh:mm
    if (typeof fechaStr === "string" && fechaStr.includes("/")) {
        const parteFecha = fechaStr.split(" ")[0];
        const [d, m, y] = parteFecha.split("/");
        if (d && m && y) {
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
    }

    const d = new Date(fechaStr);
    if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${dia}`;
    }

    return null;
}

function CalendarioEntrevistas({ entrevistas = [], diaSeleccionado, onSeleccionarDia }) {
    // Tomamos como fecha base la del primer evento si existe, o la fecha actual
    const fechaInicial = useMemo(() => {
        if (entrevistas.length > 0) {
            for (const ent of entrevistas) {
                const f = ent.fechaEntrevista || ent.entrevista || ent.fecha;
                const clave = extraerClaveFecha(f);
                if (clave) {
                    const [y, m, d] = clave.split("-").map(Number);
                    return new Date(y, m - 1, d);
                }
            }
        }
        return new Date();
    }, [entrevistas]);

    const [anio, setAnio] = useState(fechaInicial.getFullYear());
    const [mes, setMes] = useState(fechaInicial.getMonth()); // 0 - 11

    // Agrupar entrevistas y fechas operativas por fecha "YYYY-MM-DD"
    const mapaEntrevistas = useMemo(() => {
        const mapa = {};
        for (const item of entrevistas) {
            const f = item.fechaEntrevista || item.entrevista || item.fecha;
            const clave = extraerClaveFecha(f);
            if (clave) {
                if (!mapa[clave]) mapa[clave] = [];
                mapa[clave].push(item);
            }
        }
        return mapa;
    }, [entrevistas]);

    // Generar la matriz del mes con cuadrícula uniforme (múltiplo de 7 columnas)
    const celdas = useMemo(() => {
        const primerDiaMes = new Date(anio, mes, 1);
        const ultimoDiaMes = new Date(anio, mes + 1, 0);

        // Convertir domingo (0) a 6, lunes (1) a 0
        let primerDiaSemana = primerDiaMes.getDay() - 1;
        if (primerDiaSemana === -1) primerDiaSemana = 6;

        const totalDiasMes = ultimoDiaMes.getDate();
        const dias = [];

        // Celdas vacías previas
        for (let i = 0; i < primerDiaSemana; i++) {
            dias.push({ tipo: "vacio", id: `prev-${i}` });
        }

        // Celdas del mes
        for (let d = 1; d <= totalDiasMes; d++) {
            const mesStr = String(mes + 1).padStart(2, "0");
            const diaStr = String(d).padStart(2, "0");
            const clave = `${anio}-${mesStr}-${diaStr}`;
            const citas = mapaEntrevistas[clave] || [];

            dias.push({
                tipo: "dia",
                numero: d,
                clave,
                citas,
                id: clave,
            });
        }

        // Completar la última fila para que la cuadrícula quede rectangular y alineada
        const resto = dias.length % 7;
        if (resto !== 0) {
            const faltantes = 7 - resto;
            for (let i = 0; i < faltantes; i++) {
                dias.push({ tipo: "vacio", id: `next-${i}` });
            }
        }

        return dias;
    }, [anio, mes, mapaEntrevistas]);

    const irMesAnterior = () => {
        if (mes === 0) {
            setMes(11);
            setAnio((prev) => prev - 1);
        } else {
            setMes((prev) => prev - 1);
        }
    };

    const irMesSiguiente = () => {
        if (mes === 11) {
            setMes(0);
            setAnio((prev) => prev + 1);
        } else {
            setMes((prev) => prev + 1);
        }
    };

    const irHoy = () => {
        const hoy = new Date();
        setAnio(hoy.getFullYear());
        setMes(hoy.getMonth());
        const mesStr = String(hoy.getMonth() + 1).padStart(2, "0");
        const diaStr = String(hoy.getDate()).padStart(2, "0");
        onSeleccionarDia?.(`${hoy.getFullYear()}-${mesStr}-${diaStr}`);
    };

    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "1px solid #dee2e6",
                padding: "16px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                minWidth: 0,
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            {/* Cabecera del Calendario */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "8px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icono nombre="calendar" size={18} color="#0e97b3" />
                        {NOMBRES_MESES[mes]} {anio}
                    </h3>
                    <button
                        type="button"
                        onClick={irHoy}
                        style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            borderRadius: "4px",
                            border: "1px solid #ced4da",
                            background: "#f8f9fa",
                            cursor: "pointer",
                            fontWeight: "600",
                            color: "#334155",
                        }}
                    >
                        Hoy
                    </button>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                    <button
                        type="button"
                        onClick={irMesAnterior}
                        style={{
                            padding: "6px 10px",
                            fontSize: "13px",
                            borderRadius: "5px",
                            border: "1px solid #ced4da",
                            background: "white",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#334155",
                        }}
                        title="Mes anterior"
                        aria-label="Mes anterior"
                    >
                        <Icono nombre="chevronLeft" size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={irMesSiguiente}
                        style={{
                            padding: "6px 10px",
                            fontSize: "13px",
                            borderRadius: "5px",
                            border: "1px solid #ced4da",
                            background: "white",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#334155",
                        }}
                        title="Mes siguiente"
                        aria-label="Mes siguiente"
                    >
                        <Icono nombre="chevronRight" size={16} />
                    </button>
                </div>
            </div>

            {/* Leyenda rápida de colores */}
            <div
                style={{
                    display: "flex",
                    gap: "14px",
                    flexWrap: "wrap",
                    fontSize: "11px",
                    color: "#64748b",
                    marginBottom: "10px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #f1f5f9",
                }}
            >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#dcfce7", border: "1px solid #86efac", display: "inline-block" }} />
                    Citación a postulante
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: "#fef3c7", border: "1px solid #fcd34d", display: "inline-block" }} />
                    Fecha operativa / Feriado
                </span>
            </div>

            {/* Días de la semana */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#6c757d",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #eee",
                }}
            >
                {DIAS_SEMANA.map((d) => (
                    <div key={d} style={{ minWidth: 0 }}>{d}</div>
                ))}
            </div>

            {/* Grilla de días con columnas estrictamente iguales */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gridAutoRows: "78px",
                    gap: "5px",
                    paddingTop: "8px",
                }}
            >
                {celdas.map((celda) => {
                    if (celda.tipo === "vacio") {
                        return (
                            <div
                                key={celda.id}
                                style={{
                                    height: "78px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px dashed #e2e8f0",
                                    borderRadius: "6px",
                                    minWidth: 0,
                                }}
                            />
                        );
                    }

                    const tieneCitas = celda.citas.length > 0;
                    const tieneEventoEspecial = celda.citas.some((c) => Boolean(c.esEventoEspecial));
                    const tieneCitaPostulante = celda.citas.some((c) => !c.esEventoEspecial);
                    const esSeleccionado = diaSeleccionado === celda.clave;

                    let bgCelda = "white";
                    let bordeCelda = "1px solid #e2e8f0";
                    if (esSeleccionado) {
                        bgCelda = "#fff4e6";
                        bordeCelda = `2px solid ${NARANJA}`;
                    } else if (tieneCitaPostulante) {
                        bgCelda = "#f0fdf4";
                        bordeCelda = "1px solid #bbf7d0";
                    } else if (tieneEventoEspecial) {
                        bgCelda = "#fffbeb";
                        bordeCelda = "1px solid #fde68a";
                    }

                    return (
                        <div
                            key={celda.id}
                            onClick={() => onSeleccionarDia?.(celda.clave)}
                            style={{
                                height: "78px",
                                minWidth: 0,
                                overflow: "hidden",
                                padding: "5px 6px",
                                backgroundColor: bgCelda,
                                border: bordeCelda,
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                boxSizing: "border-box",
                                transition: "background-color 0.15s ease",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "4px",
                                    minWidth: 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: tieneCitas || esSeleccionado ? "700" : "500",
                                        color: tieneCitaPostulante
                                            ? "#166534"
                                            : tieneEventoEspecial
                                            ? "#92400e"
                                            : "#495057",
                                        lineHeight: 1,
                                    }}
                                >
                                    {celda.numero}
                                </span>
                                {tieneCitas && (
                                    <span
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: "700",
                                            backgroundColor: tieneCitaPostulante ? "#16a34a" : "#d97706",
                                            color: "white",
                                            borderRadius: "10px",
                                            padding: "1px 5px",
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {celda.citas.length}
                                    </span>
                                )}
                            </div>

                            {/* Vista compacta de citas del día con truncado seguro */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px",
                                    overflow: "hidden",
                                    minWidth: 0,
                                    width: "100%",
                                }}
                            >
                                {celda.citas.slice(0, 2).map((c, i) => {
                                    const esEspecial = Boolean(c.esEventoEspecial);
                                    const etiquetaCorta = esEspecial
                                        ? c.tipoEvento || c.titulo
                                        : c.candidatoNombre || c.nombre;
                                    return (
                                        <div
                                            key={c.id || i}
                                            style={{
                                                fontSize: "10px",
                                                lineHeight: "1.3",
                                                backgroundColor: esEspecial ? "#fef3c7" : "#dcfce7",
                                                color: esEspecial ? "#92400e" : "#166534",
                                                borderRadius: "3px",
                                                padding: "1px 4px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: "100%",
                                                boxSizing: "border-box",
                                            }}
                                            title={
                                                esEspecial
                                                    ? `${c.tipoEvento}: ${c.titulo}`
                                                    : `${c.tipoCitacion || "Citación"} · ${c.candidatoNombre || c.nombre}`
                                            }
                                        >
                                            {etiquetaCorta}
                                        </div>
                                    );
                                })}
                                {celda.citas.length > 2 && (
                                    <span style={{ fontSize: "9px", color: "#64748b", textAlign: "center", lineHeight: 1 }}>
                                        +{celda.citas.length - 2} más
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CalendarioEntrevistas;
