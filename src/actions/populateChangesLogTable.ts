import { LogEntry } from "@models/LogEntry";

export function populateChangesLogTable(log: LogEntry[]) {
  const changesTableBody = document.querySelector('#changesTable tbody');
  if (!changesTableBody) {
    console.error('Table body not found for changes log');
    return;
  }
  changesTableBody.innerHTML = '';

  log.forEach(entry => {
    const row = document.createElement('tr');

    const changeTypeCell = document.createElement('td');
    changeTypeCell.textContent = entry.type;
    row.appendChild(changeTypeCell);

    const eventNameCell = document.createElement('td');
    eventNameCell.textContent = entry.event;
    row.appendChild(eventNameCell);

    const originalValueCell = document.createElement('td');
    originalValueCell.textContent = entry.oldValue;
    row.appendChild(originalValueCell);

    const newValueCell = document.createElement('td');
    newValueCell.textContent = entry.newValue;
    row.appendChild(newValueCell);

    const timestampCell = document.createElement('td');
    timestampCell.textContent = new Date(entry.timestamp).toLocaleString();
    row.appendChild(timestampCell);

    changesTableBody.appendChild(row);
  });
}