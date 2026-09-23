function App(){

 return(

  //en jsx utilizamos className en vez de class

  <main className="container">

   <header>

    <p className="tag">Proyecto VCM AquaChile - FullStack II</p>

    <h1>Gestión Laboral</h1>

    <p>MVP para centralizar candidatos, solicitudes y evaluaciones psicolaborales</p>

   </header>

   <section className="indicadores">

    <article>

     <strong>12</strong>

     <span>Candidatos</span>

    </article>

    <article>

     <strong>5</strong>

     <span>Pendientes</span>

    </article>

    <article>

     <strong>4</strong>

     <span>Proceso</span>

    </article>


    <article>

     <strong>3</strong>

     <span>Finalizados</span>

    </article>

   </section>


   <section className="flujo">

    <h2>Flujo principal</h2>

    <p>Candidato → Solicitud →Evaluación → Estado → Consulta </p>

   </section>

  </main>

 );


}


export default App;

