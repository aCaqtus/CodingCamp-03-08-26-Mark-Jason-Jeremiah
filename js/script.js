/**
 * Expense & Budget Visualizer
 * js/script.js
 *
 * Single-file client-side application for recording and visualizing daily expenses.
 * Uses localStorage for persistence and Chart.js (via CDN) for pie chart rendering.
 *
 * Requirements: 1.3, 1.6, 2.x, 3.x, 4.x, 5.x, 6.x, 7.x, 9.x, 11.x, 12.x, 13.x, 14.x
 */

// ── Module-level State ──────────────────────────────────────────────────────

/** @type {Transaction[]} Source of truth for all expense data */
let transactions = [];

/** @type {Chart|null} Single Chart.js instance, updated in place */
let chartInstance = null;

/** @type {string} Current sort key: 'newest' | 'oldest' | 'highest' | 'lowest' */
let sortOrder = 'newest';

/** @type {string} Current color scheme: 'light' | 'dark' */
let activeTheme = 'light';

/** @type {string} Currently displayed month in 'YYYY-MM' format */
let activeMonth = '';

// ── localStorage Keys ───────────────────────────────────────────────────────

const STORAGE_KEY_TRANSACTIONS = 'expenseVisualizerTransactions';
const STORAGE_KEY_THEME = 'expenseVisualizerTheme';

// ── Storage Functions ───────────────────────────────────────────────────────

/**
 * Loads transactions from localStorage.
 * Wraps JSON.parse in try/catch — returns [] if the key is missing,
 * the value is invalid JSON, or the parsed result is not an array.
 *
 * @returns {Transaction[]} The persisted transaction array, or [] on any error.
 */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('loadTransactions: failed to parse stored data.', err);
    return [];
  }
}

/**
 * Serializes the transactions array to JSON and writes it to localStorage.
 * Wraps setItem in try/catch and logs a warning on QuotaExceededError or
 * any other storage error, so the app continues operating with in-memory data.
 *
 * @param {Transaction[]} transactions - The current array of transactions to persist.
 */
function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.warn('saveTransactions: localStorage quota exceeded. Data was not saved.', err);
    } else {
      console.warn('saveTransactions: failed to save transactions.', err);
    }
  }
}

/**
 * Reads the persisted theme preference from localStorage.
 * Returns 'light' if the key is missing, empty, or contains an unrecognised value.
 *
 * @returns {'light'|'dark'} The stored theme, defaulting to 'light'.
 */
function loadTheme() {
  const stored = localStorage.getItem(STORAGE_KEY_THEME);
  if (stored === 'dark') return 'dark';
  return 'light'; // default for missing, null, or any other value
}

/**
 * Persists the selected theme string to localStorage.
 *
 * @param {'light'|'dark'} theme - The theme to save.
 */
function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

// ── Transaction Utilities ──

/**
 * Generates a unique string ID based on the current timestamp.
 *
 * @returns {string} A unique ID string (e.g., "1718000000000").
 */
function generateId() {
  return Date.now().toString();
}

/**
 * Returns today's date as a YYYY-MM-DD string using the local date (not UTC).
 *
 * @returns {string} Today's date in YYYY-MM-DD format.
 */
function getCurrentDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Builds and returns a new Transaction object with auto-generated id and date.
 *
 * @param {string} name     - The item name (will be trimmed of whitespace).
 * @param {number|string} amount   - The expense amount (will be cast to Number).
 * @param {string} category - The spending category (e.g., "Food", "Transport", "Fun").
 * @returns {Transaction} A fully-formed Transaction object ready to be saved.
 */
function createTransaction(name, amount, category) {
  return {
    id: generateId(),
    name: name.trim(),
    amount: Number(amount),
    category: category,
    date: getCurrentDate()
  };
}

// ── Validation Functions ────────────────────────────────────────────────────

/**
 * Validates the expense form fields.
 * @param {string} name - Raw item name value from the input.
 * @param {string} amount - Raw amount value from the input.
 * @param {string} category - Selected category value.
 * @returns {{ valid: boolean, errors: { name?: string, amount?: string, category?: string } }}
 */
