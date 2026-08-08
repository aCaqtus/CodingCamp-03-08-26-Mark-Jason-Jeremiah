# Requirements Document

## Introduction

The Expense & Budget Visualizer is a complete, polished, mobile-friendly client-side web application that allows users to record daily expenses, view total spending, see a transaction history, and visualize spending distribution by category. It runs entirely in the browser with no backend server, persisting all data to the browser's localStorage. This is a beginner software engineering course project — the implementation must prioritize clean, understandable, and maintainable code using only plain HTML, CSS, and vanilla JavaScript. Chart.js via CDN is the only permitted external library.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense record containing an id, item name, amount, category, and auto-generated date.
- **Transaction_Form**: The UI form component used to add new transactions (item name, amount, category fields).
- **Transaction_List**: The UI component that displays all recorded transactions in a scrollable list.
- **Total_Display**: The UI element that shows the total of all recorded expense amounts formatted as Indonesian Rupiah.
- **Pie_Chart**: The Chart.js pie chart that visualizes spending distribution by category.
- **Monthly_Summary**: The optional UI component that shows total spending for a selected calendar month.
- **Theme_Toggle**: The optional UI control that switches the App between dark and light color schemes.
- **Validator**: The client-side logic that checks Transaction_Form input before a transaction is saved.
- **localStorage**: The browser's built-in key-value storage API used to persist all application data client-side.

---

## Requirements

### Requirement 1: Project Structure and Technology Constraints

**User Story:** As a course instructor, I want the project to use only vanilla web technologies in a defined file structure, so that students learn foundational skills without relying on frameworks or build tools.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and vanilla JavaScript — no JavaScript or CSS frameworks (React, Vue, Angular, Svelte, TypeScript, Tailwind, Bootstrap, or equivalent) are permitted.
2. THE App SHALL use Chart.js loaded via CDN as the only permitted external library, exclusively for rendering the Pie_Chart.
3. THE App SHALL include exactly the following files: `index.html` at the project root, exactly one CSS file at `css/style.css`, and exactly one JavaScript file at `js/script.js`.
4. THE App SHALL contain no unnecessary files beyond the required project structure and the `.kiro/` directory.
5. THE App SHALL contain no inline CSS — all styles SHALL reside in `css/style.css`.
6. THE App SHALL contain no inline JavaScript — all scripts SHALL reside in `js/script.js`.
7. THE App SHALL load and operate fully without a backend server, build step, or bundler.

---

### Requirement 2: Transaction Input Form

**User Story:** As a user, I want to fill in a form to add a new expense, so that I can record what I spent and on what.

#### Acceptance Criteria

1. THE Transaction_Form SHALL include an Item Name field (text input, required), an Amount field (numeric input, required), and a Category field (select/dropdown, required) with options: Food, Transport, Fun.
2. WHEN the user submits the Transaction_Form with all valid inputs, THE App SHALL create a Transaction, add it to the Transaction_List, save it to localStorage, update the Total_Display, update the Pie_Chart, and clear the form — all without reloading the page.
3. WHEN the user submits the Transaction_Form, THE Validator SHALL verify that the Item Name is not empty after trimming whitespace, the Amount is a valid positive number greater than zero, and a Category has been selected.
4. IF the Transaction_Form contains invalid input, THEN THE Validator SHALL display an inline error message adjacent to each invalid field and SHALL NOT create or save the Transaction.
5. WHEN a Transaction is successfully added, THE Transaction_Form SHALL reset all fields to their default empty/unselected state.
6. THE App SHALL NOT use repeated browser `alert()` calls to communicate validation errors — all error messages SHALL appear inline in the UI.

---

### Requirement 3: Transaction Data

**User Story:** As a user, I want each expense I record to carry all relevant details, so that I can review complete information in my transaction history.

#### Acceptance Criteria

1. THE App SHALL represent each Transaction as a JSON object containing at minimum: a unique `id`, an `name` string (the item name with leading/trailing whitespace trimmed), a numeric `amount`, a `category` string, and a `date` string in `YYYY-MM-DD` format.
2. THE App SHALL generate the `date` field automatically from the current date at the time of submission — the user SHALL NOT be required to enter a date.
3. THE App SHALL generate a unique `id` for each Transaction at the time of creation.

---

### Requirement 4: Transaction List

**User Story:** As a user, I want to see all my recorded expenses in a list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all recorded Transactions, with each entry showing: item name, amount formatted as Indonesian Rupiah, category, date, and a delete button.
2. THE Transaction_List SHALL have a defined maximum height so that it does not make the page excessively tall, and SHALL scroll internally when the number of entries exceeds the visible area.
3. WHEN there are no Transactions, THE Transaction_List SHALL display the message: "No expenses yet. Add your first expense above."
4. WHEN the user clicks the delete button on a Transaction entry, THE App SHALL remove that Transaction from the data, update localStorage, re-render the Transaction_List, recalculate the Total_Display, update the Pie_Chart, and update the Monthly_Summary (if implemented) — all without reloading the page.

