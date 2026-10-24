function EstadoVacio({ mensaje, onRestablecer }) {
    return (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#6c757d" }}>
            <p style={{ fontSize: "16px", margin: "0 0 10px 0" }}>{mensaje}</p>
            <button type="button" className="boton-limpiar-filtros" onClick={onRestablecer}>
                Restablecer filtros
            </button>
        </div>
    );
}

export default EstadoVacio;