function validateForm(name, amount, category) {
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Item name is required.';
  }

  const numericAmount = Number(amount);
  if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Please enter a valid positive amount.';
  }

  if (!category) {
    errors.category = 'Please select a category.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Populates inline error <span> elements for each invalid field.
 * @param {{ name?: string, amount?: string, category?: string }} errors
 */
function showErrors(errors) {
  document.getElementById('error-name').textContent = errors.name || '';
  document.getElementById('error-amount').textContent = errors.amount || '';
  document.getElementById('error-category').textContent = errors.category || '';
}

/**
 * Clears all inline validation error messages from the form.
 */
function clearErrors() {
  document.getElementById('error-name').textContent = '';
  document.getElementById('error-amount').textContent = '';
  document.getElementById('error-category').textContent = '';
}

// ── Currency & Total Display ─────────────────────────────────────────────────

/**
 * Formats a numeric amount as Indonesian Rupiah using Intl.NumberFormat.
 * @param {number} amount
 * @returns {string} e.g. "Rp25.000"
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculates the sum of all transaction amounts and updates the #total-display element.
 * @param {Transaction[]} txns
 */
function renderTotalDisplay(txns) {
  const total = txns.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById('total-display').textContent = formatRupiah(total);
}

// ── Sorting ──────────────────────────────────────────────────────────────────

/**
 * Returns a sorted COPY of the transactions array based on the given sort key.
 * Never mutates the original array.
 * @param {Transaction[]} txns
 * @param {string} order - 'newest' | 'oldest' | 'highest' | 'lowest'
 * @returns {Transaction[]}
 */
function getSortedTransactions(txns, order) {
  const copy = [...txns];
  switch (order) {
    case 'newest':
      return copy.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    case 'oldest':
      return copy.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    case 'highest':
      return copy.sort((a, b) => b.amount - a.amount);
    case 'lowest':
      return copy.sort((a, b) => a.amount - b.amount);
    default:
      return copy;
  }
}

// ── Transaction List ──────────────────────────────────────────────────────────

/**
 * Renders all transactions into #transaction-list, applying the current sort order.
 * Deleting uses data-id on each button so the correct transaction is always removed.
 * @param {Transaction[]} txns
 * @param {string} order - current sort key
 */
function renderTransactionList(txns, order) {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '';

  if (txns.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No expenses yet. Add your first expense above.';
    list.appendChild(empty);
    return;
  }

  const sorted = getSortedTransactions(txns, order);
  sorted.forEach(function(t) {
    const li = document.createElement('li');

    const name = document.createElement('span');
    name.className = 'transaction-name';
    name.textContent = t.name;

    const amount = document.createElement('span');
    amount.className = 'transaction-amount';
    amount.textContent = formatRupiah(t.amount);

    const category = document.createElement('span');
    category.className = 'transaction-category';
    category.textContent = t.category;

    const date = document.createElement('span');
    date.className = 'transaction-date';
    date.textContent = t.date;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('data-id', t.id);
    deleteBtn.setAttribute('aria-label', 'Delete ' + t.name);

    li.appendChild(name);
    li.appendChild(amount);
    li.appendChild(category);
    li.appendChild(date);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

/**
 * Removes a transaction by ID, saves to localStorage, and re-renders all components.
 * @param {string} id - The transaction ID to remove.
 */
function removeTransaction(id) {
  if (!id) return;
  transactions = transactions.filter(function(t) { return t.id !== id; });
  saveTransactions(transactions);
  renderAll();
}

// ── Pie Chart ─────────────────────────────────────────────────────────────────

/** Fixed colors for the three default categories */
const CATEGORY_COLORS = {
  Food: '#4a90d9',
  Transport: '#f5a623',
  Fun: '#7ed321'
};

/** Returns a color for any category, generating one for unknown categories */
function getCategoryColor(category) {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  // Simple deterministic color for custom categories
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return 'hsl(' + hue + ', 65%, 55%)';
}

/**
 * Renders or updates the Chart.js pie chart.
 * If no transactions exist, shows the empty state message instead.
 * Maintains a single chart instance and updates it in place.
 * @param {Transaction[]} txns
 */
function renderPieChart(txns) {
  const canvas = document.getElementById('spending-chart');
  const emptyState = document.getElementById('chart-empty-state');

  if (txns.length === 0) {
    canvas.hidden = true;
    emptyState.hidden = false;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  canvas.hidden = false;
  emptyState.hidden = true;

  // Aggregate totals by category
  const totals = {};
  txns.forEach(function(t) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const data = labels.map(function(l) { return totals[l]; });
  const colors = labels.map(getCategoryColor);

  // Update aria-label with current data
  const ariaText = labels.map(function(l) {
    return l + ': ' + formatRupiah(totals[l]);
  }).join(', ');
  canvas.setAttribute('aria-label', 'Spending by category: ' + ariaText);

  if (chartInstance) {
    // Update existing chart in place
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
  } else {
    // Create new chart instance
    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { size: 13 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + formatRupiah(context.parsed);
              }
            }
          }
        }
      }
    });
  }
}

// ── Theme Functions ───────────────────────────────────────────────────────────

/**
 * Applies the given theme to the document by setting the data-theme attribute
 * on <body> and updating the toggle button label.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (theme === 'dark') {
    btn.textContent = '☀️ Light Mode';
    btn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    btn.textContent = '🌙 Dark Mode';
    btn.setAttribute('aria-label', 'Switch to dark mode');
  }
}

/**
 * Toggles between light and dark theme, persists the choice, and re-applies.
 */
