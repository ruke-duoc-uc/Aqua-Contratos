/** Boton generico que seguramente se utilizará mas de una vez
 * @Autor Luxorar
 **/
import { useState } from "react";

function BotonOrange({ texto, href, onClick, type = "button" }) {
    const [hover, setHover] = useState(false);

    const baseStyle = {
        display: "inline-block",
        textAlign: "center",
        backgroundColor: hover ? "darkorange" : "orange",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hover
            ? "0 8px 16px rgba(0, 0, 0, 0.25)"
            : "0 2px 4px rgba(0, 0, 0, 0.15)",
        borderRadius: "5px",
        padding: "10px 16px",
        color: "white",
        textDecoration: "none",
        fontWeight: "bold",
        cursor: "pointer",
        border: "none",
        fontFamily: "inherit",
        fontSize: "14px",
        transition: "background-color 0.2s, transform 0.2s, box-shadow 0.2s",
    };

    if (href) {
        return (
            <a
                href={href}
                onClick={onClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={baseStyle}
            >
                {texto}
            </a>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={baseStyle}
        >
            {texto}
        </button>
    );
}

export default BotonOrange;