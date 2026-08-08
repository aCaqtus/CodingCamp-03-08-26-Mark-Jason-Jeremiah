# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a single-page, client-side expense tracker in exactly three files (`index.html`, `css/style.css`, `js/script.js`) using vanilla HTML, CSS, and JavaScript with Chart.js via CDN. Each task builds incrementally on the previous one, ending with all optional challenges wired in.

---

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` at the project root with correct `<!DOCTYPE html>`, `<meta charset>`, and `<meta name="viewport" content="width=device-width, initial-scale=1">` tags
  - Add `<link>` to `css/style.css` and `<script defer src="js/script.js">` (no inline styles or scripts)
  - Add Chart.js CDN `<script>` tag in `<head>`
  - Build the full semantic HTML structure: `<header>` with `<h1>` and `#theme-toggle` button; `<main>` containing `#total-section`, `#form-section`, `#chart-section`, `#sort-section`, `#list-section`, and `#monthly-section` exactly as specified in the design
  - Include all form fields (`#item-name`, `#amount`, `#category`) with matching `<label for>` / `id` pairs and inline error `<span class="error">` elements
  - Add `<canvas id="spending-chart">` and `<p id="chart-empty-state" hidden>` inside `#chart-section`
  - Add `<ul id="transaction-list">` inside `#list-section`
  - Add `#month-nav` navigation buttons and `#monthly-total` paragraph inside `#monthly-section`
  - _Requirements: 1.3, 1.5, 1.6, 2.1, 4.1, 6.1, 8.2, 10.1, 10.2, 10.6, 10.7, 12.1, 13.1, 14.1_

- [x] 2. Implement base CSS — tokens, reset, mobile-first layout
  - [x] 2.1 Write CSS custom properties and theme tokens
    - Define `:root` CSS variables: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-danger`, `--color-border`, `--color-error`, `--radius`, `--shadow`, `--max-width`
    - Define `[data-theme="dark"]` overrides for all color tokens
    - _Requirements: 1.5, 12.4_

  - [x] 2.2 Write base reset, layout, and component styles
    - Add box-sizing reset and base typography (minimum 16px on inputs per Req 8.8)
    - Style `<header>`, `#total-section` (Total_Display card), `#form-section` (form inputs, labels, error spans, submit button)
    - Style `#chart-section` (chart container, empty state), `#sort-section`, `#list-section` (`<ul>`, `<li>`, delete button; max-height + overflow-y: scroll), `#monthly-section`
    - Add mobile-first single-column layout; add `@media (min-width: 768px)` centered dashboard with `max-width: var(--max-width)`
    - Ensure visible focus indicators on all interactive elements
    - _Requirements: 1.5, 4.2, 8.1, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 10.3, 10.4_

- [x] 3. Implement storage and data utility functions in `js/script.js`
  - [x] 3.1 Implement `loadTransactions`, `saveTransactions`, `loadTheme`, `saveTheme`
    - `loadTransactions()`: wrap `JSON.parse(localStorage.getItem('expenseVisualizerTransactions'))` in try/catch; return `[]` on any error
    - `saveTransactions(transactions)`: wrap `localStorage.setItem` in try/catch; log console warning on `QuotaExceededError`
    - `loadTheme()` / `saveTheme(theme)`: read/write `expenseVisualizerTheme` key
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 11.2_

  - [ ]* 3.2 Write property test for `loadTransactions` malformed-data handling (Property 10)
    - **Property 10: Malformed localStorage data initializes an empty array**
    - Feed arbitrary non-JSON strings and invalid JSON arrays into the key; assert `loadTransactions()` returns `[]` and throws no exception
    - **Validates: Requirements 7.5**

  - [ ]* 3.3 Write property test for serialization round-trip (Property 9)
    - **Property 9: Serialization round-trip preserves all transaction data**
    - Generate random `Transaction[]`, call `saveTransactions` then `loadTransactions`, assert element-for-element equality
    - **Validates: Requirements 7.1, 7.4**

