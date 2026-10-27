function EncabezadoRegistro({ subtitulo, children }) {
    return (
        <div
            style={{
                padding: "16px 20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                    Registro Integral de Solicitudes de Evaluación
                </h2>
                <span style={{ fontSize: "13px", color: "gray" }}>{subtitulo}</span>
            </div>
            {children}
        </div>
    );
}

export default EncabezadoRegistro;