import { EventDetailsMap } from '@models/EventDetailsMap';
import { EventTeamsTableDataMap, EventTeamsTableData } from '@models/EventTeamsTableData';
import { LogEntry } from '@models/LogEntry';
import { countries } from '@models/country';
import { EventAmbassadorMap } from '@models/EventAmbassadorMap';
import { RegionalAmbassadorMap } from '@models/RegionalAmbassadorMap';
import { SelectionState } from '@models/SelectionState';

export function populateEventTeamsTable(
  eventTeamsTableData: EventTeamsTableDataMap,
  eventDetailsMap: EventDetailsMap,
  changelog: LogEntry[],
  _eventAmbassadors?: EventAmbassadorMap,
  _regionalAmbassadors?: RegionalAmbassadorMap
): void {
  const tableBody = document.querySelector('#eventTeamsTable tbody');
  if (!tableBody) {
    console.error('Event Teams Table Body not found');
    return;
  }
  tableBody.innerHTML = '';

  eventTeamsTableData.forEach((data) => {
    const row = document.createElement('tr');
    row.setAttribute('data-event-short-name', data.eventShortName);

    const regionalAmbassadorCell = document.createElement('td');
    regionalAmbassadorCell.textContent = data.regionalAmbassador;
    row.appendChild(regionalAmbassadorCell);

    const eventAmbassadorCell = document.createElement('td');
    eventAmbassadorCell.textContent = data.eventAmbassador;
    row.appendChild(eventAmbassadorCell);

    const eventShortNameCell = document.createElement('td');
    if (data.eventSeries === 0) {
      createEventShortNameDropdown(
        eventShortNameCell,
        data,
        eventDetailsMap,
        eventTeamsTableData,
        changelog
      );
    } else {
      eventShortNameCell.textContent = data.eventShortName;
    }
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
    reallocateButton.textContent = 'Reallocate';
    reallocateButton.type = 'button';
    reallocateButton.setAttribute('aria-label', `Reallocate ${data.eventShortName}`);
    
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

function createEventShortNameDropdown(
  eventShortNameCell: HTMLElement,
  data: EventTeamsTableData,
  eventDetailsMap: EventDetailsMap,
  eventTeamsTableData: EventTeamsTableDataMap,
  changelog: LogEntry[]
) {
  const dropdown = document.createElement('select');
  const eventShortNames = [data.eventShortName, ...Array.from(eventDetailsMap.keys()).sort()];

  eventShortNames.forEach((eventShortName) => {
    const option = document.createElement('option');
    option.value = eventShortName;
    option.textContent = eventShortName;
    dropdown.appendChild(option);
  });

  dropdown.value = data.eventShortName;

  dropdown.addEventListener('change', () => {
    const newEventShortName = dropdown.value;
    data.eventShortName = newEventShortName;

    const eventDetails = eventDetailsMap.get(newEventShortName);
    if (eventDetails) {
      data.eventSeries = eventDetails.properties.seriesid;
      data.eventCoordinates = `${eventDetails.geometry.coordinates[1]}, ${eventDetails.geometry.coordinates[0]}`;
      data.eventCountryCode = eventDetails.properties.countrycode;
      data.eventCountry = countries[eventDetails.properties.countrycode].url?.split('.').slice(-1)[0] || '?';


      eventShortNameCell.innerHTML = '';
      eventShortNameCell.textContent = newEventShortName;

      // There's more work to do here, but I'm going to leave it for now
      refreshUI(eventDetailsMap, eventTeamsTableData, changelog);
    }
  });

  eventShortNameCell.innerHTML = '';
  eventShortNameCell.appendChild(dropdown);
}
