/** Boton generico que seguramente se utilizará mas de una vez
 * @Autor Luxorar
 **/

function BotonOrange({texto,href}){
    return(
        <a href={href} className="nuevasolicitud" 
            style={{backgroundColor:"orange",borderRadius:"5px",padding:"10px", color:"white", textDecoration: "none"}}
        >{texto}</a>
    )
}
export default BotonOrange;