- [x] 4. Implement transaction creation and ID/date utilities
  - [x] 4.1 Implement `generateId`, `getCurrentDate`, and `createTransaction`
    - `generateId()`: returns `Date.now().toString()`
    - `getCurrentDate()`: returns today as `YYYY-MM-DD` string
    - `createTransaction(name, amount, category)`: builds and returns `{ id, name: name.trim(), amount: Number(amount), category, date }` object
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 4.2 Write property test for `createTransaction` shape (Property 1)
    - **Property 1: Valid submission creates a well-formed transaction**
    - Generate random valid (name, amount, category) tuples; assert all five fields exist with correct types and date matches `YYYY-MM-DD`
    - **Validates: Requirements 2.2, 3.1, 3.2, 3.3**

  - [ ]* 4.3 Write property test for unique IDs (Property 2)
    - **Property 2: Transaction IDs are unique across all creations**
    - Call `createTransaction` N times (N from 2–20) sequentially; assert all IDs are distinct
    - **Validates: Requirements 3.3**

- [x] 5. Implement form validation
  - [x] 5.1 Implement `validateForm`, `showErrors`, and `clearErrors`
    - `validateForm(name, amount, category)`: returns `{ valid, errors: { name?, amount?, category? } }` per the validation rules in the design
    - `showErrors(errors)`: populates `#error-name`, `#error-amount`, `#error-category` spans
    - `clearErrors()`: empties all three error spans
    - _Requirements: 2.3, 2.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 5.2 Write property test for whitespace-name rejection (Property 3)
    - **Property 3: Validator rejects all whitespace-only item names**
    - Generate strings composed only of spaces/tabs/newlines; assert `validateForm` returns `valid: false` with a non-empty `name` error
    - **Validates: Requirements 2.3, 2.4, 9.1**

  - [ ]* 5.3 Write property test for non-positive amount rejection (Property 4)
    - **Property 4: Validator rejects all non-positive amounts**
    - Generate zero, negatives, and non-numeric strings; assert `validateForm` returns `valid: false` with a non-empty `amount` error
    - **Validates: Requirements 2.3, 2.4, 9.2**

- [x] 6. Implement currency formatting and total display
  - [x] 6.1 Implement `formatRupiah` and `renderTotalDisplay`
    - `formatRupiah(amount)`: uses `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)`
    - `renderTotalDisplay(transactions)`: sums all `amount` fields, calls `formatRupiah`, updates `#total-display` text
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.2 Write property test for total equals sum (Property 7)
    - **Property 7: Total display equals arithmetic sum of all amounts**
    - Generate random `Transaction[]` (0–20 items); assert rendered total equals `amounts.reduce((a, b) => a + b, 0)`
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 6.3 Write property test for Rupiah currency format (Property 8)
    - **Property 8: Currency formatting produces valid Rupiah strings**
    - Generate random non-negative integers 0–10,000,000; assert result starts with `"Rp"` and contains no decimal separator
    - **Validates: Requirements 5.3**

- [x] 7. Implement transaction list rendering and deletion
  - [x] 7.1 Implement `renderTransactionList` and `removeTransaction`
    - `renderTransactionList(transactions, sortOrder)`: clears `#transaction-list`, renders `<li>` for each transaction with name, `formatRupiah(amount)`, category, date, and a delete button with `data-id`; shows "No expenses yet. Add your first expense above." when empty
    - `removeTransaction(id)`: filters `transactions` array by id, calls `saveTransactions`, calls `renderAll`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.2 Write property test for list renders all fields (Property 5)
    - **Property 5: Transaction list renders all required fields**
    - Generate random `Transaction[]` (1–20 items); assert each rendered `<li>` contains name, Rp-string, category, date, and a delete button with matching `data-id`
    - **Validates: Requirements 4.1**

  - [ ]* 7.3 Write property test for delete removes exactly one (Property 6)
    - **Property 6: Delete removes exactly one transaction by ID**
    - Generate random `Transaction[]` + random target index; call `removeTransaction`; assert length decreases by 1 and the correct item is gone while others are unchanged
    - **Validates: Requirements 4.4**

- [x] 8. Checkpoint — Core MVP data flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement pie chart rendering
  - [x] 9.1 Implement `renderPieChart`
    - Aggregate `transactions` by category to produce `{ Food, Transport, Fun }` totals
    - If no transactions: hide `<canvas>`, show `#chart-empty-state`; else show canvas, hide empty state
    - On first render create `new Chart(ctx, { type: 'pie', ... })`; on subsequent renders mutate `.data.datasets[0].data` and `.data.labels` then call `chartInstance.update()`
    - Assign distinct colors for each category
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Implement sorting
  - [x] 10.1 Implement `getSortedTransactions` and `renderTransactionList` sort integration
    - `getSortedTransactions(transactions, sortOrder)`: returns a sorted *copy* (no mutation) for keys `'newest'`, `'oldest'`, `'highest'`, `'lowest'`
    - Update `renderTransactionList` to call `getSortedTransactions` before building `<li>` elements
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 10.2 Write property test for sort produces sorted copy without mutation (Property 11)
    - **Property 11: Sorting produces a sorted copy without mutating source data**
    - Generate random `Transaction[]` and random sort key; assert output is correctly ordered and original array is unchanged
    - **Validates: Requirements 13.2, 13.3**

  - [ ]* 10.3 Write property test for delete is sort-order-independent (Property 12)
    - **Property 12: Delete by ID is sort-order-independent**
    - Generate random `Transaction[]`, random sort order, random target ID; delete while sort is active; assert underlying data removes only the target regardless of display position
    - **Validates: Requirements 13.4**

