import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-utilitario',
  standalone: true,
  imports: [],
  templateUrl: './utilitario.component.html',
  styleUrl: './utilitario.component.scss'
})
export class UtilitarioComponent {

  private urlDatosJSON:string = "http://localhost:5000/obtener_json";

  constructor(private http: HttpClient) { }

  obtenerDatosJson() {
    return this.http.get<any>(this.urlDatosJSON)
  }

}