---

### Requirement 5: Total Spending Display

**User Story:** As a user, I want to see my total spending prominently displayed, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Total_Display SHALL show the sum of all recorded Transaction amounts, labeled clearly (e.g., "Total Balance"), and positioned prominently near the top of the App.
2. THE App SHALL calculate the total dynamically from the current Transaction data and update the Total_Display automatically whenever a Transaction is added or deleted.
3. THE App SHALL format all currency values using `Intl.NumberFormat('id-ID')` to produce Indonesian Rupiah format (e.g., `Rp25.000`, `Rp1.250.000`).
4. THE App SHALL store and calculate Transaction amounts as numeric values — formatting to Indonesian Rupiah SHALL be applied only at the point of display.

---

### Requirement 6: Pie Chart Visualization

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand my spending distribution at a glance.

#### Acceptance Criteria

1. THE App SHALL render the Pie_Chart using Chart.js loaded via CDN on an HTML `<canvas>` element, where each segment's arc length is proportional to that category's share of total spending.
2. THE Pie_Chart SHALL display spending data for the categories: Food, Transport, and Fun (plus any additional categories if the optional custom category feature is implemented).
3. WHEN a Transaction is added or deleted, THE App SHALL update the Pie_Chart automatically without reloading the page.
4. WHEN there are no Transactions, THE App SHALL display the message "No spending data available." instead of rendering an empty or misleading chart.
5. THE App SHALL maintain a single Chart.js instance for the Pie_Chart and update it in place rather than destroying and recreating it on every data change.

---

### Requirement 7: Data Persistence

**User Story:** As a user, I want my expense data to be saved between browser sessions, so that I do not lose my records when I close and reopen the browser.

#### Acceptance Criteria

1. THE App SHALL store all Transactions as a JSON-serialized array in localStorage under the exact key `expenseVisualizerTransactions`.
2. WHEN the App initializes, THE App SHALL read Transactions from localStorage and restore the full UI state — including Transaction_List, Total_Display, and Pie_Chart — before the user can interact with any input or control.
3. WHEN a Transaction is added or deleted, THE App SHALL write the updated Transaction array to localStorage before the next user interaction is processed.
4. FOR ALL Transaction arrays, if the array is serialized to JSON and then deserialized, the resulting array SHALL be element-for-element equivalent to the original, with each element retaining identical field names and values (round-trip property).
5. IF the value stored under the `expenseVisualizerTransactions` key is missing, not valid JSON, or otherwise malformed, THEN THE App SHALL initialize with an empty Transaction array and SHALL NOT throw an uncaught exception.

---

### Requirement 8: Responsive and Mobile-Friendly UI

**User Story:** As a user, I want the application to be usable on mobile, tablet, and desktop devices, so that I can track expenses from any device.

#### Acceptance Criteria

1. THE App SHALL use a responsive CSS layout that adapts to mobile, tablet, and desktop viewport widths without horizontal overflow on any screen size.
2. THE App SHALL set the HTML `<meta name="viewport">` tag to `content="width=device-width, initial-scale=1"`.
3. WHEN viewed on a small mobile viewport (320px–767px), THE App SHALL display all primary UI components (Transaction_Form, Total_Display, Transaction_List, Pie_Chart) without horizontal overflow and with the form fitting within the viewport width.
4. WHEN viewed on a larger screen, THE App SHALL display the layout in a centered dashboard with a sensible maximum width.
5. THE App SHALL render all interactive controls (buttons, inputs, selects) at a usable tap target size on mobile so that buttons remain operable with a finger tap.
6. THE Pie_Chart SHALL scale appropriately on mobile viewports without overflowing its container.
7. THE Transaction_List SHALL remain usable on mobile — entries SHALL be readable and the delete button SHALL be reachable on small screens.
8. THE App SHALL use a minimum font size of 16px on form inputs so that mobile browsers do not auto-zoom the viewport on focus.

---

### Requirement 9: Input Validation

**User Story:** As a user, I want clear feedback when I enter invalid data, so that I can correct my mistakes before they are saved.

#### Acceptance Criteria

1. THE Validator SHALL reject a Transaction submission IF the Item Name field is empty or contains only whitespace.
2. THE Validator SHALL reject a Transaction submission IF the Amount field is empty, non-numeric, zero, or negative.
3. THE Validator SHALL reject a Transaction submission IF no Category is selected.
4. WHEN validation fails, THE App SHALL display inline error messages adjacent to each invalid field and SHALL NOT clear any valid field values already entered.
5. WHEN validation passes and the Transaction is saved, THE App SHALL remove all validation error messages from the UI.
6. THE App SHALL NOT use `window.alert()` to display validation errors.