- [x] 11. Implement theme toggle (Challenge 1)
  - [x] 11.1 Implement `applyTheme`, `toggleTheme`, and `loadTheme`/`saveTheme` wiring
    - `applyTheme(theme)`: sets `document.body.setAttribute('data-theme', theme)` and updates `#theme-toggle` button label (🌙 Dark Mode / ☀️ Light Mode)
    - `toggleTheme()`: flips `activeTheme` between `'light'` and `'dark'`, calls `saveTheme`, calls `applyTheme`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 11.2 Write property test for theme toggle round-trip (Property 14)
    - **Property 14: Theme toggle is an involution (round-trip)**
    - For initial theme `'light'` and `'dark'`: call `toggleTheme()` twice; assert `data-theme` and `localStorage` value are restored to the original
    - **Validates: Requirements 12.2, 12.3**

- [x] 12. Implement monthly summary (Challenge 3)
  - [x] 12.1 Implement `renderMonthlySummary` and month navigation
    - `renderMonthlySummary(transactions, month)`: filters by `date.startsWith(month)`, sums amounts, updates `#monthly-total` and `#active-month-label`; shows "No expenses recorded for this month." when filtered array is empty
    - `handleMonthNav`: increments/decrements `activeMonth` (YYYY-MM string) and re-renders monthly summary
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 12.2 Write property test for monthly summary filters correctly (Property 13)
    - **Property 13: Monthly summary total equals sum of same-month transactions only**
    - Generate random `Transaction[]` with random dates and a random target month; assert monthly total equals sum of only the matching transactions
    - **Validates: Requirements 14.1, 14.3, 14.4**

- [x] 13. Wire all event handlers and `init` function
  - [x] 13.1 Implement all event handlers and `init`
    - `handleFormSubmit(e)`: calls `e.preventDefault()`, `clearErrors()`, `validateForm()`; on valid: `createTransaction`, `transactions.push`, `saveTransactions`, `renderAll`, reset form; on invalid: `showErrors`
    - `handleDeleteClick(e)`: reads `data-id` from `e.target`, calls `removeTransaction`
    - `handleSortChange(e)`: updates `sortOrder`, calls `renderTransactionList`
    - `handleThemeToggle()`: calls `toggleTheme()`
    - `handleMonthNav(e)`: reads button id (`prev-month`/`next-month`), adjusts `activeMonth`, re-renders
    - `init()`: loads `transactions` from `loadTransactions`, loads and applies theme, sets `activeMonth` to current month, attaches all event listeners, calls `renderAll`
    - Register `init` on `DOMContentLoaded`
    - _Requirements: 2.2, 2.5, 4.4, 7.2, 7.3, 11.1, 11.4, 11.5, 13.3, 14.2_

  - [x] 13.2 Implement `renderAll`
    - `renderAll()`: calls `renderTotalDisplay(transactions)`, `renderTransactionList(transactions, sortOrder)`, `renderPieChart(transactions)`, `renderMonthlySummary(transactions, activeMonth)`
    - _Requirements: 2.2, 4.4, 5.2, 6.3, 14.3_

- [x] 14. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests reference design document Correctness Properties (P1–P14) for full traceability
- Each task references specific requirements for traceability
- Checkpoints at tasks 8 and 14 provide incremental validation gates
- The three-file constraint (index.html, css/style.css, js/script.js) is enforced throughout — no additional files may be created
- Chart.js is loaded via CDN only; no npm/build tooling

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "9.1"] },
    { "id": 7, "tasks": ["10.1"] },
    { "id": 8, "tasks": ["10.2", "10.3", "11.1"] },
    { "id": 9, "tasks": ["11.2", "12.1"] },
    { "id": 10, "tasks": ["12.2", "13.1"] },
    { "id": 11, "tasks": ["13.2"] }
  ]
}
```
