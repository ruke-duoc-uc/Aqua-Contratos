/** Boton generico que seguramente se utilizará mas de una vez
 * @Autor Luxorar
 **/
import { useState } from "react";

function BotonOrange({ texto, href }) {
    const [hover, setHover] = useState(false);

    return (
        <a
            href={href}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: "inline-block",
                textAlign:"center",
                backgroundColor: hover ? "darkorange" : "orange",
                transform: hover ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hover
                    ? "0 8px 16px rgba(0, 0, 0, 0.25)"
                    : "0 2px 4px rgba(0, 0, 0, 0.15)",
                borderRadius: "5px",
                padding: "10px",
                color: "white",
                textDecoration: "none",
                transition: "background-color 0.2s, transform 0.2s",
            }}
        >
            {texto}
        </a>
    );
}

export default BotonOrange;