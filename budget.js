// App state management
const appState = {
    entries: JSON.parse(localStorage.getItem('budgetEntries')) || [],
    addEntry(entry) {
      this.entries.push(entry);
      this.updateLocalStorage();
      this.render();
    },
    deleteEntry(index) {
      this.entries.splice(index, 1);
      this.updateLocalStorage();
      this.render();
    },
    updateLocalStorage() {
      localStorage.setItem('budgetEntries', JSON.stringify(this.entries));
    },
    render() {
      renderEntries(this.entries);
      updateBalanceDisplay(this.entries);
      window.updateChart(this.entries); // Update the chart whenever the state changes
    }
};
  
function handleAddEntry(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const type = document.querySelector('input[name="entry-type"]:checked').value;
    const date = document.getElementById('entry-date').value; // Capture the date value
    
    const entry = { type, amount, description, date, id: Date.now() };
    appState.addEntry(entry);
    
    // Explicitly clear each input field
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    // Optionally reset the type to a default value if needed
    document.querySelector('input[name="entry-type"][value="income"]').checked = true;
  }
  
  function renderEntries(entries) {
    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    const entriesList = document.getElementById('entries-list');
    entriesList.innerHTML = ''; // Clear existing entries

    sortedEntries.forEach((entry, index) => {
        const entryElement = document.createElement('li');
        entryElement.className = 'entry';
        entryElement.innerHTML = `
            <span class="entry-date">${entry.date}</span>
            <span class="entry-amount">${entry.type === 'income' ? '+' : '-'} £${entry.amount.toFixed(2)}</span>
            <div class="entry-description">${entry.description}</div>
            <button onclick="handleDeleteEntry(${index})" class="delete-btn">Delete</button>
        `;
        entriesList.appendChild(entryElement);
    });
}


  
  function updateBalanceDisplay(entries) {
    let income = 0;
    let expenses = 0;
  
    entries.forEach(entry => {
      if (entry.type === 'income') {
        income += entry.amount;
      } else if (entry.type === 'expense') {
        expenses += entry.amount;
      }
    });
  
    const balance = income - expenses;
  
    document.getElementById('balance-display').textContent = `Balance: £${balance.toFixed(2)}`;
    document.getElementById('summary').textContent = `Income: £${income.toFixed(2)} | Expenses: £${expenses.toFixed(2)}`;
  }
  
  document.getElementById('entry-form').addEventListener('submit', handleAddEntry);
  
  function handleDeleteEntry(index) {
    appState.deleteEntry(index);
  }

  function exportToCSV(entries) {
    const { totalIncome, totalExpenses, balance } = calculateTotals(entries);
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Date,Type,Amount,Description\n";

    entries.forEach(entry => {
        let row = `${entry.date},${entry.type},£${entry.amount.toFixed(2)},"${entry.description}"`;
        csvContent += row + "\n";
    });

    // Append totals and balance
    csvContent += `\nTotal Income,,£${totalIncome.toFixed(2)},\n`;
    csvContent += `Total Expenses,,£${totalExpenses.toFixed(2)},\n`;
    csvContent += `Balance,,£${balance.toFixed(2)},`;

    // Ensure proper MIME type is set for CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Use a temporary link to trigger download
    const link = document.createElement("a");
    document.body.appendChild(link); // Compatibility: Add link element to the document
    link.style.display = 'none'; // Hide the link
    link.href = url;
    link.download = 'income_expenses.csv';
    link.click();

    // Clean up by revoking the Blob URL and removing the link
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    }, 100); // Delay to ensure the download process starts before cleanup
}



function exportToPDF(entries) {
    const { totalIncome, totalExpenses, balance } = calculateTotals(entries);
    const doc = new window.jspdf.jsPDF();
    let yPos = 10;

    doc.text('Income and Expenses', 10, yPos);
    yPos += 10;

    // List all entries
    entries.forEach(entry => {
        doc.text(`${entry.date} - ${entry.type} - £${entry.amount.toFixed(2)} - ${entry.description}`, 10, yPos);
        yPos += 10;
    });

    // Ensure there's space for the summary
    yPos += 10;

    // Add summary
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Income: £${totalIncome.toFixed(2)}`, 10, yPos);
    yPos += 10;
    doc.text(`Total Expenses: £${totalExpenses.toFixed(2)}`, 10, yPos);
    yPos += 10;
    doc.text(`Balance: £${balance.toFixed(2)}`, 10, yPos);

    doc.save('income_expenses.pdf');
}



function exportToExcel(entries) {
    const { totalIncome, totalExpenses, balance } = calculateTotals(entries);
    const worksheetData = entries.map(entry => ({
        Date: entry.date,
        Type: entry.type,
        Amount: `£${entry.amount.toFixed(2)}`,
        Description: entry.description
    }));

    // Append totals and balance
    worksheetData.push({ Date: "Total Income", Amount: `£${totalIncome.toFixed(2)}` });
    worksheetData.push({ Date: "Total Expenses", Amount: `£${totalExpenses.toFixed(2)}` });
    worksheetData.push({ Date: "Balance", Amount: `£${balance.toFixed(2)}` });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income and Expenses");
    XLSX.writeFile(workbook, "income_expenses.xlsx");
}


function calculateTotals(entries) {
    let totalIncome = 0;
    let totalExpenses = 0;

    entries.forEach(entry => {
        if (entry.type === 'income') {
            totalIncome += entry.amount;
        } else if (entry.type === 'expense') {
            totalExpenses += entry.amount;
        }
    });

    const balance = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, balance };
}


  document.getElementById('export-btn').addEventListener('click', function() {
    const exportType = document.getElementById('export-type').value;
    switch (exportType) {
        case 'csv':
            exportToCSV(appState.entries);
            break;
        case 'pdf':
            exportToPDF(appState.entries);
            break;
        case 'excel':
            exportToExcel(appState.entries);
            break;
        default:
            console.log('Unknown export type:', exportType);
    }
});

  