function BannerEstadoBackend({ backendConectado, cargandoApi, etiquetaPantalla }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 14px",
                backgroundColor: backendConectado ? "#e8f5e9" : "#fff8e1",
                borderRadius: "6px",
                border: `1px solid ${backendConectado ? "#c8e6c9" : "#ffe082"}`,
                marginBottom: "16px",
                fontSize: "12px",
                color: backendConectado ? "#1b5e20" : "#795548",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                    style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: backendConectado ? "#2e7d32" : "#f57c00",
                    }}
                />
                <strong>
                    {backendConectado
                        ? "Conectado a la API REST (Backend Express + SQLite)"
                        : "Operando en Modo Local (localStorage)"}
                </strong>
                {cargandoApi && <span style={{ color: "#0d6efd" }}>(Sincronizando datos...)</span>}
            </div>
            <span style={{ fontSize: "11px", color: "#666" }}>{etiquetaPantalla}</span>
        </div>
    );
}

export default BannerEstadoBackend;
