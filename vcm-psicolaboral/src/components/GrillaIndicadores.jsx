import IndicadorCard from "./IndicadorCard";

function GrillaIndicadores({ indicadores }) {
    return (
        <div className="row g-3 mb-4">
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
