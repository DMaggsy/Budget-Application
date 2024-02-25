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
  