function BarraValorFormularioPostulante({
    id,
    etiqueta,
    placeholder,
    value,
    onChange,
    propsFoco,
    columnaCompleta = false,
}) {
    return (
        <div
            className="form-grupo"
            style={columnaCompleta ? { gridColumn: "1 / -1" } : undefined}
        >
            <label htmlFor={id}>{etiqueta} *</label>
            <input
                id={id}
                type="text"
                className="form-input"
                value={value}
                onChange={onChange}
                {...propsFoco}
                placeholder={placeholder}
                required
            />
        </div>
    );
}

export default BarraValorFormularioPostulante;