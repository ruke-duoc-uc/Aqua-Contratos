/**Lista para poner a los candidatos recientes
 * @Autor Luxorar
**/
import BotonOrange from "./BotonOrange";

function CandidatosRecientes({nombre, rut,especialidad,planta,fecha,evaluador,estado}){
    return(
        <div
            style={{
                border:"1px solid gray", backgroundColor:"white", display:"flex",gap:"16px",flexDirection:"row",
                justifyContent:"space-between", padding:"10px"
            }}
        >
            <p>{nombre}</p>
            <p>{rut}</p>
            <p>{especialidad}</p>
            <p>{planta}</p>
            <p>{fecha}</p>
            <p>{evaluador}</p>
            <p>{estado}</p>
            <BotonOrange texto="Detalles" href="" />
        </div>
    );
}
export default CandidatosRecientes;