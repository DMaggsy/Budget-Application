let budgetChart; // Declare this at the top level of chart.js

// Ensure the DOM is fully loaded before trying to access elements
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    // Initialize the chart
    budgetChart = new Chart(ctx, {
        type: 'bar', // Or whichever type you prefer
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Budget Overview',
                data: [0, 0], // Initial data, will be updated dynamically
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // If you need to update the chart based on the initial state
    updateChart(appState.entries);
});

function updateChart(entries) {
    // Assuming you have a function to process entries and return income and expenses totals
    const processedData = processEntriesForChart(entries);

    if (budgetChart) {
        budgetChart.data.datasets[0].data = [processedData.incomeTotal, processedData.expensesTotal];
        budgetChart.update();
    }
}

// Example processing function, replace with your actual logic
function processEntriesForChart(entries) {
    let incomeTotal = 0;
    let expensesTotal = 0;

    entries.forEach(entry => {
        if (entry.type === 'income') {
            incomeTotal += entry.amount;
        } else if (entry.type === 'expense') {
            expensesTotal += entry.amount;
        }
    });

    return { incomeTotal, expensesTotal };
}
