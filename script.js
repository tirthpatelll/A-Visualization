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