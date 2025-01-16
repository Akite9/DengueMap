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
                type: 'time', // Use 'time' for a time-based x-axis
                time: {
                    unit: 'year', // Format as years
                    tooltipFormat: 'yyyy', // Tooltip format
                    displayFormats: {
                        year: 'yyyy' // Display only years on the axis
                    }
                },
                title: {
                    display: true,
                    text: 'Year'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Total Cases'
                }
            }
        }
    }
});

function updateTimeSeriesChart(label, casesByYear) {
    // Clear existing chart data
    timeSeriesChart.data.labels = [];
    timeSeriesChart.data.datasets[0].data = [];
    timeSeriesChart.data.datasets[0].label = label;

    // Sort years and update labels and data
    const sortedYears = Object.keys(casesByYear).sort((a, b) => a - b);
    sortedYears.forEach(year => {
        timeSeriesChart.data.labels.push(`${year}-01-01`); // Convert year to ISO date string
        timeSeriesChart.data.datasets[0].data.push(casesByYear[year]);
    });

    // Update the chart
    timeSeriesChart.update();
}

// Fetch and display data
var markers = {};
var totalCasesByYear = {};
fetch('data/dengue_cases.json')
    .then(response => response.json())
    .then(data => {
        // Add markers or regions to the map
        data.forEach(country => {
            var marker = L.marker([country.lat, country.lon]).addTo(map);
            marker.bindPopup(`<strong>${country.name}</strong><br>Cases: ${country.cases[2025]}`);
            markers[country.name] = { marker: marker, cases: country.cases };
        });

        // Add click event to update chart for a specific country
        marker.on('click', function () {
            updateTimeSeriesChart(`Cases for ${countryName}`, countryCases);
        });

        // Calculate totalCasesByYear AFTER markers are populated

        for (var country in markers) {
            for (var year in markers[country].cases) {
                totalCasesByYear[year] = (totalCasesByYear[year] || 0) + markers[country].cases[year];
            }
        }

        // Update the time-series chart
        updateTimeSeriesChart('Total cases', totalCasesByYear);
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

document.getElementById('reset-chart-button').addEventListener('click', function () {
    updateTimeSeriesChart('Total cases', totalCasesByYear);
});
