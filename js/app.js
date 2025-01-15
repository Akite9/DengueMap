// Initialize the map
var map = L.map('map').setView([0, 0], 2); // Centered at the equator
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Fetch and display data
fetch('data/dengue_cases.json')
    .then(response => response.json())
    .then(data => {
        // Add markers or regions to the map
        data.forEach(country => {
            L.marker([country.lat, country.lon]).addTo(map)
                .bindPopup(`<strong>${country.name}</strong><br>Cases: ${country.cases[2025]}`);
        });
    });

// Time slider interactivity
const timeSlider = document.getElementById('time-slider');
const timeValue = document.getElementById('time-value');
timeSlider.addEventListener('input', () => {
    timeValue.textContent = timeSlider.value;
    // Update map and chart based on the selected year
});
