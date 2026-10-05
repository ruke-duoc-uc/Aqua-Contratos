/** Creamos las cuatro cartas de totalCandidatos - pendiente - en proceso - finalizado
 * @Autor Luxorar
 **/


function IndicadorCard({ valor, titulo }) {
    return (
        <div
            style={{
                border: "2px solid gray",
                borderRadius: "10px",
                width: "22%",
                padding: "10px",
                backgroundColor: "white"
            }}
        >
            <h2 style={{color: "gray", fontSize: "15px", fontWeight:"inherit"}}>{titulo}</h2>
            <p style={{fontSize: "40px", fontWeight:"bolder", marginTop: "-10px"}}>{valor}</p>
        </div>
    );
}

export default IndicadorCard;
