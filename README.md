
# Prueba Selección


Línea de Salud Digital, Centro de Modelamiento Matemático, Universidad de
Chile
Marzo 2024


## Authors

- Daniel Pinochet




## Captura de Pantallas

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## Declaración dependencias externas

En el desarrollo de del proyecto, he requerido varias librerías externas de Python. A continuación, detallo las principales dependencias:

**Pandas**: Pandas es una biblioteca de análisis de datos que proporciona estructuras de datos flexibles y eficientes, ideales para trabajar con conjuntos de datos tabulares. He utilizado Pandas para la manipulación y el análisis de datos, incluyendo la carga, del archivo excel.

**JSON**: JSON (JavaScript Object Notation) es un formato de intercambio de datos ligero y fácil de leer. En nuestro proyecto, hemos utilizado la librería JSON de Python para la manipulación de datos en formato JSON, incluyendo la carga y el análisis de datos provenientes del archivo historico de atenciones 2018 al 2023.

**NumPy**: NumPy es una librería fundamental para la computación científica en Python, que proporciona soporte para arrays y matrices multidimensionales, así como una amplia variedad de funciones matemáticas de alto nivel. La he utilizado para manipulaciones de arrays.

**Flask**: Flask es un microframework web de Python que nos ha permitido construir y desplegar aplicaciones web de forma rápida y sencilla. Es el principal componente, ya que a través de él (actuando como microservicio backend) la aplicación web puede comunicarse y recibir los datos para procesar la gráfica final.


Para el desarrollo de la página web he elegido Angular como framework. A continuación detallo las dependencias externas:

**chart.js**: La he utilizado para poder crear una gráfica de línea que permita comparar el total de atenciones en los años solicitados.

## Definiciones de módulos y funciones creadas

### Python

El módulo principal, que destacto en este script, es Flask. Esto me permite generar un microentorno que permitirá comunicarse con angular y obtener (mediante llamada asyncrona) 


```
def sumar_columnas():
    # Verificar que se haya enviado un archivo
    if "archivo" not in request.files:
        return jsonify({"error": "No se ha proporcionado ningún archivo"}), 400

    archivo = request.files["archivo"]

```
En este bloque de código obtengo el archivo binario, que fue envíado vía POST desde la página web.

```
   # Leer el archivo Excel
    try:
        df = pd.read_excel(archivo)
    except Exception as e:
        return jsonify({"error": f"Error al leer el archivo Excel: {str(e)}"}), 400
```

A través del objeto "request" paso el contenido del archivo a una variable llamada "archivo". A través del método pd.read_excel leo el contenido del archivo excel, para posteriormente manipular la información.

```
    # Sumar las columnas
    try:

        lectura = []
        dias = 30
        for i in range(2, dias + 1):

            # Aquí me aseguro de no leer ultima fila, que contiene total. Me aseguro de leer cada fila para evitar errores en los cálculos
            columna = df.iloc[-1:, i - 1]

            # al crear el arreglo, me aseguro de que cada elemento tenga la misma estructura que el archivo historico json.
            dia = {
                "Fecha": "2024-02-" + str(i - 1).zfill(2),
                "Total consultas": columna.sum().item(),
            }
            lectura.append(dia)
```
A través de un ciclo for que emula los 29 días de febrero del año 2024. Luego, utilizando df.iloc[-1:, i - 1] me aseguro ir avanzando en las columnas sin considerar la primera (que corresponde al texto descriptivo) y la última columna que corresponde a los totales. Finalmente, evitando leer la última fila (que contiene la formula de suma) sólo me dedico a leer dato por dato. ¿Poqué elegí este método en el algoritmo? Si bien, puede que sea un poco mas lento en el proceso, me aseguro de considerar TODOS los datos de las celdas; ya que puediera existir un error en las formulas que totalizan o suman las columnas en excel.

Finalmente, hice un endpoint adicional para leer toda la información del archivo JSON que contiene los años anteriores. Aquí no hay mayor lógica en el algoritmo que simplemente enviar la información vía HTTP a través del método GET hacia la página web:

```
@app.route("/obtener_json", methods=["GET"])
def obtener_json():
    # Ruta al archivo JSON
    ruta_archivo_json = "consultas_historicas_febrero-1.json"

    try:
        # Leer el contenido del archivo JSON
        with open(ruta_archivo_json, "r") as f:
            contenido_json = json.load(f)
        # Devolver el contenido como respuesta JSON
        return jsonify(contenido_json)
    except Exception as e:
        # Manejar errores si el archivo no puede ser leído
        return jsonify({"error": str(e)}), 500
```

### Angular

#### Front HTML

```
<form >
  <input type="file" (change)="onFileSelected($event)">
  <button type="button" (click)="onSubmit()" [disabled]="!selectedFile">Procesar Datos</button>
</form>
<p></p>
```

El front-end HTML no presenta una complejidad significativa. Se trata simplemente de un formulario en el cual se solicita la selección de un archivo Excel. ¿Por qué opté por permitir la carga manual del archivo Excel en lugar de leerlo automáticamente al cargar la página web? Basándome en mi experiencia, en este escenario es posible que los usuarios actualicen constantemente los datos en el archivo Excel, lo que implica que su contenido puede variar con el tiempo. Por otro lado, el archivo JSON histórico, concebido como una estructura tipo data warehouse, garantiza que los datos anteriores permanezcan inalterados. Por tanto, decidí que el usuario seleccione manualmente el archivo Excel más recientemente actualizado, asegurando así que contenga la última versión de la información.

#### TS

##### onSubmit()

