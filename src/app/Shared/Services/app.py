from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import networkx as nx

app = Flask(__name__)
CORS(app, resources={r"/calcular_ruta": {"origins": "http://localhost:4200"}})

precio_km = 0.9

with open('../../../assets/db.json', 'r') as file:
    data = json.load(file)

G = nx.Graph()

vuelos_data = data.get('vuelos', [])

# Agregar los vuelos al grafo
for vuelo in vuelos_data:
    G.add_edge(vuelo['origen'], vuelo['destino'], weight=vuelo['distancia'])

def encontrar_camino(grafo, nodo1, nodo2):
    try:
        camino_corto = nx.shortest_path(grafo, source=nodo1, target=nodo2, weight="weight", method="dijkstra")
        peso_de_aristas = [grafo[camino_corto[i]][camino_corto[i + 1]]["weight"] for i in range(len(camino_corto) - 1)]
        return {
            "existe_camino": True,
            "camino": camino_corto,
            "peso_de_aristas": peso_de_aristas
        }
    except nx.NetworkXNoPath:
        return {"existe_camino": False}

@app.route('/calcular_ruta', methods=['GET'])
def calcular_ruta():
    origen = request.args.get('origen')
    destino = request.args.get('destino')
    clasificacion = request.args.get('clasificacion', type=float)

    resultado = encontrar_camino(G, origen, destino)

    if resultado["existe_camino"]:
        suma = sum(resultado["peso_de_aristas"])
        precio_total = suma * clasificacion * precio_km
        return jsonify({
            "mensaje": "Ruta encontrada",
            "camino": resultado["camino"],
            "precio_total": round(precio_total, 2)
        })
    else:
        return jsonify({"mensaje": f"No existen vuelos entre {origen} y {destino}."})

if __name__ == '__main__':
    app.run(debug=True)

