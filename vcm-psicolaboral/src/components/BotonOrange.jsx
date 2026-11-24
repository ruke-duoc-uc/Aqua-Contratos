/** Boton generico que seguramente se utilizará mas de una vez
 * @Autor Luxorar
 **/
import { useState } from "react";

function BotonOrange({ texto, children, href, onClick, type = "button", disabled = false }) {
    const [hover, setHover] = useState(false);
    const contenido = texto || children;

    const baseStyle = {
        display: "inline-block",
        textAlign: "center",
        backgroundColor: disabled ? "#94a3b8" : hover ? "#162936" : "#223b4c",
        transform: hover && !disabled ? "translateY(-2px)" : "translateY(0)",
        boxShadow:
            hover && !disabled
                ? "0 6px 14px rgba(34, 59, 76, 0.25)"
                : "0 2px 5px rgba(34, 59, 76, 0.14)",
        borderRadius: "6px",
        padding: "10px 18px",
        color: "white",
        textDecoration: "none",
        fontWeight: "700",
        cursor: disabled ? "not-allowed" : "pointer",
        border: "1px solid #162936",
        fontFamily: "inherit",
        fontSize: "13.5px",
        letterSpacing: "0.2px",
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
                {contenido}
            </a>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={baseStyle}
        >
            {contenido}
        </button>
    );
}

export default BotonOrange;