function toggleTheme() {
  activeTheme = activeTheme === 'light' ? 'dark' : 'light';
  saveTheme(activeTheme);
  applyTheme(activeTheme);
}

// ── Monthly Summary ───────────────────────────────────────────────────────────

/**
 * Formats a YYYY-MM string into a human-readable "Month YYYY" label.
 * @param {string} ym - e.g. "2025-07"
 * @returns {string} e.g. "July 2025"
 */
function formatMonthLabel(ym) {
  if (!ym) return '';
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Adjusts a YYYY-MM string by a given number of months (positive or negative).
 * @param {string} ym - e.g. "2025-07"
 * @param {number} delta - months to add (positive) or subtract (negative)
 * @returns {string} New YYYY-MM string
 */
function shiftMonth(ym, delta) {
  const [year, month] = ym.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}

/**
 * Renders the monthly summary for the currently selected month.
 * Filters transactions by date prefix, sums amounts, and displays the total.
 * @param {Transaction[]} txns
 * @param {string} month - YYYY-MM format
 */
function renderMonthlySummary(txns, month) {
  document.getElementById('active-month-label').textContent = formatMonthLabel(month);

  const monthlyTxns = txns.filter(function(t) { return t.date.startsWith(month); });
  const monthlyTotal = monthlyTxns.reduce(function(sum, t) { return sum + t.amount; }, 0);

  const totalEl = document.getElementById('monthly-total');
  if (monthlyTxns.length === 0) {
    totalEl.textContent = 'No expenses recorded for this month.';
  } else {
    totalEl.textContent = 'Total: ' + formatRupiah(monthlyTotal);
  }
}

// ── Render All ────────────────────────────────────────────────────────────────

/**
 * Re-renders all UI components from the current state.
 * Called after any data change (add/delete) and on initialization.
 */
function renderAll() {
  renderTotalDisplay(transactions);
  renderTransactionList(transactions, sortOrder);
  renderPieChart(transactions);
  renderMonthlySummary(transactions, activeMonth);
}

// ── Event Handlers ────────────────────────────────────────────────────────────

/**
 * Handles the expense form submission.
 * Validates, creates a transaction, saves, and re-renders. Clears the form on success.
 * @param {Event} e
 */
function handleFormSubmit(e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById('item-name').value;
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;

  const { valid, errors } = validateForm(name, amount, category);

  if (!valid) {
    showErrors(errors);
    return;
  }

  const transaction = createTransaction(name, amount, category);
  transactions.push(transaction);
  saveTransactions(transactions);
  renderAll();

  // Reset form fields
  document.getElementById('expense-form').reset();
}

/**
 * Handles click events on the transaction list using event delegation.
 * Reads data-id from the clicked delete button and removes that transaction.
 * @param {Event} e
 */
function handleDeleteClick(e) {
  if (e.target && e.target.classList.contains('delete-btn')) {
    const id = e.target.getAttribute('data-id');
    removeTransaction(id);
  }
}

/**
 * Handles the sort select change event.
 * Updates the sort order and re-renders only the transaction list.
 * @param {Event} e
 */
function handleSortChange(e) {
  sortOrder = e.target.value;
  renderTransactionList(transactions, sortOrder);
}

/**
 * Handles the theme toggle button click.
 */
function handleThemeToggle() {
  toggleTheme();
}

/**
 * Handles prev/next month navigation buttons.
 * Adjusts activeMonth by ±1 month and re-renders the monthly summary.
 * @param {Event} e
 */
function handleMonthNav(e) {
  const btn = e.currentTarget;
  if (btn.id === 'prev-month') {
    activeMonth = shiftMonth(activeMonth, -1);
  } else if (btn.id === 'next-month') {
    activeMonth = shiftMonth(activeMonth, 1);
  }
  renderMonthlySummary(transactions, activeMonth);
}

// ── Initialization ─────────────────────────────────────────────────────────────

/**
 * Initializes the application on DOMContentLoaded.
 * Loads persisted data and theme, sets up event listeners, renders the full UI.
 */
function init() {
  // Load persisted data
  transactions = loadTransactions();

  // Load and apply theme (before first paint to prevent flash)
  activeTheme = loadTheme();
  applyTheme(activeTheme);

  // Set active month to current month
  const today = getCurrentDate();
  activeMonth = today.substring(0, 7); // 'YYYY-MM'

  // Attach event listeners
  document.getElementById('expense-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('transaction-list').addEventListener('click', handleDeleteClick);
  document.getElementById('sort-select').addEventListener('change', handleSortChange);
  document.getElementById('theme-toggle').addEventListener('click', handleThemeToggle);
  document.getElementById('prev-month').addEventListener('click', handleMonthNav);
  document.getElementById('next-month').addEventListener('click', handleMonthNav);

  // Initial render
  renderAll();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
