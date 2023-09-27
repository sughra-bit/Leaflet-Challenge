// Store our API endpoint as queryUrl.
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


function getColor(depth) {

    if (depth < 10) {
        return "Chartreuse";
    } else if (10 < depth & depth <= 30) {
        return "GreenYellow";
    } else if (30 < depth & depth <= 50) {
        return "GoldenRod";
    } else if (50 < depth & depth <= 70) {
        return "Orange";
    } else if (70 < depth & depth <= 90) {
        return "DarkOrange";    
    } else {
        return "Crimson";
    };
}



// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
    console.log(data);
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {  

    // Define a function that we want to run once for each feature in the features array.
    function bindPopUp(feature, layer) {
        layer.bindPopup("<h4>" + feature.properties.place + "</h4><hr><p>" + new Date (feature.properties.time) +
         "</p>" + "<p><b>Magnitude: " +  feature.properties.mag + 
         "</p>" + "<p><b>Depth: " +  feature.geometry.coordinates[2] + "<b></p>");
        }
         
    function circleMarker(feature, latlng) {
        let mag = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];
        return L.circle(latlng, {
            fillOpacity: 0.5,
            color: "white",
            fillColor: getColor(depth),
            radius: mag * 20000
        })
    }
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: bindPopUp,
        pointToLayer: circleMarker
      });     
    
    createMap(earthquakes);
    }  


function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
      
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
      
    // Create a baseMaps object.
    let baseMaps = {
          "Street Map": street,
          "Topographic Map": topo
    };
      
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
          Earthquakes: earthquakes
    };
      
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
        37.09, -95.71
          ],
        zoom: 5,
        layers: [street, earthquakes]
        });
      
  
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    
    // Set up the legend.
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
};   