---

### Requirement 10: Accessibility

**User Story:** As a user with assistive technology, I want the application to be keyboard-navigable and screen-reader compatible, so that I can use the app regardless of ability.

#### Acceptance Criteria

1. THE App SHALL associate every form input with a visible `<label>` element using matching `for` and `id` attributes.
2. THE App SHALL use semantic HTML elements (e.g., `<form>`, `<button>`, `<ul>`, `<li>`, `<h1>`–`<h6>`) that reflect the content's meaning and structure.
3. THE Transaction_Form SHALL be fully operable using keyboard navigation (Tab, Shift+Tab, Enter, Space, arrow keys for select) with a visible focus indicator on every interactive element.
4. THE App SHALL provide sufficient color contrast for all text elements to meet WCAG 2.1 AA contrast ratios.
5. THE App SHALL not rely solely on color to communicate information — supplementary text or icons SHALL be used where color conveys meaning.
6. THE App SHALL provide clear, descriptive text labels for all buttons.
7. THE App SHALL use meaningful heading elements to establish a clear visual and semantic hierarchy.
8. THE App SHALL include ARIA attributes only where they add value beyond what semantic HTML already provides.

---

### Requirement 11: Code Quality

**User Story:** As a course instructor, I want the codebase to be clean and readable, so that students and reviewers can easily understand and maintain the code.

#### Acceptance Criteria

1. THE App SHALL separate JavaScript logic into clearly named, single-purpose functions rather than placing all logic in a single function.
2. THE App SHALL centralize all localStorage read and write operations in dedicated functions (e.g., `loadTransactions()` and `saveTransactions()`).
3. THE App SHALL use clear, descriptive variable and function names throughout `js/script.js`.
4. THE App SHALL include logical inline comments where the purpose of a code block is not immediately obvious.
5. THE App SHALL contain no dead code, unused functions, or unused library imports.
6. THE App SHALL produce no errors or unhandled exceptions in the browser console during normal operation.

---

### Requirement 12 (Optional Challenge): Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light color schemes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHERE dark/light mode is implemented, THE App SHALL include a Theme_Toggle control visible in the application header that is keyboard-accessible and has a descriptive accessible label.
2. WHERE dark/light mode is implemented, WHEN the user activates the Theme_Toggle, THE App SHALL switch the entire App appearance — including text, controls, and the Pie_Chart — to the selected color scheme without reloading the page.
3. WHERE dark/light mode is implemented, THE App SHALL persist the user's selected theme to localStorage and apply it before first paint on subsequent loads to prevent a flash of the wrong theme.
4. WHERE dark/light mode is implemented, ALL theme CSS SHALL reside in `css/style.css` — no additional CSS files SHALL be created for theming purposes.
5. WHERE dark/light mode is implemented, THE App SHALL ensure text, controls, and the Pie_Chart remain readable and accessible in both dark and light modes.

---

### Requirement 13 (Optional Challenge): Transaction Sorting

**User Story:** As a user, I want to sort my transaction list, so that I can view my expenses in the order most useful to me.

#### Acceptance Criteria

1. WHERE sorting is implemented, THE Transaction_List SHALL include sort controls that allow the user to sort transactions by: newest first, oldest first, highest amount, and lowest amount.
2. WHERE sorting is implemented, WHEN the user selects a sort option, THE Transaction_List SHALL re-render in the selected order without modifying the underlying Transaction data stored in localStorage.
3. WHERE sorting is implemented, WHEN a Transaction is added or deleted while a sort order is active, THE Transaction_List SHALL maintain the currently selected sort order after re-rendering.
4. WHERE sorting is implemented, WHEN the user deletes a Transaction while the list is sorted, THE App SHALL delete the correct Transaction regardless of its current display position.

---

### Requirement 14 (Optional Challenge): Monthly Summary

**User Story:** As a user, I want to see my total spending for a specific month, so that I can track how much I spend each month.

#### Acceptance Criteria

1. WHERE the Monthly_Summary is implemented, THE App SHALL display the currently selected month and the total spending for that month.
2. WHERE the Monthly_Summary is implemented, THE App SHALL allow the user to navigate between available months or select a specific month.
3. WHERE the Monthly_Summary is implemented, THE Monthly_Summary SHALL calculate totals dynamically from Transaction dates and update automatically when Transactions are added or deleted.
4. WHERE the Monthly_Summary is implemented, Transactions from months other than the selected month SHALL NOT affect the Monthly_Summary total for the selected month.
5. WHERE the Monthly_Summary is implemented, WHEN there are no Transactions in the selected month, THE Monthly_Summary SHALL display the message: "No expenses recorded for this month."
