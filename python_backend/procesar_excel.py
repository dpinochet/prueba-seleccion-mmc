from functools import total_ordering
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import pandas as pd

app = Flask(__name__)
CORS(app)  # Esto permite solicitudes CORS desde cualquier origen

# Defino endpoint tipo POST para leer archivo excel y procesar
@app.route("/sumar_columnas", methods=["POST"])
def sumar_columnas():
    # Verificar que se haya enviado un archivo
    if "archivo" not in request.files:
        return jsonify({"error": "No se ha proporcionado ningún archivo"}), 400

    archivo = request.files["archivo"]

    # Leer el archivo Excel
    try:
        df = pd.read_excel(archivo)
    except Exception as e:
        return jsonify({"error": f"Error al leer el archivo Excel: {str(e)}"}), 400

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

    except Exception as e:
        return jsonify({"error": f"Error al sumar las columnas: {str(e)}"}), 400

    return jsonify(lectura)


# Defino endpoint tipo GET para leer todo el json
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


if __name__ == "__main__":
    app.run(debug=True)
