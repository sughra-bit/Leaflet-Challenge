// Set the url to geoJSON
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
    console.log(data);
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {  

  function getColor(depth) {

    if (depth < 10) {
      return "Red";
    } else if (10 < depth & depth <= 30) {
        return "Green";
    } else if (30 < depth & depth <= 50) {
        return "GoldenRod";
    } else if (50 < depth & depth <= 70) {
        return "Orange";
    } else if (70 < depth & depth <= 90) {
        return "DarkOrange";    
    } else {
      return "Black";
    };
}

    // Create a function to run for each feature 
    function bindPopUp(feature, layer) {
      layer.bindPopup("<h4>" + feature.properties.place + "</h4><hr><p>" + new Date (feature.properties.time) +
       "</p>" + "<p><b>Magnitude: " +  feature.properties.mag + 
       "</p>" + "<p><b>Depth: " +  feature.geometry.coordinates[2] + "<b></p>");
      }

   // Setting a GeoJSON layer 
    function circleMarker(feature, latlng) {
        let mag = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];
        return L.circle(latlng, {
            fillColor: getColor(feature.geometry.coordinates[2]),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
            color: "blue",
            fillColor: getColor(depth),
            radius: mag * 20000
        })
    }
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: bindPopUp,
        pointToLayer: circleMarker
      });     
    
    createMap(earthquakes);
    }  


function createMap(earthquakes) {

    // Setup the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
      
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
      
    // Setup the baseMaps object.
    let baseMaps = {
          "Street Map": street,
          "Topographic Map": topo
    };
      
    // Created an overlay object to hold overlay.
    let overlayMaps = {
          Earthquakes: earthquakes
    };
      
    // Create our map with streetmap and earthquakes layers
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
        });
      
  
    // Adding the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    
    // Setup the legend.
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend'),
        depth = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label.
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' +
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
};   