// Initialize the map with center coordinates and zoom level
var map = L.map('map').setView([37.0902, -95.7129], 4);  // US center coordinates

// Add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var startPoint, endPoint;

// Set a start point when clicked
map.on('click', function(e) {
  if (!startPoint) {
    startPoint = e.latlng;
    L.marker(startPoint).addTo(map).bindPopup('Start Point').openPopup();
    console.log('Start Point:', startPoint);
  } else if (!endPoint) {
    endPoint = e.latlng;
    L.marker(endPoint).addTo(map).bindPopup('End Point').openPopup();
    console.log('End Point:', endPoint);
  }
});

// Function to draw a line between the start and end points
function drawPath(pathCoords) {
    // Clear any previous path
    if (window.currentPath) {
      window.currentPath.remove();
    }
  
    // Draw the path from coordinates
    window.currentPath = L.polyline(pathCoords, {color: 'blue'}).addTo(map);
  }

  function runAStar() {
    if (startPoint && endPoint) {
      // Send start and end points to the backend via POST request
      fetch('/find-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: startPoint.lat,
          start_lon: startPoint.lng,
          end_lat: endPoint.lat,
          end_lon: endPoint.lng
        })
      })
      .then(response => response.json())
      .then(data => {
        // Draw the path on the map
        drawPath(data);
        console.log('Path found!', data);
      })
      .catch(error => {
        console.error('Error finding path:', error);
      });
    } else {
      alert('Please set both start and end points!');
    }
  }

  function aStar(startNode, endNode) {
    const openList = [];
    const closedList = [];

    openList.push(startNode);

    while (openList.length > 0) {
        // Get node with lowest f (f = g + h)
        let currentNode = openList.reduce((lowest, node) => (node.f < lowest.f ? node : lowest));

        // If we reach the end node, trace the path
        if (currentNode === endNode) {
            const path = [];
            let temp = currentNode;
            while (temp) {
                path.unshift(temp);  // Unshift to build the path in order
                temp = temp.parent;
            }

            // Highlight the path
            path.forEach(node => {
                const latLng = [node.y * 0.5 + 37.0902, node.x * 0.5 - 95.7129]; // Convert grid to lat, lng
                L.circleMarker(latLng, {
                    color: 'green',
                    radius: 6,
                }).addTo(map);
            });

            return path;
        }

        // Move current node to closed list
        openList.splice(openList.indexOf(currentNode), 1);
        closedList.push(currentNode);

        // Check neighbors
        const neighbors = getNeighbors(currentNode);
        for (const neighbor of neighbors) {
            if (closedList.includes(neighbor) || !neighbor.walkable) continue;

            const tentativeG = currentNode.g + 1;  // Assume cost to move is always 1

            if (!openList.includes(neighbor) || tentativeG < neighbor.g) {
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;

                if (!openList.includes(neighbor)) openList.push(neighbor);
            }
        }
    }

    return [];  // No path found
}
