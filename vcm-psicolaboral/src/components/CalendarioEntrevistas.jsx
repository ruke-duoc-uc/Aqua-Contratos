import { useState, useMemo } from "react";
import { NARANJA, NARANJA_OSCURO } from "./Estilos.jsx";

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
                const f = ent.fechaEntrevista || ent.entrevista;
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

    // Agrupar entrevistas por fecha "YYYY-MM-DD"
    const mapaEntrevistas = useMemo(() => {
        const mapa = {};
        for (const item of entrevistas) {
            const f = item.fechaEntrevista || item.entrevista;
            const clave = extraerClaveFecha(f);
            if (clave) {
                if (!mapa[clave]) mapa[clave] = [];
                mapa[clave].push(item);
            }
        }
        return mapa;
    }, [entrevistas]);

    // Generar la matriz del mes
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
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>
                        📅 {NOMBRES_MESES[mes]} {anio}
                    </h3>
                    <button
                        type="button"
                        onClick={irHoy}
                        style={{
                            padding: "3px 10px",
                            fontSize: "12px",
                            borderRadius: "4px",
                            border: "1px solid #ced4da",
                            background: "#f8f9fa",
                            cursor: "pointer",
                            fontWeight: "600",
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
                            padding: "6px 12px",
                            fontSize: "13px",
                            borderRadius: "5px",
                            border: "1px solid #ced4da",
                            background: "white",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                        title="Mes anterior"
                    >
                        ◀
                    </button>
                    <button
                        type="button"
                        onClick={irMesSiguiente}
                        style={{
                            padding: "6px 12px",
                            fontSize: "13px",
                            borderRadius: "5px",
                            border: "1px solid #ced4da",
                            background: "white",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                        title="Mes siguiente"
                    >
                        ▶
                    </button>
                </div>
            </div>

            {/* Días de la semana */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#6c757d",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #eee",
                }}
            >
                {DIAS_SEMANA.map((d) => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            {/* Grilla de días */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "4px",
                    paddingTop: "8px",
                }}
            >
                {celdas.map((celda) => {
                    if (celda.tipo === "vacio") {
                        return (
                            <div
                                key={celda.id}
                                style={{
                                    minHeight: "72px",
                                    backgroundColor: "#fafafa",
                                    borderRadius: "6px",
                                }}
                            />
                        );
                    }

                    const tieneCitas = celda.citas.length > 0;
                    const esSeleccionado = diaSeleccionado === celda.clave;

                    return (
                        <div
                            key={celda.id}
                            onClick={() => onSeleccionarDia?.(celda.clave)}
                            style={{
                                minHeight: "72px",
                                padding: "6px 4px",
                                backgroundColor: esSeleccionado ? "#fff4e6" : tieneCitas ? "#f0fdf4" : "white",
                                border: esSeleccionado
                                    ? `2px solid ${NARANJA}`
                                    : tieneCitas
                                    ? "1px solid #bbf7d0"
                                    : "1px solid #e9ecef",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                transition: "all 0.15s ease",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "4px",
                                    padding: "0 2px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: tieneCitas || esSeleccionado ? "700" : "500",
                                        color: tieneCitas ? "#166534" : "#495057",
                                    }}
                                >
                                    {celda.numero}
                                </span>
                                {tieneCitas && (
                                    <span
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: "700",
                                            backgroundColor: "#16a34a",
                                            color: "white",
                                            borderRadius: "10px",
                                            padding: "1px 5px",
                                        }}
                                    >
                                        {celda.citas.length}
                                    </span>
                                )}
                            </div>

                            {/* Vista compacta de citas del día */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                                {celda.citas.slice(0, 2).map((c, i) => (
                                    <div
                                        key={c.id || i}
                                        style={{
                                            fontSize: "10px",
                                            backgroundColor: "#dcfce7",
                                            color: "#166534",
                                            borderRadius: "3px",
                                            padding: "1px 3px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                        title={`${c.candidatoNombre || c.nombre} - ${c.puestoTitulo || c.cargo}`}
                                    >
                                        {c.candidatoNombre || c.nombre}
                                    </div>
                                ))}
                                {celda.citas.length > 2 && (
                                    <span style={{ fontSize: "9px", color: "#888", textAlign: "center" }}>
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
