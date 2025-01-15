// Initialize the map
var map = L.map('map').setView([0, 0], 2); // Centered at the equator
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Fetch and display data
var markers = {};
fetch('data/dengue_cases.json')
    .then(response => response.json())
    .then(data => {
        // Add markers or regions to the map
        data.forEach(country => {
            var marker = L.marker([country.lat, country.lon]).addTo(map);
            marker.bindPopup(`<strong>${country.name}</strong><br>Cases: ${country.cases[2025]}`);
            // Store the marker in the `markers` object using country name
            markers[country.name] = { marker: marker, cases: country.cases };
        });
    });

// Time slider interactivity
const timeSlider = document.getElementById('time-slider');
const timeValue = document.getElementById('time-value');
timeSlider.addEventListener('input', function () {
    // Update map and chart based on the selected year
    currentYear = timeSlider.value;
    timeValue.textContent = currentYear;

    // Update popup content for each marker
    for(var markerId in markers) {
        var markerData = markers[markerId];
        var newContent = `<strong>${markerId}</strong><br>Cases: ${markerData.cases[currentYear]}`;
        markerData.marker.getPopup().setContent(newContent); // Update popup content
    }
});
