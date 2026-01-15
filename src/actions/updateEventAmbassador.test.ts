import { EventTeamsTableDataMap } from "@models/EventTeamsTableData";
import { LogEntry } from "@models/LogEntry";
import { updateEventAmbassador } from "@actions/updateEventAmbassador";

describe('updateEventAmbassador', () => {
  it('should update the event ambassador and log the change', () => {
    const eventTeamsTableDataMap: EventTeamsTableDataMap = new Map([
      ['Erinsborough', {
        eventShortName: 'Erinsborough',
        eventDirectors: 'Harold Bishop',
        eventAmbassador: 'Helen Daniels',
        regionalAmbassador: 'Des Clarke',
        eventCoordinates: 'x, y',
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: 'au'
      }]
    ]);

    const log: LogEntry[] = [];

    const updatedMap = updateEventAmbassador(eventTeamsTableDataMap, 'Erinsborough', 'Jane Mangle', log);

    expect(updatedMap.get('Erinsborough')?.eventAmbassador).toBe('Jane Mangle');
    expect(log).toHaveLength(1);
    expect(log[0]).toEqual({
      type: 'update event ambassador',
      event: 'Erinsborough',
      oldValue: 'Helen Daniels',
      newValue: 'Jane Mangle',
      timestamp: expect.any(Number)
    });
  });

  it('should not update the event ambassador if the event does not exist', () => {
    const eventTeamsTableDataMap: EventTeamsTableDataMap = new Map([
      ['Erinsborough', {
        eventShortName: 'Erinsborough',
        eventDirectors: 'Harold Bishop',
        eventAmbassador: 'Helen Daniels',
        regionalAmbassador: 'Des Clarke',
        eventCoordinates: 'x, y',
        eventSeries: 1,
        eventCountryCode: 3,
        eventCountry: 'au'
      }]
    ]);

    const log: LogEntry[] = [];

    const updatedMap = updateEventAmbassador(eventTeamsTableDataMap, 'NonExistentEvent', 'Kat Oborne', log);

    expect(updatedMap.get('Erinsborough')?.eventAmbassador).toBe('Helen Daniels');
    expect(log).toHaveLength(0);
  });
});