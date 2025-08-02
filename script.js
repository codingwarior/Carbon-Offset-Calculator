// Emission factors (kg CO2e per unit) with city-specific electricity adjustments
const emissionFactors = {
    electricity: { delhi: 0.90, mumbai: 0.85, bangalore: 0.70, hyderabad: 0.75, chennai: 0.65, kolkata: 0.80, other: 0.82 },
    vehicle: { petrol: 0.24, diesel: 0.27, electric: 0.05, public: 0.04 },
    flights: 0.5,
    diet: { vegetarian: 1.5, mixed: 2.5, 'non-vegetarian': 3.5 },
    appliances: 50
};

// National and regional averages (kg CO2e per household per month)
const averages = { national: 250, urban: 300, rural: 200 };

let pieChartInstance = null;

document.getElementById('city').addEventListener('change', function() {
    const otherCityInput = document.getElementById('otherCity');
    if (this.value === 'other') otherCityInput.style.display = 'block';
    else otherCityInput.style.display = 'none';
});

function calculateCarbonFootprint() {
    const citySelect = document.getElementById('city');
    const otherCityInput = document.getElementById('otherCity');
    const electricity = document.getElementById('electricity').value;
    const vehicle = document.getElementById('vehicle').value;
    const vehicleType = document.getElementById('vehicleType').value;
    const flights = document.getElementById('flights').value;
    const diet = document.getElementById('diet').value;
    const appliances = document.getElementById('appliances').value;

    // Check if all fields are filled
    if (!citySelect.value || (citySelect.value === 'other' && !otherCityInput.value.trim()) || !electricity || !vehicle || !vehicleType || !flights || !diet || !appliances) {
        document.getElementById('result').innerHTML = `
            <h2>Your Carbon Footprint 🌍</h2>
            <p>Please fill in all fields to calculate your carbon footprint.</p>
        `;
        document.getElementById('impact-analysis').innerHTML = '';
        document.getElementById('comparison').innerHTML = '';
        document.getElementById('offsets').innerHTML = '';
        if (pieChartInstance) pieChartInstance.destroy();
        return;
    }

    let city = citySelect.value;
    if (city === 'other' && otherCityInput.value.trim()) city = 'other';

    const electricityEmissions = parseFloat(electricity) * emissionFactors.electricity[city];
    const vehicleEmissions = parseFloat(vehicle) * emissionFactors.vehicle[vehicleType];
    const flightEmissions = parseInt(flights) * 2500 * emissionFactors.flights;
    const dietEmissions = emissionFactors.diet[diet] * 30;
    const applianceEmissions = parseInt(appliances) * emissionFactors.appliances;

    const totalEmissions = electricityEmissions + vehicleEmissions + flightEmissions + dietEmissions + applianceEmissions;

    const annualElectricity = electricityEmissions * 12;
    const annualTravel = vehicleEmissions * 12;
    const annualFlights = flightEmissions;
    const annualFood = dietEmissions * 12;
    const annualAppliances = applianceEmissions * 12;

    document.getElementById('result').innerHTML = `
        <h2>Your Carbon Footprint 🌍</h2>
        <p>Total Monthly Emissions: <strong>${totalEmissions.toFixed(2)} kg CO2e</strong></p>
        <p>Breakdown:</p>
        <ul>
            <li>Electricity ⚡️: ${electricityEmissions.toFixed(2)} kg CO2e</li>
            <li>Travel 🚗: ${vehicleEmissions.toFixed(2)} kg CO2e</li>
            <li>Flights ✈️: ${(flightEmissions / 12).toFixed(2)} kg CO2e</li>
            <li>Diet 🥗: ${dietEmissions.toFixed(2)} kg CO2e</li>
            <li>Appliances 🧊: ${applianceEmissions.toFixed(2)} kg CO2e</li>
        </ul>
    `;

    document.getElementById('impact-analysis').innerHTML = `
        <h2>Detailed Impact Analysis 📊</h2>
        <p>See how each aspect of your lifestyle contributes to your carbon footprint</p>
        <div id="impact-blocks"></div>
    `;
    document.getElementById('impact-blocks').innerHTML = `
        <div class="impact-block" style="background-color: #fffde7;">
            <span>⚡️</span><h3>Electricity</h3><p><strong>${annualElectricity.toFixed(2)}</strong> kg CO₂/year</p>
        </div>
        <div class="impact-block" style="background-color: #e1f5fe;">
            <span>🚗</span><h3>Travel</h3><p><strong>${annualTravel.toFixed(2)}</strong> kg CO₂/year</p>
        </div>
        <div class="impact-block" style="background-color: #e8f5e9;">
            <span>✈️</span><h3>Flights</h3><p><strong>${annualFlights.toFixed(2)}</strong> kg CO₂/year</p>
        </div>
        <div class="impact-block" style="background-color: #f3e5f5;">
            <span>🥗</span><h3>Food</h3><p><strong>${annualFood.toFixed(2)}</strong> kg CO₂/year</p>
        </div>
        <div class="impact-block" style="background-color: #eceff1;">
            <span>🧊</span><h3>Appliances</h3><p><strong>${annualAppliances.toFixed(2)}</strong> kg CO₂/year</p>
        </div>
    `;

    document.getElementById('comparison').innerHTML = `
        <h2>How You Compare 📊</h2>
        <p>National Average: ${averages.national} kg CO2e/month</p>
        <p>Urban Average: ${averages.urban} kg CO2e/month</p>
        <p>Rural Average: ${averages.rural} kg CO2e/month</p>
        <p>Your emissions are ${totalEmissions > averages.national ? 'above' : 'below'} the national average. 🌿</p>
    `;

    const treesNeeded = Math.ceil(totalEmissions / 20);
    document.getElementById('offsets').innerHTML = `
        <h2>Offset Your Emissions 🌳</h2>
        <p>Plant <strong>${treesNeeded}</strong> trees annually to offset your emissions! 🌱</p>
        <p>Local Programs:</p>
        <ul>
            <li><a href="https://www.grow-trees.com" target="_blank">Grow-Trees.com</a> - Plant trees across India 🌳</li>
            <li><a href="https://www.sankalptaru.org" target="_blank">SankalpTaru</a> - Support rural tree planting 🌿</li>
            <li><a href="https://www.tatapower.com" target="_blank">Tata Power Solar</a> - Subscribe to solar energy programs ☀️</li>
        </ul>
    `;

    const chartData = {
        labels: ['Electricity', 'Travel', 'Flights', 'Food', 'Appliances'],
        datasets: [{ data: [annualElectricity, annualTravel, annualFlights, annualFood, annualAppliances], backgroundColor: ['#ff9800', '#1976d2', '#388e3c', '#ab47bc', '#455a64'], borderWidth: 1 }]
    };

    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(document.getElementById('pieChart').getContext('2d'), {
        type: 'pie',
        data: chartData,
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Emissions Breakdown' } } }
    });
}

function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('datetime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }) + ' IST';
    }
}

// Update date and time every second
setInterval(updateDateTime, 1000);

// Initial call to display date and time immediately
updateDateTime();
