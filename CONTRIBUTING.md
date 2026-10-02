# Contribuciones al proyecto
A continuacion se establecen las reglas/sugerencias a seguir al aportar nuevas funciones, cambios, arreglos, etc.

# Indice
- [Atributos repetitivos](#atributos-repetitivos)
# Atributos repetitivos
- [Página Web](#página-web)
### Página Web

#### index.css
En el caso de agregar un color que sera reutilizado, se debe declarar como una variable en `:root`
Ejemplos
|Nombre|Variable almacenada|
|---|:---:|
|--fondo-cuadros|white(color)|
|--font-negro|black(color)|
|--radio-cuadros|8px(medida)|
|--borde-boton-hover||
Para mantener el código estandarizado, las nuevas variables deben mantener nombres de 2 a 3 palabras. En los casos donde la el nombre de la variable se preste a mas de una interpretación se debe comentar el caso de uso.