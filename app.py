from flask import Flask, render_template, request, jsonify
import osmnx as ox
import networkx as nx

app = Flask(__name__)

# Generate road network from OpenStreetMap for a specific region (e.g., "California, USA")
def get_road_network(place_name="California, USA") -> nx.Graph:
    graph = ox.graph_from_place(place_name, network_type='all')
    return graph

@app.route('/')
def index():
    return render_template('index.html')  # Renders your existing frontend

@app.route('/find-path', methods=['POST'])
def find_path():
    # Extract start and end coordinates from the request
    start_lat = float(request.json['start_lat'])
    start_lon = float(request.json['start_lon'])
    end_lat = float(request.json['end_lat'])
    end_lon = float(request.json['end_lon'])
    
    # Get road network
    graph = get_road_network()

    # Find nearest nodes to the start and end coordinates
    start_node = ox.distance.nearest_nodes(graph, X=start_lon, Y=start_lat)
    end_node = ox.distance.nearest_nodes(graph, X=end_lon, Y=end_lat)
    
    # Run A* pathfinding algorithm to find the optimal path
    path = nx.astar_path(graph, start_node, end_node, weight='length')
    
    # Convert path nodes to latitude, longitude for front-end
    path_coords = [(graph.nodes[node]['y'], graph.nodes[node]['x']) for node in path]
    
    return jsonify(path_coords)  # Send the path coordinates back to the frontend

if __name__ == '__main__':
    app.run(debug=True)
