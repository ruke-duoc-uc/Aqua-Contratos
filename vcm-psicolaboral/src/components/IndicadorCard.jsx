/** Tarjeta de Indicador (KPI) con Bootstrap 5
 * @Autor Luxorar
 **/

function IndicadorCard({ valor, titulo }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div
                className="card shadow-sm h-100"
                style={{
                    borderRadius: "10px",
                    border: "1px solid #dbe3eb",
                    borderTop: "4px solid #223b4c",
                    backgroundColor: "#ffffff",
                }}
            >
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <h6
                        className="card-subtitle mb-2 text-uppercase fw-semibold"
                        style={{ fontSize: "0.75rem", letterSpacing: "0.5px", color: "#5c7485" }}
                    >
                        {titulo}
                    </h6>
                    <p
                        className="card-text fs-1 fw-bold mb-0"
                        style={{ color: "#223b4c" }}
                    >
                        {valor}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default IndicadorCard;
