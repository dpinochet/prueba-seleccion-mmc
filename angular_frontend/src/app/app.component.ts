import { Component, ElementRef, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ExcelserviceComponent } from "./excelservice/excelservice.component";
import { UtilitarioComponent } from "./utilitario/utilitario.component";
import Chart from "chart.js/auto";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {

  public chart: any;

  selectedFile: File | undefined;
  public jsonData: any;

  public fechas: any = [];
  public datos: any = [];
  public titulo: string = "";

  constructor(
    private excel: ExcelserviceComponent,
    private util: UtilitarioComponent
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

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

  // método para crear la gráfica
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
        labels: this.jsonData["2024"].map((dato: { Fecha: any }) =>
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
}
