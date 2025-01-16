// Initialize the map
var map = L.map('map').setView([0, 0], 2); // Centered at the equator
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Initialize the time-series chart using Chart.js
var ctx = document.getElementById('timeSeriesChart').getContext('2d');
var timeSeriesChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Years will be added dynamically
        datasets: [{
            label: 'Total Cases Across All Countries',
            data: [],  // Total cases for each year will be added dynamically
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            }
        }
    }
});

function updateTimeSeriesChart(casesByYear) {
    // Reset chart data
    timeSeriesChart.data.labels = [];
    timeSeriesChart.data.datasets[0].data = [];

    // Sort years and update labels and data
    const sortedYears = Object.keys(casesByYear).sort((a, b) => a - b);
    sortedYears.forEach(year => {
        timeSeriesChart.data.labels.push(year);
        timeSeriesChart.data.datasets[0].data.push(casesByYear[year]);
    });

    // Update the chart
    timeSeriesChart.update();
}

// Fetch and display data
var markers = {};
fetch('data/dengue_cases.json')
    .then(response => response.json())
    .then(data => {
        // Add markers or regions to the map
        data.forEach(country => {
            var marker = L.marker([country.lat, country.lon]).addTo(map);
            marker.bindPopup(`<strong>${country.name}</strong><br>Cases: ${country.cases[2025]}`);
            markers[country.name] = { marker: marker, cases: country.cases };
        });

        // Calculate totalCasesByYear AFTER markers are populated
        var totalCasesByYear = {};
        for (var country in markers) {
            for (var year in markers[country].cases) {
                totalCasesByYear[year] = (totalCasesByYear[year] || 0) + markers[country].cases[year];
            }
        }

        // Update the time-series chart
        updateTimeSeriesChart(totalCasesByYear);
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
