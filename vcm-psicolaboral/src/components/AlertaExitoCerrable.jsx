function AlertaExitoCerrable({ mensaje, onCerrar }) {
    if (!mensaje) return null;
    return (
        <div
            style={{
                backgroundColor: "#d1e7dd",
                color: "#0f5132",
                border: "1px solid #badbcc",
                padding: "12px 18px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontWeight: "600",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <span>{mensaje}</span>
            <button
                onClick={onCerrar}
                style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
                ×
            </button>
        </div>
    );
}

export default AlertaExitoCerrable;