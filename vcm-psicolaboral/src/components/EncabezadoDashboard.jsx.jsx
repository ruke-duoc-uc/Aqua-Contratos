function EncabezadoDashboard({ subtitulo, children }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
            }}
        >
            <div>
                <h2 style={{ margin: 0 }}>Panel de Control Operativo</h2>
                <span style={{ fontSize: "14px", color: "gray" }}>{subtitulo}</span>
            </div>
            {children}
        </div>
    );
}

export default EncabezadoDashboard;