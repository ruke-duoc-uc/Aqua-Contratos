/**
 * Componente oficial del Logo Corporativo de AquaChile.
 * Utiliza el logotipo de la carpeta de evidencias (/AquaChile-logo.png)
 * con recorte limpio de sus márgenes cuadrados para integrarse en cabeceras y portales.
 */

function LogoAquaChile({ height = 42, mostrarSubtitulo = false, subtitulo = "Aqua-Contratos" }) {
    const anchoContenedor = Math.round(height * 3.8);

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                userSelect: "none",
            }}
        >
            <div
                style={{
                    width: `${anchoContenedor}px`,
                    height: `${height}px`,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <img
                    src="/AquaChile-logo.png"
                    alt="AquaChile"
                    style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                    }}
                />
            </div>

            {mostrarSubtitulo && (
                <div
                    style={{
                        borderLeft: "2px solid #cbd5e1",
                        paddingLeft: "12px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#223b4c",
                            letterSpacing: "0.4px",
                            textTransform: "uppercase",
                            lineHeight: 1.2,
                        }}
                    >
                        {subtitulo}
                    </span>
                    <span
                        style={{
                            fontSize: "11px",
                            color: "#5c7485",
                            lineHeight: 1.2,
                        }}
                    >
                        Selección y Gestión Psicolaboral
                    </span>
                </div>
            )}
        </div>
    );
}

export default LogoAquaChile;
