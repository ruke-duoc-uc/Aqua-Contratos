import IndicadorCard from "./IndicadorCard";

function GrillaIndicadores({ indicadores }) {
    return (
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            {indicadores.map((indicador) => (
                <IndicadorCard
                    key={indicador.id}
                    valor={indicador.valor}
                    titulo={indicador.titulo}
                />
            ))}
        </div>
    );
}

export default GrillaIndicadores;