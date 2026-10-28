function AlertaExitoCerrable({ mensaje, onCerrar }) {
    if (!mensaje) return null;
    return (
        <div
            className="alert alert-success alert-dismissible fade show d-flex justify-content-between align-items-center shadow-sm"
            role="alert"
            style={{ borderRadius: "8px" }}
        >
            <div className="d-flex align-items-center gap-2">
                <strong>✓</strong>
                <span>{mensaje}</span>
            </div>
            <button
                type="button"
                className="btn-close"
                aria-label="Cerrar alerta"
                onClick={onCerrar}
            ></button>
        </div>
    );
}

export default AlertaExitoCerrable;