```
onSubmit() {
    interface Dato {
      Fecha: string;
      valor: number;
    }

    if (this.selectedFile) {
      // Aquí  envío el archivo para su procesamiento, al backend desarrollado en python con flask.
      this.excel.leerExcel(this.selectedFile).subscribe((actual: any) => {
        this.util.obtenerDatosJson().subscribe((info: string | any[]) => {

          /*
          Esta parte es la mas importante:
          Concateno el arreglo historico que llamo "info"
          con el nuevo arreglo leído desde excel "actual".
          El objetivo es unir desde el año 2018 al 2024 (recientemente leído)
          */

          let arregloUnido:any = info.concat(actual);
         
          // Función para obtener el año de una fecha en formato de cadena
          const obtenerAño = (fecha: string): number => {
            return parseInt(fecha.substring(0, 4));
          };

          // Función para separar los datos por año
          const separarPorAño = (datos: Dato[]): Record<number, Dato[]> => {
            const años: Record<number, Dato[]> = {};

            datos.forEach((dato) => {
              const año = obtenerAño(dato.Fecha);
              if (!años[año]) {
                años[año] = [];
              }
              // ingreso un item en base al año detectado
              años[año].push(dato);
            });

            // Como resultado final, se tendrá un nuevo arreglo con años separados, lo que permitirá manipular mejor los datos para la elaboración de la gráfica
            return años;
          };

          let datosSeparados = separarPorAño(arregloUnido);

          this.jsonData = datosSeparados;

          this.crearGrafico();

          // titulo de la parte donde se muestra la gráfica.
          this.titulo = "Visualización de consultas ";
        });
      });
    }
  }
```


Este método se activa al presionar el botón "Enviar", luego de haber seleccionado previamente el archivo Excel, como se indicó anteriormente. Mi primer paso consiste en verificar la existencia del archivo. No obstante, para esta prueba, no he incluido validaciones adicionales, como la confirmación de que el archivo sea en formato Excel, entre otros.

Dentro del método he creado la siguiente función:
```
  const separarPorAño = (datos: Dato[]): Record<number, Dato[]> => {
            const años: Record<number, Dato[]> = {};

            datos.forEach((dato) => {
              const año = obtenerAño(dato.Fecha);
              if (!años[año]) {
                años[año] = [];
              }
              // ingreso un item en base al año detectado
              años[año].push(dato);
            });

            // Como resultado final, se tendrá un nuevo arreglo con años separados, lo que permitirá manipular mejor los datos para la elaboración de la gráfica
            return años;
          };
```
Como se requiere hacer una comparación por año, en donde el mes de febrero tiene similar cantidad de días, salvo el último año, preferí concatenar los dos arreglos (obtenidos desde el micro-backend python) para unirnos y separarlos por año. De esta manera mejoro la posibilidad de manipular la información para adaptarla, posteriormente, a la gráfica.

##### crearGrafico()
```
 crearGrafico() {
    this.chart = new Chart("MyChart", {
      /*
      He considerado que la mejor manera de poder comparar los años
      sea a trvés de una gráfica linea, donde se vean los puntos y sus 
      proyecciones en el tiempo. Por ello que he decidido asignar
      el tipo line como gráfica.
      */
      type: "line", 

      data: {
        // Valores para X-Axis
        labels: this.jsonData["2018"].map((dato: { Fecha: any }) =>
          dato.Fecha.substring(8, 10)
        ),
        datasets: [
          // Agrego los items en base al año usando el arreglo previamente creado
          {
            label: "2018",
            data: this.jsonData["2018"].map(
              (dato: { ["Total consultas"]: any }) => dato["Total consultas"]
            ),
            backgroundColor: "#105222",
          },
          {
            label: "2019",
            data: this.jsonData["2019"].map(
              (dato: { ["Total consultas"]: any }) => dato["Total consultas"]
            ),
            backgroundColor: "#8f6710",
          },
          {
            label: "2020",
            data: this.jsonData["2020"].map(
              (dato: { ["Total consultas"]: any }) => dato["Total consultas"]
            ),
            backgroundColor: "#1c8ad9",
          },
          {
            label: "2021",
            data: this.jsonData["2021"].map(
              (dato: { ["Total consultas"]: any }) => dato["Total consultas"]
            ),
            backgroundColor: "#34c4cf",
          },
          {
            label: "2022",
            data: this.jsonData["2022"].map(
              (dato: { ["Total consultas"]: any }) => dato["Total consultas"]
            ),
            backgroundColor: "#d1981d",
          },
          {
            label: "2023",
            data: this.jsonData["2023"].map(
              (dato: { ["Total consultas"]: any }) => dato["Total consultas"]
            ),
            backgroundColor: "#e6356d",
          },
          {
            label: "2024",
            data: this.jsonData["2024"].map(
              (dato: { ["Total consultas"]: any }) => dato["Total consultas"]
            ),
            backgroundColor: "blue",
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }
```

Este método no tiene mayor complejidad, como el anterior. Simplemente preparo una estructura JSON necesaria para la creación de la gráfica en el frontend. Lo que si destaco es que en la sección "datasets" (de la estructura de la gráfica) preparo cada item en base a los años de comparación, gracias a la manipulación de la estructura obtenida separándola por año.

## Instalación y Ejecución del proyecto

### Ejecutar Micro-Backend en Python

Como se ha comentado anteriormente, utilizando la librería Flask, se debe ejecutar un micro-servicio en la puerta 5000 del localhost para habilitar los dos endpoint que serán utilizados por el proyecto web.

#### Paso 1 - Crear carpeta base

Sugiero, en el home del usuario, crear una carpeta base para alojar allí todos los archivos del proyecto. Por tanto, sólo se debe crear y luego extraer el contenido ZIP en esa carpeta.

