import IndicadorCard from "../components/IndicadorCard";
import BotonOrange from "../components/BotonOrange";
import CandidatosRecientes from "../components/CandidarosRecientes";

function DashBoardPage(){
    let pendientes = 3;
    let enProceso = 2;
    let finalizadas = 9;

    const indicadores = [
        {id:1,titulo:"Candidatos Totales",valor: pendientes + enProceso + finalizadas},
        {id:2,titulo:"Solicitudes Pendientes",valor: pendientes},
        {id:3,titulo:"En proceso",valor: enProceso},
        {id:4,titulo:"Evaluaciones finalizadas",valor: finalizadas}
    ]

const candidatos = [
    { id: 1, nombre: "Luis Mancilla Peralta", rut: "21.756.200-7", especialidad: "Ing Software", planta: "Puerto Montt", fecha: new Date(2026, 9, 5), evaluador: "Amaro Villalobos Caseres", estado: "En revisión" },
    { id: 2, nombre: "Camila Soto Vargas", rut: "20.345.118-3", especialidad: "Prevención de Riesgos", planta: "Osorno", fecha: new Date(2026, 9, 4), evaluador: "Carolina Díaz Núñez", estado: "Pendiente" },
    { id: 3, nombre: "Matías Rojas Aguilar", rut: "19.872.456-K", especialidad: "Mecánica Industrial", planta: "Puerto Varas", fecha: new Date(2026, 9, 4), evaluador: "Amaro Villalobos Caseres", estado: "En proceso" },
    { id: 4, nombre: "Valentina Cárdenas Ruiz", rut: "21.034.789-5", especialidad: "Administración", planta: "Puerto Montt", fecha: new Date(2026, 9, 3), evaluador: "Felipe Muñoz Parra", estado: "Finalizado" },
    { id: 5, nombre: "Sebastián Oyarzún Leal", rut: "18.456.321-2", especialidad: "Electricidad", planta: "Castro", fecha: new Date(2026, 9, 2), evaluador: "Carolina Díaz Núñez", estado: "Pendiente" },
    { id: 6, nombre: "Javiera Barría Montecinos", rut: "20.987.654-1", especialidad: "Logística", planta: "Calbuco", fecha: new Date(2026, 9, 2), evaluador: "Felipe Muñoz Parra", estado: "En proceso" },
    { id: 7, nombre: "Diego Andrade Contreras", rut: "19.123.456-8", especialidad: "Soldadura", planta: "Ancud", fecha: new Date(2026, 9, 1), evaluador: "Amaro Villalobos Caseres", estado: "En revisión" },
    { id: 8, nombre: "Francisca Mayorga Tapia", rut: "21.456.098-6", especialidad: "Contabilidad", planta: "Frutillar", fecha: new Date(2026, 8, 30), evaluador: "Carolina Díaz Núñez", estado: "Finalizado" },
    { id: 9, nombre: "Nicolás Hernández Soto", rut: "20.678.912-4", especialidad: "Ing Civil", planta: "Puerto Montt", fecha: new Date(2026, 8, 29), evaluador: "Felipe Muñoz Parra", estado: "Pendiente" },
    { id: 10, nombre: "Constanza Vidal Bahamonde", rut: "19.765.432-9", especialidad: "Enfermería", planta: "Osorno", fecha: new Date(2026, 8, 28), evaluador: "Amaro Villalobos Caseres", estado: "Finalizado" },
];


    return (
        <main style={{backgroundColor:"#F0F8FF",fontFamily: "Arial, Helvetica, sans-serif", padding:"20px"}}>
            {/* Panel de Control */ }
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px"
                }}
            >
                <h2 style={{ margin: 0 }}>Panel de Control - Evaluaciones Psicolaborales</h2>
                <BotonOrange texto="+ Nueva solicitud" href="/nueva-solicitud" />
            </div>
            <div style={{ display: "flex", gap: "16px", marginBottom:"20px" }}>
                {indicadores.map((indicador) => (
                    <IndicadorCard
                        key={indicador.id}
                        valor={indicador.valor}
                        titulo={indicador.titulo}
                    />
                ))}
            </div>
            {/* Candidatos recientes */}
            <div
                style={{
                    border: "2px solid gray",
                    borderRadius: "10px",
                    width: "100%",
                    backgroundColor: "white"
                }}
            >
                <h2 style={{padding: "10px"}}>Solicitudes Recientes De Evaluación</h2>
                {candidatos.map((candidato)=>(
                    <CandidatosRecientes
                        key={candidato.id}
                        nombre={candidato.nombre}
                        rut={candidato.rut}
                        especialidad={candidato.especialidad}
                        planta={candidato.planta}
                        fecha={candidato.fecha.toLocaleDateString("es-CL")}
                        evaluador={candidato.evaluador}
                        estado={candidato.estado}
                    />
                ))}

            </div>

        </main>
    )
}

export default DashBoardPage;