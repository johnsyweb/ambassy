import { EventTeamsTableDataMap, eventAmbassadorsFrom, regionalAmbassadorsFrom } from '@models/EventTeamsTableData';
import { SelectionState } from '@models/SelectionState';
import { colorPalette } from './colorPalette';

function assignColorToName(name: string, allNames: string[]): string {
  const index = allNames.indexOf(name);
  return index >= 0 ? colorPalette[index % colorPalette.length] : "#808080";
}

export function populateEventTeamsTable(
  eventTeamsTableData: EventTeamsTableDataMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _eventDetailsMap: EventDetailsMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _changelog: LogEntry[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _eventAmbassadors?: EventAmbassadorMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _regionalAmbassadors?: RegionalAmbassadorMap
): void {
  const tableBody = document.querySelector('#eventTeamsTable tbody');
  if (!tableBody) {
    console.error('Event Teams Table Body not found');
    return;
  }
  tableBody.innerHTML = '';

  // Get all REA and EA names for color assignment
  const allREANames = regionalAmbassadorsFrom(eventTeamsTableData);
  const allEANames = eventAmbassadorsFrom(eventTeamsTableData);

  eventTeamsTableData.forEach((data) => {
    const row = document.createElement('tr');
    row.setAttribute('data-event-short-name', data.eventShortName);

    const regionalAmbassadorCell = document.createElement('td');
    const reaContainer = document.createElement('div');
    reaContainer.style.display = 'flex';
    reaContainer.style.alignItems = 'center';
    reaContainer.style.gap = '8px';
    
    const reaColorIndicator = document.createElement('span');
    const reaColor = assignColorToName(data.regionalAmbassador, allREANames);
    reaColorIndicator.style.display = 'inline-block';
    reaColorIndicator.style.width = '12px';
    reaColorIndicator.style.height = '12px';
    reaColorIndicator.style.borderRadius = '50%';
    reaColorIndicator.style.backgroundColor = reaColor;
    reaColorIndicator.style.border = '1px solid #333';
    reaColorIndicator.style.flexShrink = '0';
    reaColorIndicator.title = `Map color: ${reaColor}`;
    reaContainer.appendChild(reaColorIndicator);
    
    const reaNameSpan = document.createElement('span');
    reaNameSpan.textContent = data.regionalAmbassador;
    reaContainer.appendChild(reaNameSpan);
    
    regionalAmbassadorCell.appendChild(reaContainer);
    row.appendChild(regionalAmbassadorCell);

    const eventAmbassadorCell = document.createElement('td');
    const eaContainer = document.createElement('div');
    eaContainer.style.display = 'flex';
    eaContainer.style.alignItems = 'center';
    eaContainer.style.gap = '8px';
    
    const eaColorIndicator = document.createElement('span');
    const eaColor = assignColorToName(data.eventAmbassador, allEANames);
    eaColorIndicator.style.display = 'inline-block';
    eaColorIndicator.style.width = '12px';
    eaColorIndicator.style.height = '12px';
    eaColorIndicator.style.borderRadius = '50%';
    eaColorIndicator.style.backgroundColor = eaColor;
    eaColorIndicator.style.border = '1px solid #333';
    eaColorIndicator.style.flexShrink = '0';
    eaColorIndicator.title = `Map color: ${eaColor}`;
    eaContainer.appendChild(eaColorIndicator);
    
    const eaNameSpan = document.createElement('span');
    eaNameSpan.textContent = data.eventAmbassador;
    eaContainer.appendChild(eaNameSpan);
    
    eventAmbassadorCell.appendChild(eaContainer);
    row.appendChild(eventAmbassadorCell);

    const eventShortNameCell = document.createElement('td');
    eventShortNameCell.textContent = data.eventShortName;
    row.appendChild(eventShortNameCell);

    const eventDirectorsCell = document.createElement('td');
    eventDirectorsCell.textContent = data.eventDirectors;
    row.appendChild(eventDirectorsCell);

    const eventCoordinatesCell = document.createElement('td');
    eventCoordinatesCell.textContent = data.eventCoordinates;
    row.appendChild(eventCoordinatesCell);

    const eventSeriesCell = document.createElement('td');
    eventSeriesCell.textContent = data.eventSeries.toString();
    row.appendChild(eventSeriesCell);

    const eventCountryCell = document.createElement('td');
    eventCountryCell.textContent = data.eventCountry;
    row.appendChild(eventCountryCell);

    const actionsCell = document.createElement('td');
    const reallocateButton = document.createElement('button');
    reallocateButton.className = 'reallocate-button';
    reallocateButton.innerHTML = '🤝🏼 Reallocate';
    reallocateButton.type = 'button';
    reallocateButton.title = `Reallocate ${data.eventShortName} to a different Event Ambassador`;
    reallocateButton.setAttribute('aria-label', `Reallocate ${data.eventShortName}`);
    reallocateButton.style.padding = "2px 8px";
    reallocateButton.style.fontSize = "0.85em";
    reallocateButton.style.cursor = "pointer";
    
    if (_reallocateButtonHandler && _selectionState) {
      const isSelected = _selectionState.selectedEventShortName === data.eventShortName;
      reallocateButton.disabled = !isSelected;
      
      if (isSelected) {
        reallocateButton.onclick = (e) => {
          e.stopPropagation();
          _reallocateButtonHandler!(data.eventShortName);
        };
        
        reallocateButton.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            _reallocateButtonHandler!(data.eventShortName);
          }
        };
      }
    } else {
      reallocateButton.disabled = true;
    }
    
    actionsCell.appendChild(reallocateButton);
    row.appendChild(actionsCell);

    if (_rowClickHandler) {
      row.addEventListener('click', () => {
        _rowClickHandler!(data.eventShortName);
      });
      row.style.cursor = 'pointer';
    }

    tableBody.appendChild(row);
  });
}

let _rowClickHandler: ((eventShortName: string) => void) | null = null;
let _reallocateButtonHandler: ((eventShortName: string) => void) | null = null;
let _selectionState: SelectionState | null = null;

export function setRowClickHandler(handler: (eventShortName: string) => void): void {
  _rowClickHandler = handler;
}

export function setReallocateButtonHandler(
  selectionState: SelectionState,
  handler: (eventShortName: string) => void
): void {
  _selectionState = selectionState;
  _reallocateButtonHandler = handler;
}

/**
 * Update reallocate button states based on current selection.
 * Should be called when selection changes to enable/disable buttons accordingly.
 */
export function updateReallocateButtonStates(): void {
  if (!_selectionState) {
    return;
  }

  const tableBody = document.querySelector('#eventTeamsTable tbody');
  if (!tableBody) {
    return;
  }

  const rows = tableBody.querySelectorAll('tr[data-event-short-name]');
  rows.forEach((row) => {
    const eventShortName = row.getAttribute('data-event-short-name');
    if (!eventShortName) {
      return;
    }

    const reallocateButton = row.querySelector('button.reallocate-button') as HTMLButtonElement;
    if (!reallocateButton) {
      return;
    }

    const isSelected = _selectionState!.selectedEventShortName === eventShortName;
    reallocateButton.disabled = !isSelected;

    if (isSelected && _reallocateButtonHandler) {
      reallocateButton.onclick = (e) => {
        e.stopPropagation();
        _reallocateButtonHandler!(eventShortName);
      };

      reallocateButton.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          _reallocateButtonHandler!(eventShortName);
        }
      };
    } else {
      reallocateButton.onclick = null;
      reallocateButton.onkeydown = null;
    }
  });
}

