const ctx = document.getElementById('budgetChart').getContext('2d');
let budgetChart;

function updateChart(entries) {
  const incomeData = entries.filter(entry => entry.type === 'income').map(entry => entry.amount);
  const expenseData = entries.filter(entry => entry.type === 'expense').map(entry => entry.amount);

  const incomeSum = incomeData.reduce((acc, cur) => acc + cur, 0);
  const expenseSum = expenseData.reduce((acc, cur) => acc + cur, 0);

  const chartData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      label: 'Budget Overview',
      data: [incomeSum, expenseSum],
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
  };

  if (budgetChart) {
    budgetChart.data = chartData;
    budgetChart.update();
  } else {
    budgetChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Listen for updates to appState and update the chart accordingly
document.addEventListener('DOMContentLoaded', () => {
  updateChart(appState.entries);
});

// Make updateChart function accessible from budget.js
window.updateChart = updateChart;
