import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-excelservice',
  standalone: true,
  imports: [],
  templateUrl: './excelservice.component.html',
  styleUrl: './excelservice.component.scss'
})
export class ExcelserviceComponent {
  constructor(private http: HttpClient) { }

  leerExcel(archivo: File)  {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<any>('http://localhost:5000/sumar_columnas', formData);
  
  }

}
