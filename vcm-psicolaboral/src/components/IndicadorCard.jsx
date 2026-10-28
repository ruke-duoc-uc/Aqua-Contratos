/** Tarjeta de Indicador (KPI) con Bootstrap 5
 * @Autor Luxorar
 **/

function IndicadorCard({ valor, titulo }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="card shadow-sm h-100 border border-secondary-subtle" style={{ borderRadius: "10px" }}>
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <h6 className="card-subtitle text-secondary mb-2 text-uppercase fw-semibold" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>
                        {titulo}
                    </h6>
                    <p className="card-text fs-1 fw-bold mb-0 text-primary">
                        {valor}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default IndicadorCard;
