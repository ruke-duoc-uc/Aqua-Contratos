const ESTILOS = {
    exito: {
        role: "status",
        backgroundColor: "#d1e7dd",
        color: "#0f5132",
        border: "1px solid #badbcc",
    },
    error: {
        role: "alert",
        backgroundColor: "var(--fondo-badge-rojo)",
        color: "var(--color-badge-rojo)",
        border: "1px solid #f5c2c7",
    },
};

function AlertaAviso({ tipo = "exito", mensaje, onCerrar }) {
    if (!mensaje) return null;

    const { role, ...estilo } = ESTILOS[tipo] || ESTILOS.exito;

    return (
        <div
            role={role}
            style={{
                ...estilo,
                padding: "12px 18px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
            }}
        >
            <span>{mensaje}</span>
            <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar aviso"
                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
                ×
            </button>
        </div>
    );
}

export default AlertaAviso;